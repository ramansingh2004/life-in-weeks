import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User.model"
import { getAuthUser } from "@/lib/getUser"
import { UserProfileUpdateSchema, UserResponseSchema } from "@/validators/user.validator"

export async function PATCH(req: NextRequest) {
  try {
    console.log("🔧 [PATCH_PROFILE] Profile update initiated")

    const auth = await getAuthUser()
    if (!auth) {
      console.warn("⚠️ [PATCH_PROFILE] Unauthorized - no auth")
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
    console.log("✅ [PATCH_PROFILE] Database connected")

    const body = await req.json()
    console.log("📦 [PATCH_PROFILE] Body parsed")

    // ✅ VALIDATE INPUT WITH ZOD
    const parsed = UserProfileUpdateSchema.safeParse(body)

    if (!parsed.success) {
      console.warn("⚠️ [PATCH_PROFILE] Validation failed:", parsed.error.issues)
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

    const updateData = parsed.data
    console.log("🔍 [PATCH_PROFILE] Updating user:", auth.userId)

    // ✅ UPDATE USER
    const updatedUser = await User.findByIdAndUpdate(
      auth.userId,
      updateData,
      { new: true }
    )

    if (!updatedUser) {
      console.warn("⚠️ [PATCH_PROFILE] User not found:", auth.userId)
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

    console.log("✅ [PATCH_PROFILE] User updated")

    // ✅ VALIDATE RESPONSE WITH ZOD
    const userResponse = UserResponseSchema.parse({
      _id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      birthDate: updatedUser.birthDate,
      lifeExpectancy: updatedUser.lifeExpectancy,
      image: updatedUser.image,
      isEmailVerified: updatedUser.isEmailVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    })

    console.log("✅ [PATCH_PROFILE] Response validated")

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userResponse
        },
        message: 'Profile updated successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : "No stack"

    console.error("❌ [PATCH_PROFILE] Error:", errorMessage)
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