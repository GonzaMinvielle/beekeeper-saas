'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { createInspection } from '@/lib/actions/inspections'
import type { Hive } from '@/lib/types/database.types'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : 'Registrar inspección'}
    </button>
  )
}

const weatherOptions = ['Soleado', 'Nublado', 'Parcialmente nublado', 'Viento leve', 'Viento fuerte', 'Lluvia']

const healthOptions = [
  { value: 1, label: '1 — Crítico', color: 'text-red-600' },
  { value: 2, label: '2 — Malo',    color: 'text-orange-500' },
  { value: 3, label: '3 — Regular', color: 'text-yellow-600' },
  { value: 4, label: '4 — Bueno',   color: 'text-lime-600' },
  { value: 5, label: '5 — Excelente', color: 'text-green-600' },
]

export default function InspectionForm({ hives }: { hives: HiveWithApiary[] }) {
  const [state, action] = useFormState(createInspection, {})

  const today = new Date().toISOString().slice(0, 16)

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/inspections" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a inspecciones
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nueva inspección</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {state.error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-5">
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
                  {h.name}{h.apiaries ? ` — ${h.apiaries.name}` : ''}
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

          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex gap-2">
              {healthOptions.map((h) => (
                <label key={h.value} className="flex-1 cursor-pointer">
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
            <SubmitButton />
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
