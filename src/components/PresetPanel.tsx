import React from 'react'
import { PRESETS, type Preset, type QROptions } from '../types'

interface Props {
  options: QROptions
  onApply: (preset: Preset) => void
}

export function PresetPanel({ options, onApply }: Props) {
  const isActive = (p: Preset) =>
    !options.bgTransparent && p.fgColor === options.fgColor && p.bgColor === options.bgColor

  return (
    <div>
      <p className="section-label mb-3">Color themes</p>

      {/*
        Preset list instead of grid cards.
        Each row shows fg color, bg color swatches + name.
        Active state: simple checkmark, no colored shadow.
      */}
      <div className="flex flex-col gap-1">
        {PRESETS.map(preset => {
          const active = isActive(preset)
          return (
            <button
              key={preset.id}
              onClick={() => onApply(preset)}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 text-left
                border transition-colors duration-100
                ${active
                  ? 'border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/60'
                  : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 bg-transparent'
                }
              `}
              style={{ borderRadius: 6 }}
            >
              {/* Color swatches — small, adjacent */}
              <div className="flex -space-x-1 flex-shrink-0">
                <span
                  className="w-5 h-5 border border-black/8 dark:border-white/8"
                  style={{ background: preset.bgColor, borderRadius: 4 }}
                />
                <span
                  className="w-5 h-5 border border-black/8 dark:border-white/8"
                  style={{ background: preset.fgColor, borderRadius: 4 }}
                />
              </div>

              {/* Name */}
              <span className={`text-sm ${active ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}>
                {preset.name}
              </span>

              {/* Recovery badge — useful info, plain English */}
              <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                {preset.ecLevel === 'H' ? '30% recovery' : preset.ecLevel === 'Q' ? '25% recovery' : preset.ecLevel === 'M' ? '15% recovery' : '7% recovery'}
              </span>

              {/* Active checkmark — monochrome only */}
              {active && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                  <path d="M2 6l3 3 5-5"/>
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-3">
        Select a theme, then adjust colors in Customize.
      </p>
    </div>
  )
}
