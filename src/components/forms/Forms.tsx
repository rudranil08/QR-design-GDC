import React from 'react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="section-label">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1a5 5 0 110 10A5 5 0 016 1zm0 3a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 006 4zm0 5.5a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-zinc-400 dark:text-zinc-600">{hint}</p>
      )}
    </div>
  )
}

// ─── URL ──────────────────────────────────────────────────
import type { URLFormValues, TextFormValues, EmailFormValues, PhoneFormValues, WiFiFormValues, WifiEncryption, FormErrors } from '../../types'

export function URLForm({ values, errors, onChange }: { values: URLFormValues; errors: FormErrors; onChange: (v: URLFormValues) => void }) {
  return (
    <Field label="URL" error={errors.url} hint="Include the full address with https://">
      <input
        type="url"
        className={`field-input ${errors.url ? 'field-input-error' : ''}`}
        placeholder="https://example.com"
        value={values.url}
        onChange={e => onChange({ url: e.target.value })}
        autoFocus
      />
    </Field>
  )
}

// ─── TEXT ─────────────────────────────────────────────────
export function TextForm({ values, errors, onChange }: { values: TextFormValues; errors: FormErrors; onChange: (v: TextFormValues) => void }) {
  const remaining = 2000 - values.text.length
  return (
    <Field label="Content" error={errors.text} hint={`${remaining} characters remaining`}>
      <textarea
        className={`field-input min-h-[96px] resize-none ${errors.text ? 'field-input-error' : ''}`}
        placeholder="Any text you want to encode…"
        value={values.text}
        onChange={e => onChange({ text: e.target.value })}
        autoFocus
      />
    </Field>
  )
}

// ─── EMAIL ────────────────────────────────────────────────
export function EmailForm({ values, errors, onChange }: { values: EmailFormValues; errors: FormErrors; onChange: (v: EmailFormValues) => void }) {
  const u = <K extends keyof EmailFormValues>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...values, [k]: e.target.value })
  return (
    <div className="space-y-3">
      <Field label="To" error={errors.to}>
        <input type="email" className={`field-input ${errors.to ? 'field-input-error' : ''}`}
          placeholder="recipient@example.com" value={values.to} onChange={u('to')} autoFocus />
      </Field>
      <Field label="Subject" error={errors.subject}>
        <input type="text" className={`field-input ${errors.subject ? 'field-input-error' : ''}`}
          placeholder="Optional subject" value={values.subject} onChange={u('subject')} />
      </Field>
      <Field label="Body">
        <textarea className="field-input resize-none min-h-[72px]"
          placeholder="Optional message" value={values.body} onChange={u('body')} />
      </Field>
    </div>
  )
}

// ─── PHONE ────────────────────────────────────────────────
export function PhoneForm({ values, errors, onChange }: { values: PhoneFormValues; errors: FormErrors; onChange: (v: PhoneFormValues) => void }) {
  return (
    <Field label="Phone number" error={errors.phone} hint="Include country code, e.g. +1 234 567 8900">
      <input type="tel" className={`field-input ${errors.phone ? 'field-input-error' : ''}`}
        placeholder="+1 234 567 8900" value={values.phone}
        onChange={e => onChange({ phone: e.target.value })} autoFocus />
    </Field>
  )
}

// ─── WIFI ─────────────────────────────────────────────────
const ENCRYPTIONS: { value: WifiEncryption; label: string }[] = [
  { value: 'WPA', label: 'WPA / WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'Open network' },
]

export function WiFiForm({ values, errors, onChange }: { values: WiFiFormValues; errors: FormErrors; onChange: (v: WiFiFormValues) => void }) {
  const u = <K extends keyof WiFiFormValues>(k: K, v: WiFiFormValues[K]) => onChange({ ...values, [k]: v })
  return (
    <div className="space-y-3">
      <Field label="Network name (SSID)" error={errors.ssid}>
        <input type="text" className={`field-input ${errors.ssid ? 'field-input-error' : ''}`}
          placeholder="MyHomeNetwork" value={values.ssid}
          onChange={e => u('ssid', e.target.value)} autoFocus />
      </Field>

      <Field label="Security">
        <select className="field-input" value={values.encryption}
          onChange={e => u('encryption', e.target.value as WifiEncryption)}>
          {ENCRYPTIONS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </Field>

      {values.encryption !== 'nopass' && (
        <Field label="Password">
          <input type="text" className="field-input" placeholder="Network password"
            value={values.password} onChange={e => u('password', e.target.value)} />
          <p className="text-[11px] text-amber-500/80 dark:text-amber-400/70 mt-1">
            Password is encoded in the QR — share with care.
          </p>
        </Field>
      )}

      <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
        <button
          type="button"
          role="switch"
          aria-checked={values.hidden}
          onClick={() => u('hidden', !values.hidden)}
          className="toggle"
        >
          <div className={`toggle-track ${values.hidden ? 'toggle-track-on' : ''}`} />
          <div className={`toggle-thumb ${values.hidden ? 'toggle-thumb-on' : ''}`} />
        </button>
        <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
          Hidden network
        </span>
      </label>
    </div>
  )
}
