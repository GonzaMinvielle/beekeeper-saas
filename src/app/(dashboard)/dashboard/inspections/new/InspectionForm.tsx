'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createInspection } from '@/lib/actions/inspections'
import { savePendingInspection } from '@/lib/offline/db'
import type { CachedHive } from '@/lib/offline/db'

const weatherOptions = ['Soleado', 'Nublado', 'Parcialmente nublado', 'Viento leve', 'Viento fuerte', 'Lluvia']

const healthOptions = [
  { value: 1, label: '1 — Crítico',   color: 'text-red-600' },
  { value: 2, label: '2 — Malo',      color: 'text-orange-500' },
  { value: 3, label: '3 — Regular',   color: 'text-yellow-600' },
  { value: 4, label: '4 — Bueno',     color: 'text-lime-600' },
  { value: 5, label: '5 — Excelente', color: 'text-green-600' },
]

export default function InspectionForm({ hives }: { hives: CachedHive[] }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const today = new Date().toISOString().slice(0, 16)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const hiveId = formData.get('hive_id') as string
    if (!hiveId) { setError('Seleccioná una colmena.'); setPending(false); return }

    if (!navigator.onLine) {
      try {
        const hive = hives.find(h => h.id === hiveId)
        await savePendingInspection({
          id: crypto.randomUUID(),
          hive_id: hiveId,
          hive_name: hive?.name ?? '',
          inspected_at: (formData.get('inspected_at') as string) || new Date().toISOString(),
          overall_health: formData.get('overall_health') ? Number(formData.get('overall_health')) : null,
          notes: (formData.get('notes') as string) || null,
          weather: (formData.get('weather') as string) || null,
          temperature_c: formData.get('temperature_c') ? Number(formData.get('temperature_c')) : null,
          duration_min: formData.get('duration_min') ? Number(formData.get('duration_min')) : null,
        })
        router.push('/dashboard/inspections')
      } catch {
        setError('No se pudo guardar localmente.')
        setPending(false)
      }
      return
    }

    // Online: llamar server action
    try {
      const result = await createInspection({}, formData)
      if (result?.error) {
        setError(result.error)
        setPending(false)
      }
      // createInspection redirige en éxito — no necesita más manejo
    } catch {
      setPending(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/inspections" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a inspecciones
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nueva inspección</h1>
        {!navigator.onLine && (
          <p className="text-xs text-orange-500 mt-1 font-medium">
            📵 Sin conexión — se guardará localmente y sincronizará al reconectar
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colmena <span className="text-red-500">*</span>
            </label>
            <select
              name="hive_id"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="">Seleccioná una colmena</option>
              {hives.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}{h.apiary_name ? ` — ${h.apiary_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora
            </label>
            <input
              name="inspected_at"
              type="datetime-local"
              defaultValue={today}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clima</label>
              <select
                name="weather"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                <option value="">— sin especificar —</option>
                {weatherOptions.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
              <input
                name="temperature_c"
                type="number"
                step="0.1"
                min="-10"
                max="55"
                placeholder="Ej: 24.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
            <input
              name="duration_min"
              type="number"
              min="1"
              placeholder="Ej: 30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salud general
            </label>
            <div className="grid grid-cols-5 gap-1">
              {healthOptions.map((h) => (
                <label key={h.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="overall_health"
                    value={h.value}
                    className="sr-only peer"
                  />
                  <div className={`text-center py-2 border-2 border-gray-200 rounded-lg text-xs font-semibold
                                  peer-checked:border-amber-400 peer-checked:bg-amber-50
                                  hover:border-gray-300 transition-colors ${h.color}`}>
                    {h.value}
                  </div>
                  <div className={`text-center text-xs mt-1 ${h.color} font-medium`}>
                    {h.label.split('—')[1]?.trim()}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Descripción general de la inspección..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                         text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {pending ? 'Guardando...' : 'Registrar inspección'}
            </button>
            <Link
              href="/dashboard/inspections"
              className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
