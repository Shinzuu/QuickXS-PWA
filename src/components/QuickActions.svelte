<script>
  import { currentTheme } from '../lib/themeStore'
  import { currentClass, nextClass, upcomingEvents } from '../lib/store'

  let showMenu = $state(false)

  function addToCalendar() {
    const event = $currentClass || $nextClass || $upcomingEvents[0]
    if (!event) {
      alert('No upcoming class or event to add')
      return
    }

    // Create iCal format
    const icsContent = createICSContent(event)
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.subject || event.name}.ics`
    a.click()
    URL.revokeObjectURL(url)
    showMenu = false
  }

  function createICSContent(event) {
    const now = new Date()
    const dateStr = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    // Handle both class and event formats
    const title = event.subject || event.name
    const location = event.classroom ? `Room ${event.classroom}` : ''
    const description = event.teacher ? `Teacher: ${event.teacher}` : (event.info || '')

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//QuickXS//Class Schedule//EN
BEGIN:VEVENT
UID:${dateStr}@quickxs
DTSTAMP:${dateStr}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`
  }

  async function setReminder() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const event = $currentClass || $nextClass || $upcomingEvents[0]
        if (event) {
          new Notification('Reminder Set!', {
            body: `You'll be notified about ${event.subject || event.name}`,
            icon: '/favicon.ico'
          })
        }
      }
    }
    showMenu = false
  }

  function refreshSchedule() {
    window.location.reload()
    showMenu = false
  }

  function shareSchedule() {
    const text = `Check out my QuickXS schedule!`
    if (navigator.share) {
      navigator.share({ text, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
    showMenu = false
  }
</script>

<!-- Floating Action Button -->
<div class="quick-actions">
  <button
    onclick={() => showMenu = !showMenu}
    class="fab-main p-4 rounded-full shadow-lg transition-all"
    style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
    aria-label="Quick actions"
  >
    {#if showMenu}
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    {:else}
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    {/if}
  </button>

  {#if showMenu}
    <div class="fab-menu">
      <button
        onclick={addToCalendar}
        class="fab-item p-3 rounded-full shadow-lg transition-all"
        style="background-color: {$currentTheme.card}; color: {$currentTheme.text};"
        title="Add to Calendar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <button
        onclick={setReminder}
        class="fab-item p-3 rounded-full shadow-lg transition-all"
        style="background-color: {$currentTheme.card}; color: {$currentTheme.text};"
        title="Set Reminder"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      <button
        onclick={refreshSchedule}
        class="fab-item p-3 rounded-full shadow-lg transition-all"
        style="background-color: {$currentTheme.card}; color: {$currentTheme.text};"
        title="Refresh"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <button
        onclick={shareSchedule}
        class="fab-item p-3 rounded-full shadow-lg transition-all"
        style="background-color: {$currentTheme.card}; color: {$currentTheme.text};"
        title="Share"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
    </div>
  {/if}
</div>

<style>
  .quick-actions {
    position: fixed;
    bottom: 80px;
    right: 24px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
  }

  .fab-main {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fab-main:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .fab-main:active {
    transform: scale(0.95);
  }

  .fab-menu {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
  }

  .fab-item {
    transition: all 0.2s ease;
  }

  .fab-item:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 20px rgba(0, 173, 181, 0.4);
  }

  .fab-item:active {
    transform: scale(0.9);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    .quick-actions {
      bottom: 70px;
      right: 16px;
    }
  }
</style>
