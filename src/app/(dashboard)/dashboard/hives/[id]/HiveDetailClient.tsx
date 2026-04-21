'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateHive, deleteHive } from '@/lib/actions/hives'
import { saveQueen } from '@/lib/actions/queens'
import type { Apiary, Hive, Inspection, Queen, MarkingColor } from '@/lib/types/database.types'

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

const healthLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Crítico',   color: 'bg-red-100 text-red-700' },
  2: { label: 'Malo',      color: 'bg-orange-100 text-orange-700' },
  3: { label: 'Regular',   color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Bueno',     color: 'bg-lime-100 text-lime-700' },
  5: { label: 'Excelente', color: 'bg-green-100 text-green-700' },
}

function SaveButton({ label = 'Guardar cambios' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : label}
    </button>
  )
}

const markingColors: { value: MarkingColor; hex: string; label: string }[] = [
  { value: 'white',  hex: '#ffffff', label: 'Blanco (1/6)' },
  { value: 'yellow', hex: '#facc15', label: 'Amarillo (2/7)' },
  { value: 'red',    hex: '#ef4444', label: 'Rojo (3/8)' },
  { value: 'green',  hex: '#22c55e', label: 'Verde (4/9)' },
  { value: 'blue',   hex: '#3b82f6', label: 'Azul (5/0)' },
]

const queenStatuses = [
  { value: 'active',      label: 'Activa' },
  { value: 'superseded',  label: 'Reemplazada' },
  { value: 'dead',        label: 'Muerta' },
  { value: 'removed',     label: 'Removida' },
]

export default function HiveDetailClient({
  hive,
  apiaries,
  inspections,
  queen,
}: {
  hive: Hive
  apiaries: Apiary[]
  inspections: (Inspection & { overall_health: number | null })[]
  queen: Queen | null
}) {
  const updateWithId = updateHive.bind(null, hive.id)
  const [state, formAction] = useFormState(updateWithId, {})

  const saveQueenWithId = saveQueen.bind(null, hive.id)
  const [queenState, queenFormAction] = useFormState(saveQueenWithId, {})

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/hives" className="text-sm text-amber-600 hover:text-amber-700">
            ← Volver a colmenas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{hive.name}</h1>
        </div>
        <form action={deleteHive.bind(null, hive.id)}>
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm('¿Eliminar esta colmena? Se eliminarán también sus inspecciones.')) {
                e.preventDefault()
              }
            }}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50
                       border border-red-200 rounded-lg transition-colors font-medium"
          >
            Eliminar
          </button>
        </form>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Editar colmena</h2>

        {state.error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apiario <span className="text-red-500">*</span>
            </label>
            <select
              name="apiary_id"
              required
              defaultValue={hive.apiary_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={hive.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código / etiqueta</label>
              <input
                name="code"
                type="text"
                defaultValue={hive.code ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                name="type"
                defaultValue={hive.type}
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
                defaultValue={hive.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {hiveStatuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                name="color"
                type="text"
                defaultValue={hive.color ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha instalación</label>
              <input
                name="installation_date"
                type="date"
                defaultValue={hive.installation_date ?? ''}
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
              defaultValue={hive.notes ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SaveButton />
            <Link href="/dashboard/hives" className="text-sm text-gray-500 hover:text-gray-700">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Reina */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-5">👑 Reina</h2>

        {queenState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {queenState.error}
          </div>
        )}
        {queenState.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Datos de reina guardados.
          </div>
        )}

        <form action={queenFormAction} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                name="queen_status"
                defaultValue={queen?.status ?? 'active'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {queenStatuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año de nacimiento</label>
              <input
                name="year_born"
                type="number"
                min="2000"
                max="2099"
                defaultValue={queen?.year_born ?? ''}
                placeholder={String(new Date().getFullYear())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color de marca</label>
            <div className="flex flex-wrap gap-3">
              {markingColors.map((c) => (
                <label key={c.value} className="cursor-pointer flex flex-col items-center gap-1" title={c.label}>
                  <input
                    type="radio"
                    name="marking_color"
                    value={c.value}
                    defaultChecked={queen?.marking_color === c.value}
                    className="sr-only peer"
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 peer-checked:border-amber-500
                               peer-checked:scale-110 transition-all shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs text-gray-400">{c.label.split(' ')[0]}</span>
                </label>
              ))}
              <label className="cursor-pointer flex flex-col items-center gap-1" title="Sin color">
                <input
                  type="radio"
                  name="marking_color"
                  value=""
                  defaultChecked={!queen?.marking_color}
                  className="sr-only peer"
                />
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 peer-checked:border-amber-500
                               peer-checked:scale-110 transition-all flex items-center justify-center">
                  <span className="text-gray-400 text-xs">—</span>
                </div>
                <span className="text-xs text-gray-400">Ninguno</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              name="queen_notes"
              rows={2}
              defaultValue={queen?.notes ?? ''}
              placeholder="Temperamento, origen, observaciones..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <SaveButton label="Guardar reina" />
        </form>
      </div>

      {/* Inspections */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Últimas inspecciones
            <span className="ml-2 text-sm font-normal text-gray-400">({inspections.length})</span>
          </h2>
          <Link
            href="/dashboard/inspections/new"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            + Nueva inspección
          </Link>
        </div>

        {inspections.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay inspecciones registradas para esta colmena.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {inspections.map((insp) => {
              const health = insp.overall_health ? healthLabels[insp.overall_health] : null
              const date = new Date(insp.inspected_at).toLocaleDateString('es-AR', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
              return (
                <li key={insp.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{date}</span>
                    {health && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.color}`}>
                        {health.label}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/inspections/${insp.id}`}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Ver →
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
