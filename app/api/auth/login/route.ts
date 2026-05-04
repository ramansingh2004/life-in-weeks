import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { signToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    console.log("🔐 [LOGIN] Login attempt started")

    await connectDB()
    console.log("✅ [LOGIN] Database connected")

    const { email, password } = await req.json()
    console.log("📦 [LOGIN] Body parsed:", { email })

    // Validate input
    if (!email || !password) {
      console.warn("⚠️ [LOGIN] Missing required fields")
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    // Find user
    console.log("🔍 [LOGIN] Finding user...")
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.warn("⚠️ [LOGIN] User not found:", email)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }
    console.log("✅ [LOGIN] User found")

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.warn("⚠️ [LOGIN] Email not verified for user:", email)
      return NextResponse.json(
        { error: "Please verify your email before logging in. Check your inbox for the verification link." },
        { status: 403 }
      )
    }
    console.log("✅ [LOGIN] Email is verified")

    // Compare password
    console.log("🔑 [LOGIN] Comparing passwords...")
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.warn("⚠️ [LOGIN] Invalid password for user:", email)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }
    console.log("✅ [LOGIN] Password valid")

    // Sign token
    console.log("🔑 [LOGIN] Signing JWT token...")
    const token = signToken(user._id.toString())
    console.log("✅ [LOGIN] Token signed")

    // Create response with cookie
    console.log("🍪 [LOGIN] Setting auth cookie...")
    const res = NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          birthDate: user.birthDate,
          lifeExpectancy: user.lifeExpectancy,
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 200 }
    )

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("✅ [LOGIN] Cookie set, login complete")
    return res
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : "No stack"

    console.error("❌ [LOGIN] Login failed:")
    console.error("   Error:", errorMessage)
    console.error("   Stack:", errorStack)

    return NextResponse.json(
      {
        error: "Server error",
        message: errorMessage,
        ...(process.env.NODE_ENV !== "production" && { stack: errorStack }),
      },
      { status: 500 }
    )
  }
}