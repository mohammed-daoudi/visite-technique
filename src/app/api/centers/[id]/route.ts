import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Validation schema for center updates
const centerUpdateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  nameAr: z.string().min(2, 'Le nom en arabe doit contenir au moins 2 caractères').optional(),
  nameEn: z.string().min(2, 'Le nom en anglais doit contenir au moins 2 caractères').optional(),
  address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères').optional(),
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  city: z.string().min(2, 'La ville est requise').optional(),
  latitude: z.number().min(-90).max(90, 'Latitude invalide').optional(),
  longitude: z.number().min(-180).max(180, 'Longitude invalide').optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  isActive: z.boolean().optional(),
  services: z.array(z.string()).min(1, 'Au moins un service est requis').optional(),
  workingHours: z.any().optional(), // JSON object for working hours
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const center = await prisma.inspectionCenter.findUnique({
      where: { id: params.id }
    })

    if (!center) {
      return NextResponse.json(
        { message: 'Centre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ center })

  } catch (error) {
    console.error('Error fetching center:', error)
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
    const validatedData = centerUpdateSchema.parse(body)

    // Check if center exists
    const existingCenter = await prisma.inspectionCenter.findUnique({
      where: { id: params.id }
    })

    if (!existingCenter) {
      return NextResponse.json(
        { message: 'Centre non trouvé' },
        { status: 404 }
      )
    }

    // Update center
    const updatedCenter = await prisma.inspectionCenter.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json({
      message: 'Centre mis à jour avec succès',
      center: updatedCenter
    })

  } catch (error) {
    console.error('Error updating center:', error)

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

    // Check if center exists
    const existingCenter = await prisma.inspectionCenter.findUnique({
      where: { id: params.id },
      include: {
        timeSlots: true,
        bookings: true
      }
    })

    if (!existingCenter) {
      return NextResponse.json(
        { message: 'Centre non trouvé' },
        { status: 404 }
      )
    }

    // Check if center has active bookings
    const activeBookings = existingCenter.bookings.filter(
      booking => booking.status === 'PENDING' || booking.status === 'CONFIRMED'
    )

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer le centre. Il a des réservations actives.' },
        { status: 400 }
      )
    }

    // Delete center (cascade deletes will handle related data)
    await prisma.inspectionCenter.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Centre supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting center:', error)

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
