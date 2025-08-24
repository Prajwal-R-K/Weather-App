import type { NormalizedWeather } from '../api/types'
import { Gauge } from './Gauge'

export function CloudCoverCard({ data }: { data: NormalizedWeather }){
  const cloud = data.current.cloudCoverPct ?? 0
  return (
    <div className="rounded-2xl p-4 bg-card border border-white/5">
      <div className="text-xs text-white/60">Cloud Cover</div>
      <div className="mt-2">
        <Gauge value={cloud} max={100} label={`${Math.round(cloud)}%`} color="#60a5fa" />
      </div>
    </div>
  )
}
