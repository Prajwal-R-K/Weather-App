type Entry<T> = { data: T; ts: number }
const mem = new Map<string, Entry<any>>()

export function getCache<T>(key: string, ttlMs: number): T | null {
  const e = mem.get(key) as Entry<T> | undefined
  if (e && Date.now() - e.ts < ttlMs) return e.data
  try {
    const raw = localStorage.getItem(`cache:${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Entry<T>
    if (Date.now() - parsed.ts < ttlMs) {
      mem.set(key, parsed)
      return parsed.data
    }
  } catch {}
  return null
}

export function setCache<T>(key: string, data: T) {
  const entry: Entry<T> = { data, ts: Date.now() }
  mem.set(key, entry)
  try { localStorage.setItem(`cache:${key}`, JSON.stringify(entry)) } catch {}
}
