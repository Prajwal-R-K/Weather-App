import { abortableJson } from '../lib/fetcher'
import { getCache, setCache } from '../lib/cache'
import type { NormalizedWeather } from './types'

export type GeoResult = { name: string; latitude: number; longitude: number; country?: string; admin1?: string }

export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<GeoSuggest | null> {
  const key = `om-rev:${lat.toFixed(3)},${lon.toFixed(3)}`
  const cached = getCache<GeoSuggest>(key, 24 * 60 * 60 * 1000)
  if (cached) return cached
  const geoBase = import.meta.env.DEV ? 'https://corsproxy.io/?https://geocoding-api.open-meteo.com' : 'https://geocoding-api.open-meteo.com'
  const url = `${geoBase}/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`
  const data = await abortableJson<{ results?: any[] }>(url, { signal })
  const first = data.results?.[0]
  if (!first) return null
  const res: GeoSuggest = {
    id: first.id ?? 0,
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    country: first.country,
    admin1: first.admin1,
    admin2: first.admin2,
    admin3: first.admin3,
    admin4: first.admin4,
    country_code: first.country_code,
    timezone: first.timezone,
    feature_code: first.feature_code
  }
  setCache(key, res)
  return res
}
export type GeoSuggest = {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
  admin2?: string
  admin3?: string
  admin4?: string
  country_code?: string
  timezone?: string
  feature_code?: string
}

