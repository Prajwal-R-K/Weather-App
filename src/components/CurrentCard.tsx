import { WeatherIcon } from './WeatherIcon'
import { useSettings } from '../state/settings'
import type { NormalizedWeather } from '../api/types'

export function CurrentCard({ data }: { data: NormalizedWeather }) {
  const { settings, setSettings } = useSettings()
  const isMetric = settings.units === 'metric'
  const t = isMetric ? Math.round(data.current.tempC) : Math.round(data.current.tempF)
  const feels = isMetric ? Math.round(data.current.feelsC ?? data.current.tempC) : Math.round(data.current.feelsF ?? data.current.tempF)
  const hi = Math.round(data.daily?.[0]?.maxC ?? data.current.tempC)
  const lo = Math.round(data.daily?.[0]?.minC ?? data.current.tempC)

  return (
    <div className="p-5 rounded-2xl bg-card shadow-soft border border-white/5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">Updated just now</div>
          <div className="mt-2 flex items-center gap-3">
            <WeatherIcon name={data.current.icon} className="w-10 h-10 text-primary" />
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold">{t}°</div>
              <div className="text-xl">{isMetric ? 'C' : 'F'}</div>
            </div>
          </div>
          <div className="text-white/80 mt-1">Feels {feels}°</div>
          <div className="text-white/60 text-sm mt-1">H {hi}°  L {lo}°</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSettings({ ...settings, units: 'imperial' })} className={`px-2 py-1 rounded-lg text-sm border ${!isMetric ? 'bg-primary text-white' : 'bg-white/5'}`}>
            °F
          </button>
          <button onClick={() => setSettings({ ...settings, units: 'metric' })} className={`px-2 py-1 rounded-lg text-sm border ${isMetric ? 'bg-primary text-white' : 'bg-white/5'}`}>
            °C
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Humidity" value={`${Math.round(data.current.humidity ?? 0)}%`} />
        <Metric label="Wind" value={`${Math.round(data.current.windKph ?? 0)} km/h`} />
        <Metric label="Pressure" value={`${Math.round(data.current.pressureHpa ?? 0)} hPa`} />
        <Metric label="UV" value={`${Math.round(data.current.uv ?? 0)}`} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }){
  return (
    <div>
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg">{value}</div>
    </div>
  )
}
