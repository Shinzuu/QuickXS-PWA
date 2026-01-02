<script>
  import { events, routines } from '../lib/store'

  // Calculate statistics
  let totalEvents = $derived($events.length)
  let completedEvents = $derived($events.filter(e => e.is_completed).length)
  let upcomingEvents = $derived($events.filter(e => !e.is_completed && new Date(e.date) >= new Date()).length)
  let overdueEvents = $derived($events.filter(e => !e.is_completed && new Date(e.date) < new Date()).length)

  let completionRate = $derived(totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0)

  // Events by type
  let eventsByType = $derived.by(() => {
    const types = {}
    $events.forEach(e => {
      types[e.event_type] = (types[e.event_type] || 0) + 1
    })
    return Object.entries(types).sort((a, b) => b[1] - a[1])
  })

  // Events by priority
  let urgentEvents = $derived($events.filter(e => e.priority === 'urgent' && !e.is_completed).length)
  let highEvents = $derived($events.filter(e => e.priority === 'high' && !e.is_completed).length)

  // Class statistics
  let totalClasses = $derived($routines.length)
  let subjects = $derived([...new Set($routines.map(r => r.subject))].length)

  // Classes per day
  let classesPerDay = $derived.by(() => {
    const days = {}
    $routines.forEach(r => {
      days[r.day] = (days[r.day] || 0) + 1
    })
    return Object.entries(days).sort((a, b) => {
      const order = { Saturday: 0, Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5, Friday: 6 }
      return order[a[0]] - order[b[0]]
    })
  })

  // Total study hours per week
  let weeklyStudyHours = $derived.by(() => {
    const totalMinutes = $routines.reduce((sum, r) => sum + r.duration, 0)
    return (totalMinutes / 60).toFixed(1)
  })

  // This week's events
  let thisWeekEvents = $derived.by(() => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    return $events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate >= weekStart && eventDate < weekEnd
    }).length
  })
</script>

<div class="statistics-dashboard space-y-6">
  <div>
    <h2 class="text-2xl font-bold mb-2" style="color: var(--color-accent);">📊 Statistics</h2>
    <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">Your productivity insights</p>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <!-- Total Events -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card);">
      <div class="text-3xl mb-2">📋</div>
      <div class="text-2xl font-bold" style="color: var(--color-accent);">{totalEvents}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Total Events</div>
    </div>

    <!-- Completed -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card);">
      <div class="text-3xl mb-2">✅</div>
      <div class="text-2xl font-bold text-green-500">{completedEvents}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Completed</div>
    </div>

    <!-- Upcoming -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card);">
      <div class="text-3xl mb-2">⏰</div>
      <div class="text-2xl font-bold" style="color: var(--color-accent);">{upcomingEvents}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Upcoming</div>
    </div>

    <!-- Overdue -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card);">
      <div class="text-3xl mb-2">⚠️</div>
      <div class="text-2xl font-bold text-red-500">{overdueEvents}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Overdue</div>
    </div>
  </div>

  <!-- Completion Rate -->
  <div class="p-6 rounded-lg" style="background-color: var(--color-card);">
    <h3 class="font-bold mb-4" style="color: var(--color-text);">Completion Rate</h3>
    <div class="flex items-center gap-4">
      <div class="relative w-24 h-24">
        <svg class="transform -rotate-90" viewBox="0 0 100 100">
          <!-- Background circle -->
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--color-bg)"
            stroke-width="8"
          />
          <!-- Progress circle -->
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--color-accent)"
            stroke-width="8"
            stroke-dasharray="251.2"
            stroke-dashoffset="{251.2 - (251.2 * completionRate) / 100}"
            stroke-linecap="round"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-xl font-bold" style="color: var(--color-accent);">{completionRate}%</span>
        </div>
      </div>
      <div>
        <p class="text-lg font-bold" style="color: var(--color-text);">{completedEvents} of {totalEvents} events completed</p>
        <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
          {#if completionRate >= 80}
            🎉 Excellent work!
          {:else if completionRate >= 50}
            👍 Good progress!
          {:else}
            💪 Keep going!
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Events by Type -->
  {#if eventsByType.length > 0}
    <div class="p-6 rounded-lg" style="background-color: var(--color-card);">
      <h3 class="font-bold mb-4" style="color: var(--color-text);">Events by Type</h3>
      <div class="space-y-3">
        {#each eventsByType as [type, count]}
          {@const percentage = Math.round((count / totalEvents) * 100)}
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-semibold" style="color: var(--color-text);">{type}</span>
              <span class="text-sm" style="color: var(--color-text); opacity: 0.7;">{count} ({percentage}%)</span>
            </div>
            <div class="w-full h-2 rounded-full" style="background-color: var(--color-bg);">
              <div
                class="h-full rounded-full transition-all"
                style="width: {percentage}%; background-color: var(--color-accent);"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Priority Overview -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="p-4 rounded-lg" style="background-color: var(--color-card);">
      <div class="text-2xl mb-2">🔴</div>
      <div class="text-xl font-bold text-red-500">{urgentEvents}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Urgent Tasks</div>
    </div>

    <div class="p-4 rounded-lg" style="background-color: var(--color-card);">
      <div class="text-2xl mb-2">🟡</div>
      <div class="text-xl font-bold text-yellow-500">{highEvents}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">High Priority</div>
    </div>

    <div class="p-4 rounded-lg" style="background-color: var(--color-card);">
      <div class="text-2xl mb-2">📅</div>
      <div class="text-xl font-bold" style="color: var(--color-accent);">{thisWeekEvents}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">This Week</div>
    </div>
  </div>

  <!-- Class Statistics -->
  <div class="p-6 rounded-lg" style="background-color: var(--color-card);">
    <h3 class="font-bold mb-4" style="color: var(--color-text);">Class Overview</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <div class="text-2xl font-bold" style="color: var(--color-accent);">{totalClasses}</div>
        <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Total Classes</div>
      </div>
      <div>
        <div class="text-2xl font-bold" style="color: var(--color-accent);">{subjects}</div>
        <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Subjects</div>
      </div>
      <div>
        <div class="text-2xl font-bold" style="color: var(--color-accent);">{weeklyStudyHours}h</div>
        <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Per Week</div>
      </div>
      <div>
        <div class="text-2xl font-bold" style="color: var(--color-accent);">{classesPerDay.length}</div>
        <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">School Days</div>
      </div>
    </div>
  </div>

  <!-- Classes per Day -->
  {#if classesPerDay.length > 0}
    <div class="p-6 rounded-lg" style="background-color: var(--color-card);">
      <h3 class="font-bold mb-4" style="color: var(--color-text);">Classes per Day</h3>
      <div class="space-y-2">
        {#each classesPerDay as [day, count]}
          <div class="flex items-center justify-between">
            <span style="color: var(--color-text);">{day}</span>
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                {#each Array(count) as _, i}
                  <div class="w-3 h-3 rounded-full" style="background-color: var(--color-accent);"></div>
                {/each}
              </div>
              <span class="text-sm font-semibold" style="color: var(--color-accent);">{count}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .stat-card {
    transition: transform 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-4px);
  }
</style>
