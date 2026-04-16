import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Appicultor Pro — Gestión de Colmenas',
  description: 'Plataforma SaaS multi-tenant para apicultores profesionales',
  manifest: '/manifest.json',
  themeColor: '#1D9E75',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Appicultor Pro',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} font-outfit antialiased`}>
        {children}
      </body>
    </html>
  )
}
