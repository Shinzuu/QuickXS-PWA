<script>
  import { currentTheme } from '../lib/themeStore'
  import SkeletonCard from './SkeletonCard.svelte'
</script>

<div class="p-6 space-y-6" style="background-color: {$currentTheme.bg};">
  <!-- Header -->
  <div class="mb-6">
    <SkeletonCard height="50px" borderRadius="8px" />
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each Array(4) as _, i}
      <div class="p-4 rounded-lg" style="background-color: {$currentTheme.card};">
        <SkeletonCard height="80px" borderRadius="8px" />
      </div>
    {/each}
  </div>

  <!-- Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {#each Array(2) as _, i}
      <div class="p-6 rounded-lg" style="background-color: {$currentTheme.card};">
        <div class="mb-4">
          <SkeletonCard height="30px" borderRadius="6px" />
        </div>
        <SkeletonCard height="250px" borderRadius="8px" />
      </div>
    {/each}
  </div>

  <!-- List -->
  <div class="p-6 rounded-lg" style="background-color: {$currentTheme.card};">
    <div class="mb-4">
      <SkeletonCard height="30px" borderRadius="6px" />
    </div>
    <div class="space-y-3">
      {#each Array(5) as _, i}
        <SkeletonCard height="60px" borderRadius="8px" />
      {/each}
    </div>
  </div>
</div>
