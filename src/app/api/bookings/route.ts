import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/notification-service'

// Generate unique booking number
function generateBookingNumber(): string {
  const prefix = 'VT'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${timestamp}${random}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Verify user can only access their own bookings or admin can access any
    if (session.user.id !== userId && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId || session.user.id
      },
      include: {
        car: true,
        inspectionCenter: true,
        timeSlot: true,
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      totalAmount: booking.totalAmount,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      car: {
        id: booking.car.id,
        licensePlate: booking.car.licensePlate,
        brand: booking.car.brand,
        model: booking.car.model,
        year: booking.car.year
      },
      inspectionCenter: {
        id: booking.inspectionCenter.id,
        name: booking.inspectionCenter.name,
        address: booking.inspectionCenter.address,
        city: booking.inspectionCenter.city,
        phone: booking.inspectionCenter.phone
      },
      timeSlot: {
        id: booking.timeSlot.id,
        date: booking.timeSlot.date.toISOString().split('T')[0],
        startTime: booking.timeSlot.startTime.toTimeString().substring(0, 5),
        endTime: booking.timeSlot.endTime.toTimeString().substring(0, 5),
        price: booking.timeSlot.price
      },
      payment: booking.payment ? {
        id: booking.payment.id,
        status: booking.payment.status,
        amount: booking.payment.amount,
        paymentDate: booking.payment.paymentDate
      } : null
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, carId, inspectionCenterId, timeSlotId, notes } = body

    // Validate required fields
    if (!userId || !carId || !inspectionCenterId || !timeSlotId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user can only create bookings for themselves or admin can create for anyone
    if (session.user.id !== userId && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if the time slot is still available
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId }
    })

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      )
    }

    if (!timeSlot.isAvailable || timeSlot.bookedCount >= timeSlot.capacity) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 409 }
      )
    }

    // Check if user already has a booking for this time slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        timeSlotId,
        status: {
          not: 'CANCELLED'
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this time slot' },
        { status: 409 }
      )
    }

    // Create the booking in a transaction to ensure consistency
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          userId,
          carId,
          inspectionCenterId,
          timeSlotId,
          bookingNumber: generateBookingNumber(),
          status: 'PENDING',
          totalAmount: timeSlot.price,
          notes
        },
        include: {
          car: true,
          inspectionCenter: true,
          timeSlot: true,
          user: true
        }
      })

      // Update the time slot booked count
      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: {
          bookedCount: {
            increment: 1
          }
        }
      })

      return newBooking
    })

    // Send booking confirmation notifications
    try {
      const notificationData = {
        bookingNumber: booking.bookingNumber,
        customerName: booking.user.name || 'Customer',
        customerEmail: booking.user.email,
        customerPhone: booking.user.phone || undefined,
        carInfo: `${booking.car.brand} ${booking.car.model} (${booking.car.licensePlate})`,
        centerName: booking.inspectionCenter.name,
        centerAddress: booking.inspectionCenter.address,
        date: booking.timeSlot.date.toISOString().split('T')[0],
        time: booking.timeSlot.startTime.toTimeString().substring(0, 5),
        amount: booking.totalAmount,
        language: booking.user.preferredLanguage || 'fr'
      }

      const notificationResults = await notificationService.sendBookingConfirmation(notificationData, userId)
      console.log('Booking confirmation notifications sent:', notificationResults)
    } catch (error) {
      console.error('Failed to send booking confirmation notifications:', error)
      // Don't fail the booking creation if notifications fail
    }

    // Format the response
    const formattedBooking = {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      totalAmount: booking.totalAmount,
      notes: booking.notes,
      createdAt: booking.createdAt,
      car: {
        id: booking.car.id,
        licensePlate: booking.car.licensePlate,
        brand: booking.car.brand,
        model: booking.car.model,
        year: booking.car.year
      },
      inspectionCenter: {
        id: booking.inspectionCenter.id,
        name: booking.inspectionCenter.name,
        address: booking.inspectionCenter.address,
        city: booking.inspectionCenter.city
      },
      timeSlot: {
        id: booking.timeSlot.id,
        date: booking.timeSlot.date.toISOString().split('T')[0],
        startTime: booking.timeSlot.startTime.toTimeString().substring(0, 5),
        endTime: booking.timeSlot.endTime.toTimeString().substring(0, 5),
        price: booking.timeSlot.price
      }
    }

    return NextResponse.json(formattedBooking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
