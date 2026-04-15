// IndexedDB helper para inspecciones offline
export type PendingInspection = {
  id: string              // UUID local temporal
  hive_id: string
  hive_name: string
  inspected_at: string
  overall_health: number | null
  notes: string | null
  weather: string | null
  temperature_c: number | null
  duration_min: number | null
  synced: boolean
  created_local: string
}

const DB_NAME  = 'appicultor_offline'
const DB_VER   = 1
const STORE    = 'pending_inspections'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

export async function savePendingInspection(data: Omit<PendingInspection, 'synced' | 'created_local'>) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx   = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    store.put({ ...data, synced: false, created_local: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getPendingInspections(): Promise<PendingInspection[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req   = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

export async function deletePendingInspection(id: string) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx   = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}
