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
  const { error } = await (supabase as any).from('inspections').insert({
    organization_id: member.organization_id,
    hive_id:        body.hive_id,
    inspector_id:   user.id,
    inspected_at:   body.inspected_at,
    overall_health: body.overall_health ?? null,
    notes:          body.notes ?? null,
    weather:        body.weather ?? null,
    temperature_c:  body.temperature_c ?? null,
    duration_min:   body.duration_min ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
