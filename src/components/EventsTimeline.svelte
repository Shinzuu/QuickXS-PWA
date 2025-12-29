<script>
  import { upcomingEvents } from '../lib/store'
  import { getDaysUntil, formatDate, formatCountdown, isEventUrgent, formatTime } from '../lib/utils'

  let showAll = $state(false)
  let filterType = $state('all') // 'all', 'CT', 'Mid', 'Assignment', 'Lab'
  let selectedEvent = $state(null)
  let showModal = $state(false)
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

  function openEventModal(event) {
    selectedEvent = event
    showModal = true
  }

  function closeModal() {
    showModal = false
    selectedEvent = null
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
          class="event-card p-3 rounded-lg border transition-all cursor-pointer {getEventTypeColor(event.event_type, daysUntil)}"
          onclick={() => openEventModal(event)}
          onkeydown={(e) => e.key === 'Enter' && openEventModal(event)}
          role="button"
          tabindex="0"
          aria-label="View details for {event.name}"
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
            <span class="text-sm opacity-90 whitespace-nowrap">⏰ {formatTime(event.time)}</span>

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

<!-- Event Detail Modal -->
{#if showModal && selectedEvent}
  {@const daysUntil = getDaysUntil(selectedEvent.date)}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="event-modal-title"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <!-- Modal Content -->
    <div
      class="relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl"
      style="background-color: var(--color-card);"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">{getEventTypeIcon(selectedEvent.event_type)}</span>
          <div>
            <h2 id="event-modal-title" class="text-2xl font-bold" style="color: var(--color-text);">
              {selectedEvent.name}
            </h2>
            <span class="text-sm px-2 py-1 rounded-full inline-block mt-1" style="background-color: var(--color-accent); color: var(--color-bg);">
              {selectedEvent.event_type}
            </span>
          </div>
        </div>
        <button
          onclick={closeModal}
          class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Details -->
      <div class="space-y-4">
        <!-- Date & Time -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-2 p-3 rounded-lg" style="background-color: var(--color-bg);">
            <span class="text-2xl">📅</span>
            <div>
              <p class="text-xs opacity-70" style="color: var(--color-text);">Date</p>
              <p class="font-semibold" style="color: var(--color-text);">
                {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 p-3 rounded-lg" style="background-color: var(--color-bg);">
            <span class="text-2xl">⏰</span>
            <div>
              <p class="text-xs opacity-70" style="color: var(--color-text);">Time</p>
              <p class="font-semibold" style="color: var(--color-text);">{formatTime(selectedEvent.time)}</p>
            </div>
          </div>
        </div>

        <!-- Countdown -->
        <div class="p-3 rounded-lg text-center" style="background-color: var(--color-accent); color: var(--color-bg);">
          <p class="text-sm font-semibold">Time Remaining</p>
          <p class="text-2xl font-bold">{formatCountdown(daysUntil)}</p>
        </div>

        <!-- Priority -->
        {#if selectedEvent.priority}
          <div class="flex items-center gap-2 p-3 rounded-lg" style="background-color: var(--color-bg);">
            <span class="text-2xl">
              {selectedEvent.priority === 'urgent' ? '🔴' : selectedEvent.priority === 'high' ? '🟡' : '🟢'}
            </span>
            <div>
              <p class="text-xs opacity-70" style="color: var(--color-text);">Priority</p>
              <p class="font-semibold capitalize" style="color: var(--color-text);">{selectedEvent.priority}</p>
            </div>
          </div>
        {/if}

        <!-- Info -->
        {#if selectedEvent.info}
          <div class="p-4 rounded-lg" style="background-color: var(--color-bg);">
            <p class="text-xs opacity-70 mb-2" style="color: var(--color-text);">Additional Information</p>
            <p class="whitespace-pre-wrap" style="color: var(--color-text);">{selectedEvent.info}</p>
          </div>
        {/if}

        <!-- Actions -->
        <div class="pt-2">
          <button
            onclick={closeModal}
            class="w-full py-3 px-4 rounded-lg font-semibold transition-all hover:opacity-90"
            style="background-color: var(--color-accent); color: var(--color-bg);"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

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
