<script>
  import { currentTheme } from '../lib/themeStore'

  export let icon = '📭'
  export let title = 'Nothing here yet'
  export let message = ''
  export let actionText = ''
  export let onAction = null
</script>

<div class="empty-state flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
  <div class="text-7xl mb-4 opacity-50 animate-bounce-slow">{icon}</div>
  <h3 class="text-2xl font-bold mb-2" style="color: {$currentTheme.text};">{title}</h3>
  {#if message}
    <p class="text-base mb-6 opacity-70" style="color: {$currentTheme.text}; max-width: 400px;">{message}</p>
  {/if}
  {#if actionText && onAction}
    <button
      onclick={onAction}
      class="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
      style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
    >
      {actionText}
    </button>
  {/if}
</div>

<style>
  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }

  .empty-state {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Battery Optimization: Disable infinite bounce when user prefers reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .animate-bounce-slow {
      animation: none !important;
    }
  }
</style>
