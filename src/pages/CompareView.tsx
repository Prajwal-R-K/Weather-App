import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useCityWeather } from '../hooks/useWeather'
import { CurrentCard } from '../components/CurrentCard'
import { HourlyTempChart } from '../components/HourlyTempChart'
import { ForecastTabs } from '../components/ForecastTabs'
import { MiniMap } from '../components/MiniMap'
import { exportElementPdf } from '../lib/exportPdf'
import { useNow, formatRelativeTime } from '../lib/time'

export default function CompareView(){
  const [sp, setSp] = useSearchParams()
  const [left, setLeft] = useState(sp.get('a') || 'Bengaluru')
  const [right, setRight] = useState(sp.get('b') || 'Mumbai')
  const { data: leftData, loading: leftLoading, error: leftError, refresh: refreshLeft } = useCityWeather(left)
  const { data: rightData, loading: rightLoading, error: rightError, refresh: refreshRight } = useCityWeather(right)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const now = useNow(30_000)

  // Memoized key metrics
  const leftToday = leftData?.daily?.[0]?.date
  const rightToday = rightData?.daily?.[0]?.date
  const leftMaxPrecip = useMemo(() => {
    if (!leftData || !leftToday) return undefined
    const vals = (leftData.hourly || [])
      .filter(h => h.time.slice(0,10) === leftToday)
      .map(h => h.precipProb ?? 0)
    return vals.length ? Math.max(...vals) : undefined
  }, [leftData, leftToday])
  const rightMaxPrecip = useMemo(() => {
    if (!rightData || !rightToday) return undefined
    const vals = (rightData.hourly || [])
      .filter(h => h.time.slice(0,10) === rightToday)
      .map(h => h.precipProb ?? 0)
    return vals.length ? Math.max(...vals) : undefined
  }, [rightData, rightToday])

  // Keep URL in sync for shareability
  useEffect(() => {
    const params = new URLSearchParams(sp)
    params.set('a', left)
    params.set('b', right)
    setSp(params, { replace: true })
  }, [left, right])

  const canExport = !!(leftData || rightData)

  return (
    <div ref={wrapRef} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-sm text-primary">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-sm opacity-80">Compare</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
            onClick={() => {
              setLeft(right)
              setRight(left)
            }}
          >Swap</button>
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm disabled:opacity-60"
            disabled={!canExport}
            onClick={async () => {
              const el = document.getElementById('print-area')
              if (el) await exportElementPdf(el, `Compare_${left}_vs_${right}.pdf`)
            }}
          >Download PDF</button>
        </div>
      </div>

      <div id="print-area" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="City A (e.g., Bengaluru)"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl p-4 bg-card border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-70">City A</div>
              <div className="flex items-center gap-2">
                {leftData && (
                  <div className="text-xs text-white/60">
                    Updated <span className="text-white/80">{formatRelativeTime(new Date(leftData.fetchedAt), now)}</span>
                  </div>
                )}
                <button
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs disabled:opacity-60"
                  disabled={leftLoading}
                  onClick={() => refreshLeft()}
                >{leftLoading ? 'Refreshing…' : 'Refresh'}</button>
              </div>
            </div>
            {leftLoading && <div className="text-white/60">Loading…</div>}
            {leftError && <div className="text-red-300">{leftError}</div>}
            {!leftLoading && !leftError && leftData && (
              <div className="space-y-6">
                {/* Key metrics row */}
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                    <div className="flex flex-col"><span className="text-white/60">Now</span><span className="font-medium">{Math.round(leftData.current.tempC)}°C</span></div>
                    <div className="flex flex-col"><span className="text-white/60">Max / Min</span><span className="font-medium">{Math.round(leftData.daily?.[0]?.maxC ?? 0)}° / {Math.round(leftData.daily?.[0]?.minC ?? 0)}°</span></div>
                    <div className="flex flex-col"><span className="text-white/60">Wind</span><span className="font-medium">{Math.round(leftData.current.windKph ?? 0)} km/h</span></div>
                    <div className="flex flex-col"><span className="text-white/60">Precip</span><span className="font-medium">{leftMaxPrecip != null ? `${Math.round(leftMaxPrecip)}%` : '—'}</span></div>
                    <div className="flex flex-col"><span className="text-white/60">AQI</span><span className="font-medium">{leftData.aqi != null ? Math.round(leftData.aqi) : '—'}</span></div>
                  </div>
                </div>
                <CurrentCard data={leftData} />
                <ForecastTabs data={leftData} />
                <HourlyTempChart data={leftData} syncId="compare-hourly" />
                <MiniMap lat={leftData.location.lat} lon={leftData.location.lon} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="City B (e.g., Mumbai)"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl p-4 bg-card border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-70">City B</div>
              <div className="flex items-center gap-2">
                {rightData && (
                  <div className="text-xs text-white/60">
                    Updated <span className="text-white/80">{formatRelativeTime(new Date(rightData.fetchedAt), now)}</span>
                  </div>
                )}
                <button
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs disabled:opacity-60"
                  disabled={rightLoading}
                  onClick={() => refreshRight()}
                >{rightLoading ? 'Refreshing…' : 'Refresh'}</button>
              </div>
            </div>
            {rightLoading && <div className="text-white/60">Loading…</div>}
            {rightError && <div className="text-red-300">{rightError}</div>}
            {!rightLoading && !rightError && rightData && (
              <div className="space-y-6">
                {/* Key metrics row */}
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                    <div className="flex flex-col"><span className="text-white/60">Now</span><span className="font-medium">{Math.round(rightData.current.tempC)}°C</span></div>
                    <div className="flex flex-col"><span className="text-white/60">Max / Min</span><span className="font-medium">{Math.round(rightData.daily?.[0]?.maxC ?? 0)}° / {Math.round(rightData.daily?.[0]?.minC ?? 0)}°</span></div>
                    <div className="flex flex-col"><span className="text-white/60">Wind</span><span className="font-medium">{Math.round(rightData.current.windKph ?? 0)} km/h</span></div>
                    <div className="flex flex-col"><span className="text-white/60">Precip</span><span className="font-medium">{rightMaxPrecip != null ? `${Math.round(rightMaxPrecip)}%` : '—'}</span></div>
                    <div className="flex flex-col"><span className="text-white/60">AQI</span><span className="font-medium">{rightData.aqi != null ? Math.round(rightData.aqi) : '—'}</span></div>
                  </div>
                </div>
                <CurrentCard data={rightData} />
                <ForecastTabs data={rightData} />
                <HourlyTempChart data={rightData} syncId="compare-hourly" />
                <MiniMap lat={rightData.location.lat} lon={rightData.location.lon} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
