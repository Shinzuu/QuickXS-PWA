<script>
  import { onMount } from 'svelte'
  import { getAllLinks, deleteLink, createLink, updateLink } from '$lib/admin/linksApi'

  let links = $state([])
  let loading = $state(true)
  let showModal = $state(false)
  let editingLink = $state(null)
  let error = $state('')

  let form = $state({
    name: '',
    url: '',
    category: 'general'
  })

  onMount(async () => {
    await loadLinks()
  })

  async function loadLinks() {
    loading = true
    try {
      links = await getAllLinks()
    } catch (err) {
      error = 'Failed to load links: ' + err.message
    } finally {
      loading = false
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this link?')) return
    try {
      await deleteLink(id)
      links = links.filter(l => l.id !== id)
    } catch (err) {
      error = 'Failed to delete: ' + err.message
    }
  }

  function openAddModal() {
    editingLink = null
    form = { name: '', url: '', category: 'general' }
    showModal = true
  }

  function openEditModal(link) {
    editingLink = link
    form = { ...link }
    showModal = true
  }

  async function handleSubmit() {
    error = ''
    try {
      if (editingLink) {
        const updated = await updateLink(editingLink.id, form)
        links = links.map(l => l.id === editingLink.id ? updated : l)
      } else {
        const created = await createLink(form)
        links = [...links, created]
      }
      showModal = false
    } catch (err) {
      error = 'Failed to save: ' + err.message
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold" style="color: #00ADB5;">Links Management</h1>
      <p class="mt-2 text-gray-400">{links.length} links total</p>
    </div>
    <button onclick={openAddModal} class="px-6 py-3 rounded-lg font-bold transition-all hover:scale-105" style="background-color: #00ADB5; color: #222831;">+ Add Link</button>
  </div>

  {#if error}
    <div class="p-4 rounded-lg bg-red-500 bg-opacity-20 border-2 border-red-500">
      <p class="text-red-400">{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 mx-auto" style="border-color: #00ADB5;"></div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each links as link}
        <div class="rounded-lg p-6 shadow-lg" style="background-color: #393E46;">
          <h3 class="text-lg font-bold mb-2" style="color: #EEEEEE;">{link.name}</h3>
          <a href={link.url} target="_blank" rel="noopener noreferrer" class="text-sm hover:underline block mb-2 truncate" style="color: #00ADB5;">{link.url}</a>
          <p class="text-sm text-gray-400 mb-4">Category: {link.category}</p>
          <div class="flex gap-2">
            <button onclick={() => openEditModal(link)} class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105" style="background-color: #00ADB5; color: #222831;">Edit</button>
            <button onclick={() => handleDelete(link.id)} class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105" style="background-color: #FF6B6B; color: #EEEEEE;">Delete</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0, 0, 0, 0.7);" onclick={() => showModal = false} role="dialog" aria-modal="true">
    <div class="rounded-lg p-6 max-w-md w-full" style="background-color: #393E46;" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-2xl font-bold mb-6" style="color: #00ADB5;">{editingLink ? 'Edit Link' : 'Add New Link'}</h2>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Link Title</label>
          <input id="name" type="text" bind:value={form.name} required class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;" />
        </div>
        <div>
          <label for="url" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">URL</label>
          <input id="url" type="url" bind:value={form.url} required class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;" placeholder="https://..." />
        </div>
        <div>
          <label for="category" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Category</label>
          <input id="category" type="text" bind:value={form.category} class="w-full p-3 rounded-lg" style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;" />
        </div>
        <div class="flex gap-3 pt-4">
          <button type="submit" class="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105" style="background-color: #00ADB5; color: #222831;">{editingLink ? 'Update' : 'Create'}</button>
          <button type="button" onclick={() => showModal = false} class="px-6 py-3 rounded-lg font-bold" style="background-color: #222831; color: #EEEEEE; border: 2px solid #393E46;">Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
