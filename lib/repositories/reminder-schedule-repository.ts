import { adminDb, Timestamp } from "@/lib/firebase/admin"
import type { ReminderSchedule } from "@/lib/types/client-workspace"

const REMINDER_SCHEDULES_COLLECTION = "reminderSchedules"

export const DEFAULT_CADENCE_DAYS = 3
export const DEFAULT_MAX_ATTEMPTS = 10
const ESCALATE_AFTER_ATTEMPT = 3
const MIN_CADENCE_DAYS = 1

const toIsoString = (value?: FirebaseFirestore.Timestamp | Date | string | null) => {
  if (!value) {
    return new Date().toISOString()
  }
  if (typeof value === "string") {
    return value
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value.toDate === "function") {
    return value.toDate().toISOString()
  }
  return new Date().toISOString()
}

let mockReminderSchedules: ReminderSchedule[] = []

function mapScheduleDoc(
  id: string,
  data: FirebaseFirestore.DocumentData | undefined
): ReminderSchedule {
  return {
    ...(data as Omit<ReminderSchedule, "id" | "nextRunAt" | "createdAt" | "updatedAt">),
    id,
    nextRunAt: toIsoString(data?.nextRunAt),
    createdAt: toIsoString(data?.createdAt),
    updatedAt: toIsoString(data?.updatedAt),
  } as ReminderSchedule
}

function computeNextCadenceDays(cadenceDays: number, escalate: boolean, attemptCount: number): number {
  if (escalate && attemptCount >= ESCALATE_AFTER_ATTEMPT) {
    return Math.max(MIN_CADENCE_DAYS, cadenceDays / 2)
  }
  return cadenceDays
}

export class ReminderScheduleRepository {
  async create(input: {
    requestId: string
    workspaceId: string
    cadenceDays?: number
    maxAttempts?: number
    escalate?: boolean
    /** Defaults to now + cadenceDays */
    nextRunAt?: string
    createdAt?: string
  }): Promise<ReminderSchedule> {
    const cadenceDays = input.cadenceDays ?? DEFAULT_CADENCE_DAYS
    const maxAttempts = input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
    const escalate = input.escalate ?? false
    const createdAtIso = input.createdAt ?? new Date().toISOString()
    const nextRunAtIso =
      input.nextRunAt ??
      new Date(new Date(createdAtIso).getTime() + cadenceDays * 24 * 60 * 60 * 1000).toISOString()

    if (!adminDb) {
      const schedule: ReminderSchedule = {
        id: input.requestId,
        requestId: input.requestId,
        workspaceId: input.workspaceId,
        cadenceDays,
        nextRunAt: nextRunAtIso,
        maxAttempts,
        attemptCount: 0,
        channelsLastAttempted: [],
        active: true,
        escalate,
        createdAt: createdAtIso,
        updatedAt: createdAtIso,
      }
      mockReminderSchedules = [
        ...mockReminderSchedules.filter((s) => s.requestId !== input.requestId),
        schedule,
      ]
      return schedule
    }

    const now = Timestamp.now()
    const docRef = adminDb.collection(REMINDER_SCHEDULES_COLLECTION).doc(input.requestId)

    await docRef.set({
      requestId: input.requestId,
      workspaceId: input.workspaceId,
      cadenceDays,
      nextRunAt: Timestamp.fromDate(new Date(nextRunAtIso)),
      maxAttempts,
      attemptCount: 0,
      channelsLastAttempted: [],
      active: true,
      escalate,
      createdAt: now,
      updatedAt: now,
    })

    const created = await docRef.get()
    return mapScheduleDoc(docRef.id, created.data())
  }

  async findDue(now: Date): Promise<ReminderSchedule[]> {
    if (!adminDb) {
      return mockReminderSchedules.filter(
        (schedule) => schedule.active && new Date(schedule.nextRunAt).getTime() <= now.getTime()
      )
    }

    const snapshot = await adminDb
      .collection(REMINDER_SCHEDULES_COLLECTION)
      .where("active", "==", true)
      .where("nextRunAt", "<=", Timestamp.fromDate(now))
      .get()

    return snapshot.docs.map((doc) => mapScheduleDoc(doc.id, doc.data()))
  }

