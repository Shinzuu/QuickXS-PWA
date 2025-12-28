<script>
  import { currentTheme } from '../lib/themeStore'
  import { notificationSettings } from '../lib/notificationSettings'
  import { scheduleClassNotifications } from '../lib/notifications'
  import { todayClasses } from '../lib/store'

  let showSettings = $state(false)
  let customTime = $state('')

  function toggleEnabled() {
    notificationSettings.update(s => ({ ...s, enabled: !s.enabled }))
    if ($notificationSettings.enabled) {
      scheduleClassNotifications($todayClasses)
    }
  }

  function toggleSound() {
    notificationSettings.update(s => ({ ...s, sound: !s.sound }))
  }

  function toggleVibrate() {
    notificationSettings.update(s => ({ ...s, vibrate: !s.vibrate }))
  }

  function addTiming() {
    const time = parseInt(customTime)
    if (time && time > 0 && time <= 120) {
      notificationSettings.update(s => ({
        ...s,
        timings: [...new Set([...s.timings, time])].sort((a, b) => b - a)
      }))
      customTime = ''
      scheduleClassNotifications($todayClasses)
    }
  }

  function removeTiming(time) {
    notificationSettings.update(s => ({
      ...s,
      timings: s.timings.filter(t => t !== time)
    }))
    scheduleClassNotifications($todayClasses)
  }
</script>

<button
  onclick={() => showSettings = !showSettings}
  class="fixed top-6 right-20 z-40 p-3 rounded-lg shadow-lg transition-all"
  style="background-color: {$currentTheme.card}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
  aria-label="Notification settings"
  title="Notification Settings"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
</button>

{#if showSettings}
  <div
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);"
    onclick={() => showSettings = false}
  >
    <div
      class="modal-content rounded-lg p-6 max-w-md w-full"
      style="background-color: {$currentTheme.card}; color: {$currentTheme.text}; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold" style="color: {$currentTheme.accent};">
          🔔 Notification Settings
        </h2>
        <button
          onclick={() => showSettings = false}
          class="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
          style="background-color: {$currentTheme.bg};"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Enable/Disable -->
      <div class="mb-6">
        <label class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors" style="background-color: {$currentTheme.bg};">
          <span class="font-semibold">Enable Notifications</span>
          <input
            type="checkbox"
            checked={$notificationSettings.enabled}
            onchange={toggleEnabled}
            class="w-5 h-5 accent-color"
          />
        </label>
      </div>

      {#if $notificationSettings.enabled}
        <!-- Sound -->
        <div class="mb-4">
          <label class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors" style="background-color: {$currentTheme.bg};">
            <span class="font-semibold">🔊 Sound</span>
            <input
              type="checkbox"
              checked={$notificationSettings.sound}
              onchange={toggleSound}
              class="w-5 h-5"
            />
          </label>
        </div>

        <!-- Vibrate -->
        <div class="mb-6">
          <label class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors" style="background-color: {$currentTheme.bg};">
            <span class="font-semibold">📳 Vibrate</span>
            <input
              type="checkbox"
              checked={$notificationSettings.vibrate}
              onchange={toggleVibrate}
              class="w-5 h-5"
            />
          </label>
        </div>

        <!-- Notification Timings -->
        <div class="mb-6">
          <h3 class="font-semibold mb-3" style="color: {$currentTheme.accent};">⏰ Notify Before Class</h3>

          <div class="space-y-2 mb-3">
            {#each $notificationSettings.timings as time}
              <div class="flex items-center justify-between p-3 rounded-lg" style="background-color: {$currentTheme.bg};">
                <span>{time} minute{time > 1 ? 's' : ''} before</span>
                <button
                  onclick={() => removeTiming(time)}
                  class="p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                  style="color: #ff6b6b;"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>

          <div class="flex gap-2">
            <input
              bind:value={customTime}
              type="number"
              min="1"
              max="120"
              placeholder="Minutes"
              class="flex-1 p-2 rounded-lg"
              style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
            />
            <button
              onclick={addTiming}
              class="px-4 py-2 rounded-lg font-semibold transition-all"
              style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
            >
              Add
            </button>
          </div>
        </div>
      {/if}

      <!-- Close Button -->
      <div class="flex justify-end">
        <button
          onclick={() => showSettings = false}
          class="px-6 py-2 rounded-lg font-semibold transition-all"
          style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
        >
          Done
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  button:hover {
    transform: scale(1.05);
  }

  button:active {
    transform: scale(0.95);
  }

  input[type="checkbox"] {
    accent-color: var(--color-accent);
  }

  input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.3);
  }

  @media (max-width: 640px) {
    button {
      top: 16px;
      right: 70px;
      padding: 10px;
    }
  }
</style>
