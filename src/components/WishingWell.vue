<template>
  <div class="wish-tree-container">
    <canvas ref="canvas"></canvas>
    <div class="text-blessing">
      <p>愿你年年岁岁都平安</p>
    </div>

    <div class="vertical-texts">
      <div
        v-for="(t, i) in verticalTexts"
        :key="i"
        class="vertical-text"
        :style="{ right: (i * 6) + '%', '--delay': (i * 3) + 's' }"
      >
        {{ t }}
      </div>
    </div>
    <div class="wish-input-area">
      <input
        v-model="wishText"
        type="text"
        placeholder="写下你的愿望..."
        class="wish-input"
        @keyup.enter="addWish"
      />
      <button @click="addWish" class="add-wish-btn">许愿 ✨</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const CONFIG = {
  TREE: {
    TRUNK_RADIUS_TOP: 0.2,
    TRUNK_RADIUS_BOTTOM: 0.35,
    TRUNK_HEIGHT: 4,
    TRUNK_SEGMENTS: 8,
    BRANCH_COUNT: 10,
    BRANCH_LENGTH: 1.8,
    LEAF_COLORS: [0x00BFFF, 0x1E90FF, 0x4169E1, 0x00FFFF, 0x5F9EA0],
    LEAF_LAYERS: [
      { height: 4.5, radius: 1.2, leafCount: 600 },
      { height: 5.2, radius: 2.0, leafCount: 1000 },
      { height: 5.8, radius: 2.8, leafCount: 1400 },
      { height: 6.4, radius: 3.2, leafCount: 1600 },
      { height: 7.0, radius: 2.5, leafCount: 1200 },
      { height: 7.6, radius: 1.5, leafCount: 800 }
    ]
  },
  PARTICLES: {
    GLOW_COUNT: 2000,
    FLOAT_COUNT: 400,
    DANDELION_COUNT: 15,
    DANDELION_SEED_COUNT: 30,
    WISH_PARTICLE_COUNT: 100
  },
  CAMERA: {
    FOV: 50,
    NEAR: 0.1,
    FAR: 1000,
    INITIAL_POSITION: { x: 0, y: 3, z: 12 },
    LOOK_AT: { x: 0, y: 3, z: 0 }
  },
  ANIMATION: {
    TREE_ROTATION_SPEED: 0.001,
    GLOW_ROTATION_SPEED: 0.002,
    CAMERA_SWAY_SPEED: 0.0005,
    CAMERA_SWAY_AMOUNT: 0.5
  }
}

const canvas = ref(null)
const wishText = ref('')

const verticalTexts = ref([
  '岁月静好',
  '愿你安好',
  '相思入骨',
  '海誓山盟',
  '白首不离'
])

let scene = null
let camera = null
let renderer = null
let clock = null
let animationId = null

const treeParticles = []
const leafLayers = []
const floatingParticles = []
const wishParticles = []
const dandelions = []

const disposables = []

const createTrunk = () => {
  const geometry = new THREE.CylinderGeometry(
    CONFIG.TREE.TRUNK_RADIUS_TOP,
    CONFIG.TREE.TRUNK_RADIUS_BOTTOM,
    CONFIG.TREE.TRUNK_HEIGHT,
    CONFIG.TREE.TRUNK_SEGMENTS
  )
  const material = new THREE.MeshBasicMaterial({
    color: 0x0a3d5c,
    transparent: true,
    opacity: 0.9
  })
  const trunk = new THREE.Mesh(geometry, material)
  trunk.position.y = 2
  scene.add(trunk)
  disposables.push({ geometry, material })
}

const createBranches = () => {
  for (let i = 0; i < CONFIG.TREE.BRANCH_COUNT; i++) {
    const geometry = new THREE.CylinderGeometry(0.04, 0.07, CONFIG.TREE.BRANCH_LENGTH, 6)
    const material = new THREE.MeshBasicMaterial({
      color: 0x0d4a70,
      transparent: true,
      opacity: 0.75
    })
    const branch = new THREE.Mesh(geometry, material)

    const angle = (i / CONFIG.TREE.BRANCH_COUNT) * Math.PI * 2
    const height = 2.8 + (i % 3) * 0.4
    const branchLength = 0.6 + Math.random() * 0.3

    branch.position.set(
      Math.cos(angle) * branchLength,
      height,
      Math.sin(angle) * branchLength
    )
    branch.rotation.z = Math.cos(angle) * 0.5
    branch.rotation.x = Math.sin(angle) * 0.5
    branch.rotation.y = -angle

    scene.add(branch)
    disposables.push({ geometry, material })
  }
}

