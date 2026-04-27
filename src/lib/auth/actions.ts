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
  const inviteToken = formData.get('invite_token') as string | null

  const isInvite = !!inviteToken

  if (!email || !password || !fullName) {
    return { error: 'Todos los campos son obligatorios.' }
  }
  if (!isInvite && !orgName) {
    return { error: 'El nombre del apiario es obligatorio.' }
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
        org_name: orgName ?? '',
        skip_org_creation: isInvite,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (isInvite) {
    redirect(`/invite/${inviteToken}`)
  }

  redirect('/dashboard')
}

// ── LOGIN ─────────────────────────────────────────────────────
export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const inviteToken = formData.get('invite_token') as string | null

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios.' }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  revalidatePath('/', 'layout')
  if (inviteToken) redirect(`/invite/${inviteToken}`)
  redirect('/dashboard')
}

// ── LOGOUT ────────────────────────────────────────────────────
export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ── FORGOT PASSWORD ───────────────────────────────────────────
export async function requestPasswordReset(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  if (!email) return { error: 'El email es obligatorio.' }

  const supabase = createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`,
  })

  if (error) return { error: error.message }

  await supabase.auth.signOut()

  return { message: 'Te enviamos un email con el link para restablecer tu contraseña.' }
}

// ── RESET PASSWORD ────────────────────────────────────────────
export async function updatePassword(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || !confirm) return { error: 'Todos los campos son obligatorios.' }
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (password !== confirm) return { error: 'Las contraseñas no coinciden.' }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
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
