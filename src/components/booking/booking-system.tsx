'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, isSameDay, isAfter, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Clock, Car, MapPin, Euro, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Car {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
}

interface InspectionCenter {
  id: string
  name: string
  address: string
  city: string
  phone?: string
}

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  price: number
  capacity: number
  bookedCount: number
  isAvailable: boolean
}

interface BookingSystemProps {
  userId: string
  preselectedCenterId?: string
  preselectedCarId?: string
}

export function BookingSystem({ userId, preselectedCenterId, preselectedCarId }: BookingSystemProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [centers, setCenters] = useState<InspectionCenter[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedCar, setSelectedCar] = useState<string>(preselectedCarId || '')
  const [selectedCenter, setSelectedCenter] = useState<string>(preselectedCenterId || '')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCars()
    fetchCenters()
  }, [])

  useEffect(() => {
    if (selectedCenter && selectedDate) {
      fetchTimeSlots()
    }
  }, [selectedCenter, selectedDate])

  const fetchCars = async () => {
    try {
      const response = await fetch(`/api/cars?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setCars(data)
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      toast.error('Erreur lors du chargement des véhicules')
    }
  }

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/centers')
      if (response.ok) {
        const data = await response.json()
        setCenters(data)
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
      toast.error('Erreur lors du chargement des centres')
    }
  }

  const fetchTimeSlots = async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/time-slots?centerId=${selectedCenter}&date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data)
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
      toast.error('Erreur lors du chargement des créneaux')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedCar || !selectedCenter || !selectedTimeSlot) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          carId: selectedCar,
          inspectionCenterId: selectedCenter,
          timeSlotId: selectedTimeSlot,
        }),
      })

      if (response.ok) {
        const booking = await response.json()
        toast.success('Réservation créée avec succès!')
        // Reset form
        setSelectedTimeSlot('')
        fetchTimeSlots() // Refresh available slots
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la réservation')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Erreur lors de la réservation')
    } finally {
      setSubmitting(false)
    }
  }

  const getWeekDays = (startDate: Date) => {
    const start = startOfWeek(startDate, { weekStartsOn: 1 }) // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const weekDays = getWeekDays(currentWeek)
  const selectedCenterData = centers.find(c => c.id === selectedCenter)
  const selectedCarData = cars.find(c => c.id === selectedCar)
  const selectedTimeSlotData = timeSlots.find(ts => ts.id === selectedTimeSlot)

  const availableSlots = timeSlots.filter(slot => slot.isAvailable && slot.bookedCount < slot.capacity)
  const today = startOfDay(new Date())

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Step 1: Select Car */}
      <Card className="mobile-card">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="mobile-subheading flex items-center gap-2">
            <Car className="h-5 w-5" />
            1. Choisir un véhicule
          </CardTitle>
          <CardDescription className="mobile-body-text">
            Sélectionnez le véhicule à inspecter
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={selectedCar} onValueChange={setSelectedCar}>
            <SelectTrigger className="mobile-form-select">
              <SelectValue placeholder="Sélectionnez un véhicule" />
            </SelectTrigger>
            <SelectContent>
              {cars.map((car) => (
                <SelectItem key={car.id} value={car.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{car.licensePlate}</span>
                    <span className="text-muted-foreground">
                      {car.brand} {car.model} ({car.year})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {cars.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun véhicule trouvé</p>
              <Button variant="link" className="mt-2">
                Ajouter un véhicule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Select Center */}
      <Card className="mobile-card">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="mobile-subheading flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            2. Choisir un centre d'inspection
          </CardTitle>
          <CardDescription className="mobile-body-text">
            Sélectionnez le centre où effectuer l'inspection
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={selectedCenter} onValueChange={setSelectedCenter}>
            <SelectTrigger className="mobile-form-select">
              <SelectValue placeholder="Sélectionnez un centre" />
            </SelectTrigger>
            <SelectContent>
              {centers.map((center) => (
                <SelectItem key={center.id} value={center.id}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{center.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {center.address}, {center.city}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Step 3: Select Date */}
      {selectedCenter && (
        <Card className="mobile-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="mobile-subheading flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              3. Choisir une date
            </CardTitle>
            <CardDescription className="mobile-body-text">
              Sélectionnez la date de votre inspection
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(weekDays[0], 'dd MMM', { locale: fr })} - {format(weekDays[6], 'dd MMM yyyy', { locale: fr })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date())
                const isSelected = isSameDay(day, selectedDate)
                const isPast = !isAfter(day, today) && !isSameDay(day, today)

                return (
                  <Button
                    key={day.toISOString()}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={isPast}
                    onClick={() => setSelectedDate(day)}
                    className="flex flex-col p-1 sm:p-2 h-auto min-h-[44px] text-xs sm:text-sm"
                  >
                    <span className="text-xs font-normal">
                      {format(day, 'EEE', { locale: fr })}
                    </span>
                    <span className={isToday ? 'font-bold' : ''}>
                      {format(day, 'dd')}
                    </span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Select Time Slot */}
      {selectedCenter && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              4. Choisir un créneau horaire
            </CardTitle>
            <CardDescription>
              Créneaux disponibles pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                    onClick={() => setSelectedTimeSlot(slot.id)}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Euro className="h-3 w-3" />
                      {slot.price} MAD
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {slot.capacity - slot.bookedCount} place(s) disponible(s)
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun créneau disponible pour cette date</p>
                <p className="text-sm">Essayez une autre date</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      {selectedCar && selectedCenter && selectedTimeSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de la réservation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Véhicule</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{selectedCarData?.licensePlate}</p>
                  <p>{selectedCarData?.brand} {selectedCarData?.model} ({selectedCarData?.year})</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Centre d'inspection</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{selectedCenterData?.name}</p>
                  <p>{selectedCenterData?.address}, {selectedCenterData?.city}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Date et heure</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</p>
                  <p>{selectedTimeSlotData?.startTime} - {selectedTimeSlotData?.endTime}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Prix</h4>
                <div className="text-lg font-bold text-primary">
                  {selectedTimeSlotData?.price} MAD
                </div>
              </div>
            </div>

            <Separator />

            <Button
              size="lg"
              className="w-full"
              onClick={handleBooking}
              disabled={submitting}
            >
              {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
