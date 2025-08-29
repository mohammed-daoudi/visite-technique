'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Edit,
  Trash2,
  Car,
  Search,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { AddCarForm } from './add-car-form'
import { EditCarForm } from './edit-car-form'
import { toast } from 'sonner'

interface Car {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  createdAt: string
  updatedAt: string
  _count?: {
    bookings: number
  }
}

interface CarManagementProps {
  userId: string
}

export function CarManagement({ userId }: CarManagementProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null)

  // Mock data for now - in real app, this would fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockCars: Car[] = [
        {
          id: '1',
          licensePlate: '123|أ|45',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2018,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          _count: { bookings: 3 }
        },
        {
          id: '2',
          licensePlate: '456|ب|78',
          brand: 'Renault',
          model: 'Clio',
          year: 2020,
          createdAt: '2024-01-12T14:00:00Z',
          updatedAt: '2024-01-12T14:00:00Z',
          _count: { bookings: 1 }
        }
      ]
      setCars(mockCars)
      setLoading(false)
    }, 1000)
  }, [userId])

  const filteredCars = cars.filter(car =>
    car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCar = (newCar: Omit<Car, 'id' | 'createdAt' | 'updatedAt' | '_count'>) => {
    const car: Car = {
      ...newCar,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { bookings: 0 }
    }
    setCars(prev => [...prev, car])
    setShowAddDialog(false)
    toast.success('Véhicule ajouté avec succès!')
  }

  const handleEditCar = (updatedCar: Car) => {
    setCars(prev => prev.map(car =>
      car.id === updatedCar.id
        ? { ...updatedCar, updatedAt: new Date().toISOString() }
        : car
    ))
    setEditingCar(null)
    toast.success('Véhicule modifié avec succès!')
  }

  const handleDeleteCar = async (carId: string) => {
    setDeletingCarId(carId)
    // Simulate API call
    setTimeout(() => {
      setCars(prev => prev.filter(car => car.id !== carId))
      setDeletingCarId(null)
      toast.success('Véhicule supprimé avec succès!')
    }, 500)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un véhicule..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un véhicule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
              <DialogDescription>
                Renseignez les informations de votre véhicule
              </DialogDescription>
            </DialogHeader>
            <AddCarForm onSubmit={handleAddCar} onCancel={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {cars.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun véhicule enregistré
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par ajouter votre premier véhicule pour pouvoir réserver des inspections.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter mon premier véhicule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cars Grid */}
      {filteredCars.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCars.map((car) => (
            <Card key={car.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{car.licensePlate}</CardTitle>
                  <Badge variant="secondary">
                    {car.year}
                  </Badge>
                </div>
                <CardDescription>
                  {car.brand} {car.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{car._count?.bookings || 0} réservation(s)</span>
                  </div>

                  {car._count?.bookings === 0 && (
                    <div className="flex items-center text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Aucune inspection récente</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCar(car)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCar(car.id)}
                        disabled={deletingCarId === car.id}
                      >
                        {deletingCarId === car.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <Button variant="default" size="sm">
                      Réserver inspection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Search Results */}
      {cars.length > 0 && filteredCars.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun véhicule trouvé
            </h3>
            <p className="text-gray-500">
              Aucun véhicule ne correspond à votre recherche "{searchTerm}".
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Car Dialog */}
      {editingCar && (
        <Dialog open={!!editingCar} onOpenChange={() => setEditingCar(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le véhicule</DialogTitle>
              <DialogDescription>
                Modifiez les informations de votre véhicule
              </DialogDescription>
            </DialogHeader>
            <EditCarForm
              car={editingCar}
              onSubmit={handleEditCar}
              onCancel={() => setEditingCar(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
