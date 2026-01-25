<script>
  import { todayClasses } from '../lib/store'
  import { currentTheme } from '../lib/themeStore'
  import { classNotes } from '../lib/notesStore'
  import ClassNotesModal from './ClassNotesModal.svelte'
  import EmptyState from './EmptyState.svelte'
  import {
    formatTime,
    isClassHappeningNow,
    isClassCompleted,
    isClassUpcoming
  } from '../lib/utils'

  let expanded = $state(false)
  let showCompleted = $state(true)
  let selectedClass = $state(null)
  const maxInitial = 10

  let activeClasses = $derived($todayClasses.filter(c => !isClassCompleted(c.time, c.duration)))
  let completedClasses = $derived($todayClasses.filter(c => isClassCompleted(c.time, c.duration)))
  let completionPercentage = $derived($todayClasses.length > 0 ? Math.round((completedClasses.length / $todayClasses.length) * 100) : 0)

  function getClassStatus(classItem) {
    if (isClassHappeningNow(classItem.time, classItem.duration)) return 'now'
    if (isClassCompleted(classItem.time, classItem.duration)) return 'completed'
    if (isClassUpcoming(classItem.time, 60)) return 'soon'
    return 'upcoming'
  }

  function getStatusIcon(status) {
    const icons = {
      now: '●',
      soon: '○',
      upcoming: '○',
      completed: '✓'
    }
    return icons[status] || '○'
  }

  function getStatusColor(status) {
    const colors = {
      now: 'text-green-500',
      soon: 'text-yellow-500',
      upcoming: 'text-gray-400',
      completed: 'text-gray-300'
    }
    return colors[status] || 'text-gray-400'
  }

  function getCardClasses(status) {
    const classes = {
      now: 'border-l-4',
      soon: 'border-l-4',
      upcoming: 'border-l-4',
      completed: 'border-l-4 opacity-60'
    }
    return classes[status] || 'border-l-4'
  }

  function getBorderColor(status) {
    const colors = {
      now: 'var(--color-accent)',
      soon: 'var(--color-accent)',
      upcoming: 'var(--color-card)',
      completed: 'var(--color-bg)'
    }
    return colors[status] || 'var(--color-card)'
  }
</script>

