<script>
  import { onMount } from 'svelte'
  import { supabase } from '../lib/supabase'
  import AdminPanelNew from './AdminPanelNew.svelte'

  let isAuthenticated = $state(false)
  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(true)
  let loggingIn = $state(false)
  let user = $state(null)
  let rememberMe = $state(true)

  onMount(async () => {
    // Load saved email if it exists
    const savedEmail = localStorage.getItem('adminEmail')
    if (savedEmail) {
      email = savedEmail
    }

    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      isAuthenticated = true
      user = session.user
    }

    loading = false

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        isAuthenticated = true
        user = session.user
      } else {
        isAuthenticated = false
        user = null
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  })

  async function handleLogin(e) {
    e.preventDefault()
    error = ''
    loggingIn = true

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('adminEmail', email)
      } else {
        localStorage.removeItem('adminEmail')
      }

      isAuthenticated = true
      user = data.user
      password = '' // Clear password
    } catch (err) {
      error = err.message || 'Login failed. Please check your credentials.'
      console.error('Login error:', err)
    } finally {
      loggingIn = false
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
      isAuthenticated = false
      user = null
      email = ''
      password = ''
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

</script>

{#if loading}
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
          Sign in with your Supabase account
        </p>
      </div>

      <form onsubmit={handleLogin} class="p-8 rounded-2xl shadow-2xl" style="background-color: var(--color-card);">
        {#if error}
          <div class="mb-4 p-4 rounded-lg bg-red-500 bg-opacity-20 border-2 border-red-500">
            <p class="text-red-400 text-sm">❌ {error}</p>
          </div>
        {/if}

        <div class="mb-4">
          <label for="email" class="block text-sm font-semibold mb-2" style="color: var(--color-text);">
            Email
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            disabled={loggingIn}
            class="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none"
            style="
              background-color: var(--color-bg);
              color: var(--color-text);
              border-color: {error ? '#ef4444' : 'var(--color-accent)'};
            "
            placeholder="admin@example.com"
          />
        </div>

        <div class="mb-4">
          <label for="password" class="block text-sm font-semibold mb-2" style="color: var(--color-text);">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            disabled={loggingIn}
            class="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none"
            style="
              background-color: var(--color-bg);
              color: var(--color-text);
              border-color: {error ? '#ef4444' : 'var(--color-accent)'};
            "
            placeholder="••••••••"
          />
        </div>

        <div class="mb-6 flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            bind:checked={rememberMe}
            disabled={loggingIn}
            class="w-4 h-4 rounded border-2 transition-all focus:outline-none cursor-pointer"
            style="accent-color: var(--color-accent);"
          />
          <label for="remember-me" class="ml-2 text-sm font-medium cursor-pointer" style="color: var(--color-text);">
            Remember my email
          </label>
        </div>

        <button
          type="submit"
          disabled={loggingIn}
          class="w-full py-3 px-6 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style="background-color: var(--color-accent); color: var(--color-bg);"
        >
          {loggingIn ? '🔄 Logging in...' : '🔓 Login'}
        </button>

        <div class="mt-6 p-4 rounded-lg" style="background-color: var(--color-bg);">
          <p class="text-xs" style="color: var(--color-text); opacity: 0.6;">
            ℹ️ Secure authentication powered by Supabase
          </p>
          <p class="text-xs mt-2" style="color: var(--color-text); opacity: 0.6;">
            Admin users must be created in Supabase Dashboard
          </p>
        </div>
      </form>
    </div>
  </div>
{:else}
  <!-- Admin Panel (Authenticated) -->
  <div style="background-color: var(--color-bg);">
    <!-- Logout Button -->
    <div class="fixed top-4 right-4 z-50">
      <div class="flex items-center gap-3">
        <div class="text-sm" style="color: var(--color-text); opacity: 0.8;">
          👤 {user?.email}
        </div>
        <button
          onclick={handleLogout}
          class="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105"
          style="background-color: #ef4444; color: white;"
          title="Logout from Admin Panel"
        >
          🚪 Logout
        </button>
      </div>
    </div>

    <AdminPanelNew />
  </div>
{/if}

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
