'use client'

import { useRouter } from 'next/navigation'

export default function RainfallFilters({
  apiaries,
  selectedApiaryId,
  selectedYear,
  yearOptions,
}: {
  apiaries: { id: string; name: string }[]
  selectedApiaryId: string | null
  selectedYear: number
  yearOptions: number[]
}) {
  const router = useRouter()

  function buildUrl(params: { year?: number; apiary_id?: string | null }) {
    const year = params.year ?? selectedYear
    const apiaryId = 'apiary_id' in params ? params.apiary_id : selectedApiaryId
    const p = new URLSearchParams({ tab: 'lluvia', year: String(year) })
    if (apiaryId) p.set('apiary_id', apiaryId)
    return `/dashboard/reports?${p.toString()}`
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Año:</label>
        <select
          value={selectedYear}
          onChange={(e) => router.push(buildUrl({ year: Number(e.target.value) }))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Apiario:</label>
        <select
          value={selectedApiaryId ?? ''}
          onChange={(e) => router.push(buildUrl({ apiary_id: e.target.value || null }))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Todos los apiarios</option>
          {apiaries.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
