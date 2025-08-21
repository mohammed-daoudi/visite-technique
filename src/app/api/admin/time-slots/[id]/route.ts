import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Validation schema for time slot updates
const timeSlotUpdateSchema = z.object({
  inspectionCenterId: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Accès refusé. Droits d\'administrateur requis.' },
        { status: 403 }
      )
    }

    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: params.id },
      include: {
        inspectionCenter: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      }
    })

    if (!timeSlot) {
      return NextResponse.json(
        { message: 'Créneau non trouvé' },
        { status: 404 }
      )
    }

    // Format the response
    const formattedSlot = {
      id: timeSlot.id,
      inspectionCenterId: timeSlot.inspectionCenterId,
      date: timeSlot.date.toISOString().split('T')[0],
      startTime: timeSlot.startTime.toTimeString().substring(0, 5),
      endTime: timeSlot.endTime.toTimeString().substring(0, 5),
      capacity: timeSlot.capacity,
      bookedCount: timeSlot.bookedCount,
      isAvailable: timeSlot.isAvailable,
      price: timeSlot.price,
      inspectionCenter: timeSlot.inspectionCenter,
      createdAt: timeSlot.createdAt.toISOString(),
      updatedAt: timeSlot.updatedAt.toISOString()
    }

    return NextResponse.json({ timeSlot: formattedSlot })

  } catch (error) {
    console.error('Error fetching time slot:', error)
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Accès refusé. Droits d\'administrateur requis.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = timeSlotUpdateSchema.parse(body)

    // Check if time slot exists
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        }
      }
    })

    if (!existingSlot) {
      return NextResponse.json(
        { message: 'Créneau non trouvé' },
        { status: 404 }
      )
    }

    // Check if there are active bookings when trying to change critical fields
    const hasActiveBookings = existingSlot.bookings.length > 0
    if (hasActiveBookings && (validatedData.date || validatedData.startTime || validatedData.endTime)) {
      return NextResponse.json(
        { message: 'Impossible de modifier la date/heure. Le créneau a des réservations actives.' },
        { status: 400 }
      )
    }

    // If reducing capacity, check if it's below current bookings
    if (validatedData.capacity && validatedData.capacity < existingSlot.bookedCount) {
      return NextResponse.json(
        { message: `Impossible de réduire la capacité en dessous de ${existingSlot.bookedCount} (réservations actuelles).` },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (validatedData.inspectionCenterId) {
      updateData.inspectionCenterId = validatedData.inspectionCenterId
    }

    if (validatedData.date) {
      updateData.date = new Date(validatedData.date + 'T00:00:00.000Z')
    }

    if (validatedData.startTime) {
      updateData.startTime = new Date(`1970-01-01T${validatedData.startTime}:00.000Z`)
    }

    if (validatedData.endTime) {
      updateData.endTime = new Date(`1970-01-01T${validatedData.endTime}:00.000Z`)
    }

    if (validatedData.capacity !== undefined) {
      updateData.capacity = validatedData.capacity
    }

    if (validatedData.price !== undefined) {
      updateData.price = validatedData.price
    }

    if (validatedData.isAvailable !== undefined) {
      updateData.isAvailable = validatedData.isAvailable
    }

    // Check for conflicting time slots if date/time is being changed
    if (updateData.date || updateData.startTime) {
      const conflictingSlot = await prisma.timeSlot.findFirst({
        where: {
          id: { not: params.id },
          inspectionCenterId: updateData.inspectionCenterId || existingSlot.inspectionCenterId,
          date: updateData.date || existingSlot.date,
          startTime: updateData.startTime || existingSlot.startTime
        }
      })

      if (conflictingSlot) {
        return NextResponse.json(
          { message: 'Un créneau existe déjà pour cette date et heure' },
          { status: 409 }
        )
      }
    }

    // Update time slot
    const updatedSlot = await prisma.timeSlot.update({
      where: { id: params.id },
      data: updateData,
      include: {
        inspectionCenter: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Créneau mis à jour avec succès',
      timeSlot: {
        id: updatedSlot.id,
        inspectionCenterId: updatedSlot.inspectionCenterId,
        date: updatedSlot.date.toISOString().split('T')[0],
        startTime: updatedSlot.startTime.toTimeString().substring(0, 5),
        endTime: updatedSlot.endTime.toTimeString().substring(0, 5),
        capacity: updatedSlot.capacity,
        bookedCount: updatedSlot.bookedCount,
        isAvailable: updatedSlot.isAvailable,
        price: updatedSlot.price,
        inspectionCenter: updatedSlot.inspectionCenter,
        createdAt: updatedSlot.createdAt.toISOString(),
        updatedAt: updatedSlot.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating time slot:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Accès refusé. Droits d\'administrateur requis.' },
        { status: 403 }
      )
    }

    // Check if time slot exists and has bookings
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        }
      }
    })

    if (!existingSlot) {
      return NextResponse.json(
        { message: 'Créneau non trouvé' },
        { status: 404 }
      )
    }

    // Check if there are active bookings
    if (existingSlot.bookings.length > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer le créneau. Il a des réservations actives.' },
        { status: 400 }
      )
    }

    // Delete time slot
    await prisma.timeSlot.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Créneau supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting time slot:', error)

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
