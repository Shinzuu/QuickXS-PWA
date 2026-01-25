<script>
  import { onMount } from 'svelte'
  import { toasts } from '../lib/toastStore'
  import { currentTheme } from '../lib/themeStore'

  function getIcon(type) {
    switch(type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }

  function getColor(type) {
    switch(type) {
      case 'success': return '#10b981'
      case 'error': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'info': return '#3b82f6'
      default: return '#3b82f6'
    }
  }
</script>

<div class="toast-container fixed top-20 right-4 z-50 space-y-3" style="max-width: 90vw; width: 400px;">
  {#each $toasts as toast (toast.id)}
    <div
      class="toast flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-sm"
      style="
        background-color: {$currentTheme.card};
        border-left: 4px solid {getColor(toast.type)};
        color: {$currentTheme.text};
        animation: slideIn 0.3s ease-out;
      "
    >
      <span class="text-2xl flex-shrink-0">{getIcon(toast.type)}</span>
      <div class="flex-1 min-w-0">
        {#if toast.title}
          <div class="font-bold mb-1" style="color: {getColor(toast.type)};">{toast.title}</div>
        {/if}
        <div class="text-sm opacity-90 break-words">{toast.message}</div>
      </div>
      <button
        onclick={() => toasts.remove(toast.id)}
        class="flex-shrink-0 text-xl opacity-60 hover:opacity-100 transition-opacity"
        style="color: {$currentTheme.text};"
      >
        ✕
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast {
    animation: slideIn 0.3s ease-out;
  }

  @media (max-width: 640px) {
    .toast-container {
      right: 1rem;
      left: 1rem;
      width: auto;
      max-width: none;
    }
  }
</style>
