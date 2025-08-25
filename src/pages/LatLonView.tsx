import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchWeather as fetchOM, reverseGeocode } from '../api/openMeteo'
import type { GeoSuggest } from '../api/openMeteo'
import type { NormalizedWeather } from '../api/types'
import { useSettings } from '../state/settings'
import { HourlyTempChart } from '../components/HourlyTempChart'
import { MiniMap } from '../components/MiniMap'
import { CurrentCard } from '../components/CurrentCard'
import { ForecastTabs } from '../components/ForecastTabs'
import { Gauge } from '../components/Gauge'
import { SunMoonCard } from '../components/SunMoonCard'
import { CloudCoverCard } from '../components/CloudCoverCard'
import { Sparkline } from '../components/Sparkline'
import { applyPhaseClass, applyWeatherClass, getDayPhase } from '../lib/dayPhase'
import { aqiColor, aqiLabel } from '../lib/aqi'
import { AlertsBanner } from '../components/AlertsBanner'
import { useNow, formatRelativeTime } from '../lib/time'

export default function LatLonView(){
  const { lat, lon } = useParams()
  const nav = useNavigate()
  const { settings, setSettings } = useSettings()
  const coords = useMemo(() => {
    const la = Number(lat)
    const lo = Number(lon)
    if (Number.isFinite(la) && Number.isFinite(lo)) return { la, lo }
    return null
  }, [lat, lon])
  const [data, setData] = useState<NormalizedWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pretty, setPretty] = useState<string | null>(null)
  const [rgLoading, setRgLoading] = useState<boolean>(false)
  const [rev, setRev] = useState<GeoSuggest | null>(null)
  const [addedMsg, setAddedMsg] = useState<string>('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let alive = true
    if (!coords) { setError('Invalid coordinates'); return }
    const run = async () => {
      setLoading(true); setError(null)
      try {
        const label = `${coords.la.toFixed(2)}, ${coords.lo.toFixed(2)}`
        const w = await fetchOM(coords.la, coords.lo, label, settings.units)
        if (alive) setData(w)
        // Try to obtain a pretty label via reverse geocode (no auto-navigation)
        try {
          if (alive) setRgLoading(true)
          const res = await reverseGeocode(coords.la, coords.lo)
          if (alive && res){
            setRev(res)
            setPretty([res.name, res.admin1, res.country].filter(Boolean).join(', '))
          }
        } catch {}
        finally { if (alive) setRgLoading(false) }
      } catch(e: any){
        if (alive) setError(e?.message || 'Failed to load')
      } finally { if (alive) setLoading(false) }
    }
    run()
    return () => { alive = false }
  }, [coords?.la, coords?.lo, settings.units, version])

  if (!coords) return <div className="p-6 rounded-2xl bg-card shadow-soft text-red-400">Invalid coordinates.</div>

  const today = data?.daily?.[0]?.date
  const pressureToday = useMemo(() => (data?.hourly || []).filter(h => h.time.slice(0,10) === today).map(h => Math.round(h.pressureHpa ?? 0)).filter(n => n>0), [data, today])
  const tempToday = useMemo(() => (data?.hourly || []).filter(h => h.time.slice(0,10) === today).map(h => Math.round(h.tempC)), [data, today])
  const placeType = useMemo(() => {
    const fc = rev?.feature_code
    switch (fc){
      case 'PPLC': return 'Capital city'
      case 'PPLA': return 'Admin capital (state)'
      case 'PPLA2': return 'Admin capital (county)'
      case 'PPLA3': return 'Admin capital (district)'
      case 'PPLA4': return 'Admin capital (sub-district)'
      case 'PPL': return 'Populated place (city/town/village)'
      case 'PPLX': return 'Section of populated place'
      case 'PPLL': return 'Locality'
      case 'ADM1': return 'First-order admin area (state)'
      case 'ADM2': return 'Second-order admin (county)'
      case 'ADM3': return 'Third-order admin (district)'
      default: return fc ? `Place (${fc})` : undefined
    }
  }, [rev?.feature_code])
  const now = useNow(30_000)

  // Apply animated background phase
  useEffect(() => {
    const sr = data?.sun?.sunrise || data?.current?.sunrise
    const ss = data?.sun?.sunset || data?.current?.sunset
    const phase = getDayPhase(sr, ss)
    applyPhaseClass(phase)
  }, [data?.sun?.sunrise, data?.sun?.sunset, data?.current?.sunrise, data?.current?.sunset])

  // Apply weather overlay (rain/snow) based on current icon
  useEffect(() => {
    applyWeatherClass(data?.current?.icon)
  }, [data?.current?.icon])

  // Clouds opacity from cloud cover percentage
  useEffect(() => {
    const pct = data?.current?.cloudCoverPct ?? 0
    const op = Math.max(0, Math.min(0.6, 0.05 + (pct / 100) * 0.55))
    document.documentElement.style.setProperty('--clouds-opacity', String(op))
  }, [data?.current?.cloudCoverPct])

  // Windy class when wind speed is high
  useEffect(() => {
    const kph = data?.current?.windKph ?? 0
    const root = document.documentElement
    if (kph >= 25) root.classList.add('weather-windy')
    else root.classList.remove('weather-windy')
  }, [data?.current?.windKph])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <span className="inline-flex items-center gap-2">
          Coordinates • {coords.la.toFixed(4)}, {coords.lo.toFixed(4)}
        </span>
      </h2>
      <div className="flex items-center justify-between">
        <div className="text-sm text-green-400 h-5">{addedMsg}</div>
        <div className="flex items-center gap-2">
          {data && (
            <div className="text-xs text-white/60 mr-2">
              Updated <span className="text-white/80">{formatRelativeTime(new Date(data.fetchedAt), now)}</span>
            </div>
          )}
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm disabled:opacity-60"
            disabled={loading}
            onClick={() => setVersion(v => v + 1)}
          >{loading ? 'Refreshing…' : 'Refresh'}</button>
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
            onClick={() => {
              if (!coords) return
              const label = pretty || `${coords.la.toFixed(4)}, ${coords.lo.toFixed(4)}`
              const next = [...(settings.favorites || [])]
              if (!next.some(f => f.type === 'coords' && f.lat === coords.la && f.lon === coords.lo)) {
                next.unshift({ type: 'coords', label, lat: coords.la, lon: coords.lo })
                setSettings({ favorites: next.slice(0, 20) })
                setAddedMsg('Added to favorites')
                setTimeout(() => setAddedMsg(''), 2000)
              }
            }}
          >
            Add to Favorites
          </button>
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
            onClick={() => {
              try {
                const payload = {
                  type: 'coords',
                  lat: coords.la,
                  lon: coords.lo,
                  label: pretty || `${coords.la.toFixed(4)}, ${coords.lo.toFixed(4)}`,
                  units: settings.units,
                  fetchedAt: new Date().toISOString(),
                  data
                }
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `weather-${coords.la.toFixed(4)}_${coords.lo.toFixed(4)}.json`
                a.click()
                URL.revokeObjectURL(url)
              } catch {}
            }}
          >Export</button>
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
            onClick={async () => {
              const el = document.getElementById('print-area') as HTMLElement | null
              if (!el) return
              const { exportElementPdf } = await import('../lib/exportPdf')
              await exportElementPdf(el, `Weather_${coords.la.toFixed(4)}_${coords.lo.toFixed(4)}`)
            }}
          >Download PDF</button>
          <Link to="/" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Back to Home</Link>
        </div>
      </div>

      {(rgLoading || pretty) && (
        <div className="rounded-2xl p-4 bg-card border border-white/5 flex items-center justify-between gap-3">
          <div className="text-sm">
            {rgLoading && !pretty ? (
              <span className="text-white/70">Finding city name…</span>
            ) : (
              <>
                <span className="text-white/60">Looks like: </span>
                <Link to={`/city/${encodeURIComponent(pretty!)}`} className="text-primary underline underline-offset-2">{pretty}</Link>
              </>
            )}
          </div>
          {pretty && (
            <Link
              to={`/city/${encodeURIComponent(pretty)}`}
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-sm hover:opacity-90"
            >
              Open city page
            </Link>
          )}
        </div>
      )}

      {loading && <p className="text-white/70">Loading...</p>}
      {error && <p className="text-red-300">{error}</p>}

      {data && (
        <div className="sticky top-16 z-10">
          <AlertsBanner lat={data.location.lat} lon={data.location.lon} />
        </div>
      )}

      {/* Location details card */}
      {rev && (
        <div className="rounded-2xl p-4 bg-card border border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            <div><span className="text-white/60">Name: </span><span className="text-white">{rev.name}</span></div>
            {placeType && <div><span className="text-white/60">Type: </span><span className="text-white">{placeType}</span></div>}
            {rev.country && <div><span className="text-white/60">Country: </span><span className="text-white">{rev.country}{rev.country_code ? ` (${rev.country_code})` : ''}</span></div>}
            {rev.admin1 && <div><span className="text-white/60">Admin1: </span><span className="text-white">{rev.admin1}</span></div>}
            {rev.admin2 && <div><span className="text-white/60">Admin2: </span><span className="text-white">{rev.admin2}</span></div>}
            {rev.admin3 && <div><span className="text-white/60">Admin3: </span><span className="text-white">{rev.admin3}</span></div>}
            {rev.admin4 && <div><span className="text-white/60">Admin4: </span><span className="text-white">{rev.admin4}</span></div>}
            {rev.timezone && <div><span className="text-white/60">Timezone: </span><span className="text-white">{rev.timezone}</span></div>}
            <div><span className="text-white/60">Coords: </span><span className="text-white">{rev.latitude.toFixed(4)}, {rev.longitude.toFixed(4)}</span></div>
          </div>
        </div>
      )}

      {data && (
        <div id="print-area" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CurrentCard data={data} />
            <ForecastTabs data={data} />
            <HourlyTempChart data={data} />
          </div>
          <div className="space-y-6">
            <MiniMap lat={data.location.lat} lon={data.location.lon} onPick={(la, lo) => nav(`/lat/${la.toFixed(4)}/lon/${lo.toFixed(4)}`)} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Gauge value={data.current.visibilityKm ?? 0} max={20} label="Visibility (km)" />
              </div>
              <div>
                <Gauge value={data.current.uv ?? 0} max={12} label="UV Index" color="#f59e0b" ariaLabel={`UV index ${Math.round(data.current.uv ?? 0)}`} />
              </div>
              <div>
                <div className="rounded-2xl p-4 bg-card border border-white/5">
                  <div className="text-xs text-white/60">AQI</div>
                  <div className="mt-2">
                    <Gauge value={data.aqi ?? 0} max={500} label={aqiLabel(data.aqi)} color={aqiColor(data.aqi)} ariaLabel={`Air quality ${aqiLabel(data.aqi)} (${Math.round(data.aqi ?? 0)})`} />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl p-4 bg-card border border-white/5">
                <div className="text-xs text-white/60">Pressure</div>
                <div className="text-xl font-semibold mt-1">{Math.round(data.current.pressureHpa ?? 0)} hPa</div>
                <div className="text-xs text-white/60 mt-1 capitalize">{data.pressureTrend ?? '—'}</div>
                {pressureToday.length > 1 && (
                  <div className="mt-2">
                    <Sparkline values={pressureToday} stroke="#a78bfa" ariaLabel="Pressure trend for today" />
                  </div>
                )}
              </div>
              <div className="rounded-2xl p-4 bg-card border border-white/5">
                <div className="text-xs text-white/60">Humidity</div>
                <div className="text-xl font-semibold mt-1">{Math.round(data.current.humidity ?? 0)}%</div>
                <div className="text-xs text-white/60 mt-1">Dew {Math.round(data.current.dewPointC ?? 0)}°C</div>
              </div>
              <div className="rounded-2xl p-4 bg-card border border-white/5">
                <div className="text-xs text-white/60">Wind</div>
                <div className="text-xl font-semibold mt-1">{Math.round(data.current.windKph ?? 0)} km/h</div>
                <div className="text-xs text-white/60 mt-1">Gust {Math.round(data.current.windGustKph ?? 0)} km/h</div>
              </div>
              <div className="rounded-2xl p-4 bg-card border border-white/5">
                <div className="text-xs text-white/60">Temp today</div>
                {tempToday.length > 1 ? (
                  <div className="mt-2">
                    <Sparkline values={tempToday} stroke="#f97316" ariaLabel="Temperature today" />
                  </div>
                ) : <div className="text-sm text-white/60 mt-2">No data</div>}
              </div>
              <CloudCoverCard data={data} />
              <SunMoonCard data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
