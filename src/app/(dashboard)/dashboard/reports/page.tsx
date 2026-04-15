import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductionBarChart, FinanceBarChart } from '@/components/charts/ProductionChart'
import type { MonthlyData } from '@/components/charts/ProductionChart'
import PrintButton from './PrintButton'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

async function getData(orgId: string) {
  const supabase = createClient()
  const year = new Date().getFullYear()
  const from = `${year}-01-01`
  const to   = `${year}-12-31`

  const [harvestsRes, salesRes, expensesRes] = await Promise.all([
    supabase
      .from('harvests')
      .select('harvested_at, weight_kg, hive_id, hives(name)')
      .eq('organization_id', orgId)
      .gte('harvested_at', from)
      .lte('harvested_at', to),
    supabase
      .from('sales')
      .select('sale_date, total, quantity_kg')
      .eq('organization_id', orgId)
      .gte('sale_date', from)
      .lte('sale_date', to),
    supabase
      .from('expenses')
      .select('expense_date, amount')
      .eq('organization_id', orgId)
      .gte('expense_date', from)
      .lte('expense_date', to),
  ])

  // Construir datos mensuales
  const monthly: MonthlyData[] = MONTHS.map((month, i) => {
    const m = i + 1
    const kg = (harvestsRes.data ?? [])
      .filter((h: { harvested_at: string }) => new Date(h.harvested_at).getMonth() + 1 === m)
      .reduce((s: number, h: { weight_kg: number }) => s + h.weight_kg, 0)
    const revenue = (salesRes.data ?? [])
      .filter((s: { sale_date: string }) => new Date(s.sale_date).getMonth() + 1 === m)
      .reduce((s: number, v: { total: number }) => s + v.total, 0)
    const expenses = (expensesRes.data ?? [])
      .filter((e: { expense_date: string }) => new Date(e.expense_date).getMonth() + 1 === m)
      .reduce((s: number, e: { amount: number }) => s + e.amount, 0)
    return { month, kg: Math.round(kg * 10) / 10, revenue: Math.round(revenue), expenses: Math.round(expenses) }
  })

  // Producción por colmena
  type HarvestRow = { hive_id: string; weight_kg: number; hives: { name: string } | null }
  const hiveMap = new Map<string, { name: string; kg: number }>()
  for (const h of (harvestsRes.data as HarvestRow[]) ?? []) {
    const name = (h.hives as { name: string } | null)?.name ?? h.hive_id
    const prev = hiveMap.get(h.hive_id) ?? { name, kg: 0 }
    hiveMap.set(h.hive_id, { name: prev.name, kg: prev.kg + h.weight_kg })
  }
  const hiveProduction = Array.from(hiveMap.values())
    .sort((a, b) => b.kg - a.kg)
    .slice(0, 10)

  const totalKg       = monthly.reduce((s, m) => s + m.kg, 0)
  const totalRevenue  = monthly.reduce((s, m) => s + m.revenue, 0)
  const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0)

  return { monthly, hiveProduction, totalKg, totalRevenue, totalExpenses, year }
}

export default async function ReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const { monthly, hiveProduction, totalKg, totalRevenue, totalExpenses, year } =
    await getData(member.organization_id)

  const margin = totalRevenue - totalExpenses

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Informes {year}</h1>
          <p className="text-gray-500 text-sm mt-1">Producción y finanzas del año en curso</p>
        </div>
        <PrintButton />
      </div>

      {/* KPIs anuales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
        {[
          { label: 'kg cosechados',  value: `${totalKg.toFixed(1)} kg`,  color: 'text-amber-600' },
          { label: 'Ingresos',       value: `$${totalRevenue.toLocaleString('es-AR')}`, color: 'text-green-600' },
          { label: 'Gastos',         value: `$${totalExpenses.toLocaleString('es-AR')}`, color: 'text-red-600' },
          { label: 'Margen neto',    value: `${margin >= 0 ? '+' : ''}$${margin.toLocaleString('es-AR')}`, color: margin >= 0 ? 'text-emerald-600' : 'text-orange-600' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfica producción mensual */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Producción mensual (kg)</h2>
        <ProductionBarChart data={monthly} />
      </div>

      {/* Gráfica ingresos vs gastos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Ingresos vs Gastos por mes</h2>
        <FinanceBarChart data={monthly} />
      </div>

      {/* Top colmenas */}
      {hiveProduction.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Ranking de colmenas por producción</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {hiveProduction.map((h, i) => {
              const pct = totalKg > 0 ? (h.kg / totalKg) * 100 : 0
              return (
                <div key={h.name} className="px-5 py-3 flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-400 w-6 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{h.name}</p>
                      <p className="text-sm font-semibold text-amber-600 ml-2 shrink-0">{h.kg.toFixed(1)} kg</p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabla mensual detallada */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Resumen mensual detallado</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Mes</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Cosecha (kg)</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Ingresos</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Gastos</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthly.map((m) => {
                const m_margin = m.revenue - m.expenses
                return (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{m.month}</td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">
                      {m.kg > 0 ? `${m.kg} kg` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {m.revenue > 0 ? `$${m.revenue.toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {m.expenses > 0 ? `$${m.expenses.toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold ${m_margin > 0 ? 'text-emerald-600' : m_margin < 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {m.revenue > 0 || m.expenses > 0
                        ? `${m_margin >= 0 ? '+' : ''}$${m_margin.toLocaleString('es-AR')}`
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                <td className="px-5 py-3 text-gray-900">Total</td>
                <td className="px-4 py-3 text-right text-amber-600">{totalKg.toFixed(1)} kg</td>
                <td className="px-4 py-3 text-right text-green-600">${totalRevenue.toLocaleString('es-AR')}</td>
                <td className="px-4 py-3 text-right text-red-600">${totalExpenses.toLocaleString('es-AR')}</td>
                <td className={`px-5 py-3 text-right ${margin >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {margin >= 0 ? '+' : ''}${margin.toLocaleString('es-AR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
