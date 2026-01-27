<script>
  import { onMount } from 'svelte'
  import { routines } from '../lib/store'
  import { getCurrentDay, getWeekDays, formatTime, isClassHappeningNow } from '../lib/utils'
  import { currentTheme } from '../lib/themeStore'
  import { get } from 'svelte/store'

  // In Svelte 5 runes mode, we need to explicitly subscribe to stores
  let theme = $state(get(currentTheme))
  $effect(() => {
    const unsubscribe = currentTheme.subscribe(value => {
      theme = value
    })
    return unsubscribe
  })

  let touchStartX = 0
  let touchEndX = 0
  let selectedDayIndex = $state(getWeekDays().indexOf(getCurrentDay()))

  // Generate time slots from 8:30 AM to 5:30 PM in 30-minute intervals
  const timeSlots = []
  for (let hour = 8; hour <= 17; hour++) {
    for (let min of [0, 30]) {
      if (hour === 8 && min === 0) continue // Start from 8:30
      if (hour === 17 && min === 30) continue // End at 5:30

      const time24 = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      timeSlots.push(time24)
    }
  }

  function getClassForTimeSlot(day, timeSlot) {
    return $routines.find(r => {
      if (r.day !== day) return false

      const classStartTime = r.time
      const [startHour, startMin] = classStartTime.split(':').map(Number)
      const classEndMinutes = startHour * 60 + startMin + r.duration

      const [slotHour, slotMin] = timeSlot.split(':').map(Number)
      const slotStartMinutes = slotHour * 60 + slotMin
      const slotEndMinutes = slotStartMinutes + 30

      // Check if this slot overlaps with the class
      return slotStartMinutes < classEndMinutes && slotEndMinutes > (startHour * 60 + startMin)
    })
  }

  function getClassSpan(classItem, startTimeSlot) {
    const [startHour, startMin] = classItem.time.split(':').map(Number)
    const classStartMinutes = startHour * 60 + startMin

    const [slotHour, slotMin] = startTimeSlot.split(':').map(Number)
    const slotMinutes = slotHour * 60 + slotMin

    // Only return span if this slot is the start of the class or within the first 30 minutes
    if (slotMinutes >= classStartMinutes && slotMinutes < classStartMinutes + 30) {
      // Calculate how many 30-min slots this class occupies
      return Math.ceil(classItem.duration / 30)
    }
    return 0
  }

  function isSlotOccupied(day, timeSlot) {
    // Check if this slot is already occupied by a class that started earlier
    const classItem = getClassForTimeSlot(day, timeSlot)
    if (!classItem) return false

    const [classHour, classMin] = classItem.time.split(':').map(Number)
    const classStartMinutes = classHour * 60 + classMin

    const [slotHour, slotMin] = timeSlot.split(':').map(Number)
    const slotMinutes = slotHour * 60 + slotMin

    // If this slot is not the start of the class, it's occupied
    return slotMinutes > classStartMinutes && slotMinutes < classStartMinutes + classItem.duration
  }

  function isBreakTime(timeSlot) {
    // Common break times: 10:00-10:30, 12:00-14:00 (lunch), 15:30-16:00
    const breakTimes = ['10:00', '10:30', '12:00', '12:30', '13:00', '13:30', '15:30', '16:00']
    return breakTimes.includes(timeSlot)
  }

  function getCurrentTimeSlot() {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    const currentMinutes = currentHour * 60 + currentMin

    // Find the time slot that contains current time
    for (let i = 0; i < timeSlots.length; i++) {
      const [slotHour, slotMin] = timeSlots[i].split(':').map(Number)
      const slotMinutes = slotHour * 60 + slotMin

      if (currentMinutes >= slotMinutes && currentMinutes < slotMinutes + 30) {
        return timeSlots[i]
      }
    }
    return null
  }

  function isCurrentSlot(day, timeSlot) {
    return day === getCurrentDay() && timeSlot === getCurrentTimeSlot()
  }

  function handleSwipe() {
    const swipeThreshold = 50
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && selectedDayIndex < getWeekDays().length - 1) {
        // Swipe left - next day
        selectedDayIndex++
        document.getElementById(`day-${getWeekDays()[selectedDayIndex]}`).scrollIntoView({ behavior: 'instant', block: 'start' })
      } else if (diff < 0 && selectedDayIndex > 0) {
        // Swipe right - previous day
        selectedDayIndex--
        document.getElementById(`day-${getWeekDays()[selectedDayIndex]}`).scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
  }

  onMount(() => {
    const timelineContainer = document.getElementById('mobile-timeline')
    if (timelineContainer) {
      timelineContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX
      })

      timelineContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX
        handleSwipe()
      })
    }
  })
</script>

