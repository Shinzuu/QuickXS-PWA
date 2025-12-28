// Widget Service - Generates data for PWA widgets
import { get } from 'svelte/store';
import { routines, events } from './store.js';
import { parseTime, isToday, isTomorrow } from './utils.js';

/**
 * Generate widget data JSON for consumption by widget HTML files
 * This data is written to public/widget-data.json
 */
export function generateWidgetData() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

  const allRoutines = get(routines);
  const allEvents = get(events);

  // Get today's classes
  const todayClasses = allRoutines
    .filter(r => r.day === currentDay)
    .map(r => {
      const classTime = parseTime(r.time);
      const endTime = new Date(classTime.getTime() + (r.duration || 75) * 60000);
      const minutesUntil = Math.floor((classTime - now) / 60000);
      const minutesUntilEnd = Math.floor((endTime - now) / 60000);

      return {
        ...r,
        classTime,
        endTime,
        minutesUntil,
        minutesUntilEnd,
        isNow: now >= classTime && now < endTime,
        isSoon: minutesUntil > 0 && minutesUntil <= 30,
        isCompleted: now >= endTime
      };
    })
    .sort((a, b) => a.classTime - b.classTime);

  // Find current and next class
  const currentClass = todayClasses.find(c => c.isNow);
  const nextClass = todayClasses.find(c => c.minutesUntil > 0);

  // Get upcoming events (not completed, sorted by date)
  const upcomingEvents = allEvents
    .filter(e => !e.is_completed)
    .map(e => {
      const eventDate = new Date(e.date);
      const daysUntil = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));

      return {
        ...e,
        eventDate,
        daysUntil,
        isToday: isToday(eventDate),
        isTomorrow: isTomorrow(eventDate),
        isUrgent: daysUntil >= 0 && daysUntil <= 2
      };
    })
    .filter(e => e.daysUntil >= 0) // Only future events
    .sort((a, b) => a.eventDate - b.eventDate);

  return {
    currentClass: currentClass ? {
      subject: currentClass.subject,
      teacher: currentClass.teacher,
      classroom: currentClass.classroom,
      time: currentClass.time,
      duration: currentClass.duration,
      minutesUntil: currentClass.minutesUntil,
      minutesUntilEnd: currentClass.minutesUntilEnd
    } : null,

    nextClass: nextClass ? {
      subject: nextClass.subject,
      teacher: nextClass.teacher,
      classroom: nextClass.classroom,
      time: nextClass.time,
      duration: nextClass.duration,
      minutesUntil: nextClass.minutesUntil
    } : null,

    todayClasses: todayClasses.map(c => ({
      subject: c.subject,
      teacher: c.teacher,
      classroom: c.classroom,
      time: c.time,
      duration: c.duration,
      isCompleted: c.isCompleted
    })),

    upcomingEvents: upcomingEvents.slice(0, 5).map(e => ({
      name: e.name,
      info: e.info,
      event_type: e.event_type,
      date: e.date,
      time: e.time,
      daysUntil: e.daysUntil,
      isUrgent: e.isUrgent
    })),

    lastUpdated: now.toISOString()
  };
}

/**
 * Write widget data to a JSON file
 * This should be called periodically and on data updates
 */
export async function updateWidgetData() {
  const widgetData = generateWidgetData();

  try {
    // In production, this would write to public/widget-data.json
    // For now, we'll store in localStorage as a fallback
    localStorage.setItem('quickxs-widget-data', JSON.stringify(widgetData));

    // If service worker is available, post message to update
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_WIDGET_DATA',
        data: widgetData
      });
    }

    return widgetData;
  } catch (error) {
    console.error('Failed to update widget data:', error);
    return null;
  }
}

/**
 * Initialize widget data updates
 * Should be called on app start
 */
export function initWidgetService() {
  // Update immediately
  updateWidgetData();

  // Update every 1 minute
  setInterval(updateWidgetData, 60000);

  // Update when data changes (listen to store changes)
  routines.subscribe(() => updateWidgetData());
  events.subscribe(() => updateWidgetData());

  // Update when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateWidgetData();
    }
  });
}
