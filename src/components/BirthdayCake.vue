<template>
  <div class="cake-wrapper">
    <div class="cake-container" ref="container">
      <canvas ref="canvas"></canvas>
      <div class="cake-controls">
        <button @click="toggleRotation" class="control-btn">
          {{ isRotating ? '暂停旋转' : '开始旋转' }}
        </button>
        <button @click="celebrate" class="control-btn celebrate-btn">
          庆祝一下
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)
const canvas = ref(null)
const isRotating = ref(true)

let scene, camera, renderer
let cakeGroup, candles = []
let animationId

const initScene = () => {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  console.log('Cake container size:', width, height)

  scene = new THREE.Scene()
  scene.background = null

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(0, 2, 12)
  camera.lookAt(0, 2, 0)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const spotLight = new THREE.SpotLight(0xffffff, 2)
  spotLight.position.set(0, 20, 10)
  spotLight.castShadow = true
  scene.add(spotLight)

  const pointLight1 = new THREE.PointLight(0xff69b4, 1, 30)
  pointLight1.position.set(-8, 5, -5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 30)
  pointLight2.position.set(8, 5, 5)
  scene.add(pointLight2)

  createCake()
  animate()
}

const createCake = () => {
  cakeGroup = new THREE.Group()

  const platformGeometry = new THREE.CylinderGeometry(4, 4.2, 0.5, 32)
  const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6
  })
  const platform = new THREE.Mesh(platformGeometry, platformMaterial)
  platform.position.y = 0.25
  platform.receiveShadow = true
  cakeGroup.add(platform)

  const baseGeometry = new THREE.CylinderGeometry(3.5, 3.8, 2, 32)
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xff69b4,
    roughness: 0.4,
    metalness: 0.1
  })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = 1.5
  base.castShadow = true
  cakeGroup.add(base)

  const frostingGeometry = new THREE.TorusGeometry(3.5, 0.15, 8, 32)
  const frostingMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffe66d,
    emissiveIntensity: 0.3
  })
  const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial)
  frosting.position.y = 2.5
  frosting.rotation.x = Math.PI / 2
  cakeGroup.add(frosting)

  const secondGeometry = new THREE.CylinderGeometry(2.5, 2.8, 1.8, 32)
  const secondMaterial = new THREE.MeshStandardMaterial({
    color: 0xffb6c1,
    roughness: 0.4
  })
  const second = new THREE.Mesh(secondGeometry, secondMaterial)
  second.position.y = 3.4
  second.castShadow = true
  cakeGroup.add(second)

  const frosting2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.12, 8, 32),
    frostingMaterial
  )
  frosting2.position.y = 4.3
  frosting2.rotation.x = Math.PI / 2
  cakeGroup.add(frosting2)

  const topGeometry = new THREE.CylinderGeometry(1.5, 1.8, 1.5, 32)
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b6b,
    roughness: 0.4
  })
  const top = new THREE.Mesh(topGeometry, topMaterial)
  top.position.y = 4.85
  top.castShadow = true
  cakeGroup.add(top)

  const frosting3 = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.1, 8, 32),
    frostingMaterial
  )
  frosting3.position.y = 5.6
  frosting3.rotation.x = Math.PI / 2
  cakeGroup.add(frosting3)

  createNumber()
  createCandles()

  scene.add(cakeGroup)
}

const createNumber = () => {
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0xffd700,
    emissiveIntensity: 0.6
  })

  const twoShape = new THREE.Shape()
  twoShape.moveTo(-0.6, 0)
  twoShape.absarc(-0.3, 0.3, 0.3, Math.PI, 0, true)
  twoShape.lineTo(0, 0)
  twoShape.lineTo(0, -0.15)
  twoShape.lineTo(-0.3, -0.15)
  twoShape.absarc(-0.3, -0.3, 0.3, 0, Math.PI, false)
  twoShape.lineTo(-0.6, 0)

  const twoGeometry = new THREE.ExtrudeGeometry(twoShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05
  })
  const two = new THREE.Mesh(twoGeometry, textMaterial)
  two.position.set(-1.2, 5.8, 0)
  two.scale.set(1.3, 1.3, 1.3)
  cakeGroup.add(two)

  const zeroGeometry = new THREE.TorusGeometry(0.4, 0.15, 16, 32)
  const zero = new THREE.Mesh(zeroGeometry, textMaterial)
  zero.position.set(0.3, 6, 0)
  zero.scale.set(1.2, 1.4, 0.8)
  cakeGroup.add(zero)
}

