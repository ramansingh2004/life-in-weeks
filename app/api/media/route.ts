import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Media } from "@/models/Media.model"
import { getAuthUser } from "@/lib/getUser"
import cloudinary from "@/lib/cloudinary"

// GET — fetch all media for a week
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const weekIndex = Number(searchParams.get("weekIndex"))

    await connectDB()
    const media = await Media.find({ userId: auth.userId, weekIndex })
    return NextResponse.json({ media })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — upload media to Cloudinary + save to MongoDB
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    const weekIndex = Number(formData.get("weekIndex"))
    const type = formData.get("type") as string

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const resourceType = type === "video" ? "video" : type === "audio" ? "video" : "image"
    const result = await cloudinary.uploader.upload(base64, {
      folder: `life-in-weeks/${auth.userId}`,
      resource_type: resourceType,
    })

    // Save to MongoDB
    await connectDB()
    const media = await Media.create({
      userId: auth.userId,
      weekIndex,
      type,
      url: result.secure_url,
      publicId: result.public_id,
      name: file.name,
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE — remove from Cloudinary + MongoDB
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { mediaId } = await req.json()

    await connectDB()
    const media = await Media.findOne({ _id: mediaId, userId: auth.userId })
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId)

    // Delete from MongoDB
    await Media.deleteOne({ _id: mediaId })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}