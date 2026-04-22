'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Apiary = { id: string; name: string }

export default function InspectionTypeSelector({ apiaries }: { apiaries: Apiary[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<'hive' | 'apiary' | null>(null)
  const [apiaryId, setApiaryId] = useState('')

  function handleApiary() {
    if (!apiaryId) return
    router.push(`/dashboard/inspections/apiary/new?apiary_id=${apiaryId}`)
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/inspections" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a inspecciones
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nueva inspección</h1>
        <p className="text-sm text-gray-500 mt-1">¿Qué tipo de inspección querés registrar?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Inspección de apiario */}
        <button
          type="button"
          onClick={() => setSelected(selected === 'apiary' ? null : 'apiary')}
          className={`text-left rounded-xl border-2 p-5 transition-all
            ${selected === 'apiary'
              ? 'border-amber-400 bg-amber-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40'}`}
        >
          <span className="text-3xl block mb-3">🏕️</span>
          <p className="font-semibold text-gray-900 text-sm">Inspección de apiario</p>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Para evaluar el estado general del apiario y marcar colmenas que requieren atención.
          </p>
        </button>

        {/* Inspección de colmena */}
        <Link
          href="/dashboard/inspections/new?type=hive"
          className={`text-left rounded-xl border-2 p-5 transition-all
            border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40`}
        >
          <span className="text-3xl block mb-3">🐝</span>
          <p className="font-semibold text-gray-900 text-sm">Inspección de colmena</p>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Para registrar el detalle completo de una colmena específica.
          </p>
        </Link>
      </div>

      {/* Apiary selector — expands when apiary card is selected */}
      {selected === 'apiary' && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Seleccioná el apiario a inspeccionar
          </label>
          {apiaries.length === 0 ? (
            <p className="text-sm text-gray-400">
              No hay apiarios. <Link href="/dashboard/apiaries/new" className="text-amber-600 hover:underline">Creá uno primero.</Link>
            </p>
          ) : (
            <>
              <select
                value={apiaryId}
                onChange={(e) => setApiaryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                <option value="">— Seleccioná un apiario —</option>
                {apiaries.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!apiaryId}
                onClick={handleApiary}
                className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200
                           text-white font-semibold text-sm rounded-lg transition-colors"
              >
                Continuar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
