'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateTreatment, deleteTreatment } from '@/lib/actions/treatments'
import type { Treatment, Hive } from '@/lib/types/database.types'

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

export default function TreatmentDetailClient({
  treatment, hives,
}: { treatment: Treatment; hives: HiveWithApiary[] }) {
  const updateWithId = updateTreatment.bind(null, treatment.id)
  const [state, formAction] = useFormState(updateWithId, {})

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/treatments" className="text-sm text-amber-600 hover:text-amber-700">
            ← Volver a tratamientos
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Editar tratamiento</h1>
        </div>
        <form action={deleteTreatment.bind(null, treatment.id)}>
          <button type="submit"
            onClick={(e) => { if (!confirm('¿Eliminar este tratamiento?')) e.preventDefault() }}
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
            <select name="hive_id" required defaultValue={treatment.hive_id}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <input name="product_name" type="text" required defaultValue={treatment.product_name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
              <input name="dose" type="text" defaultValue={treatment.dose ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de aplicación</label>
              <input name="applied_at" type="date" defaultValue={treatment.applied_at}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Próximo control</label>
              <input name="next_check_date" type="date" defaultValue={treatment.next_check_date ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea name="notes" rows={3} defaultValue={treatment.notes ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SaveButton />
            <Link href="/dashboard/treatments" className="text-sm text-gray-500 hover:text-gray-700">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
