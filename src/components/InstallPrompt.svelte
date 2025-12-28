<script>
  import { onMount } from 'svelte'

  let deferredPrompt = $state(null)
  let showInstallPrompt = $state(false)
  let dismissed = $state(false)

  onMount(() => {
    // Check if already dismissed
    if (localStorage.getItem('installPromptDismissed')) {
      dismissed = true
      return
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      // Show custom install prompt after a short delay
      setTimeout(() => {
        if (!dismissed) {
          showInstallPrompt = true
        }
      }, 5000)
    })

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      showInstallPrompt = false
    }
  })

  async function handleInstall() {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    }

    deferredPrompt = null
    showInstallPrompt = false
  }

  function handleDismiss() {
    showInstallPrompt = false
    dismissed = true
    localStorage.setItem('installPromptDismissed', 'true')
  }
</script>

{#if showInstallPrompt && !dismissed}
  <div class="fixed bottom-20 left-4 right-4 md:left-auto md:right-24 md:w-96 z-40 rounded-lg p-4 shadow-2xl" style="background-color: #393E46; border: 2px solid #00ADB5; animation: slideUp 0.5s ease-out;">
    <button
      onclick={handleDismiss}
      class="absolute top-2 right-2 p-1 rounded-full hover:opacity-70 transition-opacity"
      style="color: #EEEEEE; opacity: 0.6;"
      aria-label="Dismiss"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <div class="flex items-start gap-3 pr-6">
      <div class="flex-shrink-0 p-2 rounded-lg" style="background-color: #00ADB5;">
        <svg class="w-6 h-6" style="color: #222831;" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </div>

      <div class="flex-1">
        <h3 class="font-bold text-lg mb-1" style="color: #00ADB5;">Install QuickXS</h3>
        <p class="text-sm mb-3" style="color: #EEEEEE; opacity: 0.8;">
          Add QuickXS to your home screen for quick access and offline support!
        </p>

        <div class="flex gap-2">
          <button
            onclick={handleInstall}
            class="flex-1 py-2 px-4 rounded-lg font-semibold transition-all hover:scale-105"
            style="background-color: #00ADB5; color: #222831; box-shadow: 0 2px 8px rgba(0, 173, 181, 0.4);"
          >
            Install Now
          </button>
          <button
            onclick={handleDismiss}
            class="px-4 py-2 rounded-lg font-semibold transition-colors"
            style="background-color: #222831; color: #EEEEEE; border: 2px solid #393E46;"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
