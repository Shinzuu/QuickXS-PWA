<script>
  import { currentTheme, changeTheme, themes } from '../lib/themeStore'
  import { events } from '../lib/store'

  let showSettings = $state(false)
  let activeSection = $state('general') // 'general', 'notifications', 'data', 'about'

  // Settings state
  let settings = $state({
    autoRefresh: true,
    refreshInterval: 15, // minutes
    notifications: {
      enabled: typeof Notification !== 'undefined' && Notification.permission === 'granted',
      classReminders: true,
      eventReminders: true,
      dailySummary: true,
      reminderTime: 30 // minutes before
    },
    display: {
      theme: 'default',
      compactMode: false,
      show24Hour: false,
      animationsEnabled: true
    },
    privacy: {
      analytics: false,
      crashReports: true
    }
  })

  // Load settings from localStorage
  $effect(() => {
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      try {
        settings = { ...settings, ...JSON.parse(saved) }
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  })

  // Save settings to localStorage
  function saveSettings() {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    showToast('Settings saved successfully!')
  }

  function showToast(message) {
    // Simple toast - could integrate with existing toast system
    alert(message)
  }

  async function requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      settings.notifications.enabled = permission === 'granted'
      saveSettings()

      if (permission === 'granted') {
        showToast('Notifications enabled!')
      } else {
        showToast('Notification permission denied')
      }
    }
  }

  function clearAllData() {
    if (confirm('Are you sure you want to clear all cached data? This will not delete your events from the server.')) {
      localStorage.clear()
      sessionStorage.clear()

      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name))
        })
      }

      showToast('All cached data cleared! Reloading...')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  function exportData() {
    const exportData = {
      events: $events,
      settings: settings,
      exportDate: new Date().toISOString()
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quickxs-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()

    showToast('Data exported successfully!')
  }

  function changeThemeHandler(themeName) {
    changeTheme(themeName)
    settings.display.theme = themeName
    saveSettings()
  }

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'data', label: 'Data & Privacy', icon: '💾' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ]
</script>

<!-- Settings Button in nav (to be added to NewApp.svelte) -->
<button
  onclick={() => showSettings = true}
  class="px-3 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
  style="background-color: {$currentTheme.bg}; color: {$currentTheme.accent}; border: 2px solid {$currentTheme.accent};"
  title="Settings"
>
  ⚙️
</button>

