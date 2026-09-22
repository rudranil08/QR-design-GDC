import React, { useState, useCallback, useMemo } from 'react'
import { useTheme } from './hooks/useTheme'
import { useRecent } from './hooks/useRecent'
import { QRTypeSelector } from './components/QRTypeSelector'
import { URLForm } from './components/forms/URLForm'
import { TextForm } from './components/forms/TextForm'
import { EmailForm } from './components/forms/EmailForm'
import { PhoneForm } from './components/forms/PhoneForm'
import { WiFiForm } from './components/forms/WiFiForm'
import { CustomizationPanel } from './components/CustomizationPanel'
import { PresetPanel } from './components/PresetPanel'
import { QRPreview } from './components/QRPreview'
import { RecentQRList } from './components/RecentQRList'
import { ScanWarning } from './components/ScanWarning'
import { ThemeToggle } from './components/ThemeToggle'
import { buildQRContent } from './utils/qrContent'
import { validate, hasErrors } from './utils/validation'
import { getScanWarning } from './utils/contrast'
import {
  DEFAULT_QR_OPTIONS,
  type QRType,
  type QROptions,
  type FormValues,
  type URLFormValues,
  type TextFormValues,
  type EmailFormValues,
  type PhoneFormValues,
  type WiFiFormValues,
  type Preset,
  type RecentEntry,
} from './types'

const DEFAULT_FORMS: Record<QRType, FormValues> = {
  url:   { type: 'url',   values: { url: '' } },
  text:  { type: 'text',  values: { text: '' } },
  email: { type: 'email', values: { to: '', subject: '', body: '' } },
  phone: { type: 'phone', values: { phone: '' } },
  wifi:  { type: 'wifi',  values: { ssid: '', password: '', encryption: 'WPA', hidden: false } },
}

