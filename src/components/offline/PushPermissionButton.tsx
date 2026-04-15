'use client'

import { useState, useEffect } from 'react'

// VAPID public key — reemplazá con la tuya generada con:
// npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)))
}

export default function PushPermissionButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  if (typeof Notification === 'undefined') return null
  if (permission === 'granted') return (
    <p className="text-xs text-green-600 font-medium">🔔 Notificaciones activadas</p>
  )
  if (permission === 'denied') return (
    <p className="text-xs text-gray-400">🔕 Notificaciones bloqueadas en el navegador</p>
  )

  async function enable() {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      if (!('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={enable}
      disabled={loading}
      className="text-xs text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2 disabled:opacity-60"
    >
      {loading ? 'Activando...' : '🔔 Activar notificaciones'}
    </button>
  )
}