<!-- Settings Modal -->
{#if showSettings}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    onclick={() => showSettings = false}
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style="background-color: {$currentTheme.card};"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="p-6 border-b" style="border-color: {$currentTheme.accent};">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold" style="color: {$currentTheme.accent};">⚙️ Settings</h2>
            <p class="text-sm mt-1" style="color: {$currentTheme.text}; opacity: 0.7;">
              Customize your QuickXS experience
            </p>
          </div>
          <button
            onclick={() => showSettings = false}
            class="p-2 rounded-lg hover:opacity-70 transition-all"
            style="color: {$currentTheme.text};"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <div class="w-48 border-r p-4 space-y-2" style="border-color: {$currentTheme.bg}; background-color: {$currentTheme.bg};">
          {#each sections as section}
            <button
              onclick={() => activeSection = section.id}
              class="w-full text-left px-4 py-3 rounded-lg transition-all hover:scale-105"
              style="
                background-color: {activeSection === section.id ? $currentTheme.accent : 'transparent'};
                color: {activeSection === section.id ? $currentTheme.bg : $currentTheme.text};
              "
            >
              <span class="mr-2">{section.icon}</span>
              {section.label}
            </button>
          {/each}
        </div>

        <!-- Content -->
        <div class="flex-1 p-6 overflow-y-auto">
          {#if activeSection === 'general'}
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-bold mb-4" style="color: {$currentTheme.text};">🎨 Theme</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {#each Object.keys(themes) as themeName}
                    <button
                      onclick={() => changeThemeHandler(themeName)}
                      class="p-4 rounded-lg border-2 transition-all hover:scale-105"
                      style="
                        border-color: {settings.display.theme === themeName ? $currentTheme.accent : $currentTheme.bg};
                        background-color: {themes[themeName].bg};
                        color: {themes[themeName].text};
                      "
                    >
                      <div class="font-semibold capitalize">{themeName}</div>
                      <div class="text-xs opacity-70 mt-1">
                        <span class="inline-block w-3 h-3 rounded-full mr-1" style="background-color: {themes[themeName].accent};"></span>
                        Preview
                      </div>
                    </button>
                  {/each}
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold mb-4" style="color: {$currentTheme.text};">🔄 Auto Refresh</h3>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={settings.autoRefresh}
                    onchange={saveSettings}
                    class="w-5 h-5 rounded"
                    style="accent-color: {$currentTheme.accent};"
                  />
                  <span style="color: {$currentTheme.text};">Enable automatic data refresh</span>
                </label>

                {#if settings.autoRefresh}
                  <div class="mt-4">
                    <label class="block mb-2" style="color: {$currentTheme.text};">
                      Refresh every {settings.refreshInterval} minutes
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      bind:value={settings.refreshInterval}
                      onchange={saveSettings}
                      class="w-full"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <div class="flex justify-between text-xs mt-1" style="color: {$currentTheme.text}; opacity: 0.6;">
                      <span>5 min</span>
                      <span>60 min</span>
                    </div>
                  </div>
                {/if}
              </div>

              <div>
                <h3 class="text-lg font-bold mb-4" style="color: {$currentTheme.text};">🎭 Display Options</h3>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.display.compactMode}
                      onchange={saveSettings}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Compact mode (less spacing)</span>
                  </label>

                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.display.show24Hour}
                      onchange={saveSettings}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Use 24-hour time format</span>
                  </label>

                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.display.animationsEnabled}
                      onchange={saveSettings}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Enable animations</span>
                  </label>
                </div>
              </div>
            </div>

          {:else if activeSection === 'notifications'}
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-bold mb-4" style="color: {$currentTheme.text};">🔔 Notification Settings</h3>

                {#if !settings.notifications.enabled}
                  <div class="p-4 rounded-lg mb-4" style="background-color: {$currentTheme.bg};">
                    <p class="mb-3" style="color: {$currentTheme.text};">
                      Notifications are currently disabled. Enable them to get reminders about your classes and events.
                    </p>
                    <button
                      onclick={requestNotificationPermission}
                      class="px-4 py-2 rounded-lg font-semibold"
                      style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
                    >
                      Enable Notifications
                    </button>
                  </div>
                {/if}

                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.notifications.classReminders}
                      onchange={saveSettings}
                      disabled={!settings.notifications.enabled}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Class reminders</span>
                  </label>

                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.notifications.eventReminders}
                      onchange={saveSettings}
                      disabled={!settings.notifications.enabled}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Event reminders</span>
                  </label>

                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.notifications.dailySummary}
                      onchange={saveSettings}
                      disabled={!settings.notifications.enabled}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Daily summary</span>
                  </label>
                </div>

                {#if settings.notifications.enabled}
                  <div class="mt-4">
                    <label class="block mb-2" style="color: {$currentTheme.text};">
                      Remind me {settings.notifications.reminderTime} minutes before
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      bind:value={settings.notifications.reminderTime}
                      onchange={saveSettings}
                      class="w-full"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <div class="flex justify-between text-xs mt-1" style="color: {$currentTheme.text}; opacity: 0.6;">
                      <span>5 min</span>
                      <span>2 hours</span>
                    </div>
                  </div>
                {/if}
              </div>
            </div>

          {:else if activeSection === 'data'}
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-bold mb-4" style="color: {$currentTheme.text};">💾 Data Management</h3>
                <div class="space-y-3">
                  <button
                    onclick={exportData}
                    class="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02]"
                    style="background-color: {$currentTheme.bg}; color: {$currentTheme.text};"
                  >
                    <div class="flex items-center gap-3">
                      <div class="text-2xl">📥</div>
                      <div>
                        <div class="font-semibold">Export All Data</div>
                        <div class="text-sm opacity-70">Download your events and settings as JSON</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onclick={clearAllData}
                    class="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02]"
                    style="background-color: {$currentTheme.bg}; color: {$currentTheme.text};"
                  >
                    <div class="flex items-center gap-3">
                      <div class="text-2xl">🗑️</div>
                      <div>
                        <div class="font-semibold">Clear All Cache</div>
                        <div class="text-sm opacity-70">Remove all locally stored data</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold mb-4" style="color: {$currentTheme.text};">🔒 Privacy</h3>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.privacy.analytics}
                      onchange={saveSettings}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Allow anonymous analytics</span>
                  </label>

                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={settings.privacy.crashReports}
                      onchange={saveSettings}
                      class="w-5 h-5 rounded"
                      style="accent-color: {$currentTheme.accent};"
                    />
                    <span style="color: {$currentTheme.text};">Send crash reports</span>
                  </label>
                </div>
              </div>
            </div>

          {:else if activeSection === 'about'}
            <div class="space-y-6">
              <div class="text-center py-8">
                <div class="text-6xl mb-4">📚</div>
                <h2 class="text-2xl font-bold mb-2" style="color: {$currentTheme.accent};">QuickXS</h2>
                <p class="text-sm mb-4" style="color: {$currentTheme.text}; opacity: 0.7;">
                  Student Schedule Manager & Class Planner
                </p>
                <div class="text-xs mb-6" style="color: {$currentTheme.text}; opacity: 0.5;">
                  Version 1.0.0
                </div>

                <div class="max-w-md mx-auto text-sm space-y-4" style="color: {$currentTheme.text};">
                  <p>
                    QuickXS helps students manage their class schedules, track assignments,
                    and stay organized with a beautiful, easy-to-use interface.
                  </p>

                  <div class="pt-4 border-t" style="border-color: {$currentTheme.bg};">
                    <div class="font-semibold mb-2">Features:</div>
                    <ul class="text-left space-y-1 opacity-70">
                      <li>• Real-time schedule updates</li>
                      <li>• Event tracking & notifications</li>
                      <li>• Offline support</li>
                      <li>• 7 beautiful themes</li>
                      <li>• PWA support (installable)</li>
                    </ul>
                  </div>

                  <div class="pt-4" style="opacity: 0.5;">
                    Made with ❤️ by shinzuu
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-4 border-t flex justify-end gap-3" style="border-color: {$currentTheme.accent};">
        <button
          onclick={() => showSettings = false}
          class="px-6 py-2 rounded-lg font-semibold transition-all hover:opacity-80"
          style="background-color: {$currentTheme.bg}; color: {$currentTheme.text};"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 5px;
    outline: none;
    -webkit-appearance: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
  }
</style>
