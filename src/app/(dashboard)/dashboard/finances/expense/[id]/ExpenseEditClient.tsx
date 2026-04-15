'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateExpense } from '@/lib/actions/finances'
import type { Expense, Hive } from '@/lib/types/database.types'

const categories = [
  { value: 'equipment',  label: 'Equipamiento' },
  { value: 'medication', label: 'Medicamentos' },
  { value: 'feeding',    label: 'Alimentación' },
  { value: 'transport',  label: 'Transporte' },
  { value: 'other',      label: 'Otros' },
]

function SubmitButton() {
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

export default function ExpenseEditClient({ expense, hives }: { expense: Expense; hives: Hive[] }) {
  const action = updateExpense.bind(null, expense.id)
  const [state, formAction] = useFormState(action, {})

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/finances" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a finanzas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Editar gasto</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {state.error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                name="category"
                defaultValue={expense.category}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={expense.amount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                name="expense_date"
                type="date"
                required
                defaultValue={expense.expense_date}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <select
                name="currency"
                defaultValue={expense.currency}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colmena asociada</label>
            <select
              name="hive_id"
              defaultValue={expense.hive_id ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="">Sin colmena específica</option>
              {hives.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={expense.description ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Link href="/dashboard/finances" className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
