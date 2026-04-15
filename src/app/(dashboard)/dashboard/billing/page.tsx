import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PLANS } from '@/lib/stripe'
import BillingPortalButton from './BillingPortalButton'
import type { PlanId } from '@/lib/stripe'

type SubRow = {
  plan: string; status: string; current_period_end: string | null
  stripe_customer_id: string | null; stripe_subscription_id: string | null
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient> & { from(table: string): any }

async function getBillingData() {
  const supabase = createClient() as AnyClient
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberRes = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  const member = memberRes.data as { organization_id: string } | null
  if (!member) redirect('/dashboard')

  const subRes = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, stripe_customer_id, stripe_subscription_id')
    .eq('organization_id', member.organization_id)
    .single()
  const sub = subRes.data as SubRow | null

  return { sub, orgId: member.organization_id }
}

const statusLabel: Record<string, { label: string; color: string }> = {
  active:     { label: 'Activa',      color: 'bg-green-100 text-green-700' },
  trialing:   { label: 'En prueba',   color: 'bg-blue-100 text-blue-700' },
  past_due:   { label: 'Pago vencido', color: 'bg-red-100 text-red-700' },
  canceled:   { label: 'Cancelada',   color: 'bg-gray-100 text-gray-600' },
  incomplete: { label: 'Incompleta',  color: 'bg-yellow-100 text-yellow-700' },
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string }
}) {
  const { sub } = await getBillingData()

  const planId = (sub?.plan ?? 'free') as PlanId
  const plan = PLANS[planId]
  const status = sub?.status ?? 'active'
  const statusInfo = statusLabel[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' }
  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
        <p className="text-gray-500 text-sm mt-1">Administrá tu plan y métodos de pago</p>
      </div>

      {searchParams.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm font-medium">
          ✅ ¡Suscripción activada correctamente! Gracias por tu compra.
        </div>
      )}

      {/* Plan actual */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Plan actual</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">{plan.name}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            {plan.price > 0 ? (
              <>
                <p className="text-2xl font-bold text-gray-900">${plan.price}<span className="text-sm font-normal text-gray-500">/mes</span></p>
                {periodEnd && (
                  <p className="text-xs text-gray-400 mt-0.5">Próximo cobro: {periodEnd}</p>
                )}
              </>
            ) : (
              <p className="text-lg font-semibold text-gray-500">Sin costo</p>
            )}
          </div>
        </div>

        <ul className="space-y-1.5 mb-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500">✓</span> {f}
            </li>
          ))}
        </ul>

        <div className="flex gap-3 flex-wrap">
          {planId !== 'pro' && (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              ⭐ Mejorar plan
            </Link>
          )}
          {sub?.stripe_customer_id && (
            <BillingPortalButton />
          )}
        </div>
      </div>

      {/* Límites del plan */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Límites del plan</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Colmenas</span>
            <span className="font-medium text-gray-900">
              {plan.maxHives === Infinity ? 'Ilimitadas' : `hasta ${plan.maxHives}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Usuarios</span>
            <span className="font-medium text-gray-900">
              {plan.maxUsers === Infinity ? 'Ilimitados' : `hasta ${plan.maxUsers}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Exportar PDF</span>
            <span className="font-medium text-gray-900">
              {planId === 'free' ? '✗ No incluido' : '✓ Incluido'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
