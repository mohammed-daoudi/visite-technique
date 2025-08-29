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

    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('centerId')
    const date = searchParams.get('date')

    if (!centerId || !date) {
      return NextResponse.json(
        { error: 'Missing centerId or date parameter' },
        { status: 400 }
      )
    }

    // Parse the date
    const requestedDate = new Date(date + 'T00:00:00.000Z')

    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Fetch time slots for the specified center and date
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        inspectionCenterId: centerId,
        date: requestedDate,
        isAvailable: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Format the response to include readable time formats
    const formattedSlots = timeSlots.map(slot => ({
      id: slot.id,
      date: slot.date.toISOString().split('T')[0],
      startTime: slot.startTime.toTimeString().substring(0, 5), // HH:MM format
      endTime: slot.endTime.toTimeString().substring(0, 5), // HH:MM format
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      isAvailable: slot.isAvailable && slot.bookedCount < slot.capacity,
      price: slot.price
    }))

    return NextResponse.json(formattedSlots)
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
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

    const body = await request.json()
    const { inspectionCenterId, date, startTime, endTime, capacity, price } = body

    // Validate required fields
    if (!inspectionCenterId || !date || !startTime || !endTime || !capacity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Parse date and times
    const slotDate = new Date(date + 'T00:00:00.000Z')
    const start = new Date(`1970-01-01T${startTime}:00.000Z`)
    const end = new Date(`1970-01-01T${endTime}:00.000Z`)

    // Check if time slot already exists
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        inspectionCenterId,
        date: slotDate,
        startTime: start
      }
    })

    if (existingSlot) {
      return NextResponse.json(
        { error: 'Time slot already exists' },
        { status: 409 }
      )
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        inspectionCenterId,
        date: slotDate,
        startTime: start,
        endTime: end,
        capacity: parseInt(capacity),
        price: parseFloat(price),
        isAvailable: true,
        bookedCount: 0
      }
    })

    return NextResponse.json(timeSlot, { status: 201 })
  } catch (error) {
    console.error('Error creating time slot:', error)
    return NextResponse.json(
      { error: 'Failed to create time slot' },
      { status: 500 }
    )
  }
}
