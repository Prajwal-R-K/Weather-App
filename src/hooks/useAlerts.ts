import { useEffect, useState } from 'react'
import { abortableJson } from '../lib/fetcher'

export type WeatherAlert = {
  id: string
  severity?: string
  event?: string
  sender?: string
  start?: string
  end?: string
  description?: string
  regions?: string[]
  instruction?: string
  url?: string
}

export function useAlerts(lat?: number, lon?: number){
  const [alerts, setAlerts] = useState<WeatherAlert[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lon !== 'number') return
    let alive = true
    const ctrl = new AbortController()
    const run = async () => {
      setLoading(true); setError(null)
      try {
        const url = `https://api.open-meteo.com/v1/warnings?latitude=${lat}&longitude=${lon}&language=en`
        const data = await abortableJson<any>(url, { signal: ctrl.signal })
        const list: WeatherAlert[] = (data?.warnings || []).map((w: any) => ({
          id: String(w.id ?? `${w.event}-${w.start}`),
          severity: w.severity,
          event: w.event,
          sender: w.sender,
          start: w.start,
          end: w.end,
          description: w.description,
          regions: w.regions,
          instruction: w.instruction,
          url: w.url,
        }))
        if (alive) setAlerts(list)
      } catch(e: any){
        if (alive) setError(e?.message || 'Failed to load alerts')
      } finally { if (alive) setLoading(false) }
    }
    run()
    return () => { alive = false; ctrl.abort() }
  }, [lat, lon])

  return { alerts, loading, error }
}
