import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { getAuthUser } from "@/lib/getUser"
import { UserResponseSchema } from "@/validators/user.validator"
import mongoose from "mongoose"

export async function GET() {
  try {
    console.log("👤 [GET_ME] Fetching current user")

    const auth = await getAuthUser()
    if (!auth || !auth.userId) {
      console.warn("⚠️ [GET_ME] Unauthorized - no auth")
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      )
    }

    await connectDB()
    console.log("✅ [GET_ME] Database connected")

    let user = null
    if (mongoose.Types.ObjectId.isValid(auth.userId)) {
      console.log("🔍 [GET_ME] Finding user by MongoDB ID")
      user = await User.findById(auth.userId).select("-password")
    } else {
      console.log("🔍 [GET_ME] Finding user by Google ID")
      user = await User.findOne({ googleId: auth.userId }).select("-password")
    }

    if (!user) {
      console.warn("⚠️ [GET_ME] User not found:", auth.userId)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    }

    console.log("✅ [GET_ME] User found")

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
      updatedAt: user.updatedAt,
    })

    console.log("✅ [GET_ME] Response validated")

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userResponse
        },
        message: 'User fetched successfully'
      },
      { status: 200 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorStack = err instanceof Error ? err.stack : "No stack"

    console.error("❌ [GET_ME] Error:", errorMessage)
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