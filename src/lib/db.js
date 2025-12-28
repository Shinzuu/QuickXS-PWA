import { openDB } from 'idb'

const DB_NAME = 'quickxs-cache'
const DB_VERSION = 1

// Initialize IndexedDB for offline caching
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores for each table
      if (!db.objectStoreNames.contains('routines')) {
        db.createObjectStore('routines', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('links')) {
        db.createObjectStore('links', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' })
      }
    }
  })
}

// Cache management utilities
export const cache = {
  async set(storeName, data) {
    const db = await initDB()
    const tx = db.transaction(storeName, 'readwrite')

    // Clear existing data
    await tx.store.clear()

    // Add new data
    for (const item of data) {
      await tx.store.add(item)
    }

    await tx.done

    // Update metadata with timestamp
    await this.setMetadata(`${storeName}_updated_at`, new Date().toISOString())
  },

  async get(storeName) {
    const db = await initDB()
    return await db.getAll(storeName)
  },

  async setMetadata(key, value) {
    const db = await initDB()
    await db.put('metadata', { key, value })
  },

  async getMetadata(key) {
    const db = await initDB()
    const result = await db.get('metadata', key)
    return result?.value
  },

  async getLastUpdated(storeName) {
    return await this.getMetadata(`${storeName}_updated_at`)
  }
}