<div class="weekly-routine-table">
  <h2 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: {theme.accent};">
    📅 Weekly Class Schedule
  </h2>

  <!-- Desktop View -->
  <div class="hidden md:block overflow-x-auto">
    <table class="w-full border-collapse" style="border: 1px solid {theme.card};">
      <thead>
        <tr style="background-color: {theme.bg};">
          <th class="p-3 text-left font-bold sticky left-0 z-[5]" style="background-color: {theme.bg}; color: {theme.accent}; border: 1px solid {theme.card}; min-width: 120px;">
            Day / Time
          </th>
          {#each timeSlots as timeSlot}
            <th
              class="p-2 text-center font-semibold text-xs"
              style="color: {theme.text}; opacity: 0.8; border: 1px solid {theme.card}; min-width: 70px;"
            >
              {formatTime(timeSlot)}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each getWeekDays() as day, dayIndex}
          <tr style="background-color: {dayIndex % 2 === 0 ? theme.bg : theme.card};">
            <td
              class="p-3 text-sm font-bold sticky left-0 z-[5]"
              style="
                background-color: {dayIndex % 2 === 0 ? theme.bg : theme.card};
                color: {day === getCurrentDay() ? theme.accent : theme.text};
                border: 2px solid {day === getCurrentDay() ? theme.accent : theme.card};
                font-size: 0.875rem;
              "
            >
              {day}
              {#if day === getCurrentDay()}
                <span class="ml-1 text-sm">●</span>
              {/if}
            </td>
            {#each timeSlots as timeSlot}
              {@const classItem = getClassForTimeSlot(day, timeSlot)}
              {@const span = classItem ? getClassSpan(classItem, timeSlot) : 0}
              {@const isBreak = isBreakTime(timeSlot)}
              {@const isCurrent = isCurrentSlot(day, timeSlot)}
              {@const occupied = isSlotOccupied(day, timeSlot)}

              {#if !occupied}
                {#if span > 0}
                  <td
                    colspan={span}
                    class="p-3 text-center transition-all cursor-pointer relative group"
                    style="
                      background-color: {isCurrent ? theme.accent : theme.card};
                      border: 2px solid {isCurrent ? theme.accent : theme.accent};
                      color: {isCurrent ? theme.bg : theme.text};
                      box-shadow: {isCurrent ? '0 4px 6px rgba(0, 0, 0, 0.3)' : 'none'};
                    "
                  >
                    <div class="font-bold text-sm leading-tight mb-2">{classItem.subject}</div>
                    <div class="flex flex-col gap-1 items-center">
                      <div class="px-2 py-1 rounded font-bold text-xs" style="background-color: {theme.bg}; color: {theme.text};">
                        ⏰ {formatTime(classItem.time)}
                      </div>
                      <div class="px-2 py-1 rounded font-bold text-xs" style="background-color: {theme.bg}; color: {theme.text};">
                        📍 {classItem.classroom}
                      </div>
                    </div>
                    <div class="flex items-center justify-center gap-2 mt-2">
                      {#if classItem.duration >= 150}
                        <span class="text-xs px-2 py-0.5 rounded font-semibold" style="background-color: {theme.accent}; color: {theme.bg};">
                          Lab
                        </span>
                      {/if}
                      {#if isCurrent}
                        <span class="text-xs px-2 py-0.5 rounded font-bold animate-pulse" style="background-color: {theme.bg}; color: {theme.accent};">
                          NOW
                        </span>
                      {/if}
                    </div>
                  </td>
                {:else}
                  <td
                    class="p-2 text-center text-xs"
                    style="
                      background-color: {isBreak ? theme.bg : 'transparent'};
                      border: 1px solid {theme.card};
                      color: {theme.text};
                      opacity: {isBreak ? '0.6' : '0.3'};
                    "
                  >
                    {#if isBreak}
                      ☕
                    {:else if isCurrent}
                      <div class="animate-pulse" style="color: {theme.accent};">●</div>
                    {/if}
                  </td>
                {/if}
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Mobile View - Unified Timeline -->
  <div class="md:hidden">
    <!-- Day Selector (Sticky) -->
    <div class="sticky top-0 z-[5] -mx-6 px-6 pb-3" style="background-color: {theme.card}; border-bottom: 1px solid {theme.bg};">
      <div class="flex overflow-x-auto gap-2 pb-2" style="-webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;">
        {#each getWeekDays() as day}
          {@const isToday = day === getCurrentDay()}
          {@const dayClassCount = $routines.filter(r => r.day === day).length}
          <button
            class="flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all"
            style="
              background-color: {isToday ? theme.accent : theme.bg};
              color: {isToday ? theme.bg : theme.text};
              border: 2px solid {isToday ? theme.accent : theme.card};
              box-shadow: {isToday ? '0 2px 8px rgba(0, 0, 0, 0.4)' : 'none'};
              scroll-snap-align: center;
            "
            onclick={() => {
              document.getElementById(`day-${day}`).scrollIntoView({ behavior: 'instant', block: 'start' })
            }}
          >
            <div class="flex flex-col items-center gap-1">
              <span>{day}</span>
              <span class="text-xs opacity-70">{dayClassCount} {dayClassCount === 1 ? 'class' : 'classes'}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- All Days Timeline View -->
    <div class="space-y-6" id="mobile-timeline">
      {#each getWeekDays() as day}
        {@const dayClasses = $routines.filter(r => r.day === day).sort((a, b) => a.time.localeCompare(b.time))}
        {@const isToday = day === getCurrentDay()}

        <div class="relative" id="day-{day}">
          <!-- Day Header -->
          <div class="flex items-center gap-2 mb-3 pb-2">
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background-color: {isToday ? theme.accent : theme.bg}; color: {isToday ? theme.bg : theme.text}; border: 2px solid {isToday ? theme.accent : theme.card};">
              <span class="font-bold text-base">{day}</span>
              {#if isToday}
                <span class="text-sm">●</span>
              {/if}
            </div>
            <div class="h-px flex-1" style="background-color: {theme.card};"></div>
          </div>

          {#if dayClasses.length === 0}
            <div class="text-center py-8 px-4 rounded-lg" style="background-color: {theme.bg}; border: 2px dashed {theme.card};">
              <div class="inline-block p-4 rounded-full mb-3" style="background-color: {theme.card};">
                <span class="text-4xl">🌴</span>
              </div>
              <p class="text-sm font-semibold" style="color: {theme.text}; opacity: 0.5;">No classes scheduled</p>
            </div>
          {:else}
            <!-- Timeline -->
            <div class="relative pl-6">
              <!-- Vertical Line -->
              <div class="absolute left-2 top-0 bottom-0 w-0.5" style="background-color: {isToday ? theme.accent : theme.card};"></div>

              <div class="space-y-4">
                {#each dayClasses as classItem, idx}
                  {@const isCurrent = isToday && isClassHappeningNow(classItem.time, classItem.duration)}
                  {@const isLab = classItem.duration >= 150}

                  <div class="relative">
                    <!-- Timeline Dot -->
                    <div
                      class="absolute -left-5 top-3 w-3 h-3 rounded-full"
                      style="
                        background-color: {isCurrent ? theme.accent : isToday ? theme.accent : theme.card};
                        box-shadow: {isCurrent ? '0 0 0 4px rgba(0, 0, 0, 0.2)' : 'none'};
                      "
                    ></div>

                    <!-- Class Card -->
                    <div
                      class="p-3 rounded-lg transition-all"
                      style="
                        background-color: {isCurrent ? theme.accent : theme.card};
                        border: 2px solid {isCurrent ? theme.accent : isToday ? theme.accent : theme.card};
                        color: {isCurrent ? theme.bg : theme.text};
                        box-shadow: {isCurrent ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.2)'};
                      "
                    >
                      <div class="flex items-start justify-between gap-3 mb-2">
                        <h4 class="font-bold text-base flex-1">{classItem.subject}</h4>
                        <div class="flex flex-col gap-1 items-end flex-shrink-0">
                          {#if isLab}
                            <span class="text-xs px-2 py-0.5 rounded font-semibold" style="background-color: {theme.accent}; color: {theme.bg};">
                              Lab
                            </span>
                          {/if}
                          {#if isCurrent}
                            <span class="text-xs px-2 py-0.5 rounded font-bold animate-pulse" style="background-color: {theme.bg}; color: {theme.accent};">
                              NOW
                            </span>
                          {/if}
                        </div>
                      </div>

                      <div class="flex flex-wrap gap-2 mb-2">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold" style="background-color: {theme.bg}; color: {theme.text};">
                          <span>⏰</span>
                          <span>{formatTime(classItem.time)}</span>
                        </div>
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold" style="background-color: {theme.bg}; color: {theme.text};">
                          <span>📍</span>
                          <span>{classItem.classroom}</span>
                        </div>
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs" style="background-color: {theme.bg}; color: {theme.textSecondary};">
                          <span>⏱️</span>
                          <span>{classItem.duration} min</span>
                        </div>
                      </div>

                      <div class="text-sm" style="color: {theme.textSecondary};">
                        👨‍🏫 {classItem.teacher}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Legend -->
  <div class="hidden md:flex flex-wrap gap-4 mt-4 text-sm">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded" style="background-color: {theme.card}; border: 2px solid {theme.accent};"></div>
      <span style="color: {theme.text}; opacity: 0.8;">Regular Class</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded" style="background-color: {theme.bg}; border: 2px solid {theme.accent};"></div>
      <span style="color: {theme.text}; opacity: 0.8;">Lab Class</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded" style="background-color: {theme.accent};"></div>
      <span style="color: {theme.text}; opacity: 0.8;">Current Class</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded" style="background-color: {theme.bg}; opacity: 0.6;"></div>
      <span style="color: {theme.text}; opacity: 0.8;">Break Time</span>
    </div>
  </div>
</div>

<style>
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Battery Optimization: Disable infinite animations when user prefers reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .animate-pulse {
      animation: none !important;
    }
  }

  table {
    border-spacing: 0;
  }

  .sticky {
    position: sticky;
  }

  td, th {
    white-space: nowrap;
  }
</style>
