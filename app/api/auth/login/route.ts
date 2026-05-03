import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { signToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    console.log("📝 [REGISTER] Registration attempt started")

    // Step 1: Connect to database
    console.log("🔗 [REGISTER] Connecting to database...")
    await connectDB()
    console.log("✅ [REGISTER] Database connected")

    // Step 2: Parse request body
    console.log("📦 [REGISTER] Parsing request body...")
    const { name, email, password } = await req.json()
    console.log("📦 [REGISTER] Body parsed:", { name, email, passwordLength: password?.length })

    // Step 3: Validate input
    if (!name || !email || !password) {
      console.warn("⚠️ [REGISTER] Missing required fields")
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    // Step 4: Check if user exists
    console.log("🔍 [REGISTER] Checking if user exists...")
    const existing = await User.findOne({ email })
    if (existing) {
      console.warn("⚠️ [REGISTER] User already exists:", email)
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }
    console.log("✅ [REGISTER] User doesn't exist, proceeding...")

    // Step 5: Hash password
    console.log("🔐 [REGISTER] Hashing password...")
    const hashed = await bcrypt.hash(password, 12)
    console.log("✅ [REGISTER] Password hashed")

    // Step 6: Create user
    console.log("👤 [REGISTER] Creating user in database...")
    const user = await User.create({ name, email, password: hashed })
    console.log("✅ [REGISTER] User created:", { id: user._id, email: user.email })

    // Step 7: Sign JWT token
    console.log("🔑 [REGISTER] Signing JWT token...")
    const token = signToken(user._id.toString())
    console.log("✅ [REGISTER] Token signed")

    // Step 8: Create response with cookie
    console.log("🍪 [REGISTER] Setting auth cookie...")
    const res = NextResponse.json({ success: true }, { status: 201 })
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    console.log("✅ [REGISTER] Cookie set, registration complete")

    return res
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'
    
    console.error("❌ [REGISTER] Registration failed:")
    console.error("   Error:", errorMessage)
    console.error("   Stack:", errorStack)

    // Return detailed error for debugging
    return NextResponse.json({
      error: "Server error",
      message: errorMessage,
      // Only include details in development
      ...(process.env.NODE_ENV !== 'production' && { stack: errorStack })
    }, { status: 500 })
  }
}