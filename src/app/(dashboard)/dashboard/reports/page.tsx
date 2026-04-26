import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProductionBarChart, FinanceBarChart } from '@/components/charts/ProductionChart'
import type { MonthlyData } from '@/components/charts/ProductionChart'
import { RainfallBarChart, RainfallCorrelationChart } from '@/components/charts/RainfallChart'
import type { RainfallMonthlyData } from '@/components/charts/RainfallChart'
import PrintButton from './PrintButton'
import RainfallFilters from './RainfallFilters'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

// ── Production data ────────────────────────────────────────────────────────

async function getProductionData(orgId: string) {
  const supabase = createClient()
  const year = new Date().getFullYear()
  const from = `${year}-01-01`
  const to   = `${year}-12-31`

  const [harvestsRes, salesRes, expensesRes] = await Promise.all([
    supabase.from('harvests').select('harvested_at, weight_kg, hive_id, hives(name)').eq('organization_id', orgId).gte('harvested_at', from).lte('harvested_at', to),
    supabase.from('sales').select('sale_date, total, quantity_kg').eq('organization_id', orgId).gte('sale_date', from).lte('sale_date', to),
    supabase.from('expenses').select('expense_date, amount').eq('organization_id', orgId).gte('expense_date', from).lte('expense_date', to),
  ])

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

  type HarvestRow = { hive_id: string; weight_kg: number; hives: { name: string } | null }
  const hiveMap = new Map<string, { name: string; kg: number }>()
  for (const h of (harvestsRes.data as HarvestRow[]) ?? []) {
    const name = (h.hives as { name: string } | null)?.name ?? h.hive_id
    const prev = hiveMap.get(h.hive_id) ?? { name, kg: 0 }
    hiveMap.set(h.hive_id, { name: prev.name, kg: prev.kg + h.weight_kg })
  }
  const hiveProduction = Array.from(hiveMap.values()).sort((a, b) => b.kg - a.kg).slice(0, 10)

  const totalKg       = monthly.reduce((s, m) => s + m.kg, 0)
  const totalRevenue  = monthly.reduce((s, m) => s + m.revenue, 0)
  const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0)

  return { monthly, hiveProduction, totalKg, totalRevenue, totalExpenses, year }
}

// ── Rainfall data ──────────────────────────────────────────────────────────

