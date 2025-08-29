import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id

    // Find the booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
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

    // Verify user can cancel this booking (owner or admin)
    if (booking.userId !== session.user.id &&
        session.user.role !== 'ADMIN' &&
        session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 409 }
      )
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed booking' },
        { status: 409 }
      )
    }

    // Check if booking is too close to appointment time (e.g., less than 24 hours)
    const appointmentDateTime = new Date(booking.timeSlot.date)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilAppointment < 24 && hoursUntilAppointment > 0) {
      return NextResponse.json(
        { error: 'Cannot cancel booking less than 24 hours before appointment' },
        { status: 409 }
      )
    }

    // Update booking and time slot in a transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking status
      const cancelledBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        },
        include: {
          car: true,
          inspectionCenter: true,
          timeSlot: true,
          payment: true
        }
      })

      // Decrease the booked count for the time slot
      await tx.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: {
          bookedCount: {
            decrement: 1
          }
        }
      })

      // If there's a completed payment, mark it for refund processing
      if (booking.payment && booking.payment.status === 'COMPLETED') {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: 'REFUNDED' // In a real system, this would trigger refund processing
          }
        })
      }

      return cancelledBooking
    })

    // Format the response
    const formattedBooking = {
      id: updatedBooking.id,
      bookingNumber: updatedBooking.bookingNumber,
      status: updatedBooking.status,
      totalAmount: updatedBooking.totalAmount,
      notes: updatedBooking.notes,
      createdAt: updatedBooking.createdAt,
      updatedAt: updatedBooking.updatedAt,
      car: {
        id: updatedBooking.car.id,
        licensePlate: updatedBooking.car.licensePlate,
        brand: updatedBooking.car.brand,
        model: updatedBooking.car.model,
        year: updatedBooking.car.year
      },
      inspectionCenter: {
        id: updatedBooking.inspectionCenter.id,
        name: updatedBooking.inspectionCenter.name,
        address: updatedBooking.inspectionCenter.address,
        city: updatedBooking.inspectionCenter.city,
        phone: updatedBooking.inspectionCenter.phone
      },
      timeSlot: {
        id: updatedBooking.timeSlot.id,
        date: updatedBooking.timeSlot.date.toISOString().split('T')[0],
        startTime: updatedBooking.timeSlot.startTime.toTimeString().substring(0, 5),
        endTime: updatedBooking.timeSlot.endTime.toTimeString().substring(0, 5),
        price: updatedBooking.timeSlot.price
      },
      payment: updatedBooking.payment ? {
        id: updatedBooking.payment.id,
        status: updatedBooking.payment.status,
        amount: updatedBooking.payment.amount,
        paymentDate: updatedBooking.payment.paymentDate
      } : null
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
