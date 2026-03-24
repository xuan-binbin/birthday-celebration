<template>
  <div class="confetti-container" ref="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref(null)
const canvas = ref(null)
let ctx
let confetti = []
let animationId

class Confetto {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height - this.canvas.height
    this.size = Math.random() * 10 + 5
    this.speedY = Math.random() * 3 + 2
    this.speedX = (Math.random() - 0.5) * 2
    this.rotation = Math.random() * 360
    this.rotationSpeed = (Math.random() - 0.5) * 10
    this.swingAmplitude = Math.random() * 2 + 1
    this.swingFrequency = Math.random() * 0.02 + 0.01
    this.phase = Math.random() * Math.PI * 2
    this.opacity = Math.random() * 0.5 + 0.5

    const colors = [
      '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff69b4',
      '#00d2d3', '#ff9ff3', '#feca57', '#48dbfb',
      '#ff9f43', '#ee5a24', '#6ab04c', '#eb4d4b',
      '#9b59b6', '#3498db', '#1abc9c', '#e74c3c'
    ]
    this.color = colors[Math.floor(Math.random() * colors.length)]

    // 形状：0=矩形，1=圆形，2=三角形
    this.shape = Math.floor(Math.random() * 3)
  }

  update() {
    this.y += this.speedY
    this.x += this.speedX + Math.sin(this.y * this.swingFrequency + this.phase) * this.swingAmplitude
    this.rotation += this.rotationSpeed

    if (this.y > this.canvas.height) {
      this.reset()
      this.y = -20
    }

    if (this.x < 0) this.x = this.canvas.width
    if (this.x > this.canvas.width) this.x = 0
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate((this.rotation * Math.PI) / 180)
    ctx.globalAlpha = this.opacity

    const r = parseInt(this.color.slice(1, 3), 16)
    const g = parseInt(this.color.slice(3, 5), 16)
    const b = parseInt(this.color.slice(5, 7), 16)

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

    switch (this.shape) {
      case 0: // 矩形
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2)
        break
      case 1: // 圆形
        ctx.beginPath()
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
        break
      case 2: // 三角形
        ctx.beginPath()
        ctx.moveTo(0, -this.size / 2)
        ctx.lineTo(-this.size / 2, this.size / 2)
        ctx.lineTo(this.size / 2, this.size / 2)
        ctx.closePath()
        ctx.fill()
        break
    }

    ctx.restore()
  }
}

const init = () => {
  ctx = canvas.value.getContext('2d')
  resize()

  // 创建彩纸
  for (let i = 0; i < 150; i++) {
    confetti.push(new Confetto(canvas.value))
  }

  animate()
}

const resize = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  confetti.forEach(c => {
    c.update()
    c.draw(ctx)
  })
}

const handleResize = () => {
  resize()
}

onMounted(() => {
  init()
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
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>