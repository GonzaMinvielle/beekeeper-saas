// IndexedDB helper para datos offline
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

export type CachedApiary = {
  id: string
  name: string
}

export type CachedHive = {
  id: string
  name: string
  code: string | null
  apiary_id: string | null
  apiary_name: string | null
  status: string
}

export type CachedInspection = {
  id: string
  hive_id: string
  hive_name: string | null
  inspected_at: string
  overall_health: number | null
  weather: string | null
  temperature_c: number | null
  duration_min: number | null
  notes: string | null
  created_at: string
}

export type PendingApiaryInspection = {
  id: string
  apiary_id: string
  apiary_name: string
  inspected_at: string
  weather_conditions: string | null
  flowering_status: string | null
  general_notes: string | null
  hives_with_attention: string  // JSON
  supers_changes: string        // JSON
  synced: boolean
  created_local: string
}

const DB_NAME  = 'appicultor_offline'
const DB_VER   = 4
const PENDING_STORE         = 'pending_inspections'
const PENDING_APIARY_STORE  = 'pending_apiary_inspections'
const HIVE_STORE            = 'cached_hives'
const INSP_STORE            = 'cached_inspections'
const APIARY_STORE          = 'cached_apiaries'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(PENDING_APIARY_STORE)) {
        db.createObjectStore(PENDING_APIARY_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(HIVE_STORE)) {
        db.createObjectStore(HIVE_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(INSP_STORE)) {
        db.createObjectStore(INSP_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(APIARY_STORE)) {
        db.createObjectStore(APIARY_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

// ── Pending Inspections ────────────────────────────────────────────────────────

export async function savePendingInspection(data: Omit<PendingInspection, 'synced' | 'created_local'>) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx    = db.transaction(PENDING_STORE, 'readwrite')
    const store = tx.objectStore(PENDING_STORE)
    store.put({ ...data, synced: false, created_local: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getPendingInspections(): Promise<PendingInspection[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(PENDING_STORE, 'readonly')
    const store = tx.objectStore(PENDING_STORE)
    const req   = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

export async function deletePendingInspection(id: string) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx    = db.transaction(PENDING_STORE, 'readwrite')
    const store = tx.objectStore(PENDING_STORE)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

// ── Cached Hives ────────────────────────────────────────────────────────────────

export async function setCachedHives(hives: CachedHive[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(HIVE_STORE, 'readwrite')
    const store = tx.objectStore(HIVE_STORE)
    store.clear()
    hives.forEach(h => store.put(h))
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getCachedHives(): Promise<CachedHive[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(HIVE_STORE, 'readonly')
    const store = tx.objectStore(HIVE_STORE)
    const req   = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

// ── Cached Inspections ─────────────────────────────────────────────────────────

export async function setCachedInspections(inspections: CachedInspection[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(INSP_STORE, 'readwrite')
    const store = tx.objectStore(INSP_STORE)
    store.clear()
    inspections.forEach(i => store.put(i))
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getCachedInspections(): Promise<CachedInspection[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(INSP_STORE, 'readonly')
    const store = tx.objectStore(INSP_STORE)
    const req   = store.getAll()
    req.onsuccess = () =>
      resolve(
        (req.result as CachedInspection[]).sort(
          (a, b) => new Date(b.inspected_at).getTime() - new Date(a.inspected_at).getTime()
        )
      )
    req.onerror = () => reject(req.error)
  })
}

export async function getCachedInspection(id: string): Promise<CachedInspection | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(INSP_STORE, 'readonly')
    const store = tx.objectStore(INSP_STORE)
    const req   = store.get(id)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror   = () => reject(req.error)
  })
}

// ── Pending Apiary Inspections ─────────────────────────────────────────────────

export async function savePendingApiaryInspection(
  data: Omit<PendingApiaryInspection, 'synced' | 'created_local'>
): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(PENDING_APIARY_STORE, 'readwrite')
    const store = tx.objectStore(PENDING_APIARY_STORE)
    store.put({ ...data, synced: false, created_local: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getPendingApiaryInspections(): Promise<PendingApiaryInspection[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(PENDING_APIARY_STORE, 'readonly')
    const store = tx.objectStore(PENDING_APIARY_STORE)
    const req   = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

export async function deletePendingApiaryInspection(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(PENDING_APIARY_STORE, 'readwrite')
    const store = tx.objectStore(PENDING_APIARY_STORE)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

// ── Cached Apiaries ────────────────────────────────────────────────────────────

export async function setCachedApiaries(apiaries: CachedApiary[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(APIARY_STORE, 'readwrite')
    const store = tx.objectStore(APIARY_STORE)
    store.clear()
    apiaries.forEach(a => store.put(a))
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getCachedApiaries(): Promise<CachedApiary[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(APIARY_STORE, 'readonly')
    const store = tx.objectStore(APIARY_STORE)
    const req   = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}
