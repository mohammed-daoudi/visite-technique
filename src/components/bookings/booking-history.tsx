'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  Euro,
  Eye,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3
} from 'lucide-react'
import { toast } from 'sonner'

interface Booking {
  id: string
  bookingNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
  car: {
    id: string
    licensePlate: string
    brand: string
    model: string
    year: number
  }
  inspectionCenter: {
    id: string
    name: string
    address: string
    city: string
    phone?: string
  }
  timeSlot: {
    id: string
    date: string
    startTime: string
    endTime: string
    price: number
  }
  payment?: {
    id: string
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
    amount: number
    paymentDate?: string
  }
}

interface BookingHistoryProps {
  userId: string
}

export function BookingHistory({ userId }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [userId])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        toast.error('Erreur lors du chargement des réservations')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by search term (booking number, car plate, center name)
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.inspectionCenter.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock3 className="h-4 w-4" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      case 'NO_SHOW':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock3 className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'CONFIRMED':
        return 'Confirmée'
      case 'COMPLETED':
        return 'Terminée'
      case 'CANCELLED':
        return 'Annulée'
      case 'NO_SHOW':
        return 'Absent'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'PROCESSING':
        return 'En cours'
      case 'COMPLETED':
        return 'Payé'
      case 'FAILED':
        return 'Échoué'
      case 'REFUNDED':
        return 'Remboursé'
      default:
        return status
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      })

      if (response.ok) {
        toast.success('Réservation annulée avec succès')
        fetchBookings()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const canCancelBooking = (booking: Booking) => {
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Chargement des réservations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par numéro de réservation, plaque ou centre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="COMPLETED">Terminée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
                <SelectItem value="NO_SHOW">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchBookings}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock3 className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">En attente</p>
                <p className="text-lg font-semibold">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Terminées</p>
                <p className="text-lg font-semibold">
                  {bookings.filter(b => b.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Euro className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total dépensé</p>
                <p className="text-lg font-semibold">
                  {bookings.reduce((sum, b) => sum + b.totalAmount, 0)} MAD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historique des réservations ({filteredBookings.length})
          </CardTitle>
          <CardDescription>
            Gérez vos réservations d'inspection technique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune réservation trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                {bookings.length === 0
                  ? "Vous n'avez pas encore de réservations"
                  : "Aucune réservation ne correspond à vos critères de recherche"
                }
              </p>
              <Button asChild>
                <a href="/booking">Faire une réservation</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`flex items-center gap-1 ${getStatusColor(booking.status)}`}
                            >
                              {getStatusIcon(booking.status)}
                              {getStatusText(booking.status)}
                            </Badge>
                            <span className="font-mono text-sm text-muted-foreground">
                              {booking.bookingNumber}
                            </span>
                          </div>
                          <span className="text-lg font-semibold">
                            {booking.totalAmount} MAD
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{booking.car.licensePlate}</span>
                              <span className="text-muted-foreground">
                                {booking.car.brand} {booking.car.model} ({booking.car.year})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.inspectionCenter.name}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.timeSlot.date), 'dd MMMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {booking.payment && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Paiement:</span>
                            <Badge className={getPaymentStatusColor(booking.payment.status)}>
                              {getPaymentStatusText(booking.payment.status)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la réservation</DialogTitle>
                              <DialogDescription>
                                Réservation #{selectedBooking?.bookingNumber}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-3">Informations générales</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Numéro:</span>
                                        <span className="font-mono">{selectedBooking.bookingNumber}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Statut:</span>
                                        <Badge className={getStatusColor(selectedBooking.status)}>
                                          {getStatusText(selectedBooking.status)}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Créée le:</span>
                                        <span>{format(new Date(selectedBooking.createdAt), 'dd/MM/yyyy à HH:mm')}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Montant:</span>
                                        <span className="font-medium">{selectedBooking.totalAmount} MAD</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-3">Véhicule</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Plaque:</span>
                                        <span className="font-medium">{selectedBooking.car.licensePlate}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Marque:</span>
                                        <span>{selectedBooking.car.brand}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Modèle:</span>
                                        <span>{selectedBooking.car.model}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Année:</span>
                                        <span>{selectedBooking.car.year}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                <div>
                                  <h4 className="font-medium mb-3">Centre d'inspection</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Nom:</span>
                                      <span>{selectedBooking.inspectionCenter.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Adresse:</span>
                                      <span>{selectedBooking.inspectionCenter.address}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Ville:</span>
                                      <span>{selectedBooking.inspectionCenter.city}</span>
                                    </div>
                                    {selectedBooking.inspectionCenter.phone && (
                                      <div className="flex justify-between">
                                        <span>Téléphone:</span>
                                        <span>{selectedBooking.inspectionCenter.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <Separator />

                                <div>
                                  <h4 className="font-medium mb-3">Rendez-vous</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Date:</span>
                                      <span>{format(new Date(selectedBooking.timeSlot.date), 'dd MMMM yyyy', { locale: fr })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Heure:</span>
                                      <span>{selectedBooking.timeSlot.startTime} - {selectedBooking.timeSlot.endTime}</span>
                                    </div>
                                  </div>
                                </div>

                                {selectedBooking.payment && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h4 className="font-medium mb-3">Paiement</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span>Statut:</span>
                                          <Badge className={getPaymentStatusColor(selectedBooking.payment.status)}>
                                            {getPaymentStatusText(selectedBooking.payment.status)}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Montant:</span>
                                          <span>{selectedBooking.payment.amount} MAD</span>
                                        </div>
                                        {selectedBooking.payment.paymentDate && (
                                          <div className="flex justify-between">
                                            <span>Date de paiement:</span>
                                            <span>{format(new Date(selectedBooking.payment.paymentDate), 'dd/MM/yyyy à HH:mm')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {selectedBooking.notes && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h4 className="font-medium mb-3">Notes</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedBooking.notes}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {canCancelBooking(booking) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