  async findByRequestId(requestId: string): Promise<ReminderSchedule | null> {
    if (!adminDb) {
      return mockReminderSchedules.find((schedule) => schedule.requestId === requestId) ?? null
    }

    const snapshot = await adminDb.collection(REMINDER_SCHEDULES_COLLECTION).doc(requestId).get()
    if (!snapshot.exists) {
      return null
    }
    return mapScheduleDoc(snapshot.id, snapshot.data())
  }

  async markAttempt(
    requestId: string,
    input: { channels: string[]; now?: Date }
  ): Promise<ReminderSchedule | null> {
    const now = input.now ?? new Date()

    if (!adminDb) {
      const index = mockReminderSchedules.findIndex((schedule) => schedule.requestId === requestId)
      if (index === -1) return null

      const current = mockReminderSchedules[index]
      const attemptCount = current.attemptCount + 1
      const nextCadenceDays = computeNextCadenceDays(current.cadenceDays, current.escalate, attemptCount)
      const next: ReminderSchedule = {
        ...current,
        attemptCount,
        channelsLastAttempted: input.channels,
        nextRunAt: new Date(now.getTime() + nextCadenceDays * 24 * 60 * 60 * 1000).toISOString(),
        active: attemptCount < current.maxAttempts,
        updatedAt: now.toISOString(),
      }
      mockReminderSchedules = [
        ...mockReminderSchedules.slice(0, index),
        next,
        ...mockReminderSchedules.slice(index + 1),
      ]
      return next
    }

    const docRef = adminDb.collection(REMINDER_SCHEDULES_COLLECTION).doc(requestId)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return null
    }

    const current = mapScheduleDoc(snapshot.id, snapshot.data())
    const attemptCount = current.attemptCount + 1
    const nextCadenceDays = computeNextCadenceDays(current.cadenceDays, current.escalate, attemptCount)
    const active = attemptCount < current.maxAttempts

    await docRef.update({
      attemptCount,
      channelsLastAttempted: input.channels,
      nextRunAt: Timestamp.fromDate(new Date(now.getTime() + nextCadenceDays * 24 * 60 * 60 * 1000)),
      active,
      updatedAt: Timestamp.fromDate(now),
    })

    const updated = await docRef.get()
    return mapScheduleDoc(docRef.id, updated.data())
  }

  async setActive(requestId: string, active: boolean): Promise<ReminderSchedule | null> {
    const now = new Date()

    if (!adminDb) {
      const index = mockReminderSchedules.findIndex((schedule) => schedule.requestId === requestId)
      if (index === -1) return null
      const current = mockReminderSchedules[index]
      const next: ReminderSchedule = {
        ...current,
        active,
        // On resume, schedule the next reminder a full cadence out
        ...(active
          ? {
              nextRunAt: new Date(
                now.getTime() + current.cadenceDays * 24 * 60 * 60 * 1000
              ).toISOString(),
            }
          : {}),
        updatedAt: now.toISOString(),
      }
      mockReminderSchedules = [
        ...mockReminderSchedules.slice(0, index),
        next,
        ...mockReminderSchedules.slice(index + 1),
      ]
      return next
    }

    const docRef = adminDb.collection(REMINDER_SCHEDULES_COLLECTION).doc(requestId)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return null
    }
    const current = mapScheduleDoc(snapshot.id, snapshot.data())

    await docRef.update({
      active,
      ...(active
        ? {
            nextRunAt: Timestamp.fromDate(
              new Date(now.getTime() + current.cadenceDays * 24 * 60 * 60 * 1000)
            ),
          }
        : {}),
      updatedAt: Timestamp.fromDate(now),
    })

    const updated = await docRef.get()
    return mapScheduleDoc(docRef.id, updated.data())
  }

  async deactivate(requestId: string): Promise<void> {
    if (!adminDb) {
      const index = mockReminderSchedules.findIndex((schedule) => schedule.requestId === requestId)
      if (index === -1) return
      mockReminderSchedules = [
        ...mockReminderSchedules.slice(0, index),
        { ...mockReminderSchedules[index], active: false, updatedAt: new Date().toISOString() },
        ...mockReminderSchedules.slice(index + 1),
      ]
      return
    }

    const docRef = adminDb.collection(REMINDER_SCHEDULES_COLLECTION).doc(requestId)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return
    }

    await docRef.update({
      active: false,
      updatedAt: Timestamp.now(),
    })
  }
}

export const reminderScheduleRepository = new ReminderScheduleRepository()
