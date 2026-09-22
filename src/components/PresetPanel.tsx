import React from 'react'
import { PRESETS, type Preset, type QROptions } from '../types'

interface Props {
  options: QROptions
  onApply: (preset: Preset) => void
}

export function PresetPanel({ options, onApply }: Props) {
  const isActive = (p: Preset) =>
    p.fgColor === options.fgColor && p.bgColor === options.bgColor

  return (
    <div className="space-y-2.5">
      <p className="section-label mb-3">Themes</p>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onApply(preset)}
            className={`
              relative group rounded-xl overflow-hidden h-20
              transition-all duration-200
              border-2
              ${isActive(preset)
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'border-transparent hover:border-zinc-200 dark:hover:border-white/10'
              }
            `}
            style={{ background: preset.bgColor }}
          >
            {/* Mini QR pattern */}
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
              <div className="grid gap-[2px]" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 6px)',
                gridTemplateRows: 'repeat(5, 6px)',
              }}>
                {[1,1,1,0,1, 1,0,1,0,1, 1,1,1,1,0, 0,1,0,1,1, 1,0,1,1,1].map((v, i) => (
                  <div key={i} className="rounded-[1px]" style={{
                    background: v ? preset.fgColor : 'transparent',
                    opacity: v ? 1 : 0,
                    width: 6, height: 6,
                  }} />
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="absolute bottom-0 inset-x-0 px-2.5 py-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold" style={{ color: preset.fgColor }}>
                {preset.name}
              </span>
              {isActive(preset) && (
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1.5 4l1.5 1.5L6.5 2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 pt-1">
        Select a theme, then fine-tune in Customize.
      </p>
    </div>
  )
}
