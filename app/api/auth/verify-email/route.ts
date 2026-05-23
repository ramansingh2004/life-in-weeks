import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User.model'
import { VerifyEmailSchema } from '@/validators/common.validator'

export async function GET(req: NextRequest) {
  try {
    console.log('🔐 [VERIFY] Email verification attempt')

    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    // ✅ VALIDATE INPUT WITH ZOD
    const parsed = VerifyEmailSchema.safeParse({ token })

    if (!parsed.success) {
      console.warn('⚠️ [VERIFY] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid verification token',
            code: 'INVALID_TOKEN',
            details: parsed.error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        },
        { status: 400 }
      )
    }

    const { token: validToken } = parsed.data

    await connectDB()
    console.log('✅ [VERIFY] Database connected')

    // Hash the token to match what's in the database
    const tokenHash = crypto.createHash('sha256').update(validToken).digest('hex')
    console.log('🔍 [VERIFY] Searching for token match...')

    // Find user with matching token and check if it's not expired
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      console.warn('⚠️ [VERIFY] Invalid or expired token')
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid or expired verification link',
            code: 'VERIFICATION_FAILED'
          }
        },
        { status: 400 }
      )
    }

    console.log('✅ [VERIFY] Token found, marking email as verified')

    // Mark email as verified
    user.isEmailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    console.log('✅ [VERIFY] Email verified for:', user.email)

    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`,
      { status: 302 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [VERIFY] Email verification error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to verify email',
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