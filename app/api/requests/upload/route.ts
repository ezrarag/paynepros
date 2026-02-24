import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { adminStorageBucket } from "@/lib/firebase/admin"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Screenshot must be 5MB or smaller" },
        { status: 400 }
      )
    }

    if (!adminStorageBucket) {
      return NextResponse.json(
        { error: "Storage is not configured on the server" },
        { status: 500 }
      )
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop() : "png"
    const safeExtension = (extension || "png").replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
    const objectPath = `beam-requests/${Date.now()}-${randomUUID()}.${safeExtension}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const bucketFile = adminStorageBucket.file(objectPath)
    await bucketFile.save(fileBuffer, {
      contentType: file.type,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    })

    const [signedUrl] = await bucketFile.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    })

    return NextResponse.json({ url: signedUrl, path: objectPath })
  } catch (error) {
    console.error("Error uploading request screenshot:", error)
    return NextResponse.json(
      { error: "Failed to upload screenshot" },
      { status: 500 }
    )
  }
}
