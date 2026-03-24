<template>
  <div class="fireworks-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx
let fireworks = []
let particles = []
let animationId

// 烟花类
class Firework {
  constructor(canvas) {
    this.canvas = canvas
    this.x = Math.random() * canvas.width
    this.y = canvas.height
    this.targetY = Math.random() * canvas.height * 0.4 + 50
    this.speed = 8 + Math.random() * 4
    this.color = this.getRandomColor()
    this.trail = []
    this.trailLength = 10
    this.exploded = false
    this.explosionParticles = []
  }

  getRandomColor() {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff69b4',
      '#00d2d3', '#ff9ff3', '#feca57', '#48dbfb',
      '#ff9f43', '#ee5a24', '#6ab04c', '#eb4d4b'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  update() {
    if (!this.exploded) {
      this.trail.unshift({ x: this.x, y: this.y })
      if (this.trail.length > this.trailLength) {
        this.trail.pop()
      }

      this.y -= this.speed

      if (this.y <= this.targetY) {
        this.explode()
      }
    }

    // 更新爆炸粒子
    this.explosionParticles.forEach(p => p.update())
    this.explosionParticles = this.explosionParticles.filter(p => p.alpha > 0)
  }

  explode() {
    this.exploded = true
    const particleCount = 80 + Math.floor(Math.random() * 40)

    for (let i = 0; i < particleCount; i++) {
      this.explosionParticles.push(new Particle(this.x, this.y, this.color))
    }

    // 创建第二次烟花
    setTimeout(() => {
      if (fireworks.length < 5) {
        fireworks.push(new Firework(this.canvas))
      }
    }, 300 + Math.random() * 500)
  }

  draw(ctx) {
    if (!this.exploded) {
      // 绘制尾迹
      this.trail.forEach((pos, index) => {
        const alpha = (1 - index / this.trailLength) * 0.6
        const size = (1 - index / this.trailLength) * 3
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', '')

        // 处理hex颜色
        const r = parseInt(this.color.slice(1, 3), 16)
        const g = parseInt(this.color.slice(3, 5), 16)
        const b = parseInt(this.color.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.fill()
      })

      // 绘制主体
      ctx.beginPath()
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()

      // 光晕
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 15)
      gradient.addColorStop(0, this.color)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, 15, 0, Math.PI * 2)
      ctx.fill()
    }

    // 绘制爆炸粒子
    this.explosionParticles.forEach(p => p.draw(ctx))
  }
}

// 粒子类
class Particle {
  constructor(x, y, color) {
    this.x = x
    this.y = y
    this.color = color

    // 随机方向和速度
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 6 + 2
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed

    this.gravity = 0.05
    this.alpha = 1
    this.decay = Math.random() * 0.015 + 0.008
    this.size = Math.random() * 3 + 1

    // 特殊效果：火花痕迹
    this.trail = []
    this.trailLength = 5
  }

  update() {
    this.trail.unshift({ x: this.x, y: this.y, alpha: this.alpha })
    if (this.trail.length > this.trailLength) {
      this.trail.pop()
    }

    this.vx *= 0.98
    this.vy *= 0.98
    this.vy += this.gravity

    this.x += this.vx
    this.y += this.vy

    this.alpha -= this.decay
  }

  draw(ctx) {
    // 绘制尾迹
    this.trail.forEach((pos, index) => {
      const trailAlpha = pos.alpha * (1 - index / this.trailLength) * 0.5
      const trailSize = this.size * (1 - index / this.trailLength)

      const r = parseInt(this.color.slice(1, 3), 16)
      const g = parseInt(this.color.slice(3, 5), 16)
      const b = parseInt(this.color.slice(5, 7), 16)

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, trailSize, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailAlpha})`
      ctx.fill()
    })

    // 绘制主体
    const r = parseInt(this.color.slice(1, 3), 16)
    const g = parseInt(this.color.slice(3, 5), 16)
    const b = parseInt(this.color.slice(5, 7), 16)

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`
    ctx.fill()

    // 发光效果
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.5})`)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 地面反射效果
class GroundReflection {
  constructor(canvas) {
    this.canvas = canvas
    this.particles = []
    this.maxParticles = 50
  }

  addExplosion(x, y, color) {
    if (this.particles.length < this.maxParticles) {
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 100,
          y: this.canvas.height,
          size: Math.random() * 2 + 1,
          color: color,
          alpha: 0.6,
          vy: -Math.random() * 2 - 1
        })
      }
    }
  }

  update() {
    this.particles = this.particles.filter(p => {
      p.y += p.vy
      p.alpha -= 0.01
      return p.alpha > 0 && p.y < this.canvas.height
    })
  }

  draw(ctx) {
    this.particles.forEach(p => {
      const r = parseInt(p.color.slice(1, 3), 16)
      const g = parseInt(p.color.slice(3, 5), 16)
      const b = parseInt(p.color.slice(5, 7), 16)

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`
      ctx.fill()
    })
  }
}

let groundReflection

const init = () => {
  ctx = canvas.value.getContext('2d')
  resize()

  groundReflection = new GroundReflection(canvas.value)

  // 初始烟花
  setTimeout(() => {
    fireworks.push(new Firework(canvas.value))
  }, 500)

  // 定时发射新烟花
  setInterval(() => {
    if (fireworks.length < 5) {
      fireworks.push(new Firework(canvas.value))
    }
  }, 1500)

  animate()
}

const resize = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 半透明覆盖产生拖尾效果
  ctx.fillStyle = 'rgba(26, 26, 46, 0.15)'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // 更新和绘制烟花
  fireworks = fireworks.filter(f => {
    f.update()
    f.draw(ctx)

    if (f.exploded && f.explosionParticles.length === 0) {
      // 添加地面反射
      f.explosionParticles.forEach(p => {
        groundReflection.addExplosion(f.x, f.y, f.color)
      })
      return false
    }
    return true
  })

  // 更新和绘制地面反射
  groundReflection.update()
  groundReflection.draw(ctx)
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
.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>