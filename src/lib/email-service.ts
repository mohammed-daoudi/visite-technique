import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Email configuration
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email template data interfaces
interface BookingConfirmationData {
  bookingNumber: string
  customerName: string
  customerEmail: string
  carInfo: string
  centerName: string
  centerAddress: string
  date: string
  time: string
  amount: number
  language: string
}

interface PaymentConfirmationData {
  bookingNumber: string
  customerName: string
  customerEmail: string
  amount: number
  transactionId: string
  language: string
}

interface BookingReminderData {
  bookingNumber: string
  customerName: string
  customerEmail: string
  carInfo: string
  centerName: string
  centerAddress: string
  date: string
  time: string
  language: string
}

interface BookingCancellationData {
  bookingNumber: string
  customerName: string
  customerEmail: string
  carInfo: string
  reason?: string
  language: string
}

class EmailService {
  private transporter: nodemailer.Transporter
  private fromEmail: string
  private fromName: string

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    this.fromEmail = process.env.SMTP_FROM || 'noreply@visite-sri3a.ma'
    this.fromName = process.env.SMTP_FROM_NAME || 'Visite Sri3a'

    this.transporter = nodemailer.createTransport(config)
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email configuration test failed:', error)
      return false
    }
  }

  // Get email templates in different languages
  private getTemplate(type: string, language: string): { subject: string; html: string; text: string } {
    const templates = {
      bookingConfirmation: {
        fr: {
          subject: 'Confirmation de votre réservation - Visite Sri3a',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Confirmation de Réservation</h2>
              <p>Bonjour <strong>{{customerName}}</strong>,</p>
              <p>Votre réservation a été confirmée avec succès !</p>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails de votre rendez-vous</h3>
                <p><strong>Numéro de réservation :</strong> {{bookingNumber}}</p>
                <p><strong>Véhicule :</strong> {{carInfo}}</p>
                <p><strong>Centre :</strong> {{centerName}}</p>
                <p><strong>Adresse :</strong> {{centerAddress}}</p>
                <p><strong>Date :</strong> {{date}}</p>
                <p><strong>Heure :</strong> {{time}}</p>
                <p><strong>Montant :</strong> {{amount}} MAD</p>
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Rappel important</h4>
                <ul>
                  <li>Arrivez 15 minutes avant votre rendez-vous</li>
                  <li>Apportez votre carte grise et permis de conduire</li>
                  <li>Le véhicule doit être propre (intérieur et extérieur)</li>
                  <li>Vérifiez que tous les équipements fonctionnent</li>
                </ul>
              </div>

              <p>Cordialement,<br>L'équipe Visite Sri3a</p>
            </div>
          `,
          text: `Confirmation de Réservation - Visite Sri3a\n\nBonjour {{customerName}},\n\nVotre réservation a été confirmée !\n\nNuméro: {{bookingNumber}}\nVéhicule: {{carInfo}}\nCentre: {{centerName}}\nDate: {{date}} à {{time}}\nMontant: {{amount}} MAD\n\nCordialement,\nL'équipe Visite Sri3a`
        },
        ar: {
          subject: 'تأكيد حجزك - زيارة سري3ا',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
              <h2 style="color: #2563eb;">تأكيد الحجز</h2>
              <p>مرحبا <strong>{{customerName}}</strong>،</p>
              <p>تم تأكيد حجزك بنجاح!</p>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">تفاصيل موعدك</h3>
                <p><strong>رقم الحجز:</strong> {{bookingNumber}}</p>
                <p><strong>المركبة:</strong> {{carInfo}}</p>
                <p><strong>المركز:</strong> {{centerName}}</p>
                <p><strong>العنوان:</strong> {{centerAddress}}</p>
                <p><strong>التاريخ:</strong> {{date}}</p>
                <p><strong>الوقت:</strong> {{time}}</p>
                <p><strong>المبلغ:</strong> {{amount}} درهم</p>
              </div>

              <p>مع أطيب التحيات،<br>فريق زيارة سري3ا</p>
            </div>
          `,
          text: `تأكيد الحجز - زيارة سري3ا\n\nمرحبا {{customerName}}،\n\nتم تأكيد حجزك!\n\nرقم الحجز: {{bookingNumber}}\nالمركبة: {{carInfo}}\nالمركز: {{centerName}}\nالتاريخ: {{date}} في {{time}}\nالمبلغ: {{amount}} درهم`
        },
        en: {
          subject: 'Booking Confirmation - Visite Sri3a',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Booking Confirmation</h2>
              <p>Hello <strong>{{customerName}}</strong>,</p>
              <p>Your booking has been confirmed successfully!</p>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Appointment Details</h3>
                <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
                <p><strong>Vehicle:</strong> {{carInfo}}</p>
                <p><strong>Center:</strong> {{centerName}}</p>
                <p><strong>Address:</strong> {{centerAddress}}</p>
                <p><strong>Date:</strong> {{date}}</p>
                <p><strong>Time:</strong> {{time}}</p>
                <p><strong>Amount:</strong> {{amount}} MAD</p>
              </div>

              <p>Best regards,<br>Visite Sri3a Team</p>
            </div>
          `,
          text: `Booking Confirmation - Visite Sri3a\n\nHello {{customerName}},\n\nYour booking has been confirmed!\n\nBooking: {{bookingNumber}}\nVehicle: {{carInfo}}\nCenter: {{centerName}}\nDate: {{date}} at {{time}}\nAmount: {{amount}} MAD`
        }
      },
      paymentConfirmation: {
        fr: {
          subject: 'Confirmation de paiement - Visite Sri3a',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Paiement Confirmé</h2>
              <p>Bonjour <strong>{{customerName}}</strong>,</p>
              <p>Votre paiement a été traité avec succès.</p>

              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails du paiement</h3>
                <p><strong>Réservation :</strong> {{bookingNumber}}</p>
                <p><strong>Montant payé :</strong> {{amount}} MAD</p>
                <p><strong>Transaction :</strong> {{transactionId}}</p>
              </div>

              <p>Cordialement,<br>L'équipe Visite Sri3a</p>
            </div>
          `,
          text: `Paiement Confirmé - Visite Sri3a\n\nBonjour {{customerName}},\n\nVotre paiement de {{amount}} MAD pour la réservation {{bookingNumber}} a été confirmé.\nTransaction: {{transactionId}}`
        }
      },
      bookingReminder: {
        fr: {
          subject: 'Rappel de rendez-vous - Visite Sri3a',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Rappel de Rendez-vous</h2>
              <p>Bonjour <strong>{{customerName}}</strong>,</p>
              <p>Nous vous rappelons votre rendez-vous pour la visite technique de demain.</p>

              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Votre rendez-vous</h3>
                <p><strong>Réservation :</strong> {{bookingNumber}}</p>
                <p><strong>Véhicule :</strong> {{carInfo}}</p>
                <p><strong>Centre :</strong> {{centerName}}</p>
                <p><strong>Date :</strong> {{date}}</p>
                <p><strong>Heure :</strong> {{time}}</p>
              </div>

              <p>N'oubliez pas d'arriver 15 minutes avant l'heure prévue.</p>
              <p>Cordialement,<br>L'équipe Visite Sri3a</p>
            </div>
          `,
          text: `Rappel - Visite Sri3a\n\nBonjour {{customerName}},\n\nRappel de votre rendez-vous demain:\nRéservation: {{bookingNumber}}\nVéhicule: {{carInfo}}\nCentre: {{centerName}}\nDate: {{date}} à {{time}}`
        }
      },
      bookingCancellation: {
        fr: {
          subject: 'Annulation de réservation - Visite Sri3a',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Réservation Annulée</h2>
              <p>Bonjour <strong>{{customerName}}</strong>,</p>
              <p>Votre réservation a été annulée.</p>

              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails de l'annulation</h3>
                <p><strong>Réservation :</strong> {{bookingNumber}}</p>
                <p><strong>Véhicule :</strong> {{carInfo}}</p>
                {{#if reason}}<p><strong>Raison :</strong> {{reason}}</p>{{/if}}
              </div>

              <p>Vous pouvez effectuer une nouvelle réservation à tout moment sur notre site.</p>
              <p>Cordialement,<br>L'équipe Visite Sri3a</p>
            </div>
          `,
          text: `Annulation - Visite Sri3a\n\nBonjour {{customerName}},\n\nVotre réservation {{bookingNumber}} pour {{carInfo}} a été annulée.`
        }
      }
    }

    return templates[type]?.[language] || templates[type]?.['fr'] || { subject: '', html: '', text: '' }
  }

  // Replace template variables
  private replaceVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }

  // Send booking confirmation email
  async sendBookingConfirmation(data: BookingConfirmationData): Promise<boolean> {
    try {
      const template = this.getTemplate('bookingConfirmation', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        carInfo: data.carInfo,
        centerName: data.centerName,
        centerAddress: data.centerAddress,
        date: data.date,
        time: data.time,
        amount: data.amount.toString()
      }

      const subject = this.replaceVariables(template.subject, templateData)
      const html = this.replaceVariables(template.html, templateData)
      const text = this.replaceVariables(template.text, templateData)

      await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.customerEmail,
        subject,
        html,
        text
      })

      // Log the email
      await this.logEmail('BOOKING_CONFIRMATION', data.customerEmail, subject, 'SENT')

      return true
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error)
      await this.logEmail('BOOKING_CONFIRMATION', data.customerEmail, 'Failed to send', 'FAILED')
      return false
    }
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<boolean> {
    try {
      const template = this.getTemplate('paymentConfirmation', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        amount: data.amount.toString(),
        transactionId: data.transactionId
      }

      const subject = this.replaceVariables(template.subject, templateData)
      const html = this.replaceVariables(template.html, templateData)
      const text = this.replaceVariables(template.text, templateData)

      await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.customerEmail,
        subject,
        html,
        text
      })

      await this.logEmail('PAYMENT_CONFIRMATION', data.customerEmail, subject, 'SENT')
      return true
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error)
      await this.logEmail('PAYMENT_CONFIRMATION', data.customerEmail, 'Failed to send', 'FAILED')
      return false
    }
  }

  // Send booking reminder email
  async sendBookingReminder(data: BookingReminderData): Promise<boolean> {
    try {
      const template = this.getTemplate('bookingReminder', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        carInfo: data.carInfo,
        centerName: data.centerName,
        centerAddress: data.centerAddress,
        date: data.date,
        time: data.time
      }

      const subject = this.replaceVariables(template.subject, templateData)
      const html = this.replaceVariables(template.html, templateData)
      const text = this.replaceVariables(template.text, templateData)

      await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.customerEmail,
        subject,
        html,
        text
      })

      await this.logEmail('APPOINTMENT_REMINDER', data.customerEmail, subject, 'SENT')
      return true
    } catch (error) {
      console.error('Failed to send booking reminder email:', error)
      await this.logEmail('APPOINTMENT_REMINDER', data.customerEmail, 'Failed to send', 'FAILED')
      return false
    }
  }

  // Send booking cancellation email
  async sendBookingCancellation(data: BookingCancellationData): Promise<boolean> {
    try {
      const template = this.getTemplate('bookingCancellation', data.language)

      const templateData = {
        customerName: data.customerName,
        bookingNumber: data.bookingNumber,
        carInfo: data.carInfo,
        reason: data.reason || ''
      }

      const subject = this.replaceVariables(template.subject, templateData)
      const html = this.replaceVariables(template.html, templateData)
      const text = this.replaceVariables(template.text, templateData)

      await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.customerEmail,
        subject,
        html,
        text
      })

      await this.logEmail('BOOKING_CANCELLATION', data.customerEmail, subject, 'SENT')
      return true
    } catch (error) {
      console.error('Failed to send booking cancellation email:', error)
      await this.logEmail('BOOKING_CANCELLATION', data.customerEmail, 'Failed to send', 'FAILED')
      return false
    }
  }

  // Log email for tracking
  private async logEmail(type: string, recipient: string, subject: string, status: string): Promise<void> {
    try {
      // This would normally log to database or external service
      console.log(`Email ${status}: ${type} to ${recipient} - ${subject}`)
    } catch (error) {
      console.error('Failed to log email:', error)
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export types
export type {
  BookingConfirmationData,
  PaymentConfirmationData,
  BookingReminderData,
  BookingCancellationData
}
