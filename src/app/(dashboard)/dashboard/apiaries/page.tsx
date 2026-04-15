import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Apiary } from '@/lib/types/database.types'

async function getOrgAndApiaries(): Promise<{ orgId: string; apiaries: Apiary[] } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!member) return null

  const { data: apiaries } = await supabase
    .from('apiaries')
    .select('*')
    .eq('organization_id', member.organization_id)
    .order('created_at', { ascending: false })

  return {
    orgId: member.organization_id,
    apiaries: (apiaries as Apiary[]) ?? [],
  }
}

export default async function ApiariesPage() {
  const data = await getOrgAndApiaries()
  if (!data) redirect('/dashboard')

  const { apiaries } = data

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apiarios</h1>
          <p className="text-gray-500 text-sm mt-1">Tus ubicaciones de colmenares</p>
        </div>
        <a
          href="/dashboard/apiaries/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
                     rounded-lg transition-colors text-center"
        >
          + Nuevo apiario
        </a>
      </div>

      {apiaries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <span className="text-5xl block mb-3">📍</span>
          <p className="text-gray-500 text-sm">No tenés apiarios registrados todavía.</p>
          <a
            href="/dashboard/apiaries/new"
            className="mt-4 inline-block text-sm text-amber-600 hover:underline font-medium"
          >
            Crear primer apiario
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {apiaries.map((apiary) => (
            <div
              key={apiary.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5
                         hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{apiary.name}</h3>
                  {apiary.location && (
                    <p className="text-sm text-gray-500 mt-0.5">{apiary.location}</p>
                  )}
                  {apiary.notes && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{apiary.notes}</p>
                  )}
                </div>
                <a
                  href={`/dashboard/apiaries/${apiary.id}`}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap ml-4"
                >
                  Ver detalle →
                </a>
              </div>
              {(apiary.latitude || apiary.longitude) && (
                <p className="text-xs text-gray-400 mt-3">
                  {apiary.latitude}, {apiary.longitude}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
