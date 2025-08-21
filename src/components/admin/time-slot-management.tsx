'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  Loader2,
  Calendar,
  Clock,
  Users,
  Euro
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Validation schema for time slot
const timeSlotSchema = z.object({
  inspectionCenterId: z.string().min(1, 'Centre requis'),
  date: z.string().min(1, 'Date requise'),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().min(1, 'Heure de fin requise'),
  capacity: z.number().min(1, 'Capacité minimale de 1'),
  price: z.number().min(0, 'Prix doit être positif'),
  isAvailable: z.boolean().default(true),
})

// Bulk creation schema
const bulkSlotSchema = z.object({
  inspectionCenterId: z.string().min(1, 'Centre requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  timeSlots: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    capacity: z.number(),
    price: z.number(),
  })).min(1, 'Au moins un créneau requis'),
  skipWeekends: z.boolean().default(true),
})

type TimeSlotFormData = z.infer<typeof timeSlotSchema>
type BulkSlotFormData = z.infer<typeof bulkSlotSchema>

interface TimeSlot {
  id: string
  inspectionCenterId: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  isAvailable: boolean
  price: number
  inspectionCenter: {
    name: string
    city: string
  }
  createdAt: string
  updatedAt: string
}

interface Center {
  id: string
  name: string
  city: string
}

