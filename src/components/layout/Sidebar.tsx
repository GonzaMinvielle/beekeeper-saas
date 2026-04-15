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
      { href: '/dashboard/community',           label: 'Foro',             icon: '💬' },
      { href: '/dashboard/community/diseases',  label: 'Enfermedades',     icon: '🔬' },
    ],
  },
  {
    label: 'Cuenta',
    links: [
      { href: '/pricing',               label: 'Planes',       icon: '⭐' },
      { href: '/dashboard/billing',     label: 'Facturación',  icon: '💳' },
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

  // Cierra el sidebar al navegar en mobile
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Determina si un link está activo
  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐝</span>
          <div>
            <p className="font-bold text-sm leading-tight">Appicultor Pro</p>
            <p className="text-amber-300 text-xs truncate max-w-[120px]">{orgName}</p>
          </div>
        </div>
        {/* Botón cerrar — solo mobile */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1 text-amber-300 hover:text-white transition-colors"
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider px-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.links.map(({ href, label, icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'bg-amber-700 text-white'
                        : 'text-amber-100 hover:bg-amber-800 hover:text-white'
                      }`}
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-amber-800">
        <div className="mb-3 px-3">
          <p className="text-xs text-amber-400 truncate">{email}</p>
          <p className="text-xs text-amber-300 capitalize">{role}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-200
                       hover:bg-amber-800 hover:text-white transition-colors"
          >
            🚪 Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* ── TOP BAR mobile ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-amber-900 text-amber-50
                         flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐝</span>
          <span className="font-bold text-sm">Appicultor Pro</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-amber-200 hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* ── BACKDROP mobile ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR desktop: siempre visible / mobile: overlay deslizable ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-amber-900 text-amber-50
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
