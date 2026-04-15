'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

export type MonthlyData = {
  month: string
  kg: number
  revenue: number
  expenses: number
}

export function ProductionBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: unknown, name: unknown) => {
            const v = Number(value ?? 0)
            const n = String(name)
            if (n === 'kg') return [`${v} kg`, 'Cosecha']
            return [`$${v.toLocaleString('es-AR')}`, n === 'revenue' ? 'Ingresos' : 'Gastos']
          }}
        />
        <Bar dataKey="kg" fill="#f59e0b" name="Cosecha" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FinanceBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: unknown, name: unknown) => [
            `$${Number(value ?? 0).toLocaleString('es-AR')}`,
            String(name) === 'revenue' ? 'Ingresos' : 'Gastos',
          ]}
        />
        <Legend formatter={(v) => (v === 'revenue' ? 'Ingresos' : 'Gastos')} />
        <Bar dataKey="revenue"  fill="#10b981" name="revenue"  radius={[3, 3, 0, 0]} />
        <Bar dataKey="expenses" fill="#ef4444" name="expenses" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
