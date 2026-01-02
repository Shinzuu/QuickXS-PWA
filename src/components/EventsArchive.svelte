<script>
  import { events } from '../lib/store'
  import { getDaysUntil, formatDate, isEventUrgent, formatTime } from '../lib/utils'
  import { currentTheme } from '../lib/themeStore'

  let searchQuery = $state('')
  let filterType = $state('all')
  let filterStatus = $state('all') // 'all', 'upcoming', 'completed'
  let sortBy = $state('date') // 'date', 'type', 'name'
  let sortOrder = $state('asc') // 'asc', 'desc'
  let selectedEvent = $state(null)
  let showModal = $state(false)

  // Get unique event types
  let eventTypes = $derived([...new Set($events.map(e => e.event_type))])

  // Filter and sort events
  let filteredEvents = $derived.by(() => {
    let result = [...$events]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.name?.toLowerCase().includes(query) ||
        e.info?.toLowerCase().includes(query) ||
        e.event_type?.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(e => e.event_type === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      const now = new Date()
      if (filterStatus === 'upcoming') {
        result = result.filter(e => new Date(e.date) >= now && !e.is_completed)
      } else if (filterStatus === 'completed') {
        result = result.filter(e => new Date(e.date) < now || e.is_completed)
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = new Date(a.date) - new Date(b.date)
      } else if (sortBy === 'type') {
        comparison = (a.event_type || '').localeCompare(b.event_type || '')
      } else if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '')
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  })

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

  let previousOverflow = ''

  function openEventModal(event) {
    selectedEvent = event
    showModal = true
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    showModal = false
    selectedEvent = null
    document.body.style.overflow = previousOverflow
  }

  function toggleSortOrder() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
  }
</script>

