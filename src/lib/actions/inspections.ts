'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FormState = { error?: string; success?: boolean }

async function getOrgAndUser(): Promise<{ orgId: string; userId: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!data) return null
  return { orgId: data.organization_id, userId: user.id }
}

export async function createInspection(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const hiveId = formData.get('hive_id') as string
  if (!hiveId) return { error: 'Seleccioná una colmena.' }

  const overallHealth = formData.get('overall_health')
    ? Number(formData.get('overall_health'))
    : null

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('inspections') as any).insert({
    organization_id: ctx.orgId,
    hive_id: hiveId,
    inspector_id: ctx.userId,
    inspected_at: (formData.get('inspected_at') as string) || new Date().toISOString(),
    weather: (formData.get('weather') as string) || null,
    temperature_c: formData.get('temperature_c') ? Number(formData.get('temperature_c')) : null,
    duration_min: formData.get('duration_min') ? Number(formData.get('duration_min')) : null,
    overall_health: overallHealth,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/inspections')
  redirect('/dashboard/inspections')
}

export async function updateInspection(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const hiveId = formData.get('hive_id') as string
  if (!hiveId) return { error: 'Seleccioná una colmena.' }

  const overallHealth = formData.get('overall_health')
    ? Number(formData.get('overall_health'))
    : null

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('inspections') as any)
    .update({
      hive_id: hiveId,
      inspected_at: (formData.get('inspected_at') as string) || new Date().toISOString(),
      weather: (formData.get('weather') as string) || null,
      temperature_c: formData.get('temperature_c') ? Number(formData.get('temperature_c')) : null,
      duration_min: formData.get('duration_min') ? Number(formData.get('duration_min')) : null,
      overall_health: overallHealth,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', ctx.orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/inspections')
  revalidatePath(`/dashboard/inspections/${id}`)
  redirect('/dashboard/inspections')
}

export async function deleteInspection(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('inspections').delete().eq('id', id)
  revalidatePath('/dashboard/inspections')
  redirect('/dashboard/inspections')
}

export async function uploadInspectionPhoto(
  inspectionId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const file = formData.get('photo') as File | null
  if (!file || file.size === 0) return { error: 'Seleccioná una foto.' }
  if (!file.type.startsWith('image/')) return { error: 'El archivo debe ser una imagen.' }
  if (file.size > 10 * 1024 * 1024) return { error: 'La foto no puede superar los 10MB.' }

  const supabase = createClient()

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const storagePath = `${ctx.orgId}/${inspectionId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('inspection-photos')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase.from('inspection_photos') as any).insert({
    organization_id: ctx.orgId,
    inspection_id: inspectionId,
    storage_path: storagePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: ctx.userId,
  })

  if (dbError) {
    await supabase.storage.from('inspection-photos').remove([storagePath])
    return { error: dbError.message }
  }

  revalidatePath(`/dashboard/inspections/${inspectionId}`)
  return { success: true }
}

export async function deleteInspectionPhoto(
  photoId: string,
  storagePath: string,
  inspectionId: string
): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from('inspection-photos').remove([storagePath])
  await supabase.from('inspection_photos').delete().eq('id', photoId)
  revalidatePath(`/dashboard/inspections/${inspectionId}`)
}
