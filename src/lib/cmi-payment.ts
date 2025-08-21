import crypto from 'crypto'

// CMI Payment Gateway Configuration
interface CMIConfig {
  merchantId: string
  gatewayUrl: string
  secretKey: string
  okUrl: string
  failUrl: string
  shopUrl: string
  encoding: string
  currency: string
}

interface CMIPaymentData {
  amount: number
  orderId: string
  customerEmail: string
  customerName?: string
  customerPhone?: string
  language?: string
  description?: string
}

interface CMIPaymentResponse {
  orderId: string
  amount: string
  currency: string
  responseCode: string
  responseMessage: string
  tranId: string
  authCode?: string
  procReturnCode?: string
  mdStatus?: string
  hash?: string
}

class CMIPaymentGateway {
  private config: CMIConfig

  constructor() {
    this.config = {
      merchantId: process.env.CMI_MERCHANT_ID || '',
      gatewayUrl: process.env.CMI_GATEWAY_URL || 'https://testpayment.cmi.co.ma/fim/api',
      secretKey: process.env.CMI_SECRET_KEY || '',
      okUrl: process.env.CMI_OK_URL || `${process.env.NEXTAUTH_URL}/api/payments/cmi/callback`,
      failUrl: process.env.CMI_FAIL_URL || `${process.env.NEXTAUTH_URL}/api/payments/cmi/callback`,
      shopUrl: process.env.CMI_SHOP_URL || process.env.NEXTAUTH_URL || '',
      encoding: 'UTF-8',
      currency: '504' // MAD currency code
    }
  }

  // Generate CMI hash for security
  private generateHash(data: Record<string, string>): string {
    // Sort parameters alphabetically and concatenate with pipe separator
    const sortedKeys = Object.keys(data).sort()
    const hashString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('|') + `|${this.config.secretKey}`

    return crypto.createHash('sha512').update(hashString, 'utf8').digest('base64')
  }

  // Prepare payment request data
  preparePaymentRequest(paymentData: CMIPaymentData): Record<string, string> {
    const requestData = {
      clientid: this.config.merchantId,
      amount: (paymentData.amount * 100).toString(), // Convert to cents
      oid: paymentData.orderId,
      okUrl: this.config.okUrl,
      failUrl: this.config.failUrl,
      shopurl: this.config.shopUrl,
      currency: this.config.currency,
      lang: paymentData.language || 'fr',
      encoding: this.config.encoding,
      email: paymentData.customerEmail,
      BillToName: paymentData.customerName || '',
      tel: paymentData.customerPhone || '',
      storetype: '3D_PAY_HOSTING',
      hashAlgorithm: 'ver3',
      refreshtime: '5', // 5 minutes
      AutoRedirect: '1'
    }

    // Add description if provided
    if (paymentData.description) {
      requestData['trantype'] = 'Auth'
      requestData['instalment'] = ''
      requestData['description'] = paymentData.description
    }

    // Generate and add hash
    requestData['HASH'] = this.generateHash(requestData)

    return requestData
  }

