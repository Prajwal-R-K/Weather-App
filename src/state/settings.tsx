import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Units = 'metric' | 'imperial'
export type Provider = 'open-meteo' | 'openweather'

export type Favorite =
  | { type: 'city'; label: string }
  | { type: 'coords'; label: string; lat: number; lon: number }

export type Settings = {
  units: Units
  provider: Provider
  dynamicTheme: boolean
  particles: boolean
  animations: boolean
  owmKey: string | null
  favorites: Favorite[]
}

const DEFAULT_SETTINGS: Settings = {
  units: (localStorage.getItem('units') as Units) || 'metric',
  provider: (localStorage.getItem('provider') as Provider) || 'open-meteo',
  dynamicTheme: localStorage.getItem('dynamicTheme') !== 'false',
  particles: localStorage.getItem('particles') === 'true',
  animations: localStorage.getItem('animations') ? localStorage.getItem('animations') === 'true' : !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  owmKey: localStorage.getItem('owmKey'),
  favorites: (() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]') as Favorite[] } catch { return [] }
  })(),
}

const SettingsCtx = createContext<{
  settings: Settings
  setSettings: (s: Partial<Settings>) => void
}>({ settings: DEFAULT_SETTINGS, setSettings: () => {} })

export function SettingsProvider({ children }: { children: React.ReactNode }){
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const setSettings = (s: Partial<Settings>) => setSettingsState(prev => ({ ...prev, ...s }))

  useEffect(() => {
    localStorage.setItem('units', settings.units)
    localStorage.setItem('provider', settings.provider)
    localStorage.setItem('dynamicTheme', String(settings.dynamicTheme))
    localStorage.setItem('particles', String(settings.particles))
    localStorage.setItem('animations', String(settings.animations))
    if (settings.owmKey) localStorage.setItem('owmKey', settings.owmKey)
    localStorage.setItem('favorites', JSON.stringify(settings.favorites || []))
  }, [settings])

  const value = useMemo(() => ({ settings, setSettings }), [settings])
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>
}

export function useSettings(){
  return useContext(SettingsCtx)
}
