import { writable, derived } from 'svelte/store'
import { supabase } from './supabase'
import { cache } from './db'
import { getCurrentDay, isClassHappeningNow, isClassUpcoming, isClassCompleted, getTimeUntilClass } from './utils'

// Core data stores
export const routines = writable([])
export const events = writable([])
export const links = writable([])

// UI state
export const isLoading = writable(false)
export const initialLoad = writable(true) // For showing skeleton on first load
export const isOffline = writable(!navigator.onLine)
export const lastUpdated = writable(null)
export const focusMode = writable(false)

// Derived stores
export const todayClasses = derived(
  routines,
  ($routines) => {
    const today = getCurrentDay()
    return $routines
      .filter(r => r.day === today)
      .sort((a, b) => a.time.localeCompare(b.time))
  }
)

export const currentClass = derived(
  todayClasses,
  ($todayClasses) => {
    return $todayClasses.find(c => isClassHappeningNow(c.time, c.duration))
  }
)

export const nextClass = derived(
  todayClasses,
  ($todayClasses) => {
    const upcoming = $todayClasses
      .filter(c => !isClassHappeningNow(c.time, c.duration) && !isClassCompleted(c.time, c.duration))
      .sort((a, b) => getTimeUntilClass(a.time) - getTimeUntilClass(b.time))

    return upcoming[0] || null
  }
)

export const upcomingEvents = derived(
  events,
  ($events) => {
    const now = new Date()
    return $events
      .filter(e => new Date(e.date) >= now && !e.is_completed)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }
)

// Data fetching functions
export async function fetchRoutines() {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('day')

    if (error) throw error

    routines.set(data)
    await cache.set('routines', data)
    await updateLastUpdated()

    return data
  } catch (error) {
    console.error('Error fetching routines:', error)
    // Load from cache on error
    const cached = await cache.get('routines')
    if (cached.length > 0) {
      routines.set(cached)
    }
    return cached
  }
}

export async function fetchEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date')

    if (error) throw error

    events.set(data)
    await cache.set('events', data)
    await updateLastUpdated()

    return data
  } catch (error) {
    console.error('Error fetching events:', error)
    const cached = await cache.get('events')
    if (cached.length > 0) {
      events.set(cached)
    }
    return cached
  }
}

export async function fetchLinks() {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('name')

    if (error) throw error

    links.set(data)
    await cache.set('links', data)
    await updateLastUpdated()

    return data
  } catch (error) {
    console.error('Error fetching links:', error)
    const cached = await cache.get('links')
    if (cached.length > 0) {
      links.set(cached)
    }
    return cached
  }
}

export async function fetchAllData(showLoadingIndicator = false) {
  if (showLoadingIndicator) {
    isLoading.set(true)
  }

  try {
    await Promise.all([
      fetchRoutines(),
      fetchEvents(),
      fetchLinks()
    ])
    initialLoad.set(false) // Data loaded, hide skeleton
  } finally {
    isLoading.set(false)
  }
}

async function updateLastUpdated() {
  const timestamp = new Date().toISOString()
  lastUpdated.set(timestamp)
  await cache.setMetadata('last_updated', timestamp)
}

// Load cached data on startup
export async function loadCachedData() {
  const [cachedRoutines, cachedEvents, cachedLinks, lastUpdate] = await Promise.all([
    cache.get('routines'),
    cache.get('events'),
    cache.get('links'),
    cache.getMetadata('last_updated')
  ])

  if (cachedRoutines.length > 0) routines.set(cachedRoutines)
  if (cachedEvents.length > 0) events.set(cachedEvents)
  if (cachedLinks.length > 0) links.set(cachedLinks)
  if (lastUpdate) lastUpdated.set(lastUpdate)

  // If we have cached data, hide skeleton immediately
  if (cachedRoutines.length > 0 || cachedEvents.length > 0) {
    initialLoad.set(false)
  }
}

// Listen to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOffline.set(false)
    fetchAllData() // Auto-refresh when back online
  })

  window.addEventListener('offline', () => {
    isOffline.set(true)
  })
}
