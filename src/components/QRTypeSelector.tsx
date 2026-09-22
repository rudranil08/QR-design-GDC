import React from 'react'
import { QR_TYPES, type QRType } from '../types'

const ICONS: Record<QRType, React.ReactNode> = {
  url: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 9.5L9.5 6.5M7 4.5l.793-.793a3.182 3.182 0 014.5 4.5L11.5 9m-7 2.5l-.793.793a3.182 3.182 0 01-4.5-4.5L4.5 7" strokeLinecap="round"/>
    </svg>
  ),
  text: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 4h11M5.5 8h5M3.5 12h9" strokeLinecap="round"/>
    </svg>
  ),
  email: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>
      <path d="M1.5 5l6.5 4.5L14.5 5" strokeLinecap="round"/>
    </svg>
  ),
  phone: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3.5A1.5 1.5 0 013.5 2h1.618a1 1 0 01.95.683l.74 2.218a1 1 0 01-.23 1.03L5.5 7a9.04 9.04 0 003.5 3.5l1.069-1.078a1 1 0 011.03-.23l2.218.74A1 1 0 0114 11.882V13.5A1.5 1.5 0 0112.5 15C6.701 15 1 9.299 1 3.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wifi: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 6.5a9.5 9.5 0 0114 0M3.5 9a6 6 0 019 0M6 11.5a3 3 0 014 0M8 14v.01" strokeLinecap="round" strokeLinejoin="round"/>
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
      {QR_TYPES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`
            flex items-center gap-2.5 w-full px-3 py-2 rounded-lg
            text-sm transition-all duration-150 text-left
            ${selected === id
              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200'
            }
          `}
        >
          <span className={selected === id ? 'text-indigo-500' : 'text-zinc-400 dark:text-zinc-600'}>
            {ICONS[id]}
          </span>
          {label}
          {selected === id && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )}
        </button>
      ))}
    </div>
  )
}
