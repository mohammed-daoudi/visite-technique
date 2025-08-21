import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { randomUUID } from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with this email exists, you will receive a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Create reset URL
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    await sendPasswordResetEmail(email, resetUrl)

    return NextResponse.json(
      { message: 'If an account with this email exists, you will receive a password reset link.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password reset request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
