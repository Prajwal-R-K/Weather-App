import { useEffect, useState } from 'react'

export function formatRelativeTime(then: number | Date, now: number = Date.now()): string {
  const t = typeof then === 'number' ? then : new Date(then).getTime()
  const diff = Math.max(0, now - t)
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return m === 1 ? '1 min ago' : `${m} mins ago`
  const h = Math.floor(m / 60)
  if (h < 24) return h === 1 ? '1 hr ago' : `${h} hrs ago`
  const d = Math.floor(h / 24)
  return d === 1 ? '1 day ago' : `${d} days ago`
}

export function useNow(intervalMs: number = 30_000): number {
  const [now, setNow] = useState<number>(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
