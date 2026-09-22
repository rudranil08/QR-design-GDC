import React from 'react'
import type { RecentEntry, FormValues } from '../types'

interface Props {
  entries: RecentEntry[]
  onRestore: (entry: RecentEntry) => void
  onRemove: (id: string) => void
  onClear: () => void
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function typeLabel(f: FormValues): string {
  return { url:'URL', text:'Text', email:'Email', phone:'Phone', wifi:'Wi-Fi' }[f.type]
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

function TypeBadge({ type }: { type: FormValues['type'] }) {
  const colors: Record<string, string> = {
    url:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    text:  'bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400',
    email: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    phone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    wifi:  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${colors[type]}`}>
      {typeLabel({ type } as FormValues)}
    </span>
  )
}

export function RecentQRList({ entries, onRestore, onRemove, onClear }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center text-center gap-2">
        <svg className="w-8 h-8 text-zinc-300 dark:text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-600">No history yet</p>
        <p className="text-xs text-zinc-300 dark:text-zinc-700">Generated codes will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">{entries.length} saved</span>
        <button onClick={onClear} className="text-[11px] text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
          Clear all
        </button>
      </div>

      <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
        {entries.map(entry => (
          <div
            key={entry.id}
            onClick={() => onRestore(entry)}
            className="
              group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
              hover:bg-zinc-50 dark:hover:bg-white/[0.04]
              transition-colors duration-100
            "
          >
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-white/[0.06] bg-white dark:bg-zinc-900">
              <img
                src={entry.thumbnail}
                alt=""
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TypeBadge type={entry.formData.type} />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{timeAgo(entry.createdAt)}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                {contentPreview(entry.formData) || '—'}
              </p>
            </div>

            {/* Remove */}
            <button
              onClick={e => { e.stopPropagation(); onRemove(entry.id) }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-300 hover:text-rose-400 dark:text-zinc-700 dark:hover:text-rose-400 transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
