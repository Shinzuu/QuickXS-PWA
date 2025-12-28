// Notification utilities for upcoming classes
import { get } from 'svelte/store'
import { notificationSettings } from './notificationSettings'

let notificationPermission = 'default'
let scheduledNotifications = new Map()

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    notificationPermission = 'granted'
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    notificationPermission = permission
    return permission === 'granted'
  }

  return false
}

export function scheduleClassNotifications(classes) {
  // Clear existing notifications
  scheduledNotifications.forEach(timeout => clearTimeout(timeout))
  scheduledNotifications.clear()

  const settings = get(notificationSettings)
  if (!settings.enabled || notificationPermission !== 'granted') return

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  classes.forEach(classItem => {
    const [hour, min] = classItem.time.split(':').map(Number)
    const classTime = hour * 60 + min

    // Schedule notifications based on custom timings
    settings.timings.forEach((minutesBefore) => {
      const notifyTime = classTime - minutesBefore
      const timeUntilNotify = (notifyTime - currentTime) * 60 * 1000

      // Only schedule if the notification time is in the future and within the next 12 hours
      if (timeUntilNotify > 0 && timeUntilNotify < 12 * 60 * 60 * 1000) {
        const timeoutId = setTimeout(() => {
          showClassNotification(classItem, minutesBefore)
        }, timeUntilNotify)

        scheduledNotifications.set(`${classItem.id}-${minutesBefore}min`, timeoutId)
      }
    })
  })
}

function showClassNotification(classItem, minutesBefore) {
  if (notificationPermission !== 'granted') return

  const settings = get(notificationSettings)
  const timeText = formatTime(classItem.time)
  const urgent = minutesBefore <= 5
  const title = urgent ? `⚠️ Class Starting Soon!` : `📚 Upcoming Class`
  const body = `${classItem.subject} starts in ${minutesBefore} minute${minutesBefore > 1 ? 's' : ''} at ${timeText} in Room ${classItem.classroom}`

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `class-${classItem.id}`,
    requireInteraction: urgent,
    vibrate: settings.vibrate ? (urgent ? [200, 100, 200] : [100]) : [],
    silent: !settings.sound,
    data: {
      classItem,
      url: window.location.href
    }
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  // Auto-close after 10 seconds if not urgent
  if (!urgent) {
    setTimeout(() => notification.close(), 10000)
  }
}

function formatTime(time24) {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`
}

export function clearAllNotifications() {
  scheduledNotifications.forEach(timeout => clearTimeout(timeout))
  scheduledNotifications.clear()
}
