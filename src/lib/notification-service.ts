import { emailService, type BookingConfirmationData, type PaymentConfirmationData, type BookingReminderData, type BookingCancellationData } from './email-service'
import { smsService, type BookingConfirmationSMSData, type PaymentConfirmationSMSData, type BookingReminderSMSData, type BookingCancellationSMSData } from './sms-service'
import { prisma } from './prisma'
import { features } from './env'

interface NotificationData {
  bookingNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  carInfo: string
  centerName: string
  centerAddress: string
  date: string
  time: string
  amount: number
  language: string
  transactionId?: string
  reason?: string
}

interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  reminderNotifications: boolean
}

class NotificationService {
  // Get user notification preferences
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      // This would normally fetch from user preferences table
      // For now, return default preferences
      return {
        emailNotifications: true,
        smsNotifications: true,
        reminderNotifications: true
      }
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      // Return defaults on error
      return {
        emailNotifications: true,
        smsNotifications: false,
        reminderNotifications: true
      }
    }
  }

  // Log notification to database
  private async logNotification(
    bookingId: string,
    type: string,
    channel: string,
    recipient: string,
    subject: string,
    message: string,
    status: string
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          bookingId,
          type: type as any, // Cast to enum
          channel,
          recipient,
          subject,
          message,
          status,
          sentAt: status === 'SENT' ? new Date() : null
        }
      })
    } catch (error) {
      console.error('Failed to log notification:', error)
    }
  }

  // Send booking confirmation notifications
  async sendBookingConfirmation(data: NotificationData, userId: string): Promise<{ email: boolean; sms: boolean }> {
    const preferences = await getUserPreferences(userId)
    const results = { email: false, sms: false }

    // Send email notification
    if (preferences.emailNotifications && features.emailNotifications) {
      try {
        const emailData: BookingConfirmationData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          carInfo: data.carInfo,
          centerName: data.centerName,
          centerAddress: data.centerAddress,
          date: data.date,
          time: data.time,
          amount: data.amount,
          language: data.language
        }

        results.email = await emailService.sendBookingConfirmation(emailData)

        // Log notification
        await this.logNotification(
          '', // bookingId will be provided by caller
          'BOOKING_CONFIRMATION',
          'EMAIL',
          data.customerEmail,
          'Booking Confirmation',
          `Booking confirmed for ${data.carInfo}`,
          results.email ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send booking confirmation email:', error)
      }
    }

    // Send SMS notification
    if (preferences.smsNotifications && features.smsNotifications && data.customerPhone) {
      try {
        const smsData: BookingConfirmationSMSData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          phoneNumber: data.customerPhone,
          carInfo: data.carInfo,
          centerName: data.centerName,
          date: data.date,
          time: data.time,
          amount: data.amount,
          language: data.language
        }

        results.sms = await smsService.sendBookingConfirmation(smsData)

        // Log notification
        await this.logNotification(
          '', // bookingId will be provided by caller
          'BOOKING_CONFIRMATION',
          'SMS',
          data.customerPhone,
          '',
          `Booking confirmed for ${data.carInfo}`,
          results.sms ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send booking confirmation SMS:', error)
      }
    }

    return results
  }

  // Send payment confirmation notifications
  async sendPaymentConfirmation(data: NotificationData, userId: string): Promise<{ email: boolean; sms: boolean }> {
    const preferences = await getUserPreferences(userId)
    const results = { email: false, sms: false }

    // Send email notification
    if (preferences.emailNotifications && features.emailNotifications && data.transactionId) {
      try {
        const emailData: PaymentConfirmationData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          amount: data.amount,
          transactionId: data.transactionId,
          language: data.language
        }

        results.email = await emailService.sendPaymentConfirmation(emailData)

        // Log notification
        await this.logNotification(
          '',
          'PAYMENT_CONFIRMATION',
          'EMAIL',
          data.customerEmail,
          'Payment Confirmation',
          `Payment confirmed for booking ${data.bookingNumber}`,
          results.email ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send payment confirmation email:', error)
      }
    }

    // Send SMS notification
    if (preferences.smsNotifications && features.smsNotifications && data.customerPhone && data.transactionId) {
      try {
        const smsData: PaymentConfirmationSMSData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          phoneNumber: data.customerPhone,
          amount: data.amount,
          transactionId: data.transactionId,
          language: data.language
        }

        results.sms = await smsService.sendPaymentConfirmation(smsData)

        // Log notification
        await this.logNotification(
          '',
          'PAYMENT_CONFIRMATION',
          'SMS',
          data.customerPhone,
          '',
          `Payment confirmed for booking ${data.bookingNumber}`,
          results.sms ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send payment confirmation SMS:', error)
      }
    }

    return results
  }

  // Send booking reminder notifications
  async sendBookingReminder(data: NotificationData, userId: string): Promise<{ email: boolean; sms: boolean }> {
    const preferences = await getUserPreferences(userId)
    const results = { email: false, sms: false }

    if (!preferences.reminderNotifications) {
      return results
    }

    // Send email notification
    if (preferences.emailNotifications && features.emailNotifications) {
      try {
        const emailData: BookingReminderData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          carInfo: data.carInfo,
          centerName: data.centerName,
          centerAddress: data.centerAddress,
          date: data.date,
          time: data.time,
          language: data.language
        }

        results.email = await emailService.sendBookingReminder(emailData)

        // Log notification
        await this.logNotification(
          '',
          'APPOINTMENT_REMINDER',
          'EMAIL',
          data.customerEmail,
          'Appointment Reminder',
          `Reminder for appointment ${data.bookingNumber}`,
          results.email ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send booking reminder email:', error)
      }
    }

    // Send SMS notification
    if (preferences.smsNotifications && features.smsNotifications && data.customerPhone) {
      try {
        const smsData: BookingReminderSMSData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          phoneNumber: data.customerPhone,
          carInfo: data.carInfo,
          centerName: data.centerName,
          date: data.date,
          time: data.time,
          language: data.language
        }

        results.sms = await smsService.sendBookingReminder(smsData)

        // Log notification
        await this.logNotification(
          '',
          'APPOINTMENT_REMINDER',
          'SMS',
          data.customerPhone,
          '',
          `Reminder for appointment ${data.bookingNumber}`,
          results.sms ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send booking reminder SMS:', error)
      }
    }

    return results
  }

  // Send booking cancellation notifications
  async sendBookingCancellation(data: NotificationData, userId: string): Promise<{ email: boolean; sms: boolean }> {
    const preferences = await getUserPreferences(userId)
    const results = { email: false, sms: false }

    // Send email notification
    if (preferences.emailNotifications && features.emailNotifications) {
      try {
        const emailData: BookingCancellationData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          carInfo: data.carInfo,
          reason: data.reason,
          language: data.language
        }

        results.email = await emailService.sendBookingCancellation(emailData)

        // Log notification
        await this.logNotification(
          '',
          'BOOKING_CANCELLATION',
          'EMAIL',
          data.customerEmail,
          'Booking Cancellation',
          `Booking ${data.bookingNumber} cancelled`,
          results.email ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send booking cancellation email:', error)
      }
    }

    // Send SMS notification
    if (preferences.smsNotifications && features.smsNotifications && data.customerPhone) {
      try {
        const smsData: BookingCancellationSMSData = {
          bookingNumber: data.bookingNumber,
          customerName: data.customerName,
          phoneNumber: data.customerPhone,
          carInfo: data.carInfo,
          reason: data.reason,
          language: data.language
        }

        results.sms = await smsService.sendBookingCancellation(smsData)

        // Log notification
        await this.logNotification(
          '',
          'BOOKING_CANCELLATION',
          'SMS',
          data.customerPhone,
          '',
          `Booking ${data.bookingNumber} cancelled`,
          results.sms ? 'SENT' : 'FAILED'
        )
      } catch (error) {
        console.error('Failed to send booking cancellation SMS:', error)
      }
    }

    return results
  }

  // Test SMS configuration
  async testSMSConnection(): Promise<boolean> {
    return smsService.testConnection()
  }

  // Check if SMS is enabled
  isSMSEnabled(): boolean {
    return smsService.isEnabled() && features.smsNotifications
  }
}

// Helper function to get user preferences (extracted for reuse)
async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    // This would normally fetch from user preferences table
    // For now, return default preferences
    return {
      emailNotifications: true,
      smsNotifications: true,
      reminderNotifications: true
    }
  } catch (error) {
    console.error('Failed to get user preferences:', error)
    // Return defaults on error
    return {
      emailNotifications: true,
      smsNotifications: false,
      reminderNotifications: true
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export types
export type {
  NotificationData,
  UserPreferences
}
