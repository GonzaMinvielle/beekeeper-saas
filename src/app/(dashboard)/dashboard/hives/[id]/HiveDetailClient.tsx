'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { updateHive, deleteHive } from '@/lib/actions/hives'
import { saveQueen } from '@/lib/actions/queens'
import { createFeeding, deleteFeeding } from '@/lib/actions/feedings'
import { addHiveSuper, removeHiveSuper, deleteHiveSuper } from '@/lib/actions/hive_supers'
import type { Apiary, Hive, Inspection, Queen, MarkingColor, Feeding, FoodType, HiveSuper } from '@/lib/types/database.types'
import { foodTypes } from '@/lib/types/database.types'
import type { ApiaryInspectionEvent } from './page'

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

const priorityConfig = {
  low:    { label: 'Baja',  color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
  high:   { label: 'Alta',  color: 'bg-red-100 text-red-700' },
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

const queenOutcomeOptions = [
  { value: 'superseded', label: 'Fue reemplazada' },
  { value: 'dead',       label: 'Murió' },
  { value: 'removed',    label: 'Fue removida' },
]

const queenStatusLabels: Record<string, { label: string; color: string }> = {
  active:     { label: 'Activa',      color: 'bg-green-100 text-green-700' },
  superseded: { label: 'Reemplazada', color: 'bg-gray-100 text-gray-600' },
  dead:       { label: 'Muerta',      color: 'bg-red-100 text-red-700' },
  removed:    { label: 'Removida',    color: 'bg-orange-100 text-orange-700' },
}

// ── Queen section component ────────────────────────────────────────────────

function QueenSection({ hiveId, queen }: { hiveId: string; queen: Queen | null }) {
  const saveQueenWithId = saveQueen.bind(null, hiveId)
  const [state, formAction] = useFormState(saveQueenWithId, {})
  const [mode, setMode] = useState<'view' | 'edit' | 'replace' | 'new'>('view')

  const isActive = queen?.status === 'active'

  // Close form on successful save
  useEffect(() => {
    if (state.success) setMode('view')
  }, [state])

  const colorHex: Record<string, string> = {
    white: '#ffffff', yellow: '#facc15', red: '#ef4444',
    green: '#22c55e', blue: '#3b82f6',
  }

  function MarkingColorPicker({ defaultValue }: { defaultValue?: string | null }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Color de marca</label>
        <div className="flex flex-wrap gap-3">
          {markingColors.map((c) => (
            <label key={c.value} className="cursor-pointer flex flex-col items-center gap-1" title={c.label}>
              <input type="radio" name="marking_color" value={c.value}
                defaultChecked={defaultValue === c.value} className="sr-only peer" />
              <div className="w-7 h-7 rounded-full border-2 border-gray-300 peer-checked:border-amber-500
                             peer-checked:scale-110 transition-all shadow-sm"
                style={{ backgroundColor: c.hex }} />
              <span className="text-xs text-gray-400">{c.label.split(' ')[0]}</span>
            </label>
          ))}
          <label className="cursor-pointer flex flex-col items-center gap-1" title="Sin color">
            <input type="radio" name="marking_color" value=""
              defaultChecked={!defaultValue} className="sr-only peer" />
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300
                           peer-checked:border-amber-500 peer-checked:scale-110 transition-all
                           flex items-center justify-center">
              <span className="text-gray-400 text-xs">—</span>
            </div>
            <span className="text-xs text-gray-400">Ninguno</span>
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">👑 Reina</h2>

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* ── VIEW MODE ── */}
      {mode === 'view' && (
        <>
          {queen ? (
            <div className="space-y-3">
              {/* Current queen summary */}
              <div className="flex items-center gap-3 flex-wrap">
                {queen.marking_color && (
                  <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: colorHex[queen.marking_color] ?? '#ccc' }} />
                )}
                {queen.year_born && (
                  <span className="text-sm font-medium text-gray-700">
                    Año {queen.year_born}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${queenStatusLabels[queen.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                  {queenStatusLabels[queen.status]?.label ?? queen.status}
                </span>
              </div>
              {queen.notes && (
                <p className="text-xs text-gray-500 italic">{queen.notes}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setMode('edit')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Editar datos
                </button>
                {isActive && (
                  <>
                    <span className="text-gray-300">·</span>
                    <button type="button" onClick={() => setMode('replace')}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                      Cambiar reina
                    </button>
                  </>
                )}
                {!isActive && (
                  <>
                    <span className="text-gray-300">·</span>
                    <button type="button" onClick={() => setMode('new')}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                      Registrar nueva reina
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Sin reina registrada.</p>
              <button type="button" onClick={() => setMode('new')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                + Registrar reina
              </button>
            </div>
          )}
        </>
      )}

      {/* ── EDIT MODE (current active queen) ── */}
      {mode === 'edit' && (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="queen_status" value={queen?.status ?? 'active'} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Año de nacimiento</label>
              <input name="year_born" type="number" min="2000" max="2099"
                defaultValue={queen?.year_born ?? ''}
                placeholder={String(new Date().getFullYear())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          </div>
          <MarkingColorPicker defaultValue={queen?.marking_color} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <textarea name="queen_notes" rows={2} defaultValue={queen?.notes ?? ''}
              placeholder="Temperamento, origen, observaciones..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" />
          </div>
          <div className="flex gap-2">
            <SaveButton label="Guardar" />
            <button type="button" onClick={() => setMode('view')}
              className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </form>
      )}

      {/* ── REPLACE MODE (active queen → new queen) ── */}
      {mode === 'replace' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-800 mb-2">¿Qué pasó con la reina anterior?</p>
            <select className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
              {queenOutcomeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="text-xs text-amber-600 mt-2">
              Los datos de la reina anterior serán reemplazados.
            </p>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nueva reina</p>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="queen_status" value="active" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Año de nacimiento</label>
                <input name="year_born" type="number" min="2000" max="2099"
                  placeholder={String(new Date().getFullYear())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
              </div>
            </div>
            <MarkingColorPicker defaultValue={null} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
              <textarea name="queen_notes" rows={2}
                placeholder="Temperamento, origen, observaciones..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" />
            </div>
            <div className="flex gap-2">
              <SaveButton label="Registrar nueva reina" />
              <button type="button" onClick={() => setMode('view')}
                className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ── NEW MODE (no queen or inactive) ── */}
      {mode === 'new' && (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="queen_status" value="active" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Año de nacimiento</label>
              <input name="year_born" type="number" min="2000" max="2099"
                placeholder={String(new Date().getFullYear())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          </div>
          <MarkingColorPicker defaultValue={null} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <textarea name="queen_notes" rows={2}
              placeholder="Temperamento, origen, observaciones..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" />
          </div>
          <div className="flex gap-2">
            <SaveButton label="Registrar reina" />
            <button type="button" onClick={() => setMode('view')}
              className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Supers panel ──────────────────────────────────────────────────────────

const DAYS_READY = 21
const DAYS_ALERT = 30

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function RemoveSuperForm({
  super: s,
  hiveId,
  onCancel,
}: {
  super: HiveSuper
  hiveId: string
  onCancel: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const action = removeHiveSuper.bind(null, s.id, hiveId)
  return (
    <form action={action} className="mt-3 ml-8 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de retiro</label>
          <input
            name="removed_at"
            type="date"
            defaultValue={today}
            required
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Motivo</label>
          <select
            name="removal_reason"
            defaultValue="harvest"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          >
            <option value="harvest">Para cosechar</option>
            <option value="other">Otro motivo</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notas (opcional)</label>
        <textarea
          name="notes"
          rows={1}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Confirmar retiro
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

function SupersPanel({
  hiveId,
  supers,
}: {
  hiveId: string
  supers: HiveSuper[]
}) {
  const activeSupers = supers.filter((s) => !s.removed_at)
  const removedSupers = supers.filter((s) => s.removed_at)
  const [showAddForm, setShowAddForm] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const addWithHiveId = addHiveSuper.bind(null, hiveId)
  const [addState, addAction] = useFormState(addWithHiveId, {})

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (addState.success) setShowAddForm(false)
  }, [addState])

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">Alzas</h2>
          {activeSupers.length > 0 ? (
            <span className="text-xs bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">
              {activeSupers.length} activa{activeSupers.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2.5 py-1 rounded-full">
              Sin alzas
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700
                     flex items-center justify-center text-lg font-bold transition-colors"
          title="Agregar alza"
        >
          {showAddForm ? '×' : '+'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          {addState.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {addState.error}
            </div>
          )}
          <form action={addAction} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de colocación</label>
                <input
                  name="placed_at"
                  type="date"
                  defaultValue={today}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas (opcional)</label>
              <textarea
                name="notes"
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <SaveButton label="Agregar alza" />
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active supers list */}
      {activeSupers.length === 0 && !showAddForm ? (
        <div className="p-6 text-center text-gray-400 text-sm">Sin alzas activas</div>
      ) : activeSupers.length > 0 ? (
        <ul className="divide-y divide-gray-50">
          {activeSupers.map((s) => {
            const days = daysSince(s.placed_at)
            const isReady = days >= DAYS_READY
            const isAlert = days >= DAYS_ALERT
            return (
              <li key={s.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-700">Colocada {formatDate(s.placed_at)}</span>
                    {isAlert ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                        {days}d — ¡Retirar urgente!
                      </span>
                    ) : isReady ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                        {days}d — Lista para cosechar
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">{days}d</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRemovingId(removingId === s.id ? null : s.id)}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Retirar
                    </button>
                    <form action={deleteHiveSuper.bind(null, s.id, hiveId)}>
                      <button
                        type="submit"
                        onClick={(e) => { if (!confirm('¿Eliminar este alza?')) e.preventDefault() }}
                        className="text-xs text-red-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </form>
                  </div>
                </div>
                {s.notes && <p className="text-xs text-gray-500 mt-0.5">{s.notes}</p>}
                {removingId === s.id && (
                  <RemoveSuperForm
                    super={s}
                    hiveId={hiveId}
                    onCancel={() => setRemovingId(null)}
                  />
                )}
              </li>
            )
          })}
        </ul>
      ) : null}

      {/* Removed history */}
      {removedSupers.length > 0 && (
        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="w-full px-5 py-3 text-xs text-gray-400 hover:text-gray-600 text-left flex items-center gap-1"
          >
            {showHistory ? '▾' : '▸'} Historial ({removedSupers.length} retirada{removedSupers.length !== 1 ? 's' : ''})
          </button>
          {showHistory && (
            <ul className="divide-y divide-gray-50 pb-2">
              {removedSupers.map((s) => (
                <li key={s.id} className="px-5 py-2.5 flex items-center justify-between gap-2">
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <div>
                      Colocada {formatDate(s.placed_at)} — Retirada {s.removed_at ? formatDate(s.removed_at) : '—'}
                    </div>
                    <div className="text-gray-400">
                      {s.removal_reason === 'harvest' ? 'Para cosechar' : 'Otro motivo'}
                      {s.notes ? ` · ${s.notes}` : ''}
                    </div>
                  </div>
                  <form action={deleteHiveSuper.bind(null, s.id, hiveId)}>
                    <button
                      type="submit"
                      onClick={(e) => { if (!confirm('¿Eliminar este registro?')) e.preventDefault() }}
                      className="text-xs text-red-400 hover:text-red-600 shrink-0"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ── Feeding panel ──────────────────────────────────────────────────────────

function FeedingPanel({
  hiveId,
  feedings,
}: {
  hiveId: string
  feedings: Feeding[]
}) {
  const [showForm, setShowForm] = useState(false)
  const createWithId = createFeeding.bind(null, hiveId)
  const [state, formAction] = useFormState(createWithId, {})

  const today = new Date().toISOString().slice(0, 10)

  // Close form on success — state gets new object reference each submit
  useEffect(() => {
    if (state.success) setShowForm(false)
  }, [state])

  // Season total (from August, southern hemisphere)
  const now = new Date()
  const seasonStart = now.getMonth() >= 7
    ? new Date(now.getFullYear(), 7, 1)
    : new Date(now.getFullYear() - 1, 7, 1)
  const seasonTotal = feedings
    .filter((f) => new Date(f.date) >= seasonStart)
    .reduce((sum, f) => sum + Number(f.quantity_kg), 0)

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  const foodLabel = (type: FoodType) =>
    foodTypes.find((f) => f.value === type)?.label ?? type

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Alimentación</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700
                     flex items-center justify-center text-lg font-bold transition-colors"
          title="Agregar registro"
        >
          {showForm ? '×' : '+'}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          {state.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {state.error}
            </div>
          )}
          <form action={formAction} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                <input
                  name="date"
                  type="date"
                  defaultValue={today}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select
                  name="food_type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                >
                  {foodTypes.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad (kg)</label>
              <input
                name="quantity_kg"
                type="number"
                step="0.1"
                min="0.1"
                required
                placeholder="Ej: 2.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas (opcional)</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <SaveButton label="Guardar" />
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {feedings.length === 0 && !showForm ? (
        <div className="p-6 text-center text-gray-400 text-sm">
          Sin registros de alimentación
        </div>
      ) : feedings.length > 0 ? (
        <>
          <ul className="divide-y divide-gray-50">
            {feedings.map((f) => (
              <li key={f.id} className="px-5 py-3 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">{foodLabel(f.food_type)}</span>
                    <span className="text-sm text-amber-700 font-semibold">{f.quantity_kg} kg</span>
                    <span className="text-xs text-gray-400">{formatDate(f.date)}</span>
                  </div>
                  {f.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{f.notes}</p>}
                </div>
                <form action={deleteFeeding.bind(null, f.id, hiveId, null)}>
                  <button
                    type="submit"
                    onClick={(e) => { if (!confirm('¿Eliminar este registro?')) e.preventDefault() }}
                    className="text-xs text-red-400 hover:text-red-600 shrink-0"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
          {/* Season total */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500">
              Total temporada actual:{' '}
              <span className="font-semibold text-gray-800">{seasonTotal.toFixed(1)} kg</span>
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}

// ── Unified timeline ───────────────────────────────────────────────────────

type TimelineItem =
  | { kind: 'hive'; inspection: Inspection & { overall_health: number | null } }
  | { kind: 'apiary'; event: ApiaryInspectionEvent }

function buildTimeline(
  inspections: (Inspection & { overall_health: number | null })[],
  apiaryEvents: ApiaryInspectionEvent[]
): TimelineItem[] {
  const items: TimelineItem[] = [
    ...inspections.map((i) => ({ kind: 'hive' as const, inspection: i })),
    ...apiaryEvents.map((e) => ({ kind: 'apiary' as const, event: e })),
  ]
  items.sort((a, b) => {
    const dateA = a.kind === 'hive' ? a.inspection.inspected_at : a.event.inspected_at
    const dateB = b.kind === 'hive' ? b.inspection.inspected_at : b.event.inspected_at
    return dateB.localeCompare(dateA)
  })
  return items
}

// ── Main component ─────────────────────────────────────────────────────────

export default function HiveDetailClient({
  hive,
  apiaries,
  inspections,
  queen,
  apiaryEvents,
  feedings,
  supers,
}: {
  hive: Hive
  apiaries: Apiary[]
  inspections: (Inspection & { overall_health: number | null })[]
  queen: Queen | null
  apiaryEvents: ApiaryInspectionEvent[]
  feedings: Feeding[]
  supers: HiveSuper[]
}) {
  const updateWithId = updateHive.bind(null, hive.id)
  const [state, formAction] = useFormState(updateWithId, {})

  const timeline = buildTimeline(inspections, apiaryEvents)

  return (
    <div className="max-w-4xl space-y-6">
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

      {/* Desktop: two columns — form left, feeding right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT: Edit form */}
        <div className="space-y-6">
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
          <QueenSection hiveId={hive.id} queen={queen} />
        </div>

        {/* RIGHT: Supers + Feeding */}
        <div className="space-y-6">
          <SupersPanel hiveId={hive.id} supers={supers} />
          <FeedingPanel hiveId={hive.id} feedings={feedings} />
        </div>
      </div>

      {/* Unified inspection timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Historial de inspecciones
            <span className="ml-2 text-sm font-normal text-gray-400">({timeline.length})</span>
          </h2>
          <Link
            href="/dashboard/inspections/new?type=hive"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            + Nueva inspección
          </Link>
        </div>

        {timeline.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay inspecciones registradas para esta colmena.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {timeline.map((item) => {
              if (item.kind === 'hive') {
                const insp = item.inspection
                const health = insp.overall_health ? healthLabels[insp.overall_health] : null
                const date = new Date(insp.inspected_at).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                return (
                  <li key={`h-${insp.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                        Inspección individual
                      </span>
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
              } else {
                const ev = item.event
                const date = ev.inspected_at
                  ? new Date(ev.inspected_at).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                  : '—'
                const priority = priorityConfig[ev.priority]
                return (
                  <li key={`a-${ev.id}`} className="px-5 py-3 flex items-start justify-between gap-3 hover:bg-gray-50">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700">
                          Inspección de apiario
                        </span>
                        <span className="text-sm text-gray-700">{date}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                      {ev.observation && (
                        <p className="text-xs text-gray-500 truncate pl-0.5">{ev.observation}</p>
                      )}
                      {ev.apiary_name && (
                        <p className="text-xs text-gray-400 pl-0.5">Apiario: {ev.apiary_name}</p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/inspections/${ev.inspection_id}`}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium shrink-0"
                    >
                      Ver →
                    </Link>
                  </li>
                )
              }
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
