<script>
  import { currentClass, nextClass, upcomingEvents } from '../lib/store'
  import {
    formatTime,
    formatMinutes,
    getTimeRemainingInClass,
    getTimeUntilClass,
    getDaysUntil,
    formatCountdown
  } from '../lib/utils'
  import { onMount, onDestroy } from 'svelte'
  import Confetti from './Confetti.svelte'

  let highlightItem = $state(null)
  let timer
  let showConfetti = $state(false)
  let confettiShown = $state(false)
  let greeting = $state('')

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return '☀️ Good Morning'
    if (hour < 17) return '🌤️ Good Afternoon'
    if (hour < 20) return '🌆 Good Evening'
    return '🌙 Good Night'
  }

  // Update every minute, but pause when tab is hidden to save battery
  onMount(() => {
    greeting = getGreeting()
    updateHighlight()

    const startTimer = () => {
      timer = setInterval(() => {
        greeting = getGreeting()
        updateHighlight()
      }, 60000) // Update every minute
    }

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    // Start timer initially
    startTimer()

    // Pause timer when tab is hidden (battery optimization)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer()
      } else {
        // Update immediately when tab becomes visible
        greeting = getGreeting()
        updateHighlight()
        startTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopTimer()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  onDestroy(() => {
    if (timer) clearInterval(timer)
  })

  function updateHighlight() {
    // Priority logic from planning
    if ($currentClass) {
      highlightItem = {
        type: 'current',
        title: 'NOW',
        emoji: '📍',
        subject: $currentClass.subject,
        time: formatTime($currentClass.time),
        location: `Room ${$currentClass.classroom}`,
        teacher: $currentClass.teacher,
        countdown: `${formatMinutes(getTimeRemainingInClass($currentClass.time, $currentClass.duration))} left`,
        color: 'green'
      }
    } else if ($upcomingEvents.length > 0) {
      const nextEvent = $upcomingEvents[0]
      const daysUntil = getDaysUntil(nextEvent.date)

      if (daysUntil <= 1) {
        highlightItem = {
          type: 'event',
          title: daysUntil === 0 ? 'TODAY' : 'TOMORROW',
          emoji: '🔥',
          subject: nextEvent.name,
          time: nextEvent.time,
          info: nextEvent.info,
          countdown: formatCountdown(daysUntil),
          color: 'red'
        }
      } else if ($nextClass) {
        const minsUntil = getTimeUntilClass($nextClass.time)
        if (minsUntil <= 120) {
          highlightItem = {
            type: 'next',
            title: 'NEXT CLASS',
            emoji: '⏰',
            subject: $nextClass.subject,
            time: formatTime($nextClass.time),
            location: `Room ${$nextClass.classroom}`,
            teacher: $nextClass.teacher,
            countdown: `Starts in ${formatMinutes(minsUntil)}`,
            color: 'yellow'
          }
        } else {
          highlightItem = {
            type: 'later',
            title: 'LATER TODAY',
            emoji: '📚',
            subject: $nextClass.subject,
            time: formatTime($nextClass.time),
            location: `Room ${$nextClass.classroom}`,
            countdown: formatTime($nextClass.time),
            color: 'blue'
          }
        }
      } else if (daysUntil <= 2) {
        highlightItem = {
          type: 'event',
          title: 'UPCOMING',
          emoji: '📢',
          subject: nextEvent.name,
          time: nextEvent.time,
          countdown: formatCountdown(daysUntil),
          color: 'orange'
        }
      } else {
        highlightItem = null
      }
    } else if ($nextClass) {
      const minsUntil = getTimeUntilClass($nextClass.time)
      highlightItem = {
        type: 'next',
        title: 'NEXT CLASS',
        emoji: '⏰',
        subject: $nextClass.subject,
        time: formatTime($nextClass.time),
        location: `Room ${$nextClass.classroom}`,
        teacher: $nextClass.teacher,
        countdown: `Starts in ${formatMinutes(minsUntil)}`,
        color: minsUntil <= 60 ? 'yellow' : 'blue'
      }
    } else {
      highlightItem = {
        type: 'free',
        title: 'ALL DONE',
        emoji: '✨',
        subject: 'No more classes today',
        countdown: 'Enjoy your free time!',
        color: 'gray'
      }

      // Trigger confetti when all classes are done (only once per session)
      if (!confettiShown) {
        showConfetti = true
        confettiShown = true
      }
    }
  }

  function getColorClasses(color) {
    // Using palette: var(--color-bg) (bg), var(--color-card) (dark), var(--color-accent) (cyan), var(--color-text) (light)
    const colors = {
      green: 'border-2',
      red: 'border-2',
      yellow: 'border-2',
      orange: 'border-2',
      blue: 'border-2',
      gray: 'border-2'
    }
    return colors[color] || colors.gray
  }

  function getBorderColor(color) {
    return 'var(--color-accent)'
  }

  function getBackgroundColor(color) {
    return 'var(--color-card)'
  }
</script>

{#if showConfetti}
  <Confetti />
{/if}

{#if highlightItem}
  <div class="space-y-2">
    <!-- Greeting -->
    <div class="text-sm font-semibold opacity-70" style="color: var(--color-accent);">
      {greeting}
    </div>

    <div
      class="hero-card rounded-lg p-6 {getColorClasses(highlightItem.color)} {highlightItem.type === 'current' ? 'pulse-hero' : ''}"
      style="
        background-color: {getBackgroundColor(highlightItem.color)};
        border-color: {getBorderColor(highlightItem.color)};
        color: var(--color-text);
        box-shadow: 0 4px 20px rgba(0, 173, 181, 0.25);
      "
      role="article"
    >
    <!-- Desktop View -->
    <div class="hidden md:flex items-center justify-between gap-6">
      <!-- Left: Status & Title -->
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <span class="text-4xl flex-shrink-0">{highlightItem.emoji}</span>
        <div class="flex items-baseline gap-3 flex-wrap flex-1">
          <span class="text-sm font-bold uppercase tracking-wide opacity-70">
            {highlightItem.title}
          </span>
          <h3 class="text-3xl font-bold truncate">
            {highlightItem.subject}
          </h3>
        </div>
      </div>

      <!-- Middle: Details -->
      <div class="flex items-center gap-4 flex-shrink-0">
        {#if highlightItem.time}
          <div class="flex items-center gap-2 px-3 py-2 rounded" style="background-color: rgba(0, 0, 0, 0.3);">
            <span class="text-lg">⏰</span>
            <span class="font-bold text-lg">{highlightItem.time}</span>
          </div>
        {/if}
        {#if highlightItem.location}
          <div class="flex items-center gap-2 px-3 py-2 rounded" style="background-color: rgba(0, 0, 0, 0.3);">
            <span class="text-lg">📍</span>
            <span class="font-bold text-lg">{highlightItem.location}</span>
          </div>
        {/if}
        {#if highlightItem.teacher}
          <div class="flex items-center gap-2 px-3 py-2 rounded" style="background-color: rgba(0, 0, 0, 0.3);">
            <span class="text-lg">👨‍🏫</span>
            <span class="font-semibold text-base opacity-90">{highlightItem.teacher}</span>
          </div>
        {/if}
      </div>

      <!-- Right: Countdown -->
      {#if highlightItem.countdown}
        <div class="text-2xl font-bold whitespace-nowrap flex-shrink-0" style="color: var(--color-accent);">
          {highlightItem.countdown}
        </div>
      {/if}
    </div>

    <!-- Mobile View -->
    <div class="md:hidden space-y-3">
      <!-- Title Row -->
      <div class="flex items-center gap-3">
        <span class="text-3xl flex-shrink-0">{highlightItem.emoji}</span>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">
            {highlightItem.title}
          </div>
          <h3 class="text-xl font-bold truncate">
            {highlightItem.subject}
          </h3>
        </div>
      </div>

      <!-- Details Row -->
      <div class="flex flex-wrap gap-2">
        {#if highlightItem.time}
          <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded" style="background-color: rgba(0, 0, 0, 0.3);">
            <span class="text-sm">⏰</span>
            <span class="font-bold text-sm">{highlightItem.time}</span>
          </div>
        {/if}
        {#if highlightItem.location}
          <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded" style="background-color: rgba(0, 0, 0, 0.3);">
            <span class="text-sm">📍</span>
            <span class="font-bold text-sm">{highlightItem.location}</span>
          </div>
        {/if}
        {#if highlightItem.teacher}
          <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded" style="background-color: rgba(0, 0, 0, 0.3);">
            <span class="text-sm">👨‍🏫</span>
            <span class="font-semibold text-sm opacity-90">{highlightItem.teacher}</span>
          </div>
        {/if}
      </div>

      <!-- Countdown Row -->
      {#if highlightItem.countdown}
        <div class="text-xl font-bold text-center py-2 px-3 rounded" style="color: var(--color-accent); background-color: rgba(0, 173, 181, 0.1);">
          {highlightItem.countdown}
        </div>
      {/if}
    </div>

      {#if highlightItem.info}
        <div class="mt-3 text-sm opacity-70 truncate">
          {highlightItem.info}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .hero-card {
    transition: all 0.3s ease;
  }

  .hero-card:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 30px rgba(0, 173, 181, 0.4) !important;
  }

  @keyframes heroEnter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .hero-card {
    animation: heroEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes pulseHero {
    0%, 100% {
      box-shadow: 0 4px 20px rgba(0, 173, 181, 0.25);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 8px 35px rgba(0, 173, 181, 0.5);
      transform: scale(1.01);
    }
  }

  .pulse-hero {
    animation: pulseHero 2.5s ease-in-out infinite;
  }

  /* Battery Optimization: Disable infinite animations when user prefers reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .pulse-hero {
      animation: none !important;
    }
  }
</style>
