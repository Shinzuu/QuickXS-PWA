<script>
  import { notificationSettings } from '../lib/notificationSettings'

  let showSettings = $state(false)
  let previousOverflow = ''

  function openSettings() {
    showSettings = true
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function closeSettings() {
    showSettings = false
    document.body.style.overflow = previousOverflow
  }

  function saveSettings() {
    // Settings are auto-saved via the store
    closeSettings()
  }

  $effect(() => {
    if (showSettings) {
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
  })
</script>

<!-- Floating Settings Button -->
<button
  onclick={openSettings}
  class="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-40"
  style="background-color: var(--color-accent); color: var(--color-bg);"
  title="Notification Settings"
>
  🔔
</button>

<!-- Settings Modal -->
{#if showSettings}
  <div
    class="fixed inset-0 flex items-center justify-center p-4"
    style="z-index: 9999;"
    onclick={closeSettings}
    onkeydown={(e) => e.key === 'Escape' && closeSettings()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-modal-title"
    tabindex="-1"
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
      style="background-color: var(--color-card);"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 id="settings-modal-title" class="text-2xl font-bold" style="color: var(--color-accent);">🔔 Notifications</h2>
        <button onclick={closeSettings} class="text-2xl" style="color: var(--color-text);">✕</button>
      </div>

      <div class="space-y-6">
        <!-- Enable Notifications -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold" style="color: var(--color-text);">Enable Notifications</h3>
            <p class="text-xs opacity-70" style="color: var(--color-text);">Get notified about classes and events</p>
          </div>
          <label class="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              bind:checked={$notificationSettings.enabled}
              class="sr-only peer"
            />
            <span class="absolute inset-0 rounded-full transition-colors peer-checked:bg-[var(--color-accent)] bg-gray-600 cursor-pointer"></span>
            <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
          </label>
        </div>

        <!-- Sound -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold" style="color: var(--color-text);">Sound</h3>
            <p class="text-xs opacity-70" style="color: var(--color-text);">Play notification sound</p>
          </div>
          <label class="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              bind:checked={$notificationSettings.sound}
              class="sr-only peer"
            />
            <span class="absolute inset-0 rounded-full transition-colors peer-checked:bg-[var(--color-accent)] bg-gray-600 cursor-pointer"></span>
            <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
          </label>
        </div>

        <!-- Vibration -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold" style="color: var(--color-text);">Vibration</h3>
            <p class="text-xs opacity-70" style="color: var(--color-text);">Vibrate on notifications</p>
          </div>
          <label class="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              bind:checked={$notificationSettings.vibrate}
              class="sr-only peer"
            />
            <span class="absolute inset-0 rounded-full transition-colors peer-checked:bg-[var(--color-accent)] bg-gray-600 cursor-pointer"></span>
            <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
          </label>
        </div>

        <!-- Class Notification Timings -->
        <div>
          <h3 class="font-semibold mb-3" style="color: var(--color-text);">Class Notifications</h3>
          <div class="space-y-2">
            {#each [5, 10, 15, 30] as minutes}
              <label class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[var(--color-bg)]">
                <input
                  type="checkbox"
                  bind:group={$notificationSettings.timings}
                  value={minutes}
                  class="w-4 h-4 accent-[var(--color-accent)]"
                />
                <span style="color: var(--color-text);">{minutes} minutes before class</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- Event Notifications -->
        <div class="p-4 rounded-lg" style="background-color: var(--color-bg);">
          <h3 class="font-semibold mb-2" style="color: var(--color-text);">📅 Event Notifications</h3>
          <div class="text-sm space-y-1" style="color: var(--color-text); opacity: 0.8;">
            <p>• 1 day before event</p>
            <p>• 3 hours before event</p>
            <p>• 30 minutes before event</p>
            <p>• Morning of event day (8 AM)</p>
          </div>
        </div>

        <!-- Daily Summary -->
        <div class="p-4 rounded-lg" style="background-color: var(--color-bg);">
          <h3 class="font-semibold mb-2" style="color: var(--color-text);">☀️ Daily Summary</h3>
          <p class="text-sm" style="color: var(--color-text); opacity: 0.8;">
            Get a morning briefing at 7 AM with your classes and events for the day
          </p>
        </div>
      </div>

      <button
        onclick={saveSettings}
        class="w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-all hover:scale-105"
        style="background-color: var(--color-accent); color: var(--color-bg);"
      >
        ✅ Save Settings
      </button>
    </div>
  </div>
{/if}

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
