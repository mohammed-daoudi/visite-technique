import { PrismaClient } from '@prisma/client'
import { addDays, format } from 'date-fns'

const prisma = new PrismaClient()

async function seedTimeSlots() {
  try {
    console.log('Starting to seed time slots...')

    // Get all inspection centers
    const centers = await prisma.inspectionCenter.findMany()

    if (centers.length === 0) {
      console.log('No inspection centers found. Please run seed-centers.ts first.')
      return
    }

    // Delete existing time slots
    await prisma.timeSlot.deleteMany()
    console.log('Deleted existing time slots')

    // Create time slots for the next 30 days
    const today = new Date()
    const timeSlots = []

    // Standard time slots (9 AM to 5 PM)
    const standardTimes = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
    ]

    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const currentDate = addDays(today, dayOffset)
      const dayOfWeek = currentDate.getDay()

      // Skip Sundays (0)
      if (dayOfWeek === 0) continue

      for (const center of centers) {
        for (const time of standardTimes) {
          // Reduce slots on Saturdays
          const isSaturday = dayOfWeek === 6
          if (isSaturday && (time.start === '16:00' || time.start === '15:00')) {
            continue
          }

          const startTime = new Date(`1970-01-01T${time.start}:00.000Z`)
          const endTime = new Date(`1970-01-01T${time.end}:00.000Z`)

          timeSlots.push({
            inspectionCenterId: center.id,
            date: new Date(currentDate.toISOString().split('T')[0] + 'T00:00:00.000Z'),
            startTime,
            endTime,
            capacity: Math.random() > 0.7 ? 2 : 1, // 30% chance of 2 capacity, 70% chance of 1
            bookedCount: Math.random() > 0.8 ? 1 : 0, // 20% chance already booked
            isAvailable: true,
            price: Math.random() > 0.5 ? 250 : 200 // Random pricing between 200 and 250 MAD
          })
        }
      }
    }

    // Create time slots in batches
    console.log(`Creating ${timeSlots.length} time slots...`)

    for (let i = 0; i < timeSlots.length; i += 100) {
      const batch = timeSlots.slice(i, i + 100)
      await prisma.timeSlot.createMany({
        data: batch
      })
      console.log(`Created batch ${Math.floor(i / 100) + 1}/${Math.ceil(timeSlots.length / 100)}`)
    }

    console.log('Successfully seeded time slots!')

    // Show summary
    const summary = await prisma.timeSlot.groupBy({
      by: ['inspectionCenterId'],
      _count: {
        id: true
      }
    })

    console.log('\nSummary by center:')
    for (const item of summary) {
      const center = centers.find(c => c.id === item.inspectionCenterId)
      console.log(`${center?.name}: ${item._count.id} time slots`)
    }

  } catch (error) {
    console.error('Error seeding time slots:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedTimeSlots()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedTimeSlots }
