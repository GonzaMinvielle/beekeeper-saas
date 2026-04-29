'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createApiaryInspection } from '@/lib/actions/inspections'
import { savePendingApiaryInspection } from '@/lib/offline/db'
type PartialHive = { id: string; name: string; code: string | null }
type ActiveSuper = { id: string; hive_id: string; placed_at: string }

type HiveSuperChange = { hive_id: string; action: 'add' } | { hive_id: string; action: 'remove'; super_id: string }

const weatherOptions = [
  { value: 'soleado',  label: 'Soleado' },
  { value: 'nublado',  label: 'Nublado' },
  { value: 'lluvioso', label: 'Lluvioso' },
  { value: 'viento',   label: 'Viento' },
]

const floweringOptions = [
  { value: 'activa', label: 'Activa' },
  { value: 'escasa', label: 'Escasa' },
  { value: 'nula',   label: 'Nula' },
]

const priorityOptions = [
  { value: 'low',    label: 'Baja',  color: 'text-gray-500' },
  { value: 'medium', label: 'Media', color: 'text-amber-600' },
  { value: 'high',   label: 'Alta',  color: 'text-red-600' },
]

type HiveAttention = {
  checked: boolean
  observation: string
  priority: 'low' | 'medium' | 'high'
}

export default function ApiaryInspectionForm({
  apiaryId,
  apiaryName,
  hives,
  activeSupers,
}: {
  apiaryId: string
  apiaryName: string
  hives: PartialHive[]
  activeSupers: ActiveSuper[]
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const today = new Date().toISOString().slice(0, 16)

  const [hiveState, setHiveState] = useState<Record<string, HiveAttention>>(() =>
    Object.fromEntries(
      hives.map((h: PartialHive) => [h.id, { checked: false, observation: '', priority: 'low' }])
    )
  )

  // Track supers changes per hive: add=true means user added, remove=true means user removed
  const [supersAdded, setSupersAdded] = useState<Record<string, boolean>>({})
  const [supersRemoved, setSupersRemoved] = useState<Record<string, boolean>>({})

  // Map hive_id → oldest active super id (for removal)
  const activeSupersMap: Record<string, string> = {}
  for (const s of activeSupers) {
    if (!activeSupersMap[s.hive_id]) activeSupersMap[s.hive_id] = s.id
  }

  function toggleHive(hiveId: string) {
    setHiveState((prev) => ({
      ...prev,
      [hiveId]: { ...prev[hiveId], checked: !prev[hiveId].checked },
    }))
  }

  function setObservation(hiveId: string, value: string) {
    setHiveState((prev) => ({ ...prev, [hiveId]: { ...prev[hiveId], observation: value } }))
  }

  function setPriority(hiveId: string, value: 'low' | 'medium' | 'high') {
    setHiveState((prev) => ({ ...prev, [hiveId]: { ...prev[hiveId], priority: value } }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    const hivesWithAttention = hives
      .filter((h) => hiveState[h.id]?.checked)
      .map((h) => ({
        hive_id: h.id,
        observation: hiveState[h.id].observation,
        priority: hiveState[h.id].priority,
      }))

    formData.set('hives_with_attention', JSON.stringify(hivesWithAttention))

    const supersChanges: HiveSuperChange[] = []
    for (const hive of hives) {
      if (supersAdded[hive.id]) {
        supersChanges.push({ hive_id: hive.id, action: 'add' })
      }
      if (supersRemoved[hive.id] && activeSupersMap[hive.id]) {
        supersChanges.push({ hive_id: hive.id, action: 'remove', super_id: activeSupersMap[hive.id] })
      }
    }
    formData.set('supers_changes', JSON.stringify(supersChanges))

    const pendingData = {
      id: crypto.randomUUID(),
      apiary_id: apiaryId,
      apiary_name: apiaryName,
      inspected_at: (formData.get('inspected_at') as string) || new Date().toISOString(),
      weather_conditions: (formData.get('weather_conditions') as string) || null,
      flowering_status: (formData.get('flowering_status') as string) || null,
      general_notes: (formData.get('general_notes') as string) || null,
      hives_with_attention: JSON.stringify(hivesWithAttention),
      supers_changes: JSON.stringify(supersChanges),
    }

    if (!navigator.onLine) {
      try {
        await savePendingApiaryInspection(pendingData)
        router.push('/dashboard/inspections')
      } catch {
        setError('No se pudo guardar localmente.')
      }
      return
    }

    startTransition(async () => {
      try {
        const result = await createApiaryInspection({}, formData)
        if (result?.error) {
          setError(result.error)
        }
        // On success, server action redirects to apiary page
      } catch {
        // Network error — save offline
        try {
          await savePendingApiaryInspection(pendingData)
          router.push('/dashboard/inspections')
        } catch {
          setError('Sin conexión y no se pudo guardar localmente.')
        }
      }
    })
  }

  const checkedCount = hives.filter((h) => hiveState[h.id]?.checked).length

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/apiaries/${apiaryId}`}
          className="text-sm text-amber-600 hover:text-amber-700"
        >
          ← Volver al apiario
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Inspección de apiario
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{apiaryName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General info card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">
            Datos generales
          </h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <input type="hidden" name="apiary_id" value={apiaryId} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
            <input
              name="inspected_at"
              type="datetime-local"
              defaultValue={today}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clima</label>
              <select
                name="weather_conditions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                <option value="">— sin especificar —</option>
                {weatherOptions.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floración</label>
              <select
                name="flowering_status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                <option value="">— sin especificar —</option>
                {floweringOptions.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota general del apiario
            </label>
            <textarea
              name="general_notes"
              rows={3}
              placeholder="Observaciones generales del apiario..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Hives card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Colmenas</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Marcá las que requieren atención
              </p>
            </div>
            {checkedCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-1 rounded-full">
                {checkedCount} marcada{checkedCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {hives.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay colmenas activas en este apiario.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {hives.map((hive) => {
                const state = hiveState[hive.id]
                return (
                  <li key={hive.id} className="px-4 py-3">
                    {/* Hive row */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleHive(hive.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                          ${state.checked
                            ? 'bg-amber-500 border-amber-500'
                            : 'border-gray-300 hover:border-amber-400'}`}
                      >
                        {state.checked && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <span className="text-sm font-medium text-gray-800 flex-1">{hive.name}</span>
                      {hive.code && (
                        <span className="text-xs text-gray-400 font-mono">{hive.code}</span>
                      )}
                    </div>

                    {/* Expanded fields when checked */}
                    {state.checked && (
                      <div className="mt-3 ml-8 space-y-2.5">
                        <textarea
                          value={state.observation}
                          onChange={(e) => setObservation(hive.id, e.target.value)}
                          rows={2}
                          placeholder="Nota rápida sobre esta colmena..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">Prioridad:</span>
                          {priorityOptions.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setPriority(hive.id, p.value as 'low' | 'medium' | 'high')}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors
                                ${state.priority === p.value
                                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Supers changes card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Cambios de alzas en esta visita</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Marcá los cambios realizados durante la inspección
            </p>
          </div>

          {hives.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No hay colmenas activas en este apiario.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {hives.map((hive) => {
                const hasActiveSuper = !!activeSupersMap[hive.id]
                return (
                  <li key={hive.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-800 flex-1">{hive.name}</span>
                      <div className="flex items-center gap-4">
                        {/* Add super */}
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!supersAdded[hive.id]}
                            onChange={(e) =>
                              setSupersAdded((prev) => ({ ...prev, [hive.id]: e.target.checked }))
                            }
                            className="w-4 h-4 accent-amber-500"
                          />
                          <span className="text-xs text-gray-600">Agregué alza</span>
                        </label>

                        {/* Remove super — only if active super exists */}
                        <label className={`flex items-center gap-1.5 ${hasActiveSuper ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                          <input
                            type="checkbox"
                            checked={!!supersRemoved[hive.id]}
                            disabled={!hasActiveSuper}
                            onChange={(e) =>
                              setSupersRemoved((prev) => ({ ...prev, [hive.id]: e.target.checked }))
                            }
                            className="w-4 h-4 accent-amber-500"
                          />
                          <span className="text-xs text-gray-600">Retiré alza</span>
                        </label>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-6">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                       text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {isPending ? 'Guardando...' : 'Registrar inspección'}
          </button>
          <Link
            href={`/dashboard/apiaries/${apiaryId}`}
            className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
