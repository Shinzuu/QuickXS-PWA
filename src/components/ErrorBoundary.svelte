<script>
  import { onMount } from 'svelte'

  let hasError = $state(false)
  let errorMessage = $state('')
  let errorStack = $state('')

  // Catch unhandled errors
  function handleError(event) {
    hasError = true
    errorMessage = event.error?.message || 'An unexpected error occurred'
    errorStack = event.error?.stack || ''
    console.error('Error caught by boundary:', event.error)

    // Prevent default browser error handling
    event.preventDefault()
  }

  // Catch unhandled promise rejections
  function handleRejection(event) {
    hasError = true
    errorMessage = event.reason?.message || event.reason || 'An unhandled promise rejection occurred'
    errorStack = event.reason?.stack || ''
    console.error('Promise rejection caught by boundary:', event.reason)

    // Prevent default browser error handling
    event.preventDefault()
  }

  function reload() {
    window.location.reload()
  }

  onMount(() => {
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  })
</script>

{#if hasError}
  <div class="fixed inset-0 flex items-center justify-center p-4" style="z-index: 99999; background-color: rgba(0, 0, 0, 0.9);">
    <div class="max-w-2xl w-full rounded-2xl p-8 shadow-2xl" style="background-color: var(--color-card, #1a1a1a); color: var(--color-text, #fff);">
      <!-- Error Icon -->
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">❌</div>
        <h1 class="text-3xl font-bold mb-2" style="color: #ff6b6b;">Oops! Something went wrong</h1>
        <p class="text-lg opacity-80">Don't worry, your data is safe. Let's get you back on track.</p>
      </div>

      <!-- Error Details -->
      <div class="mb-6 p-4 rounded-lg" style="background-color: rgba(255, 107, 107, 0.1); border: 2px solid #ff6b6b;">
        <h3 class="font-bold mb-2" style="color: #ff6b6b;">Error Details:</h3>
        <p class="font-mono text-sm mb-2">{errorMessage}</p>
        {#if errorStack}
          <details class="mt-2">
            <summary class="cursor-pointer text-sm opacity-70 hover:opacity-100">View stack trace</summary>
            <pre class="mt-2 text-xs overflow-auto max-h-40 p-2 rounded" style="background-color: rgba(0, 0, 0, 0.3);">{errorStack}</pre>
          </details>
        {/if}
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          onclick={reload}
          class="flex-1 py-3 px-6 rounded-lg font-bold text-white transition-all hover:scale-105"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
        >
          🔄 Reload App
        </button>
        <button
          onclick={() => hasError = false}
          class="flex-1 py-3 px-6 rounded-lg font-bold transition-all hover:scale-105"
          style="background-color: rgba(255, 255, 255, 0.1); color: var(--color-text, #fff);"
        >
          ✕ Dismiss
        </button>
      </div>

      <!-- Help Text -->
      <p class="text-center mt-6 text-sm opacity-60">
        If this problem persists, try clearing your browser cache or contact support.
      </p>
    </div>
  </div>
{:else}
  <slot />
{/if}
