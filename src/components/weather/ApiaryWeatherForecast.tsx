'use client'

import { useEffect, useState } from 'react'

type HourForecast = {
  time: string
  hour: string
  prob: number
  code: number
  label: string
  icon: string
  rain: boolean
}

function getWeatherIcon(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: '☀️', label: 'Despejado' }
  if (code <= 2)  return { icon: '⛅', label: 'Parcialmente nublado' }
  if (code <= 3)  return { icon: '☁️', label: 'Nublado' }
  if (code <= 48) return { icon: '🌫️', label: 'Neblina' }
  if (code <= 55) return { icon: '🌦️', label: 'Llovizna' }
  if (code <= 65) return { icon: '🌧️', label: 'Lluvia' }
  if (code <= 75) return { icon: '🌨️', label: 'Nieve' }
  if (code <= 82) return { icon: '🌧️', label: 'Lluvia intensa' }
  if (code <= 99) return { icon: '⛈️', label: 'Tormenta' }
  return { icon: '🌡️', label: 'Desconocido' }
}

export default function ApiaryWeatherForecast({
  latitude,
  longitude,
  apiaryName,
}: {
  latitude: number
  longitude: number
  apiaryName: string
}) {
  const [forecast, setForecast] = useState<HourForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation_probability,weathercode&forecast_days=1&timezone=auto`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const now = new Date()
        const currentHour = now.getHours()

        const hours: HourForecast[] = []
        const times: string[] = data.hourly?.time ?? []
        const probs: number[] = data.hourly?.precipitation_probability ?? []
        const codes: number[] = data.hourly?.weathercode ?? []

        for (let i = 0; i < times.length && hours.length < 6; i++) {
          const t = new Date(times[i])
          if (t.getHours() < currentHour && t.getDate() <= now.getDate()) continue

          const { icon, label } = getWeatherIcon(codes[i])
          hours.push({
            time: times[i],
            hour: t.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            prob: probs[i] ?? 0,
            code: codes[i] ?? 0,
            label,
            icon,
            rain: probs[i] >= 70 || codes[i] >= 61,
          })
        }

        setForecast(hours)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [latitude, longitude])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">🌤️ Pronóstico próximas 6 horas</h3>
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || forecast.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">🌤️ Pronóstico</h3>
        <p className="text-xs text-gray-400">No se pudo cargar el pronóstico para {apiaryName}.</p>
      </div>
    )
  }

  const hasRainSoon = forecast.slice(0, 2).some((h) => h.rain)

  return (
    <div className={`rounded-2xl border shadow-sm p-5
      ${hasRainSoon ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">🌤️ Pronóstico próximas 6 horas</h3>
        {hasRainSoon && (
          <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
            🌧️ Lluvia próxima
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {forecast.map((h) => (
          <div
            key={h.time}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-center
              ${h.rain
                ? 'bg-blue-100 border border-blue-200'
                : 'bg-gray-50 border border-gray-100'
              }`}
          >
            <span className="text-xs font-semibold text-gray-500">{h.hour}</span>
            <span className="text-2xl">{h.icon}</span>
            <span className={`text-xs font-bold ${h.prob >= 70 ? 'text-blue-700' : 'text-gray-500'}`}>
              {h.prob}%
            </span>
            <span className="text-xs text-gray-400 line-clamp-1">{h.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Fuente: Open-Meteo · {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </p>
    </div>
  )
}