const TABS = [
  { id: 'customize' as const, label: 'Customize' },
  { id: 'presets'   as const, label: 'Presets'   },
  { id: 'recent'    as const, label: 'History'   },
]

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { recent, addRecent, removeRecent, clearRecent } = useRecent()

  const [qrType,      setQrType]      = useState<QRType>('url')
  const [formData,    setFormData]    = useState<FormValues>(DEFAULT_FORMS.url)
  const [options,     setOptions]     = useState<QROptions>(DEFAULT_QR_OPTIONS)
  const [activePanel, setActivePanel] = useState<'customize' | 'presets' | 'recent'>('customize')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const errors   = useMemo(() => validate(formData), [formData])
  const isValid  = !hasErrors(errors)

  const content = useMemo(() => {
    if (!isValid) return ''
    try { return buildQRContent(formData) } catch { return '' }
  }, [formData, isValid])

  const scanWarning = useMemo(() =>
    getScanWarning(options.fgColor, options.bgColor, options.bgTransparent, options.ecLevel, !!options.logoFile),
    [options]
  )

  const handleTypeChange = useCallback((type: QRType) => {
    setQrType(type)
    setFormData(DEFAULT_FORMS[type])
  }, [])

  const handleFormChange = useCallback((values: URLFormValues | TextFormValues | EmailFormValues | PhoneFormValues | WiFiFormValues) => {
    setFormData(prev => ({ ...prev, values } as FormValues))
  }, [])

  const handlePreset = useCallback((preset: Preset) => {
    setOptions(prev => ({
      ...prev,
      fgColor: preset.fgColor,
      bgColor: preset.bgColor,
      ecLevel: preset.ecLevel,
      margin: preset.margin,
      bgTransparent: false,
    }))
  }, [])

  const handleGenerated = useCallback((dataURL: string) => {
    if (!content || !isValid) return
    addRecent(formData, options, content, dataURL)
  }, [content, isValid, formData, options, addRecent])

  const handleRestoreRecent = useCallback((entry: RecentEntry) => {
    setFormData(entry.formData)
    setQrType(entry.formData.type)
    setOptions({ ...entry.options, logoFile: null })
    setActivePanel('customize')
    setSidebarOpen(false)
  }, [])

  const formTitle = {
    url: 'Website URL', text: 'Plain Text',
    email: 'Email', phone: 'Phone Number', wifi: 'Wi-Fi Network',
  }[qrType]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#0A0A0F]">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="
        flex-shrink-0 h-12 flex items-center justify-between px-4 sm:px-5
        bg-white/70 dark:bg-[#0A0A0F]/80 backdrop-blur-xl
        border-b border-zinc-200/80 dark:border-white/[0.06]
        z-20
      ">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden btn-icon mr-1"
            onClick={() => setSidebarOpen(s => !s)}
          >
            <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="
            w-7 h-7 rounded-lg flex items-center justify-center
            bg-indigo-600 dark:bg-indigo-500
            shadow-lg shadow-indigo-600/30 dark:shadow-indigo-500/20
          ">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="5" height="5" rx="1"/>
              <rect x="10" y="1" width="5" height="5" rx="1"/>
              <rect x="1" y="10" width="5" height="5" rx="1"/>
              <rect x="10" y="10" width="2" height="2"/>
              <rect x="14" y="10" width="2" height="2"/>
              <rect x="10" y="14" width="2" height="2"/>
              <rect x="14" y="14" width="2" height="2"/>
            </svg>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              QR Designer
            </span>
            <span className="hidden sm:block text-xs text-zinc-400 dark:text-zinc-500">
              / free & browser-only
            </span>
          </div>
        </div>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {/* ── Body: sidebar + preview ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Sidebar ──────────────────────────────────────── */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
          w-[340px] flex-shrink-0
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          bg-white dark:bg-[#111116]
          border-r border-zinc-200/80 dark:border-white/[0.06]
          overflow-hidden
          mt-12 lg:mt-0
        `}>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* ── QR Type ────────────────────────── */}
            <div className="px-4 pt-5 pb-4 border-b border-zinc-100 dark:border-white/[0.05]">
              <p className="section-label mb-3">Type</p>
              <QRTypeSelector selected={qrType} onChange={handleTypeChange} />
            </div>

            {/* ── Form ───────────────────────────── */}
            <div className="px-4 pt-4 pb-4 border-b border-zinc-100 dark:border-white/[0.05]">
              <p className="section-label mb-3">{formTitle}</p>
              <div className="fade-up" key={qrType}>
                {qrType === 'url'   && <URLForm   values={(formData as { type:'url';   values:URLFormValues   }).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'text'  && <TextForm  values={(formData as { type:'text';  values:TextFormValues  }).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'email' && <EmailForm values={(formData as { type:'email'; values:EmailFormValues }).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'phone' && <PhoneForm values={(formData as { type:'phone'; values:PhoneFormValues }).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'wifi'  && <WiFiForm  values={(formData as { type:'wifi';  values:WiFiFormValues  }).values} errors={errors} onChange={v => handleFormChange(v)} />}
              </div>
            </div>

            {/* ── Tabs: Customize / Presets / History ──────── */}
            <div className="px-4 pt-4 pb-6">
              {/* Pill switcher */}
              <div className="pill-group mb-4">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`tab-pill ${
                      activePanel === tab.id
                        ? 'bg-white dark:bg-white/[0.08] text-zinc-900 dark:text-zinc-100 shadow-sm shadow-black/5'
                        : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'recent' && recent.length > 0 && (
                      <span className="ml-1.5 text-[9px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full px-1.5 py-0.5">
                        {recent.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activePanel === 'customize' && (
                <CustomizationPanel options={options} onChange={setOptions} />
              )}
              {activePanel === 'presets' && (
                <PresetPanel options={options} onApply={handlePreset} />
              )}
              {activePanel === 'recent' && (
                <RecentQRList
                  entries={recent}
                  onRestore={handleRestoreRecent}
                  onRemove={removeRecent}
                  onClear={clearRecent}
                />
              )}
            </div>
          </div>
        </aside>

        {/* ── Preview pane ─────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-6 lg:p-10 relative">
          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="
              w-[500px] h-[500px] rounded-full
              bg-indigo-500/5 dark:bg-indigo-500/[0.04]
              blur-3xl
            " />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
            <QRPreview
              content={content}
              options={options}
              isValid={isValid}
              onGenerated={handleGenerated}
            />

            {/* Scan warning inline */}
            {scanWarning && content && (
              <ScanWarning message={scanWarning} />
            )}

            {/* Specs strip */}
            {content && (
              <div className="
                fade-up w-full
                flex items-center gap-3 flex-wrap justify-center
                px-4 py-2.5 rounded-xl
                bg-white/60 dark:bg-white/[0.03]
                border border-zinc-200/60 dark:border-white/[0.05]
                backdrop-blur-sm
              ">
                {[
                  { label: 'Size',    value: `${options.size}px` },
                  { label: 'ECL',     value: `Level ${options.ecLevel}` },
                  { label: 'Margin',  value: `${options.margin}q` },
                  { label: 'Length',  value: `${content.length}c` },
                ].map(spec => (
                  <div key={spec.label} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{spec.label}</span>
                    <span className="text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-400">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
