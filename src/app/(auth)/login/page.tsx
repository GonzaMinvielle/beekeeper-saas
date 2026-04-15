'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { login } from '@/lib/auth/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold rounded-lg transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
    >
      {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
    </button>
  )
}

export default function LoginPage() {
  const [state, action] = useFormState(login, {})

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Bienvenido de vuelta</h2>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="apicultor@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
          Registrarse
        </Link>
      </p>
    </div>
  )
}
