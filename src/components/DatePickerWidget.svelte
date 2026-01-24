<script>
  import { onMount } from 'svelte'

  let { value = $bindable(''), onSelect = () => {} } = $props()

  let showCalendar = $state(false)
  let currentMonth = $state(new Date())
  let selectedDate = $state(value ? new Date(value) : null)

  function getQuickDate(type) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (type) {
      case 'today':
        return today
      case 'tomorrow':
        return new Date(today.getTime() + 86400000)
      case 'next-week':
        return new Date(today.getTime() + 7 * 86400000)
      case 'next-monday':
        const nextMon = new Date(today)
        nextMon.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7))
        return nextMon
      case 'next-friday':
        const nextFri = new Date(today)
        nextFri.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7 || 7))
        return nextFri
      default:
        return today
    }
  }

  function selectQuickDate(type) {
    const date = getQuickDate(type)
    selectedDate = date
    value = date.toISOString().split('T')[0]
    onSelect(value)
    showCalendar = false
  }

  function getDaysInMonth(date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      })
    }

    // Next month days
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      })
    }

    return days
  }

  function selectDate(date) {
    selectedDate = date
    value = date.toISOString().split('T')[0]
    onSelect(value)
    showCalendar = false
  }

  function previousMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
  }

  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
  }

  function isToday(date) {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  function isSelected(date) {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  let days = $derived(getDaysInMonth(currentMonth))
</script>

<div class="date-picker-widget relative">
  <!-- Input Field -->
  <div class="flex gap-2">
    <input
      type="text"
      value={value}
      readonly
      onclick={() => showCalendar = !showCalendar}
      placeholder="Select date"
      class="flex-1 px-4 py-2 rounded-lg border-2 cursor-pointer"
      style="background-color: var(--color-bg); color: var(--color-text); border-color: var(--color-accent);"
    />
    <button
      onclick={() => showCalendar = !showCalendar}
      class="px-4 py-2 rounded-lg font-semibold"
      style="background-color: var(--color-accent); color: var(--color-bg);"
      type="button"
    >
      📅
    </button>
  </div>

  <!-- Calendar Popup -->
  {#if showCalendar}
    <div class="absolute z-50 mt-2 p-4 rounded-lg shadow-2xl" style="background-color: var(--color-card); border: 2px solid var(--color-accent); min-width: 320px;">
      <!-- Quick Shortcuts -->
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button
          onclick={() => selectQuickDate('today')}
          class="px-3 py-2 rounded text-sm font-semibold hover:scale-105 transition-all"
          style="background-color: var(--color-accent); color: var(--color-bg);"
          type="button"
        >
          📌 Today
        </button>
        <button
          onclick={() => selectQuickDate('tomorrow')}
          class="px-3 py-2 rounded text-sm font-semibold hover:scale-105 transition-all"
          style="background-color: var(--color-bg); color: var(--color-text);"
          type="button"
        >
          ➡️ Tomorrow
        </button>
        <button
          onclick={() => selectQuickDate('next-monday')}
          class="px-3 py-2 rounded text-sm font-semibold hover:scale-105 transition-all"
          style="background-color: var(--color-bg); color: var(--color-text);"
          type="button"
        >
          📅 Next Mon
        </button>
        <button
          onclick={() => selectQuickDate('next-week')}
          class="px-3 py-2 rounded text-sm font-semibold hover:scale-105 transition-all"
          style="background-color: var(--color-bg); color: var(--color-text);"
          type="button"
        >
          🗓️ +1 Week
        </button>
      </div>

      <!-- Month Navigation -->
      <div class="flex items-center justify-between mb-3">
        <button onclick={previousMonth} class="p-2 rounded hover:bg-opacity-20" style="color: var(--color-accent);" type="button">
          ◀️
        </button>
        <div class="font-bold" style="color: var(--color-text);">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button onclick={nextMonth} class="p-2 rounded hover:bg-opacity-20" style="color: var(--color-accent);" type="button">
          ▶️
        </button>
      </div>

      <!-- Day Headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as dayName}
          <div class="text-center text-xs font-bold py-1" style="color: var(--color-text); opacity: 0.6;">
            {dayName}
          </div>
        {/each}
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1">
        {#each days as { day, isCurrentMonth, date }}
          <button
            onclick={() => selectDate(date)}
            class="p-2 text-sm rounded transition-all hover:scale-110"
            style="
              background-color: {isSelected(date) ? 'var(--color-accent)' : isToday(date) ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};
              color: {isSelected(date) ? 'var(--color-bg)' : isCurrentMonth ? 'var(--color-text)' : 'var(--color-text)'};
              opacity: {isCurrentMonth ? 1 : 0.3};
              font-weight: {isToday(date) || isSelected(date) ? 'bold' : 'normal'};
            "
            type="button"
          >
            {day}
          </button>
        {/each}
      </div>

      <!-- Close Button -->
      <button
        onclick={() => showCalendar = false}
        class="w-full mt-3 px-4 py-2 rounded font-semibold"
        style="background-color: var(--color-bg); color: var(--color-text);"
        type="button"
      >
        Close
      </button>
    </div>
  {/if}
</div>

<style>
  .date-picker-widget {
    user-select: none;
  }
</style>
