import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to test email
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { emailType, testEmail } = body

    if (!emailType || !testEmail) {
      return NextResponse.json(
        { error: 'Email type and test email are required' },
        { status: 400 }
      )
    }

    // Test email configuration first
    const isConfigured = await emailService.testConnection()
    if (!isConfigured) {
      return NextResponse.json(
        { error: 'Email service is not properly configured' },
        { status: 500 }
      )
    }

    let success = false

    // Send test email based on type
    switch (emailType) {
      case 'booking_confirmation':
        success = await emailService.sendBookingConfirmation({
          bookingNumber: 'TEST-001',
          customerName: 'Test User',
          customerEmail: testEmail,
          carInfo: 'Toyota Corolla (123|أ|45)',
          centerName: 'Centre de Test',
          centerAddress: '123 Rue Test, Casablanca',
          date: new Date().toLocaleDateString('fr-FR'),
          time: '09:00',
          amount: 150,
          language: 'fr'
        })
        break

      case 'payment_confirmation':
        success = await emailService.sendPaymentConfirmation({
          bookingNumber: 'TEST-001',
          customerName: 'Test User',
          customerEmail: testEmail,
          amount: 150,
          transactionId: 'TXN123456789',
          language: 'fr'
        })
        break

      case 'booking_reminder':
        success = await emailService.sendBookingReminder({
          bookingNumber: 'TEST-001',
          customerName: 'Test User',
          customerEmail: testEmail,
          carInfo: 'Toyota Corolla (123|أ|45)',
          centerName: 'Centre de Test',
          centerAddress: '123 Rue Test, Casablanca',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
          time: '09:00',
          language: 'fr'
        })
        break

      case 'booking_cancellation':
        success = await emailService.sendBookingCancellation({
          bookingNumber: 'TEST-001',
          customerName: 'Test User',
          customerEmail: testEmail,
          carInfo: 'Toyota Corolla (123|أ|45)',
          reason: 'Test de l\'email d\'annulation',
          language: 'fr'
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    if (success) {
      return NextResponse.json({
        message: 'Test email sent successfully',
        emailType,
        recipient: testEmail
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error testing email:', error)
    return NextResponse.json(
      { error: 'Failed to test email' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to check email status
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Test email configuration
    const isConfigured = await emailService.testConnection()

    return NextResponse.json({
      configured: isConfigured,
      status: isConfigured ? 'Email service is working' : 'Email service not configured or not working'
    })

  } catch (error) {
    console.error('Error checking email status:', error)
    return NextResponse.json(
      { error: 'Failed to check email status' },
      { status: 500 }
    )
  }
}
