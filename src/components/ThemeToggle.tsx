type Props = { value: 'system'|'light'|'dark'; onChange: (v: 'system'|'light'|'dark')=>void }
export function ThemeToggle({ value, onChange }: Props){
  return (
    <div className="inline-flex rounded-2xl border border-white/10 overflow-hidden">
      {(['system','light','dark'] as const).map(v => (
        <button key={v} onClick={()=>onChange(v)} className={`px-3 py-1.5 text-sm ${value===v? 'bg-primary text-white':'bg-card text-white/80 hover:bg-white/5'}`} aria-pressed={value===v}>
          {v}
        </button>
      ))}
    </div>
  )
}
