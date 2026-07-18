import { after, NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { signToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"
import { UserLoginSchema, UserResponseSchema } from "@/validators/user.validator"
import { trackFeatureConversion, } from "@/lib/toggleflow"

export async function POST(req: NextRequest) {
  try {
    console.log("🔐 [LOGIN] Login attempt started")

    await connectDB()
    console.log("✅ [LOGIN] Database connected")

    const body = await req.json()
    console.log("📦 [LOGIN] Body parsed:", { email: body.email })

    // ✅ VALIDATE INPUT WITH ZOD
    const parsed = UserLoginSchema.safeParse(body)
    
    if (!parsed.success) {
      console.warn("⚠️ [LOGIN] Validation failed:", parsed.error.issues)
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

    const { email, password } = parsed.data

    // Find user
    console.log("🔍 [LOGIN] Finding user...")
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.warn("⚠️ [LOGIN] User not found:", email)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid credentials',
            code: 'AUTH_FAILED'
          }
        },
        { status: 401 }
      )
    }
    console.log("✅ [LOGIN] User found")

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.warn("⚠️ [LOGIN] Email not verified for user:", email)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Please verify your email before logging in. Check your inbox for the verification link.',
            code: 'EMAIL_NOT_VERIFIED'
          }
        },
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
        {
          success: false,
          error: {
            message: 'Invalid credentials',
            code: 'AUTH_FAILED'
          }
        },
        { status: 401 }
      )
    }
    console.log("✅ [LOGIN] Password valid")

    // Sign token
    console.log("🔑 [LOGIN] Signing JWT token...")
    const token = signToken(user._id.toString())
    console.log("✅ [LOGIN] Token signed")

    // ✅ VALIDATE RESPONSE WITH ZOD
    const userResponse = UserResponseSchema.parse({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      lifeExpectancy: user.lifeExpectancy,
      image: user.image,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    })

    // Create response with cookie
    console.log("🍪 [LOGIN] Setting auth cookie...")
    const res = NextResponse.json(
      {
        success: true,
        data: {
          user: userResponse,
          token: token
        },
        message: 'Login successful'
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

    // Use the same visitor ID that evaluated the landing-page flag.
// Fall back to the authenticated database user ID.
const toggleFlowUserId =
  req.headers.get(
    "x-toggleflow-visitor-id"
  ) ?? user._id.toString()

after(async () => {
  await trackFeatureConversion(
    "login_button",
    toggleFlowUserId,
    "login_completed",
    {
      metadata: {
        provider: "credentials",
      },
    }
  )
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
        success: false,
        error: {
          message: 'Server error',
          code: 'SERVER_ERROR',
          ...(process.env.NODE_ENV !== "production" && {
            details: {
              message: errorMessage,
              stack: errorStack
            }
          })
        }
      },
      { status: 500 }
    )
  }
}