export function WeatherIcon({ name, className = 'w-6 h-6' }: { name: string; className?: string }){
  const stroke = 'currentColor'
  const common = { stroke, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as any
  switch(name){
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="4" {...common} />
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" {...common} />
        </svg>
      )
    case 'rain':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M16 16a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.2A3.5 3.5 0 0 0 7 16h9z" {...common} />
          <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" {...common} />
        </svg>
      )
    case 'snow':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M16 16a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.2A3.5 3.5 0 0 0 7 16h9z" {...common} />
          <path d="M9 18l-1 2M12 18v2M15 18l1 2" {...common} />
        </svg>
      )
    case 'thunder':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M16 16a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.2A3.5 3.5 0 0 0 7 16h9z" {...common} />
          <path d="M11 22l2-4h-3l2-4" {...common} />
        </svg>
      )
    case 'mist':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M3 12h18M5 16h14M7 20h10" {...common} />
        </svg>
      )
    case 'cloud':
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M16 16a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.2A3.5 3.5 0 0 0 7 16h9z" {...common} />
        </svg>
      )
  }
}
