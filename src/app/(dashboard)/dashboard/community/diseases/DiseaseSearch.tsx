'use client'

import { useState } from 'react'
import type { DiseaseEntry } from '@/lib/types/database.types'

const severityConfig = {
  high:   { label: 'Alta',   color: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  medium: { label: 'Media',  color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low:    { label: 'Baja',   color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

export default function DiseaseSearch({ diseases }: { diseases: DiseaseEntry[] }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<DiseaseEntry | null>(null)

  const filtered = diseases.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.symptoms.toLowerCase().includes(query.toLowerCase())
  )

  if (selected) {
    const sev = severityConfig[selected.severity]
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          ← Volver a la biblioteca
        </button>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${sev.color}`}>
              Gravedad {sev.label}
            </span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-6">{selected.description}</p>

          <div className="space-y-5">
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 text-sm mb-2">🔍 Síntomas</h3>
              <p className="text-red-700 text-sm leading-relaxed">{selected.symptoms}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 text-sm mb-2">💊 Tratamiento</h3>
              <p className="text-green-700 text-sm leading-relaxed">{selected.treatment}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar enfermedad o síntoma..."
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No se encontraron enfermedades con ese término.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((disease) => {
            const sev = severityConfig[disease.severity]
            return (
              <button
                key={disease.id}
                onClick={() => setSelected(disease)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left
                           hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{disease.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${sev.color}`}>
                    {sev.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {disease.description}
                </p>
                <p className="text-xs text-amber-600 mt-3 font-medium">Ver más →</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
