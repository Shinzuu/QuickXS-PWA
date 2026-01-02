<script>
  import { routines, events, fetchAllData } from '../lib/store'
  import { formatTime } from '../lib/utils'
  import { eventTemplates } from '../lib/templateStore'
  import { swipe, vibrate } from '../lib/swipe'

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SERVICE_KEY = 'sb_secret__H6b6JdnCNiFKrjmFTkGSQ_zIB1_IRg'

  let activeTab = $state('events') // 'events', 'routines', 'templates'
  let showAddEventModal = $state(false)
  let showEditEventModal = $state(false)
  let selectedEvent = $state(null)
  let showTemplates = $state(false)

  // Swipe state
  let swipedEvents = $state(new Map()) // Map<eventId, swipeOffset>

  // Event form state
  let eventForm = $state({
    name: '',
    date: '',
    time: '',
    event_type: 'Assignment',
    info: '',
    priority: 'normal',
    is_completed: false
  })

  let timeMode = $state('routine') // 'routine' or 'custom'
  let selectedSubject = $state('')

  // Get unique subjects from routine
  let subjects = $derived([...new Set($routines.map(r => r.subject))].sort())

  // Get times for selected subject
  let subjectTimes = $derived.by(() => {
    if (!selectedSubject) return []
    const subjectRoutines = $routines.filter(r => r.subject === selectedSubject)
    return subjectRoutines.map(r => ({
      day: r.day,
      time: r.time,
      teacher: r.teacher,
      classroom: r.classroom
    }))
  })

  const eventTypes = ['CT', 'Mid', 'Final', 'Assignment', 'Lab', 'Submission', 'Announcement']
  const priorities = ['normal', 'high', 'urgent']

  let previousOverflow = ''

  function openAddEventModal() {
    eventForm = {
      name: '',
      date: '',
      time: '',
      event_type: 'Assignment',
      info: '',
      priority: 'normal',
      is_completed: false
    }
    timeMode = 'routine'
    selectedSubject = subjects[0] || ''
    showTemplates = true
    showAddEventModal = true
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function useTemplate(template) {
    eventForm = {
      name: template.name,
      date: '',
      time: '',
      event_type: template.event_type,
      info: template.info || '',
      priority: template.priority || 'normal',
      is_completed: false
    }
    selectedSubject = template.subject || subjects[0] || ''
    showTemplates = false
  }

  function closeAddEventModal() {
    showAddEventModal = false
    document.body.style.overflow = previousOverflow
  }

  function openEditEventModal(event) {
    selectedEvent = event
    eventForm = {
      name: event.name,
      date: event.date,
      time: event.time,
      event_type: event.event_type,
      info: event.info || '',
      priority: event.priority || 'normal',
      is_completed: event.is_completed
    }
    timeMode = 'custom'
    showEditEventModal = true
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function closeEditEventModal() {
    showEditEventModal = false
    selectedEvent = null
    document.body.style.overflow = previousOverflow
  }

  function selectRoutineTime(time) {
    eventForm.time = time
  }

  async function handleAddEvent() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(eventForm)
      })

      if (response.ok) {
        await fetchAllData(true)
        closeAddEventModal()
        alert('✅ Event added successfully!')
      } else {
        const error = await response.json()
        alert('❌ Error: ' + (error.message || 'Failed to add event'))
      }
    } catch (err) {
      alert('❌ Error: ' + err.message)
    }
  }

  async function handleUpdateEvent() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${selectedEvent.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(eventForm)
      })

      if (response.ok) {
        await fetchAllData(true)
        closeEditEventModal()
        alert('✅ Event updated successfully!')
      } else {
        const error = await response.json()
        alert('❌ Error: ' + (error.message || 'Failed to update event'))
      }
    } catch (err) {
      alert('❌ Error: ' + err.message)
    }
  }

  async function handleDeleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${eventId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      })

      if (response.ok) {
        await fetchAllData(true)
        alert('✅ Event deleted successfully!')
      } else {
        alert('❌ Failed to delete event')
      }
    } catch (err) {
      alert('❌ Error: ' + err.message)
    }
  }

  async function toggleEventCompletion(event) {
    try {
      vibrate([50])
      const response = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${event.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_completed: !event.is_completed })
      })

      if (response.ok) {
        await fetchAllData(true)
      }
    } catch (err) {
      alert('❌ Error: ' + err.message)
    }
  }

  async function quickCompleteEvent(eventId) {
    const event = $events.find(e => e.id === eventId)
    if (event) {
      vibrate([100, 50, 100])
      await toggleEventCompletion(event)
      swipedEvents.delete(eventId)
      swipedEvents = new Map(swipedEvents)
    }
  }

  async function quickDeleteEvent(eventId) {
    vibrate([200])
    await handleDeleteEvent(eventId)
    swipedEvents.delete(eventId)
    swipedEvents = new Map(swipedEvents)
  }

  function handleSwipeMove(eventId, distX, direction) {
    const maxSwipe = 150
    const offset = Math.min(Math.abs(distX), maxSwipe) * (distX > 0 ? 1 : -1)
    swipedEvents.set(eventId, offset)
    swipedEvents = new Map(swipedEvents)
  }

  function handleSwipeEnd(eventId) {
    const offset = swipedEvents.get(eventId) || 0
    if (Math.abs(offset) < 50) {
      swipedEvents.delete(eventId)
      swipedEvents = new Map(swipedEvents)
    }
  }
