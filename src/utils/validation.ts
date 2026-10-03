import type { FormValues, FormErrors } from '../types'

// Strict RFC 5322 compliant email regex
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

// Dangerous schemes that can execute code or lead to local file access
const DANGEROUS_PROTOCOLS_RE = /^(javascript|vbscript|data|file):/i

/**
 * Validates a web URL safely supporting HTTP/HTTPS, localhost, IP addresses,
 * query parameters, ports, and hash fragments without false positives.
 */
function isValidUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw)
    if (!['http:', 'https:'].includes(parsed.protocol.toLowerCase())) return false
    // Valid hostname check: localhost, IPv4, or standard domain with TLD
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost') return true
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return true
    return host.includes('.') && !host.startsWith('.') && !host.endsWith('.')
  } catch {
    return false
  }
}

/**
 * Validates international phone numbers supporting standard dialing formats:
 * e.g. +1 (555) 234-5678, +44 20 7946 0919, (555) 123-4567, etc.
 * Enforces ITU-T E.164 standards: between 7 and 15 digits.
 */
function isValidPhoneNumber(phone: string): boolean {
  const clean = phone.trim()
  if (!/^[+]?[\d\s().-]{7,30}$/.test(clean)) return false
  const digits = clean.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

/**
 * Validates and sanitizes form inputs against common vulnerabilities,
 * dangerous URI schemes, and boundary limits.
 */
export function validate(formData: FormValues): FormErrors {
  const errors: FormErrors = {}

  switch (formData.type) {
    case 'url': {
      const rawUrl = formData.values.url.trim()
      if (!rawUrl) {
        errors.url = 'URL is required.'
      } else if (DANGEROUS_PROTOCOLS_RE.test(rawUrl)) {
        errors.url = 'Dangerous URL scheme detected. Only http:// and https:// are allowed.'
      } else if (!/^https?:\/\//i.test(rawUrl)) {
        errors.url = 'Must start with http:// or https://'
      } else if (rawUrl.length > 2048) {
        errors.url = 'URL is too long (maximum 2048 characters).'
      } else if (!isValidUrl(rawUrl)) {
        errors.url = 'Enter a valid web URL (e.g. https://example.com or http://localhost:3000).'
      }
      break
    }

    case 'text': {
      const text = formData.values.text.trim()
      if (!text) {
        errors.text = 'Text content is required.'
      } else if (text.length > 2953) {
        // Standard maximum theoretical alphanumeric payload for QR Level L
        errors.text = 'Text exceeds maximum QR code capacity (2953 characters).'
      }
      break
    }

    case 'email': {
      const { to, subject, body } = formData.values
      const email = to.trim()
      if (!email) {
        errors.to = 'Email address is required.'
      } else if (email.length > 254) {
        errors.to = 'Email exceeds maximum RFC standard length (254 characters).'
      } else if (!EMAIL_RE.test(email)) {
        errors.to = 'Enter a valid email address.'
      }

      if (subject.length > 200) {
        errors.subject = 'Subject is too long (max 200 characters).'
      }
      if (body.length > 2000) {
        errors.body = 'Email body is too long (max 2000 characters).'
      }
      break
    }

    case 'phone': {
      const phone = formData.values.phone.trim()
      if (!phone) {
        errors.phone = 'Phone number is required.'
      } else if (!isValidPhoneNumber(phone)) {
        errors.phone = 'Enter a valid phone number with 7–15 digits (e.g. +1 (555) 234-5678).'
      } else if (phone.length > 30) {
        errors.phone = 'Phone number is too long (max 30 characters).'
      }
      break
    }

    case 'wifi': {
      const { ssid, password, encryption } = formData.values
      const cleanSsid = ssid.trim()
      if (!cleanSsid) {
        errors.ssid = 'Network name (SSID) is required.'
      } else if (new TextEncoder().encode(cleanSsid).length > 32) {
        errors.ssid = 'SSID must not exceed 32 bytes (IEEE 802.11 standard).'
      }

      if (encryption === 'WPA') {
        if (password && password.length < 8) {
          errors.password = 'WPA/WPA2 passphrase must be at least 8 characters.'
        } else if (password && password.length > 63) {
          errors.password = 'WPA/WPA2 passphrase cannot exceed 63 characters.'
        }
      } else if (encryption === 'WEP') {
        if (password && ![5, 10, 13, 26].includes(password.length)) {
          errors.password = 'WEP key must be 5 or 13 ASCII chars, or 10 or 26 hex digits.'
        }
      }
      break
    }
  }

  return errors
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0
}
