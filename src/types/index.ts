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
  fgColor: string
  bgColor: string
  ecLevel: ECLevel
  margin: number
}

export const PRESETS: Preset[] = [
  { id: 'classic', name: 'Classic',  fgColor: '#000000', bgColor: '#ffffff', ecLevel: 'M', margin: 4 },
  { id: 'ocean',   name: 'Ocean',    fgColor: '#0369A1', bgColor: '#E0F2FE', ecLevel: 'Q', margin: 4 },
  { id: 'forest',  name: 'Forest',   fgColor: '#15803D', bgColor: '#DCFCE7', ecLevel: 'M', margin: 4 },
  { id: 'sunset',  name: 'Sunset',   fgColor: '#C2410C', bgColor: '#FEF3C7', ecLevel: 'M', margin: 4 },
  { id: 'night',   name: 'Night',    fgColor: '#818CF8', bgColor: '#1E1B4B', ecLevel: 'Q', margin: 4 },
  { id: 'rose',    name: 'Rose',     fgColor: '#BE185D', bgColor: '#FDF2F8', ecLevel: 'M', margin: 4 },
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
