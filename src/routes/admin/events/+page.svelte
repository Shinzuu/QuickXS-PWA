<script>
  import { onMount } from 'svelte'
  import { getAllEvents, deleteEvent, createEvent, updateEvent, toggleEventCompleted } from '$lib/admin/eventsApi'

  let events = $state([])
  let loading = $state(true)
  let showModal = $state(false)
  let editingEvent = $state(null)
  let error = $state('')

  let form = $state({
    date: '',
    time: '10:00',
    name: '',
    info: '',
    event_type: 'Announcement',
    priority: 'normal',
    is_completed: false
  })

  const eventTypes = ['CT', 'Mid', 'Assignment', 'Lab', 'Submission', 'Announcement']
  const priorities = ['urgent', 'normal', 'low']

  onMount(async () => {
    await loadEvents()
  })

  async function loadEvents() {
    loading = true
    try {
      events = await getAllEvents()
    } catch (err) {
      error = 'Failed to load events: ' + err.message
    } finally {
      loading = false
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return
    try {
      await deleteEvent(id)
      events = events.filter(e => e.id !== id)
    } catch (err) {
      error = 'Failed to delete: ' + err.message
    }
  }

  function openAddModal() {
    editingEvent = null
    form = {
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      name: '',
      info: '',
      event_type: 'Announcement',
      priority: 'normal',
      is_completed: false
    }
    showModal = true
  }

  function openEditModal(event) {
    editingEvent = event
    form = { ...event }
    showModal = true
  }

  async function handleSubmit() {
    error = ''
    try {
      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, form)
        events = events.map(e => e.id === editingEvent.id ? updated : e)
      } else {
        const created = await createEvent(form)
        events = [...events, created]
      }
      showModal = false
    } catch (err) {
      error = 'Failed to save: ' + err.message
    }
  }

  async function toggleCompleted(event) {
    try {
      const updated = await toggleEventCompleted(event.id, !event.is_completed)
      events = events.map(e => e.id === event.id ? updated : e)
    } catch (err) {
      error = 'Failed to update: ' + err.message
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold" style="color: #00ADB5;">Events Management</h1>
      <p class="mt-2 text-gray-400">{events.length} events total</p>
    </div>
    <button
      onclick={openAddModal}
      class="px-6 py-3 rounded-lg font-bold transition-all hover:scale-105"
      style="background-color: #00ADB5; color: #222831;"
    >
      + Add Event
    </button>
  </div>

  {#if error}
    <div class="p-4 rounded-lg bg-red-500 bg-opacity-20 border-2 border-red-500">
      <p class="text-red-400">{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 mx-auto" style="border-color: #00ADB5;"></div>
    </div>
  {:else}
    <div class="space-y-3">
      {#each events as event}
        <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-bold" style="color: #EEEEEE;">{event.name}</h3>
                <span class="px-3 py-1 rounded text-sm font-semibold" style="background-color: rgba(0, 173, 181, 0.2); color: #00ADB5;">
                  {event.event_type}
                </span>
                {#if event.is_completed}
                  <span class="px-3 py-1 rounded text-sm font-semibold" style="background-color: rgba(76, 175, 80, 0.2); color: #4CAF50;">
                    ✓ Completed
                  </span>
                {/if}
              </div>
              <div class="text-gray-400 text-sm space-y-1">
                <p>📅 {event.date} • 🕐 {event.time}</p>
                {#if event.info}
                  <p>{event.info}</p>
                {/if}
                <p>Priority: {event.priority}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                onclick={() => toggleCompleted(event)}
                class="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style="background-color: rgba(76, 175, 80, 0.2); color: #4CAF50;"
              >
                {event.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button
                onclick={() => openEditModal(event)}
                class="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style="background-color: #00ADB5; color: #222831;"
              >
                Edit
              </button>
              <button
                onclick={() => handleDelete(event.id)}
                class="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style="background-color: #FF6B6B; color: #EEEEEE;"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0, 0, 0, 0.7);" onclick={() => showModal = false} role="dialog" aria-modal="true">
    <div class="rounded-lg p-6 max-w-2xl w-full" style="background-color: #393E46;" onclick={(e) => e.stopPropagation()}> 
      <h2 class="text-2xl font-bold mb-6" style="color: #00ADB5;">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Event Name</label>
          <input id="name" type="text" bind:value={form.name} required class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="date" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Date</label>
            <input id="date" type="date" bind:value={form.date} required class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;" />
          </div>
          <div>
            <label for="time" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Time</label>
            <input id="time" type="time" bind:value={form.time} required class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;" />
          </div>
        </div>
        <div>
          <label for="info" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Additional Info</label>
          <textarea id="info" bind:value={form.info} rows="3" class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="event_type" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Event Type</label>
            <select id="event_type" bind:value={form.event_type} class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;">
              {#each eventTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="priority" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Priority</label>
            <select id="priority" bind:value={form.priority} class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;">
              {#each priorities as p}
                <option value={p}>{p}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="flex gap-3 pt-4">
          <button type="submit" class="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105" style="background-color: #00ADB5; color: #222831;">{editingEvent ? 'Update' : 'Create'}</button>
          <button type="button" onclick={() => showModal = false} class="px-6 py-3 rounded-lg font-bold" style="background-color: #222831; color: #EEEEEE; border: 2px solid #393E46;">Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
