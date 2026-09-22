import type { FormValues } from '../types'

/**
 * Builds the QR code content string from form values.
 */
export function buildQRContent(formData: FormValues): string {
  switch (formData.type) {
    case 'url':
      return formData.values.url.trim()

    case 'text':
      return formData.values.text.trim()

    case 'email': {
      const { to, subject, body } = formData.values
      const params = new URLSearchParams()
      if (subject.trim()) params.set('subject', subject.trim())
      if (body.trim()) params.set('body', body.trim())
      const qs = params.toString()
      return `mailto:${to.trim()}${qs ? `?${qs}` : ''}`
    }

    case 'phone':
      return `tel:${formData.values.phone.trim()}`

    case 'wifi': {
      const { ssid, password, encryption, hidden } = formData.values
      // Escape special chars in SSID/password
      const escape = (s: string) =>
        s.replace(/([\\";,:])/g, '\\$1')
      return `WIFI:T:${encryption};S:${escape(ssid)};P:${escape(password)};H:${hidden ? 'true' : 'false'};;`
    }
  }
}
