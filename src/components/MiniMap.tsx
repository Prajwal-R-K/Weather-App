import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'

const icon = new L.DivIcon({
  className: 'minimap-pin',
  html: '<div style="width:10px;height:10px;background:#38bdf8;border-radius:9999px;box-shadow:0 0 0 3px rgba(56,189,248,0.25)"></div>'
})

type Props = { lat: number; lon: number; onPick?: (lat: number, lon: number) => void }

function ClickPick({ onPick }: { onPick?: (lat: number, lon: number) => void }){
  useMapEvents({
    click(e){ onPick?.(e.latlng.lat, e.latlng.lng) }
  })
  return null
}

export function MiniMap({ lat, lon, onPick }: Props){
  const center: [number, number] = [lat, lon]
  const [radar, setRadar] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-card relative">
      <MapContainer center={center} zoom={10} scrollWheelZoom={false} style={{ height: 200, width: '100%', cursor: onPick ? 'crosshair' : undefined }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {radar && (
          <TileLayer
            // RainViewer latest nowcast tiles
            url="https://tilecache.rainviewer.com/v2/radar/nowcast/0/256/{z}/{x}/{y}/2/1_1.png"
            opacity={0.6}
          />
        )}
        <Marker
          position={center}
          icon={icon}
          draggable={!!onPick}
          eventHandlers={{
            dragend: (e) => {
              const m: any = e.target
              const ll = m.getLatLng()
              onPick?.(ll.lat, ll.lng)
            }
          }}
        />
        <ClickPick onPick={onPick} />
      </MapContainer>
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <button
          className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs hover:bg-black/50"
          onClick={() => setRadar(r => !r)}
          title="Toggle radar overlay"
        >{radar ? 'Radar: On' : 'Radar: Off'}</button>
      </div>
      <div className="p-2 text-xs text-white/60 text-right">OpenStreetMap {radar && '• RainViewer'}</div>
    </div>
  )
}
