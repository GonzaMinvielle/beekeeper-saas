'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { updateApiary, deleteApiary } from '@/lib/actions/apiaries'
import type { Apiary, Hive, HiveStatus } from '@/lib/types/database.types'
import MapLoader from '@/components/map/MapLoader'
import ApiaryWeatherForecast from '@/components/weather/ApiaryWeatherForecast'

const statusConfig: Record<HiveStatus, { label: string; color: string }> = {
  active:   { label: 'Activa',   color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactiva', color: 'bg-gray-100 text-gray-600' },
  dead:     { label: 'Muerta',   color: 'bg-red-100 text-red-700' },
  sold:     { label: 'Vendida',  color: 'bg-blue-100 text-blue-700' },
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  )
}

export default function ApiaryDetailClient({
  apiary,
  hives,
}: {
  apiary: Apiary
  hives: Hive[]
}) {
  const updateWithId = updateApiary.bind(null, apiary.id)
  const [state, formAction] = useFormState(updateWithId, {})

  const [lat, setLat] = useState<number | ''>(apiary.latitude ?? '')
  const [lng, setLng] = useState<number | ''>(apiary.longitude ?? '')

  const latRef = useRef<HTMLInputElement>(null)
  const lngRef = useRef<HTMLInputElement>(null)

  function handleMapClick(newLat: number, newLng: number) {
    const rounded = (n: number) => Math.round(n * 1e6) / 1e6
    setLat(rounded(newLat))
    setLng(rounded(newLng))
    if (latRef.current) latRef.current.value = String(rounded(newLat))
    if (lngRef.current) lngRef.current.value = String(rounded(newLng))
  }

  const mapCenter: [number, number] | undefined =
    typeof lat === 'number' && typeof lng === 'number'
      ? [lat, lng]
      : undefined

  const markers =
    typeof lat === 'number' && typeof lng === 'number'
      ? [{ id: apiary.id, lat, lng, label: apiary.name, type: 'apiary' as const }]
      : []

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/apiaries" className="text-sm text-amber-600 hover:text-amber-700">
            ← Volver a apiarios
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{apiary.name}</h1>
        </div>
        <form action={deleteApiary.bind(null, apiary.id)}>
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm('¿Eliminar este apiario? Se eliminarán también todas sus colmenas.')) {
                e.preventDefault()
              }
            }}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50
                       border border-red-200 rounded-lg transition-colors font-medium"
          >
            Eliminar
          </button>
        </form>
      </div>

      {/* Form + Mapa side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Edit form — izquierda */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Editar apiario</h2>

          {state.error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={apiary.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                name="location"
                type="text"
                defaultValue={apiary.location ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                <input
                  ref={latRef}
                  name="latitude"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                <input
                  ref={lngRef}
                  name="longitude"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value ? Number(e.target.value) : '')}
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
                defaultValue={apiary.notes ?? ''}
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
                    defaultValue={apiary.caretaker_name ?? ''}
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
                    defaultValue={apiary.caretaker_phone ?? ''}
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
                    defaultValue={apiary.field_name ?? ''}
                    placeholder="Ej: El Retiro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <SaveButton />
              <Link href="/dashboard/apiaries" className="text-sm text-gray-500 hover:text-gray-700">
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
                  {lat.toFixed(5)}, {lng.toFixed(5)}
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
              Hacé click en el mapa para mover el marcador.
            </p>
          </div>
        </div>
      </div>

      {/* Weather forecast */}
      {typeof lat === 'number' && typeof lng === 'number' && (
        <ApiaryWeatherForecast
          latitude={lat}
          longitude={lng}
          apiaryName={apiary.name}
        />
      )}

      {/* Hives list — ancho completo abajo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Colmenas en este apiario
            <span className="ml-2 text-sm font-normal text-gray-400">({hives.length})</span>
          </h2>
          <Link href="/dashboard/hives/new" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            + Nueva colmena
          </Link>
        </div>

        {hives.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay colmenas en este apiario aún.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {hives.map((hive) => {
              const status = statusConfig[hive.status]
              return (
                <li key={hive.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{hive.name}</span>
                    {hive.code && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                        {hive.code}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <Link href={`/dashboard/hives/${hive.id}`} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                    Ver →
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
