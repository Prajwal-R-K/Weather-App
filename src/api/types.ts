export type NormalizedCurrent = {
  tempC: number
  tempF: number
  feelsC?: number
  feelsF?: number
  humidity?: number
  windKph?: number
  windMph?: number
  pressureHpa?: number
  uv?: number
  sunrise?: string
  sunset?: string
  icon: string // key for local svg icon
  visibilityKm?: number
  dewPointC?: number
  windGustKph?: number
  cloudCoverPct?: number
}

export type NormalizedHourlyPoint = {
  time: string // ISO
  tempC: number
  precipProb?: number
  windKph?: number
  pressureHpa?: number
}

export type NormalizedDaily = {
  date: string
  minC: number
  maxC: number
  icon: string
}

export type NormalizedWeather = {
  location: { name: string; lat: number; lon: number }
  current: NormalizedCurrent
  hourly: NormalizedHourlyPoint[]
  daily: NormalizedDaily[]
  fetchedAt: number
  provider: 'open-meteo' | 'openweather'
  aqi?: number // 0-500 AQI (approx scaled)
  pressureTrend?: 'rising' | 'falling' | 'steady'
  sun?: { sunrise: string; sunset: string }
  moon?: { moonrise?: string; moonset?: string }
}
