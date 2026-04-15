import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type RecentInspection = {
  id: string
  inspected_at: string
  overall_health: number | null
  notes: string | null
  hives: { name: string } | null
}

type ExpiringMed = {
  id: string
  product_name: string
  expiry_date: string | null
  quantity: number
  unit: string
}

type PendingTask = {
  id: string
  title: string
  due_date: string | null
  priority: string
  status: string
}

async function getCurrentOrgId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  return data?.organization_id ?? null
}

async function getDashboardData(orgId: string) {
  const supabase = createClient()

  const thisYear = new Date().getFullYear()
  const yearFrom = `${thisYear}-01-01`
  const yearTo   = `${thisYear}-12-31`

  const [
    apiariesRes, hivesRes, inspectionsRes,
    harvestsRes, tasksRes,
    recentInspRes, expiringMedsRes, pendingTasksRes,
    salesRes, expensesRes,
  ] = await Promise.all([
    supabase.from('apiaries').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('hives').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
    supabase.from('inspections').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('harvests').select('weight_kg').eq('organization_id', orgId),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['pending', 'in_progress']),
    supabase.from('inspections').select('id, inspected_at, overall_health, notes, hives(name)').eq('organization_id', orgId).order('inspected_at', { ascending: false }).limit(5),
    supabase.from('medications_stock').select('id, product_name, expiry_date, quantity, unit').eq('organization_id', orgId).not('expiry_date', 'is', null).lte('expiry_date', new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)).order('expiry_date'),
    supabase.from('tasks').select('id, title, due_date, priority, status').eq('organization_id', orgId).in('status', ['pending', 'in_progress']).order('priority', { ascending: false }).order('due_date', { ascending: true, nullsFirst: false }).limit(5),
    supabase.from('sales').select('total').eq('organization_id', orgId).gte('sale_date', yearFrom).lte('sale_date', yearTo),
    supabase.from('expenses').select('amount').eq('organization_id', orgId).gte('expense_date', yearFrom).lte('expense_date', yearTo),
  ])

  const totalHarvestKg = (harvestsRes.data ?? []).reduce((s: number, h: { weight_kg: number }) => s + h.weight_kg, 0)
  const totalRevenue   = (salesRes.data ?? []).reduce((s: number, v: { total: number }) => s + v.total, 0)
  const totalExpenses  = (expensesRes.data ?? []).reduce((s: number, e: { amount: number }) => s + e.amount, 0)

  return {
    stats: {
      apiaries:         apiariesRes.count ?? 0,
      activeHives:      hivesRes.count ?? 0,
      totalInspections: inspectionsRes.count ?? 0,
      totalHarvestKg,
      pendingTasks:     tasksRes.count ?? 0,
      totalRevenue,
      totalExpenses,
    },
    recentInspections: (recentInspRes.data as RecentInspection[]) ?? [],
    expiringMeds:      (expiringMedsRes.data as ExpiringMed[]) ?? [],
    pendingTasks:      (pendingTasksRes.data as PendingTask[]) ?? [],
  }
}

const healthLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Crítico',   color: 'text-red-600' },
  2: { label: 'Malo',      color: 'text-orange-500' },
  3: { label: 'Regular',   color: 'text-yellow-500' },
  4: { label: 'Bueno',     color: 'text-lime-600' },
  5: { label: 'Excelente', color: 'text-green-600' },
}

const priorityDot: Record<string, string> = {
  urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-blue-400', low: 'bg-gray-300',
}

export default async function DashboardPage() {
  const orgId = await getCurrentOrgId()
  if (!orgId) {
    return <div className="text-center py-20 text-gray-500">No se encontró una organización asociada.</div>
  }

  const { stats, recentInspections, expiringMeds, pendingTasks } = await getDashboardData(orgId)

  const margin = stats.totalRevenue - stats.totalExpenses
  const cards = [
    { label: 'Apiarios',         value: stats.apiaries,          icon: '📍', href: '/dashboard/apiaries',    bg: 'bg-blue-50',   border: 'border-blue-100' },
    { label: 'Colmenas activas', value: stats.activeHives,       icon: '🏡', href: '/dashboard/hives',       bg: 'bg-amber-50',  border: 'border-amber-100' },
    { label: 'Inspecciones',     value: stats.totalInspections,  icon: '📋', href: '/dashboard/inspections', bg: 'bg-green-50',  border: 'border-green-100' },
    { label: 'kg cosechados',    value: `${stats.totalHarvestKg.toFixed(1)} kg`, icon: '🍯', href: '/dashboard/harvests', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { label: 'Tareas activas',   value: stats.pendingTasks,      icon: '✅', href: '/dashboard/tasks',       bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Ingresos este año', value: `$${stats.totalRevenue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, icon: '💰', href: '/dashboard/finances', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Margen neto',      value: `${margin >= 0 ? '+' : ''}$${Math.abs(margin).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, icon: margin >= 0 ? '📈' : '📉', href: '/dashboard/reports', bg: margin >= 0 ? 'bg-teal-50' : 'bg-orange-50', border: margin >= 0 ? 'border-teal-100' : 'border-orange-100' },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de control</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen de tu actividad apícola</p>
      </div>

      {/* Alertas */}
      {expiringMeds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="font-semibold text-orange-800 text-sm mb-2">
            ⚠️ Medicamentos próximos a vencer
          </p>
          <div className="flex flex-wrap gap-2">
            {expiringMeds.map((m) => {
              const days = Math.ceil((new Date(m.expiry_date!).getTime() - Date.now()) / 86400000)
              return (
                <Link key={m.id} href="/dashboard/treatments"
                  className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium hover:bg-orange-200 transition-colors">
                  {m.product_name} ({days < 0 ? 'vencido' : `${days}d`})
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}
            className={`${card.bg} ${card.border} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
            <div className="flex flex-col gap-1">
              <span className="text-2xl">{card.icon}</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className="text-xs text-gray-600 font-medium">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas inspecciones */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Últimas inspecciones</h2>
            <Link href="/dashboard/inspections" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Ver todas →
            </Link>
          </div>
          {recentInspections.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-sm">Aún no hay inspecciones.</p>
              <Link href="/dashboard/inspections/new" className="mt-3 inline-block text-sm text-amber-600 hover:underline">
                Registrar primera inspección
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentInspections.map((insp) => {
                const health = insp.overall_health ? healthLabels[insp.overall_health] : null
                const date = new Date(insp.inspected_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                return (
                  <li key={insp.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{insp.hives?.name ?? '—'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{date}</p>
                      </div>
                      {health && <span className={`text-xs font-semibold ${health.color}`}>{health.label}</span>}
                    </div>
                    {insp.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{insp.notes}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Tareas pendientes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tareas pendientes</h2>
            <Link href="/dashboard/tasks" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Ver todas →
            </Link>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <span className="text-4xl block mb-2">✅</span>
              <p className="text-sm">No hay tareas pendientes.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {pendingTasks.map((task) => {
                const dueDate = task.due_date
                  ? new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                  : null
                const isOverdue = task.due_date && new Date(task.due_date) < new Date()
                return (
                  <li key={task.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority] ?? 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">{task.title}</p>
                        {dueDate && (
                          <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                            {isOverdue ? '⚠️ ' : ''}{dueDate}
                          </p>
                        )}
                      </div>
                      <Link href={`/dashboard/tasks/${task.id}`}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium shrink-0">
                        Ver →
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
