<template>
  <div class="candle-flames">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx
let flames = []
let particles = []
let animationId

class Flame {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.baseX = x
    this.baseY = y
    this.size = 15 + Math.random() * 10
    this.phase = Math.random() * Math.PI * 2
    this.speed = 0.05 + Math.random() * 0.03
    this.life = 1
    this.decay = 0.005 + Math.random() * 0.005
  }

  update() {
    this.x = this.baseX + Math.sin(Date.now() * this.speed + this.phase) * 5
    this.y = this.baseY + Math.cos(Date.now() * this.speed * 0.7 + this.phase) * 3
    this.life -= this.decay
  }

  draw(ctx) {
    if (this.life <= 0) return

    const gradient = ctx.createRadialGradient(
      this.x, this.y - this.size / 2, 0,
      this.x, this.y - this.size / 2, this.size
    )
    gradient.addColorStop(0, `rgba(255, 255, 200, ${this.life})`)
    gradient.addColorStop(0.3, `rgba(255, 200, 50, ${this.life * 0.8})`)
    gradient.addColorStop(0.6, `rgba(255, 100, 0, ${this.life * 0.5})`)
    gradient.addColorStop(1, `rgba(255, 50, 0, 0)`)

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(this.x, this.y - this.size / 2, this.size * 0.6, this.size, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

class Spark {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 3
    this.vy = -Math.random() * 3 - 1
    this.size = Math.random() * 2 + 1
    this.life = 1
    this.decay = 0.02 + Math.random() * 0.02
    this.color = Math.random() > 0.5 ? '#ffd700' : '#ff6600'
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += 0.05 // 重力
    this.life -= this.decay
  }

  draw(ctx) {
    if (this.life <= 0) return

    const r = parseInt(this.color.slice(1, 3), 16)
    const g = parseInt(this.color.slice(3, 5), 16)
    const b = parseInt(this.color.slice(5, 7), 16)

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.life})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

const init = () => {
  ctx = canvas.value.getContext('2d')
  resize()

  // 创建固定火焰位置（模拟蜡烛火焰）
  const flamePositions = [
    { x: window.innerWidth / 2, y: window.innerHeight / 2 - 150 },
    { x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 140 },
    { x: window.innerWidth / 2 + 60, y: window.innerHeight / 2 - 140 }
  ]

  flamePositions.forEach(pos => {
    for (let i = 0; i < 5; i++) {
      flames.push(new Flame(pos.x, pos.y))
    }
  })

  animate()
}

const resize = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // 更新和绘制火焰
  flames = flames.filter(f => {
    f.update()
    f.draw(ctx)
    return f.life > 0
  })

  // 补充新火焰
  if (flames.length < 15) {
    flames.push(new Flame(
      Math.random() * canvas.value.width,
      Math.random() * canvas.value.height * 0.6 + canvas.value.height * 0.3
    ))
  }

  // 更新和绘制火星
  particles = particles.filter(p => {
    p.update()
    p.draw(ctx)
    return p.life > 0
  })

  // 随机生成火星
  if (Math.random() < 0.3 && flames.length > 0) {
    const flame = flames[Math.floor(Math.random() * flames.length)]
    particles.push(new Spark(flame.x, flame.y - flame.size))
  }
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
.candle-flames {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>