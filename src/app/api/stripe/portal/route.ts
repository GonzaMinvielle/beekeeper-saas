import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient> & { from(table: string): any }

export async function POST() {
  const supabase = createClient() as AnyClient
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const memberRes = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  const member = memberRes.data as { organization_id: string } | null
  if (!member) {
    return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 })
  }

  const subRes = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', member.organization_id)
    .single()
  const sub = subRes.data as { stripe_customer_id: string | null } | null

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl}/dashboard/billing`,
  })

  return NextResponse.json({ url: session.url })
}
