import React from 'react'

interface Props {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="btn-icon"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        // Sun — 14×14, 1.25px stroke
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
          <circle cx="7" cy="7" r="2.5"/>
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.64 2.64l1.06 1.06M10.3 10.3l1.06 1.06M2.64 11.36l1.06-1.06M10.3 3.7l1.06-1.06"/>
        </svg>
      ) : (
        // Moon — 14×14, 1.25px stroke
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8.5A5 5 0 015.5 2a5 5 0 100 10 5 5 0 006.5-3.5z"/>
        </svg>
      )}
    </button>
  )
}
