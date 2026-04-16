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
                  {apiary.field_name && (
                    <p className="text-xs text-brand-green font-semibold mt-0.5">🌾 {apiary.field_name}</p>
                  )}
                  {apiary.location && (
                    <p className="text-sm text-gray-500 mt-0.5">{apiary.location}</p>
                  )}
                  {apiary.caretaker_name && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        👤 {apiary.caretaker_name}
                        {apiary.caretaker_phone && (
                          <span className="ml-2 text-gray-400">{apiary.caretaker_phone}</span>
                        )}
                      </p>
                      {apiary.caretaker_phone && (
                        <a
                          href={`https://wa.me/${apiary.caretaker_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp puestero"
                          className="flex items-center justify-center w-6 h-6 bg-[#25D366] hover:bg-[#20c05c]
                                     text-white rounded-md transition-colors shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      )}
                    </div>
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
