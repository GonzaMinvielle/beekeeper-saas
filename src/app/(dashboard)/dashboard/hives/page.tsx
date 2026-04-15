import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Hive, HiveStatus, HiveType } from '@/lib/types/database.types'

const hiveTypeLabels: Record<HiveType, string> = {
  langstroth: 'Langstroth',
  dadant:     'Dadant',
  warre:      'Warré',
  top_bar:    'Top Bar',
  flow_hive:  'Flow Hive',
  layens:     'Layens',
  other:      'Otro',
}

type HiveWithApiary = Hive & {
  apiaries: { name: string } | null
}

async function getOrgAndHives(): Promise<{ orgId: string; hives: HiveWithApiary[] } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!member) return null

  const { data: hives } = await supabase
    .from('hives')
    .select('*, apiaries(name)')
    .eq('organization_id', member.organization_id)
    .order('created_at', { ascending: false })

  return {
    orgId: member.organization_id,
    hives: (hives as HiveWithApiary[]) ?? [],
  }
}

const statusConfig: Record<HiveStatus, { label: string; color: string }> = {
  active:   { label: 'Activa',    color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactiva',  color: 'bg-gray-100 text-gray-600' },
  dead:     { label: 'Muerta',    color: 'bg-red-100 text-red-700' },
  sold:     { label: 'Vendida',   color: 'bg-blue-100 text-blue-700' },
}

export default async function HivesPage() {
  const data = await getOrgAndHives()
  if (!data) redirect('/dashboard')

  const { hives } = data

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colmenas</h1>
          <p className="text-gray-500 text-sm mt-1">Todas tus colmenas registradas</p>
        </div>
        <a
          href="/dashboard/hives/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
                     rounded-lg transition-colors text-center"
        >
          + Nueva colmena
        </a>
      </div>

      {hives.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <span className="text-5xl block mb-3">🏡</span>
          <p className="text-gray-500 text-sm">No tenés colmenas registradas todavía.</p>
          <a
            href="/dashboard/hives/new"
            className="mt-4 inline-block text-sm text-amber-600 hover:underline font-medium"
          >
            Registrar primera colmena
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {hives.map((hive) => {
            const status = statusConfig[hive.status]
            return (
              <div
                key={hive.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5
                           hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{hive.name}</h3>
                      {hive.code && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                          {hive.code}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {hive.apiaries?.name ?? '—'} · {hiveTypeLabels[hive.type]}
                    </p>
                    {hive.notes && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{hive.notes}</p>
                    )}
                  </div>
                  <a
                    href={`/dashboard/hives/${hive.id}`}
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
