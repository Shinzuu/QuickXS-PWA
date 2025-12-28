<script>
  import { upcomingEvents } from '../lib/store'
  import { getDaysUntil, formatDate, formatCountdown, isEventUrgent } from '../lib/utils'

  let showAll = $state(false)
  let filterType = $state('all') // 'all', 'CT', 'Mid', 'Assignment', 'Lab'
  const maxInitial = 10

  let filteredEvents = $derived(filterType === 'all'
    ? $upcomingEvents
    : $upcomingEvents.filter(e => e.event_type === filterType))

  let eventTypes = $derived([...new Set($upcomingEvents.map(e => e.event_type))])

  function getEventTypeIcon(eventType) {
    const icons = {
      CT: '📝',
      Mid: '📘',
      Assignment: '📋',
      Lab: '🔬',
      Submission: '📤',
      Announcement: '📢'
    }
    return icons[eventType] || '📌'
  }

  function getEventTypeColor(eventType, daysUntil) {
    if (daysUntil < 2) return 'bg-red-500/15 text-red-300 border-red-500/40'
    if (eventType === 'CT' || eventType === 'Mid') return 'bg-red-500/10 text-red-300 border-red-500/30'
    if (eventType === 'Assignment') return 'bg-orange-500/10 text-orange-300 border-orange-500/30'
    if (eventType === 'Lab') return 'bg-blue-500/10 text-blue-300 border-blue-500/30'
    return 'bg-gray-800/50 text-gray-300 border-gray-700'
  }

  async function shareEvent(event) {
    const text = `${event.name}\n${formatDate(event.date)} at ${event.time}\n${event.info || ''}`

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch (err) {
        if (err.name !== 'AbortError') {
          await copyToClipboard(text)
        }
      }
    } else {
      await copyToClipboard(text)
    }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: Show toast notification
      console.log('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
</script>

<div class="events-timeline">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-bold" style="color: var(--color-accent);">📢 Upcoming Events</h2>
    {#if filteredEvents.length > 0}
      <span class="text-xs px-2 py-1 rounded-full font-semibold" style="background-color: var(--color-accent); color: var(--color-bg);">
        {filteredEvents.length}
      </span>
    {/if}
  </div>

  <!-- Filter Tabs -->
  {#if eventTypes.length > 1}
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        onclick={() => filterType = 'all'}
        class="filter-btn px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
        style="
          background-color: {filterType === 'all' ? 'var(--color-accent)' : 'var(--color-bg)'};
          color: {filterType === 'all' ? 'var(--color-bg)' : 'var(--color-text)'};
          border: 2px solid {filterType === 'all' ? 'var(--color-accent)' : 'var(--color-card)'};
          box-shadow: {filterType === 'all' ? '0 2px 8px rgba(0, 173, 181, 0.4)' : 'none'};
        "
      >
        All ({$upcomingEvents.length})
      </button>
      {#each eventTypes as type}
        {@const count = $upcomingEvents.filter(e => e.event_type === type).length}
        <button
          onclick={() => filterType = type}
          class="filter-btn px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style="
            background-color: {filterType === type ? 'var(--color-accent)' : 'var(--color-bg)'};
            color: {filterType === type ? 'var(--color-bg)' : 'var(--color-text)'};
            border: 2px solid {filterType === type ? 'var(--color-accent)' : 'var(--color-card)'};
            box-shadow: {filterType === type ? '0 2px 8px rgba(0, 173, 181, 0.4)' : 'none'};
          "
        >
          {getEventTypeIcon(type)} {type} ({count})
        </button>
      {/each}
    </div>
  {/if}

  {#if filteredEvents.length === 0}
    <div class="text-center py-12 px-4">
      <div class="inline-block p-6 rounded-full mb-4" style="background-color: rgba(0, 173, 181, 0.1);">
        <span class="text-6xl">✨</span>
      </div>
      <h3 class="text-xl font-bold mb-2" style="color: var(--color-accent);">All Caught Up!</h3>
      <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
        No upcoming {filterType === 'all' ? 'events' : filterType + ' events'}. Check back later for updates.
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each (showAll ? filteredEvents : filteredEvents.slice(0, maxInitial)) as event (event.id)}
        {@const daysUntil = getDaysUntil(event.date)}
        {@const urgent = isEventUrgent(event.date)}

        <div
          class="event-card p-3 rounded-lg border transition-all {getEventTypeColor(event.event_type, daysUntil)}"
        >
          <div class="grid grid-cols-[auto,minmax(180px,1fr),auto,auto,auto,1fr,auto] items-center gap-3">
            <!-- Event Icon -->
            <span class="text-xl" aria-hidden="true">
              {getEventTypeIcon(event.event_type)}
            </span>

            <!-- Event Name -->
            <h3 class="font-bold text-base truncate">{event.name}</h3>

            <!-- Date -->
            <span class="text-sm opacity-90 whitespace-nowrap">📅 {formatDate(event.date)}</span>

            <!-- Time -->
            <span class="text-sm opacity-90 whitespace-nowrap">⏰ {event.time}</span>

            <!-- Countdown -->
            <span class="font-semibold text-sm whitespace-nowrap">{formatCountdown(daysUntil)}</span>

            <!-- Info -->
            {#if event.info}
              <p class="text-sm opacity-70 truncate">{event.info}</p>
            {:else}
              <div></div>
            {/if}

            <!-- Actions -->
            <div class="flex items-center gap-2 justify-end">
              {#if urgent}
                <span class="text-xs bg-red-600 text-white px-2 py-1 rounded-full whitespace-nowrap">
                  Urgent
                </span>
              {/if}

              <button
                onclick={() => shareEvent(event)}
                class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Share event"
                title="Share event"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/each}

      {#if !showAll && filteredEvents.length > maxInitial}
        <button
          onclick={() => showAll = true}
          class="w-full py-3 text-center text-sm rounded-lg transition-colors"
          style="color: var(--color-text); opacity: 0.6; background-color: var(--color-bg);"
        >
          +{filteredEvents.length - maxInitial} more events
        </button>
      {:else if showAll && filteredEvents.length > maxInitial}
        <button
          onclick={() => showAll = false}
          class="w-full py-3 text-center text-sm rounded-lg transition-colors"
          style="color: var(--color-text); opacity: 0.6; background-color: var(--color-bg);"
        >
          Show less
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .event-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .event-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 173, 181, 0.4);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .event-card {
    animation: fadeInUp 0.4s ease-out;
    animation-fill-mode: both;
  }

  .event-card:nth-child(1) { animation-delay: 0.05s; }
  .event-card:nth-child(2) { animation-delay: 0.1s; }
  .event-card:nth-child(3) { animation-delay: 0.15s; }
  .event-card:nth-child(4) { animation-delay: 0.2s; }
  .event-card:nth-child(5) { animation-delay: 0.25s; }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .filter-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .filter-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 173, 181, 0.3) !important;
  }

  .filter-btn:active {
    transform: scale(0.95);
  }
</style>