export async function geocodeCity(name: string, signal?: AbortSignal): Promise<GeoResult | null> {
  const key = `om-geo:${name.toLowerCase()}`
  const cached = getCache<GeoResult>(key, 24 * 60 * 60 * 1000)
  if (cached) return cached
  const raw = name.trim()
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
  const qCity = parts[0] || raw
  const qState = parts.length >= 2 ? parts[1] : undefined
  const qCountry = parts.length >= 3 ? parts[parts.length - 1] : undefined
  const geoBase = import.meta.env.DEV ? 'https://corsproxy.io/?https://geocoding-api.open-meteo.com' : 'https://geocoding-api.open-meteo.com'
  const dataCity = await abortableJson<{ results?: any[] }>(
    `${geoBase}/v1/search?name=${encodeURIComponent(qCity)}&count=20&language=en&format=json`,
    { signal }
  )
  const list: any[] = [...(dataCity.results || [])]
  // Also try the raw query to catch cases where admin/country helps
  if (raw.toLowerCase() !== qCity.toLowerCase()){
    try {
      const dataRaw = await abortableJson<{ results?: any[] }>(
        `${geoBase}/v1/search?name=${encodeURIComponent(raw)}&count=10&language=en&format=json`,
        { signal }
      )
      for (const r of (dataRaw.results || [])) list.push(r)
    } catch {}
  }
  // Deduplicate by id or lat/lon
  const seen = new Set<string>()
  const results = list.filter((r: any) => {
    const k = r.id ? `id:${r.id}` : `ll:${r.latitude.toFixed(3)},${r.longitude.toFixed(3)}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  if (!results.length) return null
  // Rank by matching name/admin1/country
  const lc = (s: any) => String(s || '').toLowerCase()
  const sCity = lc(qCity)
  const sState = lc(qState)
  const sCountry = lc(qCountry)
  results.sort((a: any, b: any) => {
    const score = (r: any) => {
      let sc = 0
      if (lc(r.name) === sCity) sc += 5
      else if (lc(r.name).startsWith(sCity)) sc += 3
      if (sState && lc(r.admin1) === sState) sc += 3
      else if (sState && lc(r.admin1).startsWith(sState)) sc += 2
      if (sCountry && lc(r.country) === sCountry) sc += 3
      else if (sCountry && lc(r.country).startsWith(sCountry)) sc += 2
      return sc
    }
    return score(b) - score(a)
  })
  const top = results[0]
  const result: GeoResult = {
    name: top.name,
    latitude: top.latitude,
    longitude: top.longitude,
    country: top.country,
    admin1: top.admin1
  }
  setCache(key, result)
  return result
}

export async function geocodeSuggest(query: string, limit = 5, signal?: AbortSignal): Promise<GeoSuggest[]> {
  const q = query.trim()
  if (!q) return []
  const key = `om-geo-suggest:${q.toLowerCase()}:${limit}`
  const cached = getCache<GeoSuggest[]>(key, 12 * 60 * 60 * 1000)
  if (cached) return cached
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${limit}&language=en&format=json`
  const data = await abortableJson<{ results?: any[] }>(url, { signal })
  const results: GeoSuggest[] = (data.results || []).map((r: any, i: number) => ({
    id: r.id ?? i,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1
  }))
  setCache(key, results)
  return results
}

export async function fetchWeather(lat: number, lon: number, displayName: string, units: 'metric'|'imperial', signal?: AbortSignal): Promise<NormalizedWeather> {
  const key = `om:${lat.toFixed(3)},${lon.toFixed(3)}:${units}`
  const cached = getCache<NormalizedWeather>(key, 15 * 60 * 1000)
  if (cached) return cached
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    // Keep current minimal to avoid 400s
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    // Derive more fields from hourly nearest-to-now
    hourly: 'temperature_2m,precipitation_probability,wind_speed_10m,pressure_msl,visibility,dew_point_2m,wind_gusts_10m,cloud_cover,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    temperature_unit: units === 'imperial' ? 'fahrenheit' : 'celsius',
    wind_speed_unit: units === 'imperial' ? 'mph' : 'kmh'
  })
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  const data = await abortableJson<any>(url, { signal })
  const current = data.current
  const hourly: any = data.hourly
  const daily: any = data.daily
  const toIcon = (code: number): string => {
    // Simple mapping using WMO codes
    if ([0].includes(code)) return 'sun'
    if ([1,2,3].includes(code)) return 'cloud'
    if ([45,48].includes(code)) return 'mist'
    if ([51,53,55,61,63,65,80,81,82].includes(code)) return 'rain'
    if ([71,73,75,85,86].includes(code)) return 'snow'
    if ([95,96,99].includes(code)) return 'thunder'
    return 'cloud'
  }
  const cTemp = units === 'imperial' ? (current.temperature_2m - 32) * 5/9 : current.temperature_2m

  // derive nearest hourly for uv, visibility, dew point
  const htimes: string[] = hourly.time
  let nearestIdx = 0
  if (htimes?.length) {
    const now = Date.now()
    let best = Number.POSITIVE_INFINITY
    for (let i=0;i<htimes.length;i++){
      const diff = Math.abs(new Date(htimes[i]).getTime() - now)
      if (diff < best){ best = diff; nearestIdx = i }
    }
  }
  const uvNow: number | undefined = hourly.uv_index?.[nearestIdx]
  const visNowM: number | undefined = hourly.visibility?.[nearestIdx]
  const dewNowC: number | undefined = hourly.dew_point_2m?.[nearestIdx]
  const pressureNow: number | undefined = hourly.pressure_msl?.[nearestIdx]
  const cloudNow: number | undefined = hourly.cloud_cover?.[nearestIdx]
  const gustNow: number | undefined = hourly.wind_gusts_10m?.[nearestIdx]

  // Pressure trend from last 6 hours slope
  let pressureTrend: 'rising'|'falling'|'steady'|undefined
  try {
    const times: string[] = hourly.time
    const p: number[]|undefined = hourly.pressure_msl
    if (times && p && p.length >= 6) {
      const last = p.slice(-6)
      const x = last.map((_, i) => i)
      const n = last.length
      const meanX = x.reduce((a,b)=>a+b,0)/n
      const meanY = last.reduce((a,b)=>a+b,0)/n
      const num = x.reduce((acc, xi, i) => acc + (xi-meanX)*(last[i]-meanY), 0)
      const den = x.reduce((acc, xi) => acc + (xi-meanX)**2, 0) || 1
      const slope = num/den
      pressureTrend = Math.abs(slope) < 0.02 ? 'steady' : (slope > 0 ? 'rising' : 'falling')
    }
  } catch {}

  // Optional AQI approximation from PM2.5 via air-quality API
  async function fetchAqi(): Promise<number|undefined> {
    try {
      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&timezone=auto`
      const aq = await abortableJson<any>(aqUrl, { signal })
      const series: number[]|undefined = aq.hourly?.pm2_5
      const tseries: string[]|undefined = aq.hourly?.time
      if (!series || !tseries || series.length === 0) return undefined
      // pick nearest hour to now
      const now = Date.now()
      let idx = 0, best = Number.POSITIVE_INFINITY
      for (let i=0;i<tseries.length;i++){
        const diff = Math.abs(new Date(tseries[i]).getTime() - now)
        if (diff < best){ best = diff; idx = i }
      }
      const pm25 = series[idx]
      // Simple PM2.5 to AQI mapping (US EPA breakpoints)
      const bp = [
        { cLow: 0.0, cHigh: 12.0, aLow: 0, aHigh: 50 },
        { cLow: 12.1, cHigh: 35.4, aLow: 51, aHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, aLow: 101, aHigh: 150 },
        { cLow: 55.5, cHigh: 150.4, aLow: 151, aHigh: 200 },
        { cLow: 150.5, cHigh: 250.4, aLow: 201, aHigh: 300 },
        { cLow: 250.5, cHigh: 350.4, aLow: 301, aHigh: 400 },
        { cLow: 350.5, cHigh: 500.4, aLow: 401, aHigh: 500 }
      ]
      const seg = bp.find(b => pm25 >= b.cLow && pm25 <= b.cHigh)
      if (!seg) return undefined
      const aqi = Math.round((seg.aHigh - seg.aLow)/(seg.cHigh - seg.cLow) * (pm25 - seg.cLow) + seg.aLow)
      return aqi
    } catch { return undefined }
  }

  const norm: NormalizedWeather = {
    location: { name: displayName, lat, lon },
    current: {
      tempC: cTemp,
      tempF: units === 'imperial' ? current.temperature_2m : current.temperature_2m * 9/5 + 32,
      feelsC: units === 'imperial' ? (current.apparent_temperature - 32) * 5/9 : current.apparent_temperature,
      feelsF: units === 'imperial' ? current.apparent_temperature : current.apparent_temperature * 9/5 + 32,
      humidity: current.relative_humidity_2m,
      windKph: units === 'imperial' ? current.wind_speed_10m * 1.609 : current.wind_speed_10m,
      windMph: units === 'imperial' ? current.wind_speed_10m : current.wind_speed_10m / 1.609,
      pressureHpa: pressureNow,
      uv: uvNow,
      sunrise: daily.sunrise?.[0],
      sunset: daily.sunset?.[0],
      icon: toIcon(current.weather_code ?? 1),
      visibilityKm: typeof visNowM === 'number' ? Math.round(visNowM / 1000) : undefined,
      dewPointC: dewNowC,
      windGustKph: typeof gustNow === 'number' ? (units === 'imperial' ? gustNow * 1.609 : gustNow) : undefined,
      cloudCoverPct: cloudNow
    },
    hourly: hourly.time.map((t: string, i: number) => ({
      time: t,
      tempC: units === 'imperial' ? (hourly.temperature_2m[i] - 32) * 5/9 : hourly.temperature_2m[i],
      precipProb: hourly.precipitation_probability?.[i],
      windKph: units === 'imperial' ? hourly.wind_speed_10m?.[i] * 1.609 : hourly.wind_speed_10m?.[i],
      pressureHpa: hourly.pressure_msl?.[i]
    })),
    daily: daily.time.map((d: string, i: number) => ({
      date: d,
      minC: units === 'imperial' ? (daily.temperature_2m_min[i] - 32) * 5/9 : daily.temperature_2m_min[i],
      maxC: units === 'imperial' ? (daily.temperature_2m_max[i] - 32) * 5/9 : daily.temperature_2m_max[i],
      icon: toIcon(daily.weather_code?.[i] ?? 1)
    })),
    fetchedAt: Date.now(),
    provider: 'open-meteo',
    pressureTrend,
    sun: { sunrise: daily.sunrise?.[0], sunset: daily.sunset?.[0] }
  }
  // fetch AQI in background (non-blocking for UI speed)
  fetchAqi().then(aqi => { if (typeof aqi === 'number') { const next = { ...norm, aqi }; setCache(key, next) } })
  setCache(key, norm)
  return norm
}
