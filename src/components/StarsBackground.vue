<template>
  <div class="stars-background">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx
let stars = []
let animationId
let mouse = { x: 0, y: 0 }

// 星星类
class Star {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.size = Math.random() * 2 + 0.5
    this.speed = Math.random() * 0.5 + 0.1
    this.brightness = Math.random()
    this.maxBrightness = Math.random() * 0.5 + 0.5
    this.twinkleSpeed = Math.random() * 0.02 + 0.01
    this.phase = Math.random() * Math.PI * 2

    // 颜色变化
    const colors = [
      [255, 255, 255],    // 白色
      [255, 215, 0],      // 金色
      [135, 206, 235],    // 天蓝色
      [255, 182, 193],   // 粉色
      [173, 216, 230]     // 浅蓝色
    ]
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  update(time) {
    // 闪烁效果
    this.brightness = this.maxBrightness * (0.5 + 0.5 * Math.sin(time * this.twinkleSpeed + this.phase))

    // 缓慢移动
    this.y += this.speed * 0.1
    if (this.y > this.canvas.height) {
      this.y = 0
      this.x = Math.random() * this.canvas.width
    }

    // 鼠标交互
    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 150) {
      const force = (150 - dist) / 150
      this.x -= dx * force * 0.02
      this.y -= dy * force * 0.02
    }
  }

  draw(ctx) {
    const alpha = this.brightness
    const [r, g, b] = this.color

    // 星芒效果
    ctx.save()
    ctx.translate(this.x, this.y)

    // 主星
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2)
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`)
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2)
    ctx.fill()

    // 十字星芒
    if (this.size > 1.5) {
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(-this.size * 3, 0)
      ctx.lineTo(this.size * 3, 0)
      ctx.moveTo(0, -this.size * 3)
      ctx.lineTo(0, this.size * 3)
      ctx.stroke()
    }

    ctx.restore()
  }
}

// 流星类
class ShootingStar {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height * 0.5
    this.length = Math.random() * 80 + 40
    this.speed = Math.random() * 8 + 4
    this.angle = Math.PI / 4 + Math.random() * 0.2
    this.opacity = 1
    this.active = false

    // 定时触发
    setTimeout(() => {
      this.active = true
    }, Math.random() * 5000)
  }

  update() {
    if (!this.active) return

    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed
    this.opacity -= 0.01

    if (this.opacity <= 0 || this.y > this.canvas.height) {
      this.reset()
    }
  }

  draw(ctx) {
    if (!this.active || this.opacity <= 0) return

    const tailX = this.x - Math.cos(this.angle) * this.length
    const tailY = this.y - Math.sin(this.angle) * this.length

    const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y)
    gradient.addColorStop(0, `rgba(255, 255, 255, 0)`)
    gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`)

    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(this.x, this.y)
    ctx.stroke()

    // 头部光晕
    const headGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 5)
    headGradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`)
    headGradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

    ctx.fillStyle = headGradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2)
    ctx.fill()
  }
}

let shootingStars = []

const init = () => {
  ctx = canvas.value.getContext('2d')
  resize()

  // 创建星星
  for (let i = 0; i < 200; i++) {
    stars.push(new Star(canvas.value))
  }

  // 创建流星
  for (let i = 0; i < 3; i++) {
    shootingStars.push(new ShootingStar(canvas.value))
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

  const time = Date.now()

  // 绘制星星
  stars.forEach(star => {
    star.update(time)
    star.draw(ctx)
  })

  // 绘制流星
  shootingStars.forEach(star => {
    star.update()
    star.draw(ctx)
  })
}

const handleMouseMove = (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

const handleResize = () => {
  resize()
  stars.forEach(star => star.reset())
}

onMounted(() => {
  init()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
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
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>