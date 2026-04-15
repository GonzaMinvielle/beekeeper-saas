'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createFlowering } from '@/lib/actions/flowering'

const MONTHS = [
  { value: 1,  label: 'Enero' },
  { value: 2,  label: 'Febrero' },
  { value: 3,  label: 'Marzo' },
  { value: 4,  label: 'Abril' },
  { value: 5,  label: 'Mayo' },
  { value: 6,  label: 'Junio' },
  { value: 7,  label: 'Julio' },
  { value: 8,  label: 'Agosto' },
  { value: 9,  label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
    >
      {pending ? '...' : '+ Agregar'}
    </button>
  )
}

export default function FloweringForm() {
  const [state, action] = useFormState(createFlowering, {})

  return (
    <form action={action} className="p-5 border-b border-gray-100 space-y-3">
      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <input
            name="plant_name"
            type="text"
            required
            placeholder="Nombre de la planta *"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <select
            name="start_month"
            required
            defaultValue=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          >
            <option value="" disabled>Mes inicio *</option>
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <select
            name="end_month"
            required
            defaultValue=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          >
            <option value="" disabled>Mes fin *</option>
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <input
          name="region"
          type="text"
          placeholder="Región (opcional)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <input
          name="notes"
          type="text"
          placeholder="Notas (opcional)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <SubmitButton />
      </div>
    </form>
  )
}
