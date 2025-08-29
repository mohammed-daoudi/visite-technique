import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to access this endpoint
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        {
          bookingNumber: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        },
        {
          car: {
            licensePlate: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.booking.count({ where })

    // Fetch bookings with relationships
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        car: true,
        inspectionCenter: true,
        timeSlot: true,
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
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
      user: booking.user,
      car: {
        id: booking.car.id,
        licensePlate: booking.car.licensePlate,
        brand: booking.car.brand,
        model: booking.car.model,
        year: booking.car.year
      },
      center: booking.inspectionCenter.name,
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

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to access this endpoint
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingId, status, notes } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        car: true,
        inspectionCenter: true,
        timeSlot: true,
        payment: true
      }
    })

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
