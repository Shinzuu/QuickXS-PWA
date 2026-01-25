import { writable } from 'svelte/store'

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('notificationSettings')
    return saved ? JSON.parse(saved) : {
      enabled: true,
      classReminderMinutes: 5, // Minutes before class
      eventReminderMinutes: 1440, // Minutes before event (1 day = 1440 mins)
      sound: true,
      vibrate: true
    }
  } catch (e) {
    console.error('Failed to load notification settings:', e)
    return {
      enabled: true,
      classReminderMinutes: 5,
      eventReminderMinutes: 1440,
      sound: true,
      vibrate: true
    }
  }
}

export const notificationSettings = writable(loadSettings())

// Subscribe to save to localStorage - skip first run to avoid loop
let isFirstRun = true
notificationSettings.subscribe(settings => {
  if (isFirstRun) {
    isFirstRun = false
    return
  }

  try {
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save notification settings:', e)
  }
})

export function updateNotificationSettings(newSettings) {
  notificationSettings.set(newSettings)
}
