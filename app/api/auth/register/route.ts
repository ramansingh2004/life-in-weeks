import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { sendVerificationEmail } from "@/lib/sendEmail"
import { UserRegisterSchema } from "@/validators/user.validator"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    // Get request body
    const body = await req.json()
    
    // ✅ VALIDATE INPUT WITH ZOD
    const parsed = UserRegisterSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: parsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 422 }
      )
    }

    const { name, email, password, lifeExpectancy = 80 } = parsed.data

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Email already registered',
            code: 'EMAIL_EXISTS'
          }
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12)

    // Generate verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Create user with unverified email
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      lifeExpectancy,
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
        {
          success: false,
          error: {
            message: 'Failed to send verification email. Please try again.',
            code: 'EMAIL_SEND_FAILED'
          }
        },
        { status: 500 }
      )
    }

    // ✅ RETURN VALIDATED RESPONSE
    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          message: 'Registration successful! Please check your email to verify your account.'
        },
        redirectUrl: "/verify-email"
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Server error',
          code: 'SERVER_ERROR'
        }
      },
      { status: 500 }
    )
  }
}