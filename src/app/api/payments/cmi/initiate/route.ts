import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cmiPayment } from '@/lib/cmi-payment'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        car: true,
        inspectionCenter: true,
        timeSlot: true,
        payment: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user can pay for this booking
    if (session.user.id !== booking.userId && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking is in valid state for payment
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking is not in a valid state for payment' },
        { status: 400 }
      )
    }

    // Check if payment already exists and is completed
    if (booking.payment && booking.payment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment already completed for this booking' },
        { status: 400 }
      )
    }

    // Check CMI configuration
    if (!cmiPayment.isConfigured()) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    let payment = booking.payment

    // Create or update payment record
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: 'MAD',
          status: 'PENDING',
          paymentMethod: 'CMI'
        }
      })
    } else if (payment.status === 'FAILED' || payment.status === 'PENDING') {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PENDING',
          paymentMethod: 'CMI',
          updatedAt: new Date()
        }
      })
    }

    // Generate unique CMI order ID
    const cmiOrderId = `VT-${booking.bookingNumber}-${Date.now()}`

    // Update payment with CMI order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        cmiOrderId: cmiOrderId
      }
    })

    // Prepare CMI payment data
    const paymentData = {
      amount: booking.totalAmount,
      orderId: cmiOrderId,
      customerEmail: booking.user.email,
      customerName: booking.user.name || undefined,
      customerPhone: booking.user.phone || undefined,
      language: booking.user.preferredLanguage === 'ar' ? 'ar' : 'fr',
      description: `Visite technique - ${booking.car.licensePlate} - ${booking.inspectionCenter.name}`
    }

    // Generate payment form HTML
    const paymentFormHTML = cmiPayment.getPaymentFormHTML(paymentData)

    return new NextResponse(paymentFormHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Error initiating CMI payment:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