  // Get payment form HTML
  getPaymentFormHTML(paymentData: CMIPaymentData): string {
    const requestData = this.preparePaymentRequest(paymentData)

    const formFields = Object.entries(requestData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Redirection vers CMI...</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h2>Redirection vers le paiement sécurisé...</h2>
        <div class="loader"></div>
        <p>Veuillez patienter, vous allez être redirigé automatiquement.</p>
        <form id="cmiForm" action="${this.config.gatewayUrl}" method="POST">
          ${formFields}
        </form>
        <script>
          // Auto-submit form
          document.getElementById('cmiForm').submit();
        </script>
      </body>
      </html>
    `
  }

  // Verify callback hash
  verifyCallbackHash(callbackData: Record<string, string>): boolean {
    const receivedHash = callbackData.HASH || callbackData.hash
    delete callbackData.HASH
    delete callbackData.hash

    const calculatedHash = this.generateHash(callbackData)
    return receivedHash === calculatedHash
  }

  // Parse CMI callback response
  parseCallbackResponse(callbackData: Record<string, string>): CMIPaymentResponse {
    return {
      orderId: callbackData.oid || '',
      amount: callbackData.amount || '',
      currency: callbackData.currency || '',
      responseCode: callbackData.Response || '',
      responseMessage: callbackData.mdErrorMsg || callbackData.ErrMsg || '',
      tranId: callbackData.TransId || callbackData.xid || '',
      authCode: callbackData.AuthCode,
      procReturnCode: callbackData.ProcReturnCode,
      mdStatus: callbackData.mdStatus,
      hash: callbackData.HASH || callbackData.hash
    }
  }

  // Check if payment was successful
  isPaymentSuccessful(response: CMIPaymentResponse): boolean {
    // CMI success codes can vary, but typically "Approved" or "00" indicates success
    const successCodes = ['Approved', '00', '0']
    return successCodes.includes(response.responseCode) &&
           (response.mdStatus === '1' || response.mdStatus === '2' || response.mdStatus === '3' || response.mdStatus === '4')
  }

  // Get payment status message
  getPaymentStatusMessage(response: CMIPaymentResponse): string {
    if (this.isPaymentSuccessful(response)) {
      return 'Paiement effectué avec succès'
    }

    // Common CMI error codes and messages
    const errorMessages: Record<string, string> = {
      '01': 'Carte refusée par la banque',
      '02': 'Contactez votre banque',
      '03': 'Marchand invalide',
      '04': 'Confisquer la carte',
      '05': 'Transaction refusée',
      '06': 'Erreur générale',
      '07': 'Confisquer la carte (conditions spéciales)',
      '12': 'Transaction invalide',
      '13': 'Montant invalide',
      '14': 'Numéro de carte invalide',
      '15': 'Banque émettrice inconnue',
      '17': 'Annulation par le client',
      '19': 'Répéter la transaction',
      '20': 'Réponse invalide',
      '21': 'Aucune action entreprise',
      '25': 'Enregistrement de transaction introuvable',
      '28': 'Fichier temporairement indisponible',
      '30': 'Erreur de format de message',
      '41': 'Carte perdue - confisquer',
      '43': 'Carte volée - confisquer',
      '51': 'Fonds insuffisants',
      '54': 'Carte expirée',
      '57': 'Transaction non autorisée pour ce porteur',
      '58': 'Transaction non autorisée pour ce terminal',
      '61': 'Limite de montant dépassée',
      '62': 'Carte restreinte',
      '65': 'Limite de fréquence dépassée',
      '75': 'Tentatives de saisie du PIN dépassées',
      '76': 'Compte déjà lettré',
      '77': 'Référence du porteur incorrecte',
      '78': 'Compte bloqué (premier usage)',
      '81': 'Problème cryptographique',
      '82': 'CVV incorrect',
      '83': 'PIN incorrect',
      '84': 'Echec de l\'authentification',
      '85': 'Pas de raison de refus',
      '91': 'Système émetteur indisponible',
      '92': 'Type de transaction invalide',
      '96': 'Dysfonctionnement système',
      '99': 'Erreur de configuration'
    }

    return errorMessages[response.responseCode] ||
           response.responseMessage ||
           'Erreur de paiement inconnue'
  }

  // Get configuration for environment check
  getConfig(): Partial<CMIConfig> {
    return {
      merchantId: this.config.merchantId,
      gatewayUrl: this.config.gatewayUrl,
      currency: this.config.currency
    }
  }

  // Validate configuration
  isConfigured(): boolean {
    return !!(this.config.merchantId && this.config.secretKey && this.config.gatewayUrl)
  }
}

// Export singleton instance
export const cmiPayment = new CMIPaymentGateway()

// Export types
export type { CMIPaymentData, CMIPaymentResponse, CMIConfig }
