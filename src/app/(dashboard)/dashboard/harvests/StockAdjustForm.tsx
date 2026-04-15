'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { adjustHoneyStock } from '@/lib/actions/harvests'
import type { HoneyStock } from '@/lib/types/database.types'

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1 text-xs bg-amber-100 hover:bg-amber-200 disabled:opacity-50
                 text-amber-800 rounded font-medium transition-colors whitespace-nowrap"
    >
      {pending ? '...' : 'Guardar'}
    </button>
  )
}

export default function StockAdjustForm({ item }: { item: HoneyStock }) {
  const action = adjustHoneyStock.bind(null, item.id)
  const [state, formAction] = useFormState(action, {})

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        name="quantity_kg"
        type="number"
        step="0.01"
        min="0"
        defaultValue={item.quantity_kg}
        className="w-24 px-2 py-1 border border-gray-200 rounded text-sm text-center"
      />
      <SaveButton />
      {state?.error && (
        <span className="text-xs text-red-500">{state.error}</span>
      )}
      {state?.success && (
        <span className="text-xs text-green-600">✓</span>
      )}
    </form>
  )
}
