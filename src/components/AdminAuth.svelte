<script>
  import { onMount } from 'svelte'
  import AdminPanel from './AdminPanel.svelte'

  const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH

  let isAuthenticated = $state(false)
  let password = $state('')
  let error = $state('')
  let isLoading = $state(true)

  onMount(() => {
    // Check if already authenticated in this session
    const authToken = sessionStorage.getItem('quickxs_admin_auth')
    if (authToken === ADMIN_PASSWORD_HASH) {
      isAuthenticated = true
    }
    isLoading = false
  })

  async function hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  async function handleLogin(e) {
    e.preventDefault()
    error = ''

    if (!password) {
      error = 'Please enter password'
      return
    }

    const hash = await hashPassword(password)

    if (hash === ADMIN_PASSWORD_HASH) {
      isAuthenticated = true
      sessionStorage.setItem('quickxs_admin_auth', hash)
      password = ''
    } else {
      error = 'Incorrect password'
      password = ''
    }
  }

  function handleLogout() {
    isAuthenticated = false
    sessionStorage.removeItem('quickxs_admin_auth')
    password = ''
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center min-h-screen" style="background-color: var(--color-bg);">
    <div class="animate-spin rounded-full h-12 w-12 border-3 border-t-transparent" style="border-color: var(--color-accent); border-top-color: transparent;"></div>
  </div>
{:else if !isAuthenticated}
  <!-- Login Screen -->
  <div class="min-h-screen flex items-center justify-center p-4" style="background-color: var(--color-bg);">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🔐</div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--color-accent);">Admin Login</h1>
        <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
          Enter password to access admin panel
        </p>
      </div>

      <form onsubmit={handleLogin} class="p-8 rounded-2xl shadow-2xl" style="background-color: var(--color-card);">
        <div class="mb-6">
          <label class="block text-sm font-semibold mb-2" style="color: var(--color-text);">
            Password
          </label>
          <input
            type="password"
            bind:value={password}
            placeholder="Enter admin password"
            class="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none"
            style="
              background-color: var(--color-bg);
              color: var(--color-text);
              border-color: {error ? '#ef4444' : 'var(--color-accent)'};
            "
            autofocus
          />
          {#if error}
            <p class="text-red-500 text-sm mt-2">❌ {error}</p>
          {/if}
        </div>

        <button
          type="submit"
          class="w-full py-3 px-6 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
          style="background-color: var(--color-accent); color: var(--color-bg);"
        >
          🔓 Login
        </button>

        <div class="mt-6 p-4 rounded-lg" style="background-color: var(--color-bg);">
          <p class="text-xs" style="color: var(--color-text); opacity: 0.6;">
            ℹ️ Default password: <code class="px-2 py-1 rounded" style="background-color: var(--color-card);">admin123</code>
          </p>
          <p class="text-xs mt-2" style="color: var(--color-text); opacity: 0.6;">
            Change password in <code class="px-1 rounded" style="background-color: var(--color-card);">.env</code> file
          </p>
        </div>
      </form>
    </div>
  </div>
{:else}
  <!-- Admin Panel with Logout -->
  <div style="background-color: var(--color-bg);">
    <!-- Logout Button (Floating) -->
    <div class="fixed top-4 right-4 z-50">
      <button
        onclick={handleLogout}
        class="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105"
        style="background-color: #ef4444; color: white;"
        title="Logout from Admin Panel"
      >
        🚪 Logout
      </button>
    </div>

    <AdminPanel />
  </div>
{/if}

<style>
  code {
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
</style>
