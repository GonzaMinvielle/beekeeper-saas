import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient> & { from(table: string): any }

export async function POST(req: NextRequest) {
  const supabase = createClient() as AnyClient
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const memberRes = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  const member = memberRes.data as { organization_id: string } | null
  if (!member) return NextResponse.json({ error: 'Sin organización' }, { status: 404 })

  const body = await req.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inspection, error } = await (supabase as any).from('inspections').insert({
    organization_id: member.organization_id,
    hive_id:           null,
    inspector_id:      user.id,
    inspection_level:  'apiary',
    apiary_id:         body.apiary_id,
    inspected_at:      body.inspected_at,
    weather_conditions: body.weather_conditions ?? null,
    flowering_status:  body.flowering_status ?? null,
    general_notes:     body.general_notes ?? null,
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let hivesWithAttention: { hive_id: string; observation: string; priority: string }[] = []
  try { hivesWithAttention = JSON.parse(body.hives_with_attention || '[]') } catch { /* ignore */ }

  if (hivesWithAttention.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('apiary_inspection_details').insert(
      hivesWithAttention.map(h => ({
        inspection_id: inspection.id,
        hive_id: h.hive_id,
        observation: h.observation || null,
        requires_attention: true,
        priority: h.priority,
        org_id: member.organization_id,
      }))
    )
  }

  let supersChanges: { hive_id: string; action: string; super_id?: string }[] = []
  try { supersChanges = JSON.parse(body.supers_changes || '[]') } catch { /* ignore */ }

  const inspectedDate = (body.inspected_at || new Date().toISOString()).slice(0, 10)
  for (const change of supersChanges) {
    if (change.action === 'add') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('hive_supers').insert({
        org_id: member.organization_id,
        hive_id: change.hive_id,
        placed_at: inspectedDate,
      })
    } else if (change.action === 'remove' && change.super_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('hive_supers')
        .update({ removed_at: inspectedDate, removal_reason: 'other' })
        .eq('id', change.super_id)
    }
  }

  return NextResponse.json({ ok: true })
}
