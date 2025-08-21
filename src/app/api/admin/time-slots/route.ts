import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Accès refusé. Droits d\'administrateur requis.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const centerId = searchParams.get('centerId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    let whereClause: any = {}

    if (centerId) {
      whereClause.inspectionCenterId = centerId
    }

    if (date) {
      const requestedDate = new Date(date + 'T00:00:00.000Z')
      if (!isNaN(requestedDate.getTime())) {
        whereClause.date = requestedDate
      }
    } else if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z')
      const end = new Date(endDate + 'T23:59:59.999Z')

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        whereClause.date = {
          gte: start,
          lte: end
        }
      }
    } else {
      // Default to next 30 days if no date filters
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      whereClause.date = {
        gte: today,
        lte: thirtyDaysFromNow
      }
    }

    // Fetch time slots with inspection center details
    const timeSlots = await prisma.timeSlot.findMany({
      where: whereClause,
      include: {
        inspectionCenter: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Format the response
    const formattedSlots = timeSlots.map(slot => ({
      id: slot.id,
      inspectionCenterId: slot.inspectionCenterId,
      date: slot.date.toISOString().split('T')[0],
      startTime: slot.startTime.toTimeString().substring(0, 5), // HH:MM format
      endTime: slot.endTime.toTimeString().substring(0, 5), // HH:MM format
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      isAvailable: slot.isAvailable,
      price: slot.price,
      inspectionCenter: slot.inspectionCenter,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString()
    }))

    return NextResponse.json({
      timeSlots: formattedSlots,
      total: formattedSlots.length
    })

  } catch (error) {
    console.error('Error fetching admin time slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    )
  }
}
