type Props = {
  values: number[]
  width?: number
  height?: number
  stroke?: string
  strokeWidth?: number
  className?: string
  ariaLabel?: string
}

export function Sparkline({ values, width = 160, height = 40, stroke = '#60a5fa', strokeWidth = 2, className, ariaLabel }: Props){
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = values.length > 1 ? width / (values.length - 1) : width
  const points = values.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className={className}>
      <polyline fill="none" stroke={stroke} strokeWidth={strokeWidth} points={points} />
    </svg>
  )
}
