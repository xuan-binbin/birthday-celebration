<template>
  <div class="cake-wrapper">
    <div class="cake-container" ref="container">
      <canvas ref="canvas"></canvas>
      <div class="gesture-hint">
        <p>🎂 滚动鼠标滚轮缩放 | 🖱️ 靠近或远离蛋糕</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)
const canvas = ref(null)

let scene, camera, renderer
let cakeParticles, ringParticles
let animationId
let targetCameraZ = 12
let currentCameraZ = 12

const initScene = async () => {
  if (!container.value) {
    console.error('Container not found!')
    return
  }

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  
  console.log('Cake container size:', width, height)

  if (width === 0 || height === 0) {
    console.error('Container has no size!')
    return
  }

  scene = new THREE.Scene()
  scene.background = null

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(0, 3, 12)
  camera.lookAt(0, 3, 0)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  
  console.log('Renderer initialized')

  // 创建圆形纹理
  const sprite = createCircleSprite()

  createCakeParticles(sprite)
  createRingParticles(sprite)
  createCandles(sprite)
  
  console.log('Particles created')

  // 添加鼠标滚轮事件监听
  canvas.value.addEventListener('wheel', handleWheel)
  
  animate()
  
  console.log('Animation started')
}

// 创建圆形精灵纹理
const createCircleSprite = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  // 创建径向渐变
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

const createCakeParticles = (sprite) => {
  const particleCount = 30000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)

  const pinkColors = [
    new THREE.Color(0xff69b4),
    new THREE.Color(0xff1493),
    new THREE.Color(0xffb6c1),
    new THREE.Color(0xff6b6b),
    new THREE.Color(0xffd700),
    new THREE.Color(0xee82ee)
  ]

  for (let i = 0; i < particleCount; i++) {
    const layer = Math.floor(Math.random() * 3)
    const angle = Math.random() * Math.PI * 2
    const spread = Math.random()

    let radius, y, color, size

    if (layer === 0) {
      const baseRadius = 4
      radius = baseRadius + spread * 0.8
      y = 1 + Math.random() * 2.5
      const colorIdx = Math.floor(Math.random() * 4)
      color = pinkColors[colorIdx]
      size = 0.08 + spread * 0.05
    } else if (layer === 1) {
      const baseRadius = 2.8
      radius = baseRadius + spread * 0.6
      y = 3.2 + Math.random() * 2
      const colorIdx = Math.floor(Math.random() * 5)
      color = pinkColors[colorIdx]
      size = 0.06 + spread * 0.04
    } else {
      const baseRadius = 1.6
      radius = baseRadius + spread * 0.4
      y = 5 + Math.random() * 1.8
      const colorIdx = Math.floor(Math.random() * 5)
      color = pinkColors[colorIdx]
      size = 0.05 + spread * 0.03
    }

    const idx = i * 3
    positions[idx] = Math.cos(angle) * radius
    positions[idx + 1] = y
    positions[idx + 2] = Math.sin(angle) * radius

    colors[idx] = color.r
    colors[idx + 1] = color.g
    colors[idx + 2] = color.b

    sizes[i] = size
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.15,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  cakeParticles = new THREE.Points(geometry, material)
  scene.add(cakeParticles)
}

