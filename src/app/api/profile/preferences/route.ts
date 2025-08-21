import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Validation schema for preferences
const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  reminderNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const preferences = preferencesSchema.parse(body)

    // For now, we'll store preferences in a simple way
    // In a future iteration, we could add a preferences field to the User model
    // or create a separate UserPreferences table

    // Since we don't have a preferences field in the current schema,
    // we'll just return success for now and log the preferences
    console.log(`Preferences updated for user ${session.user.id}:`, preferences)

    // TODO: Implement actual preference storage when schema is extended
    // This could be done by:
    // 1. Adding a JSON preferences field to User model
    // 2. Creating a separate UserPreferences table
    // 3. Using a key-value store for user settings

    return NextResponse.json({
      message: 'Préférences mises à jour avec succès',
      preferences
    })

  } catch (error) {
    console.error('Error updating preferences:', error)

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    // For now, return default preferences
    // TODO: Implement actual preference retrieval when schema is extended
    const defaultPreferences = {
      emailNotifications: true,
      smsNotifications: false,
      reminderNotifications: true,
      marketingEmails: false,
    }

    return NextResponse.json({
      preferences: defaultPreferences
    })

  } catch (error) {
    console.error('Error fetching preferences:', error)

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
