// Swipe gesture utility
export function createSwipeHandler(element, callbacks = {}) {
  let startX = 0
  let startY = 0
  let currentX = 0
  let isSwiping = false
  const threshold = 100 // minimum swipe distance
  const restraint = 100 // maximum vertical movement
  const allowedTime = 500 // maximum time for swipe

  let startTime = 0

  function handleTouchStart(e) {
    const touch = e.changedTouches[0]
    startX = touch.pageX
    startY = touch.pageY
    currentX = startX
    startTime = new Date().getTime()
    isSwiping = false
  }

  function handleTouchMove(e) {
    if (!startX) return

    const touch = e.changedTouches[0]
    currentX = touch.pageX
    const currentY = touch.pageY
    const distX = currentX - startX
    const distY = currentY - startY

    // Check if it's a horizontal swipe
    if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 10) {
      isSwiping = true
      e.preventDefault()

      // Visual feedback
      if (callbacks.onSwipeMove) {
        callbacks.onSwipeMove(distX, distX > 0 ? 'right' : 'left')
      }
    }
  }

  function handleTouchEnd(e) {
    if (!isSwiping) {
      startX = 0
      return
    }

    const elapsedTime = new Date().getTime() - startTime
    const touch = e.changedTouches[0]
    const distX = touch.pageX - startX
    const distY = touch.pageY - startY

    // Check if swipe meets criteria
    if (elapsedTime <= allowedTime) {
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        if (distX > 0) {
          // Swipe right
          callbacks.onSwipeRight?.()
        } else {
          // Swipe left
          callbacks.onSwipeLeft?.()
        }
      }
    }

    // Reset
    if (callbacks.onSwipeEnd) {
      callbacks.onSwipeEnd()
    }

    startX = 0
    isSwiping = false
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchmove', handleTouchMove, { passive: false })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })

  return {
    destroy() {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }
}

// Svelte action for swipe
export function swipe(node, options = {}) {
  const handler = createSwipeHandler(node, options)

  return {
    destroy() {
      handler.destroy()
    }
  }
}

// Haptic feedback utility
export function vibrate(pattern = [50]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}
