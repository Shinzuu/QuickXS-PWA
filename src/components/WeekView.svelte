<script>
  import { routines } from '../lib/store'
  import { getCurrentDay, getWeekDays, formatTime } from '../lib/utils'

  let selectedDay = $state(getCurrentDay())
  let showAll = $state(false)
  const maxInitial = 10

  function getDayClasses(day) {
    return $routines
      .filter(r => r.day === day)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  function isToday(day) {
    return day === getCurrentDay()
  }

  function selectDay(day) {
    selectedDay = day
    showAll = false // Reset pagination when changing day
  }
</script>

<div class="week-view">
  <h2 class="text-xl font-bold mb-3" style="color: #00ADB5;">📅 Weekly Schedule</h2>

  <!-- Week Tabs -->
  <div class="flex gap-2 mb-3 overflow-x-auto pb-2">
    {#each getWeekDays() as day}
      <button
        onclick={() => selectDay(day)}
        class="px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all"
        style="
          {selectedDay === day
            ? 'background-color: #00ADB5; color: #222831; transform: scale(1.05);'
            : isToday(day)
              ? 'background-color: #393E46; color: #00ADB5; border: 2px solid #00ADB5;'
              : 'background-color: #222831; color: #EEEEEE; border: 1px solid #393E46;'}"
      >
        {day.slice(0, 3)}
        {#if isToday(day)}
          <span class="ml-1">●</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Selected Day Schedule -->
  <div class="day-schedule">
    <h3 class="text-base font-semibold mb-3" style="color: #EEEEEE;">
      {selectedDay}'s Classes
      {#if isToday(selectedDay)}
        <span class="text-sm font-normal" style="color: #00ADB5;">(Today)</span>
      {/if}
    </h3>

    {@const dayClasses = getDayClasses(selectedDay)}
    {#if dayClasses.length === 0}
      <div class="text-center py-8" style="color: #EEEEEE; opacity: 0.6;">
        <p class="text-lg">🌴 No classes on {selectedDay}</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each (showAll ? dayClasses : dayClasses.slice(0, maxInitial)) as classItem}
          <div class="p-3 rounded-lg transition-colors" style="background-color: #222831; border: 1px solid #393E46;">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-bold text-lg" style="color: #EEEEEE;">{classItem.subject}</div>
                <div class="text-base mt-0.5" style="color: #EEEEEE; opacity: 0.7;">
                  {formatTime(classItem.time)} • {classItem.duration}min • Room {classItem.classroom}
                </div>
                <div class="text-sm" style="color: #EEEEEE; opacity: 0.5;">
                  👨‍🏫 {classItem.teacher}
                </div>
              </div>
              {#if classItem.duration >= 150}
                <span class="text-xs px-2 py-1 rounded" style="background-color: #00ADB5; color: #222831;">
                  Lab
                </span>
              {/if}
            </div>
          </div>
        {/each}

        {#if !showAll && dayClasses.length > maxInitial}
          <button
            onclick={() => showAll = true}
            class="w-full py-3 text-center text-sm rounded-lg transition-colors"
            style="color: #EEEEEE; opacity: 0.6; background-color: #222831;"
          >
            +{dayClasses.length - maxInitial} more classes
          </button>
        {:else if showAll && dayClasses.length > maxInitial}
          <button
            onclick={() => showAll = false}
            class="w-full py-3 text-center text-sm rounded-lg transition-colors"
            style="color: #EEEEEE; opacity: 0.6; background-color: #222831;"
          >
            Show less
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>
