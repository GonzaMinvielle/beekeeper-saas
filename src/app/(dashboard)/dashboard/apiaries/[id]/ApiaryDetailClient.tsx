'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { updateApiary, deleteApiary } from '@/lib/actions/apiaries'
import { upsertRainfall, deleteRainfall } from '@/lib/actions/rainfall'
import type { Apiary, Hive, HiveStatus, Feeding, FoodType, HiveSuper, RainfallRecord } from '@/lib/types/database.types'
import { foodTypes } from '@/lib/types/database.types'
import MapLoader from '@/components/map/MapLoader'
import ApiaryWeatherForecast from '@/components/weather/ApiaryWeatherForecast'

const statusConfig: Record<HiveStatus, { label: string; color: string }> = {
  active:   { label: 'Activa',   color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactiva', color: 'bg-gray-100 text-gray-600' },
  dead:     { label: 'Muerta',   color: 'bg-red-100 text-red-700' },
  sold:     { label: 'Vendida',  color: 'bg-blue-100 text-blue-700' },
}

function SaveButton({ label = 'Guardar cambios' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : label}
    </button>
  )
}

// ── Rainfall panel ────────────────────────────────────────���───────────────

function RainfallPanel({
  apiaryId,
  records,
}: {
  apiaryId: string
  records: RainfallRecord[]
}) {
  // mode: 'idle' | 'add' | 'conflict'
  const [mode, setMode] = useState<'idle' | 'add' | 'conflict'>('idle')
  const [conflict, setConflict] = useState<{ date: string; existing_mm: number } | null>(null)
  const upsertWithId = upsertRainfall.bind(null, apiaryId)
  const [state, formAction] = useFormState(upsertWithId, {})
  const today = new Date().toISOString().slice(0, 10)

  const thisYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const yearTotal = records.reduce((s, r) => s + Number(r.mm_recorded), 0)
  const monthTotal = records
    .filter((r) => new Date(r.date).getMonth() + 1 === currentMonth)
    .reduce((s, r) => s + Number(r.mm_recorded), 0)

  useEffect(() => {
    if (state.success) setMode('idle')
    if (state.conflict) { setConflict(state.conflict); setMode('conflict') }
  }, [state])

  const formatDate = (d: string) => {
    const [, m, day] = d.split('-')
    return `${day}/${m}`
  }

  const recent = records.slice(0, 10)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Pluviometría</h2>
          <p className="text-xs text-gray-400 mt-0.5">{thisYear}</p>
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === 'add' ? 'idle' : 'add')}
          className="w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700
                     flex items-center justify-center text-lg font-bold transition-colors"
          title="Registrar lluvia"
        >
          {mode === 'add' ? '×' : '+'}
        </button>
      </div>

      {/* Totals */}
      {records.length > 0 && (
        <div className="px-5 pt-4 pb-1 flex gap-4 flex-wrap">
          <div className="bg-blue-50 rounded-lg px-4 py-2">
            <p className="text-xs text-blue-600 font-medium">Este mes</p>
            <p className="text-lg font-bold text-blue-800">{monthTotal.toFixed(1)} mm</p>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2">
            <p className="text-xs text-blue-600 font-medium">Total {thisYear}</p>
            <p className="text-lg font-bold text-blue-800">{yearTotal.toFixed(1)} mm</p>
          </div>
        </div>
      )}

      {/* Add form */}
      {mode === 'add' && (
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          {state.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {state.error}
            </div>
          )}
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="force" value="false" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                <input
                  name="date"
                  type="date"
                  defaultValue={today}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Milímetros</label>
                <input
                  name="mm_recorded"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="Ej: 12.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas (opcional)</label>
              <textarea
                name="notes"
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <SaveButton label="Registrar" />
              <button type="button" onClick={() => setMode('idle')}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conflict: existing record for same date */}
      {mode === 'conflict' && conflict && (
        <div className="p-5 border-b border-gray-100 bg-yellow-50">
          <p className="text-sm font-medium text-yellow-800 mb-3">
            Ya registraste {conflict.existing_mm} mm para el {conflict.date}. Ingresá el nuevo valor para reemplazarlo.
          </p>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="force" value="true" />
            <input type="hidden" name="date" value={conflict.date} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">Nuevo valor (mm)</label>
                <input
                  name="mm_recorded"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder={String(conflict.existing_mm)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-yellow-700 mb-1">Notas (opcional)</label>
                <input
                  name="notes"
                  type="text"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Reemplazar
              </button>
              <button type="button" onClick={() => { setMode('idle'); setConflict(null) }}
                className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {recent.length === 0 && mode === 'idle' ? (
        <div className="p-6 text-center text-gray-400 text-sm">
          Sin registros de lluvia este año.
        </div>
      ) : recent.length > 0 ? (
        <ul className="divide-y divide-gray-50">
          {recent.map((r) => (
            <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-gray-400 font-mono">{formatDate(r.date)}</span>
                <span className="text-sm font-semibold text-blue-700">{Number(r.mm_recorded).toFixed(1)} mm</span>
                {r.notes && <span className="text-xs text-gray-500">{r.notes}</span>}
              </div>
              <form action={deleteRainfall.bind(null, r.id, apiaryId)}>
                <button
                  type="submit"
                  onClick={(e) => { if (!confirm('¿Eliminar este registro?')) e.preventDefault() }}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0"
                  title="Eliminar"
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ApiaryDetailClient({
  apiary,
  hives,
  feedings,
  activeSupers,
  rainfall,
}: {
  apiary: Apiary
  hives: Hive[]
  feedings: (Feeding & { hives: { name: string } | null })[]
  activeSupers: Pick<HiveSuper, 'id' | 'hive_id' | 'placed_at'>[]
  rainfall: RainfallRecord[]
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="flex gap-2">
                    <input
                      name="caretaker_phone"
                      type="text"
                      defaultValue={apiary.caretaker_phone ?? ''}
                      placeholder="Ej: +54 9 261 123-4567"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    {apiary.caretaker_phone && (
                      <a
                        href={`https://wa.me/${apiary.caretaker_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir chat de WhatsApp"
                        className="flex items-center justify-center w-10 h-10 bg-[#25D366] hover:bg-[#20c05c]
                                   text-white rounded-lg transition-colors shrink-0"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </div>
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

      {/* Feeding summary */}
      {(() => {
        const now = new Date()
        const seasonStart = now.getMonth() >= 7
          ? new Date(now.getFullYear(), 7, 1)
          : new Date(now.getFullYear() - 1, 7, 1)

        const seasonFeedings = feedings.filter((f) => new Date(f.date) >= seasonStart)
        const seasonTotal = seasonFeedings.reduce((s, f) => s + Number(f.quantity_kg), 0)

        const byType = seasonFeedings.reduce<Record<string, number>>((acc, f) => {
          acc[f.food_type] = (acc[f.food_type] ?? 0) + Number(f.quantity_kg)
          return acc
        }, {})

        const recent = feedings.slice(0, 5)

        const formatDate = (d: string) => {
          const [y, m, day] = d.split('-')
          return `${day}/${m}/${y}`
        }

        const foodLabel = (type: FoodType) =>
          foodTypes.find((f) => f.value === type)?.label ?? type

        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Alimentación del apiario</h2>
              <p className="text-xs text-gray-400 mt-0.5">Temporada actual (desde agosto)</p>
            </div>

            {feedings.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Sin registros de alimentación en este apiario.
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Total + breakdown */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-amber-50 rounded-lg px-4 py-2.5">
                    <p className="text-xs text-amber-600 font-medium">Total temporada</p>
                    <p className="text-xl font-bold text-amber-800">{seasonTotal.toFixed(1)} kg</p>
                  </div>

                  {Object.entries(byType).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(byType).map(([type, kg]) => (
                        <div key={type} className="bg-gray-50 rounded-lg px-3 py-1.5 text-center">
                          <p className="text-xs text-gray-500">{foodLabel(type as FoodType)}</p>
                          <p className="text-sm font-semibold text-gray-700">{kg.toFixed(1)} kg</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent records */}
                {recent.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Últimos registros
                    </p>
                    <ul className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                      {recent.map((f) => (
                        <li key={f.id} className="px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50">
                          <div className="flex items-center gap-2 flex-wrap text-sm">
                            <span className="text-gray-400 text-xs">{formatDate(f.date)}</span>
                            <span className="font-medium text-gray-700">{foodLabel(f.food_type)}</span>
                            <span className="text-amber-700 font-semibold">{f.quantity_kg} kg</span>
                          </div>
                          {f.hives && (
                            <Link
                              href={`/dashboard/hives/${f.hive_id}`}
                              className="text-xs text-amber-600 hover:text-amber-700 font-medium shrink-0"
                            >
                              {f.hives.name} →
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* Alzas del apiario */}
      {(() => {
        const DAYS_READY = 21
        const DAYS_ALERT = 30
        const now = Date.now()

        const hivesWithSuper = new Set(activeSupers.map((s) => s.hive_id))
        const hivesWithoutSuper = hives.filter((h) => h.status === 'active' && !hivesWithSuper.has(h.id))
        const totalActive = activeSupers.length

        const readySupers = activeSupers.filter((s) => {
          const days = Math.floor((now - new Date(s.placed_at).getTime()) / 86400000)
          return days >= DAYS_READY
        })
        const alertSupers = activeSupers.filter((s) => {
          const days = Math.floor((now - new Date(s.placed_at).getTime()) / 86400000)
          return days >= DAYS_ALERT
        })

        // Per-hive: oldest active super days
        const hiveSuperDays: Record<string, number> = {}
        for (const s of activeSupers) {
          const days = Math.floor((now - new Date(s.placed_at).getTime()) / 86400000)
          if (hiveSuperDays[s.hive_id] === undefined || days > hiveSuperDays[s.hive_id]) {
            hiveSuperDays[s.hive_id] = days
          }
        }

        const hivesReadyToHarvest = hives.filter(
          (h) => hiveSuperDays[h.id] !== undefined && hiveSuperDays[h.id] >= DAYS_READY
        )

        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Alzas del apiario</h2>
            </div>

            {totalActive === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Sin alzas activas en este apiario.
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Alerts */}
                {alertSupers.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-800">
                      ⚠️ {alertSupers.length} alza{alertSupers.length !== 1 ? 's' : ''} con más de {DAYS_ALERT} días — cosechar urgente
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-green-50 rounded-lg px-4 py-2.5">
                    <p className="text-xs text-green-600 font-medium">Alzas activas</p>
                    <p className="text-xl font-bold text-green-800">{totalActive}</p>
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                      <span className="font-medium">{hivesWithSuper.size}</span> colmena{hivesWithSuper.size !== 1 ? 's' : ''} con alza
                      {' · '}
                      <span className="font-medium">{hivesWithoutSuper.length}</span> sin alza
                    </p>
                    {readySupers.length > 0 && (
                      <p className="text-yellow-700">
                        <span className="font-medium">{readySupers.length}</span> lista{readySupers.length !== 1 ? 's' : ''} para cosechar (+{DAYS_READY}d)
                      </p>
                    )}
                  </div>
                </div>

                {/* Per-hive ready list */}
                {hivesReadyToHarvest.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Listas para cosechar
                    </p>
                    <ul className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                      {hivesReadyToHarvest.map((h) => {
                        const days = hiveSuperDays[h.id]
                        const isAlert = days >= DAYS_ALERT
                        return (
                          <li key={h.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">{h.name}</span>
                              {isAlert ? (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                                  {days}d — ¡Urgente!
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                                  {days}d — Lista
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/dashboard/hives/${h.id}`}
                              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                            >
                              Ver →
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* Pluviometría */}
      <RainfallPanel apiaryId={apiary.id} records={rainfall} />

      {/* Hives list — ancho completo abajo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold text-gray-900">
            Colmenas en este apiario
            <span className="ml-2 text-sm font-normal text-gray-400">({hives.length})</span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/inspections/new?type=apiary&apiary_id=${apiary.id}`}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              + Nueva inspección
            </Link>
            <Link href="/dashboard/hives/new" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Nueva colmena
            </Link>
          </div>
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
