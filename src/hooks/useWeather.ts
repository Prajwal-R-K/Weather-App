import { useEffect, useMemo, useState } from 'react'
import { geocodeCity, fetchWeather as fetchOM } from '../api/openMeteo'
import type { NormalizedWeather } from '../api/types'
import { useSettings } from '../state/settings'

export function useCityWeather(city: string){
  const { settings } = useSettings()
  const [data, setData] = useState<NormalizedWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let alive = true
    const ctrl = new AbortController()
    async function run(){
      setLoading(true); setError(null)
      try {
        // Detect coordinate input like "12.97, 77.59"
        const m = city.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
        if (m) {
          const la = Number(m[1]); const lo = Number(m[2])
          if (!Number.isFinite(la) || !Number.isFinite(lo)) throw new Error('Invalid coordinates')
          const label = `${la.toFixed(4)}, ${lo.toFixed(4)}`
          const w = await fetchOM(la, lo, label, settings.units, ctrl.signal)
          if(alive) setData(w)
          return
        }
        const geo = await geocodeCity(city, ctrl.signal)
        if(!geo) throw new Error('City not found')
        const label = [geo.name, geo.admin1, geo.country].filter(Boolean).join(', ')
        const w = await fetchOM(geo.latitude, geo.longitude, label, settings.units, ctrl.signal)
        if(alive) setData(w)
        // If AQI is not yet available (fetched asynchronously), revalidate shortly to merge cached AQI without a full network hit
        if (alive && !w.aqi) {
          setTimeout(async () => {
            if (!alive) return
            try {
              const refreshed = m
                ? await fetchOM(Number(m[1]), Number(m[2]), city.trim(), settings.units)
                : await fetchOM(geo.latitude, geo.longitude, label, settings.units)
              if (alive && refreshed?.aqi && !data?.aqi) setData(refreshed)
            } catch {}
          }, 1500)
        }
      } catch(e: any){
        if(alive && e?.name !== 'AbortError') setError(e?.message || 'Failed to load')
      } finally { if(alive) setLoading(false) }
    }
    run()
    return () => { alive = false; ctrl.abort() }
  }, [city, settings.units, settings.provider, version])

  // Auto-refresh every ~7 minutes when tab is visible, and on focus if stale
  useEffect(() => {
    let timer: number | null = null
    const intervalMs = 7 * 60 * 1000
    function schedule(){
      if (timer) window.clearInterval(timer)
      // Only run when visible
      timer = window.setInterval(() => {
        if (document.visibilityState === 'visible') setVersion(v => v + 1)
      }, intervalMs)
    }
    function onVisibility(){
      // If user returns to tab and data is stale, refresh immediately
      if (document.visibilityState === 'visible') {
        const last = (data as any)?.fetchedAt ? new Date((data as any).fetchedAt).getTime() : 0
        if (!last || Date.now() - last > intervalMs) setVersion(v => v + 1)
      }
    }
    function onFocus(){
      const last = (data as any)?.fetchedAt ? new Date((data as any).fetchedAt).getTime() : 0
      if (!last || Date.now() - last > intervalMs) setVersion(v => v + 1)
    }
    schedule()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)
    return () => {
      if (timer) window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
    }
  }, [city, settings.units, settings.provider, (data as any)?.fetchedAt])

  return { data, loading, error, refresh: () => setVersion(v => v + 1) }
}