const createLeafLayer = (config, layerIndex) => {
  const positions = new Float32Array(config.leafCount * 3)
  const colors = new Float32Array(config.leafCount * 3)
  const originalPositions = new Float32Array(config.leafCount * 3)

  for (let i = 0; i < config.leafCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = config.radius * Math.cbrt(Math.random())

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.cos(phi) * 0.6 + config.height
    const z = r * Math.sin(phi) * Math.sin(theta)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    originalPositions[i * 3] = x
    originalPositions[i * 3 + 1] = y
    originalPositions[i * 3 + 2] = z

    const color = new THREE.Color(CONFIG.TREE.LEAF_COLORS[Math.floor(Math.random() * CONFIG.TREE.LEAF_COLORS.length)])
    colors[i * 3] = color.r * 0.85
    colors[i * 3 + 1] = color.g * 0.9
    colors[i * 3 + 2] = color.b * 0.95
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  const leaves = new THREE.Points(geometry, material)
  leaves.userData = {
    type: 'leaves',
    layer: layerIndex,
    originalPositions,
    layerHeight: config.height,
    layerRadius: config.radius
  }

  scene.add(leaves)
  leafLayers.push(leaves)
  disposables.push({ geometry, material })
}

const createGlowParticles = () => {
  const count = CONFIG.PARTICLES.GLOW_COUNT
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    const radius = 3 + Math.random() * 2

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi) * 0.7 + 6
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    phases[i] = Math.random() * Math.PI * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

  const material = new THREE.PointsMaterial({
    size: 0.12,
    color: 0x00FFFF,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  const glow = new THREE.Points(geometry, material)
  glow.userData = { type: 'glow', phases }
  scene.add(glow)
  treeParticles.push(glow)
  disposables.push({ geometry, material })
}

const createWishTree = () => {
  createTrunk()
  createBranches()

  CONFIG.TREE.LEAF_LAYERS.forEach((config, index) => {
    createLeafLayer(config, index)
  })

  createGlowParticles()
}

const createFloatingParticles = () => {
  const count = CONFIG.PARTICLES.FLOAT_COUNT
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = Math.random() * 15 - 3
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = 0.5 + Math.random() * 0.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1))

  const material = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xADD8E6,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  const floats = new THREE.Points(geometry, material)
  floats.userData = { type: 'floating' }
  scene.add(floats)
  floatingParticles.push(floats)
  disposables.push({ geometry, material })
}

const createDandelions = () => {
  for (let i = 0; i < CONFIG.PARTICLES.DANDELION_COUNT; i++) {
    const dandelionGroup = new THREE.Group()

    const seedCount = CONFIG.PARTICLES.DANDELION_SEED_COUNT
    const seedPositions = new Float32Array(seedCount * 3)
    const seedVelocities = []

    for (let j = 0; j < seedCount; j++) {
      const angle = (j / seedCount) * Math.PI * 2
      const radius = 0.3 + Math.random() * 0.2
      seedPositions[j * 3] = Math.cos(angle) * radius
      seedPositions[j * 3 + 1] = Math.sin(angle) * radius * 0.5
      seedPositions[j * 3 + 2] = Math.sin(angle) * radius
      seedVelocities.push({
        y: -0.005 - Math.random() * 0.01,
        x: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      })
    }

    const seedGeometry = new THREE.BufferGeometry()
    seedGeometry.setAttribute('position', new THREE.BufferAttribute(seedPositions, 3))

    const seedMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xE0FFFF,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    const seeds = new THREE.Points(seedGeometry, seedMaterial)
    seeds.userData = {
      velocities: seedVelocities,
      released: false,
      releaseTime: 0
    }

    dandelionGroup.add(seeds)

    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 6)
    const stemMaterial = new THREE.MeshBasicMaterial({
      color: 0x5F9EA0,
      transparent: true,
      opacity: 0.6
    })
    const stem = new THREE.Mesh(stemGeometry, stemMaterial)
    stem.rotation.x = Math.PI / 2
    dandelionGroup.add(stem)

    const angle = Math.random() * Math.PI * 2
    const radius = 8 + Math.random() * 4
    dandelionGroup.position.set(
      Math.cos(angle) * radius,
      -2 + Math.random() * 2,
      Math.sin(angle) * radius
    )

    dandelionGroup.userData = {
      type: 'dandelion',
      rotationSpeed: 0.001 + Math.random() * 0.002
    }

    scene.add(dandelionGroup)
    dandelions.push(dandelionGroup)
    disposables.push({ geometry: seedGeometry, material: seedMaterial })
    disposables.push({ geometry: stemGeometry, material: stemMaterial })
  }
}

