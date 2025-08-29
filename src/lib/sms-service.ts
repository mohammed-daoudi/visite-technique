import twilio from 'twilio'
import { env } from './env'

// SMS template data interfaces
interface BookingConfirmationSMSData {
  bookingNumber: string
  customerName: string
  phoneNumber: string
  carInfo: string
  centerName: string
  date: string
  time: string
  amount: number
  language: string
}

interface PaymentConfirmationSMSData {
  bookingNumber: string
  customerName: string
  phoneNumber: string
  amount: number
  transactionId: string
  language: string
}

interface BookingReminderSMSData {
  bookingNumber: string
  customerName: string
  phoneNumber: string
  carInfo: string
  centerName: string
  date: string
  time: string
  language: string
}

interface BookingCancellationSMSData {
  bookingNumber: string
  customerName: string
  phoneNumber: string
  carInfo: string
  reason?: string
  language: string
}

class SMSService {
  private client: twilio.Twilio | null
  private fromNumber: string

  constructor() {
    // Initialize Twilio client if credentials are available
    if (env.SMS_API_KEY && env.SMS_SENDER_ID) {
      // For Twilio, SMS_API_KEY should be in format "Account SID:Auth Token"
      const [accountSid, authToken] = env.SMS_API_KEY.split(':')
      if (accountSid && authToken) {
        this.client = twilio(accountSid, authToken)
        this.fromNumber = env.SMS_SENDER_ID
      } else {
        console.warn('SMS_API_KEY should be in format "AccountSID:AuthToken"')
        this.client = null
        this.fromNumber = ''
      }
    } else {
      console.warn('SMS credentials not configured')
      this.client = null
      this.fromNumber = ''
    }
  }