const createCandles = () => {
  const positions = [
    { x: -1.5, z: 0 },
    { x: -0.8, z: 1 },
    { x: 0.8, z: 1 },
    { x: 1.5, z: 0 }
  ]

  positions.forEach((pos, index) => {
    const candleGroup = new THREE.Group()

    const candleGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1, 16)
    const candleMaterial = new THREE.MeshStandardMaterial({
      color: index % 2 === 0 ? 0xff1493 : 0xffd700
    })
    const candle = new THREE.Mesh(candleGeometry, candleMaterial)
    candleGroup.add(candle)

    const wickGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8)
    const wickMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 })
    const wick = new THREE.Mesh(wickGeometry, wickMaterial)
    wick.position.y = 0.6
    candleGroup.add(wick)

    const flameGeometry = new THREE.ConeGeometry(0.08, 0.35, 8)
    const flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8c00,
      transparent: true,
      opacity: 1
    })
    const flame = new THREE.Mesh(flameGeometry, flameMaterial)
    flame.position.y = 0.8
    candleGroup.add(flame)

    const innerFlameGeometry = new THREE.ConeGeometry(0.04, 0.2, 8)
    const innerFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 1
    })
    const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial)
    innerFlame.position.y = 0.75
    candleGroup.add(innerFlame)

    candleGroup.position.set(pos.x, 5.7, pos.z)
    candleGroup.userData = {
      flame,
      innerFlame,
      initialY: 5.7,
      phase: Math.random() * Math.PI * 2
    }

    candles.push(candleGroup)
    cakeGroup.add(candleGroup)
  })
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (!renderer || !scene || !camera) return

  const time = Date.now() * 0.001

  candles.forEach(candle => {
    const { flame, innerFlame, initialY, phase } = candle.userData
    const flicker = Math.sin(time * 12 + phase) * 0.2
    flame.scale.x = 1 + flicker
    flame.scale.z = 1 + flicker
    flame.position.y = 0.8 + Math.sin(time * 10 + phase) * 0.03
    innerFlame.scale.x = 1 + flicker * 0.5
    innerFlame.scale.z = 1 + flicker * 0.5
    candle.position.y = initialY + Math.sin(time * 4 + phase) * 0.02
  })

  if (isRotating.value && cakeGroup) {
    cakeGroup.rotation.y += 0.004
  }

  renderer.render(scene, camera)
}

const toggleRotation = () => {
  isRotating.value = !isRotating.value
}

const celebrate = () => {
  if (!cakeGroup) return

  candles.forEach(candle => {
    const { flame } = candle.userData
    flame.scale.set(3, 4, 3)
    setTimeout(() => flame.scale.set(1, 1, 1), 500)
  })

  let jumps = 0
  const jump = () => {
    if (jumps >= 3) return
    const startY = cakeGroup.position.y
    const startTime = Date.now()
    const doJump = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / 300, 1)
      cakeGroup.position.y = startY + Math.sin(progress * Math.PI) * 1
      if (progress < 1) {
        requestAnimationFrame(doJump)
      } else {
        cakeGroup.position.y = startY
        jumps++
        setTimeout(jump, 200)
      }
    }
    doJump()
  }
  jump()
}

const handleResize = () => {
  if (!container.value || !camera || !renderer) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  console.log('Cake mounted, container:', container.value)
  initScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style>
.cake-wrapper {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cake-container {
  width: 100%;
  height: 100%;
  position: relative;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.cake-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 10;
}

.control-btn {
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #ff6b6b, #ff69b4);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.5);
}

.control-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(255, 107, 107, 0.7);
}

.celebrate-btn {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #333;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
}

.celebrate-btn:hover {
  box-shadow: 0 6px 25px rgba(255, 215, 0, 0.7);
}
</style>
