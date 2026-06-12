#!/usr/bin/env tsx
/**
 * End-to-end test of the reminder pipeline against live Firestore.
 * Creates a test workspace + request, backdates the schedule, and prints state.
 * Run: node --env-file=.env.local --import tsx/esm scripts/e2e-reminder-test.ts <phase>
 * Phases: setup | backdate | status | complete | cleanup
 */
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

const TEST_WORKSPACE_ID = "e2e-reminder-test-workspace"

function db() {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n")
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey,
        }),
      })
  return getFirestore(app)
}

async function run() {
  const phase = process.argv[2] ?? "status"
  const firestore = db()
  const wsRef = firestore.collection("clientWorkspaces").doc(TEST_WORKSPACE_ID)

  if (phase === "setup") {
    const now = Timestamp.now()
    await wsRef.set({
      displayName: "E2E Test Client",
      status: "active",
      primaryContact: {
        name: "E2E Tester",
        email: "ezra@beamthink.institute",
      },
      notificationPreferences: { email: true, sms: false, voice: false },
      taxYears: [2025],
      tags: ["e2e-test"],
      createdAt: now,
      updatedAt: now,
    })
    const reqRef = wsRef.collection("clientRequests").doc()
    await reqRef.set({
      workspaceId: TEST_WORKSPACE_ID,
      type: "w2",
      title: "Send W-2(s) [E2E TEST]",
      instructions: "This is an automated end-to-end test request.",
      delivery: ["email"],
      status: "sent",
      sentAt: now,
    })
    await firestore.collection("reminderSchedules").doc(reqRef.id).set({
      requestId: reqRef.id,
      workspaceId: TEST_WORKSPACE_ID,
      cadenceDays: 3,
      nextRunAt: Timestamp.fromDate(new Date(Date.now() - 60_000)),
      maxAttempts: 10,
      attemptCount: 0,
      channelsLastAttempted: [],
      active: true,
      escalate: false,
      createdAt: now,
      updatedAt: now,
    })
    console.log("requestId:", reqRef.id)
    return
  }

  if (phase === "status") {
    const schedules = await firestore
      .collection("reminderSchedules")
      .where("workspaceId", "==", TEST_WORKSPACE_ID)
      .get()
    for (const doc of schedules.docs) {
      const d = doc.data()
      console.log(
        JSON.stringify({
          requestId: doc.id,
          active: d.active,
          attemptCount: d.attemptCount,
          channelsLastAttempted: d.channelsLastAttempted,
          nextRunAt: d.nextRunAt?.toDate?.()?.toISOString(),
        })
      )
    }
    const logs = await firestore
      .collection("notificationLogs")
      .where("workspaceId", "==", TEST_WORKSPACE_ID)
      .get()
    console.log("notificationLogs:", logs.docs.map((doc) => {
      const d = doc.data()
      return { type: d.type, channel: d.channel, ok: d.ok, error: d.error }
    }))
    return
  }

  if (phase === "backdate") {
    const schedules = await firestore
      .collection("reminderSchedules")
      .where("workspaceId", "==", TEST_WORKSPACE_ID)
      .get()
    for (const doc of schedules.docs) {
      await doc.ref.update({ nextRunAt: Timestamp.fromDate(new Date(Date.now() - 60_000)) })
      console.log("backdated:", doc.id)
    }
    return
  }

  if (phase === "complete") {
    const requests = await wsRef.collection("clientRequests").get()
    for (const doc of requests.docs) {
      await doc.ref.update({ status: "completed", completedAt: Timestamp.now() })
      console.log("completed request:", doc.id)
    }
    return
  }

  if (phase === "cleanup") {
    const requests = await wsRef.collection("clientRequests").get()
    for (const doc of requests.docs) {
      await firestore.collection("reminderSchedules").doc(doc.id).delete().catch(() => {})
      await doc.ref.delete()
    }
    const logs = await firestore
      .collection("notificationLogs")
      .where("workspaceId", "==", TEST_WORKSPACE_ID)
      .get()
    for (const doc of logs.docs) {
      await doc.ref.delete()
    }
    const timeline = await wsRef.collection("timeline").get()
    for (const doc of timeline.docs) {
      await doc.ref.delete()
    }
    await wsRef.delete()
    console.log("cleaned up test workspace, requests, schedules, and logs")
    return
  }

  console.error("Unknown phase:", phase)
  process.exit(1)
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
