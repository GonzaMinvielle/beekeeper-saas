'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { updateInspection, deleteInspection, uploadInspectionPhoto, deleteInspectionPhoto } from '@/lib/actions/inspections'
import type { Hive, Inspection } from '@/lib/types/database.types'
import type { PhotoWithUrl } from './page'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

const weatherOptions = ['Soleado', 'Nublado', 'Parcialmente nublado', 'Viento leve', 'Viento fuerte', 'Lluvia']

const healthOptions = [
  { value: 1, label: 'Crítico',   color: 'text-red-600' },
  { value: 2, label: 'Malo',      color: 'text-orange-500' },
  { value: 3, label: 'Regular',   color: 'text-yellow-600' },
  { value: 4, label: 'Bueno',     color: 'text-lime-600' },
  { value: 5, label: 'Excelente', color: 'text-green-600' },
]

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  )
}

function UploadButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? 'Subiendo...' : 'Subir foto'}
    </button>
  )
}

function PhotosSection({
  inspectionId,
  photos,
}: {
  inspectionId: string
  photos: PhotoWithUrl[]
}) {
  const uploadWithId = uploadInspectionPhoto.bind(null, inspectionId)
  const [uploadState, uploadAction] = useFormState(uploadWithId, {})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (uploadState.success && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [uploadState.success])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h2 className="font-semibold text-gray-900">
        Fotos
        <span className="ml-2 text-sm font-normal text-gray-400">({photos.length})</span>
      </h2>

      {/* Grid de fotos existentes */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100">
              {photo.url ? (
                <Image
                  src={photo.url}
                  alt={photo.file_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  Sin URL
                </div>
              )}
              {/* Botón eliminar */}
              <form
                action={deleteInspectionPhoto.bind(null, photo.id, photo.storage_path, inspectionId)}
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm('¿Eliminar esta foto?')) e.preventDefault()
                  }}
                  className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full
                             flex items-center justify-center text-xs font-bold shadow-md"
                  title="Eliminar foto"
                >
                  ×
                </button>
              </form>
              {/* Nombre del archivo */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1
                              opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{photo.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario de carga */}
      <form action={uploadAction} className="space-y-3">
        {uploadState.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {uploadState.error}
          </div>
        )}
        {uploadState.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Foto subida correctamente.
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="flex-1">
            <span className="sr-only">Seleccionar foto</span>
            <input
              ref={fileInputRef}
              type="file"
              name="photo"
              accept="image/*"
              className="w-full text-sm text-gray-500
                         file:mr-3 file:py-2 file:px-4
                         file:rounded-lg file:border file:border-gray-300
                         file:text-sm file:font-medium file:text-gray-700
                         file:bg-white file:cursor-pointer
                         hover:file:bg-gray-50"
            />
          </label>
          <UploadButton />
        </div>
        <p className="text-xs text-gray-400">Formatos: JPG, PNG, WEBP. Máximo 10MB por foto.</p>
      </form>
    </div>
  )
}

export default function InspectionDetailClient({
  inspection,
  hives,
  photos,
}: {
  inspection: Inspection
  hives: HiveWithApiary[]
  photos: PhotoWithUrl[]
}) {
  const updateWithId = updateInspection.bind(null, inspection.id)
  const [state, formAction] = useFormState(updateWithId, {})

  const localDatetime = inspection.inspected_at
    ? new Date(inspection.inspected_at).toISOString().slice(0, 16)
    : ''

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/inspections" className="text-sm text-amber-600 hover:text-amber-700">
            ← Volver a inspecciones
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Detalle de inspección</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(inspection.inspected_at).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <form action={deleteInspection.bind(null, inspection.id)}>
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm('¿Eliminar esta inspección?')) e.preventDefault()
            }}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50
                       border border-red-200 rounded-lg transition-colors font-medium"
          >
            Eliminar
          </button>
        </form>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Editar inspección</h2>

        {state.error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colmena <span className="text-red-500">*</span>
            </label>
            <select
              name="hive_id"
              required
              defaultValue={inspection.hive_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              {hives.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}{h.apiaries ? ` — ${h.apiaries.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
            <input
              name="inspected_at"
              type="datetime-local"
              defaultValue={localDatetime}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clima</label>
              <select
                name="weather"
                defaultValue={inspection.weather ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                <option value="">— sin especificar —</option>
                {weatherOptions.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
              <input
                name="temperature_c"
                type="number"
                step="0.1"
                defaultValue={inspection.temperature_c ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
            <input
              name="duration_min"
              type="number"
              min="1"
              defaultValue={inspection.duration_min ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salud general</label>
            <div className="flex gap-2">
              {healthOptions.map((h) => (
                <label key={h.value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="overall_health"
                    value={h.value}
                    defaultChecked={inspection.overall_health === h.value}
                    className="sr-only peer"
                  />
                  <div className={`text-center py-2 border-2 border-gray-200 rounded-lg text-xs font-semibold
                                  peer-checked:border-amber-400 peer-checked:bg-amber-50
                                  hover:border-gray-300 transition-colors ${h.color}`}>
                    {h.value}
                  </div>
                  <div className={`text-center text-xs mt-1 ${h.color} font-medium`}>
                    {h.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={inspection.notes ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SaveButton />
            <Link href="/dashboard/inspections" className="text-sm text-gray-500 hover:text-gray-700">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Fotos */}
      <PhotosSection inspectionId={inspection.id} photos={photos} />
    </div>
  )
}
