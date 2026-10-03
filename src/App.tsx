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
  type ECLevel,
  type FormValues,
  type URLFormValues,
  type TextFormValues,
  type EmailFormValues,
  type PhoneFormValues,
  type WiFiFormValues,
  type Preset,
  type RecentEntry,
} from './types'

const EC_LABELS: Record<ECLevel, string> = {
  L: 'Low (7%)',
  M: 'Medium (15%)',
  Q: 'High (25%)',
  H: 'Maximum (30%)',
}

const DEFAULT_FORMS: Record<QRType, FormValues> = {
  url:   { type: 'url',   values: { url: '' } },
  text:  { type: 'text',  values: { text: '' } },
  email: { type: 'email', values: { to: '', subject: '', body: '' } },
  phone: { type: 'phone', values: { phone: '' } },
  wifi:  { type: 'wifi',  values: { ssid: '', password: '', encryption: 'WPA', hidden: false } },
}

type PanelTab = 'customize' | 'presets' | 'history'
const TABS: { id: PanelTab; label: string }[] = [
  { id: 'customize', label: 'Customize' },
  { id: 'presets',   label: 'Presets'   },
  { id: 'history',   label: 'History'   },
]

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { recent, addRecent, removeRecent, clearRecent } = useRecent()

  const [qrType,      setQrType]      = useState<QRType>('url')
  const [formData,    setFormData]    = useState<FormValues>(DEFAULT_FORMS.url)
  const [options,     setOptions]     = useState<QROptions>(DEFAULT_QR_OPTIONS)
  const [zoomLevel,   setZoomLevel]   = useState<number>(1)
  const [activePanel, setActivePanel] = useState<PanelTab>('customize')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Automated quiet zone and resolution per zoom framing
  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom)
    const config: Record<number, { size: number; margin: number }> = {
      1:    { size: 300, margin: 4 },
      1.25: { size: 375, margin: 2 },
      2:    { size: 600, margin: 1 },
    }
    const current = config[zoom] || config[1]
    setOptions(prev => ({
      ...prev,
      size: current.size,
      margin: current.margin,
    }))
  }, [])

  const errors  = useMemo(() => validate(formData), [formData])
  const isValid = !hasErrors(errors)

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

  const handleFormChange = useCallback((
    values: URLFormValues | TextFormValues | EmailFormValues | PhoneFormValues | WiFiFormValues
  ) => {
    setFormData(prev => ({ ...prev, values } as FormValues))
  }, [])

  const handlePreset = useCallback((preset: Preset) => {
    setOptions(prev => ({
      ...prev,
      fgColor: preset.fgColor,
      bgColor: preset.bgColor,
      ecLevel: preset.ecLevel,
      margin:  preset.margin,
      bgTransparent: false,
      // Reset logo size to default when applying preset so it starts clean
      logoSize: prev.logoFile ? prev.logoSize : 25,
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
    const restoredZoom = [1, 1.25, 2].find(z => Math.round(300 * z) === entry.options.size) || 1
    setZoomLevel(restoredZoom)
    setActivePanel('customize')
    setSidebarOpen(false)
  }, [])

  const FORM_TITLES: Record<QRType, string> = {
    url:   'Website URL',
    text:  'Plain text',
    email: 'Email',
    phone: 'Phone number',
    wifi:  'Wi-Fi network',
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-100 dark:bg-[#0d0d0d]">

      {/* ── Header ── */}
      <header className="
        flex-shrink-0 h-11 flex items-center justify-between px-4
        bg-white dark:bg-[#141414]
        border-b border-zinc-200 dark:border-zinc-800
        z-20
      ">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden btn-icon"
            onClick={() => setSidebarOpen(s => !s)}
            aria-label="Toggle sidebar"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Wordmark */}
          <div className="flex items-center gap-2">
            {/* Simple QR mark — no colored blob */}
            <svg className="w-5 h-5 text-zinc-900 dark:text-zinc-100" viewBox="0 0 20 20" fill="currentColor">
              <rect x="1" y="1" width="7" height="7" rx="1.5"/>
              <rect x="12" y="1" width="7" height="7" rx="1.5"/>
              <rect x="1" y="12" width="7" height="7" rx="1.5"/>
              <rect x="2.5" y="2.5" width="4" height="4" rx="0.5" fill="white"/>
              <rect x="13.5" y="2.5" width="4" height="4" rx="0.5" fill="white"/>
              <rect x="2.5" y="13.5" width="4" height="4" rx="0.5" fill="white"/>
              <rect x="12" y="12" width="3" height="3" rx="0.5"/>
              <rect x="17" y="12" width="3" height="3" rx="0.5"/>
              <rect x="12" y="17" width="3" height="3" rx="0.5"/>
              <rect x="17" y="17" width="3" height="3" rx="0.5"/>
            </svg>
            <span className="text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              QR Designer
            </span>
          </div>
        </div>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {/* ── Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
          w-80 flex-shrink-0
          flex flex-col
          bg-white dark:bg-[#141414]
          border-r border-zinc-200 dark:border-zinc-800
          mt-11 lg:mt-0
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex-1 overflow-y-auto">

            {/* QR Type */}
            <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
              <p className="section-label mb-2.5">QR type</p>
              <QRTypeSelector selected={qrType} onChange={handleTypeChange} />
            </div>

            {/* Content form */}
            <div className="px-4 pt-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
              <p className="section-label mb-2.5">{FORM_TITLES[qrType]}</p>
              <div key={qrType} className="fade-up">
                {qrType === 'url'   && <URLForm   values={(formData as {type:'url';   values:URLFormValues  }).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'text'  && <TextForm  values={(formData as {type:'text';  values:TextFormValues }).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'email' && <EmailForm values={(formData as {type:'email'; values:EmailFormValues}).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'phone' && <PhoneForm values={(formData as {type:'phone'; values:PhoneFormValues}).values} errors={errors} onChange={v => handleFormChange(v)} />}
                {qrType === 'wifi'  && <WiFiForm  values={(formData as {type:'wifi';  values:WiFiFormValues }).values} errors={errors} onChange={v => handleFormChange(v)} />}
              </div>
            </div>

            {/* Customize / Presets / History tabs */}
            <div className="px-4 pt-4 pb-6">
              {/* Underline tab navigation */}
              <nav className="tab-group mb-4">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`tab-item ${activePanel === tab.id ? 'tab-item-active' : ''}`}
                  >
                    {tab.label}
                    {tab.id === 'history' && recent.length > 0 && (
                      <span className="ml-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                        ({recent.length})
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {activePanel === 'customize' && (
                <CustomizationPanel
                  options={options}
                  onChange={setOptions}
                  zoomLevel={zoomLevel}
                  onZoomChange={handleZoomChange}
                />
              )}
              {activePanel === 'presets' && (
                <PresetPanel options={options} onApply={handlePreset} />
              )}
              {activePanel === 'history' && (
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

        {/* ── Preview pane ── */}
        {/*
          No glow, no blur, no glassmorphism.
          Just a neutral background with the QR as the focal point.
        */}
        <main className="
          flex-1 flex flex-col items-center justify-center
          overflow-y-auto p-4 sm:p-8
          bg-zinc-100 dark:bg-[#0d0d0d]
        ">
          <div className="flex flex-col items-center gap-5 w-full max-w-2xl my-auto">
            <QRPreview
              content={content}
              options={options}
              isValid={isValid}
              zoomLevel={zoomLevel}
              onZoomChange={handleZoomChange}
              onGenerated={handleGenerated}
            />

            {/* Scan reliability warning */}
            {scanWarning && content && (
              <div className="w-full max-w-sm">
                <ScanWarning message={scanWarning} />
              </div>
            )}

            {/* Minimal specs row — no card, no backdrop-blur */}
            {content && (
              <div className="fade-up w-full flex items-center justify-center gap-6 pt-1">
                {[
                  { label: 'Size',     value: `${options.size}px (${zoomLevel}×)` },
                  { label: 'Recovery', value: EC_LABELS[options.ecLevel] },
                  { label: 'Margin',   value: `${options.margin} mod` },
                ].map(spec => (
                  <div key={spec.label} className="text-center">
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">{spec.label}</div>
                    <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 mt-0.5">{spec.value}</div>
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
