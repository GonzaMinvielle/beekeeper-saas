import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

/**
 * Cliente Supabase con service_role key.
 * Solo usar en rutas de API server-side (cron jobs, webhooks).
 * Nunca exponer al cliente.
 */
export function createAdminClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<Database>(url, key) as any
}
