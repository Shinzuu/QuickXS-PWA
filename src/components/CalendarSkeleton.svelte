<script>
  import { currentTheme } from '../lib/themeStore'
  import SkeletonCard from './SkeletonCard.svelte'
</script>

<div class="p-6" style="background-color: {$currentTheme.bg};">
  <!-- Header Skeleton -->
  <div class="mb-6">
    <SkeletonCard height="40px" borderRadius="8px" />
  </div>

  <!-- Calendar Grid Skeleton -->
  <div class="grid grid-cols-7 gap-2 mb-4">
    {#each Array(7) as _, i}
      <div class="text-center">
        <SkeletonCard height="30px" borderRadius="4px" />
      </div>
    {/each}
  </div>

  <!-- Date Cells -->
  <div class="grid grid-cols-7 gap-2">
    {#each Array(35) as _, i}
      <SkeletonCard height="80px" borderRadius="8px" />
    {/each}
  </div>
</div>
