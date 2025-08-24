import type { NormalizedWeather } from '../api/types'

export function SunMoonCard({ data }: { data: NormalizedWeather }){
  const sunrise = data.sun?.sunrise ? new Date(data.sun.sunrise) : undefined
  const sunset = data.sun?.sunset ? new Date(data.sun.sunset) : undefined
  const moonrise = data.moon?.moonrise ? new Date(data.moon.moonrise) : undefined
  const moonset = data.moon?.moonset ? new Date(data.moon.moonset) : undefined

  function fmt(t?: Date){
    if(!t) return '—'
    return t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="rounded-2xl p-4 bg-card border border-white/5">
      <div className="text-xs text-white/60 mb-2">Sun & Moon</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-white/70">Sunrise</div>
          <div className="font-medium">{fmt(sunrise)}</div>
          <div className="mt-2 text-white/70">Sunset</div>
          <div className="font-medium">{fmt(sunset)}</div>
        </div>
        <div>
          <div className="text-white/70">Moonrise</div>
          <div className="font-medium">{fmt(moonrise)}</div>
          <div className="mt-2 text-white/70">Moonset</div>
          <div className="font-medium">{fmt(moonset)}</div>
        </div>
      </div>
    </div>
  )
}