</script>

<div class="admin-panel min-h-screen p-6" style="background-color: var(--color-bg);">
  <!-- Header -->
  <div class="max-w-7xl mx-auto mb-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--color-accent);">🔧 Admin Panel</h1>
        <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">Manage your schedule, events, and links</p>
      </div>
      <button
        onclick={openAddEventModal}
        class="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
        style="background-color: var(--color-accent); color: var(--color-bg);"
      >
        ➕ Add Event
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b-2" style="border-color: var(--color-card);">
      <button
        onclick={() => activeTab = 'events'}
        class="px-4 py-3 font-semibold transition-all"
        style="
          color: {activeTab === 'events' ? 'var(--color-accent)' : 'var(--color-text)'};
          border-bottom: 3px solid {activeTab === 'events' ? 'var(--color-accent)' : 'transparent'};
          opacity: {activeTab === 'events' ? '1' : '0.6'};
        "
      >
        📅 Events ({$events.length})
      </button>
      <button
        onclick={() => activeTab = 'routines'}
        class="px-4 py-3 font-semibold transition-all"
        style="
          color: {activeTab === 'routines' ? 'var(--color-accent)' : 'var(--color-text)'};
          border-bottom: 3px solid {activeTab === 'routines' ? 'var(--color-accent)' : 'transparent'};
          opacity: {activeTab === 'routines' ? '1' : '0.6'};
        "
      >
        📚 Routine ({$routines.length})
      </button>
    </div>
  </div>

  <!-- Events Tab -->
  {#if activeTab === 'events'}
    <div class="max-w-7xl mx-auto">
      <!-- Swipe Hint -->
      <div class="mb-4 p-3 rounded-lg" style="background-color: var(--color-card);">
        <p class="text-sm" style="color: var(--color-text); opacity: 0.8;">
          💡 <strong>Tip:</strong> Swipe right to mark complete ✓, swipe left to delete 🗑️
        </p>
      </div>

      <div class="grid gap-4">
        {#each $events.sort((a, b) => new Date(a.date) - new Date(b.date)) as event (event.id)}
          {@const swipeOffset = swipedEvents.get(event.id) || 0}

          <div class="relative overflow-hidden rounded-lg">
            <!-- Swipe Actions Background -->
            {#if swipeOffset > 50}
              <!-- Swipe Right - Complete -->
              <div class="absolute inset-0 flex items-center justify-start pl-6 bg-green-600 rounded-lg">
                <span class="text-white font-bold text-lg">✓ Complete</span>
              </div>
            {:else if swipeOffset < -50}
              <!-- Swipe Left - Delete -->
              <div class="absolute inset-0 flex items-center justify-end pr-6 bg-red-600 rounded-lg">
                <span class="text-white font-bold text-lg">🗑️ Delete</span>
              </div>
            {/if}

            <!-- Event Card -->
            <div
              use:swipe={{
                onSwipeRight: () => quickCompleteEvent(event.id),
                onSwipeLeft: () => quickDeleteEvent(event.id),
                onSwipeMove: (dist, dir) => handleSwipeMove(event.id, dist, dir),
                onSwipeEnd: () => handleSwipeEnd(event.id)
              }}
              class="p-4 rounded-lg border transition-all hover:shadow-lg relative"
              style="
                background-color: var(--color-card);
                border-color: {event.is_completed ? '#4ade80' : 'var(--color-accent)'};
                transform: translateX({swipeOffset}px);
                transition: {swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none'};
              "
            >
            <div class="flex items-start justify-between gap-4">
              <!-- Event Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={event.is_completed}
                    onchange={() => toggleEventCompletion(event)}
                    class="w-5 h-5 cursor-pointer"
                  />
                  <h3 class="text-lg font-bold {event.is_completed ? 'line-through opacity-60' : ''}" style="color: var(--color-text);">
                    {event.name}
                  </h3>
                  <span class="text-xs px-2 py-1 rounded-full" style="background-color: var(--color-accent); color: var(--color-bg);">
                    {event.event_type}
                  </span>
                  {#if event.priority === 'urgent'}
                    <span class="text-xs px-2 py-1 rounded-full bg-red-600 text-white">
                      🔴 Urgent
                    </span>
                  {/if}
                </div>

                <div class="flex flex-wrap gap-4 text-sm mb-2" style="color: var(--color-text); opacity: 0.8;">
                  <span>📅 {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>⏰ {formatTime(event.time)}</span>
                </div>

                {#if event.info}
                  <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">{event.info}</p>
                {/if}
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <button
                  onclick={() => openEditEventModal(event)}
                  class="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                  style="background-color: var(--color-bg); color: var(--color-accent);"
                >
                  ✏️ Edit
                </button>
                <button
                  onclick={() => handleDeleteEvent(event.id)}
                  class="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 bg-red-600 text-white"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            </div>
          </div>
        {/each}

        {#if $events.length === 0}
          <div class="text-center py-12">
            <p class="text-lg" style="color: var(--color-text); opacity: 0.5;">No events yet. Add your first event!</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Routines Tab -->
  {#if activeTab === 'routines'}
    <div class="max-w-7xl mx-auto">
      <div class="grid gap-4">
        {#each $routines.sort((a, b) => {
          const dayOrder = { Saturday: 0, Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5, Friday: 6 }
          return dayOrder[a.day] - dayOrder[b.day] || a.time.localeCompare(b.time)
        }) as routine (routine.id)}
          <div class="p-4 rounded-lg border" style="background-color: var(--color-card); border-color: var(--color-accent);">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-text);">{routine.subject}</h3>
                <div class="flex gap-4 text-sm" style="color: var(--color-text); opacity: 0.8;">
                  <span>📅 {routine.day}</span>
                  <span>⏰ {formatTime(routine.time)}</span>
                  <span>👨‍🏫 {routine.teacher}</span>
                  <span>🏫 {routine.classroom}</span>
                  <span>⏱️ {routine.duration}min</span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Add Event Modal -->
{#if showAddEventModal}
  <div
    class="fixed inset-0 flex items-center justify-center p-4"
    style="z-index: 9999;"
    onclick={closeAddEventModal}
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
      style="background-color: var(--color-card);"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold" style="color: var(--color-accent);">➕ Add New Event</h2>
        <button onclick={closeAddEventModal} class="text-2xl" style="color: var(--color-text);">✕</button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleAddEvent(); }} class="space-y-4">
        <!-- Templates Section -->
        {#if showTemplates}
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold" style="color: var(--color-text);">📋 Quick Templates</h3>
              <button
                type="button"
                onclick={() => showTemplates = false}
                class="text-sm px-3 py-1 rounded-lg"
                style="background-color: var(--color-bg); color: var(--color-text);"
              >
                Skip
              </button>
            </div>
            <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 rounded-lg" style="background-color: var(--color-bg);">
              {#each $eventTemplates as template (template.id)}
                <button
                  type="button"
                  onclick={() => useTemplate(template)}
                  class="p-3 rounded-lg border-2 text-left transition-all hover:scale-105"
                  style="background-color: var(--color-card); border-color: var(--color-accent);"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: var(--color-accent); color: var(--color-bg);">
                      {template.event_type}
                    </span>
                    {#if template.priority === 'urgent'}
                      <span class="text-xs">🔴</span>
                    {/if}
                  </div>
                  <div class="font-bold text-sm" style="color: var(--color-text);">{template.name}</div>
                  <div class="text-xs opacity-70" style="color: var(--color-text);">{template.subject}</div>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Event Name -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Event Name *</label>
          <input
            type="text"
            bind:value={eventForm.name}
            required
            class="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none"
            style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
            placeholder="e.g., ML Assignment 1"
          />
        </div>

        <!-- Event Type & Priority -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Event Type *</label>
            <select
              bind:value={eventForm.event_type}
              class="w-full px-4 py-3 rounded-lg border-2"
              style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
            >
              {#each eventTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Priority</label>
            <select
              bind:value={eventForm.priority}
              class="w-full px-4 py-3 rounded-lg border-2"
              style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
            >
              {#each priorities as priority}
                <option value={priority}>{priority}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Date *</label>
          <input
            type="date"
            bind:value={eventForm.date}
            required
            class="w-full px-4 py-3 rounded-lg border-2"
            style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
          />
        </div>

        <!-- Time Selection Mode -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Time Selection</label>
          <div class="flex gap-2 mb-3">
            <button
              type="button"
              onclick={() => timeMode = 'routine'}
              class="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
              style="
                background-color: {timeMode === 'routine' ? 'var(--color-accent)' : 'var(--color-bg)'};
                color: {timeMode === 'routine' ? 'var(--color-bg)' : 'var(--color-text)'};
              "
            >
              📚 From Routine
            </button>
            <button
              type="button"
              onclick={() => timeMode = 'custom'}
              class="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
              style="
                background-color: {timeMode === 'custom' ? 'var(--color-accent)' : 'var(--color-bg)'};
                color: {timeMode === 'custom' ? 'var(--color-bg)' : 'var(--color-text)'};
              "
            >
              ⏰ Custom Time
            </button>
          </div>

          {#if timeMode === 'routine'}
            <!-- Subject Selection -->
            <div class="mb-3">
              <select
                bind:value={selectedSubject}
                class="w-full px-4 py-3 rounded-lg border-2"
                style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
              >
                <option value="">Select Subject</option>
                {#each subjects as subject}
                  <option value={subject}>{subject}</option>
                {/each}
              </select>
            </div>

            <!-- Time Slots -->
            {#if selectedSubject && subjectTimes.length > 0}
              <div class="grid grid-cols-2 gap-2">
                {#each subjectTimes as slot}
                  <button
                    type="button"
                    onclick={() => selectRoutineTime(slot.time)}
                    class="p-3 rounded-lg border-2 text-left transition-all hover:scale-105"
                    style="
                      background-color: {eventForm.time === slot.time ? 'var(--color-accent)' : 'var(--color-bg)'};
                      color: {eventForm.time === slot.time ? 'var(--color-bg)' : 'var(--color-text)'};
                      border-color: var(--color-accent);
                    "
                  >
                    <div class="font-bold">{slot.day}</div>
                    <div class="text-sm">{formatTime(slot.time)}</div>
                    <div class="text-xs opacity-70">{slot.classroom}</div>
                  </button>
                {/each}
              </div>
            {/if}
          {:else}
            <!-- Custom Time Input -->
            <input
              type="time"
              bind:value={eventForm.time}
              required
              class="w-full px-4 py-3 rounded-lg border-2"
              style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
            />
          {/if}
        </div>

        <!-- Additional Info -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Additional Information</label>
          <textarea
            bind:value={eventForm.info}
            rows="3"
            class="w-full px-4 py-3 rounded-lg border-2"
            style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
            placeholder="Add any notes or details..."
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 py-3 px-6 rounded-lg font-semibold transition-all hover:scale-105"
            style="background-color: var(--color-accent); color: var(--color-bg);"
          >
            ✅ Add Event
          </button>
          <button
            type="button"
            onclick={closeAddEventModal}
            class="px-6 py-3 rounded-lg font-semibold transition-all"
            style="background-color: var(--color-bg); color: var(--color-text);"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Edit Event Modal -->
{#if showEditEventModal && selectedEvent}
  <div
    class="fixed inset-0 flex items-center justify-center p-4"
    style="z-index: 9999;"
    onclick={closeEditEventModal}
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
      style="background-color: var(--color-card);"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold" style="color: var(--color-accent);">✏️ Edit Event</h2>
        <button onclick={closeEditEventModal} class="text-2xl" style="color: var(--color-text);">✕</button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleUpdateEvent(); }} class="space-y-4">
        <!-- Same form fields as Add Event -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Event Name *</label>
          <input
            type="text"
            bind:value={eventForm.name}
            required
            class="w-full px-4 py-3 rounded-lg border-2"
            style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Event Type *</label>
            <select
              bind:value={eventForm.event_type}
              class="w-full px-4 py-3 rounded-lg border-2"
              style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
            >
              {#each eventTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Priority</label>
            <select
              bind:value={eventForm.priority}
              class="w-full px-4 py-3 rounded-lg border-2"
              style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
            >
              {#each priorities as priority}
                <option value={priority}>{priority}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Date *</label>
          <input
            type="date"
            bind:value={eventForm.date}
            required
            class="w-full px-4 py-3 rounded-lg border-2"
            style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Time *</label>
          <input
            type="time"
            bind:value={eventForm.time}
            required
            class="w-full px-4 py-3 rounded-lg border-2"
            style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">Additional Information</label>
          <textarea
            bind:value={eventForm.info}
            rows="3"
            class="w-full px-4 py-3 rounded-lg border-2"
            style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
          ></textarea>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 py-3 px-6 rounded-lg font-semibold transition-all hover:scale-105"
            style="background-color: var(--color-accent); color: var(--color-bg);"
          >
            💾 Save Changes
          </button>
          <button
            type="button"
            onclick={closeEditEventModal}
            class="px-6 py-3 rounded-lg font-semibold transition-all"
            style="background-color: var(--color-bg); color: var(--color-text);"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  input[type="checkbox"] {
    accent-color: var(--color-accent);
  }
</style>
