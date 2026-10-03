import type { FormValues } from '../types'

/**
 * Sanitizes strings by removing unprintable/malicious control characters.
 */
function sanitizeControlChars(str: string): string {
  // Remove ASCII control characters except standard whitespace/newlines
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Builds and encodes a safe QR code content string from form values.
 * Prevents protocol injections and ensures standards-compliant escaping.
 */
export function buildQRContent(formData: FormValues): string {
  switch (formData.type) {
    case 'url': {
      const url = sanitizeControlChars(formData.values.url.trim())
      // Extra sanity check against dangerous protocols
      if (/^(javascript|vbscript|data|file):/i.test(url)) {
        return ''
      }
      return url
    }

    case 'text':
      return sanitizeControlChars(formData.values.text.trim())

    case 'email': {
      const to = sanitizeControlChars(formData.values.to.trim())
      // Prevent header injection in subject/body by sanitizing CRLF
      const subject = sanitizeControlChars(formData.values.subject.trim()).replace(/[\r\n]+/g, ' ')
      const body = sanitizeControlChars(formData.values.body.trim())

      const params = new URLSearchParams()
      if (subject) params.set('subject', subject)
      if (body) params.set('body', body)

      // RFC 6068: spaces in mailto queries should be %20 rather than '+'
      const qs = params.toString().replace(/\+/g, '%20')
      // RFC 6068: the "to" address in mailto: must NOT be percent-encoded —
      // encodeURIComponent would encode '@' as '%40', breaking most mail clients.
      return `mailto:${to}${qs ? `?${qs}` : ''}`
    }

    case 'phone': {
      // Remove any non-standard telecom characters
      const phone = sanitizeControlChars(formData.values.phone.trim()).replace(/[^\d+()\-.\s]/g, '')
      return `tel:${phone}`
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = formData.values
      // Escape Wi-Fi standard special characters: \, ;, ,, :, "
      const escapeWifiString = (s: string) =>
        sanitizeControlChars(s).replace(/([\\";,:])/g, '\\$1')

      const safeEnc = ['WPA', 'WEP', 'nopass'].includes(encryption) ? encryption : 'WPA'
      const safeSsid = escapeWifiString(ssid.trim())
      // Open networks must have empty password parameter
      const safePassword = safeEnc === 'nopass' ? '' : escapeWifiString(password)

      return `WIFI:T:${safeEnc};S:${safeSsid};P:${safePassword};H:${hidden ? 'true' : 'false'};;`
    }
  }
}