async function getRainfallData(orgId: string, apiaryId: string | null, year: number) {
  const supabase = createClient()
  const from = `${year}-01-01`
  const to   = `${year}-12-31`

  // Apiaries for selector
  const { data: apiaries } = await supabase
    .from('apiaries')
    .select('id, name')
    .eq('organization_id', orgId)
    .order('name') as { data: { id: string; name: string }[] | null }

  // Rainfall records
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rainfallQuery = (supabase.from('rainfall_records') as any)
    .select('date, mm_recorded, apiary_id')
    .eq('org_id', orgId)
    .gte('date', from)
    .lte('date', to)

  if (apiaryId) {
    rainfallQuery = rainfallQuery.eq('apiary_id', apiaryId)
  }
  const { data: rainfallRows } = await rainfallQuery

  // Harvests for correlation
  let harvestQuery = supabase
    .from('harvests')
    .select('harvested_at, weight_kg')
    .eq('organization_id', orgId)
    .gte('harvested_at', from)
    .lte('harvested_at', to)

  if (apiaryId) {
    // Filter harvests by hives in that apiary
    const { data: hivesInApiary } = await supabase
      .from('hives')
      .select('id')
      .eq('apiary_id', apiaryId) as { data: { id: string }[] | null }
    const hiveIds = (hivesInApiary ?? []).map((h) => h.id)
    if (hiveIds.length > 0) {
      harvestQuery = harvestQuery.in('hive_id', hiveIds) as typeof harvestQuery
    }
  }
  const { data: harvestRows } = await harvestQuery

  // Build monthly aggregates
  type RainfallRow = { date: string; mm_recorded: number }
  type HarvestRow = { harvested_at: string; weight_kg: number }

  const monthly: RainfallMonthlyData[] = MONTHS.map((month, i) => {
    const m = i + 1
    const monthRows = ((rainfallRows ?? []) as RainfallRow[]).filter(
      (r) => new Date(r.date).getMonth() + 1 === m
    )
    const mm = monthRows.reduce((s, r) => s + Number(r.mm_recorded), 0)
    const recordCount = monthRows.length
    const kg = ((harvestRows ?? []) as HarvestRow[])
      .filter((h) => new Date(h.harvested_at).getMonth() + 1 === m)
      .reduce((s, h) => s + h.weight_kg, 0)
    return { month, mm: Math.round(mm * 10) / 10, records: recordCount, kg: Math.round(kg * 10) / 10 }
  })

  // Summary stats
  const monthsWithData = monthly.filter((m) => m.mm > 0)
  const totalMm = monthly.reduce((s, m) => s + m.mm, 0)
  const avgMm = monthsWithData.length > 0 ? totalMm / monthsWithData.length : 0
  const maxMonth = monthsWithData.reduce((best, m) => m.mm > best.mm ? m : best, { month: '—', mm: 0, records: 0, kg: 0 })
  const minMonth = monthsWithData.reduce((least, m) => m.mm < least.mm ? m : least, monthsWithData[0] ?? { month: '—', mm: 0, records: 0, kg: 0 })

  return {
    apiaries: apiaries ?? [],
    monthly,
    totalMm,
    avgMm,
    maxMonth,
    minMonth,
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { tab?: string; apiary_id?: string; year?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const activeTab = searchParams.tab === 'lluvia' ? 'lluvia' : 'produccion'
  const selectedApiaryId = searchParams.apiary_id ?? null
  const selectedYear = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear()

  // Fetch data for active tab
  const prodData = activeTab === 'produccion'
    ? await getProductionData(member.organization_id)
    : null
  const rainData = activeTab === 'lluvia'
    ? await getRainfallData(member.organization_id, selectedApiaryId, selectedYear)
    : null

  const year = prodData?.year ?? selectedYear
  const margin = prodData ? prodData.totalRevenue - prodData.totalExpenses : 0

  // Year options for rainfall tab (current year - 4 → current year)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Informes {year}</h1>
          <p className="text-gray-500 text-sm mt-1">Producción, finanzas y pluviometría</p>
        </div>
        <PrintButton />
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-gray-200">
        <Link
          href="/dashboard/reports?tab=produccion"
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
            ${activeTab === 'produccion'
              ? 'bg-white border border-b-white border-gray-200 text-gray-900 -mb-px'
              : 'text-gray-500 hover:text-gray-700'}`}
        >
          Producción y finanzas
        </Link>
        <Link
          href="/dashboard/reports?tab=lluvia"
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
            ${activeTab === 'lluvia'
              ? 'bg-white border border-b-white border-gray-200 text-gray-900 -mb-px'
              : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pluviometría
        </Link>
      </div>

      {/* ── PRODUCCIÓN TAB ── */}
      {activeTab === 'produccion' && prodData && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
            {[
              { label: 'kg cosechados',  value: `${prodData.totalKg.toFixed(1)} kg`,  color: 'text-amber-600' },
              { label: 'Ingresos',       value: `$${prodData.totalRevenue.toLocaleString('es-AR')}`, color: 'text-green-600' },
              { label: 'Gastos',         value: `$${prodData.totalExpenses.toLocaleString('es-AR')}`, color: 'text-red-600' },
              { label: 'Margen neto',    value: `${margin >= 0 ? '+' : ''}$${margin.toLocaleString('es-AR')}`, color: margin >= 0 ? 'text-emerald-600' : 'text-orange-600' },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Producción mensual (kg)</h2>
            <ProductionBarChart data={prodData.monthly} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Ingresos vs Gastos por mes</h2>
            <FinanceBarChart data={prodData.monthly} />
          </div>

          {prodData.hiveProduction.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Ranking de colmenas por producción</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {prodData.hiveProduction.map((h, i) => {
                  const pct = prodData.totalKg > 0 ? (h.kg / prodData.totalKg) * 100 : 0
                  return (
                    <div key={h.name} className="px-5 py-3 flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-400 w-6 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{h.name}</p>
                          <p className="text-sm font-semibold text-amber-600 ml-2 shrink-0">{h.kg.toFixed(1)} kg</p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
                  {prodData.monthly.map((m) => {
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
                    <td className="px-4 py-3 text-right text-amber-600">{prodData.totalKg.toFixed(1)} kg</td>
                    <td className="px-4 py-3 text-right text-green-600">${prodData.totalRevenue.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-right text-red-600">${prodData.totalExpenses.toLocaleString('es-AR')}</td>
                    <td className={`px-5 py-3 text-right ${margin >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {margin >= 0 ? '+' : ''}${margin.toLocaleString('es-AR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── PLUVIOMETRÍA TAB ── */}
      {activeTab === 'lluvia' && rainData && (
        <>
          {/* Selectors */}
          <RainfallFilters
            apiaries={rainData.apiaries}
            selectedApiaryId={selectedApiaryId}
            selectedYear={selectedYear}
            yearOptions={yearOptions}
          />

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: `Total ${selectedYear}`,   value: `${rainData.totalMm.toFixed(1)} mm`,  color: 'text-blue-600' },
              { label: 'Promedio mensual',         value: `${rainData.avgMm.toFixed(1)} mm`,     color: 'text-blue-500' },
              { label: 'Mes con más lluvia',       value: rainData.maxMonth?.mm > 0 ? `${rainData.maxMonth.month} (${rainData.maxMonth.mm} mm)` : '—', color: 'text-indigo-600' },
              { label: 'Mes con menos lluvia',     value: rainData.minMonth?.mm > 0 ? `${rainData.minMonth.month} (${rainData.minMonth.mm} mm)` : '—', color: 'text-sky-600' },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                <p className={`text-lg font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Lluvia mensual (mm)</h2>
            <RainfallBarChart data={rainData.monthly} />
          </div>

          {/* Correlation chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Correlación lluvia / cosecha</h2>
            <p className="text-xs text-gray-400 mb-4">Barras: lluvia en mm · Línea: kg cosechados</p>
            <RainfallCorrelationChart data={rainData.monthly} />
          </div>

          {/* Monthly table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Detalle mensual</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Mes</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Total (mm)</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Registros cargados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rainData.monthly.map((m) => (
                    <tr key={m.month} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{m.month}</td>
                      <td className="px-4 py-3 text-right text-blue-600 font-medium">
                        {m.mm > 0 ? `${m.mm} mm` : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">
                        {m.records > 0 ? m.records : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                    <td className="px-5 py-3 text-gray-900">Total</td>
                    <td className="px-4 py-3 text-right text-blue-600">{rainData.totalMm.toFixed(1)} mm</td>
                    <td className="px-5 py-3 text-right text-gray-500">
                      {rainData.monthly.reduce((s, m) => s + m.records, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