const addWish = () => {
  if (!wishText.value.trim()) return

  const count = CONFIG.PARTICLES.WISH_PARTICLE_COUNT
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  const startY = 0
  const startX = (Math.random() - 0.5) * 4
  const startZ = (Math.random() - 0.5) * 4

  for (let i = 0; i < count; i++) {
    positions[i * 3] = startX + (Math.random() - 0.5) * 2
    positions[i * 3 + 1] = startY + i * 0.05
    positions[i * 3 + 2] = startZ + (Math.random() - 0.5) * 2

    const color = new THREE.Color(0x00FFFF)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  const wishParticle = new THREE.Points(geometry, material)
  wishParticle.userData = {
    type: 'wish',
    velocity: 0.03 + Math.random() * 0.02,
    targetY: 8
  }

  scene.add(wishParticle)
  wishParticles.push(wishParticle)
  wishText.value = ''
}

const updateLeafLayers = (time) => {
  leafLayers.forEach((leaves) => {
    const positions = leaves.geometry.attributes.position.array
    const originalPositions = leaves.userData.originalPositions

    for (let i = 0; i < positions.length / 3; i++) {
      const idx = i * 3
      const breathe = Math.sin(time * 0.001 + i * 0.1) * 0.05
      positions[idx] = originalPositions[idx] * (1 + breathe * 0.1)
      positions[idx + 1] = originalPositions[idx + 1] + breathe
      positions[idx + 2] = originalPositions[idx + 2] * (1 + breathe * 0.1)
    }
    leaves.geometry.attributes.position.needsUpdate = true
  })
}

const updateGlowParticles = (time) => {
  treeParticles.forEach((particle) => {
    if (particle.userData.type === 'glow') {
      particle.rotation.y -= CONFIG.ANIMATION.GLOW_ROTATION_SPEED
    }
  })
}

const updateFloatingParticles = (time) => {
  floatingParticles.forEach((particle) => {
    const positions = particle.geometry.attributes.position.array
    const phases = particle.geometry.attributes.phase.array
    const speeds = particle.geometry.attributes.speed.array

    for (let i = 0; i < positions.length / 3; i++) {
      const idx = i * 3
      positions[idx + 1] += Math.sin(time * 0.001 * speeds[i] + phases[i]) * 0.01
    }
    particle.geometry.attributes.position.needsUpdate = true
  })
}

const updateDandelions = (time) => {
  dandelions.forEach((dandelion) => {
    dandelion.rotation.y += dandelion.userData.rotationSpeed
    dandelion.position.y += Math.sin(time * 0.001) * 0.005

    const seeds = dandelion.children[0]
    if (seeds.userData && !seeds.userData.released && Math.random() < 0.003) {
      seeds.userData.released = true
      seeds.userData.releaseTime = time
    }
  })
}

const updateWishParticles = (time) => {
  for (let i = wishParticles.length - 1; i >= 0; i--) {
    const particle = wishParticles[i]
    const positions = particle.geometry.attributes.position.array
    const velocity = particle.userData.velocity

    for (let j = 0; j < positions.length / 3; j++) {
      positions[j * 3 + 1] += velocity
      positions[j * 3] += Math.sin(time * 0.002 + j) * 0.01
    }
    particle.geometry.attributes.position.needsUpdate = true

    if (positions[1] > particle.userData.targetY) {
      particle.material.opacity -= 0.01
    }

    if (particle.material.opacity <= 0) {
      scene.remove(particle)
      particle.geometry.dispose()
      particle.material.dispose()
      wishParticles.splice(i, 1)
    }
  }
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (!renderer || !scene || !camera) return

  const time = clock.getElapsedTime() * 1000

  updateLeafLayers(time)
  updateGlowParticles(time)
  updateFloatingParticles(time)
  updateDandelions(time)
  updateWishParticles(time)

  camera.position.x = Math.sin(time * CONFIG.ANIMATION.CAMERA_SWAY_SPEED) * CONFIG.ANIMATION.CAMERA_SWAY_AMOUNT
  camera.lookAt(CONFIG.CAMERA.LOOK_AT.x, CONFIG.CAMERA.LOOK_AT.y, CONFIG.CAMERA.LOOK_AT.z)

  renderer.render(scene, camera)
}

const initScene = () => {
  if (!canvas.value) return

  const width = canvas.value.clientWidth
  const height = canvas.value.clientHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    CONFIG.CAMERA.FOV,
    width / height,
    CONFIG.CAMERA.NEAR,
    CONFIG.CAMERA.FAR
  )
  camera.position.set(
    CONFIG.CAMERA.INITIAL_POSITION.x,
    CONFIG.CAMERA.INITIAL_POSITION.y,
    CONFIG.CAMERA.INITIAL_POSITION.z
  )
  camera.lookAt(CONFIG.CAMERA.LOOK_AT.x, CONFIG.CAMERA.LOOK_AT.y, CONFIG.CAMERA.LOOK_AT.z)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  clock = new THREE.Clock()

  createWishTree()
  createFloatingParticles()
  createDandelions()
  animate()
}

