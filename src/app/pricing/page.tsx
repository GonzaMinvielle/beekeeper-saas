import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PricingClient from './PricingClient'
import type { PlanId } from '@/lib/stripe'

async function getCurrentPlan(): Promise<PlanId> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) return 'free'

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('organization_id', member.organization_id)
    .single() as { data: { plan: string } | null }

  return (sub?.plan as PlanId) ?? 'free'
}

export default async function PricingPage() {
  const currentPlan = await getCurrentPlan()

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-16">
      {/* Header */}
      <div className="text-center mb-12 px-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium mb-8">
          ← Volver al panel
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Elegí tu plan
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Gestioná tu apiario de manera profesional. Cancela cuando quieras, sin permanencia.
        </p>
      </div>

      <PricingClient currentPlan={currentPlan} />

      <p className="text-center text-xs text-gray-400 mt-12 px-4">
        Los precios están en USD. Pagos procesados de forma segura por Stripe.
        Podés cancelar o cambiar de plan en cualquier momento.
      </p>
    </div>
  )
}
