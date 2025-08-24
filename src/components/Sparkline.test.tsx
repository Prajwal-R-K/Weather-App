import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('renders an SVG with a polyline from values', () => {
    render(<Sparkline values={[1, 3, 2, 5, 4]} ariaLabel="Test sparkline" />)
    const svg = screen.getByRole('img', { name: /test sparkline/i })
    expect(svg).toBeInTheDocument()
    const polyline = svg.querySelector('polyline')
    expect(polyline).not.toBeNull()
    const points = polyline!.getAttribute('points')
    expect(points).toBeTruthy()
    // It should contain multiple coordinate pairs
    expect(points!.split(' ').length).toBeGreaterThan(2)
  })
})
