import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Building2, TrendingUp } from 'lucide-react'

// This would typically fetch real data from the database
// For now, we'll use mock data to show the structure
const mockStats = {
  totalUsers: 1247,
  totalBookings: 856,
  totalCenters: 15,
  monthlyRevenue: 45680
}

export async function AdminStats() {
  // In a real implementation, you would fetch this data from your database
  // const stats = await getAdminStats()

  const statCards = [
    {
      title: 'Utilisateurs total',
      value: mockStats.totalUsers.toLocaleString(),
      description: '+12% ce mois',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Réservations',
      value: mockStats.totalBookings.toLocaleString(),
      description: '+8% ce mois',
      icon: Calendar,
      trend: 'up'
    },
    {
      title: 'Centres actifs',
      value: mockStats.totalCenters.toString(),
      description: '2 nouveaux ce mois',
      icon: Building2,
      trend: 'up'
    },
    {
      title: 'Revenus mensuels',
      value: `${mockStats.monthlyRevenue.toLocaleString()} MAD`,
      description: '+15% ce mois',
      icon: TrendingUp,
      trend: 'up'
    }
  ]

  return (
    <>
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
