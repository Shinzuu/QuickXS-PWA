// Utility functions for time calculations and formatting

/**
 * Get current day of week (Saturday-Wednesday university week)
 */
export function getCurrentDay() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get current time in minutes since midnight
 */
export function getCurrentTimeInMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/**
 * Check if a class is happening now
 */
export function isClassHappeningNow(classTime, duration) {
  const now = getCurrentTimeInMinutes()
  const start = timeToMinutes(classTime)
  const end = start + duration

  return now >= start && now < end
}

/**
 * Check if a class is upcoming (within next 2 hours)
 */
export function isClassUpcoming(classTime, withinMinutes = 120) {
  const now = getCurrentTimeInMinutes()
  const start = timeToMinutes(classTime)
  const diff = start - now

  return diff > 0 && diff <= withinMinutes
}

/**
 * Check if a class is completed
 */
export function isClassCompleted(classTime, duration) {
  const now = getCurrentTimeInMinutes()
  const end = timeToMinutes(classTime) + duration

  return now >= end
}

/**
 * Get time until class starts (in minutes)
 */
export function getTimeUntilClass(classTime) {
  const now = getCurrentTimeInMinutes()
  const start = timeToMinutes(classTime)
  return start - now
}

/**
 * Get time remaining in class (in minutes)
 */
export function getTimeRemainingInClass(classTime, duration) {
  const now = getCurrentTimeInMinutes()
  const end = timeToMinutes(classTime) + duration
  return end - now
}

/**
 * Format minutes to human-readable string
 * e.g., 65 -> "1h 5m", 30 -> "30m"
 */
export function formatMinutes(minutes) {
  if (minutes < 0) return '0m'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Format time for display (convert 24h to 12h format)
 * e.g., "14:30" -> "02:30 PM"
 */
export function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Get days until a date
 */
export function getDaysUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return diff
}

/**
 * Format date for display
 * e.g., "2025-08-23" -> "Aug 23"
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return `${months[date.getMonth()]} ${date.getDate()}`
}

/**
 * Format countdown for events
 * e.g., 1 -> "Tomorrow", 0 -> "Today", -1 -> "Yesterday"
 */
export function formatCountdown(daysUntil) {
  if (daysUntil === 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  if (daysUntil === -1) return 'Yesterday'
  if (daysUntil < 0) return `${Math.abs(daysUntil)} days ago`
  if (daysUntil <= 7) return `${daysUntil} days`

  const weeks = Math.floor(daysUntil / 7)
  if (weeks === 1) return '1 week'
  return `${weeks} weeks`
}

/**
 * Check if event is urgent (within 48 hours)
 */
export function isEventUrgent(dateStr) {
  const daysUntil = getDaysUntil(dateStr)
  return daysUntil >= 0 && daysUntil < 2
}

/**
 * Find free periods between classes (gaps > 60 minutes)
 */
export function findFreePeriods(classes) {
  if (!classes || classes.length < 2) return []

  const sortedClasses = [...classes].sort((a, b) =>
    timeToMinutes(a.time) - timeToMinutes(b.time)
  )

  const gaps = []
  for (let i = 0; i < sortedClasses.length - 1; i++) {
    const current = sortedClasses[i]
    const next = sortedClasses[i + 1]

    const currentEnd = timeToMinutes(current.time) + current.duration
    const nextStart = timeToMinutes(next.time)
    const gapMinutes = nextStart - currentEnd

    if (gapMinutes >= 60) {
      gaps.push({
        start: minutesToTime(currentEnd),
        end: next.time,
        duration: gapMinutes
      })
    }
  }

  return gaps
}

/**
 * Convert minutes since midnight back to time string
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Get week days (Saturday to Wednesday)
 */
export function getWeekDays() {
  return ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']
}

/**
 * Check if today is a university day
 */
export function isUniversityDay() {
  return getWeekDays().includes(getCurrentDay())
}
