import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'
import type { PlanId } from '@/lib/stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient> & { from(table: string): any }

export async function POST(req: NextRequest) {
  const supabase = createClient() as AnyClient
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { planId } = await req.json() as { planId: PlanId }
  const plan = PLANS[planId]
  if (!plan || !plan.priceId) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  // Obtener org del usuario
  const memberRes = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  const member = memberRes.data as { organization_id: string } | null
  if (!member) {
    return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 })
  }

  // Obtener o crear stripe_customer_id
  const subRes = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', member.organization_id)
    .single()
  const sub = subRes.data as { stripe_customer_id: string | null } | null

  let customerId = sub?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { organization_id: member.organization_id },
    })
    customerId = customer.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('organization_id', member.organization_id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { organization_id: member.organization_id, plan: planId },
  })

  return NextResponse.json({ url: session.url })
}
