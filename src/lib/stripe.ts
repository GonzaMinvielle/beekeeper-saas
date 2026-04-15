import Stripe from 'stripe'
export type { PlanId } from './plans'
export { PLANS } from './plans'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})
