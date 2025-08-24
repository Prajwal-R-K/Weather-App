export type DayPhase = 'night' | 'dawn' | 'day' | 'dusk'

function parseLocal(ts?: string): number | undefined {
  if (!ts) return undefined
  const d = new Date(ts)
  const n = d.getTime()
  return Number.isFinite(n) ? n : undefined
}

export function getDayPhase(sunrise?: string, sunset?: string, nowMs: number = Date.now()): DayPhase {
  const sr = parseLocal(sunrise)
  const ss = parseLocal(sunset)
  if (!sr || !ss) return 'day'
  const hour = 60 * 60 * 1000
  const dawnStart = sr - hour
  const dawnEnd = sr + hour
  const duskStart = ss - hour
  const duskEnd = ss + hour
  if (nowMs >= dawnStart && nowMs <= dawnEnd) return 'dawn'
  if (nowMs >= duskStart && nowMs <= duskEnd) return 'dusk'
  if (nowMs > dawnEnd && nowMs < duskStart) return 'day'
  return 'night'
}

const PHASE_CLASSES: Record<DayPhase, string> = {
  night: 'phase-night',
  dawn: 'phase-dawn',
  day: 'phase-day',
  dusk: 'phase-dusk'
}

export function applyPhaseClass(phase: DayPhase){
  const cls = PHASE_CLASSES[phase]
  const root = document.documentElement
  // remove prior phase classes
  root.classList.remove('phase-night', 'phase-dawn', 'phase-day', 'phase-dusk')
  root.classList.add(cls)
}

export function applyWeatherClass(icon?: string){
  const root = document.documentElement
  root.classList.remove('weather-rain', 'weather-snow', 'weather-thunder')
  if (!icon) return
  if (icon === 'rain') {
    root.classList.add('weather-rain')
  } else if (icon === 'thunder') {
    root.classList.add('weather-thunder')
  } else if (icon === 'snow') {
    root.classList.add('weather-snow')
  }
}
