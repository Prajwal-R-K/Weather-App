import type { NormalizedWeather } from '../api/types'

function dayName(dateIso: string) {
  const d = new Date(dateIso)
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

export function ForecastTabs({ data }: { data: NormalizedWeather }){
  const days = data.daily.slice(0, 6)
  return (
    <div className="rounded-2xl bg-card border border-white/5 p-3">
      <div className="flex gap-2 overflow-x-auto">
        {days.map((d, i) => (
          <div key={d.date} className={`min-w-[90px] px-3 py-2 rounded-xl text-center ${i===0? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}>
            <div className="text-xs text-white/60">{i===0 ? 'Today' : dayName(d.date)}</div>
            <div className="mt-1 font-medium">{Math.round(d.maxC)}° / {Math.round(d.minC)}°</div>
          </div>
        ))}
      </div>
    </div>
  )
}
