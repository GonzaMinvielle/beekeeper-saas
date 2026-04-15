import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Expense, Sale } from '@/lib/types/database.types'
import { honeyTypes } from '@/lib/types/database.types'
import ConfirmDeleteButton from '@/components/ui/ConfirmDeleteButton'
import { deleteExpense, deleteSale } from '@/lib/actions/finances'

const categoryLabel: Record<string, string> = {
  equipment:  'Equipamiento',
  medication: 'Medicamentos',
  feeding:    'Alimentación',
  transport:  'Transporte',
  other:      'Otros',
}

const categoryColor: Record<string, string> = {
  equipment:  'bg-blue-100 text-blue-700',
  medication: 'bg-red-100 text-red-700',
  feeding:    'bg-green-100 text-green-700',
  transport:  'bg-purple-100 text-purple-700',
  other:      'bg-gray-100 text-gray-600',
}

const honeyLabel: Record<string, string> = Object.fromEntries(
  honeyTypes.map((t) => [t.value, t.label])
)

type ExpenseWithHive = Expense & { hives: { name: string } | null }

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

  const [expensesRes, salesRes] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, hives(name)')
      .eq('organization_id', member.organization_id)
      .order('expense_date', { ascending: false }),
    supabase
      .from('sales')
      .select('*')
      .eq('organization_id', member.organization_id)
      .order('sale_date', { ascending: false }),
  ])

  return {
    expenses: (expensesRes.data as ExpenseWithHive[]) ?? [],
    sales:    (salesRes.data as Sale[]) ?? [],
  }
}

export default async function FinancesPage() {
  const { expenses, sales } = await getData()

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenue  = sales.reduce((s, v) => s + v.total, 0)
  const margin        = totalRevenue - totalExpenses

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresos, gastos y rentabilidad</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/finances/expense/new"
            className="flex-1 sm:flex-none text-center px-4 py-2 border border-amber-400 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors"
          >
            + Gasto
          </Link>
          <Link
            href="/dashboard/finances/sale/new"
            className="flex-1 sm:flex-none text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Venta
          </Link>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Ingresos totales</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            ${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-green-500 mt-0.5">{sales.length} venta{sales.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Gastos totales</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            ${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-red-500 mt-0.5">{expenses.length} gasto{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={`${margin >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'} border rounded-xl p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${margin >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
            Margen neto
          </p>
          <p className={`text-2xl font-bold mt-1 ${margin >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
            {margin >= 0 ? '+' : ''}${margin.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-0.5 ${margin >= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
            {totalRevenue > 0 ? `${((margin / totalRevenue) * 100).toFixed(1)}% del ingreso` : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Ventas</h2>
            <Link href="/dashboard/finances/sale/new"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Nueva
            </Link>
          </div>
          {sales.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay ventas registradas.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {sales.map((s) => {
                const date = new Date(s.sale_date + 'T12:00:00').toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                return (
                  <li key={s.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-sm">
                            ${s.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {honeyLabel[s.honey_type] ?? s.honey_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.quantity_kg} kg · ${s.price_per_kg}/kg · {date}
                        </p>
                        {s.buyer_name && (
                          <p className="text-xs text-gray-400 mt-0.5">Comprador: {s.buyer_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link href={`/dashboard/finances/sale/${s.id}`}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                          Editar
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteSale.bind(null, s.id)}
                          message="¿Eliminar esta venta?"
                          className="text-xs text-red-400 hover:text-red-600 px-1"
                        >
                          ×
                        </ConfirmDeleteButton>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Gastos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Gastos</h2>
            <Link href="/dashboard/finances/expense/new"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Nuevo
            </Link>
          </div>
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay gastos registrados.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {expenses.map((e) => {
                const date = new Date(e.expense_date + 'T12:00:00').toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                return (
                  <li key={e.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-sm">
                            ${e.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[e.category]}`}>
                            {categoryLabel[e.category] ?? e.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {date}{e.hives ? ` · ${e.hives.name}` : ''}
                        </p>
                        {e.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{e.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link href={`/dashboard/finances/expense/${e.id}`}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                          Editar
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteExpense.bind(null, e.id)}
                          message="¿Eliminar este gasto?"
                          className="text-xs text-red-400 hover:text-red-600 px-1"
                        >
                          ×
                        </ConfirmDeleteButton>
                      </div>
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
