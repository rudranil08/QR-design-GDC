import { useState, useCallback } from 'react'
import type { RecentEntry, FormValues, QROptions } from '../types'

const STORAGE_KEY = 'qr-designer:recent'
const MAX_ENTRIES = 10

function loadRecent(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentEntry[]
  } catch {
    return []
  }
}

function saveRecent(entries: RecentEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage might be full
  }
}

export function useRecent() {
  const [recent, setRecent] = useState<RecentEntry[]>(loadRecent)

  const addRecent = useCallback((
    formData: FormValues,
    options: QROptions,
    content: string,
    thumbnail: string,
  ) => {
    const entry: RecentEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      formData,
      options: {
        size: options.size,
        fgColor: options.fgColor,
        bgColor: options.bgColor,
        bgTransparent: options.bgTransparent,
        ecLevel: options.ecLevel,
        margin: options.margin,
        logoSize: options.logoSize,
      },
      thumbnail,
      content,
    }

    setRecent((prev) => {
      // Deduplicate by content
      const filtered = prev.filter((e) => e.content !== content)
      const updated = [entry, ...filtered].slice(0, MAX_ENTRIES)
      saveRecent(updated)
      return updated
    })
  }, [])

  const removeRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const updated = prev.filter((e) => e.id !== id)
      saveRecent(updated)
      return updated
    })
  }, [])

  const clearRecent = useCallback(() => {
    setRecent([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { recent, addRecent, removeRecent, clearRecent }
}
