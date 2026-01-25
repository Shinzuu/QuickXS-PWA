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
    background: linear-gradient(90deg, {$currentTheme.bg} 25%, {$currentTheme.card} 50%, {$currentTheme.bg} 75%);
    background-size: 200% 100%;
  "
></div>

<style>
  .skeleton-card {
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
</style>
