'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { createHive } from '@/lib/actions/hives'
import type { Apiary } from '@/lib/types/database.types'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : 'Crear colmena'}
    </button>
  )
}

const hiveTypes = [
  { value: 'langstroth', label: 'Langstroth' },
  { value: 'dadant',     label: 'Dadant' },
  { value: 'warre',      label: 'Warré' },
  { value: 'top_bar',   label: 'Top Bar' },
  { value: 'flow_hive', label: 'Flow Hive' },
  { value: 'layens',    label: 'Layens' },
  { value: 'other',     label: 'Otro' },
]

const hiveStatuses = [
  { value: 'active',   label: 'Activa' },
  { value: 'inactive', label: 'Inactiva' },
  { value: 'dead',     label: 'Muerta' },
  { value: 'sold',     label: 'Vendida' },
]

export default function HiveForm({ apiaries }: { apiaries: Apiary[] }) {
  const [state, action] = useFormState(createHive, {})

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/hives" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a colmenas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nueva colmena</h1>
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
              Apiario <span className="text-red-500">*</span>
            </label>
            <select
              name="apiary_id"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="">Seleccioná un apiario</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Ej: Colmena 01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código / etiqueta
              </label>
              <input
                name="code"
                type="text"
                placeholder="Ej: A-01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                name="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {hiveTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {hiveStatuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                name="color"
                type="text"
                placeholder="Ej: Amarillo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha instalación</label>
              <input
                name="installation_date"
                type="date"
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
              placeholder="Observaciones de la colmena..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Link
              href="/dashboard/hives"
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
