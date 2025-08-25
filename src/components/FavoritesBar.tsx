import { useNavigate } from 'react-router-dom'
import { useSettings, type Favorite } from '../state/settings'

export function FavoritesBar(){
  const { settings, setSettings } = useSettings()
  const nav = useNavigate()

  const remove = (idx: number) => {
    const next = [...(settings.favorites || [])]
    next.splice(idx, 1)
    setSettings({ favorites: next })
  }

  const go = (f: Favorite) => {
    if (f.type === 'city') nav(`/city/${encodeURIComponent(f.label)}`)
    else nav(`/lat/${f.lat.toFixed(4)}/lon/${f.lon.toFixed(4)}`)
  }

  return (
    <div className="rounded-2xl p-3 bg-card border border-white/10 flex flex-wrap items-center gap-2">
      <div className="text-sm text-white/70 mr-2">Favorites:</div>
      {(settings.favorites && settings.favorites.length > 0) ? (
        settings.favorites.map((f, idx) => (
          <button
            key={idx}
            onClick={() => go(f)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-sm"
            title={f.type === 'city' ? f.label : `${f.label} (${f.lat.toFixed(4)}, ${f.lon.toFixed(4)})`}
          >
            <span className="truncate max-w-[160px]">{f.label}</span>
            <span
              onClick={(e) => { e.stopPropagation(); remove(idx) }}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-xs"
              aria-label={`Remove ${f.label}`}
              title="Remove"
            >×</span>
          </button>
        ))
      ) : (
        <span className="text-sm text-white/50">No favorites yet. Add from a city page.</span>
      )}
    </div>
  )
}
