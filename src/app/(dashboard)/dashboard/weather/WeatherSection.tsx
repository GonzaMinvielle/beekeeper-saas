'use client'

import { useState } from 'react'
import WeatherWidget from '@/components/weather/WeatherWidget'

type Apiary = {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  location: string | null
}

export default function WeatherSection({ apiaries }: { apiaries: Apiary[] }) {
  const withCoords = apiaries.filter((a) => a.latitude != null && a.longitude != null)
  const [selectedId, setSelectedId] = useState(withCoords[0]?.id ?? '')
  const selected = withCoords.find((a) => a.id === selectedId)

  if (withCoords.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        <p className="text-3xl mb-2">📍</p>
        <p>Ningún apiario tiene coordenadas GPS guardadas.</p>
        <p className="mt-1 text-xs">Editá un apiario y agregá latitud y longitud para ver el clima.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {withCoords.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seleccioná un apiario</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          >
            {withCoords.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}
      {selected && (
        <WeatherWidget
          lat={selected.latitude!}
          lng={selected.longitude!}
          apiaryName={selected.name}
        />
      )}
    </div>
  )
}
