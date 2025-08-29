import nodemailer from 'nodemailer'
import { env, features } from './env'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

let transporter: nodemailer.Transporter | null = null

function createTransporter() {
  if (!features.emailNotifications) {
    throw new Error('Email notifications are not configured. Please check your SMTP settings.')
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false,
    },
  })
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    if (!features.emailNotifications) {
      console.log('Email notifications disabled - would send:', { to, subject })
      return { success: false, error: 'Email not configured' }
    }

    if (!transporter) {
      transporter = createTransporter()
    }

    const mailOptions = {
      from: env.EMAIL_FROM || env.SMTP_USER,
      to,
      subject,
      text,
      html,
    }

    const result = await transporter!.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: 'Réinitialisation de votre mot de passe - Visite Sri3a',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 28px;">${env.NEXT_PUBLIC_APP_NAME}</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Service de visite technique</p>
          </div>

          <h2 style="color: #1f2937; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>

          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Bonjour,
          </p>

          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Visite Sri3a.
          </p>

          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}"
               style="background-color: #3b82f6; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: 600; font-size: 16px;">
              Réinitialiser mon mot de passe
            </a>
          </div>

          <div style="background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 30px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ <strong>Important :</strong> Ce lien expirera dans 1 heure pour votre sécurité.
            </p>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            Votre mot de passe actuel restera inchangé.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
          </p>
          <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin-bottom: 30px;">
            ${resetUrl}
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
            Cordialement,<br>
            L'équipe ${env.NEXT_PUBLIC_APP_NAME}
          </p>
        </div>
      </div>
    `,
    text: `
Réinitialisation de mot de passe - ${env.NEXT_PUBLIC_APP_NAME}

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Visite Sri3a.

Cliquez sur le lien suivant pour créer un nouveau mot de passe :
${resetUrl}

⚠️ Important : Ce lien expirera dans 1 heure pour votre sécurité.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe ${env.NEXT_PUBLIC_APP_NAME}
    `
  })
}

export async function sendBookingConfirmationEmail(
  email: string,
  bookingDetails: {
    bookingNumber: string
    centerName: string
    date: string
    time: string
    carInfo: string
  }
) {
  return sendEmail({
    to: email,
    subject: `Confirmation de réservation #${bookingDetails.bookingNumber} - Visite Sri3a`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Confirmation de réservation</h2>
        <p>Votre réservation a été confirmée avec succès.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Détails de la réservation</h3>
          <p><strong>Numéro :</strong> ${bookingDetails.bookingNumber}</p>
          <p><strong>Centre :</strong> ${bookingDetails.centerName}</p>
          <p><strong>Date :</strong> ${bookingDetails.date}</p>
          <p><strong>Heure :</strong> ${bookingDetails.time}</p>
          <p><strong>Véhicule :</strong> ${bookingDetails.carInfo}</p>
        </div>
        <p>Merci de choisir Visite Sri3a pour votre visite technique.</p>
      </div>
    `
  })
}
