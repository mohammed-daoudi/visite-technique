import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Validation schema for bulk time slot creation
const bulkTimeSlotSchema = z.object({
  inspectionCenterId: z.string().min(1, 'Centre requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  timeSlots: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    capacity: z.number().min(1),
    price: z.number().min(0),
  })).min(1, 'Au moins un créneau requis'),
  skipWeekends: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
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
    const validatedData = bulkTimeSlotSchema.parse(body)

    // Validate dates
    const startDate = new Date(validatedData.startDate + 'T00:00:00.000Z')
    const endDate = new Date(validatedData.endDate + 'T00:00:00.000Z')

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: 'Format de date invalide' },
        { status: 400 }
      )
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { message: 'La date de début doit être antérieure à la date de fin' },
        { status: 400 }
      )
    }

    // Check if inspection center exists
    const center = await prisma.inspectionCenter.findUnique({
      where: { id: validatedData.inspectionCenterId }
    })

    if (!center) {
      return NextResponse.json(
        { message: 'Centre d\'inspection non trouvé' },
        { status: 404 }
      )
    }

    // Generate all dates in the range
    const dates: Date[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay() // 0 = Sunday, 6 = Saturday

      // Skip weekends if requested
      if (validatedData.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }

      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Create time slots for each date and time
    const slotsToCreate = []
    let skippedCount = 0

    for (const date of dates) {
      for (const timeSlotConfig of validatedData.timeSlots) {
        // Parse times
        const startTime = new Date(`1970-01-01T${timeSlotConfig.startTime}:00.000Z`)
        const endTime = new Date(`1970-01-01T${timeSlotConfig.endTime}:00.000Z`)

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return NextResponse.json(
            { message: `Format d'heure invalide: ${timeSlotConfig.startTime} - ${timeSlotConfig.endTime}` },
            { status: 400 }
          )
        }

        if (startTime >= endTime) {
          return NextResponse.json(
            { message: `L'heure de début doit être antérieure à l'heure de fin: ${timeSlotConfig.startTime} - ${timeSlotConfig.endTime}` },
            { status: 400 }
          )
        }

        // Check if slot already exists
        const existingSlot = await prisma.timeSlot.findFirst({
          where: {
            inspectionCenterId: validatedData.inspectionCenterId,
            date: date,
            startTime: startTime
          }
        })

        if (existingSlot) {
          skippedCount++
          continue // Skip existing slots
        }

        slotsToCreate.push({
          inspectionCenterId: validatedData.inspectionCenterId,
          date: date,
          startTime: startTime,
          endTime: endTime,
          capacity: timeSlotConfig.capacity,
          price: timeSlotConfig.price,
          isAvailable: true,
          bookedCount: 0
        })
      }
    }

    if (slotsToCreate.length === 0) {
      return NextResponse.json(
        {
          message: 'Aucun nouveau créneau à créer. Tous les créneaux existent déjà.',
          created: 0,
          skipped: skippedCount
        },
        { status: 400 }
      )
    }

    // Create all time slots in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdSlots = await tx.timeSlot.createMany({
        data: slotsToCreate,
        skipDuplicates: true
      })

      return createdSlots
    })

    return NextResponse.json({
      message: `${result.count} créneaux créés avec succès`,
      created: result.count,
      skipped: skippedCount,
      details: {
        totalDates: dates.length,
        slotsPerDate: validatedData.timeSlots.length,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    })

  } catch (error) {
    console.error('Error bulk creating time slots:', error)

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
