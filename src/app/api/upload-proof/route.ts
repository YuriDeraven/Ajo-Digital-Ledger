import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const groupId = formData.get("groupId") as string

    if (!file || !groupId) {
      return NextResponse.json(
        { error: "File and groupId are required" },
        { status: 400 }
      )
    }

    // Validate file
    const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 400 }
      )
    }

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "proofs", groupId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split(".").pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = join(uploadDir, fileName)

    // Write file
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    return NextResponse.json({
      success: true,
      fileName,
      url: `/proofs/${groupId}/${fileName}`
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
