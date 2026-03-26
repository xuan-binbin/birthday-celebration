<template>
  <div class="stars-background">
    <canvas ref="starCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Star } from '@/utils/Star.js'

const starCanvas = ref(null)
let stars = []
let animationId = null
const maxStars = 1100

const initCanvas = () => {
  const canvas = starCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const w = canvas.width = window.innerWidth
  const h = canvas.height = window.innerHeight

  const canvas2 = document.createElement('canvas')
  const ctx2 = canvas2.getContext('2d')
  canvas2.width = 100
  canvas2.height = 100
  const half = canvas2.width / 2
  const gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half)
  gradient2.addColorStop(0.025, '#CCC')
  gradient2.addColorStop(0.1, 'hsl(217, 61%, 33%)')
  gradient2.addColorStop(0.25, 'hsl(217, 64%, 6%)')
  gradient2.addColorStop(1, 'transparent')

  ctx2.fillStyle = gradient2
  ctx2.beginPath()
  ctx2.arc(half, half, half, 0, Math.PI * 2)
  ctx2.fill()

  stars = []
  for (let i = 1; i < maxStars; i++) {
    const star = new Star({ w, h }, ctx, canvas2)
    stars[i] = star
  }

  const animation = () => {
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.8
    ctx.fillStyle = 'hsla(217, 64%, 6%, 2)'
    ctx.fillRect(0, 0, w, h)

    ctx.globalCompositeOperation = 'lighter'
    for (let i = 1; i < stars.length; i++) {
      stars[i].draw()
    }

    animationId = window.requestAnimationFrame(animation)
  }
  animation()
}

const handleResize = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  initCanvas()
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.stars-background canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
