'use client'

import dynamic from 'next/dynamic'
import type { MapMarker } from './ApiaryMap'

// Leaflet usa `window` — debe cargarse solo en el cliente
const ApiaryMap = dynamic(() => import('./ApiaryMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-xl bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400 text-sm">Cargando mapa...</span>
    </div>
  ),
})

export type { MapMarker }
export default ApiaryMap
