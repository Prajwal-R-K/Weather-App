type Props = {
  value: number
  min?: number
  max?: number
  label?: string
  color?: string
  ariaLabel?: string
}

export function Gauge({ value, min = 0, max = 100, label, color = '#38bdf8', ariaLabel }: Props) {
  const r = 42
  const c = Math.PI * r
  const clamped = Math.max(min, Math.min(max, value))
  const pct = (clamped - min) / (max - min)
  const dash = c * pct
  return (
    <div className="rounded-2xl p-4 bg-card border border-white/5" role="img" aria-label={ariaLabel || label}>
      <div className="flex items-center gap-4">
        <svg width={110} height={70} viewBox="0 0 110 70">
          <g transform="translate(55,60)">
            <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
            <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={color} strokeWidth={10} strokeDasharray={`${dash} ${c}`} />
            <circle cx={(pct*2-1)*r} cy={-Math.sqrt(Math.max(0, r*r - ((pct*2-1)*r)**2))} r={4} fill={color} />
          </g>
        </svg>
        <div>
          <div className="text-2xl font-semibold">{Math.round(clamped)}</div>
          {label && <div className="text-xs text-white/60">{label}</div>}
        </div>
      </div>
    </div>
  )
}
