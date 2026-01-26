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
      // Auto-update check disabled to prevent app breaking
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

  // Auto-update disabled to prevent app breaking
  // User can manually refresh the page when they want to update
  $effect(() => {
    if ($needRefresh && !hasStartedUpdate) {
      hasStartedUpdate = true
      console.log('New version available (auto-update disabled)')
      toasts.add('New version available! Refresh page to update.', 'info', 'ℹ️ Update Available', 5000)
    }
  })
</script>

<!-- No UI needed - updates happen automatically with toast notifications -->
