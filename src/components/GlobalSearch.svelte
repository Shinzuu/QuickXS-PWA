<script>
  import { events, routines } from '../lib/store'
  import { currentTheme } from '../lib/themeStore'
  import { formatTime } from '../lib/utils'

  let showSearch = $state(false)
  let searchQuery = $state('')
  let selectedIndex = $state(0)

  // Combined search results
  let searchResults = $derived.by(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return []

    const query = searchQuery.toLowerCase().trim()
    const results = []

    // Search in events
    $events.forEach(event => {
      const matchScore = getMatchScore(query, event)
      if (matchScore > 0) {
        results.push({
          type: 'event',
          data: event,
          score: matchScore,
          title: event.name,
          subtitle: `${new Date(event.date).toLocaleDateString()} at ${formatTime(event.time)}`,
          icon: getEventIcon(event.event_type),
          badge: event.is_completed ? '✓ Done' : event.priority
        })
      }
    })

    // Search in classes/routines
    $routines.forEach(routine => {
      if (routine.subject.toLowerCase().includes(query) ||
          routine.room?.toLowerCase().includes(query) ||
          routine.course_code?.toLowerCase().includes(query)) {
        results.push({
          type: 'class',
          data: routine,
          score: routine.subject.toLowerCase().startsWith(query) ? 100 : 50,
          title: routine.subject,
          subtitle: `${routine.day} - ${formatTime(routine.start_time)} to ${formatTime(routine.end_time)}`,
          icon: '📚',
          badge: routine.course_code || routine.room
        })
      }
    })

    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score).slice(0, 10)
  })

  function getMatchScore(query, event) {
    let score = 0
    const nameLower = event.name.toLowerCase()
    const infoLower = (event.info || '').toLowerCase()

    if (nameLower === query) score += 100
    else if (nameLower.startsWith(query)) score += 80
    else if (nameLower.includes(query)) score += 50

    if (infoLower.includes(query)) score += 20
    if (event.event_type.toLowerCase().includes(query)) score += 30

    return score
  }

  function getEventIcon(type) {
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

  function handleKeydown(e) {
    if (!showSearch) {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        showSearch = true
        selectedIndex = 0
      }
      return
    }

    // Navigate results with arrow keys
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault()
      selectResult(searchResults[selectedIndex])
    } else if (e.key === 'Escape') {
      closeSearch()
    }
  }

  function selectResult(result) {
    // Handle result selection based on type
    if (result.type === 'event') {
      // Could scroll to event in timeline or show details
      console.log('Selected event:', result.data)
    } else if (result.type === 'class') {
      // Could scroll to class in schedule
      console.log('Selected class:', result.data)
    }
    closeSearch()
  }

  function closeSearch() {
    showSearch = false
    searchQuery = ''
    selectedIndex = 0
  }

  // Setup keyboard listener
  $effect(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })
</script>

<!-- Search Button -->
<button
  onclick={() => showSearch = true}
  class="fixed bottom-20 right-4 z-50 p-4 rounded-full shadow-2xl transition-all hover:scale-110"
  style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
  title="Search (Ctrl+K)"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
</button>

<!-- Search Modal -->
{#if showSearch}
  <div
    class="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
    onclick={closeSearch}
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
      style="background-color: {$currentTheme.card};"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Search Input -->
      <div class="p-4 border-b" style="border-color: {$currentTheme.accent};">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6" style="color: {$currentTheme.accent};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search events and classes..."
            autofocus
            class="flex-1 bg-transparent outline-none text-lg"
            style="color: {$currentTheme.text};"
          />
          <kbd class="px-2 py-1 rounded text-xs" style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; opacity: 0.6;">
            ESC
          </kbd>
        </div>
      </div>

      <!-- Search Results -->
      <div class="max-h-[60vh] overflow-y-auto">
        {#if searchQuery.trim().length < 2}
          <div class="p-8 text-center" style="color: {$currentTheme.text}; opacity: 0.6;">
            <div class="text-4xl mb-2">🔍</div>
            <p>Type at least 2 characters to search</p>
            <p class="text-sm mt-2">Search events, classes, and more...</p>
          </div>
        {:else if searchResults.length === 0}
          <div class="p-8 text-center" style="color: {$currentTheme.text}; opacity: 0.6;">
            <div class="text-4xl mb-2">😕</div>
            <p>No results found for "{searchQuery}"</p>
          </div>
        {:else}
          <div class="divide-y" style="divide-color: {$currentTheme.bg};">
            {#each searchResults as result, index}
              <button
                class="w-full p-4 text-left transition-all hover:scale-[1.02]"
                style="background-color: {index === selectedIndex ? $currentTheme.bg : 'transparent'}; color: {$currentTheme.text};"
                onclick={() => selectResult(result)}
                onmouseenter={() => selectedIndex = index}
              >
                <div class="flex items-center gap-3">
                  <div class="text-3xl">{result.icon}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-semibold truncate">{result.title}</h3>
                      {#if result.badge}
                        <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};">
                          {result.badge}
                        </span>
                      {/if}
                    </div>
                    <p class="text-sm opacity-70 truncate">{result.subtitle}</p>
                  </div>
                  <svg class="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="p-3 border-t flex items-center justify-between text-xs" style="border-color: {$currentTheme.accent}; color: {$currentTheme.text}; opacity: 0.6;">
        <div class="flex items-center gap-4">
          <span>
            <kbd class="px-2 py-1 rounded" style="background-color: {$currentTheme.bg};">↑</kbd>
            <kbd class="px-2 py-1 rounded ml-1" style="background-color: {$currentTheme.bg};">↓</kbd>
            to navigate
          </span>
          <span>
            <kbd class="px-2 py-1 rounded" style="background-color: {$currentTheme.bg};">Enter</kbd>
            to select
          </span>
        </div>
        <span>{searchResults.length} results</span>
      </div>
    </div>
  </div>
{/if}

<style>
  kbd {
    font-family: monospace;
    font-size: 0.75rem;
  }
</style>
