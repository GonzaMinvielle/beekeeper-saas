'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

// ─── WhatsApp config ──────────────────────────────────────────────────────────
// Reemplazá este número por el tuyo en formato internacional sin + ni espacios
const WA_NUMBER = '5492284308943'
const WA_MSG    = encodeURIComponent('Hola, quiero saber más sobre Appicultor Pro')
const WA_HREF   = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: '📍',
    title: 'Gestión de Apiarios',
    desc: 'Registrá múltiples apiarios con ubicación en mapa interactivo, datos del puestero y seguimiento por campo.',
    color: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
  },
  {
    icon: '🏡',
    title: 'Control de Colmenas',
    desc: 'Seguimiento individual de cada colmena: estado, tipo, reina, historial completo de intervenciones.',
    color: 'from-amber-50 to-yellow-50',
    border: 'border-amber-100',
  },
  {
    icon: '📋',
    title: 'Inspecciones Detalladas',
    desc: 'Registros de inspección con clima, temperatura, salud general, observaciones y fotos adjuntas.',
    color: 'from-blue-50 to-sky-50',
    border: 'border-blue-100',
  },
  {
    icon: '🍯',
    title: 'Gestión de Cosechas',
    desc: 'Controlá la producción por variedad de miel, lotes y stock. Relacioná cada cosecha con su colmena.',
    color: 'from-yellow-50 to-orange-50',
    border: 'border-yellow-100',
  },
  {
    icon: '💰',
    title: 'Finanzas y Rentabilidad',
    desc: 'Registrá ventas, gastos, y visualizá tu margen neto. Informes anuales de rentabilidad por apiario.',
    color: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
  },
  {
    icon: '💬',
    title: 'Comunidad y Enfermedades',
    desc: 'Foro colaborativo con otros apicultores y biblioteca completa de enfermedades con síntomas y tratamientos.',
    color: 'from-purple-50 to-violet-50',
    border: 'border-purple-100',
  },
]

const steps = [
  {
    num: '01',
    icon: '📝',
    title: 'Registrate gratis',
    desc: 'Creá tu cuenta en segundos. Sin tarjeta de crédito. Empezá con el plan gratuito y escalá cuando lo necesites.',
  },
  {
    num: '02',
    icon: '🏡',
    title: 'Agregá tus colmenas',
    desc: 'Cargá tus apiarios y colmenas. El sistema organiza todo automáticamente y genera recordatorios de inspección.',
  },
  {
    num: '03',
    icon: '📊',
    title: 'Tomá mejores decisiones',
    desc: 'Informes, alertas de lluvia, vencimiento de medicamentos y análisis financiero para maximizar tu producción.',
  },
]

