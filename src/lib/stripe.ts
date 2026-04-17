import Stripe from 'stripe'
export type { PlanId } from './plans'
export { PLANS } from './plans'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Backwards compat — lazy proxy so existing `stripe.x` calls work
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})
