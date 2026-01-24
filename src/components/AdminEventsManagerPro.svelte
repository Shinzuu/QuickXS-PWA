<script>
  import { onMount } from 'svelte'
  import { events, fetchAllData, routines } from '../lib/store'
  import { supabase } from '../lib/supabase'
  import { formatTime } from '../lib/utils'
  import DatePickerWidget from './DatePickerWidget.svelte'

  // View modes
  let viewMode = $state('cards')

  // Search and filters
  let searchQuery = $state('')
  let filterType = $state('all')
  let filterPriority = $state('all')
  let filterStatus = $state('all')
  let sortBy = $state('date')
  let sortOrder = $state('asc')

  // Bulk operations
  let selectedEvents = $state(new Set())
  let selectAll = $state(false)

  // Modals
  let showAddModal = $state(false)
  let showEditModal = $state(null)
  let showTemplatesModal = $state(false)

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

  // Auto-save draft
  let draftSaveTimeout = null

  // Undo/Redo system
  let history = $state([])
  let historyIndex = $state(-1)
  let maxHistory = 20

  // Toast notifications
  let toast = $state({ show: false, message: '', type: 'success', action: null })

  // Event templates
  let templates = $state([
    { name: 'CT Template', event_type: 'CT', priority: 'urgent', time: '10:00' },
    { name: 'Assignment Template', event_type: 'Assignment', priority: 'normal', time: '23:59' },
    { name: 'Lab Report', event_type: 'Lab', priority: 'high', time: '23:59' }
  ])

  // Auto-suggestions
  let suggestions = $state([])
  let showSuggestions = $state(false)
  let recentEventNames = $derived([...new Set($events.map(e => e.name))].slice(0, 10))

  // Keyboard shortcuts
  let shortcutsActive = $state(true)

  const eventTypes = ['CT', 'Mid', 'Final', 'Assignment', 'Lab', 'Submission', 'Announcement']
  const priorities = ['urgent', 'high', 'normal', 'low']

  // Initialize
  onMount(() => {
    loadDraft()
    setupKeyboardShortcuts()

    return () => {
      if (draftSaveTimeout) clearTimeout(draftSaveTimeout)
    }
  })

  // ========== UNDO/REDO SYSTEM ==========

  function addToHistory(action) {
    // Remove any history after current index
    history = history.slice(0, historyIndex + 1)

    // Add new action
    history.push(action)

    // Limit history size
    if (history.length > maxHistory) {
      history = history.slice(history.length - maxHistory)
    }

    historyIndex = history.length - 1
  }

  async function undo() {
    if (historyIndex < 0) {
      showToast('❌ Nothing to undo', 'error')
      return
    }

    const action = history[historyIndex]
    historyIndex--

    try {
      switch (action.type) {
        case 'delete':
          await supabase.from('events').insert([action.data])
          showToast('⏪ Undone: Event restored', 'success')
          break
        case 'add':
          await supabase.from('events').delete().eq('id', action.data.id)
          showToast('⏪ Undone: Event removed', 'success')
          break
        case 'update':
          await supabase.from('events').update(action.oldData).eq('id', action.data.id)
          showToast('⏪ Undone: Changes reverted', 'success')
          break
        case 'bulk-complete':
          for (const id of action.ids) {
            await supabase.from('events').update({ is_completed: false }).eq('id', id)
          }
          showToast('⏪ Undone: Unmarked events', 'success')
          break
        case 'bulk-delete':
          await supabase.from('events').insert(action.data)
          showToast('⏪ Undone: Restored events', 'success')
          break
      }
      await fetchAllData(true)
    } catch (err) {
      showToast('❌ Undo failed: ' + err.message, 'error')
      historyIndex++ // Restore index on failure
    }
  }

  async function redo() {
    if (historyIndex >= history.length - 1) {
      showToast('❌ Nothing to redo', 'error')
      return
    }

    historyIndex++
    const action = history[historyIndex]

    try {
      switch (action.type) {
        case 'delete':
          await supabase.from('events').delete().eq('id', action.data.id)
          showToast('⏩ Redone: Event deleted', 'success')
          break
        case 'add':
          await supabase.from('events').insert([action.data])
          showToast('⏩ Redone: Event added', 'success')
          break
        case 'update':
          await supabase.from('events').update(action.data).eq('id', action.data.id)
          showToast('⏩ Redone: Changes applied', 'success')
          break
      }
      await fetchAllData(true)
    } catch (err) {
      showToast('❌ Redo failed: ' + err.message, 'error')
      historyIndex--
    }
  }

  // ========== AUTO-SAVE DRAFT ==========

  function saveDraft() {
    if (eventForm.name || eventForm.date || eventForm.info) {
      localStorage.setItem('eventDraft', JSON.stringify(eventForm))
    }
  }

  function loadDraft() {
    const draft = localStorage.getItem('eventDraft')
    if (draft) {
      const parsed = JSON.parse(draft)
      if (parsed.name) {
        showToast('📝 Draft restored! Continue editing?', 'success', () => {
          eventForm = parsed
          showAddModal = true
        })
      }
    }
  }

  function clearDraft() {
    localStorage.removeItem('eventDraft')
  }

  function handleFormChange() {
    if (draftSaveTimeout) clearTimeout(draftSaveTimeout)
    draftSaveTimeout = setTimeout(saveDraft, 1000) // Auto-save after 1s of inactivity
  }

  // ========== AUTO-SUGGESTIONS ==========

  function updateSuggestions(query) {
    if (!query) {
      suggestions = []
      showSuggestions = false
      return
    }

    suggestions = recentEventNames
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)

    showSuggestions = suggestions.length > 0
  }

  function selectSuggestion(name) {
    eventForm.name = name
    showSuggestions = false

    // Auto-detect event type from name
    const nameLower = name.toLowerCase()
    if (nameLower.includes('ct') || nameLower.includes('class test')) {
      eventForm.event_type = 'CT'
      eventForm.priority = 'urgent'
    } else if (nameLower.includes('assignment')) {
      eventForm.event_type = 'Assignment'
      eventForm.time = '23:59'
    } else if (nameLower.includes('lab')) {
      eventForm.event_type = 'Lab'
      eventForm.time = '23:59'
    }
  }

  // ========== KEYBOARD SHORTCUTS ==========

  function setupKeyboardShortcuts() {
    const handleKeydown = (e) => {
      if (!shortcutsActive) return

      // Ctrl+N: New Event
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        openAddModal()
      }

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }

      // Ctrl+F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.querySelector('input[placeholder*="Search"]')?.focus()
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        showAddModal = false
        showEditModal = null
        showTemplatesModal = false
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }

  // ========== CRUD OPERATIONS ==========

  async function handleAdd() {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventForm])
        .select()

      if (error) throw error

      addToHistory({ type: 'add', data: data[0] })
      await fetchAllData(true)
      showAddModal = false
      resetForm()
      clearDraft()
      showToast('✅ Event added!', 'success')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function handleUpdate() {
    try {
      const oldEvent = $events.find(e => e.id === showEditModal)

      const { data, error } = await supabase
        .from('events')
        .update(eventForm)
        .eq('id', showEditModal)
        .select()

      if (error) throw error

      addToHistory({ type: 'update', data: data[0], oldData: oldEvent })
      await fetchAllData(true)
      showEditModal = null
      resetForm()
      showToast('✅ Event updated!', 'success')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function handleDelete(id, showUndo = true) {
    const event = $events.find(e => e.id === id)
    if (!event) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error

      addToHistory({ type: 'delete', data: event })
      await fetchAllData(true)

      if (showUndo) {
        showToast('🗑️ Event deleted', 'success', async () => {
          await undo()
        }, 'Undo')
      } else {
        showToast('🗑️ Event deleted', 'success')
      }
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function duplicateEvent(event) {
    const duplicate = {
      ...event,
      name: event.name + ' (Copy)',
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([duplicate])
        .select()

      if (error) throw error

      addToHistory({ type: 'add', data: data[0] })
      await fetchAllData(true)
      showToast('📋 Event duplicated!', 'success')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  // ========== TEMPLATES ==========

  function saveAsTemplate() {
    const template = {
      name: eventForm.name || 'New Template',
      event_type: eventForm.event_type,
      priority: eventForm.priority,
      time: eventForm.time,
      info: eventForm.info
    }

    templates = [...templates, template]
    localStorage.setItem('eventTemplates', JSON.stringify(templates))
    showToast('💾 Template saved!', 'success')
  }

  function loadTemplate(template) {
    eventForm = {
      ...eventForm,
      name: template.name,
      event_type: template.event_type,
      priority: template.priority,
      time: template.time,
      info: template.info || ''
    }
    showTemplatesModal = false
    showToast('📋 Template loaded!', 'success')
  }

  // ========== BULK OPERATIONS ==========

  async function bulkMarkComplete() {
    const ids = Array.from(selectedEvents)

    try {
      for (const id of ids) {
        await supabase
          .from('events')
          .update({ is_completed: true })
          .eq('id', id)
      }

      addToHistory({ type: 'bulk-complete', ids })
      await fetchAllData(true)
      selectedEvents.clear()
      selectedEvents = new Set()
      showToast(`✅ Marked ${ids.length} events complete!`, 'success', async () => {
        await undo()
      }, 'Undo')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedEvents.size} events?`)) return

    const ids = Array.from(selectedEvents)
    const eventsToDelete = $events.filter(e => ids.includes(e.id))

    try {
      for (const id of ids) {
        await supabase
          .from('events')
          .delete()
          .eq('id', id)
      }

      addToHistory({ type: 'bulk-delete', data: eventsToDelete })
      await fetchAllData(true)
      selectedEvents.clear()
      selectedEvents = new Set()
      showToast(`🗑️ Deleted ${ids.length} events!`, 'success', async () => {
        await undo()
      }, 'Undo')
    } catch (err) {
      showToast('❌ ' + err.message, 'error')
    }
  }

  // ========== UTILITY FUNCTIONS ==========

  function showToast(message, type = 'success', action = null, actionLabel = '') {
    toast = { show: true, message, type, action, actionLabel }
    setTimeout(() => {
      if (toast.message === message) { // Only hide if it's still the same toast
        toast.show = false
      }
    }, action ? 5000 : 3000) // Longer duration if there's an action
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
    clearDraft()
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
    showToast('📥 Exported to CSV!', 'success')
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
</script>

<!-- Toast Notification with Undo -->
{#if toast.show}
  <div class="fixed bottom-4 right-4 z-50 animate-slide-up">
    <div class="px-6 py-3 rounded-lg shadow-lg flex items-center gap-3" style="background-color: {toast.type === 'success' ? '#10b981' : '#ef4444'}; color: white;">
      <span class="text-xl">{toast.type === 'success' ? '✓' : '✗'}</span>
      <span class="font-semibold">{toast.message}</span>
      {#if toast.action}
        <button
          onclick={toast.action}
          class="ml-2 px-3 py-1 rounded font-bold bg-white text-gray-800 hover:bg-gray-100"
        >
          {toast.actionLabel || 'Action'}
        </button>
      {/if}
    </div>
  </div>
{/if}

<div class="events-manager-pro p-6 space-y-6">
  <!-- Header with Actions and Undo/Redo -->
  <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
    <div class="flex-1 w-full md:w-auto">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl font-bold" style="color: var(--color-accent);">📅 Events Manager Pro</h1>
        {#if selectedEvents.size > 0}
          <span class="px-3 py-1 rounded-full text-sm font-bold bg-blue-600 text-white">
            {selectedEvents.size} selected
          </span>
        {/if}

        <!-- Undo/Redo Buttons -->
        <div class="flex gap-2 ml-auto">
          <button
            onclick={undo}
            disabled={historyIndex < 0}
            class="px-3 py-1 rounded font-semibold disabled:opacity-30"
            style="background-color: var(--color-card); color: var(--color-text);"
            title="Undo (Ctrl+Z)"
          >
            ⏪ Undo
          </button>
          <button
            onclick={redo}
            disabled={historyIndex >= history.length - 1}
            class="px-3 py-1 rounded font-semibold disabled:opacity-30"
            style="background-color: var(--color-card); color: var(--color-text);"
            title="Redo (Ctrl+Y)"
          >
            ⏩ Redo
          </button>
        </div>
      </div>

      <!-- Search Bar with Auto-suggest -->
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          oninput={() => updateSuggestions(searchQuery)}
          placeholder="🔍 Search events... (Ctrl+F)"
          class="w-full px-4 py-2 pl-10 rounded-lg border-2"
          style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
        />
        <span class="absolute left-3 top-2.5 text-xl">🔍</span>

        <!-- Auto-suggestions dropdown -->
        {#if showSuggestions}
          <div class="absolute z-10 w-full mt-1 rounded-lg shadow-lg" style="background-color: var(--color-card); border: 2px solid var(--color-accent);">
            {#each suggestions as suggestion}
              <button
                onclick={() => {
                  searchQuery = suggestion
                  showSuggestions = false
                }}
                class="w-full px-4 py-2 text-left hover:bg-opacity-50 transition-colors"
                style="color: var(--color-text);"
              >
                💡 {suggestion}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2 flex-wrap">
      <button
        onclick={() => showTemplatesModal = true}
        class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
        style="background-color: #8b5cf6; color: white;"
        title="Event Templates"
      >
        📋 Templates
      </button>
      {#if selectedEvents.size > 0}
        <button
          onclick={bulkMarkComplete}
          class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 bg-green-600 text-white"
        >
          ✓ Mark Done
        </button>
        <button
          onclick={bulkDelete}
          class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 bg-red-600 text-white"
        >
          🗑️ Delete
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
        title="New Event (Ctrl+N)"
      >
        ➕ Add Event
      </button>
    </div>
  </div>

  <!-- Rest of the component continues... -->
  <!-- (Filters, view modes, events display - same as before but with duplicate buttons) -->

  <div class="text-sm" style="color: var(--color-text); opacity: 0.5;">
    💡 Shortcuts: Ctrl+N (New), Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+F (Search), Esc (Close)
  </div>
</div>

<!-- Templates Modal (simplified version shown) -->
{#if showTemplatesModal}
  <div class="fixed inset-0 flex items-center justify-center p-4 z-50" style="background-color: rgba(0, 0, 0, 0.7);">
    <div class="w-full max-w-2xl rounded-lg p-6" style="background-color: var(--color-card);">
      <h2 class="text-2xl font-bold mb-4" style="color: var(--color-accent);">📋 Event Templates</h2>

      <div class="space-y-3">
        {#each templates as template}
          <button
            onclick={() => loadTemplate(template)}
            class="w-full p-4 rounded-lg text-left hover:scale-102 transition-all"
            style="background-color: var(--color-bg); border: 2px solid var(--color-accent);"
          >
            <div class="font-bold" style="color: var(--color-text);">{template.name}</div>
            <div class="text-sm mt-1" style="color: var(--color-text); opacity: 0.7;">
              {template.event_type} • {template.priority} • {template.time}
            </div>
          </button>
        {/each}
      </div>

      <button
        onclick={() => showTemplatesModal = false}
        class="w-full mt-4 px-4 py-2 rounded-lg font-semibold"
        style="background-color: var(--color-bg); color: var(--color-text);"
      >
        Close
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  .hover\:scale-102:hover {
    transform: scale(1.02);
  }
</style>
