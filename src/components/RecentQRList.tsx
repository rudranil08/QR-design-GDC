import React from 'react'
import type { RecentEntry, FormValues } from '../types'

interface Props {
  entries:   RecentEntry[]
  onRestore: (entry: RecentEntry) => void
  onRemove:  (id: string) => void
  onClear:   () => void
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)    return 'Just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const TYPE_LABELS: Record<FormValues['type'], string> = {
  url:   'URL',
  text:  'Text',
  email: 'Email',
  phone: 'Phone',
  wifi:  'Wi-Fi',
}

function contentPreview(f: FormValues): string {
  switch (f.type) {
    case 'url':   return f.values.url
    case 'text':  return f.values.text
    case 'email': return f.values.to
    case 'phone': return f.values.phone
    case 'wifi':  return f.values.ssid
  }
}

export function RecentQRList({ entries, onRestore, onRemove, onClear }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 dark:text-zinc-700">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3"/>
        </svg>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">No history yet</p>
        <p className="text-xs text-zinc-300 dark:text-zinc-700">Generated codes will appear here</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">{entries.length} saved</span>
        <button
          onClick={onClear}
          className="text-[11px] text-red-500 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-px max-h-72 overflow-y-auto">
        {entries.map(entry => (
          <div
            key={entry.id}
            role="button"
            tabIndex={0}
            onClick={() => onRestore(entry)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRestore(entry) } }}
            className="
              group flex items-center gap-3 px-2.5 py-2.5
              hover:bg-zinc-50 dark:hover:bg-zinc-800/60
              transition-colors duration-100 cursor-pointer
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400 focus-visible:rounded
            "
            style={{ borderRadius: 6 }}
          >
            {/* QR thumbnail */}
            <div
              className="
                w-9 h-9 flex-shrink-0 overflow-hidden
                bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-700
              "
              style={{ borderRadius: 4 }}
            >
              <img
                src={entry.thumbnail}
                alt=""
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {/* Plain text type label — no colored badge */}
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
                  {TYPE_LABELS[entry.formData.type]}
                </span>
                <span className="text-[10px] text-zinc-300 dark:text-zinc-700">
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                {contentPreview(entry.formData) || '—'}
              </p>
            </div>

            {/* Remove — hidden until hover, accessible via keyboard */}
            <button
              onClick={e => { e.stopPropagation(); onRemove(entry.id) }}
              onKeyDown={e => e.stopPropagation()}
              className="
                opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 btn-icon
                transition-opacity duration-100
              "
              title="Remove"
              aria-label="Remove from history"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l8 8M10 2L2 10"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
