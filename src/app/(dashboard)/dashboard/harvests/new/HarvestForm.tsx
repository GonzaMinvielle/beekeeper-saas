'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { createHarvest } from '@/lib/actions/harvests'
import { honeyTypes } from '@/lib/types/database.types'
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
      {pending ? 'Guardando...' : 'Registrar cosecha'}
    </button>
  )
}

export default function HarvestForm({ hives }: { hives: HiveWithApiary[] }) {
  const [state, action] = useFormState(createHarvest, {})
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/harvests" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a cosechas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nueva cosecha</h1>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                name="harvested_at"
                type="date"
                defaultValue={today}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                name="weight_kg"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ej: 12.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de miel</label>
              <select
                name="honey_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {honeyTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de lote</label>
              <input
                name="batch_code"
                type="text"
                placeholder="Ej: L2024-01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas de calidad</label>
            <textarea
              name="quality_notes"
              rows={3}
              placeholder="Color, aroma, consistencia, observaciones..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Link href="/dashboard/harvests" className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
