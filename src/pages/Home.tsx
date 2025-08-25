import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCityWeather } from '../hooks/useWeather'
import { HourlyTempChart } from '../components/HourlyTempChart'
import { MiniMap } from '../components/MiniMap'
import { geocodeSuggest, reverseGeocode, type GeoSuggest } from '../api/openMeteo'
import { FavoritesBar } from '../components/FavoritesBar'

export default function Home(){
  const [q, setQ] = useState('')
  const [previewCity, setPreviewCity] = useState('Bengaluru')
  const [suggestions, setSuggestions] = useState<GeoSuggest[]>([])
  const [openSug, setOpenSug] = useState(false)
  const [hi, setHi] = useState<number>(-1) // highlighted index
  const [ghost, setGhost] = useState('')
  const [picked, setPicked] = useState<{ lat: number; lon: number } | null>(null)
  const nav = useNavigate()
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = q.trim()
    if (!text) return
    const m = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
    if (m){
      const la = Number(m[1]).toFixed(4)
      const lo = Number(m[2]).toFixed(4)
      nav(`/lat/${la}/lon/${lo}`)
    } else {
      nav(`/city/${encodeURIComponent(text)}`)
    }
  }
  // Debounce city preview
  useEffect(() => {
    const clean = setTimeout(() => setPreviewCity(q.trim() || 'Bengaluru'), 400)
    return () => clearTimeout(clean)
  }, [q])
  // Debounced suggestions
  useEffect(() => {
    if (!q.trim()) { setSuggestions([]); setOpenSug(false); return }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await geocodeSuggest(q, 6, ctrl.signal)
        setSuggestions(res)
        setOpenSug(res.length > 0)
      } catch { setSuggestions([]); setOpenSug(false) }
    }, 300)
    return () => { ctrl.abort(); clearTimeout(t) }
  }, [q])
  // Inline ghost completion from top suggestion starting with input
  useEffect(() => {
    setHi(-1)
    const lower = q.trim().toLowerCase()
    if (!lower) { setGhost(''); return }
    const first = suggestions
      .map(s => [s.name, s.admin1, s.country].filter(Boolean).join(', '))
      .find(lbl => lbl.toLowerCase().startsWith(lower))
    if (first && first.length > lower.length) setGhost(first.slice(q.length))
    else setGhost('')
  }, [q, suggestions])
  const { data, loading, error } = useCityWeather(previewCity)
  return (
    <div className="space-y-8">
      <FavoritesBar />
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 p-6 rounded-2xl bg-card shadow-soft">
          <h1 className="text-2xl font-semibold mb-2">Weather+ Pro</h1>
          <p className="text-white/70">Advanced PWA weather with offline cache, charts, maps, and shareable routes.</p>
          <form onSubmit={onSubmit} className="mt-6 flex gap-2 relative">
            <div className="relative flex-1">
              {/* Ghost autocomplete overlay */}
              {ghost && (
                <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center px-3 text-white/30">
                  <span className="invisible">{q}</span>
                  <span>{ghost}</span>
                </div>
              )}
              <input
                id="search"
                value={q}
                onChange={e=>setQ(e.target.value)}
                onFocus={()=>{ if (suggestions.length) setOpenSug(true) }}
                onKeyDown={(e) => {
                  if (!openSug || suggestions.length === 0) {
                    if (e.key === 'Tab' && ghost) { e.preventDefault(); setQ(q + ghost); setGhost(''); }
                    return
                  }
                  if (e.key === 'ArrowDown'){ e.preventDefault(); setHi(i=> (i+1) % suggestions.length) }
                  else if (e.key === 'ArrowUp'){ e.preventDefault(); setHi(i=> (i<=0? suggestions.length : i) - 1) }
                  else if (e.key === 'Enter'){
                    if (hi >= 0){
                      e.preventDefault();
                      const s = suggestions[hi];
                      const label = [s.name, s.admin1, s.country].filter(Boolean).join(', ')
                      setQ(label); setPreviewCity(label); setOpenSug(false)
                      nav(`/city/${encodeURIComponent(label)}`)
                    }
                  } else if (e.key === 'Tab' && ghost){ e.preventDefault(); setQ(q + ghost); setGhost('') }
                  else if (e.key === 'Escape'){ setOpenSug(false) }
                }}
                placeholder="Search city (e.g., Bengaluru or 'San Jose, CA')"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
              />
            </div>
            <button className="rounded-xl bg-primary px-4 text-white">Go</button>
            {openSug && (
              <div className="absolute left-0 right-28 top-[calc(100%+6px)] z-20 rounded-xl bg-card border border-white/10 shadow-soft max-h-72 overflow-auto">
                {suggestions.map((s, idx) => {
                  const label = [s.name, s.admin1, s.country].filter(Boolean).join(', ')
                  return (
                    <button
                      key={`${s.id}-${s.latitude}-${s.longitude}`}
                      type="button"
                      onClick={() => { setQ(label); setPreviewCity(label); setOpenSug(false); nav(`/city/${encodeURIComponent(label)}`) }}
                      className={`w-full text-left px-3 py-2 hover:bg-white/5 ${hi===idx? 'bg-white/10' : ''}`}
                    >
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-white/60">{[s.admin1, s.country].filter(Boolean).join(', ')}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </form>
          <div className="mt-3 text-sm text-white/60">Shortcuts: / to focus, Enter to search</div>
          <div className="mt-4 text-sm text-white/70">Live preview city: <span className="text-primary font-medium">{previewCity}</span></div>
        </div>
        <div className="md:col-span-4 p-6 rounded-2xl bg-card shadow-soft">
          <h2 className="font-medium mb-2">Quick Links</h2>
          <ul className="list-disc list-inside text-white/80">
            <li><Link to="/city/Bengaluru" className="text-primary">/city/Bengaluru</Link></li>
            <li><Link to="/lat/12.97/lon/77.59" className="text-primary">/lat/12.97/lon/77.59</Link></li>
          </ul>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Hourly chart ({previewCity})</h2>
            {loading && <span className="text-xs text-white/60">Loading…</span>}
            {error && <span className="text-xs text-red-400">{String(error)}</span>}
          </div>
          {data ? <HourlyTempChart data={data} /> : <div className="text-white/60 text-sm">No data</div>}
        </div>
        <div className="p-6 rounded-2xl bg-card shadow-soft">
          <h2 className="font-medium mb-2">Map selector</h2>
          {data ? (
            <MiniMap
              lat={picked?.lat ?? data.location.lat}
              lon={picked?.lon ?? data.location.lon}
              onPick={async (plat, plon) => {
                setPicked({ lat: plat, lon: plon })
                // Close UI affordances and navigate to Lat/Lon page with coords label
                setOpenSug(false)
                setGhost('')
                const latStr = plat.toFixed(4)
                const lonStr = plon.toFixed(4)
                const coordLabel = `${latStr}, ${lonStr}`
                setQ(coordLabel)
                setPreviewCity(coordLabel)
                nav(`/lat/${latStr}/lon/${lonStr}`)
              }}
            />
          ) : <div className="text-white/60 text-sm">No map</div>}
          <div className="text-xs text-white/60 mt-2">Tap the Search above to pick another city.</div>
        </div>
      </section>
    </div>
  )
}
