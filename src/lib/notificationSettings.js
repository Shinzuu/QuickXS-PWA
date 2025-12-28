import { writable } from 'svelte/store'

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('notificationSettings')
    return saved ? JSON.parse(saved) : {
      enabled: true,
      timings: [10, 2], // Minutes before class
      sound: true,
      vibrate: true
    }
  } catch (e) {
    console.error('Failed to load notification settings:', e)
    return {
      enabled: true,
      timings: [10, 2],
      sound: true,
      vibrate: true
    }
  }
}

export const notificationSettings = writable(loadSettings())

// Subscribe to save to localStorage
notificationSettings.subscribe(settings => {
  try {
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save notification settings:', e)
  }
})

export function updateNotificationSettings(newSettings) {
  notificationSettings.set(newSettings)
}
