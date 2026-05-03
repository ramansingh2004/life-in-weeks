import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { sendVerificationEmail } from "@/lib/sendEmail"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { name, email, password } = await req.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12)

    // Generate verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Create user with unverified email
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      isEmailVerified: false,
      emailVerificationToken: tokenHash,
      emailVerificationExpires: verificationExpires,
    })

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken,
      name
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    // Return success with redirect URL to verification page
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      redirectUrl: "/verify-email"
    }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
