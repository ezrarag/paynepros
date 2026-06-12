import { NextRequest, NextResponse } from "next/server"
import { reminderScheduleRepository } from "@/lib/repositories/reminder-schedule-repository"
import { clientRequestRepository } from "@/lib/repositories/client-request-repository"
import { clientWorkspaceRepository } from "@/lib/repositories/client-workspace-repository"
import { notificationLogRepository } from "@/lib/repositories/notification-log-repository"
import { sendRequestReminder } from "@/lib/notifications/dispatcher"

// Hard cap per run to stay inside serverless execution limits
const MAX_SCHEDULES_PER_RUN = 50

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const summary = {
    processed: 0,
    sent: 0,
    deactivated: 0,
    errors: 0,
  }

  try {
    const dueSchedules = (await reminderScheduleRepository.findDue(new Date())).slice(
      0,
      MAX_SCHEDULES_PER_RUN
    )

    for (const schedule of dueSchedules) {
      summary.processed += 1
      try {
        // Defense in depth on the kill switch: re-check the request before sending
        const requestRecord = await clientRequestRepository.findById(
          schedule.workspaceId,
          schedule.requestId
        )
        if (!requestRecord || requestRecord.status === "completed") {
          await reminderScheduleRepository.deactivate(schedule.requestId)
          summary.deactivated += 1
          continue
        }

        const results = await sendRequestReminder(schedule.workspaceId, schedule.requestId)
        const anySent = results.some((result) => result.ok)
        if (anySent) {
          summary.sent += 1
        } else {
          summary.errors += 1
        }

        const updated = await reminderScheduleRepository.markAttempt(schedule.requestId, {
          channels: results.filter((result) => result.ok).map((result) => result.channel),
        })

        if (updated && !updated.active) {
          summary.deactivated += 1
          await notificationLogRepository.create({
            workspaceId: schedule.workspaceId,
            requestId: schedule.requestId,
            type: "max_attempts_reached",
            channel: "system",
            ok: true,
          })
          await clientWorkspaceRepository.appendTimelineEvent(schedule.workspaceId, {
            type: "task",
            title: "Reminder limit reached",
            description: `"${requestRecord.title}" hit ${updated.maxAttempts} reminders without completion — needs personal follow-up.`,
            metadata: { requestId: schedule.requestId },
          })
        }
      } catch (error) {
        summary.errors += 1
        console.error("Cron reminder failed for request:", schedule.requestId, error)
      }
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("GET /api/cron/reminders failed:", error)
    return NextResponse.json({ ...summary, error: "Cron run failed" }, { status: 500 })
  }
}
