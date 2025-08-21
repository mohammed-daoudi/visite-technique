'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Car validation schema
const carSchema = z.object({
  licensePlate: z
    .string()
    .min(1, 'La plaque d\'immatriculation est requise')
    .regex(
      /^[0-9]{1,4}\|[أ-ي]\|[0-9]{1,2}$/,
      'Format invalide. Utilisez: 123|أ|45'
    ),
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  year: z
    .number()
    .min(1990, 'L\'année doit être au moins 1990')
    .max(new Date().getFullYear() + 1, 'L\'année ne peut pas être dans le futur'),
})

type CarFormData = z.infer<typeof carSchema>

interface AddCarFormProps {
  onSubmit: (data: CarFormData) => void
  onCancel: () => void
}

// Popular car brands in Morocco
const CAR_BRANDS = [
  'Toyota', 'Renault', 'Peugeot', 'Citroën', 'Volkswagen', 'Ford',
  'Nissan', 'Hyundai', 'Kia', 'Dacia', 'BMW', 'Mercedes-Benz',
  'Audi', 'Fiat', 'Opel', 'Chevrolet', 'Mazda', 'Honda',
  'Mitsubishi', 'Suzuki', 'Skoda', 'SEAT', 'Autre'
]

// Generate years from 1990 to current year + 1
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => new Date().getFullYear() - i
)

export function AddCarForm({ onSubmit, onCancel }: AddCarFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      licensePlate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
    },
  })

  const handleSubmit = async (data: CarFormData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      onSubmit(data)
    } catch (error) {
      console.error('Error adding car:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plaque d'immatriculation</FormLabel>
              <FormControl>
                <Input
                  placeholder="123|أ|45"
                  {...field}
                  className="text-center font-mono"
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Format: Numéros|Lettre arabe|Numéros (ex: 123|أ|45)
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marque</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une marque" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CAR_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
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
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modèle</FormLabel>
              <FormControl>
                <Input placeholder="Corolla, Clio, 308..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez l'année" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Ajouter
          </Button>
        </div>
      </form>
    </Form>
  )
}
