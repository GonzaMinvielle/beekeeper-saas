import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import type { Task } from '@/lib/types/database.types'
import ConfirmDeleteButton from '@/components/ui/ConfirmDeleteButton'

type TaskWithHive = Task & { hives: { name: string } | null }

const statusConfig: Record<string, { label: string; color: string; next: string; nextLabel: string }> = {
  pending:     { label: 'Pendiente',    color: 'bg-yellow-100 text-yellow-700',  next: 'in_progress', nextLabel: 'Iniciar' },
  in_progress: { label: 'En progreso',  color: 'bg-blue-100 text-blue-700',      next: 'done',        nextLabel: 'Completar' },
  done:        { label: 'Completada',   color: 'bg-green-100 text-green-700',    next: 'pending',     nextLabel: 'Reabrir' },
  cancelled:   { label: 'Cancelada',    color: 'bg-gray-100 text-gray-500',      next: 'pending',     nextLabel: 'Reabrir' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low:    { label: 'Baja',     color: 'text-gray-500' },
  medium: { label: 'Media',    color: 'text-blue-600' },
  high:   { label: 'Alta',     color: 'text-orange-600' },
  urgent: { label: 'Urgente',  color: 'text-red-600 font-bold' },
}

async function getData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  // Genera tareas automáticas para colmenas sin inspección (dispara la función de la DB)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('generate_inspection_tasks', { p_org_id: member.organization_id })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, hives(name)')
    .eq('organization_id', member.organization_id)
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  return { tasks: (tasks as TaskWithHive[]) ?? [] }
}

export default async function TasksPage() {
  const { tasks } = await getData()

  const active   = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const done     = tasks.filter((t) => t.status === 'done')
  const cancelled = tasks.filter((t) => t.status === 'cancelled')

  const overdueCount = active.filter((t) => t.due_date && new Date(t.due_date) < new Date()).length

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {active.length} activa{active.length !== 1 ? 's' : ''}
            {overdueCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">· {overdueCount} vencida{overdueCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <Link href="/dashboard/tasks/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
          + Nueva tarea
        </Link>
      </div>

      {/* Tareas activas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Activas <span className="text-gray-400 font-normal text-sm">({active.length})</span></h2>
        </div>

        {active.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay tareas pendientes. Bien hecho!
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {active.map((task) => {
              const status = statusConfig[task.status]
              const priority = priorityConfig[task.priority]
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
              const dueDate = task.due_date
                ? new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                : null

              return (
                <li key={task.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        <span className={`text-xs font-medium ${priority.color}`}>
                          ▲ {priority.label}
                        </span>
                        {task.hives && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {task.hives.name}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 text-sm mt-1">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                      )}
                      {dueDate && (
                        <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          {isOverdue ? '⚠️ Vencida' : 'Vence'}: {dueDate}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-1 sm:mt-0">
                      <form action={updateTaskStatus.bind(null, task.id, status.next)}>
                        <button type="submit"
                          className="px-2.5 py-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-medium transition-colors whitespace-nowrap">
                          {status.nextLabel}
                        </button>
                      </form>
                      <Link href={`/dashboard/tasks/${task.id}`}
                        className="px-2.5 py-1.5 text-xs border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg font-medium transition-colors hidden sm:block">
                        Editar
                      </Link>
                      <ConfirmDeleteButton
                        action={deleteTask.bind(null, task.id)}
                        message="¿Eliminar esta tarea?"
                        className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        ×
                      </ConfirmDeleteButton>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Tareas completadas (colapsadas) */}
      {done.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-gray-500">
              Completadas <span className="font-normal text-sm">({done.length})</span>
            </h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {done.slice(0, 5).map((task) => (
              <li key={task.id} className="px-5 py-3 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-sm text-gray-700 line-through">{task.title}</p>
                  {task.hives && <p className="text-xs text-gray-400">{task.hives.name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateTaskStatus.bind(null, task.id, 'pending')}>
                    <button type="submit" className="text-xs text-gray-400 hover:text-amber-600 font-medium">
                      Reabrir
                    </button>
                  </form>
                  <ConfirmDeleteButton
                    action={deleteTask.bind(null, task.id)}
                    message="¿Eliminar esta tarea?"
                    className="text-xs text-red-300 hover:text-red-500 px-1"
                  >
                    ×
                  </ConfirmDeleteButton>
                </div>
              </li>
            ))}
            {done.length > 5 && (
              <li className="px-5 py-3 text-center text-xs text-gray-400">
                y {done.length - 5} más completadas...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Canceladas (solo si hay) */}
      {cancelled.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm opacity-50">
          <div className="p-4">
            <p className="text-sm text-gray-400 font-medium">
              {cancelled.length} tarea{cancelled.length !== 1 ? 's' : ''} cancelada{cancelled.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
