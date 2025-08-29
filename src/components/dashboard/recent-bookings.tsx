import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Car } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface RecentBookingsProps {
  userId: string
}

export async function RecentBookings({ userId }: RecentBookingsProps) {
  const bookings = await getRecentBookings(userId)

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Réservations récentes</CardTitle>
        <CardDescription>
          Vos dernières réservations de visite technique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Aucune réservation trouvée
            </p>
            <p className="text-sm text-muted-foreground">
              Commencez par réserver votre première visite technique
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center space-x-4 rounded-lg border p-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    Réservation #{booking.bookingNumber}
                  </p>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Car className="mr-1 h-3 w-3" />
                    {booking.car.brand} {booking.car.model} ({booking.car.licensePlate})
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {booking.inspectionCenter.name}
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    {format(new Date(booking.timeSlot.date), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{booking.totalAmount} MAD</p>
                <p className="text-xs text-muted-foreground">
                  {booking.payment?.status === 'COMPLETED' ? 'Payé' : 'En attente'}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

async function getRecentBookings(userId: string) {
  try {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        car: true,
        inspectionCenter: true,
        timeSlot: true,
        payment: {
          select: { status: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  } catch (error) {
    console.error('Error fetching recent bookings:', error)
    return []
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'default'
    case 'COMPLETED':
      return 'secondary'
    case 'CANCELLED':
      return 'destructive'
    case 'PENDING':
    default:
      return 'outline'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'En attente'
    case 'CONFIRMED':
      return 'Confirmé'
    case 'COMPLETED':
      return 'Terminé'
    case 'CANCELLED':
      return 'Annulé'
    case 'NO_SHOW':
      return 'Absent'
    default:
      return status
  }
}
