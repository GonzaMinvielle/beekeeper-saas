import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import webpush from 'web-push'

export const dynamic = 'force-dynamic'

// ── Tipos ────────────────────────────────────────────────────────────────────

type Apiary = {
  id: string
  name: string
  latitude: number
  longitude: number
  organization_id: string
}

type ApiaryMember = {
  user_id: string
  organization_id: string
}

type OpenMeteoResponse = {
  hourly: {
    time: string[]
    precipitation_probability: number[]
    weathercode: number[]
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // VAPID setup — only if keys are configured (skip push if not)
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const pushEnabled = !!(vapidPublic && vapidPrivate)
  if (pushEnabled) {
    webpush.setVapidDetails('mailto:admin@appicultor.pro', vapidPublic!, vapidPrivate!)
  }
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const now = new Date()
    const alerts: string[] = []

    // Obtener todos los apiarios con coordenadas
    const { data: apiaries, error: apiariesError } = await supabase
      .from('apiaries')
      .select('id, name, latitude, longitude, organization_id')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (apiariesError) throw apiariesError
    if (!apiaries || apiaries.length === 0) {
      return NextResponse.json({ ok: true, checked: 0 })
    }

    for (const apiary of apiaries as Apiary[]) {
      // Verificar si ya se alertó en las últimas 3 horas
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
      const { data: recentAlert } = await supabase
        .from('rain_alerts')
        .select('id')
        .eq('apiary_id', apiary.id)
        .gte('alerted_at', threeHoursAgo)
        .limit(1)
        .single()

      if (recentAlert) continue // Ya alertado, skip

      // Consultar Open-Meteo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${apiary.latitude}&longitude=${apiary.longitude}&hourly=precipitation_probability,weathercode&forecast_days=1&timezone=auto`

      let forecast: OpenMeteoResponse
      try {
        const res = await fetch(url, { next: { revalidate: 0 } })
        if (!res.ok) continue
        forecast = await res.json()
      } catch {
        continue
      }

      // Verificar las próximas 2 horas
      const currentHour = now.toISOString().slice(0, 13) // "2024-01-15T14"
      const times = forecast.hourly.time
      const probs = forecast.hourly.precipitation_probability
      const codes = forecast.hourly.weathercode

      let rainExpected = false
      let forecastTime: string | null = null

      for (let i = 0; i < times.length; i++) {
        const t = times[i]
        if (t < currentHour) continue
        if (t > new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 13)) break

        if (probs[i] >= 70 || codes[i] >= 61) {
          rainExpected = true
          forecastTime = t
          break
        }
      }

      if (!rainExpected || !forecastTime) continue

      // Registrar alerta para evitar spam
      await supabase.from('rain_alerts').insert({
        apiary_id: apiary.id,
        alerted_at: now.toISOString(),
        forecast_time: new Date(forecastTime).toISOString(),
      })

      alerts.push(apiary.name)

      // Notificar a todos los miembros de la organización
      const { data: members } = await supabase
        .from('org_members')
        .select('user_id, organization_id')
        .eq('organization_id', apiary.organization_id)

      if (!members) continue

      const message = `Se esperan lluvias en ${apiary.name} en las próximas 2 horas`

      for (const member of members as ApiaryMember[]) {
        // Guardar notificación en BD
        await supabase.from('notifications').insert({
          organization_id: apiary.organization_id,
          user_id: member.user_id,
          type: 'rain_alert',
          message,
          read: false,
        })

        // Enviar Web Push si el usuario tiene suscripción y VAPID está configurado
        if (pushEnabled) {
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(member.user_id)
            const sub = authUser?.user?.user_metadata?.push_subscription
            if (sub) {
              await webpush.sendNotification(
                JSON.parse(sub),
                JSON.stringify({
                  title: '🌧️ Alerta de lluvia',
                  body: message,
                  icon: '/icons/icon-192x192.png',
                })
              )
            }
          } catch {
            // Push falla si suscripción expiró — ignorar
          }
        }
      }
    }

    return NextResponse.json({ ok: true, checked: (apiaries as Apiary[]).length, alerted: alerts })
  } catch (err) {
    console.error('[weather-check]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
