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
import { Textarea } from '@/components/ui/textarea'
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
  DialogTrigger,
} from '@/components/ui/dialog'
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
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  Save,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

// Validation schema for center form
const centerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  nameAr: z.string().min(2, 'Le nom en arabe doit contenir au moins 2 caractères'),
  nameEn: z.string().min(2, 'Le nom en anglais doit contenir au moins 2 caractères'),
  address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères'),
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  city: z.string().min(2, 'La ville est requise'),
  latitude: z.number().min(-90).max(90, 'Latitude invalide'),
  longitude: z.number().min(-180).max(180, 'Longitude invalide'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  isActive: z.boolean().default(true),
  services: z.string().min(1, 'Au moins un service est requis'),
  workingHours: z.string().optional(),
})

type CenterFormData = z.infer<typeof centerSchema>

interface Center {
  id: string
  name: string
  nameAr?: string
  nameEn?: string
  address: string
  addressAr?: string
  addressEn?: string
  city: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  isActive: boolean
  services: string[]
  workingHours?: any
  createdAt: string
  updatedAt: string
}

export function CentersManagement() {
  const [centers, setCenters] = useState<Center[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCenter, setEditingCenter] = useState<Center | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // Form setup
  const form = useForm<CenterFormData>({
    resolver: zodResolver(centerSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      nameEn: '',
      address: '',
      addressAr: '',
      addressEn: '',
      city: '',
      latitude: 0,
      longitude: 0,
      phone: '',
      email: '',
      isActive: true,
      services: '',
      workingHours: '',
    }
  })

  // Fetch centers
  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/centers?admin=true')
      if (response.ok) {
        const data = await response.json()
        setCenters(data.centers || [])
      } else {
        toast.error('Erreur lors du chargement des centres')
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
      toast.error('Erreur lors du chargement des centres')
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchCenters()
  }, [])

  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onSubmit = async (data: CenterFormData) => {
    setIsLoading(true)
    try {
      const centerData = {
        ...data,
        services: data.services.split(',').map(s => s.trim()).filter(s => s.length > 0),
        workingHours: data.workingHours ? JSON.parse(data.workingHours) : null,
      }

      const url = editingCenter ? `/api/centers/${editingCenter.id}` : '/api/centers'
      const method = editingCenter ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(centerData),
      })

      if (response.ok) {
        toast.success(editingCenter ? 'Centre modifié avec succès' : 'Centre ajouté avec succès')
        setShowAddDialog(false)
        setShowEditDialog(false)
        setEditingCenter(null)
        form.reset()
        fetchCenters()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving center:', error)
      toast.error('Erreur lors de la sauvegarde du centre')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (center: Center) => {
    setEditingCenter(center)
    form.reset({
      name: center.name,
      nameAr: center.nameAr || '',
      nameEn: center.nameEn || '',
      address: center.address,
      addressAr: center.addressAr || '',
      addressEn: center.addressEn || '',
      city: center.city,
      latitude: center.latitude,
      longitude: center.longitude,
      phone: center.phone || '',
      email: center.email || '',
      isActive: center.isActive,
      services: center.services.join(', '),
      workingHours: center.workingHours ? JSON.stringify(center.workingHours) : '',
    })
    setShowEditDialog(true)
  }

  const handleDelete = async (centerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce centre ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/centers/${centerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Centre supprimé avec succès')
        fetchCenters()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting center:', error)
      toast.error('Erreur lors de la suppression du centre')
    }
  }

  const handleAddNew = () => {
    setEditingCenter(null)
    form.reset()
    setShowAddDialog(true)
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un centre..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau centre
        </Button>
      </div>

      {/* Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Centres d'inspection ({filteredCenters.length})</CardTitle>
          <CardDescription>
            Gérez les centres d'inspection technique disponibles
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
                  <TableHead>Localisation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCenters.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{center.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {center.nameAr}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{center.city}</div>
                          <div className="text-sm text-muted-foreground">
                            {center.address}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {center.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{center.phone}</span>
                          </div>
                        )}
                        {center.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{center.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {center.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={center.isActive ? "default" : "secondary"}
                        className={center.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {center.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(center)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(center.id)}
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

      {/* Add Center Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau centre</DialogTitle>
            <DialogDescription>
              Remplissez les informations du centre d'inspection
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom (Français)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Centre Technique Casablanca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom (Arabe)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مركز الفحص التقني الدار البيضاء" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom (Anglais)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Casablanca Technical Center" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Casablanca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse (Français)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="123 Rue Mohamed V, Casablanca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse (Arabe)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="123 شارع محمد الخامس، الدار البيضاء" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          placeholder="33.5731"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          placeholder="-7.5898"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Actif</FormLabel>
                        <FormDescription>
                          Centre disponible pour les réservations
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+212 522 123 456" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="centre@visite-sri3a.ma" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contrôle technique, Visite périodique, Expertise (séparés par des virgules)"
                      />
                    </FormControl>
                    <FormDescription>
                      Listez les services offerts, séparés par des virgules
                    </FormDescription>
                    <FormMessage />
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

      {/* Edit Center Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le centre</DialogTitle>
            <DialogDescription>
              Modifiez les informations du centre d'inspection
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Same form fields as above */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom (Français)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Centre Technique Casablanca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom (Arabe)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مركز الفحص التقني الدار البيضاء" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom (Anglais)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Casablanca Technical Center" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Casablanca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse (Français)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="123 Rue Mohamed V, Casablanca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse (Arabe)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="123 شارع محمد الخامس، الدار البيضاء" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          placeholder="33.5731"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          placeholder="-7.5898"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Actif</FormLabel>
                        <FormDescription>
                          Centre disponible pour les réservations
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+212 522 123 456" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="centre@visite-sri3a.ma" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contrôle technique, Visite périodique, Expertise (séparés par des virgules)"
                      />
                    </FormControl>
                    <FormDescription>
                      Listez les services offerts, séparés par des virgules
                    </FormDescription>
                    <FormMessage />
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
    </div>
  )
}
