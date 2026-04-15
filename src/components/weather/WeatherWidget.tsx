'use client'

import { useEffect, useState } from 'react'

type WeatherData = {
  temperature: number
  windspeed: number
  weathercode: number
  maxTemp: number
  minTemp: number
  precipitation: number
}

function weatherIcon(code: number): string {
  if (code === 0)              return '☀️'
  if (code <= 3)               return '⛅'
  if (code <= 48)              return '🌫️'
  if (code <= 55)              return '🌦️'
  if (code <= 65)              return '🌧️'
  if (code <= 77)              return '❄️'
  if (code <= 82)              return '🌦️'
  if (code >= 95)              return '⛈️'
  return '🌡️'
}

function weatherDesc(code: number): string {
  if (code === 0)              return 'Cielo despejado'
  if (code <= 2)               return 'Parcialmente nublado'
  if (code === 3)              return 'Nublado'
  if (code <= 48)              return 'Niebla'
  if (code <= 55)              return 'Llovizna'
  if (code <= 65)              return 'Lluvia'
  if (code <= 77)              return 'Nieve'
  if (code <= 82)              return 'Chubascos'
  if (code >= 95)              return 'Tormenta'
  return 'Variable'
}

export default function WeatherWidget({
  lat,
  lng,
  apiaryName,
}: {
  lat: number
  lng: number
  apiaryName: string
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=auto&forecast_days=1`
    )
      .then((r) => r.json())
      .then((data) => {
        setWeather({
          temperature:  data.current_weather.temperature,
          windspeed:    data.current_weather.windspeed,
          weathercode:  data.current_weather.weathercode,
          maxTemp:      data.daily.temperature_2m_max[0],
          minTemp:      data.daily.temperature_2m_min[0],
          precipitation: data.daily.precipitation_sum[0],
        })
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo obtener el clima.')
        setLoading(false)
      })
  }, [lat, lng])

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 animate-pulse">
        <div className="h-4 bg-blue-100 rounded w-1/2 mb-3" />
        <div className="h-8 bg-blue-100 rounded w-1/3" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
        {error ?? 'Sin datos de clima.'}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-100 p-5">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
        {apiaryName}
      </p>
      <div className="flex items-center gap-4">
        <span className="text-5xl">{weatherIcon(weather.weathercode)}</span>
        <div>
          <p className="text-3xl font-bold text-gray-900">{weather.temperature}°C</p>
          <p className="text-sm text-gray-600">{weatherDesc(weather.weathercode)}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-gray-500">Máx / Mín</p>
          <p className="text-sm font-semibold text-gray-800">
            {weather.maxTemp}° / {weather.minTemp}°
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Viento</p>
          <p className="text-sm font-semibold text-gray-800">{weather.windspeed} km/h</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Precip.</p>
          <p className="text-sm font-semibold text-gray-800">{weather.precipitation} mm</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">Fuente: Open-Meteo</p>
    </div>
  )
}
