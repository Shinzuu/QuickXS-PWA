<script>
  import { isOffline, lastUpdated } from '../lib/store'

  function formatLastUpdated(timestamp) {
    if (!timestamp) return 'Never'

    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // seconds

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`

    return date.toLocaleDateString()
  }
</script>

{#if $isOffline}
  <div class="offline-banner px-4 py-2 text-center text-sm font-semibold" style="background-color: #FF6B6B; color: #FFFFFF; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);">
    <div class="flex items-center justify-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
      <span>⚠️ Offline</span>
      {#if $lastUpdated}
        <span class="text-xs opacity-80">• Last synced {formatLastUpdated($lastUpdated)}</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .offline-banner {
    position: sticky;
    top: 0;
    z-index: 50;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
</style>
