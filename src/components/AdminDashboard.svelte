<script>
  import { onMount } from 'svelte'
  import { routines, events } from '../lib/store'
  import { formatTime } from '../lib/utils'

  let stats = $state({
    total: 0,
    upcoming: 0,
    today: 0,
    overdue: 0,
    completed: 0,
    urgent: 0
  })

  let recentEvents = $state([])
  let upcomingDeadlines = $state([])

  $effect(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    stats.total = $events.length
    stats.completed = $events.filter(e => e.is_completed).length
    stats.urgent = $events.filter(e => e.priority === 'urgent' && !e.is_completed).length

    const upcoming = $events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate >= now && !e.is_completed
    })

    stats.upcoming = upcoming.length

    const todayEvents = $events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getDate() === today.getDate() &&
             eventDate.getMonth() === today.getMonth() &&
             eventDate.getFullYear() === today.getFullYear()
    })

    stats.today = todayEvents.length

    const overdue = $events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate < now && !e.is_completed
    })

    stats.overdue = overdue.length

    // Recent events (last 5 added/modified)
    recentEvents = [...$events]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 5)

    // Upcoming deadlines (next 5)
    upcomingDeadlines = upcoming
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
  })

  function getDaysUntil(dateStr) {
    const eventDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = eventDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  function getEventTypeIcon(type) {
    const icons = {
      'CT': '📝',
      'Mid': '📚',
      'Final': '🎓',
      'Assignment': '📄',
      'Lab': '🔬',
      'Submission': '📬',
      'Announcement': '📢'
    }
    return icons[type] || '📌'
  }

  function getPriorityColor(priority) {
    return {
      'urgent': '#ef4444',
      'high': '#f59e0b',
      'normal': 'var(--color-accent)',
      'low': '#6b7280'
    }[priority] || 'var(--color-accent)'
  }
</script>

<div class="dashboard p-6 space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold" style="color: var(--color-accent);">📊 Dashboard</h1>
      <p class="text-sm mt-1" style="color: var(--color-text); opacity: 0.7;">
        Overview of your schedule and events
      </p>
    </div>
    <div class="text-sm" style="color: var(--color-text); opacity: 0.6;">
      Last updated: {new Date().toLocaleTimeString()}
    </div>
  </div>

  <!-- Statistics Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Events -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card); border: 2px solid var(--color-accent);">
      <div class="flex items-center justify-between mb-2">
        <span class="text-2xl">📅</span>
        <span class="text-xs px-2 py-1 rounded-full" style="background-color: var(--color-accent); color: var(--color-bg);">
          Total
        </span>
      </div>
      <div class="text-3xl font-bold" style="color: var(--color-accent);">{stats.total}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Total Events</div>
    </div>

    <!-- Upcoming -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card); border: 2px solid #3b82f6;">
      <div class="flex items-center justify-between mb-2">
        <span class="text-2xl">⏭️</span>
        <span class="text-xs px-2 py-1 rounded-full" style="background-color: #3b82f6; color: white;">
          Pending
        </span>
      </div>
      <div class="text-3xl font-bold" style="color: #3b82f6;">{stats.upcoming}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Upcoming Events</div>
    </div>

    <!-- Completed -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card); border: 2px solid #10b981;">
      <div class="flex items-center justify-between mb-2">
        <span class="text-2xl">✅</span>
        <span class="text-xs px-2 py-1 rounded-full" style="background-color: #10b981; color: white;">
          Done
        </span>
      </div>
      <div class="text-3xl font-bold" style="color: #10b981;">{stats.completed}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Completed</div>
      <div class="text-xs mt-1" style="color: var(--color-text); opacity: 0.5;">
        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
      </div>
    </div>

    <!-- Overdue -->
    <div class="stat-card p-4 rounded-lg" style="background-color: var(--color-card); border: 2px solid #ef4444;">
      <div class="flex items-center justify-between mb-2">
        <span class="text-2xl">⚠️</span>
        <span class="text-xs px-2 py-1 rounded-full" style="background-color: #ef4444; color: white;">
          Urgent
        </span>
      </div>
      <div class="text-3xl font-bold" style="color: #ef4444;">{stats.overdue}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Overdue</div>
    </div>
  </div>

  <!-- Two Column Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Upcoming Deadlines -->
    <div class="rounded-lg p-6" style="background-color: var(--color-card);">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: var(--color-text);">
        <span>🎯</span>
        Upcoming Deadlines
      </h2>

      {#if upcomingDeadlines.length === 0}
        <div class="text-center py-8" style="color: var(--color-text); opacity: 0.5;">
          <div class="text-4xl mb-2">🎉</div>
          <p>No upcoming deadlines!</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each upcomingDeadlines as event}
            {@const daysUntil = getDaysUntil(event.date)}
            <div class="p-3 rounded-lg flex items-center justify-between" style="background-color: var(--color-bg);">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span>{getEventTypeIcon(event.event_type)}</span>
                  <span class="font-semibold" style="color: var(--color-text);">{event.name}</span>
                  {#if event.priority === 'urgent'}
                    <span class="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white">
                      URGENT
                    </span>
                  {/if}
                </div>
                <div class="text-sm flex items-center gap-3" style="color: var(--color-text); opacity: 0.7;">
                  <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                  <span>⏰ {formatTime(event.time)}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold" style="color: {daysUntil === 0 ? '#ef4444' : daysUntil <= 3 ? '#f59e0b' : 'var(--color-accent)'};">
                  {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Recent Activity -->
    <div class="rounded-lg p-6" style="background-color: var(--color-card);">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: var(--color-text);">
        <span>📝</span>
        Recent Activity
      </h2>

      {#if recentEvents.length === 0}
        <div class="text-center py-8" style="color: var(--color-text); opacity: 0.5;">
          <div class="text-4xl mb-2">📭</div>
          <p>No events yet</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each recentEvents as event}
            <div class="p-3 rounded-lg" style="background-color: var(--color-bg);">
              <div class="flex items-center gap-2 mb-1">
                <span>{getEventTypeIcon(event.event_type)}</span>
                <span class="font-semibold" style="color: var(--color-text);">{event.name}</span>
                {#if event.is_completed}
                  <span class="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">
                    ✓ Done
                  </span>
                {/if}
              </div>
              <div class="text-sm flex items-center gap-3" style="color: var(--color-text); opacity: 0.7;">
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: {getPriorityColor(event.priority)}; color: white;">
                  {event.event_type}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Today's Schedule -->
  {#if stats.today > 0}
    <div class="rounded-lg p-6" style="background-color: var(--color-card);">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: var(--color-text);">
        <span>📌</span>
        Today's Events ({stats.today})
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each $events.filter(e => {
          const eventDate = new Date(e.date)
          const today = new Date()
          return eventDate.getDate() === today.getDate() &&
                 eventDate.getMonth() === today.getMonth() &&
                 eventDate.getFullYear() === today.getFullYear()
        }) as event}
          <div class="p-4 rounded-lg border-2" style="background-color: var(--color-bg); border-color: {event.is_completed ? '#10b981' : getPriorityColor(event.priority)};">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">{getEventTypeIcon(event.event_type)}</span>
              <span class="font-bold" style="color: var(--color-text);">{event.name}</span>
            </div>
            <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">
              ⏰ {formatTime(event.time)}
            </div>
            {#if event.is_completed}
              <div class="mt-2 text-xs text-green-500 font-semibold">
                ✓ Completed
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Quick Stats Row -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="p-4 rounded-lg text-center" style="background-color: var(--color-card);">
      <div class="text-2xl font-bold" style="color: var(--color-accent);">{$routines.length}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Classes</div>
    </div>
    <div class="p-4 rounded-lg text-center" style="background-color: var(--color-card);">
      <div class="text-2xl font-bold" style="color: var(--color-accent);">{stats.today}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Today</div>
    </div>
    <div class="p-4 rounded-lg text-center" style="background-color: var(--color-card);">
      <div class="text-2xl font-bold" style="color: #f59e0b;">{stats.urgent}</div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Urgent</div>
    </div>
    <div class="p-4 rounded-lg text-center" style="background-color: var(--color-card);">
      <div class="text-2xl font-bold" style="color: #3b82f6;">
        {stats.upcoming > 0 ? Math.round((stats.completed / (stats.completed + stats.upcoming)) * 100) : 100}%
      </div>
      <div class="text-sm" style="color: var(--color-text); opacity: 0.7;">Progress</div>
    </div>
  </div>
</div>

<style>
  .stat-card {
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
</style>
