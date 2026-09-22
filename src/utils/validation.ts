import type { FormValues, FormErrors } from '../types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https?:\/\/.+/i
const PHONE_RE = /^[+\d][\d\s\-().]{3,}$/

export function validate(formData: FormValues): FormErrors {
  const errors: FormErrors = {}

  switch (formData.type) {
    case 'url': {
      const { url } = formData.values
      if (!url.trim()) {
        errors.url = 'URL is required.'
      } else if (!URL_RE.test(url.trim())) {
        errors.url = 'Must start with http:// or https://'
      }
      break
    }

    case 'text': {
      if (!formData.values.text.trim()) {
        errors.text = 'Text content is required.'
      } else if (formData.values.text.trim().length > 2000) {
        errors.text = 'Text is too long (max 2000 characters).'
      }
      break
    }

    case 'email': {
      const { to, subject } = formData.values
      if (!to.trim()) {
        errors.to = 'Email address is required.'
      } else if (!EMAIL_RE.test(to.trim())) {
        errors.to = 'Enter a valid email address.'
      }
      if (subject.trim().length > 200) {
        errors.subject = 'Subject is too long (max 200 characters).'
      }
      break
    }

    case 'phone': {
      const { phone } = formData.values
      if (!phone.trim()) {
        errors.phone = 'Phone number is required.'
      } else if (!PHONE_RE.test(phone.trim())) {
        errors.phone = 'Enter a valid phone number (digits, spaces, +, -, parentheses).'
      }
      break
    }

    case 'wifi': {
      const { ssid } = formData.values
      if (!ssid.trim()) {
        errors.ssid = 'Network name (SSID) is required.'
      } else if (ssid.trim().length > 32) {
        errors.ssid = 'SSID must be 32 characters or less.'
      }
      break
    }
  }

  return errors
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0
}
