'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import Link from 'next/link'
import { createApiary } from '@/lib/actions/apiaries'
import MapLoader from '@/components/map/MapLoader'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : 'Crear apiario'}
    </button>
  )
}

export default function NewApiaryPage() {
  const [state, action] = useFormState(createApiary, {})
  const [lat, setLat] = useState<number | ''>('')
  const [lng, setLng] = useState<number | ''>('')

  function handleMapClick(newLat: number, newLng: number) {
    const rounded = (n: number) => Math.round(n * 1e6) / 1e6
    setLat(rounded(newLat))
    setLng(rounded(newLng))
  }

  const mapCenter: [number, number] | undefined =
    typeof lat === 'number' && typeof lng === 'number' ? [lat, lng] : undefined

  const markers =
    typeof lat === 'number' && typeof lng === 'number'
      ? [{ id: 'new', lat, lng, label: 'Nuevo apiario', type: 'apiary' as const }]
      : []

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Link href="/dashboard/apiaries" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a apiarios
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nuevo apiario</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Form — izquierda */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {state.error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Ej: Apiario Norte"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / referencia</label>
              <input
                name="location"
                type="text"
                placeholder="Ej: Ruta 7, km 42, Mendoza"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value ? Number(e.target.value) : '')}
                  placeholder="-32.8908"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value ? Number(e.target.value) : '')}
                  placeholder="-68.8272"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Observaciones generales del apiario..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              />
            </div>

            <div className="pt-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Datos del puestero
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del puestero</label>
                  <input
                    name="caretaker_name"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono del puestero</label>
                  <input
                    name="caretaker_phone"
                    type="text"
                    placeholder="Ej: +54 9 261 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del campo</label>
                  <input
                    name="field_name"
                    type="text"
                    placeholder="Ej: El Retiro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <SubmitButton />
              <Link href="/dashboard/apiaries" className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium">
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* Mapa — derecha, sticky */}
        <div className="sticky top-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Ubicación en el mapa</h2>
              {typeof lat === 'number' && typeof lng === 'number' && (
                <span className="text-xs text-gray-400 font-mono">
                  {lat.toFixed(5)}, {(lng as number).toFixed(5)}
                </span>
              )}
            </div>
            <MapLoader
              center={mapCenter}
              zoom={mapCenter ? 14 : 5}
              markers={markers}
              onLocationSelect={handleMapClick}
              className="h-80 w-full rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-2">
              Hacé click en el mapa para marcar la ubicación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
