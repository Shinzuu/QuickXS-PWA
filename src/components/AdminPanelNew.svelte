<script>
  import AdminDashboard from './AdminDashboard.svelte'
  import AdminEventsManagerPro from './AdminEventsManagerPro.svelte'

  let activeTab = $state('dashboard') // 'dashboard', 'events', 'routines', 'settings'

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'routines', label: 'Classes', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]
</script>

<div class="admin-panel min-h-screen" style="background-color: var(--color-bg);">
  <!-- Top Navigation Bar -->
  <nav class="sticky top-0 z-40 border-b" style="background-color: var(--color-card); border-color: var(--color-accent);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo/Title -->
        <div class="flex items-center gap-3">
          <span class="text-3xl">🔧</span>
          <div>
            <h1 class="text-xl font-bold" style="color: var(--color-accent);">QuickXS Admin</h1>
            <p class="text-xs" style="color: var(--color-text); opacity: 0.6;">Management Panel</p>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2">
          {#each tabs as tab}
            <button
              onclick={() => activeTab = tab.id}
              class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
              style="
                background-color: {activeTab === tab.id ? 'var(--color-accent)' : 'transparent'};
                color: {activeTab === tab.id ? 'var(--color-bg)' : 'var(--color-text)'};
              "
            >
              <span class="mr-2">{tab.icon}</span>
              <span class="hidden md:inline">{tab.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content Area -->
  <main class="max-w-7xl mx-auto">
    {#if activeTab === 'dashboard'}
      <AdminDashboard />
    {:else if activeTab === 'events'}
      <AdminEventsManagerPro />
    {:else if activeTab === 'routines'}
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4" style="color: var(--color-accent);">📚 Class Routines</h2>
        <p style="color: var(--color-text); opacity: 0.7;">Coming soon: Manage your class schedule here</p>
      </div>
    {:else if activeTab === 'settings'}
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4" style="color: var(--color-accent);">⚙️ Settings</h2>
        <div class="space-y-4 max-w-2xl">
          <div class="p-4 rounded-lg" style="background-color: var(--color-card);">
            <h3 class="font-bold mb-2" style="color: var(--color-text);">Account</h3>
            <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
              You're logged in with Supabase authentication
            </p>
          </div>
          <div class="p-4 rounded-lg" style="background-color: var(--color-card);">
            <h3 class="font-bold mb-2" style="color: var(--color-text);">Data Management</h3>
            <div class="flex gap-3 mt-3">
              <button class="px-4 py-2 rounded-lg" style="background-color: var(--color-accent); color: var(--color-bg);">
                📥 Export All Data
              </button>
              <button class="px-4 py-2 rounded-lg" style="background-color: var(--color-bg); color: var(--color-text);">
                📤 Import Data
              </button>
            </div>
          </div>
          <div class="p-4 rounded-lg" style="background-color: var(--color-card);">
            <h3 class="font-bold mb-2" style="color: var(--color-text);">Keyboard Shortcuts</h3>
            <div class="text-sm space-y-1" style="color: var(--color-text); opacity: 0.7;">
              <div>⌨️ <kbd class="px-2 py-1 rounded bg-gray-700">Ctrl+N</kbd> - New Event</div>
              <div>⌨️ <kbd class="px-2 py-1 rounded bg-gray-700">Ctrl+E</kbd> - Export</div>
              <div>⌨️ <kbd class="px-2 py-1 rounded bg-gray-700">Ctrl+F</kbd> - Search</div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>

  <!-- Footer -->
  <footer class="mt-12 py-6 border-t text-center" style="border-color: var(--color-accent); opacity: 0.5;">
    <p class="text-sm" style="color: var(--color-text);">
      QuickXS Admin Panel • Powered by Supabase
    </p>
  </footer>
</div>

<style>
  kbd {
    font-family: monospace;
    font-size: 0.9em;
  }
</style>
