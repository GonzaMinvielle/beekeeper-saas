'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons (Next.js rompe los paths de Leaflet)
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Marker de apiario personalizado (color ámbar)
const apiaryIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 32px; height: 32px;
      background: #f59e0b;
      border: 3px solid #fff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
})

export type MapMarker = {
  id: string
  lat: number
  lng: number
  label: string
  type?: 'apiary' | 'hive' | 'alert'
}

type Props = {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  onLocationSelect?: (lat: number, lng: number) => void
  className?: string
}

// Componente interno para centrar el mapa cuando cambia el center
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

// Permite hacer click en el mapa para seleccionar ubicación
function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816] // Buenos Aires

export default function ApiaryMap({
  center,
  zoom = 13,
  markers = [],
  onLocationSelect,
  className = 'h-64 w-full rounded-xl',
}: Props) {
  const mapCenter = center ?? DEFAULT_CENTER

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className={className}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={mapCenter} />

      {onLocationSelect && (
        <LocationPicker onSelect={onLocationSelect} />
      )}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={marker.type === 'apiary' ? apiaryIcon : markerIcon}
        >
          <Popup>
            <span className="font-medium">{marker.label}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
