import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  User,
  CreditCard,
  Building2,
  Clock
} from 'lucide-react'

// Mock data for recent activities
const mockActivities = [
  {
    id: 1,
    type: 'booking',
    title: 'Nouvelle réservation',
    description: 'Ahmed Benali a réservé un créneau',
    time: 'Il y a 5 minutes',
    user: {
      name: 'Ahmed Benali',
      avatar: '',
      initials: 'AB'
    },
    status: 'confirmed'
  },
  {
    id: 2,
    type: 'payment',
    title: 'Paiement reçu',
    description: 'Paiement de 150 MAD confirmé',
    time: 'Il y a 15 minutes',
    user: {
      name: 'Fatima Alami',
      avatar: '',
      initials: 'FA'
    },
    status: 'completed'
  },
  {
    id: 3,
    type: 'user',
    title: 'Nouvel utilisateur',
    description: 'Inscription d\'un nouveau compte',
    time: 'Il y a 1 heure',
    user: {
      name: 'Omar Kadiri',
      avatar: '',
      initials: 'OK'
    },
    status: 'active'
  },
  {
    id: 4,
    type: 'center',
    title: 'Centre mis à jour',
    description: 'Horaires modifiés pour Centre Casablanca',
    time: 'Il y a 2 heures',
    user: {
      name: 'Admin',
      avatar: '',
      initials: 'AD'
    },
    status: 'updated'
  },
  {
    id: 5,
    type: 'booking',
    title: 'Réservation annulée',
    description: 'Annulation par l\'utilisateur',
    time: 'Il y a 3 heures',
    user: {
      name: 'Youssef Tazi',
      avatar: '',
      initials: 'YT'
    },
    status: 'cancelled'
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'booking':
      return Calendar
    case 'payment':
      return CreditCard
    case 'user':
      return User
    case 'center':
      return Building2
    default:
      return Clock
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'updated':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          Les dernières activités du système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type)

            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{activity.title}</h4>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(activity.status)}
                    >
                      {activity.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span>{activity.user.name}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
