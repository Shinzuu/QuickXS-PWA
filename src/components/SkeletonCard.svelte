<script>
  import { currentTheme } from '../lib/themeStore'

  export let height = '100px'
  export let borderRadius = '8px'
</script>

<div
  class="skeleton-card animate-pulse"
  style="
    height: {height};
    border-radius: {borderRadius};
    background-color: {$currentTheme.card};
    opacity: 0.7;
  "
></div>

<style>
  .skeleton-card {
    /* Removed gradient shimmer animation */
  }
</style>
