<script>
  import { currentTheme, currentThemeName, themes, setTheme } from '../lib/themeStore'

  let showThemeMenu = $state(false)
</script>

<!-- Theme Toggle Button -->
<button
  onclick={() => showThemeMenu = !showThemeMenu}
  class="fixed bottom-6 right-6 z-40 p-4 rounded-full transition-all shadow-lg hover:scale-110"
  style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
  aria-label="Change theme"
  title="Change theme"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
</button>

<!-- Theme Menu -->
{#if showThemeMenu}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    onclick={() => showThemeMenu = false}
    onkeydown={(e) => e.key === 'Escape' && (showThemeMenu = false)}
    role="dialog"
    aria-modal="true"
    aria-labelledby="theme-menu-title"
  >
    <div class="absolute inset-0" style="background-color: rgba(0, 0, 0, 0.7);"></div>

    <div
      class="relative rounded-lg p-6 max-w-md w-full"
      style="background-color: #393E46; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 id="theme-menu-title" class="text-2xl font-bold mb-4" style="color: #00ADB5;">Choose Your Theme</h2>

      <div class="grid grid-cols-2 gap-3">
        {#each Object.entries(themes) as [key, theme]}
          <button
            onclick={() => {
              setTheme(key)
              showThemeMenu = false
            }}
            class="p-4 rounded-lg transition-all hover:scale-105 group"
            style="
              background-color: {theme.card};
              border: 3px solid {$currentThemeName === key ? theme.accent : 'transparent'};
              box-shadow: {$currentThemeName === key ? `0 0 0 2px ${theme.accent}40` : 'none'};
            "
            aria-label="Select {theme.name} theme"
            aria-pressed={$currentThemeName === key}
          >
            <div class="flex flex-col items-center gap-2">
              <!-- Theme Preview -->
              <div class="flex gap-1 mb-2">
                <div class="w-4 h-4 rounded-full" style="background-color: {theme.bg};"></div>
                <div class="w-4 h-4 rounded-full" style="background-color: {theme.card};"></div>
                <div class="w-4 h-4 rounded-full" style="background-color: {theme.accent};"></div>
              </div>

              <span class="font-bold text-sm" style="color: {theme.text};">{theme.name}</span>

              {#if $currentThemeName === key}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: {theme.accent}; color: {theme.bg};">
                  Active
                </span>
              {/if}
            </div>
          </button>
        {/each}
      </div>

      <button
        onclick={() => showThemeMenu = false}
        class="mt-4 w-full py-2 rounded-lg font-semibold transition-colors"
        style="background-color: #222831; color: #EEEEEE; border: 2px solid #393E46;"
      >
        Close
      </button>
    </div>
  </div>
{/if}

<style>
  button {
    user-select: none;
  }
</style>
