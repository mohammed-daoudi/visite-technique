import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { smsService } from '@/lib/sms-service'
import { features } from '@/lib/env'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check SMS service configuration
    const isSMSEnabled = features.smsNotifications
    const isConnected = await smsService.testConnection()

    return NextResponse.json({
      configured: isSMSEnabled && isConnected,
      status: isSMSEnabled
        ? (isConnected ? 'SMS service is configured and working' : 'SMS credentials configured but connection failed')
        : 'SMS service not configured - missing SMS_API_KEY or SMS_SENDER_ID'
    })
  } catch (error) {
    console.error('Error checking SMS status:', error)
    return NextResponse.json(
      { error: 'Failed to check SMS status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { smsType, testPhone } = await request.json()

    if (!smsType || !testPhone) {
      return NextResponse.json(
        { error: 'SMS type and phone number are required' },
        { status: 400 }
      )
    }

    if (!features.smsNotifications) {
      return NextResponse.json(
        { error: 'SMS service is not configured' },
        { status: 503 }
      )
    }

    // Test data for SMS
    const testData = {
      bookingNumber: 'VT12345678901',
      customerName: 'Test User',
      phoneNumber: testPhone,
      carInfo: 'Toyota Corolla (123-A-45)',
      centerName: 'Centre Test Casablanca',
      centerAddress: '123 Rue Mohammed V, Casablanca',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      amount: 350,
      language: 'fr',
      transactionId: 'TXN123456789',
      reason: 'Test cancellation reason'
    }

    let success = false

    // Send appropriate test SMS based on type
    switch (smsType) {
      case 'booking_confirmation':
        success = await smsService.sendBookingConfirmation(testData)
        break
      case 'payment_confirmation':
        success = await smsService.sendPaymentConfirmation({
          ...testData,
          transactionId: testData.transactionId
        })
        break
      case 'booking_reminder':
        success = await smsService.sendBookingReminder(testData)
        break
      case 'booking_cancellation':
        success = await smsService.sendBookingCancellation({
          ...testData,
          reason: testData.reason
        })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid SMS type' },
          { status: 400 }
        )
    }

    if (success) {
      return NextResponse.json({
        message: 'Test SMS sent successfully',
        type: smsType,
        recipient: testPhone
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test SMS' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending test SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send test SMS' },
      { status: 500 }
    )
  }
}