const handleResize = () => {
  if (!canvas.value || !camera || !renderer) return

  const width = canvas.value.clientWidth
  const height = canvas.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const disposeAll = () => {
  disposables.forEach(({ geometry, material }) => {
    geometry?.dispose()
    material?.dispose()
  })
  disposables.length = 0

  leafLayers.length = 0
  treeParticles.length = 0
  floatingParticles.length = 0
  wishParticles.length = 0
  dandelions.length = 0
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  disposeAll()

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  scene = null
  camera = null
  clock = null
})
</script>

<style scoped>
.wish-tree-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
  pointer-events: none;
}

.text-blessing {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 100;
  pointer-events: none;
}

.text-blessing p {
  font-family: 'Great Vibes', cursive;
  font-size: 3rem;
  color: #00FFFF;
  text-shadow:
    0 0 20px rgba(0, 255, 255, 0.8),
    0 0 40px rgba(0, 191, 255, 0.6),
    0 0 60px rgba(0, 105, 255, 0.4);
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    text-shadow:
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(0, 191, 255, 0.6),
      0 0 60px rgba(0, 105, 255, 0.4);
  }
  50% {
    text-shadow:
      0 0 30px rgba(0, 255, 255, 1),
      0 0 60px rgba(0, 191, 255, 0.9),
      0 0 90px rgba(0, 105, 255, 0.6);
  }
}

.wish-input-area {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 100;
}

.wish-input {
  padding: 15px 25px;
  font-size: 16px;
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 30px;
  background: rgba(0, 30, 60, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  width: 280px;
  outline: none;
  transition: all 0.3s ease;
}

.wish-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.wish-input:focus {
  border-color: #00FFFF;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.4);
}

.add-wish-btn {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #00BFFF, #00FFFF);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 191, 255, 0.5);
}

.add-wish-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 191, 255, 0.8);
}

@media (max-width: 768px) {
  .wish-input-area {
    flex-direction: column;
    align-items: center;
    bottom: 80px;
  }

  .wish-input {
    width: 260px;
  }

  .text-blessing p {
    font-size: 2rem;
  }
}

.vertical-texts {
  position: absolute;
  top: 10%;
  left: 0;
  width: 100%;
  height: 80%;
  pointer-events: none;
  perspective: 1000px;
  z-index: 140;
}

.vertical-text {
  position: absolute;
  top: 10%;
  writing-mode: vertical-rl;
  transform-origin: center center;
  color: rgba(200, 180, 220, 0.55);
  font-size: 18px;
  white-space: nowrap;
  text-orientation: upright;
  filter: blur(0.2px);
  animation: slowRotate var(--duration, 40s) linear infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes slowRotate {
  from {
    transform: rotateY(0deg);
    opacity: 0.6
  }
  50% {
    transform: rotateY(180deg);
    opacity: 0.9
  }
  to {
    transform: rotateY(360deg);
    opacity: 0.6
  }
}
</style>
