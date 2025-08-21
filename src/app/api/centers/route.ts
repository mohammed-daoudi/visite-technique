import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Validation schema for center creation/update
const centerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  nameAr: z.string().min(2, 'Le nom en arabe doit contenir au moins 2 caractères'),
  nameEn: z.string().min(2, 'Le nom en anglais doit contenir au moins 2 caractères'),
  address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères'),
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  city: z.string().min(2, 'La ville est requise'),
  latitude: z.number().min(-90).max(90, 'Latitude invalide'),
  longitude: z.number().min(-180).max(180, 'Longitude invalide'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  isActive: z.boolean().default(true),
  services: z.array(z.string()).min(1, 'Au moins un service est requis'),
  workingHours: z.any().optional(), // JSON object for working hours
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const adminView = searchParams.get('admin')

    // For admin view, return all centers (including inactive)
    // For public view, return only active centers
    const whereClause = (session?.user && adminView === 'true')
      ? {}
      : { isActive: true }

    const centers = await prisma.inspectionCenter.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ centers })
  } catch (error) {
    console.error('Error fetching inspection centers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inspection centers' },
      { status: 500 }
    )
  }
}

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
    const validatedData = centerSchema.parse(body)

    // Create new inspection center
    const center = await prisma.inspectionCenter.create({
      data: validatedData
    })

    return NextResponse.json({
      message: 'Centre créé avec succès',
      center
    })

  } catch (error) {
    console.error('Error creating center:', error)

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
