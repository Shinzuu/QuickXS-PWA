<script>
  import { onMount } from 'svelte'
  import { formatDate, getDaysUntil } from '../lib/utils'

  let holidays = $state([])
  let loading = $state(true)
  let error = $state(null)

  onMount(async () => {
    await fetchHolidays()
  })

  async function fetchHolidays() {
    loading = true
    error = null

    // Hardcoded Bangladesh holidays for 2025
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset to start of day for accurate comparison

    const bdHolidays = [
      { name: 'Shaheed Dibosh', date: '2025-02-21', localName: 'শহীদ দিবস' },
      { name: 'Independence Day', date: '2025-03-26', localName: 'স্বাধীনতা দিবস' },
      { name: 'Eid ul-Fitr', date: '2025-03-31', localName: 'ঈদ-উল-ফিতর' },
      { name: 'Bengali New Year', date: '2025-04-14', localName: 'পহেলা বৈশাখ' },
      { name: 'May Day', date: '2025-05-01', localName: 'মে দিবস' },
      { name: 'Eid ul-Adha', date: '2025-06-07', localName: 'ঈদ-উল-আযহা' },
      { name: 'National Mourning Day', date: '2025-08-15', localName: 'জাতীয় শোক দিবস' },
      { name: 'Victory Day', date: '2025-12-16', localName: 'বিজয় দিবস' },
      { name: 'Christmas', date: '2025-12-25', localName: 'বড়দিন' }
    ]

    holidays = bdHolidays
      .filter(h => {
        const holidayDate = new Date(h.date)
        holidayDate.setHours(0, 0, 0, 0)
        return holidayDate >= now
      })
      .slice(0, 5)
      .map(h => ({
        name: h.localName,
        date: h.date,
        description: h.name
      }))

    loading = false
  }
</script>

<div class="holidays-section">
  <h3 class="text-xl font-bold mb-3 flex items-center gap-2" style="color: #00ADB5;">
    🎉 Upcoming Holidays
  </h3>

  {#if loading}
    <div class="text-center py-4" style="color: #EEEEEE; opacity: 0.6;">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style="border-color: #00ADB5;"></div>
      <p class="mt-2 text-sm">Loading holidays...</p>
    </div>
  {:else if error}
    <div class="text-center py-4" style="color: #EEEEEE; opacity: 0.6;">
      <p class="text-sm">{error}</p>
    </div>
  {:else if holidays.length === 0}
    <div class="text-center py-4" style="color: #EEEEEE; opacity: 0.6;">
      <p class="text-sm">No upcoming holidays</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each holidays as holiday}
        {@const daysUntil = getDaysUntil(holiday.date)}
        <div class="p-3 rounded-lg transition-colors" style="background-color: #222831; border: 1px solid #393E46;">
          <div class="font-semibold text-base" style="color: #EEEEEE;">{holiday.name}</div>
          <div class="text-sm mt-0.5" style="color: #EEEEEE; opacity: 0.7;">
            📅 {formatDate(holiday.date)}
            {#if daysUntil === 0}
              <span class="ml-2 font-medium" style="color: #00ADB5;">Today!</span>
            {:else if daysUntil === 1}
              <span class="ml-2 font-medium" style="color: #00ADB5;">Tomorrow</span>
            {:else if daysUntil <= 7}
              <span class="ml-2 font-medium" style="color: #00ADB5;">{daysUntil} days</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
