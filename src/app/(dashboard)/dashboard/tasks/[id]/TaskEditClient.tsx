'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateTask, deleteTask } from '@/lib/actions/tasks'
import type { Task, Hive } from '@/lib/types/database.types'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

const priorityOptions = [
  { value: 'low', label: 'Baja' }, { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' }, { value: 'urgent', label: 'Urgente' },
]
const statusOptions = [
  { value: 'pending', label: 'Pendiente' }, { value: 'in_progress', label: 'En progreso' },
  { value: 'done', label: 'Completada' }, { value: 'cancelled', label: 'Cancelada' },
]

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

export default function TaskEditClient({ task, hives }: { task: Task; hives: HiveWithApiary[] }) {
  const updateWithId = updateTask.bind(null, task.id)
  const [state, formAction] = useFormState(updateWithId, {})

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/tasks" className="text-sm text-amber-600 hover:text-amber-700">
            ← Volver a tareas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Editar tarea</h1>
        </div>
        <form action={deleteTask.bind(null, task.id)}>
          <button type="submit"
            onClick={(e) => { if (!confirm('¿Eliminar esta tarea?')) e.preventDefault() }}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input name="title" type="text" required defaultValue={task.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colmena asociada</label>
            <select name="hive_id" defaultValue={task.hive_id ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white">
              <option value="">— ninguna —</option>
              {hives.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}{h.apiaries ? ` — ${h.apiaries.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select name="status" defaultValue={task.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white">
                {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select name="priority" defaultValue={task.priority}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white">
                {priorityOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
            <input name="due_date" type="date" defaultValue={task.due_date ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="description" rows={3} defaultValue={task.description ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SaveButton />
            <Link href="/dashboard/tasks" className="text-sm text-gray-500 hover:text-gray-700">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
