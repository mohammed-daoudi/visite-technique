import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarCheck, Clock, CreditCard, Car } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface DashboardStatsProps {
  userId: string
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  // Fetch user statistics
  const stats = await getUserStats(userId)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total des réservations
          </CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.recentBookings} ce mois
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inspections terminées
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedBookings}</div>
          <p className="text-xs text-muted-foreground">
            {stats.completionRate}% de taux de réussite
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Véhicules enregistrés
          </CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCars}</div>
          <p className="text-xs text-muted-foreground">
            Gérez vos véhicules
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Montant total payé
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSpent} MAD</div>
          <p className="text-xs text-muted-foreground">
            +{stats.recentSpent} MAD ce mois
          </p>
        </CardContent>
      </Card>
    </>
  )
}

async function getUserStats(userId: string) {
  try {
    const [
      totalBookings,
      completedBookings,
      totalCars,
      payments,
      recentBookings,
    ] = await Promise.all([
      prisma.booking.count({
        where: { userId }
      }),
      prisma.booking.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      }),
      prisma.car.count({
        where: { userId }
      }),
      prisma.payment.findMany({
        where: {
          booking: { userId },
          status: 'COMPLETED'
        },
        select: { amount: true, createdAt: true }
      }),
      prisma.booking.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const recentSpent = payments
      .filter(payment => payment.createdAt >= thisMonth)
      .reduce((sum, payment) => sum + payment.amount, 0)

    const completionRate = totalBookings > 0
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0

    return {
      totalBookings,
      completedBookings,
      totalCars,
      totalSpent: totalSpent.toFixed(0),
      recentBookings,
      recentSpent: recentSpent.toFixed(0),
      completionRate
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      totalBookings: 0,
      completedBookings: 0,
      totalCars: 0,
      totalSpent: '0',
      recentBookings: 0,
      recentSpent: '0',
      completionRate: 0
    }
  }
}
