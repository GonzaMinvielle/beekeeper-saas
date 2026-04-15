/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Supabase service-role client (sin RLS) para el webhook
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = adminClient()

  // Usamos `as any` para compatibilidad con Stripe API 2025-03-31.basil
  // donde algunos campos de Subscription fueron reestructurados
  if (event.type === 'checkout.session.completed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any
    const orgId  = session.metadata?.organization_id as string | undefined
    const planId = session.metadata?.plan as 'basic' | 'pro' | undefined

    if (orgId && planId && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any
      await supabase
        .from('subscriptions' as any)
        .update({
          stripe_subscription_id: subscription.id,
          plan: planId,
          status: subscription.status,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', orgId)
    }
  }

  if (event.type === 'customer.subscription.updated') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    const { data: sub } = await supabase
      .from('subscriptions' as any)
      .select('organization_id')
      .eq('stripe_customer_id', customerId)
      .single() as { data: { organization_id: string } | null }

    if (sub) {
      const priceId = subscription.items?.data?.[0]?.price?.id as string | undefined
      let plan: 'basic' | 'pro' | 'free' = 'free'
      if (priceId === process.env.STRIPE_PRICE_BASIC)  plan = 'basic'
      if (priceId === process.env.STRIPE_PRICE_PRO)    plan = 'pro'

      await supabase
        .from('subscriptions' as any)
        .update({
          plan,
          status: subscription.status,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', sub.organization_id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    const { data: sub } = await supabase
      .from('subscriptions' as any)
      .select('organization_id')
      .eq('stripe_customer_id', customerId)
      .single() as { data: { organization_id: string } | null }

    if (sub) {
      await supabase
        .from('subscriptions' as any)
        .update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', sub.organization_id)
    }
  }

  return NextResponse.json({ received: true })
}
