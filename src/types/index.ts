// ─── QR Types ──────────────────────────────────────────────────────────────

export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi'

export const QR_TYPES: { id: QRType; label: string; icon: string }[] = [
  { id: 'url',   label: 'URL',        icon: '🔗' },
  { id: 'text',  label: 'Text',       icon: '📝' },
  { id: 'email', label: 'Email',      icon: '✉️' },
  { id: 'phone', label: 'Phone',      icon: '📞' },
  { id: 'wifi',  label: 'Wi-Fi',      icon: '📶' },
]

// ─── Form Values ───────────────────────────────────────────────────────────

export interface URLFormValues {
  url: string
}

export interface TextFormValues {
  text: string
}

export interface EmailFormValues {
  to: string
  subject: string
  body: string
}

export interface PhoneFormValues {
  phone: string
}

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass'

export interface WiFiFormValues {
  ssid: string
  password: string
  encryption: WifiEncryption
  hidden: boolean
}

export type FormValues =
  | { type: 'url';   values: URLFormValues }
  | { type: 'text';  values: TextFormValues }
  | { type: 'email'; values: EmailFormValues }
  | { type: 'phone'; values: PhoneFormValues }
  | { type: 'wifi';  values: WiFiFormValues }

// ─── QR Options ────────────────────────────────────────────────────────────

export type ECLevel = 'L' | 'M' | 'Q' | 'H'

export interface QROptions {
  size: number          // px
  fgColor: string       // hex
  bgColor: string       // hex
  bgTransparent: boolean
  ecLevel: ECLevel
  margin: number        // modules
  logoFile: File | null
  logoSize: number      // percent of QR size (10–40)
}

export const DEFAULT_QR_OPTIONS: QROptions = {
  size: 300,
  fgColor: '#000000',
  bgColor: '#ffffff',
  bgTransparent: false,
  ecLevel: 'M',
  margin: 4,
  logoFile: null,
  logoSize: 25,
}

// ─── Presets ───────────────────────────────────────────────────────────────

export interface Preset {
  id: string
  name: string
  category?: string
  fgColor: string
  bgColor: string
  ecLevel: ECLevel
  margin: number
}

export const PRESETS: Preset[] = [
  { id: 'classic', name: 'Classic Monochrome', fgColor: '#09090b', bgColor: '#ffffff', ecLevel: 'M', margin: 4 },
  { id: 'slate',   name: 'Slate & Minimal',    fgColor: '#1e293b', bgColor: '#f8fafc', ecLevel: 'M', margin: 4 },
  { id: 'midnight',name: 'Midnight OLED',      fgColor: '#f8fafc', bgColor: '#09090b', ecLevel: 'Q', margin: 4 },
  { id: 'ocean',   name: 'Deep Pacific',       fgColor: '#0369a1', bgColor: '#f0f9ff', ecLevel: 'Q', margin: 4 },
  { id: 'emerald', name: 'Emerald Mint',       fgColor: '#047857', bgColor: '#ecfdf5', ecLevel: 'M', margin: 4 },
  { id: 'sunset',  name: 'Warm Sunset',        fgColor: '#c2410c', bgColor: '#fffbeb', ecLevel: 'M', margin: 4 },
  { id: 'rose',    name: 'Rose Quartz',        fgColor: '#be185d', bgColor: '#fdf2f8', ecLevel: 'M', margin: 4 },
  { id: 'cobalt',  name: 'Royal Cobalt',       fgColor: '#1d4ed8', bgColor: '#eff6ff', ecLevel: 'Q', margin: 4 },
]

// ─── Recent Entry ──────────────────────────────────────────────────────────

export interface RecentEntry {
  id: string
  createdAt: number
  formData: FormValues
  options: Omit<QROptions, 'logoFile'>  // can't persist File objects
  thumbnail: string   // data URL (small preview)
  content: string     // QR string
}

// ─── Validation Errors ─────────────────────────────────────────────────────

export type FormErrors = Record<string, string>
