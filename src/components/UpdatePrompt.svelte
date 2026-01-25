<script>
  import { onMount } from 'svelte'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import { toasts } from '../lib/toastStore'

  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
      // Check for updates every hour
      setInterval(() => {
        r?.update()
      }, 60 * 60 * 1000)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  let autoUpdateTimer = null

  // When update is available, show notification and auto-update after 3 seconds
  $: if ($needRefresh && !autoUpdateTimer) {
    toasts.add('New version available! Updating in 3 seconds...', 'info', '🔄 Update', 3000)
    autoUpdateTimer = setTimeout(async () => {
      await updateServiceWorker(true)
      toasts.add('App updated successfully! Reloading...', 'success', '✅ Updated', 2000)
    }, 3000)
  }

  function close() {
    if (autoUpdateTimer) {
      clearTimeout(autoUpdateTimer)
      autoUpdateTimer = null
    }
    $needRefresh = false
  }

  async function updateNow() {
    if (autoUpdateTimer) {
      clearTimeout(autoUpdateTimer)
      autoUpdateTimer = null
    }
    await updateServiceWorker(true)
  }
</script>

{#if $needRefresh}
  <div class="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 z-50 animate-slide-up">
    <div
      class="rounded-lg p-4 shadow-2xl border-2"
      style="background-color: var(--color-card); border-color: var(--color-accent);"
    >
      <div class="flex items-start gap-3">
        <span class="text-2xl">🔄</span>
        <div class="flex-1">
          <h3 class="font-bold mb-1" style="color: var(--color-text);">
            New Version Available!
          </h3>
          <p class="text-sm opacity-80 mb-3" style="color: var(--color-text);">
            A new version of QuickXS is ready. Update now for the latest features and fixes.
          </p>
          <div class="flex gap-2">
            <button
              onclick={updateNow}
              class="flex-1 py-2 px-4 rounded-lg font-semibold transition-all hover:opacity-90"
              style="background-color: var(--color-accent); color: var(--color-bg);"
            >
              Update Now
            </button>
            <button
              onclick={close}
              class="py-2 px-4 rounded-lg font-semibold transition-all hover:opacity-80"
              style="background-color: var(--color-bg); color: var(--color-text); opacity: 0.7;"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
