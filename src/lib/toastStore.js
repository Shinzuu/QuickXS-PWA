import { writable } from 'svelte/store'

function createToastStore() {
  const { subscribe, update } = writable([])

  let idCounter = 0

  return {
    subscribe,
    add: (message, type = 'info', title = '', duration = 5000) => {
      const id = idCounter++
      const toast = { id, message, type, title }

      update(toasts => [...toasts, toast])

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          update(toasts => toasts.filter(t => t.id !== id))
        }, duration)
      }

      return id
    },
    remove: (id) => {
      update(toasts => toasts.filter(t => t.id !== id))
    },
    clear: () => {
      update(() => [])
    },
    // Convenience methods
    success: (message, title = 'Success', duration = 4000) => {
      return createToastStore.add(message, 'success', title, duration)
    },
    error: (message, title = 'Error', duration = 6000) => {
      return createToastStore.add(message, 'error', title, duration)
    },
    warning: (message, title = 'Warning', duration = 5000) => {
      return createToastStore.add(message, 'warning', title, duration)
    },
    info: (message, title = '', duration = 4000) => {
      return createToastStore.add(message, 'info', title, duration)
    }
  }
}

export const toasts = createToastStore()
