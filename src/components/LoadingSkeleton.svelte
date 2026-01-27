<script>
  import { currentTheme } from '../lib/themeStore'
</script>

<div class="skeleton-container p-3 min-h-screen" style="background-color: {$currentTheme.bg};">
  <!-- Header Skeleton -->
  <div class="skeleton-header mb-6 p-4 rounded-lg" style="background-color: {$currentTheme.card};">
    <div class="skeleton-shimmer h-8 w-32 rounded" style="background-color: {$currentTheme.accent}20;"></div>
  </div>

  <!-- Hero Card Skeleton -->
  <div class="skeleton-card mb-6 p-6 rounded-2xl" style="background-color: {$currentTheme.card};">
    <div class="skeleton-shimmer h-6 w-40 rounded mb-4" style="background-color: {$currentTheme.accent}30;"></div>
    <div class="skeleton-shimmer h-12 w-full rounded mb-3" style="background-color: {$currentTheme.accent}20;"></div>
    <div class="skeleton-shimmer h-8 w-3/4 rounded" style="background-color: {$currentTheme.accent}15;"></div>
  </div>

  <!-- Cards Grid Skeleton -->
  <div class="grid grid-cols-1 gap-4 mb-6">
    {#each [1, 2, 3] as i}
      <div class="skeleton-card p-4 rounded-xl" style="background-color: {$currentTheme.card};">
        <div class="skeleton-shimmer h-5 w-24 rounded mb-3" style="background-color: {$currentTheme.accent}25;"></div>
        <div class="skeleton-shimmer h-4 w-full rounded mb-2" style="background-color: {$currentTheme.accent}15;"></div>
        <div class="skeleton-shimmer h-4 w-2/3 rounded" style="background-color: {$currentTheme.accent}15;"></div>
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes shimmer {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }

  .skeleton-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
  }

  .skeleton-container {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Battery Optimization: Disable infinite shimmer when user prefers reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .skeleton-shimmer {
      animation: none !important;
    }
  }
</style>
