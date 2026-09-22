import React, { useRef } from 'react'
import type { QROptions, ECLevel } from '../types'

interface Props {
  options: QROptions
  onChange: (options: QROptions) => void
}

const EC_LEVELS: { value: ECLevel; desc: string }[] = [
  { value: 'L', desc: '7%'  },
  { value: 'M', desc: '15%' },
  { value: 'Q', desc: '25%' },
  { value: 'H', desc: '30%' },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="toggle"
      type="button"
    >
      <div className={`toggle-track ${on ? 'toggle-track-on' : ''}`} />
      <div className={`toggle-thumb ${on ? 'toggle-thumb-on' : ''}`} />
    </button>
  )
}

function ColorSwatch({
  color, onChange, label, disabled = false,
}: {
  color: string; onChange: (v: string) => void; label: string; disabled?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <p className="section-label mb-1.5">{label}</p>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className={`
          flex items-center gap-2 w-full h-8 px-2.5
          bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-700
          text-xs font-mono text-zinc-600 dark:text-zinc-400
          transition-colors duration-100
          ${disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer'
          }
        `}
        style={{ borderRadius: 6 }}
      >
        <span
          className="w-4 h-4 flex-shrink-0 border border-black/8 dark:border-white/8"
          style={{ background: color, borderRadius: 3 }}
        />
        <span className="uppercase">{color}</span>
      </button>
      <input
        ref={ref}
        type="color"
        value={color}
        onChange={e => onChange(e.target.value)}
        className="sr-only"
        disabled={disabled}
      />
    </div>
  )
}

export function CustomizationPanel({ options, onChange }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)
  const set = <K extends keyof QROptions>(k: K, v: QROptions[K]) =>
    onChange({ ...options, [k]: v })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    onChange({ ...options, logoFile: file, ecLevel: file ? 'H' : options.ecLevel })
  }

  return (
    <div className="space-y-5">

      {/* Size */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="section-label">Output size</p>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500">{options.size}px</span>
        </div>
        <input
          type="range" min={128} max={1024} step={8}
          value={options.size}
          onChange={e => set('size', Number(e.target.value))}
        />
        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">
          <span>128</span><span>1024</span>
        </div>
      </div>

      {/* Quiet zone */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="section-label">Quiet zone</p>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500">{options.margin} modules</span>
        </div>
        <input
          type="range" min={0} max={10} step={1}
          value={options.margin}
          onChange={e => set('margin', Number(e.target.value))}
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <ColorSwatch
          label="Foreground"
          color={options.fgColor}
          onChange={v => set('fgColor', v)}
        />
        <div>
          <ColorSwatch
            label="Background"
            color={options.bgColor}
            onChange={v => set('bgColor', v)}
            disabled={options.bgTransparent}
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <Toggle
              on={options.bgTransparent}
              onToggle={() => set('bgTransparent', !options.bgTransparent)}
            />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500">Transparent</span>
          </label>
        </div>
      </div>

      {/* Error correction */}
      <div>
        <p className="section-label mb-1.5">Error correction</p>
        {/*
          Simple segmented control — not cards, not pills.
          Selected state: solid zinc fill. Unselected: outlined.
        */}
        <div className="flex border border-zinc-200 dark:border-zinc-700 overflow-hidden" style={{ borderRadius: 6 }}>
          {EC_LEVELS.map((level, i) => {
            const isActive = options.ecLevel === level.value
            return (
              <button
                key={level.value}
                onClick={() => set('ecLevel', level.value)}
                className={`
                  flex-1 py-1.5 flex flex-col items-center
                  text-[11px] transition-colors duration-100
                  ${i > 0 ? 'border-l border-zinc-200 dark:border-zinc-700' : ''}
                  ${isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }
                `}
              >
                <span className="font-semibold">{level.value}</span>
                <span className={`text-[9px] ${isActive ? 'opacity-60' : 'text-zinc-400 dark:text-zinc-600'}`}>
                  {level.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Logo overlay */}
      <div>
        <p className="section-label mb-1.5">Logo overlay <span className="normal-case font-normal tracking-normal text-zinc-400">(optional)</span></p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => logoRef.current?.click()}
            className="btn-secondary text-xs flex-1 h-8"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1.5v7M4.5 6L7 8.5 9.5 6M1.5 10.5v1A1.25 1.25 0 002.75 12.75h8.5A1.25 1.25 0 0012.5 11.5v-1"/>
            </svg>
            {options.logoFile ? 'Replace logo' : 'Upload logo'}
          </button>
          {options.logoFile && (
            <button
              type="button"
              onClick={() => set('logoFile', null)}
              className="btn-ghost text-xs text-red-500 dark:text-red-400 h-8"
            >
              Remove
            </button>
          )}
        </div>

        {options.logoFile && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="section-label">Logo size</p>
              <span className="text-[11px] font-mono text-zinc-500">{options.logoSize}%</span>
            </div>
            <input
              type="range" min={10} max={40} step={5}
              value={options.logoSize}
              onChange={e => set('logoSize', Number(e.target.value))}
            />
            <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1.5">
              Error correction auto-set to H when a logo is present.
            </p>
          </div>
        )}

        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>
    </div>
  )
}
