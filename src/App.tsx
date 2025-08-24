import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import CityView from './pages/CityView'
import LatLonView from './pages/LatLonView'
import { ThemeToggle } from './components/ThemeToggle'
import { useSettings } from './state/settings'
import { SettingsDialog } from './components/SettingsDialog'
import './index.css'

export default function App(){
  const location = useLocation()
  const nav = useNavigate()
  const [theme, setTheme] = useState<'system'|'light'|'dark'>(() => (localStorage.getItem('theme') as any) || 'system')
  const { settings, setSettings } = useSettings()
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [routeKey, setRouteKey] = useState(location.pathname)

  useEffect(() => {
    setRouteKey(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', isDark)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Respect animations setting by toggling a root class
    const root = document.documentElement
    if (settings.animations) root.classList.remove('no-anim')
    else root.classList.add('no-anim')
  }, [settings.animations])

  useEffect(() => {
    if (!geoError) return
    const t = setTimeout(() => setGeoError(null), 4000)
    return () => clearTimeout(t)
  }, [geoError])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null
      const typing = !!ae && (
        ae.tagName === 'INPUT' ||
        ae.tagName === 'TEXTAREA' ||
        (ae as HTMLInputElement).isContentEditable
      )
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (typing) return
      if(e.key === 's'){
        const btn = document.getElementById('open-settings') as HTMLButtonElement | null
        btn?.click()
      }
      if(e.key === 'g'){
        const btn = document.getElementById('geolocate') as HTMLButtonElement | null
        btn?.click()
      }
      if(e.key === '/'){
        const input = document.getElementById('search') as HTMLInputElement | null
        input?.focus()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onGeolocate = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation not supported')
      return
    }
    setGeoError(null)
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude
        const lo = pos.coords.longitude
        const latStr = la.toFixed(4)
        const lonStr = lo.toFixed(4)
        setGeoLoading(false)
        nav(`/lat/${latStr}/lon/${lonStr}`)
      },
      (err) => {
        setGeoLoading(false)
        setGeoError(err.message || 'Failed to get location')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground bg-gradient-weather">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-block w-6 h-6 bg-primary rounded-lg"></span>
            Weather+ Pro
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle value={theme} onChange={setTheme} />
            <button
              title={settings.animations ? 'Disable animations' : 'Enable animations'}
              onClick={() => setSettings({ animations: !settings.animations })}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
            >
              {settings.animations ? 'Animations: On' : 'Animations: Off'}
            </button>
            <button id="geolocate" onClick={onGeolocate} disabled={geoLoading} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-60">
              {geoLoading ? 'Locating…' : 'Geolocate'}
            </button>
            <button id="open-settings" className="px-3 py-1.5 rounded-xl bg-primary text-white">Settings</button>
            <Link to="/city/Bengaluru" className="text-sm text-primary">Demo: Bengaluru</Link>
          </div>
        </div>
      </header>
      {/* Overlays for weather effects */}
      <div className="weather-overlay pointer-events-none" aria-hidden="true"></div>
      <div className="clouds-overlay pointer-events-none" aria-hidden="true"></div>
      <div className="wind-overlay pointer-events-none" aria-hidden="true"></div>
      <div className="lightning-overlay pointer-events-none" aria-hidden="true"></div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/city/:name" element={<CityView />} />
              <Route path="/lat/:lat/lon/:lon" element={<LatLonView />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="max-w-6xl mx-auto px-4 py-8 text-sm text-white/60">
        <p>Offline-ready PWA. Press s for Settings, / for Search, g for Geolocate.</p>
        {geoError && <p className="mt-2 text-red-400">{geoError}</p>}
      </footer>
      <SettingsDialog />
    </div>
  )
}
