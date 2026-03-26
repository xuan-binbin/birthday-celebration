<template>
  <div class="stars-background">
    <canvas ref="canvas"></canvas>
    <div class="text-overlay" :style="{ transform: `rotateY(${rotation}deg)` }">
      <div class="vertical-text" v-for="(line, index) in chineseTexts" :key="index" :style="{ left: `${10 + index * 8}%`, animationDelay: `${index * 0.5}s` }">
        {{ line }}
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
const rotation = ref(0)
let ctx
let stars = []
let animationId

// 中文诗词文本
  const chineseTexts = [
    '星汉灿烂若出其里',
    '迢迢牵牛星皎皎河汉女',
    '天阶夜色凉如水',
    '卧看牵牛织女星',
    '愿我如星君如月',
    '夜夜流光相皎洁',
    '海上生明月',
    '天涯共此时',
    '醉后不知天在水',
    '满船清梦压星河'
  ]

// 星星类
class Star {
  constructor(canvas, isGalaxy = false) {
    this.canvas = canvas
    this.isGalaxy = isGalaxy
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.size = this.isGalaxy ? Math.random() * 1 + 0.3 : Math.random() * 2 + 0.5
    this.speed = Math.random() * 0.5 + 0.1
    this.brightness = Math.random()
    this.maxBrightness = Math.random() * 0.5 + 0.5
    this.twinkleSpeed = Math.random() * 0.02 + 0.01
    this.phase = Math.random() * Math.PI * 2

    // 银河的星星更偏白，普通星星有颜色
    if (this.isGalaxy) {
      this.color = [255, 255, 255]
    } else {
      const colors = [
        [255, 255, 255],
        [255, 215, 0],
        [135, 206, 235],
        [255, 182, 193],
        [173, 216, 230]
      ]
      this.color = colors[Math.floor(Math.random() * colors.length)]
    }
  }

  update(time) {
    this.brightness = this.maxBrightness * (0.5 + 0.5 * Math.sin(time * this.twinkleSpeed + this.phase))
    this.y += this.speed * 0.1
    if (this.y > this.canvas.height) {
      this.y = 0
      this.x = Math.random() * this.canvas.width
    }
  }

  draw(ctx) {
    const alpha = this.brightness
    const [r, g, b] = this.color

    ctx.save()
    ctx.translate(this.x, this.y)

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2)
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`)
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2)
    ctx.fill()

    if (this.size > 1.5 && !this.isGalaxy) {
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

// 创建银河
const createGalaxy = () => {
  const galaxyStars = []
  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 3
  
  for (let i = 0; i < 800; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 300 + 50
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius * 0.3
    const star = new Star(canvas.value, true)
    star.x = x
    star.y = y
    star.size = Math.random() * 0.8 + 0.2
    galaxyStars.push(star)
  }
  
  return galaxyStars
}

let galaxyStars = []

const init = () => {
  ctx = canvas.value.getContext('2d')
  resize()

  // 创建普通星星（减少数量）
  for (let i = 0; i < 150; i++) {
    stars.push(new Star(canvas.value))
  }

  // 创建银河
  galaxyStars = createGalaxy()

  animate()
}

const resize = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  galaxyStars = createGalaxy()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 渐变背景：从深紫色到粉橙色
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.value.height)
  gradient.addColorStop(0, '#0f0c29')      // 深紫色顶部
  gradient.addColorStop(0.3, '#302b63')    // 中部紫色
  gradient.addColorStop(0.6, '#24243e')    // 深蓝紫色
  gradient.addColorStop(0.85, '#ff6b6b')   // 粉橙色
  gradient.addColorStop(1, '#ff8e53')      // 暖橙色地平线
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  const time = Date.now()

  // 绘制银河（带透明度）
  galaxyStars.forEach(star => {
    star.update(time)
    star.draw(ctx)
  })

  // 绘制普通星星
  stars.forEach(star => {
    star.update(time)
    star.draw(ctx)
  })

  // 缓慢旋转文字
  rotation.value += 0.015
}

const handleResize = () => {
  resize()
  stars.forEach(star => star.reset())
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
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  perspective: 1000px;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform-style: preserve-3d;
}

.vertical-text {
  position: absolute;
  top: 10%;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  color: rgba(220, 200, 255, 0.35);
  letter-spacing: 6px;
  animation: float 8s ease-in-out infinite;
  text-shadow: 0 0 15px rgba(220, 200, 255, 0.5);
  line-height: 1.8;
}

@keyframes float {
  0%, 100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-15px);
  }
}



@media (max-width: 768px) {
  .vertical-text {
    font-size: 12px;
    letter-spacing: 5px;
  }
  
  .core-text p {
    font-size: 1.5rem;
  }
}
</style>