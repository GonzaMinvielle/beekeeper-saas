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
  ComposedChart,
  Line,
} from 'recharts'

export type RainfallMonthlyData = {
  month: string
  mm: number
  records: number
  kg: number
}

export function RainfallBarChart({ data }: { data: RainfallMonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit=" mm" />
        <Tooltip
          formatter={(value: unknown) => [`${Number(value ?? 0).toFixed(1)} mm`, 'Lluvia']}
        />
        <Bar dataKey="mm" fill="#3b82f6" name="mm" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RainfallCorrelationChart({ data }: { data: RainfallMonthlyData[] }) {
  const hasKg = data.some((d) => d.kg > 0)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis
          yAxisId="mm"
          orientation="left"
          tick={{ fontSize: 12 }}
          unit=" mm"
          width={55}
        />
        {hasKg && (
          <YAxis
            yAxisId="kg"
            orientation="right"
            tick={{ fontSize: 12 }}
            unit=" kg"
            width={50}
          />
        )}
        <Tooltip
          formatter={(value: unknown, name: unknown) => {
            const n = String(name)
            if (n === 'mm') return [`${Number(value ?? 0).toFixed(1)} mm`, 'Lluvia']
            return [`${Number(value ?? 0).toFixed(1)} kg`, 'Cosecha']
          }}
        />
        <Legend
          formatter={(v) => (v === 'mm' ? 'Lluvia (mm)' : 'Cosecha (kg)')}
        />
        <Bar yAxisId="mm" dataKey="mm" fill="#3b82f6" name="mm" radius={[3, 3, 0, 0]} />
        {hasKg && (
          <Line
            yAxisId="kg"
            type="monotone"
            dataKey="kg"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
            name="kg"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
