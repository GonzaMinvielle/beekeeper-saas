import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Appicultor Pro — Gestión de Colmenas',
  description: 'Plataforma SaaS multi-tenant para apicultores profesionales',
  manifest: '/manifest.json',
  themeColor: '#d97706',
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
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
