'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createPost } from '@/lib/actions/community'

const CATEGORIES = [
  { value: 'general',   label: 'General' },
  { value: 'disease',   label: 'Enfermedades' },
  { value: 'harvest',   label: 'Cosechas' },
  { value: 'equipment', label: 'Equipamiento' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Publicando...' : 'Publicar'}
    </button>
  )
}

export default function NewPostForm() {
  const [open, setOpen] = useState(false)
  const [state, action] = useFormState(createPost, {} as { error?: string })

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        + Nueva publicación
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Nueva publicación</h3>
      <form action={action} className="space-y-3">
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <input
          name="title"
          type="text"
          required
          placeholder="Título *"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <select
          name="category"
          defaultValue="general"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <textarea
          name="content"
          required
          rows={4}
          placeholder="Contá tu experiencia, pregunta o consejo..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <div className="flex gap-3">
          <SubmitButton />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
