import React from 'react'

interface Props { message: string }

export function ScanWarning({ message }: Props) {
  return (
    <div className="
      w-full flex items-start gap-2.5 px-3 py-2.5
      bg-amber-50 dark:bg-amber-950/30
      border border-amber-200 dark:border-amber-800/60
      text-amber-800 dark:text-amber-300
    " style={{ borderRadius: 6 }}>
      {/* Warning icon — same stroke family as rest of icons */}
      <svg
        width="14" height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0 mt-0.5"
      >
        <path d="M7 1.5L13 12H1L7 1.5z"/>
        <path d="M7 5.5v3M7 10.5v.01"/>
      </svg>
      <p className="text-[12px] leading-relaxed">{message}</p>
    </div>
  )
}
