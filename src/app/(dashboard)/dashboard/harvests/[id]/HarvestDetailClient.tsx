'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateHarvest, deleteHarvest } from '@/lib/actions/harvests'
import { honeyTypes } from '@/lib/types/database.types'
import type { Harvest, Hive } from '@/lib/types/database.types'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors">
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  )
}

export default function HarvestDetailClient({
  harvest, hives,
}: { harvest: Harvest; hives: HiveWithApiary[] }) {
  const updateWithId = updateHarvest.bind(null, harvest.id)
  const [state, formAction] = useFormState(updateWithId, {})

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/harvests" className="text-sm text-amber-600 hover:text-amber-700">
            ← Volver a cosechas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Editar cosecha</h1>
        </div>
        <form action={deleteHarvest.bind(null, harvest.id)}>
          <button type="submit"
            onClick={(e) => { if (!confirm('¿Eliminar esta cosecha?')) e.preventDefault() }}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50
                       border border-red-200 rounded-lg transition-colors font-medium">
            Eliminar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {state.error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colmena <span className="text-red-500">*</span>
            </label>
            <select name="hive_id" required defaultValue={harvest.hive_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white">
              {hives.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}{h.apiaries ? ` — ${h.apiaries.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input name="harvested_at" type="date" defaultValue={harvest.harvested_at}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input name="weight_kg" type="number" step="0.01" min="0.01"
                defaultValue={harvest.weight_kg}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de miel</label>
              <select name="honey_type" defaultValue={harvest.honey_type}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white">
                {honeyTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de lote</label>
              <input name="batch_code" type="text" defaultValue={harvest.batch_code ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas de calidad</label>
            <textarea name="quality_notes" rows={3} defaultValue={harvest.quality_notes ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SaveButton />
            <Link href="/dashboard/harvests" className="text-sm text-gray-500 hover:text-gray-700">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
