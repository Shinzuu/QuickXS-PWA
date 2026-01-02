<script>
  import { events, routines } from '../lib/store'
  import { formatTime } from '../lib/utils'

  let currentDate = $state(new Date())
  let selectedDate = $state(null)
  let showDayModal = $state(false)
  let previousOverflow = ''

  // Get current month/year
  let currentMonth = $derived(currentDate.getMonth())
  let currentYear = $derived(currentDate.getFullYear())

  // Month names
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Get calendar days for current month
  let calendarDays = $derived.by(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month days (grayed out)
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(currentYear, currentMonth, -startingDayOfWeek + i + 1)
      days.push({ date: prevMonthDay, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i)
      days.push({ date, isCurrentMonth: true })
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(currentYear, currentMonth + 1, i)
      days.push({ date: nextMonthDay, isCurrentMonth: false })
    }

    return days
  })

  // Get events for a specific date
  function getEventsForDate(date) {
    const dateString = date.toISOString().split('T')[0]
    return $events.filter(e => e.date === dateString)
  }

  // Get classes for a specific date
  function getClassesForDate(date) {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
    return $routines.filter(r => r.day === dayName).sort((a, b) => a.time.localeCompare(b.time))
  }

  // Check if date is today
  function isToday(date) {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Check if date has events or classes
  function hasActivity(date) {
    return getEventsForDate(date).length > 0 || getClassesForDate(date).length > 0
  }

  function previousMonth() {
    currentDate = new Date(currentYear, currentMonth - 1, 1)
  }

  function nextMonth() {
    currentDate = new Date(currentYear, currentMonth + 1, 1)
  }

  function goToToday() {
    currentDate = new Date()
  }

  function openDayModal(date) {
    selectedDate = date
    showDayModal = true
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function closeDayModal() {
    showDayModal = false
    selectedDate = null
    document.body.style.overflow = previousOverflow
  }

  function getEventTypeIcon(eventType) {
    const icons = {
      CT: '📝',
      Mid: '📘',
      Final: '📕',
      Assignment: '📋',
      Lab: '🔬',
      Submission: '📤',
      Announcement: '📢'
    }
    return icons[eventType] || '📌'
  }
</script>

<div class="calendar-container">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-2xl font-bold" style="color: var(--color-accent);">📅 Calendar</h2>
      <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
        {monthNames[currentMonth]} {currentYear}
      </p>
    </div>
    <div class="flex gap-2">
      <button
        onclick={previousMonth}
        class="px-3 py-2 rounded-lg transition-all hover:scale-105"
        style="background-color: var(--color-card); color: var(--color-text);"
      >
        ◀
      </button>
      <button
        onclick={goToToday}
        class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
        style="background-color: var(--color-accent); color: var(--color-bg);"
      >
        Today
      </button>
      <button
        onclick={nextMonth}
        class="px-3 py-2 rounded-lg transition-all hover:scale-105"
        style="background-color: var(--color-card); color: var(--color-text);"
      >
        ▶
      </button>
    </div>
  </div>

  <!-- Day headers -->
  <div class="grid grid-cols-7 gap-2 mb-2">
    {#each dayNames as dayName}
      <div class="text-center font-bold py-2" style="color: var(--color-text); opacity: 0.7;">
        {dayName}
      </div>
    {/each}
  </div>

  <!-- Calendar grid -->
  <div class="grid grid-cols-7 gap-2">
    {#each calendarDays as { date, isCurrentMonth }}
      {@const dayEvents = getEventsForDate(date)}
      {@const dayClasses = getClassesForDate(date)}
      {@const today = isToday(date)}
      {@const active = hasActivity(date)}

      <button
        onclick={() => (isCurrentMonth || active) && openDayModal(date)}
        class="calendar-day aspect-square rounded-lg p-2 transition-all hover:scale-105 relative"
        style="
          background-color: {today ? 'var(--color-accent)' : 'var(--color-card)'};
          color: {today ? 'var(--color-bg)' : 'var(--color-text)'};
          opacity: {isCurrentMonth ? '1' : '0.3'};
          border: 2px solid {active ? 'var(--color-accent)' : 'transparent'};
          cursor: {isCurrentMonth || active ? 'pointer' : 'default'};
        "
      >
        <div class="text-sm font-bold mb-1">{date.getDate()}</div>

        <!-- Activity indicators -->
        {#if active}
          <div class="flex flex-wrap gap-0.5 mt-1">
            {#if dayClasses.length > 0}
              <span class="text-xs px-1 rounded" style="background-color: {today ? 'var(--color-bg)' : 'var(--color-accent)'}; color: {today ? 'var(--color-accent)' : 'var(--color-bg)'};">
                {dayClasses.length}📚
              </span>
            {/if}
            {#if dayEvents.length > 0}
              <span class="text-xs px-1 rounded bg-red-600 text-white">
                {dayEvents.length}📋
              </span>
            {/if}
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Legend -->
  <div class="flex gap-4 mt-6 p-4 rounded-lg" style="background-color: var(--color-card);">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded" style="background-color: var(--color-accent);"></div>
      <span class="text-sm" style="color: var(--color-text);">Today</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs px-2 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">📚</span>
      <span class="text-sm" style="color: var(--color-text);">Classes</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs px-2 py-1 rounded bg-red-600 text-white">📋</span>
      <span class="text-sm" style="color: var(--color-text);">Events</span>
    </div>
  </div>
</div>

<!-- Day Detail Modal -->
{#if showDayModal && selectedDate}
  {@const dayEvents = getEventsForDate(selectedDate)}
  {@const dayClasses = getClassesForDate(selectedDate)}

  <div
    class="fixed inset-0 flex items-center justify-center p-4"
    style="z-index: 9999;"
    onclick={closeDayModal}
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
      style="background-color: var(--color-card);"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold mb-1" style="color: var(--color-accent);">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
            {dayClasses.length} classes • {dayEvents.length} events
          </p>
        </div>
        <button onclick={closeDayModal} class="text-2xl" style="color: var(--color-text);">✕</button>
      </div>

      <!-- Classes Section -->
      {#if dayClasses.length > 0}
        <div class="mb-6">
          <h3 class="font-bold mb-3 flex items-center gap-2" style="color: var(--color-text);">
            <span class="text-xl">📚</span> Classes ({dayClasses.length})
          </h3>
          <div class="space-y-2">
            {#each dayClasses as classItem}
              <div class="p-3 rounded-lg" style="background-color: var(--color-bg);">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold" style="color: var(--color-text);">{classItem.subject}</h4>
                  <span class="text-sm" style="color: var(--color-accent);">{formatTime(classItem.time)}</span>
                </div>
                <div class="flex gap-3 text-sm" style="color: var(--color-text); opacity: 0.8;">
                  <span>👨‍🏫 {classItem.teacher}</span>
                  <span>🏫 {classItem.classroom}</span>
                  <span>⏱️ {classItem.duration}min</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Events Section -->
      {#if dayEvents.length > 0}
        <div>
          <h3 class="font-bold mb-3 flex items-center gap-2" style="color: var(--color-text);">
            <span class="text-xl">📋</span> Events ({dayEvents.length})
          </h3>
          <div class="space-y-2">
            {#each dayEvents as event}
              <div class="p-3 rounded-lg" style="background-color: var(--color-bg);">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{getEventTypeIcon(event.event_type)}</span>
                    <div>
                      <h4 class="font-bold" style="color: var(--color-text);">{event.name}</h4>
                      <div class="flex gap-2 mt-1">
                        <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: var(--color-accent); color: var(--color-bg);">
                          {event.event_type}
                        </span>
                        {#if event.priority === 'urgent'}
                          <span class="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white">
                            Urgent
                          </span>
                        {/if}
                      </div>
                    </div>
                  </div>
                  <span class="text-sm whitespace-nowrap" style="color: var(--color-accent);">{formatTime(event.time)}</span>
                </div>
                {#if event.info}
                  <p class="text-sm mt-2" style="color: var(--color-text); opacity: 0.8;">{event.info}</p>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Empty state -->
      {#if dayClasses.length === 0 && dayEvents.length === 0}
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-xl font-bold mb-2" style="color: var(--color-accent);">Free Day!</h3>
          <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
            No classes or events scheduled for this day
          </p>
        </div>
      {/if}

      <button
        onclick={closeDayModal}
        class="w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-all hover:scale-105"
        style="background-color: var(--color-accent); color: var(--color-bg);"
      >
        Close
      </button>
    </div>
  </div>
{/if}

<style>
  .calendar-day {
    min-height: 80px;
  }

  @media (max-width: 768px) {
    .calendar-day {
      min-height: 60px;
      padding: 0.5rem;
    }
  }
</style>
