import { useState } from 'react'
import { useAlerts } from '../hooks/useAlerts'

function severityColor(sev?: string){
  const s = (sev || '').toLowerCase()
  if (['extreme', 'severe', 'warning'].includes(s)) return 'bg-red-500/20 text-red-200 border-red-400/40'
  if (['moderate', 'watch'].includes(s)) return 'bg-amber-500/20 text-amber-200 border-amber-400/40'
  if (['minor', 'advisory', 'information'].includes(s)) return 'bg-blue-500/20 text-blue-200 border-blue-400/40'
  return 'bg-amber-500/10 text-amber-100 border-amber-300/30'
}

export function AlertsBanner({ lat, lon }: { lat?: number; lon?: number }){
  const { alerts, loading, error } = useAlerts(lat, lon)
  const [open, setOpen] = useState(false)

  if (loading) return null
  if (error) return null
  if (!alerts || alerts.length === 0) return null

  const top = alerts[0]
  const sevCls = severityColor(top.severity)

  return (
    <div className={`rounded-2xl border ${sevCls} px-4 py-3 flex items-start justify-between gap-3`}>
      <div className="flex-1">
        <div className="text-sm font-semibold">{top.event || 'Weather Alert'}</div>
        <div className="text-xs opacity-80 mt-0.5">
          {top.severity ? `${top.severity}` : 'Alert'} • {alerts.length} active
        </div>
        {open && (
          <div className="mt-3 space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-xl bg-black/20 border border-white/10 p-3">
                <div className="text-sm font-medium">{a.event || 'Alert'}</div>
                <div className="text-xs opacity-80 mt-1">
                  {a.start ? new Date(a.start).toLocaleString() : ''}
                  {a.end ? ` → ${new Date(a.end).toLocaleString()}` : ''}
                </div>
                {a.description && (
                  <div className="text-sm opacity-90 mt-2 whitespace-pre-wrap">{a.description}</div>
                )}
                {a.instruction && (
                  <div className="text-sm opacity-90 mt-2 whitespace-pre-wrap">{a.instruction}</div>
                )}
                {a.sender && (
                  <div className="text-xs opacity-70 mt-2">Source: {a.sender}</div>
                )}
                {a.url && (
                  <div className="text-xs mt-2"><a className="underline" href={a.url} target="_blank" rel="noreferrer">More info</a></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
          onClick={() => setOpen(o => !o)}
        >{open ? 'Hide details' : 'View details'}</button>
      </div>
    </div>
  )
}
