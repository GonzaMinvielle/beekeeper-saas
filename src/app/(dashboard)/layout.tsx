import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'
import Sidebar from '@/components/layout/Sidebar'
import OfflineBanner from '@/components/offline/OfflineBanner'

type MemberWithOrg = {
  role: string
  organization_id: string
  organizations: { id: string; name: string; slug: string } | null
}

async function getSession() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('org_members')
    .select('role, organization_id, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .single()

  return { user, member: member as MemberWithOrg | null }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const orgName = session.member?.organizations?.name ?? 'Mi Apiario'

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        orgName={orgName}
        email={session.user.email ?? ''}
        role={session.member?.role ?? ''}
        logoutAction={logout}
      />

      <OfflineBanner />

      {/* Main content
          - mobile: padding-top para la top bar (h-14), sin margin lateral
          - desktop: margin-left para el sidebar (w-64)
      */}
      <main className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
