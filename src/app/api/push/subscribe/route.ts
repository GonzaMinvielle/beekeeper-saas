import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Guarda la suscripción push del usuario en la tabla notifications como metadata
// En una implementación completa usarías una tabla push_subscriptions dedicada.
// Aquí almacenamos el endpoint en user_metadata para simplificar.
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const subscription = await req.json()

  // Guardar como metadato en auth.users
  await supabase.auth.updateUser({
    data: { push_subscription: JSON.stringify(subscription) },
  })

  return NextResponse.json({ ok: true })
}
