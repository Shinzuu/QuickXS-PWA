<script>
  import { onMount } from 'svelte'
  import { loadCachedData, fetchAllData, isLoading, initialLoad, todayClasses, upcomingEvents, events } from './lib/store'
  import { requestNotificationPermission, scheduleClassNotifications, scheduleEventNotifications, scheduleDailySummary } from './lib/notifications'
  import { currentTheme } from './lib/themeStore'
  import { initWidgetService } from './lib/widgetService'
  import ErrorBoundary from './components/ErrorBoundary.svelte'
  import LoadingSkeleton from './components/LoadingSkeleton.svelte'
  import Toast from './components/Toast.svelte'
  import HeroCard from './components/HeroCard.svelte'
  import TodayClasses from './components/TodayClasses.svelte'
  import EventsTimeline from './components/EventsTimeline.svelte'
  import OfflineIndicator from './components/OfflineIndicator.svelte'
  import WeeklyRoutineTable from './components/WeeklyRoutineTable.svelte'
  import InstallPrompt from './components/InstallPrompt.svelte'
  import UpdatePrompt from './components/UpdatePrompt.svelte'
  import NotificationSettings from './components/NotificationSettings.svelte'
  import GlobalSearch from './components/GlobalSearch.svelte'
  import UserSettings from './components/UserSettings.svelte'
  import CalendarSkeleton from './components/CalendarSkeleton.svelte'
  import StatisticsSkeleton from './components/StatisticsSkeleton.svelte'
  import KeyboardShortcuts from './components/KeyboardShortcuts.svelte'

  // Lazy load heavy components (only loaded when needed)
  const EventsArchive = import('./components/EventsArchive.svelte')
  const AdminAuth = import('./components/AdminAuth.svelte')
  const CalendarView = import('./components/CalendarView.svelte')
  const Statistics = import('./components/Statistics.svelte')

  let refreshing = $state(false)
  let showEventsArchive = $state(false)
  let showAdminPanel = $state(false)
  let showCalendar = $state(false)
  let showStatistics = $state(false)
  let pullStartY = $state(0)
  let pullDistance = $state(0)
  let isPulling = $state(false)
  let notificationsEnabled = $state(false)

  // Component references
  let globalSearchComponent = $state(null)
  let notificationSettingsComponent = $state(null)

  onMount(async () => {
    // Load cached data immediately for instant display (non-blocking)
    loadCachedData()

    // Fetch fresh data in background (don't await)
    fetchAllData()

    // Defer non-critical tasks to when browser is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        initWidgetService()

        // Request notification permission after idle
        setTimeout(async () => {
          const granted = await requestNotificationPermission()
          notificationsEnabled = granted
          if (granted) {
            if ($todayClasses.length > 0) {
              scheduleClassNotifications($todayClasses)
            }
            if ($upcomingEvents.length > 0) {
              scheduleEventNotifications($upcomingEvents)
            }
            scheduleDailySummary($todayClasses, $upcomingEvents)
          }
        }, 3000)
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        initWidgetService()
        setTimeout(async () => {
          const granted = await requestNotificationPermission()
          notificationsEnabled = granted
          if (granted) {
            if ($todayClasses.length > 0) {
              scheduleClassNotifications($todayClasses)
            }
            if ($upcomingEvents.length > 0) {
              scheduleEventNotifications($upcomingEvents)
            }
            scheduleDailySummary($todayClasses, $upcomingEvents)
          }
        }, 3000)
      }, 100)
    }

    // Set up periodic refresh (every 15 minutes)
    const refreshInterval = setInterval(() => {
      if (!document.hidden && navigator.onLine) {
        fetchAllData()
      }
    }, 15 * 60 * 1000)

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine) {
        fetchAllData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Pull-to-refresh setup
    let startY = 0
    const threshold = 80

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        pullStartY = startY
      }
    }

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && startY > 0) {
        const currentY = e.touches[0].clientY
        const distance = currentY - startY

        if (distance > 0) {
          pullDistance = Math.min(distance, threshold * 1.5)
          isPulling = true
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (isPulling && pullDistance >= threshold) {
        await handleRefresh()
      }
      startY = 0
      pullDistance = 0
      isPulling = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  })

  async function handleRefresh() {
    refreshing = true
    await fetchAllData()
    refreshing = false
  }
</script>

