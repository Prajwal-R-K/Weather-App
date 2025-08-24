import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-card">
      <MapContainer center={center} zoom={10} scrollWheelZoom={false} style={{ height: 200, width: '100%', cursor: onPick ? 'crosshair' : undefined }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} icon={icon} />
        <ClickPick onPick={onPick} />
      </MapContainer>
      <div className="p-2 text-xs text-white/60 text-right">OpenStreetMap</div>
    </div>
  )
}
