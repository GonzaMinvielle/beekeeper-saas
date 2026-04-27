'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { register } from '@/lib/auth/actions'

function SubmitButton({ isInvite }: { isInvite: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold rounded-lg transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
    >
      {pending ? 'Creando cuenta...' : isInvite ? 'Crear cuenta y unirme' : 'Crear cuenta gratis'}
    </button>
  )
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')
  const [state, action] = useFormState(register, {})

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Crear cuenta</h2>
      <p className="text-sm text-gray-500 mb-6">
        {inviteToken
          ? 'Creá tu cuenta para unirte al equipo.'
          : 'Tu organización se crea automáticamente al registrarte.'}
      </p>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        {inviteToken && (
          <input type="hidden" name="invite_token" value={inviteToken} />
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="Juan García"
          />
        </div>

        {!inviteToken && (
          <div>
            <label htmlFor="org_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del apiario / organización
            </label>
            <input
              id="org_name"
              name="org_name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Apiario Don Pedro"
            />
          </div>
        )}

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
            placeholder="juan@ejemplo.com"
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
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <SubmitButton isInvite={!!inviteToken} />
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link
          href={inviteToken ? `/login?invite=${inviteToken}` : '/login'}
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-2xl shadow-xl p-8"><p className="text-sm text-gray-500">Cargando...</p></div>}>
      <RegisterForm />
    </Suspense>
  )
}