<ErrorBoundary>
{#if $initialLoad}
  <LoadingSkeleton />
{:else}
<div class="app min-h-screen p-3" style="background-color: {$currentTheme.bg};">
  <!-- Navigation Bar -->
  <div class="mb-6 p-4 rounded-lg flex items-start justify-between gap-4" style="background-color: {$currentTheme.card}; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);">
    <!-- Logo -->
    <h1 class="text-2xl font-bold flex-shrink-0" style="color: {$currentTheme.accent};">QuickXS</h1>

    <!-- Navigation Icons - 2 Rows -->
    <div class="flex flex-col gap-2 flex-1">
      <!-- Row 1: Main Navigation -->
      <div class="flex gap-2 justify-end flex-wrap">
        <button
          onclick={() => {
            showCalendar = false
            showEventsArchive = false
            showStatistics = false
            showAdminPanel = false
          }}
          class="px-3 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
          style="background-color: {!showCalendar && !showEventsArchive && !showStatistics && !showAdminPanel ? $currentTheme.accent : $currentTheme.bg}; color: {!showCalendar && !showEventsArchive && !showStatistics && !showAdminPanel ? $currentTheme.bg : $currentTheme.accent}; border: 2px solid {$currentTheme.accent};"
          title="Home"
        >
          🏠
        </button>
        <button
          onclick={() => {
            showCalendar = !showCalendar
            if (showCalendar) {
              showAdminPanel = false
              showEventsArchive = false
              showStatistics = false
            }
          }}
          class="px-3 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
          style="background-color: {showCalendar ? $currentTheme.accent : $currentTheme.bg}; color: {showCalendar ? $currentTheme.bg : $currentTheme.accent}; border: 2px solid {$currentTheme.accent};"
          title="Calendar"
        >
          📅
        </button>
        <button
          onclick={() => {
            showEventsArchive = !showEventsArchive
            if (showEventsArchive) {
              showAdminPanel = false
              showCalendar = false
              showStatistics = false
            }
          }}
          class="px-3 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
          style="background-color: {showEventsArchive ? $currentTheme.accent : $currentTheme.bg}; color: {showEventsArchive ? $currentTheme.bg : $currentTheme.accent}; border: 2px solid {$currentTheme.accent};"
          title="Events Archive"
        >
          📚
        </button>
        <button
          onclick={() => {
            showStatistics = !showStatistics
            if (showStatistics) {
              showAdminPanel = false
              showEventsArchive = false
              showCalendar = false
            }
          }}
          class="px-3 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
          style="background-color: {showStatistics ? $currentTheme.accent : $currentTheme.bg}; color: {showStatistics ? $currentTheme.bg : $currentTheme.accent}; border: 2px solid {$currentTheme.accent};"
          title="Statistics"
        >
          📊
        </button>
      </div>

      <!-- Row 2: Utility Navigation -->
      <div class="flex gap-2 justify-end flex-wrap">
        <button
          onclick={() => {
            showAdminPanel = !showAdminPanel
            if (showAdminPanel) {
              showEventsArchive = false
              showCalendar = false
              showStatistics = false
            }
          }}
          class="px-3 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
          style="background-color: {showAdminPanel ? $currentTheme.accent : $currentTheme.bg}; color: {showAdminPanel ? $currentTheme.bg : $currentTheme.accent}; border: 2px solid {$currentTheme.accent};"
          title="Admin Panel"
        >
          🔧
        </button>
        <button
          onclick={() => globalSearchComponent?.open()}
          class="px-3 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
          style="background-color: {$currentTheme.bg}; color: {$currentTheme.accent}; border: 2px solid {$currentTheme.accent};"
          title="Search (Ctrl+K)"
        >
          🔍
        </button>
        <UserSettings />
      </div>
    </div>
  </div>

  <!-- Pull-to-refresh indicator -->
  {#if isPulling || refreshing}
    <div
      class="fixed top-0 left-0 right-0 flex justify-center transition-all z-50"
      style="
        transform: translateY({refreshing ? '20px' : pullDistance > 0 ? `${pullDistance - 40}px` : '-100px'});
        opacity: {pullDistance > 40 || refreshing ? 1 : pullDistance / 40};
      "
    >
      <div class="flex items-center gap-2 px-4 py-2 rounded-full" style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg}; box-shadow: 0 4px 12px {$currentTheme.accent}66;">
        {#if refreshing}
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style="border-color: {$currentTheme.bg}; border-top-color: transparent;"></div>
          <span class="font-bold text-sm">Refreshing...</span>
        {:else}
          <span class="text-lg">{pullDistance >= 80 ? '🔄' : '⬇️'}</span>
          <span class="font-bold text-sm">{pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}</span>
        {/if}
      </div>
    </div>
  {/if}

  <OfflineIndicator />

  {#if $isLoading}
    <div class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-3 border-t-transparent mx-auto mb-4" style="border-color: {$currentTheme.accent}; border-top-color: transparent;"></div>
        <p style="color: {$currentTheme.text};">Loading schedule...</p>
      </div>
    </div>
  {:else if showAdminPanel}
    <!-- Admin Panel Page (with Authentication) -->
    {#await AdminAuth then {default: Component}}
      <Component />
    {/await}
  {:else if showCalendar}
    <!-- Calendar View Page -->
    {#await CalendarView}
      <CalendarSkeleton />
    {:then {default: Component}}
      <Component />
    {/await}
  {:else if showStatistics}
    <!-- Statistics Page -->
    {#await Statistics}
      <StatisticsSkeleton />
    {:then {default: Component}}
      <Component />
    {/await}
  {:else if showEventsArchive}
    <!-- Events Archive Page -->
    {#await EventsArchive}
      <LoadingSkeleton />
    {:then {default: Component}}
      <Component />
    {/await}
  {:else}
    <!-- Top Row: Hero Card -->
    <div class="mb-6">
      <HeroCard />
    </div>

    <!-- Main Content: 2 Columns Layout with Equal Heights -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Column 1: Today's Classes -->
      <div class="card-container rounded-lg p-6 flex flex-col" style="background-color: {$currentTheme.card}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
        <TodayClasses />
      </div>

      <!-- Column 2: Upcoming Events (Expanded) -->
      <div class="card-container rounded-lg p-6 flex flex-col" style="background-color: {$currentTheme.card}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
        <EventsTimeline />
      </div>
    </div>

    <!-- Weekly Routine Table - Full Width -->
    <div class="mb-6">
      <div class="card-container rounded-lg p-6" style="background-color: {$currentTheme.card}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
        <WeeklyRoutineTable />
      </div>
    </div>

    <!-- Notification Settings -->
    <NotificationSettings bind:this={notificationSettingsComponent} />

    <!-- Quick Links Section -->
    <div class="mb-6">
      <div class="card-container rounded-lg p-6" style="background-color: {$currentTheme.card}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: {$currentTheme.accent};">
          🔗 Quick Links
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="http://101.2.163.149/studenteng/Signin.aspx"
            target="_blank"
            class="flex items-center gap-3 p-4 rounded-lg transition-all hover:scale-105"
            style="background-color: {$currentTheme.bg}; border: 2px solid {$currentTheme.accent};"
          >
            <svg class="w-6 h-6" style="color: {$currentTheme.accent};" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
            <div>
              <div class="font-bold" style="color: {$currentTheme.text};">University Portal</div>
              <div class="text-sm" style="color: {$currentTheme.text}; opacity: 0.7;">Student Login</div>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="text-center text-sm py-4" style="color: {$currentTheme.text}; opacity: 0.5;">
      <p>QuickXS • shinzuu</p>
    </footer>
  {/if}

  <!-- PWA Install Prompt -->
  <InstallPrompt />

  <!-- PWA Update Prompt -->
  <UpdatePrompt />

  <!-- Global Search -->
  <GlobalSearch bind:this={globalSearchComponent} />

  <!-- Keyboard Shortcuts -->
  <KeyboardShortcuts
    onHome={() => {
      showCalendar = false
      showEventsArchive = false
      showStatistics = false
      showAdminPanel = false
    }}
    onCalendar={() => {
      showCalendar = true
      showEventsArchive = false
      showStatistics = false
      showAdminPanel = false
    }}
    onArchive={() => {
      showEventsArchive = true
      showCalendar = false
      showStatistics = false
      showAdminPanel = false
    }}
    onStats={() => {
      showStatistics = true
      showCalendar = false
      showEventsArchive = false
      showAdminPanel = false
    }}
    onAdmin={() => {
      showAdminPanel = true
      showCalendar = false
      showEventsArchive = false
      showStatistics = false
    }}
    onRefresh={handleRefresh}
    onSettings={() => {
      // Settings modal is handled by UserSettings component
      // We could add a prop to open it programmatically
    }}
  />
</div>

<style>
  /* === Animations === */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  /* === Animation Classes === */
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  .animate-slide-in {
    animation: slideIn 0.4s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }

  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  /* === Card Styles === */
  .card-container {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeIn 0.5s ease-out;
  }

  .card-container:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 173, 181, 0.3) !important;
  }

  /* === Staggered Animations === */
  .card-container:nth-child(1) { animation-delay: 0.05s; }
  .card-container:nth-child(2) { animation-delay: 0.1s; }
  .card-container:nth-child(3) { animation-delay: 0.15s; }
  .card-container:nth-child(4) { animation-delay: 0.2s; }
  .card-container:nth-child(5) { animation-delay: 0.25s; }

  /* === Button Effects === */
  button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  button:active {
    transform: scale(0.97);
  }

  /* === Smooth Scroll === */
  * {
    scroll-behavior: smooth;
  }

  /* === Focus Styles === */
  *:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
{/if}

<!-- Toast notifications -->
<Toast />
</ErrorBoundary>
