import React from 'react'

interface Props { message: string }

export function ScanWarning({ message }: Props) {
  return (
    <div className="
      flex items-start gap-2.5 px-3.5 py-3 rounded-xl w-full
      bg-amber-50/80 dark:bg-amber-500/[0.08]
      border border-amber-200/60 dark:border-amber-500/20
      fade-up
    ">
      <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8.982 1.566a1.13 1.13 0 00-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.706c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z"/>
      </svg>
      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{message}</p>
    </div>
  )
}
