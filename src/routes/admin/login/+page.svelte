<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { loginAdmin, isAdmin, authLoading } from '$lib/admin/auth'

  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  onMount(() => {
    // Redirect if already logged in
    if ($isAdmin) {
      goto('/admin')
    }
  })

  async function handleLogin(e) {
    e.preventDefault()
    error = ''
    loading = true

    try {
      await loginAdmin(email, password)
      goto('/admin')
    } catch (err) {
      error = err.message || 'Login failed. Please check your credentials.'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center" style="background-color: #222831;">
  <div class="max-w-md w-full mx-4">
    <!-- Logo/Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2" style="color: #00ADB5;">QuickXS Admin</h1>
      <p class="text-gray-400">Manage your schedule data</p>
    </div>

    <!-- Login Card -->
    <div class="rounded-lg p-8 shadow-2xl" style="background-color: #393E46;">
      <h2 class="text-2xl font-bold mb-6" style="color: #EEEEEE;">Login</h2>

      {#if error}
        <div class="mb-4 p-4 rounded-lg bg-red-500 bg-opacity-20 border-2 border-red-500">
          <p class="text-red-400 text-sm">{error}</p>
        </div>
      {/if}

      <form on:submit={handleLogin} class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">
            Email
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            disabled={loading}
            class="w-full p-3 rounded-lg transition-colors"
            style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            disabled={loading}
            class="w-full p-3 rounded-lg transition-colors"
            style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full py-3 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style="background-color: #00ADB5; color: #222831; box-shadow: 0 4px 12px rgba(0, 173, 181, 0.4);"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div class="mt-6 text-center">
        <a href="/" class="text-sm hover:underline" style="color: #00ADB5;">
          ← Back to App
        </a>
      </div>
    </div>

    <!-- Info -->
    <div class="mt-6 text-center text-sm text-gray-500">
      <p>Secure admin access powered by Supabase Auth</p>
    </div>
  </div>
</div>
