'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
  error?: string
  message?: string
}

// ── REGISTER ─────────────────────────────────────────────────
export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const orgName = formData.get('org_name') as string

  if (!email || !password || !fullName || !orgName) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        org_name: orgName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // El trigger handle_new_user_organization crea la org automáticamente.
  // Redirigir al dashboard una vez confirmado el email (o directamente si
  // "Confirm email" está desactivado en Supabase).
  redirect('/dashboard')
}

// ── LOGIN ─────────────────────────────────────────────────────
export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios.' }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ── LOGOUT ────────────────────────────────────────────────────
export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ── GET CURRENT ORG ───────────────────────────────────────────
export async function getCurrentOrg() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: member } = await supabase
    .from('org_members')
    .select('role, organizations(id, name, slug, plan)')
    .eq('user_id', user.id)
    .single() as {
      data: {
        role: string
        organizations: { id: string; name: string; slug: string; plan: string } | null
      } | null
    }

  if (!member) return null

  return {
    user,
    organization: member.organizations,
    role: member.role,
  }
}
