<script>
  import { isDarkMode, toggleDarkMode, currentTheme } from '../lib/themeStore'
</script>

<button
  onclick={toggleDarkMode}
  class="fixed top-6 right-6 z-40 p-3 rounded-lg shadow-lg transition-all"
  style="background-color: {$currentTheme.card}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
  aria-label="Toggle dark/light mode"
  title="{$isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}"
>
  {#if $isDarkMode}
    <!-- Sun Icon for Light Mode -->
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  {:else}
    <!-- Moon Icon for Dark Mode -->
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  {/if}
</button>

<style>
  button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  button:hover {
    transform: scale(1.1) rotate(15deg);
    box-shadow: 0 8px 24px rgba(0, 173, 181, 0.4);
  }

  button:active {
    transform: scale(0.95);
  }

  @media (max-width: 640px) {
    button {
      top: 16px;
      right: 16px;
      padding: 10px;
    }
  }
</style>
