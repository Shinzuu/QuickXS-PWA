<script>
  import { onMount } from 'svelte'
  import { getAllClasses, deleteClass, createClass, updateClass } from '$lib/admin/routinesApi'

  let classes = $state([])
  let loading = $state(true)
  let showModal = $state(false)
  let editingClass = $state(null)
  let error = $state('')

  let form = $state({
    day: 'Monday',
    time: '08:00',
    subject: '',
    teacher: '',
    classroom: '',
    duration: 75
  })

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']

  onMount(async () => {
    await loadClasses()
  })

  async function loadClasses() {
    loading = true
    try {
      classes = await getAllClasses()
    } catch (err) {
      error = 'Failed to load classes: ' + err.message
    } finally {
      loading = false
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this class?')) return

    try {
      await deleteClass(id)
      classes = classes.filter(c => c.id !== id)
    } catch (err) {
      error = 'Failed to delete: ' + err.message
    }
  }

  function openAddModal() {
    editingClass = null
    form = {
      day: 'Monday',
      time: '08:00',
      subject: '',
      teacher: '',
      classroom: '',
      duration: 75
    }
    showModal = true
  }

  function openEditModal(classItem) {
    editingClass = classItem
    form = {
      day: classItem.day,
      time: classItem.time,
      subject: classItem.subject,
      teacher: classItem.teacher,
      classroom: classItem.classroom,
      duration: classItem.duration
    }
    showModal = true
  }

  async function handleSubmit() {
    error = ''
    try {
      if (editingClass) {
        const updated = await updateClass(editingClass.id, form)
        classes = classes.map(c => c.id === editingClass.id ? updated : c)
      } else {
        const created = await createClass(form)
        classes = [...classes, created]
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
      <h1 class="text-3xl font-bold" style="color: #00ADB5;">Classes Management</h1>
      <p class="mt-2 text-gray-400">{classes.length} classes total</p>
    </div>
    <button
      onclick={openAddModal}
      class="px-6 py-3 rounded-lg font-bold transition-all hover:scale-105"
      style="background-color: #00ADB5; color: #222831;"
    >
      + Add Class
    </button>
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
    <div class="rounded-lg overflow-hidden shadow-lg" style="background-color: #393E46;">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead style="background-color: #222831;">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-bold" style="color: #00ADB5;">Day</th>
              <th class="px-6 py-4 text-left text-sm font-bold" style="color: #00ADB5;">Time</th>
              <th class="px-6 py-4 text-left text-sm font-bold" style="color: #00ADB5;">Subject</th>
              <th class="px-6 py-4 text-left text-sm font-bold" style="color: #00ADB5;">Teacher</th>
              <th class="px-6 py-4 text-left text-sm font-bold" style="color: #00ADB5;">Classroom</th>
              <th class="px-6 py-4 text-left text-sm font-bold" style="color: #00ADB5;">Duration</th>
              <th class="px-6 py-4 text-right text-sm font-bold" style="color: #00ADB5;">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each classes as classItem}
              <tr class="border-t transition-colors hover:bg-opacity-50" style="border-color: #222831;">
                <td class="px-6 py-4 text-sm" style="color: #EEEEEE;">{classItem.day}</td>
                <td class="px-6 py-4 text-sm" style="color: #EEEEEE;">{classItem.time}</td>
                <td class="px-6 py-4 text-sm font-semibold" style="color: #00ADB5;">{classItem.subject}</td>
                <td class="px-6 py-4 text-sm text-gray-400">{classItem.teacher}</td>
                <td class="px-6 py-4 text-sm text-gray-400">{classItem.classroom}</td>
                <td class="px-6 py-4 text-sm text-gray-400">{classItem.duration} min</td>
                <td class="px-6 py-4 text-right">
                  <button
                    onclick={() => openEditModal(classItem)}
                    class="text-sm font-semibold hover:underline mr-4"
                    style="color: #00ADB5;"
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => handleDelete(classItem.id)}
                    class="text-sm font-semibold hover:underline"
                    style="color: #FF6B6B;"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<!-- Modal -->
{#if showModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background-color: rgba(0, 0, 0, 0.7);"
    onclick={() => showModal = false}
    role="dialog"
    aria-modal="true"
  >
    <div
      class="rounded-lg p-6 max-w-2xl w-full"
      style="background-color: #393E46;"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 class="text-2xl font-bold mb-6" style="color: #00ADB5;">
        {editingClass ? 'Edit Class' : 'Add New Class'}
      </h2>

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="day" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Day</label>
            <select
              id="day"
              bind:value={form.day}
              class="w-full p-3 rounded-lg"
              style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
            >
              {#each days as day}
                <option value={day}>{day}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="time" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Time</label>
            <input
              id="time"
              type="time"
              bind:value={form.time}
              required
              class="w-full p-3 rounded-lg"
              style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
            />
          </div>
        </div>

        <div>
          <label for="subject" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Subject</label>
          <input
            id="subject"
            type="text"
            bind:value={form.subject}
            required
            class="w-full p-3 rounded-lg"
            style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
            placeholder="e.g. Mathematics"
          />
        </div>

        <div>
          <label for="teacher" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Teacher</label>
          <input
            id="teacher"
            type="text"
            bind:value={form.teacher}
            required
            class="w-full p-3 rounded-lg"
            style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
            placeholder="e.g. Dr. Smith"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="classroom" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Classroom</label>
            <input
              id="classroom"
              type="text"
              bind:value={form.classroom}
              required
              class="w-full p-3 rounded-lg"
              style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
              placeholder="e.g. Room 101"
            />
          </div>

          <div>
            <label for="duration" class="block text-sm font-semibold mb-2" style="color: #EEEEEE;">Duration (min)</label>
            <input
              id="duration"
              type="number"
              bind:value={form.duration}
              required
              min="15"
              max="240"
              class="w-full p-3 rounded-lg"
              style="background-color: #222831; color: #EEEEEE; border: 2px solid #00ADB5;"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            class="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105"
            style="background-color: #00ADB5; color: #222831;"
          >
            {editingClass ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onclick={() => showModal = false}
            class="px-6 py-3 rounded-lg font-bold"
            style="background-color: #222831; color: #EEEEEE; border: 2px solid #393E46;"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
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
