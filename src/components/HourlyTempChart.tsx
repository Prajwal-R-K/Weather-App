import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { NormalizedWeather } from '../api/types'

export function HourlyTempChart({ data }: { data: NormalizedWeather }){
  const points = useMemo(() => {
    const today = data.daily?.[0]?.date ?? new Date().toISOString().slice(0,10)
    return data.hourly
      .filter(p => p.time.slice(0,10) === today)
      .map(p => ({ time: new Date(p.time).getHours(), tempC: Math.round(p.tempC) }))
  }, [data])

  if(points.length === 0) return null

  return (
    <div className="rounded-2xl bg-card border border-white/5 p-3 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="rgb(56 189 248)" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tickFormatter={(h) => `${h}`}
                 tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[ (min:number) => Math.floor(min-2), (max:number)=> Math.ceil(max+2) ]} />
          <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                   labelFormatter={(h) => `${h}:00`}
                   formatter={(v) => [`${v}°C`, 'Temp']} />
          <Area type="monotone" dataKey="tempC" stroke="rgb(56 189 248)" fill="url(#tempGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