const createRingParticles = (sprite) => {
  const ringCount = 8000
  const positions = new Float32Array(ringCount * 3)
  const colors = new Float32Array(ringCount * 3)
  const sizes = new Float32Array(ringCount)

  for (let i = 0; i < ringCount; i++) {
    const ring = Math.random() > 0.5 ? 0 : 1
    const angle = Math.random() * Math.PI * 2
    const spread = Math.random()

    let radius, y, tiltAngle, color
    const size = 0.06 + spread * 0.04

    if (ring === 0) {
      radius = 5.5 + spread * 1
      tiltAngle = Math.PI / 8
      y = 3 + Math.sin(angle * 2) * 0.3
      color = new THREE.Color(0xffffff)
    } else {
      radius = 7 + spread * 1.2
      tiltAngle = -Math.PI / 8
      y = 3 + Math.cos(angle * 2) * 0.3
      color = new THREE.Color(0xffffff)
    }

    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const tiltedY = y * Math.cos(tiltAngle) - z * Math.sin(tiltAngle)
    const tiltedZ = y * Math.sin(tiltAngle) + z * Math.cos(tiltAngle)

    const idx = i * 3
    positions[idx] = x
    positions[idx + 1] = tiltedY
    positions[idx + 2] = tiltedZ

    colors[idx] = color.r
    colors[idx + 1] = color.g
    colors[idx + 2] = color.b

    sizes[i] = size
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.12,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  ringParticles = new THREE.Points(geometry, material)
  scene.add(ringParticles)
}

const createCandles = (sprite) => {
  const particlesPerCandle = 3000
  const positions = new Float32Array(particlesPerCandle * 3)
  const colors = new Float32Array(particlesPerCandle * 3)
  const sizes = new Float32Array(particlesPerCandle)
  
  for (let i = 0; i < particlesPerCandle; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 0.2
    const y = 6.5 + Math.random() * 1.5
    
    const idx = i * 3
    positions[idx] = Math.cos(angle) * radius
    positions[idx + 1] = y
    positions[idx + 2] = Math.sin(angle) * radius
    
    // 蜡烛火焰颜色渐变
    const normalizedY = (y - 6.5) / 1.5
    let color
    
    if (normalizedY > 0.7) {
      // 火焰顶部 - 亮黄色
      color = new THREE.Color(0xffff00)
    } else if (normalizedY > 0.4) {
      // 火焰中部 - 橙色
      color = new THREE.Color(0xff8c00)
    } else {
      // 火焰底部 - 红色
      color = new THREE.Color(0xff4500)
    }
    
    colors[idx] = color.r
    colors[idx + 1] = color.g
    colors[idx + 2] = color.b
    
    sizes[i] = 0.1 + Math.random() * 0.08
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  const material = new THREE.PointsMaterial({
    size: 0.15,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })
  
  const candle = new THREE.Points(geometry, material)
  candle.userData = {
    baseY: 6.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.8
  }
  scene.add(candle)
}

const handleResize = () => {
  if (!container.value || !camera || !renderer) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const handleWheel = (event) => {
  event.preventDefault()
  
  const delta = event.deltaY > 0 ? 0.5 : -0.5
  targetCameraZ += delta
  targetCameraZ = Math.max(6, Math.min(20, targetCameraZ))
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (!renderer || !scene || !camera) return

  const time = Date.now() * 0.001

  // 平滑缩放
  currentCameraZ += (targetCameraZ - currentCameraZ) * 0.1
  camera.position.z = currentCameraZ
  camera.lookAt(0, 3, 0)

  if (cakeParticles) {
    cakeParticles.rotation.y += 0.001
  }

  if (ringParticles) {
    ringParticles.rotation.y -= 0.0005
    ringParticles.rotation.x = Math.sin(time * 0.5) * 0.1
  }

  // 蜡烛火焰跳动动画
  scene.children.forEach(child => {
    if (child.isPoints && child.userData.phase !== undefined) {
      const positions = child.geometry.attributes.position.array
      const baseY = child.userData.baseY
      const phase = child.userData.phase
      const speed = child.userData.speed
      
      for (let i = 0; i < positions.length / 3; i++) {
        const idx = i * 3
        const originalY = positions[idx + 1]
        const flicker = Math.sin(time * 10 * speed + phase + i * 0.1) * 0.1
        const sway = Math.cos(time * 5 * speed + phase + i * 0.05) * 0.05
        
        positions[idx] += sway * 0.02
        positions[idx + 1] = baseY + (originalY - baseY) * (1 + flicker * 0.3)
      }
      
      child.geometry.attributes.position.needsUpdate = true
    }
  })

  renderer.render(scene, camera)
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (canvas.value) {
    canvas.value.removeEventListener('wheel', handleWheel)
  }
  if (animationId) cancelAnimationFrame(animationId)
  if (cakeParticles) {
    cakeParticles.geometry.dispose()
    cakeParticles.material.dispose()
  }
  if (ringParticles) {
    ringParticles.geometry.dispose()
    ringParticles.material.dispose()
  }
})
</script>

<style scoped>
.cake-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
  pointer-events: none;
}

.cake-container {
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: auto;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.gesture-hint {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  border-radius: 30px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  text-align: center;
  z-index: 10;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.gesture-hint p {
  margin: 0;
}
</style>
