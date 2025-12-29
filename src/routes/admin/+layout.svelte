<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { isAdmin, adminUser, logoutAdmin, authLoading } from '$lib/admin/auth'

  let showMobileMenu = $state(false)

  onMount(() => {
    // Redirect to login if not authenticated (except on login page)
    const checkAuth = () => {
      if (!$authLoading && !$isAdmin && $page.url.pathname !== '/admin/login') {
        goto('/admin/login')
      }
    }

    checkAuth()
  })

  async function handleLogout() {
    await logoutAdmin()
    goto('/admin/login')
  }

  function isActive(path) {
    return $page.url.pathname.startsWith(path)
  }
</script>

{#if $page.url.pathname === '/admin/login'}
  <!-- Login page - no layout -->
  <slot />
{:else if $authLoading}
  <!-- Loading state -->
  <div class="min-h-screen flex items-center justify-center" style="background-color: #222831;">
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-4" style="border-color: #00ADB5;"></div>
      <p style="color: #EEEEEE;">Loading...</p>
    </div>
  </div>
{:else if $isAdmin}
  <!-- Admin layout -->
  <div class="min-h-screen" style="background-color: #222831;">
    <!-- Top Navigation -->
    <nav class="border-b" style="background-color: #393E46; border-color: #00ADB5;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a href="/admin" class="text-2xl font-bold" style="color: #00ADB5;">
              QuickXS Admin
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <a
              href="/admin"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              class:bg-opacity-20={isActive('/admin') && $page.url.pathname === '/admin'}
              style="color: {isActive('/admin') && $page.url.pathname === '/admin' ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin') && $page.url.pathname === '/admin' ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Dashboard
            </a>
            <a
              href="/admin/classes"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style="color: {isActive('/admin/classes') ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin/classes') ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Classes
            </a>
            <a
              href="/admin/events"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style="color: {isActive('/admin/events') ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin/events') ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Events
            </a>
            <a
              href="/admin/links"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style="color: {isActive('/admin/links') ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin/links') ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Links
            </a>
            <a
              href="/"
              class="px-3 py-2 rounded-md text-sm font-medium"
              style="color: #EEEEEE;"
            >
              View App
            </a>
            <button
              onclick={handleLogout}
              class="px-4 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
              style="background-color: #FF6B6B; color: #EEEEEE;"
            >
              Logout
            </button>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button
              onclick={() => showMobileMenu = !showMobileMenu}
              class="p-2 rounded-md"
              style="color: #EEEEEE;"
              aria-label="Toggle mobile menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      {#if showMobileMenu}
        <div class="md:hidden border-t" style="border-color: #00ADB5;">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/admin"
              class="block px-3 py-2 rounded-md text-base font-medium"
              style="color: {isActive('/admin') && $page.url.pathname === '/admin' ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin') && $page.url.pathname === '/admin' ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Dashboard
            </a>
            <a
              href="/admin/classes"
              class="block px-3 py-2 rounded-md text-base font-medium"
              style="color: {isActive('/admin/classes') ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin/classes') ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Classes
            </a>
            <a
              href="/admin/events"
              class="block px-3 py-2 rounded-md text-base font-medium"
              style="color: {isActive('/admin/events') ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin/events') ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Events
            </a>
            <a
              href="/admin/links"
              class="block px-3 py-2 rounded-md text-base font-medium"
              style="color: {isActive('/admin/links') ? '#00ADB5' : '#EEEEEE'}; background-color: {isActive('/admin/links') ? 'rgba(0, 173, 181, 0.2)' : 'transparent'};"
            >
              Links
            </a>
            <a
              href="/"
              class="block px-3 py-2 rounded-md text-base font-medium"
              style="color: #EEEEEE;"
            >
              View App
            </a>
            <button
              onclick={handleLogout}
              class="block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              style="background-color: #FF6B6B; color: #EEEEEE;"
            >
              Logout
            </button>
          </div>
        </div>
      {/if}
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
{:else}
  <!-- Fallback - redirect to login -->
  <div class="min-h-screen flex items-center justify-center" style="background-color: #222831;">
    <p style="color: #EEEEEE;">Redirecting...</p>
  </div>
{/if}

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
