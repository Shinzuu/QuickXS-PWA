<script>
  import { onMount } from 'svelte'

  // Shortcuts configuration using $props()
  let {
    onHome = () => {},
    onCalendar = () => {},
    onArchive = () => {},
    onStats = () => {},
    onAdmin = () => {},
    onRefresh = () => {},
    onSettings = () => {}
  } = $props()

  let showHelp = $state(false)

  const shortcuts = [
    { key: 'h', ctrl: false, description: 'Go to Home', action: onHome },
    { key: 'c', ctrl: false, description: 'Open Calendar', action: onCalendar },
    { key: 'a', ctrl: false, description: 'Open Archive', action: onArchive },
    { key: 's', ctrl: false, description: 'Open Statistics', action: onStats },
    { key: 'm', ctrl: false, description: 'Open Admin Panel', action: onAdmin },
    { key: 'r', ctrl: true, description: 'Refresh Data', action: onRefresh },
    { key: ',', ctrl: true, description: 'Open Settings', action: onSettings },
    { key: '?', ctrl: false, description: 'Show Keyboard Shortcuts', action: () => showHelp = !showHelp }
  ]

  function handleKeydown(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return
    }

    // Check for matching shortcut
    const shortcut = shortcuts.find(s => {
      const keyMatches = e.key.toLowerCase() === s.key.toLowerCase()
      const ctrlMatches = s.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
      return keyMatches && ctrlMatches
    })

    if (shortcut) {
      e.preventDefault()
      shortcut.action()
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })
</script>

<!-- Keyboard Shortcuts Help Modal -->
{#if showHelp}
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center p-4"
    onclick={() => showHelp = false}
    role="dialog"
    aria-label="Keyboard shortcuts help"
  >
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <div
      class="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
      style="background-color: var(--color-card);"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="p-6 border-b" style="border-color: var(--color-accent);">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold" style="color: var(--color-accent);">⌨️ Keyboard Shortcuts</h2>
            <p class="text-sm mt-1" style="color: var(--color-text); opacity: 0.7;">
              Use these shortcuts to navigate faster
            </p>
          </div>
          <button
            onclick={() => showHelp = false}
            class="p-2 rounded-lg hover:opacity-70 transition-all"
            style="color: var(--color-text);"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Shortcuts List -->
      <div class="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
        {#each shortcuts as shortcut}
          <div class="flex items-center justify-between p-3 rounded-lg" style="background-color: var(--color-bg);">
            <span style="color: var(--color-text);">{shortcut.description}</span>
            <div class="flex items-center gap-1">
              {#if shortcut.ctrl}
                <kbd class="px-3 py-1.5 rounded font-mono text-sm" style="background-color: var(--color-card); color: var(--color-text); border: 1px solid var(--color-accent);">
                  Ctrl
                </kbd>
                <span style="color: var(--color-text); opacity: 0.5;">+</span>
              {/if}
              <kbd class="px-3 py-1.5 rounded font-mono text-sm uppercase" style="background-color: var(--color-card); color: var(--color-text); border: 1px solid var(--color-accent);">
                {shortcut.key === '?' ? '?' : shortcut.key}
              </kbd>
            </div>
          </div>
        {/each}
      </div>

      <!-- Footer -->
      <div class="p-4 border-t text-center text-sm" style="border-color: var(--color-accent); color: var(--color-text); opacity: 0.6;">
        Press <kbd class="px-2 py-1 rounded font-mono" style="background-color: var(--color-bg);">?</kbd> to toggle this help
      </div>
    </div>
  </div>
{/if}
