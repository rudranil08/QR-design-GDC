import React from 'react'
import { QR_TYPES, type QRType } from '../types'

// Consistent 14×14 SVG icons, 1.25px stroke, all from same visual family
const ICONS: Record<QRType, React.ReactNode> = {
  url: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
      <path d="M5.5 8.5L8.5 5.5M6 3.5l.7-.7a3 3 0 014.2 4.2L10.2 7.8M7.8 10.2l-.7.7a3 3 0 01-4.2-4.2L3.8 6.2"/>
    </svg>
  ),
  text: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
      <path d="M2 3.5h10M4 7h6M2.5 10.5h9"/>
    </svg>
  ),
  email: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="12" height="8" rx="1.25"/>
      <path d="M1 4.5l6 4 6-4"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 3A1.25 1.25 0 012.75 1.75h1.4a.75.75 0 01.71.51l.65 1.95a.75.75 0 01-.17.77L4.5 5.5a8 8 0 003 3l1.52-.97a.75.75 0 01.78-.17l1.95.65a.75.75 0 01.51.71v1.4A1.25 1.25 0 0111 11.25C5.34 11.25 1.5 7.41 1.5 1.75z"/>
    </svg>
  ),
  wifi: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5a8.5 8.5 0 0112 0M3.5 7.5a5 5 0 017 0M6 10a2 2 0 012 0M7 12.5v.01"/>
    </svg>
  ),
}

interface Props {
  selected: QRType
  onChange: (type: QRType) => void
}

export function QRTypeSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      {QR_TYPES.map(({ id, label }) => {
        const isActive = selected === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`
              flex items-center gap-2.5 w-full px-2.5 py-2 text-left text-sm
              transition-colors duration-100
              ${isActive
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }
            `}
            style={{ borderRadius: 6 }}
          >
            <span className={isActive ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600'}>
              {ICONS[id]}
            </span>
            <span>{label}</span>
            {/* Simple indicator — no colored dot, just a right-aligned mark */}
            {isActive && (
              <span className="ml-auto text-zinc-400 dark:text-zinc-600">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5"/>
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
