'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  getCachedInspections,
  getPendingInspections,
  getPendingApiaryInspections,
  type CachedInspection,
  type PendingInspection,
} from '@/lib/offline/db'

const healthLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Crítico',   color: 'bg-red-100 text-red-700' },
  2: { label: 'Malo',      color: 'bg-orange-100 text-orange-700' },
  3: { label: 'Regular',   color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Bueno',     color: 'bg-lime-100 text-lime-700' },
  5: { label: 'Excelente', color: 'bg-green-100 text-green-700' },
}

type DisplayInspection = CachedInspection & { pending?: boolean }

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<DisplayInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    async function load() {
      if (navigator.onLine) {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) { setLoading(false); return }

          const { data: memberData } = await supabase
            .from('org_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .single()

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const member = memberData as { organization_id: string } | null
          if (!member) { setLoading(false); return }

          const { data } = await supabase
            .from('inspections')
            .select('id, hive_id, apiary_id, inspection_level, inspected_at, overall_health, weather, temperature_c, duration_min, notes, created_at, hives(name), apiaries(name)')
            .eq('organization_id', member.organization_id)
            .order('inspected_at', { ascending: false })

          setInspections(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((data ?? []) as any[]).map((i) => ({
              id: i.id,
              hive_id: i.hive_id,
              hive_name: i.hives?.name
                ?? (i.apiaries?.name ? `Apiario: ${i.apiaries.name}` : null),
              inspected_at: i.inspected_at,
              overall_health: i.overall_health ?? null,
              weather: i.weather ?? null,
              temperature_c: i.temperature_c ?? null,
              duration_min: i.duration_min ?? null,
              notes: i.notes ?? null,
              created_at: i.created_at,
            }))
          )
        } catch {
          // Si falla online, caer a caché
          await loadFromCache()
        }
      } else {
        await loadFromCache()
      }
      setLoading(false)
    }

    async function loadFromCache() {
      const [cached, pending, pendingApiary] = await Promise.all([
        getCachedInspections().catch(() => [] as CachedInspection[]),
        getPendingInspections().catch(() => [] as PendingInspection[]),
        getPendingApiaryInspections().catch(() => []),
      ])

      const pendingHiveDisplayed: DisplayInspection[] = pending.map((p) => ({
        id: p.id,
        hive_id: p.hive_id,
        hive_name: p.hive_name,
        inspected_at: p.inspected_at,
        overall_health: p.overall_health,
        weather: p.weather,
        temperature_c: p.temperature_c,
        duration_min: p.duration_min,
        notes: p.notes,
        created_at: p.created_local,
        pending: true,
      }))

      const pendingApiaryDisplayed: DisplayInspection[] = pendingApiary.map((p) => ({
        id: p.id,
        hive_id: '',
        hive_name: `Apiario: ${p.apiary_name}`,
        inspected_at: p.inspected_at,
        overall_health: null,
        weather: p.weather_conditions,
        temperature_c: null,
        duration_min: null,
        notes: p.general_notes,
        created_at: p.created_local,
        pending: true,
      }))

      // Pendientes primero, luego las cacheadas
      setInspections([...pendingHiveDisplayed, ...pendingApiaryDisplayed, ...cached])
    }

    load()

    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspecciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            Historial de revisiones de colmenas
            {!isOnline && (
              <span className="ml-2 text-xs text-orange-500 font-medium">· modo offline</span>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/inspections/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
                     rounded-lg transition-colors text-center"
        >
          + Nueva inspección
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : inspections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <span className="text-5xl block mb-3">📋</span>
          <p className="text-gray-500 text-sm">
            {isOnline
              ? 'No hay inspecciones registradas todavía.'
              : 'Sin inspecciones cacheadas offline.'}
          </p>
          <Link
            href="/dashboard/inspections/new"
            className="mt-4 inline-block text-sm text-amber-600 hover:underline font-medium"
          >
            Registrar primera inspección
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((inspection) => {
            const health = inspection.overall_health
              ? healthLabels[inspection.overall_health]
              : null
            const date = new Date(inspection.inspected_at).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })

            return (
              <div
                key={inspection.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {inspection.hive_name ?? '—'}
                      </h3>
                      {health && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.color}`}>
                          {health.label}
                        </span>
                      )}
                      {inspection.pending && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-600">
                          ⏳ Pendiente de sync
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{date}</p>
                    {inspection.weather && (
                      <p className="text-sm text-gray-400 mt-1">
                        Clima: {inspection.weather}
                        {inspection.temperature_c != null && ` · ${inspection.temperature_c}°C`}
                      </p>
                    )}
                    {inspection.notes && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{inspection.notes}</p>
                    )}
                  </div>
                  {!inspection.pending && (
                    <Link
                      href={`/dashboard/inspections/${inspection.id}`}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap ml-4"
                    >
                      Ver detalle →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