const plans = [
  {
    name: 'Gratuito',
    price: 'Gratis',
    period: 'para siempre',
    arsNote: null,
    desc: 'Para apicultores que están empezando.',
    features: ['5 colmenas', '1 apiario', '1 usuario', 'Inspecciones básicas', 'Biblioteca de enfermedades'],
    cta: 'Empezar gratis',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Básico',
    price: 'USD 20',
    period: '/mes',
    arsNote: '≈ $22.000 ARS al tipo de cambio actual',
    desc: 'Para apiarios en crecimiento.',
    features: ['20 colmenas', '3 apiarios', '3 usuarios', 'Cosechas y tratamientos', 'Alertas de lluvia', 'Soporte por email'],
    cta: 'Elegir Básico',
    href: '/register?plan=basic',
    highlight: true,
  },
  {
    name: 'Profesional',
    price: 'USD 30',
    period: '/mes',
    arsNote: '≈ $33.000 ARS al tipo de cambio actual',
    desc: 'Para operaciones apícolas serias.',
    features: ['Colmenas ilimitadas', 'Apiarios ilimitados', 'Usuarios ilimitados', 'Finanzas avanzadas', 'Informes exportables', 'Soporte prioritario'],
    cta: 'Elegir Pro',
    href: '/register?plan=pro',
    highlight: false,
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🐝</span>
          <span className="font-bold text-lg text-brand-green-dark tracking-tight">
            Appicultor<span className="text-brand-amber"> Pro</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-brand-green transition-colors">Características</a>
          <a href="#how" className="hover:text-brand-green transition-colors">Cómo funciona</a>
          <a href="#pricing" className="hover:text-brand-green transition-colors">Precios</a>
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-700 hover:text-brand-green transition-colors px-4 py-2"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold text-white bg-gradient-to-r from-brand-green to-brand-green-dark
                       px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-sm"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-brand-green"
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 py-1">Características</a>
          <a href="#how" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 py-1">Cómo funciona</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 py-1">Precios</a>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-full py-2.5">
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-center text-sm font-bold text-white bg-gradient-to-r from-brand-green to-brand-green-dark rounded-full py-2.5">
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function AppMockup() {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-200 text-left">
      {/* Title bar */}
      <div className="bg-[#1a1a2e] flex items-center justify-between px-3 sm:px-4 h-9 gap-2">
        {/* Left: app icon + title */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm">🐝</span>
          <span className="text-white text-xs font-semibold">Appicultor Pro</span>
        </div>
        {/* Center: address bar — hidden on mobile */}
        <div className="hidden sm:block flex-1 max-w-xs">
          <div className="bg-gray-700/60 text-gray-300 text-xs px-3 py-1 rounded text-center truncate font-mono">
            app.appicultor-pro.com/dashboard
          </div>
        </div>
        {/* Right: window controls */}
        <div className="flex items-center gap-2.5 text-gray-400 text-xs shrink-0 font-medium">
          <span className="cursor-default">—</span>
          <span className="cursor-default">□</span>
          <span className="hover:text-red-400 cursor-default">✕</span>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="bg-gray-50 p-2.5 sm:p-4 space-y-2.5 sm:space-y-4">
        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Colmenas activas',    value: '32',    icon: '🏡', color: 'text-brand-green' },
            { label: 'Kg cosechados',        value: '847 kg', icon: '🍯', color: 'text-amber-500' },
            { label: 'Alertas pendientes',   value: '3',     icon: '🔔', color: 'text-red-500' },
            { label: 'Colmenas saludables',  value: '94%',   icon: '💚', color: 'text-green-500' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-lg border border-gray-100 p-2 sm:p-3 shadow-sm">
              <div className="flex items-start justify-between mb-1 gap-1">
                <span className="text-[10px] sm:text-xs text-gray-500 leading-tight">{card.label}</span>
                <span className="text-sm shrink-0">{card.icon}</span>
              </div>
              <p className={`text-base sm:text-xl font-extrabold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-100">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Últimas colmenas</span>
          </div>
          <table className="w-full text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-gray-500">Colmena</th>
                <th className="text-left px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-gray-500 hidden sm:table-cell">Apiario</th>
                <th className="text-left px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: 'Colmena A1', apiary: 'Apiario Norte', badge: 'Saludable', cls: 'bg-green-100 text-green-700' },
                { name: 'Colmena B3', apiary: 'Apiario Sur',   badge: 'Atención',  cls: 'bg-yellow-100 text-yellow-700' },
                { name: 'Colmena C2', apiary: 'Apiario Norte', badge: 'Crítica',   cls: 'bg-red-100 text-red-700' },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-gray-800">{row.name}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-gray-500 hidden sm:table-cell">{row.apiary}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span className={`${row.cls} px-1.5 sm:px-2 py-0.5 rounded-full font-semibold`}>{row.badge}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-bg font-outfit overflow-x-hidden">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green-dark via-brand-green to-emerald-400 opacity-[0.08]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-amber opacity-10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-brand-green opacity-10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green font-semibold
                               text-sm px-4 py-1.5 rounded-full mb-6 border border-brand-green/20">
                🐝 Software profesional para apicultores
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6"
            >
              Gestiona tu apiario con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-amber">
                precisión profesional
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              Registrá inspecciones, controlá cosechas, gestioná tratamientos y analizá la rentabilidad
              de tus colmenas — todo en una sola plataforma diseñada para apicultores.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 text-base font-bold text-white
                           bg-gradient-to-r from-brand-green to-brand-green-dark
                           px-8 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-brand-green/30"
              >
                Empezar gratis →
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-gray-700
                           bg-white px-8 py-4 rounded-full hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
              >
                Ver características
              </a>
            </motion.div>

            <motion.p variants={fadeUp} className="text-sm text-gray-400 mt-5">
              Sin tarjeta de crédito · Plan gratuito permanente · Configuración en 2 minutos
            </motion.p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: '100%', label: 'Gratuito para empezar' },
              { value: '6+', label: 'Módulos integrados' },
              { value: '24/7', label: 'Acceso desde el campo' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-brand-green">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* App mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-14"
          >
            <AppMockup />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-brand-green font-bold text-sm uppercase tracking-wider mb-3">
              Todo lo que necesitás
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Una plataforma completa para tu apiario
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 text-lg max-w-2xl mx-auto">
              Desde el registro de la primera inspección hasta el análisis de rentabilidad anual,
              Appicultor Pro cubre cada aspecto de tu actividad apícola.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className={`bg-gradient-to-br ${f.color} border ${f.border}
                            rounded-3xl p-6 hover:shadow-md transition-shadow`}
              >
                <span className="text-3xl block mb-4">{f.icon}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how" className="py-20 md:py-28 bg-brand-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-brand-amber font-bold text-sm uppercase tracking-wider mb-3">
              Simple y rápido
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Empezá en 3 pasos
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-brand-green to-brand-amber opacity-20" />

            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl
                                bg-gradient-to-br from-brand-green to-brand-green-dark shadow-lg shadow-brand-green/25 mb-5 mx-auto">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-amber text-white
                                   text-xs font-extrabold flex items-center justify-center shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-brand-green font-bold text-sm uppercase tracking-wider mb-3">
              Planes
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Precios transparentes y justos
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 text-lg">
              Elegí el plan que mejor se adapte al tamaño de tu apiario.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative rounded-3xl border p-7 flex flex-col
                  ${plan.highlight
                    ? 'bg-gradient-to-b from-brand-green-dark to-brand-green border-brand-green text-white shadow-xl shadow-brand-green/30 scale-105'
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow'
                  }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-amber text-white
                                   text-xs font-bold px-4 py-1 rounded-full shadow">
                    Más popular
                  </span>
                )}
                <div className="mb-5">
                  <p className={`font-bold text-sm mb-1 ${plan.highlight ? 'text-green-200' : 'text-gray-500'}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm pb-1 ${plan.highlight ? 'text-green-200' : 'text-gray-400'}`}>
                      {plan.period}
                    </span>
                  </div>
                  {plan.arsNote && (
                    <p className={`text-xs mb-2 ${plan.highlight ? 'text-green-200' : 'text-gray-400'}`}>
                      {plan.arsNote}
                    </p>
                  )}
                  <p className={`text-sm ${plan.highlight ? 'text-green-100' : 'text-gray-500'}`}>
                    {plan.desc}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-green-50' : 'text-gray-600'}`}>
                      <span className={`text-base shrink-0 ${plan.highlight ? 'text-brand-amber' : 'text-brand-green'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full text-center font-bold text-sm py-3 rounded-2xl transition-all
                    ${plan.highlight
                      ? 'bg-white text-brand-green-dark hover:bg-green-50 shadow'
                      : 'bg-gradient-to-r from-brand-green to-brand-green-dark text-white hover:opacity-90 shadow-sm'
                    }`}
                >
                  {plan.cta}
                </Link>

                {/* WhatsApp link under CTA */}
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-center text-xs mt-3 underline underline-offset-2
                    ${plan.highlight ? 'text-green-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ¿Tenés dudas? Escribinos
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-brand-green-dark to-brand-green">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-5xl mb-5">🐝</motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              ¿Listo para gestionar tu apiario como un profesional?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-green-100 text-lg mb-8">
              Desarrollado junto a apicultores profesionales argentinos para resolver problemas reales del campo.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-green-dark
                           font-bold text-base px-8 py-4 rounded-full hover:bg-green-50 transition-colors shadow-lg"
              >
                Empezar gratis ahora →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🐝</span>
                <span className="font-bold text-white text-lg">Appicultor Pro</span>
              </div>
              <p className="text-sm leading-relaxed">
                Plataforma SaaS para apicultores profesionales. Gestión completa de colmenas, producción y rentabilidad.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-300 text-sm mb-3">Producto</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-300 text-sm mb-3">Cuenta</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Panel de control</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Appicultor Pro. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOATING BUTTON ──────────────────────────────────────────── */}
      <a
        href={WA_HREF}
        target="_blank"
        rel="noopener noreferrer"
        title="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20c05c]
                   rounded-full shadow-lg shadow-black/30 flex items-center justify-center
                   transition-transform hover:scale-110"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}