  // Test SMS configuration
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false
    }

    try {
      // Test by getting account info
      await this.client.api.v2010.accounts.list()
      return true
    } catch (error) {
      console.error('SMS configuration test failed:', error)
      return false
    }
  }

  // Get SMS templates in different languages
  private getTemplate(type: string, language: string): string {
    const templates = {
      bookingConfirmation: {
        fr: `Visite Sri3a - Confirmation de réservation
Bonjour {{customerName}},
Votre RDV est confirmé:
Réservation: {{bookingNumber}}
Véhicule: {{carInfo}}
Centre: {{centerName}}
Date: {{date}} à {{time}}
Montant: {{amount}} MAD
Arrivez 15 min avant.`,
        ar: `زيارة سري3ا - تأكيد الحجز
مرحبا {{customerName}}
تم تأكيد موعدك:
رقم الحجز: {{bookingNumber}}
المركبة: {{carInfo}}
المركز: {{centerName}}
التاريخ: {{date}} في {{time}}
المبلغ: {{amount}} درهم
الوصول قبل 15 دقيقة`,
        en: `Visite Sri3a - Booking Confirmed
Hello {{customerName}},
Your appointment is confirmed:
Booking: {{bookingNumber}}
Vehicle: {{carInfo}}
Center: {{centerName}}
Date: {{date}} at {{time}}
Amount: {{amount}} MAD
Arrive 15 min early.`
      },
      paymentConfirmation: {
        fr: `Visite Sri3a - Paiement confirmé
Bonjour {{customerName}},
Paiement reçu:
Réservation: {{bookingNumber}}
Montant: {{amount}} MAD
Transaction: {{transactionId}}
Merci !`,
        ar: `زيارة سري3ا - تأكيد الدفع
مرحبا {{customerName}}
تم استلام الدفع:
رقم الحجز: {{bookingNumber}}
المبلغ: {{amount}} درهم
رقم المعاملة: {{transactionId}}
شكرا لك!`,
        en: `Visite Sri3a - Payment Confirmed
Hello {{customerName}},
Payment received:
Booking: {{bookingNumber}}
Amount: {{amount}} MAD
Transaction: {{transactionId}}
Thank you!`
      },
      bookingReminder: {
        fr: `Visite Sri3a - Rappel RDV
Bonjour {{customerName}},
Rappel: Votre RDV est demain
Réservation: {{bookingNumber}}
Véhicule: {{carInfo}}
Centre: {{centerName}}
Date: {{date}} à {{time}}
N'oubliez pas vos documents!`,
        ar: `زيارة سري3ا - تذكير بالموعد
مرحبا {{customerName}}
تذكير: موعدك غدا
رقم الحجز: {{bookingNumber}}
المركبة: {{carInfo}}
المركز: {{centerName}}
التاريخ: {{date}} في {{time}}
لا تنس وثائقك!`,
        en: `Visite Sri3a - Appointment Reminder
Hello {{customerName}},
Reminder: Your appointment is tomorrow
Booking: {{bookingNumber}}
Vehicle: {{carInfo}}
Center: {{centerName}}
Date: {{date}} at {{time}}
Don't forget your documents!`
      },
      bookingCancellation: {
        fr: `Visite Sri3a - Annulation
Bonjour {{customerName}},
Votre réservation {{bookingNumber}} pour {{carInfo}} a été annulée.
{{#if reason}}Raison: {{reason}}{{/if}}
Vous pouvez reprendre RDV sur notre site.`,
        ar: `زيارة سري3ا - إلغاء الحجز
مرحبا {{customerName}}
تم إلغاء حجزك {{bookingNumber}} للمركبة {{carInfo}}
{{#if reason}}السبب: {{reason}}{{/if}}
يمكنك حجز موعد جديد على موقعنا`,
        en: `Visite Sri3a - Booking Cancelled
Hello {{customerName}},
Your booking {{bookingNumber}} for {{carInfo}} has been cancelled.
{{#if reason}}Reason: {{reason}}{{/if}}
You can book again on our website.`
      }
    }

    return templates[type]?.[language] || templates[type]?.['fr'] || ''
  }

  // Replace template variables
  private replaceVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }

  // Format phone number for international use (Morocco +212)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '')

    // If it starts with 212, it's already international
    if (digits.startsWith('212')) {
      return `+${digits}`
    }

    // If it starts with 0, remove it and add 212
    if (digits.startsWith('0')) {
      return `+212${digits.substring(1)}`
    }

    // If it's 9 digits (Moroccan mobile), add 212
    if (digits.length === 9) {
      return `+212${digits}`
    }

    // Otherwise return as is with +
    return `+${digits}`
  }

  // Send SMS
  private async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.client) {
      console.error('SMS client not initialized')
      return false
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to)

      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber
      })

      await this.logSMS('SMS_SENT', formattedNumber, message, 'SENT')
      return true
    } catch (error) {
      console.error('Failed to send SMS:', error)
      await this.logSMS('SMS_FAILED', to, message, 'FAILED')
      return false
    }
  }

  // Send booking confirmation SMS
  async sendBookingConfirmation(data: BookingConfirmationSMSData): Promise<boolean> {
    try {
      const template = this.getTemplate('bookingConfirmation', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        carInfo: data.carInfo,
        centerName: data.centerName,
        date: data.date,
        time: data.time,
        amount: data.amount.toString()
      }

      const message = this.replaceVariables(template, templateData)
      return await this.sendSMS(data.phoneNumber, message)
    } catch (error) {
      console.error('Failed to send booking confirmation SMS:', error)
      return false
    }
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmation(data: PaymentConfirmationSMSData): Promise<boolean> {
    try {
      const template = this.getTemplate('paymentConfirmation', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        amount: data.amount.toString(),
        transactionId: data.transactionId
      }

      const message = this.replaceVariables(template, templateData)
      return await this.sendSMS(data.phoneNumber, message)
    } catch (error) {
      console.error('Failed to send payment confirmation SMS:', error)
      return false
    }
  }

  // Send booking reminder SMS
  async sendBookingReminder(data: BookingReminderSMSData): Promise<boolean> {
    try {
      const template = this.getTemplate('bookingReminder', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        carInfo: data.carInfo,
        centerName: data.centerName,
        date: data.date,
        time: data.time
      }

      const message = this.replaceVariables(template, templateData)
      return await this.sendSMS(data.phoneNumber, message)
    } catch (error) {
      console.error('Failed to send booking reminder SMS:', error)
      return false
    }
  }

  // Send booking cancellation SMS
  async sendBookingCancellation(data: BookingCancellationSMSData): Promise<boolean> {
    try {
      const template = this.getTemplate('bookingCancellation', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        carInfo: data.carInfo,
        reason: data.reason || ''
      }

      const message = this.replaceVariables(template, templateData)
      return await this.sendSMS(data.phoneNumber, message)
    } catch (error) {
      console.error('Failed to send booking cancellation SMS:', error)
      return false
    }
  }

  // Log SMS for tracking
  private async logSMS(type: string, recipient: string, message: string, status: string): Promise<void> {
    try {
      // This would normally log to database or external service
      console.log(`SMS ${status}: ${type} to ${recipient} - ${message.substring(0, 50)}...`)
    } catch (error) {
      console.error('Failed to log SMS:', error)
    }
  }

  // Check if SMS is enabled
  isEnabled(): boolean {
    return this.client !== null
  }
}

// Export singleton instance
export const smsService = new SMSService()

// Export types
export type {
  BookingConfirmationSMSData,
  PaymentConfirmationSMSData,
  BookingReminderSMSData,
  BookingCancellationSMSData
}
