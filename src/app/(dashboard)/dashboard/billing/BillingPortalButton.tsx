'use client'

import { useState } from 'react'

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Error al abrir el portal de facturación')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60
                 text-white text-sm font-semibold rounded-xl transition-colors"
    >
      {loading ? 'Redirigiendo...' : '💳 Gestionar suscripción'}
    </button>
  )
}
