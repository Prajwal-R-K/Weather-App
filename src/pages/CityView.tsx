import { useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCityWeather } from '../hooks/useWeather'
import { WeatherIcon } from '../components/WeatherIcon'
import { CurrentCard } from '../components/CurrentCard'
import { ForecastTabs } from '../components/ForecastTabs'
import { HourlyTempChart } from '../components/HourlyTempChart'
import { MiniMap } from '../components/MiniMap'
import { Gauge } from '../components/Gauge'
import { SunMoonCard } from '../components/SunMoonCard'
import { CloudCoverCard } from '../components/CloudCoverCard'
import { Sparkline } from '../components/Sparkline'
import { applyPhaseClass, applyWeatherClass, getDayPhase } from '../lib/dayPhase'
import { aqiColor, aqiLabel } from '../lib/aqi'

export default function CityView(){
  const { name } = useParams()
  const city = decodeURIComponent(name || '')
  const { data, loading, error } = useCityWeather(city)
  const today = data?.daily?.[0]?.date
  const pressureToday = useMemo(() => (data?.hourly || []).filter(h => h.time.slice(0,10) === today).map(h => Math.round(h.pressureHpa ?? 0)).filter(n => n>0), [data, today])
  const tempToday = useMemo(() => (data?.hourly || []).filter(h => h.time.slice(0,10) === today).map(h => Math.round(h.tempC)), [data, today])

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
          {data && <WeatherIcon name={data.current.icon} className="w-6 h-6 text-primary" />}
          {city}
        </span>
      </h2>
      <div className="flex items-center justify-between">
        <div />
        <Link to="/" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Back to Home</Link>
      </div>

      {loading && <p className="text-white/70">Loading...</p>}
      {error && <p className="text-red-300">{error}</p>}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CurrentCard data={data} />
            <ForecastTabs data={data} />
            <HourlyTempChart data={data} />
          </div>
          <div className="space-y-6">
            <MiniMap lat={data.location.lat} lon={data.location.lon} />
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

function SmallMetric({ title, value, note }: { title: string; value: string | number; note?: string }){
  return (
    <div className="rounded-2xl p-4 bg-card border border-white/5">
      <div className="text-xs text-white/60">{title}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
      {note && <div className="text-xs text-white/50 mt-1">{note}</div>}
    </div>
  )
}
