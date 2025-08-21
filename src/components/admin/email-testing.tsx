'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface EmailStatus {
  configured: boolean
  status: string
}

interface SMSStatus {
  configured: boolean
  status: string
}

export function EmailTesting() {
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
  const [smsStatus, setSmsStatus] = useState<SMSStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [selectedEmailType, setSelectedEmailType] = useState('')
  const [selectedSMSType, setSelectedSMSType] = useState('')
  const [sending, setSending] = useState(false)

  const notificationTypes = [
    { value: 'booking_confirmation', label: 'Confirmation de réservation' },
    { value: 'payment_confirmation', label: 'Confirmation de paiement' },
    { value: 'booking_reminder', label: 'Rappel de rendez-vous' },
    { value: 'booking_cancellation', label: 'Annulation de réservation' }
  ]

  // Check notification services status
  const checkNotificationStatus = async () => {
    try {
      setLoading(true)

      // Check email status
      const emailResponse = await fetch('/api/admin/email/test')
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        setEmailStatus(emailData)
      }

      // Check SMS status
      const smsResponse = await fetch('/api/admin/notifications/sms/test')
      if (smsResponse.ok) {
        const smsData = await smsResponse.json()
        setSmsStatus(smsData)
      }
    } catch (error) {
      console.error('Error checking notification status:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de vérifier le statut des notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Send test email
  const sendTestEmail = async () => {
    if (!testEmail || !selectedEmailType) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un type d\'email et saisir une adresse',
        variant: 'destructive',
      })
      return
    }

    try {
      setSending(true)
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: selectedEmailType,
          testEmail: testEmail,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send test email')
      }

      toast({
        title: 'Succès',
        description: 'Email de test envoyé avec succès',
      })

      // Clear form
      setTestEmail('')
      setSelectedEmailType('')
    } catch (error) {
      console.error('Error sending test email:', error)
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer l\'email de test',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  // Send test SMS
  const sendTestSMS = async () => {
    if (!testPhone || !selectedSMSType) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un type de SMS et saisir un numéro',
        variant: 'destructive',
      })
      return
    }

    try {
      setSending(true)
      const response = await fetch('/api/admin/notifications/sms/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smsType: selectedSMSType,
          testPhone: testPhone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send test SMS')
      }

      toast({
        title: 'Succès',
        description: 'SMS de test envoyé avec succès',
      })

      // Clear form
      setTestPhone('')
      setSelectedSMSType('')
    } catch (error) {
      console.error('Error sending test SMS:', error)
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le SMS de test',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Vérification des services de notification...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Service Status */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Service Email</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {emailStatus?.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">
                    {emailStatus?.configured ? 'Configuré' : 'Non Configuré'}
                  </p>
                  <p className="text-sm text-gray-600">{emailStatus?.status}</p>
                </div>
              </div>
              <Badge
                variant={emailStatus?.configured ? 'default' : 'destructive'}
                className={emailStatus?.configured ? 'bg-green-100 text-green-800' : ''}
              >
                {emailStatus?.configured ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {!emailStatus?.configured && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-yellow-700">
                      Variables requises: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Service SMS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {smsStatus?.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">
                    {smsStatus?.configured ? 'Configuré' : 'Non Configuré'}
                  </p>
                  <p className="text-sm text-gray-600">{smsStatus?.status}</p>
                </div>
              </div>
              <Badge
                variant={smsStatus?.configured ? 'default' : 'destructive'}
                className={smsStatus?.configured ? 'bg-green-100 text-green-800' : ''}
              >
                {smsStatus?.configured ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {!smsStatus?.configured && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-yellow-700">
                      Variables requises: SMS_API_KEY (AccountSID:AuthToken), SMS_SENDER_ID
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button
        variant="outline"
        onClick={checkNotificationStatus}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Actualiser le statut
      </Button>

      {/* Notification Testing */}
      {(emailStatus?.configured || smsStatus?.configured) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Test des Notifications</span>
            </CardTitle>
            <CardDescription>
              Envoyez des notifications de test pour vérifier les templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" disabled={!emailStatus?.configured}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms" disabled={!smsStatus?.configured}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                </TabsTrigger>
              </TabsList>

              {/* Email Testing Tab */}
              <TabsContent value="email" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Adresse email de test</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-type">Type d'email</Label>
                    <Select value={selectedEmailType} onValueChange={setSelectedEmailType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={sendTestEmail}
                  disabled={!testEmail || !selectedEmailType || sending}
                  className="w-full md:w-auto"
                >
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer l'email de test
                </Button>
              </TabsContent>

              {/* SMS Testing Tab */}
              <TabsContent value="sms" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-phone">Numéro de téléphone de test</Label>
                    <Input
                      id="test-phone"
                      type="tel"
                      placeholder="+212600000000 ou 0600000000"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sms-type">Type de SMS</Label>
                    <Select value={selectedSMSType} onValueChange={setSelectedSMSType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={sendTestSMS}
                  disabled={!testPhone || !selectedSMSType || sending}
                  className="w-full md:w-auto"
                >
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer le SMS de test
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Note :</p>
                  <p>Les notifications de test utilisent des données fictives pour démontrer le format et le contenu.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Templates Information */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de Notification Disponibles</CardTitle>
          <CardDescription>
            Liste des templates Email et SMS configurés dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationTypes.map((type) => (
              <div key={type.value} className="p-3 border rounded-lg">
                <h4 className="font-medium">{type.label}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {type.value === 'booking_confirmation' && 'Envoyé après confirmation de réservation'}
                  {type.value === 'payment_confirmation' && 'Envoyé après paiement réussi'}
                  {type.value === 'booking_reminder' && 'Envoyé 24h avant le rendez-vous'}
                  {type.value === 'booking_cancellation' && 'Envoyé lors d\'une annulation'}
                </p>
                <div className="flex space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">Email + SMS</Badge>
                  <Badge variant="outline" className="text-xs">Français</Badge>
                  <Badge variant="outline" className="text-xs">العربية</Badge>
                  <Badge variant="outline" className="text-xs">English</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