<div class="events-archive p-6 rounded-lg" style="background-color: {$currentTheme.card};">
  <h1 class="text-3xl font-bold mb-6" style="color: {$currentTheme.accent};">📚 Events Archive</h1>

  <!-- Filters and Search -->
  <div class="mb-6 space-y-4">
    <!-- Search Bar -->
    <div class="relative">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search events by name, type, or info..."
        class="w-full p-3 pl-10 rounded-lg"
        style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
      />
      <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" style="color: {$currentTheme.accent};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Filters Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Type Filter -->
      <div>
        <label class="block text-sm font-semibold mb-2" style="color: {$currentTheme.text};">Event Type</label>
        <select
          bind:value={filterType}
          class="w-full p-2 rounded-lg"
          style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
        >
          <option value="all">All Types</option>
          {#each eventTypes as type}
            <option value={type}>{getEventTypeIcon(type)} {type}</option>
          {/each}
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <label class="block text-sm font-semibold mb-2" style="color: {$currentTheme.text};">Status</label>
        <select
          bind:value={filterStatus}
          class="w-full p-2 rounded-lg"
          style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
        >
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <!-- Sort Options -->
      <div>
        <label class="block text-sm font-semibold mb-2" style="color: {$currentTheme.text};">Sort By</label>
        <div class="flex gap-2">
          <select
            bind:value={sortBy}
            class="flex-1 p-2 rounded-lg"
            style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
          >
            <option value="date">Date</option>
            <option value="type">Type</option>
            <option value="name">Name</option>
          </select>
          <button
            onclick={toggleSortOrder}
            class="px-3 py-2 rounded-lg transition-all"
            style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="flex gap-4 text-sm" style="color: {$currentTheme.text};">
      <span>Total: <strong>{$events.length}</strong></span>
      <span>Showing: <strong>{filteredEvents.length}</strong></span>
      <span>Upcoming: <strong>{$events.filter(e => new Date(e.date) >= new Date() && !e.is_completed).length}</strong></span>
    </div>
  </div>

  <!-- Events List -->
  {#if filteredEvents.length === 0}
    <div class="text-center py-12 px-4">
      <div class="inline-block p-6 rounded-full mb-4" style="background-color: rgba(0, 173, 181, 0.1);">
        <span class="text-6xl">🔍</span>
      </div>
      <h3 class="text-xl font-bold mb-2" style="color: {$currentTheme.accent};">No Events Found</h3>
      <p class="text-sm" style="color: {$currentTheme.text}; opacity: 0.7;">
        Try adjusting your filters or search query.
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredEvents as event (event.id)}
        {@const daysUntil = getDaysUntil(event.date)}
        {@const isPast = new Date(event.date) < new Date()}
        {@const urgent = isEventUrgent(event.date) && !isPast}

        <div
          class="event-card p-4 rounded-lg border transition-all cursor-pointer {getEventTypeColor(event.event_type, daysUntil)}"
          style="opacity: {isPast ? 0.6 : 1};"
          onclick={() => openEventModal(event)}
          onkeydown={(e) => e.key === 'Enter' && openEventModal(event)}
          role="button"
          tabindex="0"
          aria-label="View details for {event.name}"
        >
          <!-- Mobile Layout -->
          <div class="md:hidden">
            <div class="flex items-start gap-3 mb-2">
              <span class="text-2xl">{getEventTypeIcon(event.event_type)}</span>
              <div class="flex-1">
                <h3 class="font-bold text-base mb-1">
                  {event.name}
                  {#if isPast}
                    <span class="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-600 text-gray-200">Past</span>
                  {/if}
                </h3>
                <div class="flex flex-wrap gap-2 text-sm opacity-90">
                  <span>📅 {formatDate(event.date)}</span>
                  <span>⏰ {formatTime(event.time)}</span>
                </div>
              </div>
              {#if urgent}
                <span class="text-xs bg-red-600 text-white px-2 py-1 rounded-full whitespace-nowrap">Urgent</span>
              {/if}
            </div>
            {#if event.info}
              <p class="text-sm opacity-70 truncate ml-11">{event.info}</p>
            {/if}
          </div>

          <!-- Desktop Layout -->
          <div class="hidden md:grid grid-cols-[auto,minmax(200px,1fr),auto,auto,auto,1fr,auto] items-center gap-4">
            <span class="text-xl">{getEventTypeIcon(event.event_type)}</span>
            <h3 class="font-bold text-base truncate">
              {event.name}
              {#if isPast}
                <span class="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-600 text-gray-200">Past</span>
              {/if}
            </h3>
            <span class="text-sm opacity-90 whitespace-nowrap">📅 {formatDate(event.date)}</span>
            <span class="text-sm opacity-90 whitespace-nowrap">⏰ {formatTime(event.time)}</span>
            <span class="text-xs px-2 py-1 rounded-full" style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};">{event.event_type}</span>
            {#if event.info}
              <p class="text-sm opacity-70 truncate">{event.info}</p>
            {:else}
              <div></div>
            {/if}
            <div class="flex items-center gap-2 justify-end">
              {#if urgent}
                <span class="text-xs bg-red-600 text-white px-2 py-1 rounded-full whitespace-nowrap">Urgent</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Event Detail Modal -->
{#if showModal && selectedEvent}
  {@const daysUntil = getDaysUntil(selectedEvent.date)}
  {@const isPast = new Date(selectedEvent.date) < new Date()}

  <div
    class="fixed inset-0 flex items-center justify-center p-4"
    style="z-index: 9999;"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="event-modal-title"
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl"
      style="background-color: {$currentTheme.card};"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">{getEventTypeIcon(selectedEvent.event_type)}</span>
          <div>
            <h2 id="event-modal-title" class="text-2xl font-bold" style="color: {$currentTheme.text};">
              {selectedEvent.name}
            </h2>
            <span class="text-sm px-2 py-1 rounded-full inline-block mt-1" style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};">
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
          <div class="flex items-center gap-2 p-3 rounded-lg" style="background-color: {$currentTheme.bg};">
            <span class="text-2xl">📅</span>
            <div>
              <p class="text-xs opacity-70" style="color: {$currentTheme.text};">Date</p>
              <p class="font-semibold" style="color: {$currentTheme.text};">
                {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 p-3 rounded-lg" style="background-color: {$currentTheme.bg};">
            <span class="text-2xl">⏰</span>
            <div>
              <p class="text-xs opacity-70" style="color: {$currentTheme.text};">Time</p>
              <p class="font-semibold" style="color: {$currentTheme.text};">{formatTime(selectedEvent.time)}</p>
            </div>
          </div>
        </div>

        <!-- Status -->
        {#if isPast}
          <div class="p-3 rounded-lg text-center" style="background-color: #6b7280; color: white;">
            <p class="text-sm font-semibold">This event has passed</p>
            <p class="text-2xl font-bold">{Math.abs(daysUntil)} days ago</p>
          </div>
        {:else}
          <div class="p-3 rounded-lg text-center" style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};">
            <p class="text-sm font-semibold">Time Remaining</p>
            <p class="text-2xl font-bold">{daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}</p>
          </div>
        {/if}

        <!-- Info -->
        {#if selectedEvent.info}
          <div class="p-4 rounded-lg" style="background-color: {$currentTheme.bg};">
            <p class="text-xs opacity-70 mb-2" style="color: {$currentTheme.text};">Additional Information</p>
            <p class="whitespace-pre-wrap" style="color: {$currentTheme.text};">{selectedEvent.info}</p>
          </div>
        {/if}

        <!-- Close Button -->
        <div class="pt-2">
          <button
            onclick={closeModal}
            class="w-full py-3 px-4 rounded-lg font-semibold transition-all hover:opacity-90"
            style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
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

  select, input {
    outline: none;
  }

  select:focus, input:focus {
    box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.3);
  }
</style>
