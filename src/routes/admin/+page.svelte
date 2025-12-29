<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { getAllClasses } from '$lib/admin/routinesApi'
  import { getAllEvents } from '$lib/admin/eventsApi'
  import { getAllLinks } from '$lib/admin/linksApi'

  let stats = $state({
    totalClasses: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalLinks: 0
  })
  let loading = $state(true)
  let recentEvents = $state([])

  onMount(async () => {
    try {
      const [classes, events, links] = await Promise.all([
        getAllClasses(),
        getAllEvents(),
        getAllLinks()
      ])

      const now = new Date()
      const upcoming = events.filter(e => {
        const eventDate = new Date(e.date)
        return eventDate >= now && !e.is_completed
      })

      stats = {
        totalClasses: classes.length,
        totalEvents: events.length,
        upcomingEvents: upcoming.length,
        totalLinks: links.length
      }

      recentEvents = upcoming.slice(0, 5)
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      loading = false
    }
  })
</script>

<div class="space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold" style="color: #00ADB5;">Dashboard</h1>
    <p class="mt-2 text-gray-400">Overview of your QuickXS data</p>
  </div>

  {#if loading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 mx-auto" style="border-color: #00ADB5;"></div>
      <p class="mt-4 text-gray-400">Loading dashboard...</p>
    </div>
  {:else}
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Classes -->
      <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Total Classes</p>
            <p class="text-3xl font-bold mt-2" style="color: #00ADB5;">{stats.totalClasses}</p>
          </div>
          <div class="p-3 rounded-lg" style="background-color: rgba(0, 173, 181, 0.2);">
            <svg class="w-8 h-8" style="color: #00ADB5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        <a href="/admin/classes" class="block mt-4 text-sm hover:underline" style="color: #00ADB5;">
          Manage Classes →
        </a>
      </div>

      <!-- Total Events -->
      <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Total Events</p>
            <p class="text-3xl font-bold mt-2" style="color: #00ADB5;">{stats.totalEvents}</p>
          </div>
          <div class="p-3 rounded-lg" style="background-color: rgba(0, 173, 181, 0.2);">
            <svg class="w-8 h-8" style="color: #00ADB5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <a href="/admin/events" class="block mt-4 text-sm hover:underline" style="color: #00ADB5;">
          Manage Events →
        </a>
      </div>

      <!-- Upcoming Events -->
      <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Upcoming Events</p>
            <p class="text-3xl font-bold mt-2" style="color: #FFB74D;">{stats.upcomingEvents}</p>
          </div>
          <div class="p-3 rounded-lg" style="background-color: rgba(255, 183, 77, 0.2);">
            <svg class="w-8 h-8" style="color: #FFB74D;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-400">Not completed</p>
      </div>

      <!-- Total Links -->
      <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Study Links</p>
            <p class="text-3xl font-bold mt-2" style="color: #00ADB5;">{stats.totalLinks}</p>
          </div>
          <div class="p-3 rounded-lg" style="background-color: rgba(0, 173, 181, 0.2);">
            <svg class="w-8 h-8" style="color: #00ADB5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>
        <a href="/admin/links" class="block mt-4 text-sm hover:underline" style="color: #00ADB5;">
          Manage Links →
        </a>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
      <h2 class="text-xl font-bold mb-4" style="color: #EEEEEE;">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onclick={() => goto('/admin/classes')}
          class="p-4 rounded-lg text-left transition-all hover:scale-105"
          style="background-color: #222831; border: 2px solid #00ADB5;"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" style="color: #00ADB5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div>
              <p class="font-bold" style="color: #EEEEEE;">Add Class</p>
              <p class="text-sm text-gray-400">Create new class</p>
            </div>
          </div>
        </button>

        <button
          onclick={() => goto('/admin/events')}
          class="p-4 rounded-lg text-left transition-all hover:scale-105"
          style="background-color: #222831; border: 2px solid #00ADB5;"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" style="color: #00ADB5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div>
              <p class="font-bold" style="color: #EEEEEE;">Add Event</p>
              <p class="text-sm text-gray-400">Create new event</p>
            </div>
          </div>
        </button>

        <button
          onclick={() => goto('/admin/links')}
          class="p-4 rounded-lg text-left transition-all hover:scale-105"
          style="background-color: #222831; border: 2px solid #00ADB5;"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" style="color: #00ADB5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div>
              <p class="font-bold" style="color: #EEEEEE;">Add Link</p>
              <p class="text-sm text-gray-400">Create new link</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Upcoming Events List -->
    {#if recentEvents.length > 0}
      <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
        <h2 class="text-xl font-bold mb-4" style="color: #EEEEEE;">Upcoming Events</h2>
        <div class="space-y-3">
          {#each recentEvents as event}
            <div class="p-4 rounded-lg flex items-center justify-between" style="background-color: #222831;">
              <div class="flex-1">
                <p class="font-bold" style="color: #EEEEEE;">{event.name}</p>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-400">
                  <span>{event.date}</span>
                  <span>{event.time}</span>
                  <span class="px-2 py-0.5 rounded text-xs" style="background-color: rgba(0, 173, 181, 0.2); color: #00ADB5;">
                    {event.event_type}
                  </span>
                </div>
              </div>
              <a
                href="/admin/events"
                class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style="background-color: #00ADB5; color: #222831;"
              >
                View
              </a>
            </div>
          {/each}
        </div>
        <a href="/admin/events" class="block mt-4 text-center text-sm hover:underline" style="color: #00ADB5;">
          View All Events →
        </a>
      </div>
    {/if}
  {/if}
</div>

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
