import { describe, it, expect } from 'vitest'
import { aqiLabel, aqiColor } from './aqi'

describe('aqi helpers', () => {
  it('aqiLabel maps ranges', () => {
    expect(aqiLabel(undefined)).toBe('—')
    expect(aqiLabel(0)).toBe('Good')
    expect(aqiLabel(75)).toBe('Moderate')
    expect(aqiLabel(125)).toBe('Unhealthy (SG)')
    expect(aqiLabel(180)).toBe('Unhealthy')
    expect(aqiLabel(250)).toBe('Very Unhealthy')
    expect(aqiLabel(400)).toBe('Hazardous')
  })

  it('aqiColor maps ranges', () => {
    expect(aqiColor(undefined)).toBe('#6b7280')
    expect(aqiColor(25)).toBe('#22c55e')
    expect(aqiColor(80)).toBe('#eab308')
    expect(aqiColor(140)).toBe('#f97316')
    expect(aqiColor(190)).toBe('#ef4444')
    expect(aqiColor(280)).toBe('#a855f7')
    expect(aqiColor(400)).toBe('#7f1d1d')
  })
})