<div class="today-classes">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-bold" style="color: var(--color-accent);">📚 Today's Classes</h2>
    {#if $todayClasses.length > 0}
      <div class="flex items-center gap-2">
        <!-- Completion Stats Badge -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: var(--color-bg); border: 2px solid {completionPercentage === 100 ? 'var(--color-accent)' : 'var(--color-card)'};">
          <div class="flex items-center gap-1">
            <div class="relative w-8 h-8">
              <svg class="transform -rotate-90" width="32" height="32">
                <circle cx="16" cy="16" r="14" stroke="var(--color-card)" stroke-width="3" fill="none" />
                <circle
                  cx="16" cy="16" r="14"
                  stroke="var(--color-accent)"
                  stroke-width="3"
                  fill="none"
                  stroke-dasharray="{2 * Math.PI * 14}"
                  stroke-dashoffset="{2 * Math.PI * 14 * (1 - completionPercentage / 100)}"
                  style="transition: stroke-dashoffset 0.5s ease;"
                />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold" style="color: var(--color-accent);">
                {completionPercentage}
              </span>
            </div>
            <div class="text-xs">
              <div class="font-bold" style="color: var(--color-text);">{completedClasses.length}/{$todayClasses.length}</div>
              <div class="text-xs" style="color: var(--color-text); opacity: 0.6;">done</div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  {#if $todayClasses.length === 0}
    <div class="text-center py-12 px-4">
      <div class="inline-block p-6 rounded-full mb-4" style="background-color: rgba(0, 173, 181, 0.1);">
        <span class="text-6xl">🌴</span>
      </div>
      <h3 class="text-xl font-bold mb-2" style="color: var(--color-accent);">No Classes Today!</h3>
      <p class="text-sm" style="color: var(--color-text); opacity: 0.7;">
        Looks like you have the day off. Time to relax and recharge!
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      <!-- Active/Upcoming Classes -->
      <div class="space-y-2">
        {#each (expanded ? activeClasses : activeClasses.slice(0, maxInitial)) as classItem, index (classItem.id)}
        {@const status = getClassStatus(classItem)}
        <div
          class="class-card p-4 rounded-lg transition-all {getCardClasses(status)} {status === 'now' ? 'pulse-now' : ''} {status === 'soon' ? 'pulse-soon' : ''}"
          style="
            background-color: var(--color-bg);
            border-left-color: {getBorderColor(status)};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          "
        >
          <!-- Desktop View -->
          <div class="hidden md:grid grid-cols-[auto,1fr,auto] items-center gap-4">
            <!-- Status Icon -->
            <span class="text-2xl {getStatusColor(status)}" aria-hidden="true">
              {getStatusIcon(status)}
            </span>

            <!-- Main Content -->
            <div class="grid grid-cols-[minmax(150px,1fr),auto,auto,1fr] items-center gap-3">
              <h3 class="text-lg font-bold truncate" style="color: var(--color-text);">{classItem.subject}</h3>

              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                <span class="font-bold text-sm">⏰</span>
                <span class="font-bold text-sm">{formatTime(classItem.time)}</span>
              </div>

              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                <span class="font-bold text-sm">📍</span>
                <span class="font-bold text-sm">{classItem.classroom}</span>
              </div>

              <div class="text-sm truncate" style="color: var(--color-text); opacity: 0.7;">
                <span>👨‍🏫 {classItem.teacher}</span>
              </div>
            </div>

            <!-- Status Badge and Actions -->
            <div class="flex items-center gap-2 justify-end">
              {#if status === 'now'}
                <span class="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap" style="background-color: var(--color-accent); color: var(--color-bg);">
                  Now
                </span>
              {:else if status === 'soon'}
                <span class="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap" style="background-color: var(--color-accent); color: var(--color-bg);">
                  Soon
                </span>
              {/if}

              <!-- Notes Button -->
              <button
                onclick={() => selectedClass = classItem}
                class="p-2 rounded-lg hover:bg-opacity-80 transition-all relative"
                style="background-color: var(--color-bg);"
                title="Add notes/links"
              >
                {#if $classNotes[classItem.id]?.note || $classNotes[classItem.id]?.links?.length > 0}
                  <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full" style="background-color: var(--color-accent);"></span>
                {/if}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile View -->
          <div class="md:hidden space-y-2">
            <!-- Title Row with Status -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-xl {getStatusColor(status)}" aria-hidden="true">
                  {getStatusIcon(status)}
                </span>
                <h3 class="text-base font-bold truncate" style="color: var(--color-text);">{classItem.subject}</h3>
              </div>
              {#if status === 'now'}
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0" style="background-color: var(--color-accent); color: var(--color-bg);">
                  Now
                </span>
              {:else if status === 'soon'}
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0" style="background-color: var(--color-accent); color: var(--color-bg);">
                  Soon
                </span>
              {/if}

              <!-- Notes Button (Mobile) -->
              <button
                onclick={() => selectedClass = classItem}
                class="p-2 rounded-lg hover:bg-opacity-80 transition-all relative flex-shrink-0"
                style="background-color: var(--color-bg);"
                title="Add notes/links"
              >
                {#if $classNotes[classItem.id]?.note || $classNotes[classItem.id]?.links?.length > 0}
                  <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full" style="background-color: var(--color-accent);"></span>
                {/if}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <!-- Details Row -->
            <div class="flex flex-wrap gap-2">
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                <span class="font-bold text-sm">⏰</span>
                <span class="font-bold text-sm">{formatTime(classItem.time)}</span>
              </div>

              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                <span class="font-bold text-sm">📍</span>
                <span class="font-bold text-sm">{classItem.classroom}</span>
              </div>

              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: rgba(0, 0, 0, 0.3); color: var(--color-text);">
                <span class="text-sm">👨‍🏫</span>
                <span class="text-sm opacity-90">{classItem.teacher}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}

        {#if !expanded && activeClasses.length > maxInitial}
          <button
            onclick={() => expanded = true}
            class="w-full py-3 text-center text-sm rounded-lg transition-colors"
            style="color: var(--color-text); opacity: 0.6; background-color: var(--color-bg);"
          >
            +{activeClasses.length - maxInitial} more classes
          </button>
        {:else if expanded && activeClasses.length > maxInitial}
          <button
            onclick={() => expanded = false}
            class="w-full py-3 text-center text-sm rounded-lg transition-colors"
            style="color: var(--color-text); opacity: 0.6; background-color: var(--color-bg);"
          >
            Show less
          </button>
        {/if}
      </div>

      <!-- Completed Classes (Collapsible) -->
      {#if completedClasses.length > 0}
        <div class="mt-4">
          <button
            onclick={() => showCompleted = !showCompleted}
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors mb-2"
            style="background-color: var(--color-bg); border: 1px solid var(--color-card);"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold" style="color: var(--color-text); opacity: 0.7;">
                ✓ Completed Classes ({completedClasses.length})
              </span>
            </div>
            <span class="text-sm transition-transform" style="color: var(--color-accent); transform: rotate({showCompleted ? '180deg' : '0deg'});">
              ▼
            </span>
          </button>

          {#if showCompleted}
            <div class="space-y-2">
              {#each completedClasses as classItem (classItem.id)}
                {@const status = getClassStatus(classItem)}
                <div
                  class="class-card p-4 rounded-lg transition-all {getCardClasses(status)}"
                  style="
                    background-color: var(--color-bg);
                    border-left-color: {getBorderColor(status)};
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                  "
                >
                  <!-- Desktop View -->
                  <div class="hidden md:grid grid-cols-[auto,1fr,auto] items-center gap-4">
                    <span class="text-2xl {getStatusColor(status)}" aria-hidden="true">
                      {getStatusIcon(status)}
                    </span>

                    <div class="grid grid-cols-[minmax(150px,1fr),auto,auto,1fr] items-center gap-3">
                      <h3 class="text-lg font-bold truncate" style="color: var(--color-text);">{classItem.subject}</h3>

                      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                        <span class="font-bold text-sm">⏰</span>
                        <span class="font-bold text-sm">{formatTime(classItem.time)}</span>
                      </div>

                      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                        <span class="font-bold text-sm">📍</span>
                        <span class="font-bold text-sm">{classItem.classroom}</span>
                      </div>

                      <div class="text-sm truncate" style="color: var(--color-text); opacity: 0.7;">
                        <span>👨‍🏫 {classItem.teacher}</span>
                      </div>
                    </div>

                    <div class="flex justify-end"></div>
                  </div>

                  <!-- Mobile View -->
                  <div class="md:hidden space-y-2">
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <span class="text-xl {getStatusColor(status)}" aria-hidden="true">
                          {getStatusIcon(status)}
                        </span>
                        <h3 class="text-base font-bold truncate" style="color: var(--color-text);">{classItem.subject}</h3>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                        <span class="font-bold text-sm">⏰</span>
                        <span class="font-bold text-sm">{formatTime(classItem.time)}</span>
                      </div>

                      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: var(--color-accent); color: var(--color-bg);">
                        <span class="font-bold text-sm">📍</span>
                        <span class="font-bold text-sm">{classItem.classroom}</span>
                      </div>

                      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded" style="background-color: rgba(0, 0, 0, 0.3); color: var(--color-text);">
                        <span class="text-sm">👨‍🏫</span>
                        <span class="text-sm opacity-90">{classItem.teacher}</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Class Notes Modal -->
{#if selectedClass}
  <ClassNotesModal classItem={selectedClass} onClose={() => selectedClass = null} />
{/if}

<style>
  .class-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .class-card:hover {
    transform: translateX(4px) translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 173, 181, 0.3) !important;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .class-card {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes pulseNow {
    0%, 100% {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      border-left-width: 4px;
    }
    50% {
      box-shadow: 0 4px 20px rgba(0, 173, 181, 0.6);
      border-left-width: 6px;
    }
  }

  @keyframes pulseSoon {
    0%, 100% {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    50% {
      box-shadow: 0 4px 16px rgba(0, 173, 181, 0.4);
    }
  }

  .pulse-now {
    animation: pulseNow 2s ease-in-out infinite;
  }

  .pulse-soon {
    animation: pulseSoon 3s ease-in-out infinite;
  }
</style>
