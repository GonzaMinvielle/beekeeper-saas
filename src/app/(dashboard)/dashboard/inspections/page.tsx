import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Inspection } from '@/lib/types/database.types'

type InspectionWithHive = Inspection & {
  hives: { name: string } | null
}

async function getOrgAndInspections(): Promise<{ orgId: string; inspections: InspectionWithHive[] } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!member) return null

  const { data: inspections } = await supabase
    .from('inspections')
    .select('*, hives(name)')
    .eq('organization_id', member.organization_id)
    .order('inspected_at', { ascending: false })

  return {
    orgId: member.organization_id,
    inspections: (inspections as InspectionWithHive[]) ?? [],
  }
}

const healthLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Crítico',    color: 'bg-red-100 text-red-700' },
  2: { label: 'Malo',       color: 'bg-orange-100 text-orange-700' },
  3: { label: 'Regular',    color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Bueno',      color: 'bg-lime-100 text-lime-700' },
  5: { label: 'Excelente',  color: 'bg-green-100 text-green-700' },
}

export default async function InspectionsPage() {
  const data = await getOrgAndInspections()
  if (!data) redirect('/dashboard')

  const { inspections } = data

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspecciones</h1>
          <p className="text-gray-500 text-sm mt-1">Historial de revisiones de colmenas</p>
        </div>
        <a
          href="/dashboard/inspections/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
                     rounded-lg transition-colors text-center"
        >
          + Nueva inspección
        </a>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <span className="text-5xl block mb-3">📋</span>
          <p className="text-gray-500 text-sm">No hay inspecciones registradas todavía.</p>
          <a
            href="/dashboard/inspections/new"
            className="mt-4 inline-block text-sm text-amber-600 hover:underline font-medium"
          >
            Registrar primera inspección
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((inspection) => {
            const health = inspection.overall_health
              ? healthLabels[inspection.overall_health]
              : null
            const date = new Date(inspection.inspected_at).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })

            return (
              <div
                key={inspection.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5
                           hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {inspection.hives?.name ?? '—'}
                      </h3>
                      {health && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.color}`}>
                          {health.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{date}</p>
                    {inspection.weather && (
                      <p className="text-sm text-gray-400 mt-1">
                        Clima: {inspection.weather}
                        {inspection.temperature_c != null && ` · ${inspection.temperature_c}°C`}
                      </p>
                    )}
                    {inspection.notes && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{inspection.notes}</p>
                    )}
                  </div>
                  <a
                    href={`/dashboard/inspections/${inspection.id}`}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap ml-4"
                  >
                    Ver detalle →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
