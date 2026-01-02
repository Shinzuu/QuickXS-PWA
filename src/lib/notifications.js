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

// Event Notifications
export function scheduleEventNotifications(events) {
  if (notificationPermission !== 'granted') return

  const now = new Date()

  events.forEach(event => {
    if (event.is_completed) return // Skip completed events

    const eventDate = new Date(event.date + 'T' + event.time)
    const msUntilEvent = eventDate.getTime() - now.getTime()

    // Notification timings for events
    const eventNotificationTimings = [
      { time: 24 * 60 * 60 * 1000, label: '1 day' },      // 1 day before
      { time: 3 * 60 * 60 * 1000, label: '3 hours' },     // 3 hours before
      { time: 30 * 60 * 1000, label: '30 minutes' }       // 30 minutes before
    ]

    eventNotificationTimings.forEach(({ time, label }) => {
      const notifyTime = msUntilEvent - time

      // Only schedule if in the future and within next 7 days
      if (notifyTime > 0 && notifyTime < 7 * 24 * 60 * 60 * 1000) {
        const timeoutId = setTimeout(() => {
          showEventNotification(event, label)
        }, notifyTime)

        scheduledNotifications.set(`event-${event.id}-${label}`, timeoutId)
      }
    })

    // On the day notification (morning)
    const eventDayMorning = new Date(event.date + 'T08:00:00')
    const msUntilMorning = eventDayMorning.getTime() - now.getTime()

    if (msUntilMorning > 0 && msUntilMorning < 7 * 24 * 60 * 60 * 1000) {
      const timeoutId = setTimeout(() => {
        showEventDayNotification(event)
      }, msUntilMorning)

      scheduledNotifications.set(`event-day-${event.id}`, timeoutId)
    }
  })
}

function showEventNotification(event, timeBefore) {
  if (notificationPermission !== 'granted') return

  const urgent = event.priority === 'urgent' || timeBefore === '30 minutes'
  const eventTypeEmoji = {
    'CT': '📝',
    'Mid': '📘',
    'Final': '📕',
    'Assignment': '📋',
    'Lab': '🔬',
    'Submission': '📤',
    'Announcement': '📢'
  }

  const emoji = eventTypeEmoji[event.event_type] || '📌'
  const title = urgent ? `⚠️ ${event.event_type} Due Soon!` : `${emoji} Upcoming ${event.event_type}`
  const body = `${event.name} is due in ${timeBefore}\n${event.info || 'No additional details'}`

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `event-${event.id}`,
    requireInteraction: urgent,
    vibrate: urgent ? [200, 100, 200, 100, 200] : [100, 50, 100],
    data: {
      event,
      url: window.location.href
    }
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  if (!urgent) {
    setTimeout(() => notification.close(), 15000)
  }
}

function showEventDayNotification(event) {
  if (notificationPermission !== 'granted') return

  const eventTypeEmoji = {
    'CT': '📝',
    'Mid': '📘',
    'Final': '📕',
    'Assignment': '📋',
    'Lab': '🔬',
    'Submission': '📤',
    'Announcement': '📢'
  }

  const emoji = eventTypeEmoji[event.event_type] || '📌'
  const timeText = formatTime(event.time)
  const title = `${emoji} Today: ${event.event_type}`
  const body = `Don't forget! ${event.name} at ${timeText}\n${event.info || ''}`

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `event-today-${event.id}`,
    requireInteraction: event.priority === 'urgent',
    vibrate: [200, 100, 200],
    data: {
      event,
      url: window.location.href
    }
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  setTimeout(() => notification.close(), 20000)
}

// Daily summary notification (morning briefing)
export function scheduleDailySummary(todayClasses, todayEvents) {
  if (notificationPermission !== 'granted') return

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(7, 0, 0, 0) // 7 AM tomorrow

  const msUntilSummary = tomorrow.getTime() - now.getTime()

  if (msUntilSummary > 0) {
    const timeoutId = setTimeout(() => {
      showDailySummary(todayClasses, todayEvents)
    }, msUntilSummary)

    scheduledNotifications.set('daily-summary', timeoutId)
  }
}

function showDailySummary(classes, events) {
  if (notificationPermission !== 'granted') return

  const classCount = classes.length
  const eventCount = events.filter(e => !e.is_completed).length

  let title = '☀️ Good Morning!'
  let body = 'Your day at a glance:\n'

  if (classCount > 0) {
    body += `📚 ${classCount} class${classCount > 1 ? 'es' : ''} today\n`
  }

  if (eventCount > 0) {
    body += `📋 ${eventCount} event${eventCount > 1 ? 's' : ''} due today\n`
  }

  if (classCount === 0 && eventCount === 0) {
    body = 'No classes or events scheduled today. Enjoy your day! 🎉'
  } else {
    body += '\nTap to view your schedule'
  }

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'daily-summary',
    requireInteraction: false,
    vibrate: [100, 50, 100],
    data: {
      url: window.location.href
    }
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  setTimeout(() => notification.close(), 30000)
}
