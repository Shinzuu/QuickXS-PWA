<script>
  import { onMount } from 'svelte'

  let visible = $state(true)
  let particles = $state([])

  onMount(() => {
    // Create confetti particles
    const colors = ['#00ADB5', '#EEEEEE', '#FFD700', '#FF6B9D', '#C3FF00']
    const particleCount = 50

    particles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8
    }))

    // Hide after animation completes
    setTimeout(() => {
      visible = false
    }, 3500)
  })
</script>

{#if visible}
  <div class="confetti-container fixed inset-0 pointer-events-none z-50">
    {#each particles as particle (particle.id)}
      <div
        class="confetti-particle absolute"
        style="
          left: {particle.left}%;
          top: -10%;
          width: {particle.size}px;
          height: {particle.size}px;
          background-color: {particle.color};
          animation: confetti-fall {particle.duration}s ease-in {particle.delay}s forwards;
          transform: rotate({particle.rotation}deg);
        "
      ></div>
    {/each}
  </div>
{/if}

<style>
  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotateZ(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotateZ(720deg);
      opacity: 0;
    }
  }

  .confetti-particle {
    border-radius: 2px;
  }
</style>
