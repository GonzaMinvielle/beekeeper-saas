import { createClient } from '@/lib/supabase/client'
import {
  setCachedHives,
  setCachedInspections,
  setCachedApiaries,
  type CachedHive,
  type CachedInspection,
  type CachedApiary,
} from './db'

export async function cacheDataForOffline(): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: memberData } = await supabase
      .from('org_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = memberData as { organization_id: string } | null
    if (!member) return

    // Cachear apiarios
    const { data: apiaries } = await supabase
      .from('apiaries')
      .select('id, name')
      .eq('organization_id', member.organization_id)
      .order('name')

    if (apiaries) {
      await setCachedApiaries(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (apiaries as any[]).map((a): CachedApiary => ({
          id: a.id,
          name: a.name,
        }))
      )
    }

    // Cachear colmenas activas
    const { data: hives } = await supabase
      .from('hives')
      .select('id, name, code, status, apiary_id, apiaries(name)')
      .eq('organization_id', member.organization_id)
      .eq('status', 'active')
      .order('name')

    if (hives) {
      await setCachedHives(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (hives as any[]).map((h): CachedHive => ({
          id: h.id,
          name: h.name,
          code: h.code ?? null,
          apiary_id: h.apiary_id ?? null,
          apiary_name: h.apiaries?.name ?? null,
          status: h.status,
        }))
      )
    }

    // Cachear últimas 100 inspecciones
    const { data: inspections } = await supabase
      .from('inspections')
      .select('id, hive_id, inspected_at, overall_health, weather, temperature_c, duration_min, notes, created_at, hives(name)')
      .eq('organization_id', member.organization_id)
      .order('inspected_at', { ascending: false })
      .limit(100)

    if (inspections) {
      await setCachedInspections(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (inspections as any[]).map((i): CachedInspection => ({
          id: i.id,
          hive_id: i.hive_id,
          hive_name: i.hives?.name ?? null,
          inspected_at: i.inspected_at,
          overall_health: i.overall_health ?? null,
          weather: i.weather ?? null,
          temperature_c: i.temperature_c ?? null,
          duration_min: i.duration_min ?? null,
          notes: i.notes ?? null,
          created_at: i.created_at,
        }))
      )
    }
  } catch {
    // Fallo silencioso — cachear es best-effort
  }
}
