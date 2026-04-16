'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navGroups = [
  {
    label: 'General',
    links: [
      { href: '/dashboard',             label: 'Resumen',      icon: '🏠' },
      { href: '/dashboard/apiaries',    label: 'Apiarios',     icon: '📍' },
      { href: '/dashboard/hives',       label: 'Colmenas',     icon: '🏡' },
      { href: '/dashboard/inspections', label: 'Inspecciones', icon: '📋' },
    ],
  },
  {
    label: 'Producción',
    links: [
      { href: '/dashboard/harvests',    label: 'Cosechas',     icon: '🍯' },
      { href: '/dashboard/treatments',  label: 'Tratamientos', icon: '💊' },
    ],
  },
  {
    label: 'Gestión',
    links: [
      { href: '/dashboard/tasks',       label: 'Tareas',       icon: '✅' },
      { href: '/dashboard/finances',    label: 'Finanzas',     icon: '💰' },
    ],
  },
  {
    label: 'Análisis',
    links: [
      { href: '/dashboard/reports',     label: 'Informes',     icon: '📊' },
      { href: '/dashboard/weather',     label: 'Clima',        icon: '🌤️' },
    ],
  },
  {
    label: 'Comunidad',
    links: [
      { href: '/dashboard/community',           label: 'Foro',         icon: '💬' },
      { href: '/dashboard/community/diseases',  label: 'Enfermedades', icon: '🔬' },
    ],
  },
  {
    label: 'Cuenta',
    links: [
      { href: '/pricing',           label: 'Planes',      icon: '⭐' },
      { href: '/dashboard/billing', label: 'Facturación', icon: '💳' },
    ],
  },
]

type Props = {
  orgName: string
  email: string
  role: string
  logoutAction: () => Promise<void>
}

export default function Sidebar({ orgName, email, role, logoutAction }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-[#0a5040] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-amber/20 flex items-center justify-center">
            <span className="text-xl">🐝</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-white">Appicultor Pro</p>
            <p className="text-[#86efcb] text-xs truncate max-w-[120px]">{orgName}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1 text-[#86efcb] hover:text-white transition-colors"
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-[#86efcb]/60 uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.links.map(({ href, label, icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all
                      ${active
                        ? 'bg-brand-green text-white shadow-md shadow-brand-green/40'
                        : 'text-[#c6f0e0] hover:bg-[#0a5040] hover:text-white'
                      }`}
                  >
                    <span className="text-base w-5 text-center shrink-0">{icon}</span>
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-3 border-t border-[#0a5040]">
        <div className="mb-2 px-3 py-2 rounded-2xl bg-[#0a5040]/60">
          <p className="text-xs text-[#86efcb] truncate font-medium">{email}</p>
          <p className="text-xs text-[#86efcb]/60 capitalize">{role}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm
                       text-[#c6f0e0] hover:bg-[#0a5040] hover:text-white transition-all font-medium"
          >
            <span className="text-base">🚪</span>
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* TOP BAR mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[#0F6E56] text-white
                         flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🐝</span>
          <span className="font-bold text-sm">Appicultor Pro</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[#86efcb] hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* BACKDROP mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0F6E56] text-white
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
