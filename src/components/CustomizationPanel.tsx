import React, { useRef } from 'react'
import type { QROptions, ECLevel } from '../types'

interface Props {
  options: QROptions
  onChange: (options: QROptions) => void
}

const EC_LEVELS: { value: ECLevel; label: string; pct: string }[] = [
  { value: 'L', label: 'Low',    pct: '7%'  },
  { value: 'M', label: 'Medium', pct: '15%' },
  { value: 'Q', label: 'High',   pct: '25%' },
  { value: 'H', label: 'Max',    pct: '30%' },
]

function ColorSwatch({ color, onChange, label, disabled = false }: { color: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-1.5">
      <p className="section-label">{label}</p>
      <button
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className={`
          w-full h-10 rounded-xl border transition-all duration-150
          flex items-center px-3 gap-2.5
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-zinc-300 dark:hover:border-white/20 cursor-pointer'}
          border-zinc-200 dark:border-white/[0.08]
          bg-white dark:bg-white/[0.04]
        `}
      >
        <div
          className="w-5 h-5 rounded-md flex-shrink-0 border border-black/10 dark:border-white/10"
          style={{ background: color }}
        />
        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase">{color}</span>
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
  const set = <K extends keyof QROptions>(k: K, v: QROptions[K]) => onChange({ ...options, [k]: v })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    onChange({ ...options, logoFile: file, ecLevel: file ? 'H' : options.ecLevel })
  }

  return (
    <div className="space-y-5">

      {/* Size */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="section-label">Size</p>
          <span className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400">{options.size}px</span>
        </div>
        <input type="range" min={128} max={1024} step={8} value={options.size}
          onChange={e => set('size', Number(e.target.value))} />
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>128</span><span>1024</span>
        </div>
      </div>

      {/* Margin */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="section-label">Quiet zone</p>
          <span className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400">{options.margin} modules</span>
        </div>
        <input type="range" min={0} max={10} step={1} value={options.margin}
          onChange={e => set('margin', Number(e.target.value))} />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <ColorSwatch
          label="Foreground"
          color={options.fgColor}
          onChange={v => set('fgColor', v)}
        />
        <div className="space-y-1.5">
          <ColorSwatch
            label="Background"
            color={options.bgColor}
            onChange={v => set('bgColor', v)}
            disabled={options.bgTransparent}
          />
          <label className="flex items-center gap-2 cursor-pointer py-0.5">
            <div
              onClick={() => set('bgTransparent', !options.bgTransparent)}
              className={`w-7 h-4 rounded-full flex items-center px-0.5 transition-colors duration-200 cursor-pointer ${
                options.bgTransparent ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                options.bgTransparent ? 'translate-x-3' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500">Transparent</span>
          </label>
        </div>
      </div>

      {/* Error correction */}
      <div className="space-y-2">
        <p className="section-label">Error correction</p>
        <div className="grid grid-cols-4 gap-1">
          {EC_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => set('ecLevel', level.value)}
              className={`
                flex flex-col items-center py-2 rounded-lg text-[11px]
                transition-all duration-150 border
                ${options.ecLevel === level.value
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-zinc-200 dark:border-white/[0.08] text-zinc-500 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-white/[0.12] hover:text-zinc-700 dark:hover:text-zinc-300 bg-white dark:bg-white/[0.02]'
                }
              `}
            >
              <span className="font-bold text-sm">{level.value}</span>
              <span className={`text-[9px] mt-0.5 ${options.ecLevel === level.value ? 'text-indigo-200' : 'text-zinc-400'}`}>
                {level.pct}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <p className="section-label">Logo overlay <span className="text-zinc-400 normal-case tracking-normal font-normal">(optional)</span></p>
        <div className="flex gap-2">
          <button onClick={() => logoRef.current?.click()} className="btn-secondary text-xs flex-1 py-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8M5 5l3-3 3 3M2 11v1.5A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V11" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {options.logoFile ? 'Change' : 'Upload logo'}
          </button>
          {options.logoFile && (
            <button onClick={() => set('logoFile', null)} className="btn-ghost text-xs text-rose-500 dark:text-rose-400 py-2">
              Remove
            </button>
          )}
        </div>

        {options.logoFile && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between">
              <p className="section-label">Logo size</p>
              <span className="text-[11px] font-mono text-indigo-500">{options.logoSize}%</span>
            </div>
            <input type="range" min={10} max={40} step={5} value={options.logoSize}
              onChange={e => set('logoSize', Number(e.target.value))} />
            <p className="text-[11px] text-amber-500/80 dark:text-amber-400/70">
              ECL auto-set to Max for reliability.
            </p>
          </div>
        )}
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
      </div>
    </div>
  )
}
