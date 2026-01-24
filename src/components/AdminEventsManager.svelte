<script>
  import { onMount } from 'svelte'
  import { events, fetchAllData } from '../lib/store'
  import { supabase } from '../lib/supabase'
  import { formatTime } from '../lib/utils'

  // View modes
  let viewMode = $state('cards') // 'cards', 'table', 'calendar'

  // Search and filters
  let searchQuery = $state('')
  let filterType = $state('all')
  let filterPriority = $state('all')
  let filterStatus = $state('all')
  let sortBy = $state('date') // 'date', 'name', 'priority', 'type'
  let sortOrder = $state('asc')

  // Bulk operations
  let selectedEvents = $state(new Set())
  let selectAll = $state(false)

  // Modals
  let showAddModal = $state(false)
  let showEditModal = $state(null)
  let showBulkMenu = $state(false)

  // Form
  let eventForm = $state({
    name: '',
    date: '',
    time: '10:00',
    event_type: 'Assignment',
    info: '',
    priority: 'normal',
    is_completed: false
  })

  // Toast notifications
  let toast = $state({ show: false, message: '', type: 'success' })

  const eventTypes = ['CT', 'Mid', 'Final', 'Assignment', 'Lab', 'Submission', 'Announcement']
  const priorities = ['urgent', 'high', 'normal', 'low']

  // Filtered and sorted events
  let filteredEvents = $derived.by(() => {
    let result = $events.filter(e => {
      const matchesSearch = !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.info && e.info.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = filterType === 'all' || e.event_type === filterType
      const matchesPriority = filterPriority === 'all' || e.priority === filterPriority
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'completed' && e.is_completed) ||
        (filterStatus === 'pending' && !e.is_completed)

      return matchesSearch && matchesType && matchesPriority && matchesStatus
    })

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date)
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'type':
          comparison = a.event_type.localeCompare(b.event_type)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  })

  function showToast(message, type = 'success') {
    toast = { show: true, message, type }
    setTimeout(() => {
      toast.show = false
    }, 3000)
  }

  function toggleSelectAll() {
    if (selectAll) {
      selectedEvents.clear()
      selectAll = false
    } else {
      filteredEvents.forEach(e => selectedEvents.add(e.id))
      selectAll = true
    }
    selectedEvents = new Set(selectedEvents)
  }

  function toggleEventSelection(id) {
    if (selectedEvents.has(id)) {
      selectedEvents.delete(id)
    } else {
      selectedEvents.add(id)
    }
    selectedEvents = new Set(selectedEvents)
    selectAll = selectedEvents.size === filteredEvents.length
  }

  async function handleAdd() {
    try {
      const { error } = await supabase
        .from('events')
        .insert([eventForm])

      if (error) throw error

      await fetchAllData(true)
      showAddModal = false
      resetForm()
      showToast('✅ Event added successfully!')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function handleUpdate() {
    try {
      const { error } = await supabase
        .from('events')
        .update(eventForm)
        .eq('id', showEditModal)

      if (error) throw error

      await fetchAllData(true)
      showEditModal = null
      resetForm()
      showToast('✅ Event updated successfully!')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchAllData(true)
      showToast('✅ Event deleted!')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function bulkMarkComplete() {
    try {
      for (const id of selectedEvents) {
        await supabase
          .from('events')
          .update({ is_completed: true })
          .eq('id', id)
      }

      await fetchAllData(true)
      selectedEvents.clear()
      selectedEvents = new Set()
      showBulkMenu = false
      showToast(`✅ Marked ${selectedEvents.size} events as complete!`)
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedEvents.size} events?`)) return

    try {
      for (const id of selectedEvents) {
        await supabase
          .from('events')
          .delete()
          .eq('id', id)
      }

      await fetchAllData(true)
      selectedEvents.clear()
      selectedEvents = new Set()
      showBulkMenu = false
      showToast(`✅ Deleted ${selectedEvents.size} events!`)
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  function exportToCSV() {
    const headers = ['Name', 'Date', 'Time', 'Type', 'Priority', 'Status', 'Info']
    const rows = filteredEvents.map(e => [
      e.name,
      e.date,
      e.time,
      e.event_type,
      e.priority,
      e.is_completed ? 'Completed' : 'Pending',
      e.info || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `events-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showToast('📥 Exported to CSV!')
  }

  function openAddModal() {
    resetForm()
    eventForm.date = new Date().toISOString().split('T')[0]
    showAddModal = true
  }

  function openEditModal(event) {
    eventForm = { ...event }
    showEditModal = event.id
  }

  function resetForm() {
    eventForm = {
      name: '',
      date: '',
      time: '10:00',
      event_type: 'Assignment',
      info: '',
      priority: 'normal',
      is_completed: false
    }
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

<!-- Toast Notification -->
{#if toast.show}
  <div class="fixed top-4 right-4 z-50 animate-slide-in">
    <div class="px-6 py-3 rounded-lg shadow-lg flex items-center gap-3" style="background-color: {toast.type === 'success' ? '#10b981' : '#ef4444'}; color: white;">
      <span class="text-xl">{toast.type === 'success' ? '✓' : '✗'}</span>
      <span class="font-semibold">{toast.message}</span>
    </div>
  </div>
{/if}

<div class="events-manager p-6 space-y-6">
  <!-- Header with Search and Actions -->
  <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
    <div class="flex-1 w-full md:w-auto">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl font-bold" style="color: var(--color-accent);">📅 Events Manager</h1>
        {#if selectedEvents.size > 0}
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-blue-600 text-white">
            {selectedEvents.size} selected
          </span>
        {/if}
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="🔍 Search events..."
          class="w-full px-4 py-2 pl-10 rounded-lg border-2"
          style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
        />
        <span class="absolute left-3 top-2.5 text-xl">🔍</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2 flex-wrap">
      {#if selectedEvents.size > 0}
        <button
          onclick={() => showBulkMenu = !showBulkMenu}
          class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style="background-color: #3b82f6; color: white;"
        >
          ⚡ Bulk Actions
        </button>
      {/if}
      <button
        onclick={exportToCSV}
        class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
        style="background-color: var(--color-card); color: var(--color-text); border: 2px solid var(--color-accent);"
      >
        📥 Export
      </button>
      <button
        onclick={openAddModal}
        class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
        style="background-color: var(--color-accent); color: var(--color-bg);"
      >
        ➕ Add Event
      </button>
    </div>
  </div>

  <!-- Bulk Actions Menu -->
  {#if showBulkMenu}
    <div class="p-4 rounded-lg flex gap-3" style="background-color: var(--color-card); border: 2px solid #3b82f6;">
      <button
        onclick={bulkMarkComplete}
        class="px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700"
      >
        ✓ Mark Complete
      </button>
      <button
        onclick={bulkDelete}
        class="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700"
      >
        🗑️ Delete
      </button>
      <button
        onclick={() => { selectedEvents.clear(); selectedEvents = new Set(); showBulkMenu = false }}
        class="px-4 py-2 rounded-lg font-semibold" style="background-color: var(--color-bg); color: var(--color-text);"
      >
        Cancel
      </button>
    </div>
  {/if}

  <!-- Filters and View Controls -->
  <div class="flex flex-wrap gap-3 items-center">
    <!-- View Mode -->
    <div class="flex gap-2">
      <button
        onclick={() => viewMode = 'cards'}
        class="px-3 py-2 rounded-lg font-semibold transition-all"
        style="background-color: {viewMode === 'cards' ? 'var(--color-accent)' : 'var(--color-card)'}; color: {viewMode === 'cards' ? 'var(--color-bg)' : 'var(--color-text)'};"
      >
        🎴 Cards
      </button>
      <button
        onclick={() => viewMode = 'table'}
        class="px-3 py-2 rounded-lg font-semibold transition-all"
        style="background-color: {viewMode === 'table' ? 'var(--color-accent)' : 'var(--color-card)'}; color: {viewMode === 'table' ? 'var(--color-bg)' : 'var(--color-text)'};"
      >
        📋 Table
      </button>
    </div>

    <!-- Filters -->
    <select bind:value={filterType} class="px-3 py-2 rounded-lg" style="background-color: var(--color-card); color: var(--color-text);">
      <option value="all">All Types</option>
      {#each eventTypes as type}
        <option value={type}>{type}</option>
      {/each}
    </select>

    <select bind:value={filterPriority} class="px-3 py-2 rounded-lg" style="background-color: var(--color-card); color: var(--color-text);">
      <option value="all">All Priorities</option>
      {#each priorities as priority}
        <option value={priority}>{priority}</option>
      {/each}
    </select>

    <select bind:value={filterStatus} class="px-3 py-2 rounded-lg" style="background-color: var(--color-card); color: var(--color-text);">
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
    </select>

    <!-- Sort -->
    <select bind:value={sortBy} class="px-3 py-2 rounded-lg" style="background-color: var(--color-card); color: var(--color-text);">
      <option value="date">Sort by Date</option>
      <option value="name">Sort by Name</option>
      <option value="priority">Sort by Priority</option>
      <option value="type">Sort by Type</option>
    </select>

    <button
      onclick={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
      class="px-3 py-2 rounded-lg font-semibold"
      style="background-color: var(--color-card); color: var(--color-text);"
    >
      {sortOrder === 'asc' ? '⬆️' : '⬇️'}
    </button>

    <!-- Results count -->
    <div class="ml-auto text-sm" style="color: var(--color-text); opacity: 0.7;">
      Showing {filteredEvents.length} of {$events.length} events
    </div>
  </div>

  <!-- Events Display -->
  {#if filteredEvents.length === 0}
    <div class="text-center py-12" style="background-color: var(--color-card); border-radius: 12px;">
      <div class="text-6xl mb-4">📭</div>
      <p class="text-xl font-bold" style="color: var(--color-text);">No events found</p>
      <p class="text-sm mt-2" style="color: var(--color-text); opacity: 0.7;">
        {searchQuery || filterType !== 'all' || filterPriority !== 'all' || filterStatus !== 'all'
          ? 'Try adjusting your filters'
          : 'Add your first event to get started'}
      </p>
    </div>
  {:else if viewMode === 'cards'}
    <!-- Cards View -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredEvents as event (event.id)}
        <div
          class="p-4 rounded-lg border-2 transition-all hover:scale-102 cursor-pointer"
          style="background-color: var(--color-card); border-color: {event.is_completed ? '#10b981' : getPriorityColor(event.priority)};"
        >
          <!-- Selection Checkbox -->
          <div class="flex items-start justify-between mb-3">
            <input
              type="checkbox"
              checked={selectedEvents.has(event.id)}
              onchange={() => toggleEventSelection(event.id)}
              class="mt-1"
            />
            <span class="text-2xl">{getEventTypeIcon(event.event_type)}</span>
          </div>

          <!-- Event Info -->
          <h3 class="font-bold text-lg mb-2" style="color: var(--color-text);">{event.name}</h3>

          <div class="space-y-1 text-sm mb-3" style="color: var(--color-text); opacity: 0.8;">
            <div>📅 {new Date(event.date).toLocaleDateString()}</div>
            <div>⏰ {formatTime(event.time)}</div>
            <div class="flex gap-2 flex-wrap mt-2">
              <span class="px-2 py-0.5 rounded-full text-xs" style="background-color: {getPriorityColor(event.priority)}; color: white;">
                {event.event_type}
              </span>
              <span class="px-2 py-0.5 rounded-full text-xs" style="background-color: var(--color-bg); color: var(--color-text);">
                {event.priority}
              </span>
              {#if event.is_completed}
                <span class="px-2 py-0.5 rounded-full text-xs bg-green-600 text-white">
                  ✓ Done
                </span>
              {/if}
            </div>
          </div>

          {#if event.info}
            <p class="text-sm mb-3" style="color: var(--color-text); opacity: 0.7;">
              {event.info.length > 80 ? event.info.substring(0, 80) + '...' : event.info}
            </p>
          {/if}

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              onclick={() => openEditModal(event)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-semibold"
              style="background-color: var(--color-accent); color: var(--color-bg);"
            >
              ✏️ Edit
            </button>
            <button
              onclick={() => handleDelete(event.id)}
              class="px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white"
            >
              🗑️
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Table View -->
    <div class="overflow-x-auto rounded-lg" style="background-color: var(--color-card);">
      <table class="w-full">
        <thead>
          <tr style="background-color: var(--color-bg);">
            <th class="p-3 text-left">
              <input
                type="checkbox"
                checked={selectAll}
                onchange={toggleSelectAll}
              />
            </th>
            <th class="p-3 text-left" style="color: var(--color-accent);">Name</th>
            <th class="p-3 text-left" style="color: var(--color-accent);">Date</th>
            <th class="p-3 text-left" style="color: var(--color-accent);">Time</th>
            <th class="p-3 text-left" style="color: var(--color-accent);">Type</th>
            <th class="p-3 text-left" style="color: var(--color-accent);">Priority</th>
            <th class="p-3 text-left" style="color: var(--color-accent);">Status</th>
            <th class="p-3 text-right" style="color: var(--color-accent);">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredEvents as event (event.id)}
            <tr class="border-t transition-colors hover:bg-opacity-50" style="border-color: var(--color-bg);">
              <td class="p-3">
                <input
                  type="checkbox"
                  checked={selectedEvents.has(event.id)}
                  onchange={() => toggleEventSelection(event.id)}
                />
              </td>
              <td class="p-3 font-semibold" style="color: var(--color-text);">
                {getEventTypeIcon(event.event_type)} {event.name}
              </td>
              <td class="p-3" style="color: var(--color-text);">{new Date(event.date).toLocaleDateString()}</td>
              <td class="p-3" style="color: var(--color-text);">{formatTime(event.time)}</td>
              <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs" style="background-color: {getPriorityColor(event.priority)}; color: white;">
                  {event.event_type}
                </span>
              </td>
              <td class="p-3">
                <span class="text-sm" style="color: {getPriorityColor(event.priority)};">
                  {event.priority}
                </span>
              </td>
              <td class="p-3">
                {#if event.is_completed}
                  <span class="px-2 py-1 rounded-full text-xs bg-green-600 text-white">
                    ✓ Done
                  </span>
                {:else}
                  <span class="px-2 py-1 rounded-full text-xs bg-yellow-600 text-white">
                    Pending
                  </span>
                {/if}
              </td>
              <td class="p-3 text-right">
                <button
                  onclick={() => openEditModal(event)}
                  class="px-3 py-1 rounded text-sm mr-2"
                  style="background-color: var(--color-accent); color: var(--color-bg);"
                >
                  Edit
                </button>
                <button
                  onclick={() => handleDelete(event.id)}
                  class="px-3 py-1 rounded text-sm bg-red-600 text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Add/Edit Modal (simplified for now) -->
{#if showAddModal || showEditModal}
  <div class="fixed inset-0 flex items-center justify-center p-4 z-50" style="background-color: rgba(0, 0, 0, 0.7);">
    <div class="w-full max-w-2xl rounded-lg p-6" style="background-color: var(--color-card);">
      <h2 class="text-2xl font-bold mb-4" style="color: var(--color-accent);">
        {showAddModal ? '➕ Add Event' : '✏️ Edit Event'}
      </h2>

      <form onsubmit={(e) => { e.preventDefault(); showAddModal ? handleAdd() : handleUpdate() }} class="space-y-4">
        <input
          type="text"
          bind:value={eventForm.name}
          placeholder="Event name"
          required
          class="w-full p-3 rounded-lg"
          style="background-color: var(--color-bg); color: var(--color-text);"
        />

        <div class="grid grid-cols-2 gap-4">
          <input
            type="date"
            bind:value={eventForm.date}
            required
            class="p-3 rounded-lg"
            style="background-color: var(--color-bg); color: var(--color-text);"
          />
          <input
            type="time"
            bind:value={eventForm.time}
            required
            class="p-3 rounded-lg"
            style="background-color: var(--color-bg); color: var(--color-text);"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <select bind:value={eventForm.event_type} class="p-3 rounded-lg" style="background-color: var(--color-bg); color: var(--color-text);">
            {#each eventTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
          <select bind:value={eventForm.priority} class="p-3 rounded-lg" style="background-color: var(--color-bg); color: var(--color-text);">
            {#each priorities as priority}
              <option value={priority}>{priority}</option>
            {/each}
          </select>
        </div>

        <textarea
          bind:value={eventForm.info}
          placeholder="Additional information (optional)"
          rows="3"
          class="w-full p-3 rounded-lg"
          style="background-color: var(--color-bg); color: var(--color-text);"
        ></textarea>

        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-3 rounded-lg font-semibold"
            style="background-color: var(--color-accent); color: var(--color-bg);"
          >
            {showAddModal ? '✅ Add Event' : '💾 Save Changes'}
          </button>
          <button
            type="button"
            onclick={() => { showAddModal = false; showEditModal = null; resetForm() }}
            class="px-4 py-3 rounded-lg font-semibold"
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
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }

  .hover\:scale-102:hover {
    transform: scale(1.02);
  }

  input[type="checkbox"] {
    accent-color: var(--color-accent);
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
</style>
