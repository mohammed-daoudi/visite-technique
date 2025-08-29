import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cmiPayment } from '@/lib/cmi-payment'
import { emailService } from '@/lib/email-service'
import { notificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    // Parse form data from CMI callback
    const formData = await request.formData()
    const callbackData: Record<string, string> = {}

    formData.forEach((value, key) => {
      callbackData[key] = value.toString()
    })

    console.log('CMI Callback received:', callbackData)

    // Extract order ID
    const cmiOrderId = callbackData.oid || callbackData.orderId
    if (!cmiOrderId) {
      console.error('No order ID in callback')
      return NextResponse.redirect(new URL('/booking-failed?error=no-order-id', request.url))
    }

    // Find payment by CMI order ID
    const payment = await prisma.payment.findFirst({
      where: { cmiOrderId },
      include: {
        booking: {
          include: {
            user: true,
            car: true,
            inspectionCenter: true
          }
        }
      }
    })

    if (!payment) {
      console.error('Payment not found for order ID:', cmiOrderId)
      return NextResponse.redirect(new URL(`/booking-failed?error=payment-not-found&oid=${cmiOrderId}`, request.url))
    }

    // Verify callback hash for security
    const isHashValid = cmiPayment.verifyCallbackHash({ ...callbackData })
    if (!isHashValid) {
      console.error('Invalid hash in CMI callback')
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          cmiResponseCode: 'HASH_ERROR',
          cmiResponseMessage: 'Invalid security hash',
          updatedAt: new Date()
        }
      })
      return NextResponse.redirect(new URL('/booking-failed?error=invalid-hash', request.url))
    }

    // Parse CMI response
    const cmiResponse = cmiPayment.parseCallbackResponse(callbackData)
    const isSuccess = cmiPayment.isPaymentSuccessful(cmiResponse)
    const statusMessage = cmiPayment.getPaymentStatusMessage(cmiResponse)

    console.log('CMI Response parsed:', { isSuccess, cmiResponse })

    // Update payment status
    const paymentUpdateData: any = {
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      cmiResponseCode: cmiResponse.responseCode,
      cmiResponseMessage: statusMessage,
      transactionId: cmiResponse.tranId || cmiResponse.authCode,
      updatedAt: new Date()
    }

    if (isSuccess) {
      paymentUpdateData.paymentDate = new Date()
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: paymentUpdateData
    })

    // Update booking status if payment is successful
    if (isSuccess) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date()
        }
      })

      console.log('Payment successful, booking confirmed:', payment.booking.bookingNumber)

      // Send confirmation notifications (email and SMS)
      try {
        const notificationData = {
          bookingNumber: payment.booking.bookingNumber,
          customerName: payment.booking.user.name || 'Client',
          customerEmail: payment.booking.user.email,
          customerPhone: payment.booking.user.phone || undefined,
          carInfo: `${payment.booking.car.brand} ${payment.booking.car.model} (${payment.booking.car.licensePlate})`,
          centerName: payment.booking.inspectionCenter.name,
          centerAddress: payment.booking.inspectionCenter.address,
          date: new Date(payment.booking.timeSlot.date).toLocaleDateString('fr-FR'),
          time: `${payment.booking.timeSlot.startTime.toTimeString().substring(0, 5)} - ${payment.booking.timeSlot.endTime.toTimeString().substring(0, 5)}`,
          amount: payment.amount,
          language: payment.booking.user.preferredLanguage || 'fr',
          transactionId: cmiResponse.tranId || 'N/A'
        }

        // Send payment confirmation notifications
        const paymentResults = await notificationService.sendPaymentConfirmation(notificationData, payment.booking.userId)
        console.log('Payment confirmation notifications sent:', paymentResults)

        // Send booking confirmation notifications with all details
        const bookingResults = await notificationService.sendBookingConfirmation(notificationData, payment.booking.userId)
        console.log('Booking confirmation notifications sent:', bookingResults)
      } catch (notificationError) {
        console.error('Failed to send confirmation notifications:', notificationError)
        // Don't fail the payment process if notifications fail
      }

      // Redirect to success page
      return NextResponse.redirect(new URL(`/booking-success?booking=${payment.booking.bookingNumber}`, request.url))
    } else {
      console.log('Payment failed:', statusMessage)

      // Redirect to failure page with error message
      const errorUrl = new URL('/booking-failed', request.url)
      errorUrl.searchParams.set('booking', payment.booking.bookingNumber)
      errorUrl.searchParams.set('error', cmiResponse.responseCode)
      errorUrl.searchParams.set('message', encodeURIComponent(statusMessage))

      return NextResponse.redirect(errorUrl)
    }

  } catch (error) {
    console.error('Error processing CMI callback:', error)

    // Try to extract order ID for error tracking
    let orderIdForError = 'unknown'
    try {
      const formData = await request.formData()
      orderIdForError = formData.get('oid')?.toString() || 'unknown'
    } catch (e) {
      console.error('Could not extract order ID from failed callback')
    }

    return NextResponse.redirect(new URL(`/booking-failed?error=callback-error&oid=${orderIdForError}`, request.url))
  }
}

// Handle GET requests (some payment gateways send GET callbacks)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const callbackData: Record<string, string> = {}

  searchParams.forEach((value, key) => {
    callbackData[key] = value
  })

  // Convert to POST-like handling
  const formData = new FormData()
  Object.entries(callbackData).forEach(([key, value]) => {
    formData.append(key, value)
  })

  // Create a new request with form data
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    body: formData
  })

  return POST(postRequest)
}
