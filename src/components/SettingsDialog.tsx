import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../state/settings'

export function SettingsDialog(){
  const { settings, setSettings } = useSettings()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const btn = document.getElementById('open-settings')
    const handler = () => setOpen(true)
    btn?.addEventListener('click', handler)
    return () => btn?.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    if(open) ref.current?.showModal(); else ref.current?.close()
  }, [open])

  return (
    <dialog ref={ref} className="rounded-2xl bg-card text-foreground border border-white/10 w-[90vw] max-w-lg">
      <form method="dialog" className="p-5 space-y-5">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button onClick={()=>setOpen(false)} aria-label="Close" className="px-3 py-1 rounded-xl bg-white/10">✕</button>
        </header>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Units</label>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setSettings({ units: 'metric' })} className={`px-3 py-1.5 rounded-xl ${settings.units==='metric'?'bg-primary text-white':'bg-white/5'}`}>Metric (°C, km/h)</button>
              <button type="button" onClick={()=>setSettings({ units: 'imperial' })} className={`px-3 py-1.5 rounded-xl ${settings.units==='imperial'?'bg-primary text-white':'bg-white/5'}`}>Imperial (°F, mph)</button>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">API Provider</label>
            <select value={settings.provider} onChange={e=>setSettings({ provider: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <option value="open-meteo">Open-Meteo (no key)</option>
              <option value="openweather">OpenWeatherMap (requires key)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">OpenWeatherMap API Key</label>
            <input defaultValue={settings.owmKey ?? ''} onBlur={(e)=>setSettings({ owmKey: e.target.value || null })} placeholder="Paste key" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10" />
            <p className="text-xs text-white/60 mt-1">Stored locally in your browser (localStorage).</p>
          </div>
          <div className="flex items-center gap-2">
            <input id="dynamicTheme" type="checkbox" checked={settings.dynamicTheme} onChange={e=>setSettings({ dynamicTheme: e.target.checked })} />
            <label htmlFor="dynamicTheme">Dynamic weather theme</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="particles" type="checkbox" checked={settings.particles} onChange={e=>setSettings({ particles: e.target.checked })} />
            <label htmlFor="particles">Particle effects</label>
          </div>
        </div>
        <div className="pt-2 text-right">
          <button className="px-4 py-2 rounded-xl bg-primary text-white" onClick={()=>setOpen(false)}>Done</button>
        </div>
      </form>
    </dialog>
  )
}