export function TimeSlotManagement() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCenter, setSelectedCenter] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // Single slot form
  const form = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      inspectionCenterId: '',
      date: '',
      startTime: '',
      endTime: '',
      capacity: 1,
      price: 0,
      isAvailable: true,
    }
  })

  // Bulk creation form
  const bulkForm = useForm<BulkSlotFormData>({
    resolver: zodResolver(bulkSlotSchema),
    defaultValues: {
      inspectionCenterId: '',
      startDate: '',
      endDate: '',
      timeSlots: [
        { startTime: '08:00', endTime: '09:00', capacity: 1, price: 200 },
        { startTime: '09:00', endTime: '10:00', capacity: 1, price: 200 },
        { startTime: '10:00', endTime: '11:00', capacity: 1, price: 200 },
        { startTime: '11:00', endTime: '12:00', capacity: 1, price: 200 },
        { startTime: '14:00', endTime: '15:00', capacity: 1, price: 200 },
        { startTime: '15:00', endTime: '16:00', capacity: 1, price: 200 },
        { startTime: '16:00', endTime: '17:00', capacity: 1, price: 200 },
      ],
      skipWeekends: true,
    }
  })

  // Fetch centers
  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/centers?admin=true')
      if (response.ok) {
        const data = await response.json()
        setCenters(data.centers || [])
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
    }
  }

  // Fetch time slots
  const fetchTimeSlots = async () => {
    try {
      setIsFetching(true)
      const params = new URLSearchParams()
      if (selectedCenter) params.append('centerId', selectedCenter)
      if (selectedDate) params.append('date', selectedDate)
      params.append('admin', 'true')

      const response = await fetch(`/api/admin/time-slots?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data.timeSlots || [])
      } else {
        toast.error('Erreur lors du chargement des créneaux')
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
      toast.error('Erreur lors du chargement des créneaux')
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchCenters()
  }, [])

  useEffect(() => {
    fetchTimeSlots()
  }, [selectedCenter, selectedDate])

  const filteredSlots = timeSlots.filter(slot =>
    slot.inspectionCenter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.inspectionCenter.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onSubmit = async (data: TimeSlotFormData) => {
    setIsLoading(true)
    try {
      const url = editingSlot ? `/api/admin/time-slots/${editingSlot.id}` : '/api/time-slots'
      const method = editingSlot ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(editingSlot ? 'Créneau modifié avec succès' : 'Créneau ajouté avec succès')
        setShowAddDialog(false)
        setShowEditDialog(false)
        setEditingSlot(null)
        form.reset()
        fetchTimeSlots()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving time slot:', error)
      toast.error('Erreur lors de la sauvegarde du créneau')
    } finally {
      setIsLoading(false)
    }
  }

  const onBulkSubmit = async (data: BulkSlotFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/time-slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.created} créneaux créés avec succès`)
        setShowBulkDialog(false)
        bulkForm.reset()
        fetchTimeSlots()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création en masse')
      }
    } catch (error) {
      console.error('Error bulk creating time slots:', error)
      toast.error('Erreur lors de la création en masse')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot)
    form.reset({
      inspectionCenterId: slot.inspectionCenterId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      price: slot.price,
      isAvailable: slot.isAvailable,
    })
    setShowEditDialog(true)
  }

  const handleDelete = async (slotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return

    try {
      const response = await fetch(`/api/admin/time-slots/${slotId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Créneau supprimé avec succès')
        fetchTimeSlots()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting time slot:', error)
      toast.error('Erreur lors de la suppression du créneau')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedCenter} onValueChange={setSelectedCenter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les centres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les centres</SelectItem>
              {centers.map((center) => (
                <SelectItem key={center.id} value={center.id}>
                  {center.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => setShowBulkDialog(true)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Création en masse
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau créneau
          </Button>
        </div>
      </div>

      {/* Time Slots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Créneaux horaires ({filteredSlots.length})</CardTitle>
          <CardDescription>
            Gérez les créneaux horaires pour les centres d'inspection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{slot.inspectionCenter.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {slot.inspectionCenter.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(slot.date), 'dd/MM/yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{slot.bookedCount}/{slot.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span>{slot.price} MAD</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={slot.isAvailable ? "default" : "secondary"}
                        className={slot.isAvailable ? "bg-green-100 text-green-800" : ""}
                      >
                        {slot.isAvailable ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(slot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(slot.id)}
                          disabled={slot.bookedCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Time Slot Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau créneau</DialogTitle>
            <DialogDescription>
              Créez un nouveau créneau horaire pour un centre
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="inspectionCenterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centre d'inspection</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un centre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {centers.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name} - {center.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (MAD)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Disponible</FormLabel>
                      <FormDescription>
                        Créneau disponible pour les réservations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Time Slot Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le créneau</DialogTitle>
            <DialogDescription>
              Modifiez les informations du créneau horaire
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Same form fields as add dialog */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="inspectionCenterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centre d'inspection</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un centre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {centers.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name} - {center.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (MAD)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Disponible</FormLabel>
                      <FormDescription>
                        Créneau disponible pour les réservations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Creation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Création en masse de créneaux</DialogTitle>
            <DialogDescription>
              Créez plusieurs créneaux pour une période donnée
            </DialogDescription>
          </DialogHeader>

          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={bulkForm.control}
                  name="inspectionCenterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centre d'inspection</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un centre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {centers.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name} - {center.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bulkForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bulkForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={bulkForm.control}
                name="skipWeekends"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ignorer les week-ends</FormLabel>
                      <FormDescription>
                        Ne pas créer de créneaux le samedi et dimanche
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-base font-medium">Créneaux horaires</Label>
                <div className="mt-2 space-y-2">
                  {bulkForm.watch('timeSlots').map((slot, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-4 p-2 border rounded">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => {
                          const slots = bulkForm.getValues('timeSlots')
                          slots[index].startTime = e.target.value
                          bulkForm.setValue('timeSlots', slots)
                        }}
                      />
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => {
                          const slots = bulkForm.getValues('timeSlots')
                          slots[index].endTime = e.target.value
                          bulkForm.setValue('timeSlots', slots)
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Capacité"
                        value={slot.capacity}
                        onChange={(e) => {
                          const slots = bulkForm.getValues('timeSlots')
                          slots[index].capacity = parseInt(e.target.value) || 1
                          bulkForm.setValue('timeSlots', slots)
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Prix (MAD)"
                        value={slot.price}
                        onChange={(e) => {
                          const slots = bulkForm.getValues('timeSlots')
                          slots[index].price = parseFloat(e.target.value) || 0
                          bulkForm.setValue('timeSlots', slots)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBulkDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Calendar className="h-4 w-4 mr-2" />
                  Créer les créneaux
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
