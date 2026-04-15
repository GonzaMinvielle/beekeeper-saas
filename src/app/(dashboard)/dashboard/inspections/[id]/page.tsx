import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Hive, Inspection, InspectionPhoto } from '@/lib/types/database.types'
import InspectionDetailClient from './InspectionDetailClient'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }
export type PhotoWithUrl = InspectionPhoto & { url: string | null }

async function getData(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!member) redirect('/dashboard')

  const { data: inspection } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .eq('organization_id', member.organization_id)
    .single() as { data: Inspection | null }

  if (!inspection) notFound()

  const [hivesResult, photosResult] = await Promise.all([
    supabase
      .from('hives')
      .select('*, apiaries(name)')
      .eq('organization_id', member.organization_id)
      .eq('status', 'active')
      .order('name'),
    supabase
      .from('inspection_photos')
      .select('*')
      .eq('inspection_id', id)
      .order('created_at'),
  ])

  const photosWithUrls: PhotoWithUrl[] = await Promise.all(
    ((photosResult.data ?? []) as InspectionPhoto[]).map(async (photo) => {
      const { data } = await supabase.storage
        .from('inspection-photos')
        .createSignedUrl(photo.storage_path, 3600)
      return { ...photo, url: data?.signedUrl ?? null }
    })
  )

  return {
    inspection,
    hives: (hivesResult.data as HiveWithApiary[]) ?? [],
    photos: photosWithUrls,
  }
}

export default async function InspectionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { inspection, hives, photos } = await getData(params.id)
  return <InspectionDetailClient inspection={inspection} hives={hives} photos={photos} />
}
