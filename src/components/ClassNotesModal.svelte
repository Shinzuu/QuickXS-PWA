<script>
  import { currentTheme } from '../lib/themeStore'
  import { classNotes, addNote, addLink, removeLink } from '../lib/notesStore'

  let { classItem, onClose } = $props()

  let noteText = $state('')
  let linkUrl = $state('')
  let linkTitle = $state('')
  let currentNotes = $state({ note: '', links: [] })

  $effect(() => {
    if (classItem) {
      const notes = $classNotes[classItem.id] || { note: '', links: [] }
      currentNotes = notes
      noteText = notes.note || ''
    }
  })

  function saveNote() {
    if (noteText.trim()) {
      addNote(classItem.id, noteText.trim())
    }
  }

  function handleAddLink() {
    if (linkUrl.trim()) {
      addLink(classItem.id, linkUrl.trim(), linkTitle.trim() || linkUrl.trim())
      linkUrl = ''
      linkTitle = ''
    }
  }

  function handleRemoveLink(index) {
    removeLink(classItem.id, index)
  }

  function handleClose() {
    saveNote()
    onClose()
  }
</script>

{#if classItem}
  <div
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background-color: rgba(0, 0, 0, 0.7);"
    onclick={handleClose}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="notes-modal-title"
  >
    <div
      class="modal-content rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      style="background-color: {$currentTheme.card}; color: {$currentTheme.text}; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 id="notes-modal-title" class="text-2xl font-bold" style="color: {$currentTheme.accent};">
            {classItem.subject}
          </h2>
          <p class="text-sm opacity-70 mt-1">
            Room {classItem.classroom} • {classItem.teacher}
          </p>
        </div>
        <button
          onclick={handleClose}
          class="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
          style="background-color: {$currentTheme.bg};"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Notes Section -->
      <div class="mb-6">
        <label class="block text-sm font-semibold mb-2" style="color: {$currentTheme.accent};">
          📝 Class Notes
        </label>
        <textarea
          bind:value={noteText}
          onblur={saveNote}
          placeholder="Add notes about this class..."
          class="w-full p-3 rounded-lg resize-none"
          style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent}; min-height: 120px;"
          rows="5"
        ></textarea>
      </div>

      <!-- Links Section -->
      <div class="mb-6">
        <label class="block text-sm font-semibold mb-2" style="color: {$currentTheme.accent};">
          🔗 Useful Links
        </label>

        <!-- Add Link Form -->
        <div class="flex gap-2 mb-3">
          <input
            bind:value={linkUrl}
            placeholder="https://..."
            class="flex-1 p-2 rounded-lg"
            style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
          />
          <input
            bind:value={linkTitle}
            placeholder="Title (optional)"
            class="flex-1 p-2 rounded-lg"
            style="background-color: {$currentTheme.bg}; color: {$currentTheme.text}; border: 2px solid {$currentTheme.accent};"
          />
          <button
            onclick={handleAddLink}
            class="px-4 py-2 rounded-lg font-semibold transition-all"
            style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
          >
            Add
          </button>
        </div>

        <!-- Links List -->
        {#if currentNotes.links?.length > 0}
          <div class="space-y-2">
            {#each currentNotes.links as link, index}
              <div
                class="flex items-center justify-between p-3 rounded-lg"
                style="background-color: {$currentTheme.bg};"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 hover:underline truncate"
                  style="color: {$currentTheme.accent};"
                >
                  {link.title}
                </a>
                <button
                  onclick={() => handleRemoveLink(index)}
                  class="ml-2 p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                  style="color: #ff6b6b;"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-sm opacity-50 text-center py-4">No links added yet</p>
        {/if}
      </div>

      <!-- Close Button -->
      <div class="flex justify-end">
        <button
          onclick={handleClose}
          class="px-6 py-2 rounded-lg font-semibold transition-all"
          style="background-color: {$currentTheme.accent}; color: {$currentTheme.bg};"
        >
          Done
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  textarea:focus,
  input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.3);
  }
</style>
