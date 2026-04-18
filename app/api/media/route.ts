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
    const media = await Media.find({ userId: auth.userId, weekIndex }).sort({ createdAt: -1 })
    
    return NextResponse.json({ media })
  } catch (err) {
    console.error("GET /api/media error:", err)
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
    const type = formData.get("type") as "image" | "video" | "audio"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!type) return NextResponse.json({ error: "No type provided" }, { status: 400 })

    console.log(`📤 Uploading ${type}: ${file.name}`)

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Determine resource type for Cloudinary
    // Images: image
    // Videos: video
    // Audio: video (Cloudinary treats audio as video)
    const resourceType = type === "image" ? "image" : "video"

    // Upload to Cloudinary with folder organization
    const result = await cloudinary.uploader.upload(base64, {
      folder: `life-in-weeks/${auth.userId}`,
      resource_type: resourceType,
      public_id: `${type}-${Date.now()}`,
      overwrite: false,
    })

    console.log(`✅ Uploaded to Cloudinary:`, result.secure_url)

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

    console.log(`✅ Saved to MongoDB:`, media._id)

    return NextResponse.json({ media }, { status: 201 })
  } catch (err) {
    console.error("❌ POST /api/media error:", err)
    return NextResponse.json({ 
      error: "Upload failed",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 })
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

    console.log(`🗑️ Deleting media:`, media.publicId)

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(media.publicId, { 
        resource_type: media.type === "image" ? "image" : "video"
      })
      console.log(`✅ Deleted from Cloudinary`)
    } catch (err) {
      console.error("⚠️ Failed to delete from Cloudinary:", err)
      // Continue anyway - delete from DB
    }

    // Delete from MongoDB
    await Media.deleteOne({ _id: mediaId })
    console.log(`✅ Deleted from MongoDB`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ DELETE /api/media error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}