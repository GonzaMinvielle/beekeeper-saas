'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

type Props = { currentPlan: PlanId }

export default function PricingClient({ currentPlan }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanId | null>(null)

  async function handleUpgrade(planId: PlanId) {
    if (planId === 'free') return
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Error al iniciar el pago')
      }
    } finally {
      setLoading(null)
    }
  }

  const planList = [PLANS.free, PLANS.basic, PLANS.pro] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
      {planList.map((plan) => {
        const isCurrentPlan = plan.id === currentPlan
        const isPro = plan.id === 'pro'

        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-8 flex flex-col
              ${isPro
                ? 'border-amber-500 bg-amber-50 shadow-lg'
                : 'border-gray-200 bg-white shadow-sm'
              }`}
          >
            {isPro && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MÁS POPULAR
              </span>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                {plan.price === 0 ? (
                  <span className="text-4xl font-extrabold text-gray-900">Gratis</span>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/mes</span>
                  </>
                )}
              </div>
            </div>

            <ul className="flex-1 space-y-2 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
              {'missing' in plan && plan.missing.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                  <span className="mt-0.5">✗</span>
                  {f}
                </li>
              ))}
            </ul>

            {isCurrentPlan ? (
              <div className="text-center py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold">
                Plan actual
              </div>
            ) : plan.id === 'free' ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Continuar gratis
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60
                  ${isPro
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
              >
                {loading === plan.id ? 'Redirigiendo...' : `Elegir ${plan.name}`}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
