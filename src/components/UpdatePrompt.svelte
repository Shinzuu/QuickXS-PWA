<script>
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import { toasts } from '../lib/toastStore'

  const {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
      // Check for updates every 30 minutes for faster detection
      setInterval(() => {
        console.log('Checking for updates...')
        r?.update()
      }, 30 * 60 * 1000)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
    immediate: true,
  })

  let hasShownOffline = $state(false)
  let hasStartedUpdate = $state(false)

  // Show offline ready notification (runs once)
  $effect(() => {
    if ($offlineReady && !hasShownOffline) {
      hasShownOffline = true
      toasts.add('App ready to work offline!', 'success', '✅ Offline Ready', 2000)
    }
  })

  // Auto-update when new version is available (runs once)
  $effect(() => {
    if ($needRefresh && !hasStartedUpdate) {
      hasStartedUpdate = true
      console.log('New version detected! Auto-updating...')
      toasts.add('New version available! Updating now...', 'info', '🔄 Updating', 2000)

      setTimeout(async () => {
        await updateServiceWorker(true)
        toasts.add('Update complete! Reloading...', 'success', '✅ Updated', 1000)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }, 500)
    }
  })
</script>

<!-- No UI needed - updates happen automatically with toast notifications -->
