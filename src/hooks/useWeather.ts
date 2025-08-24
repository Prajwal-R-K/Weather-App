import { useEffect, useMemo, useState } from 'react'
import { geocodeCity, fetchWeather as fetchOM } from '../api/openMeteo'
import type { NormalizedWeather } from '../api/types'
import { useSettings } from '../state/settings'

export function useCityWeather(city: string){
  const { settings } = useSettings()
  const [data, setData] = useState<NormalizedWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }, [city, settings.units, settings.provider])

  return { data, loading, error }
}
