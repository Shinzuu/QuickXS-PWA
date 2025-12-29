import { writable, get } from 'svelte/store'
import { supabase } from '../supabase'

export const adminUser = writable(null)
export const isAdmin = writable(false)
export const authLoading = writable(true)

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  adminUser.set(data.user)
  isAdmin.set(true)

  return data
}

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Logout error:', error)

  adminUser.set(null)
  isAdmin.set(false)
}

export async function checkAdminSession() {
  authLoading.set(true)

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) throw error

    if (session?.user) {
      adminUser.set(session.user)
      isAdmin.set(true)
    } else {
      adminUser.set(null)
      isAdmin.set(false)
    }
  } catch (error) {
    console.error('Session check error:', error)
    adminUser.set(null)
    isAdmin.set(false)
  } finally {
    authLoading.set(false)
  }
}

// Initialize auth check
checkAdminSession()

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    adminUser.set(session.user)
    isAdmin.set(true)
  } else {
    adminUser.set(null)
    isAdmin.set(false)
  }
})
