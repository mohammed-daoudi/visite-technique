'use client'

import { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from 'react-google-maps-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

interface InspectionCenter {
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
  workingHours: any
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
}

const defaultCenter = {
  lat: 33.5731, // Morocco center
  lng: -7.5898
}

export function CentersMap() {
  const [centers, setCenters] = useState<InspectionCenter[]>([])
  const [selectedCenter, setSelectedCenter] = useState<InspectionCenter | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCenters()
    getUserLocation()
  }, [])

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/centers')
      if (response.ok) {
        const data = await response.json()
        setCenters(data)
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting user location:', error)
        }
      )
    }
  }

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Non spécifié'

    // Assuming workingHours is an object like { monday: "8:00-18:00", ... }
    const today = new Date().getDay()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayKey = days[today]

    return workingHours[todayKey] || 'Fermé'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Chargement des centres...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Carte des centres d'inspection
          </CardTitle>
          <CardDescription>
            Cliquez sur les marqueurs pour voir les détails des centres
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation || defaultCenter}
              zoom={userLocation ? 12 : 6}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" fill="#ffffff"/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(24, 24),
                  }}
                  title="Votre position"
                />
              )}

              {/* Center markers */}
              {centers.map((center) => (
                <Marker
                  key={center.id}
                  position={{ lat: center.latitude, lng: center.longitude }}
                  onClick={() => setSelectedCenter(center)}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
                        <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                />
              ))}

              {/* Info window for selected center */}
              {selectedCenter && (
                <InfoWindow
                  position={{ lat: selectedCenter.latitude, lng: selectedCenter.longitude }}
                  onCloseClick={() => setSelectedCenter(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-semibold text-lg mb-2">{selectedCenter.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                        <span>{selectedCenter.address}, {selectedCenter.city}</span>
                      </div>
                      {selectedCenter.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedCenter.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{formatWorkingHours(selectedCenter.workingHours)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCenter.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {selectedCenter.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{selectedCenter.services.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </CardContent>
      </Card>

      {/* Centers list */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des centres ({centers.length})</CardTitle>
          <CardDescription>
            Tous les centres d'inspection technique disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {centers.map((center) => (
              <Card key={center.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">{center.name}</CardTitle>
                    <Badge variant={center.isActive ? "default" : "secondary"}>
                      {center.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {center.city}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                    <span>{center.address}</span>
                  </div>

                  {center.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{center.phone}</span>
                    </div>
                  )}

                  {center.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{center.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{formatWorkingHours(center.workingHours)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {center.services.slice(0, 2).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {center.services.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{center.services.length - 2}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => setSelectedCenter(center)}
                  >
                    Voir sur la carte
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {centers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun centre d'inspection trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
