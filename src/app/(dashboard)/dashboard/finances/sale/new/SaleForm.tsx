'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import Link from 'next/link'
import { createSale } from '@/lib/actions/finances'
import { honeyTypes } from '@/lib/types/database.types'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : 'Registrar venta'}
    </button>
  )
}

export default function SaleForm() {
  const [state, action] = useFormState(createSale, {})
  const today = new Date().toISOString().slice(0, 10)
  const [qty, setQty]     = useState('')
  const [price, setPrice] = useState('')

  const preview = qty && price
    ? (Number(qty) * Number(price)).toLocaleString('es-AR', { minimumFractionDigits: 2 })
    : null

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/finances" className="text-sm text-amber-600 hover:text-amber-700">
          ← Volver a finanzas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nueva venta</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {state.error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de miel <span className="text-red-500">*</span>
              </label>
              <select
                name="honey_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                {honeyTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                name="sale_date"
                type="date"
                defaultValue={today}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad (kg) <span className="text-red-500">*</span>
              </label>
              <input
                name="quantity_kg"
                type="number"
                step="0.001"
                min="0.001"
                required
                placeholder="Ej: 25"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio por kg <span className="text-red-500">*</span>
              </label>
              <input
                name="price_per_kg"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ej: 2500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          {preview && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                Total: <span className="font-bold text-green-800">${preview}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comprador</label>
              <input
                name="buyer_name"
                type="text"
                placeholder="Nombre del comprador"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referencia de lote</label>
              <input
                name="batch_ref"
                type="text"
                placeholder="Ej: L2024-01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Observaciones adicionales..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton />
            <Link href="/dashboard/finances" className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
