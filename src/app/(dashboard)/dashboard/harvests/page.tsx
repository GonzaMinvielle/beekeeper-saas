import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Harvest, HoneyStock } from '@/lib/types/database.types'
import { honeyTypes } from '@/lib/types/database.types'
import StockAdjustForm from './StockAdjustForm'

type HarvestWithHive = Harvest & { hives: { name: string; apiaries: { name: string } | null } | null }

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

  const [harvestsRes, stockRes] = await Promise.all([
    supabase
      .from('harvests')
      .select('*, hives(name, apiaries(name))')
      .eq('organization_id', member.organization_id)
      .order('harvested_at', { ascending: false }),
    supabase
      .from('honey_stock')
      .select('*')
      .eq('organization_id', member.organization_id)
      .order('honey_type'),
  ])

  return {
    orgId: member.organization_id,
    harvests: (harvestsRes.data as HarvestWithHive[]) ?? [],
    stock: (stockRes.data as HoneyStock[]) ?? [],
  }
}

const honeyLabel: Record<string, string> = Object.fromEntries(
  honeyTypes.map((t) => [t.value, t.label])
)

export default async function HarvestsPage() {
  const { harvests, stock } = await getData()

  const totalKg = harvests.reduce((s, h) => s + h.weight_kg, 0)

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cosechas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {harvests.length} cosecha{harvests.length !== 1 ? 's' : ''} · {totalKg.toFixed(1)} kg totales
          </p>
        </div>
        <Link
          href="/dashboard/harvests/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Nueva cosecha
        </Link>
      </div>

      {/* Stock actual */}
      {stock.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Stock actual de miel</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Se actualiza automáticamente con cada cosecha. Podés ajustar la cantidad disponible manualmente.
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {stock.map((item) => (
              <div key={item.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍯</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {honeyLabel[item.honey_type] ?? item.honey_type}
                    </p>
                    <p className="text-xs text-gray-400">
                      Actualizado {new Date(item.last_updated).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StockAdjustForm item={item} />
                  <span className="text-xs text-gray-400">kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de cosechas */}
      {harvests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <span className="text-5xl block mb-3">🍯</span>
          <p className="text-gray-500 text-sm">No hay cosechas registradas todavía.</p>
          <Link href="/dashboard/harvests/new" className="mt-4 inline-block text-sm text-amber-600 hover:underline font-medium">
            Registrar primera cosecha
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Historial de cosechas</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {harvests.map((h) => {
              const label = honeyLabel[h.honey_type] ?? h.honey_type
              const date = new Date(h.harvested_at + 'T12:00:00').toLocaleDateString('es-AR', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
              return (
                <li key={h.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[48px]">
                        <p className="text-lg font-bold text-amber-600">{h.weight_kg}</p>
                        <p className="text-xs text-gray-400">kg</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {h.hives?.name ?? '—'}
                          </p>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            {label}
                          </span>
                          {h.batch_code && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                              {h.batch_code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {h.hives?.apiaries?.name ?? ''} · {date}
                        </p>
                        {h.quality_notes && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{h.quality_notes}</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/harvests/${h.id}`}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap ml-4"
                    >
                      Editar →
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
