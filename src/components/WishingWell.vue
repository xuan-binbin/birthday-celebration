<template>
  <div class="wish-tree-container">
    <canvas ref="canvas"></canvas>
    
    <div class="text-blessing">
      <p>{{ currentBlessing }}</p>
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

    <div class="control-panel">
      <div class="gesture-toggle" @click="toggleGesture">
        <span class="toggle-label">手势控制</span>
        <div class="toggle-switch" :class="{ active: gestureEnabled }">
          <div class="toggle-knob"></div>
        </div>
      </div>
      <div class="tips" v-if="gestureEnabled">
        <div class="tip-title">手势说明</div>
        <div class="tip-item">✊ 握拳 - 聚合许愿树</div>
        <div class="tip-item">✋ 张手 - 粒子散开</div>
        <div class="tip-item">👌 捏合 - 聚焦模式</div>
      </div>
    </div>

    <div class="webcam-preview" v-show="gestureEnabled && webcamActive">
      <video ref="webcam" autoplay playsinline></video>
      <canvas ref="webcamCanvas"></canvas>
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
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const CONFIG = {
  TREE: {
    TRUNK_RADIUS_TOP: 0.08,
    TRUNK_RADIUS_BOTTOM: 0.22,
    TRUNK_HEIGHT: 4.0,
    TRUNK_SEGMENTS: 16,
    BRANCH_COUNT: 20,
    BRANCH_LENGTH: 2.5,
    LEAF_COLORS: [0x00FFFF, 0x00D4FF, 0x00AAFF, 0x0088FF, 0x00BFFF, 0x00AADD],
    LEAF_LAYERS: [
      { height: 4.5, radius: 2.5, leafCount: 400 },
      { height: 5.2, radius: 4.0, leafCount: 800 },
      { height: 5.9, radius: 5.5, leafCount: 1200 },
      { height: 6.5, radius: 6.5, leafCount: 1600 },
      { height: 7.0, radius: 7.0, leafCount: 1800 },
      { height: 7.4, radius: 6.5, leafCount: 1400 },
      { height: 7.8, radius: 5.5, leafCount: 1000 },
      { height: 8.2, radius: 4.0, leafCount: 600 }
    ]
  },
  PARTICLES: {
    GLOW_COUNT: 2500,
    FLOAT_COUNT: 300,
    DANDELION_COUNT: 15,
    DANDELION_SEED_COUNT: 30,
    WISH_PARTICLE_COUNT: 100,
    STAR_COUNT: 500
  },
  CAMERA: {
    FOV: 50,
    NEAR: 0.1,
    FAR: 1000,
    INITIAL_POSITION: { x: 0, y: 3.5, z: 14 },
    LOOK_AT: { x: 0, y: 3.5, z: 0 }
  },
  ANIMATION: {
    TREE_ROTATION_SPEED: 0.001,
    GLOW_ROTATION_SPEED: 0.002,
    CAMERA_SWAY_SPEED: 0.0005,
    CAMERA_SWAY_AMOUNT: 0.5
  }
}

const BLESSINGS = [
  '愿你年年岁岁都平安',
  '愿所有美好如期而至',
  '愿你眼里有光心中有爱',
  '愿岁月静好现世安稳',
  '愿你被世界温柔以待'
]

const canvas = ref(null)
const webcam = ref(null)
const webcamCanvas = ref(null)
const wishText = ref('')
const gestureEnabled = ref(false)
const webcamActive = ref(false)
const currentBlessing = ref(BLESSINGS[0])

const verticalTexts = ref([
  '岁月静好',
  '愿你安好',
  '天天开心',
  '无忧无虑',
])

let scene = null
let camera = null
let renderer = null
let clock = null
let animationId = null
let handLandmarker = null
let webcamCtx = null
let lastVideoTime = -1

const treeParticles = []
const leafLayers = []
const floatingParticles = []
const wishParticles = []
const dandelions = []
const disposables = []

const STATE = {
  mode: 'NORMAL',
  hand: { detected: false, x: 0, y: 0 },
  rotation: { x: 0, y: 0 },
  zoom: 1
}

let isDragging = false
let previousMousePosition = { x: 0, y: 0 }

const toggleGesture = async () => {
  gestureEnabled.value = !gestureEnabled.value
  if (gestureEnabled.value && !handLandmarker) {
    await initMediaPipe()
  }
}

const initMediaPipe = async () => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    )
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 1
    })

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      webcam.value.srcObject = stream
      webcamActive.value = true
      webcam.value.addEventListener('loadeddata', predictWebcam)
    }
  } catch (error) {
    console.error('Failed to initialize MediaPipe:', error)
    gestureEnabled.value = false
  }
}

const predictWebcam = async () => {
  if (!gestureEnabled.value || !webcam.value || !handLandmarker) {
    requestAnimationFrame(predictWebcam)
    return
  }

  if (webcam.value.currentTime !== lastVideoTime) {
    lastVideoTime = webcam.value.currentTime

    webcamCanvas.value.width = webcam.value.videoWidth
    webcamCanvas.value.height = webcam.value.videoHeight
    webcamCtx = webcamCanvas.value.getContext('2d')
    webcamCtx.clearRect(0, 0, webcamCanvas.value.width, webcamCanvas.value.height)
    webcamCtx.drawImage(webcam.value, 0, 0)

    const result = handLandmarker.detectForVideo(webcam.value, performance.now())

    if (result.landmarks.length > 0) {
      STATE.hand.detected = true
      const landmarks = result.landmarks[0]
      STATE.hand.x = (landmarks[9].x - 0.5) * 2
      STATE.hand.y = (landmarks[9].y - 0.5) * 2

      const isIndexUp = landmarks[8].y < landmarks[6].y
      const isMiddleUp = landmarks[12].y < landmarks[10].y
      const isRingUp = landmarks[16].y < landmarks[14].y
      const isPinkyUp = landmarks[20].y < landmarks[18].y
      const pinchDist = Math.hypot(landmarks[8].x - landmarks[4].x, landmarks[8].y - landmarks[4].y)
      const isPinch = pinchDist < 0.1
      const isFist = !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp
      const isOpenHand = isIndexUp && isMiddleUp && isRingUp && isPinkyUp

      console.log('Hand detected:', { isIndexUp, isMiddleUp, isRingUp, isPinkyUp, pinchDist: pinchDist.toFixed(2), isPinch, isFist, isOpenHand })

      if (isPinch && !isFist) {
        STATE.mode = 'FOCUS'
        console.log('Mode: FOCUS')
      } else if (isFist) {
        STATE.mode = 'GATHER'
        console.log('Mode: GATHER')
      } else if (isOpenHand) {
        STATE.mode = 'SCATTER'
        console.log('Mode: SCATTER')
      } else {
        STATE.mode = 'NORMAL'
        console.log('Mode: NORMAL')
      }

      drawHand(landmarks, webcamCtx)
    } else {
      STATE.hand.detected = false
      STATE.mode = 'NORMAL'
    }
  }

  requestAnimationFrame(predictWebcam)
}

const drawHand = (landmarks, ctx) => {
  ctx.strokeStyle = '#00ffcc'
  ctx.lineWidth = 2
  const connections = [
    [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],[0,17]
  ]
  for (let c of connections) {
    const s = landmarks[c[0]]
    const e = landmarks[c[1]]
    ctx.beginPath()
    ctx.moveTo(s.x * webcamCanvas.value.width, s.y * webcamCanvas.value.height)
    ctx.lineTo(e.x * webcamCanvas.value.width, e.y * webcamCanvas.value.height)
    ctx.stroke()
  }
}

const createTrunk = () => {
  const geometry = new THREE.CylinderGeometry(
    CONFIG.TREE.TRUNK_RADIUS_TOP,
    CONFIG.TREE.TRUNK_RADIUS_BOTTOM,
    CONFIG.TREE.TRUNK_HEIGHT,
    CONFIG.TREE.TRUNK_SEGMENTS
  )
  const material = new THREE.MeshBasicMaterial({
    color: 0x00DDFF,
    transparent: true,
    opacity: 0.6,
    emissive: 0x00DDFF,
    emissiveIntensity: 0.9
  })
  const trunk = new THREE.Mesh(geometry, material)
  trunk.position.y = CONFIG.TREE.TRUNK_HEIGHT / 2
  
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00FFFF,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  })
  const glowMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      CONFIG.TREE.TRUNK_RADIUS_TOP * 2,
      CONFIG.TREE.TRUNK_RADIUS_BOTTOM * 2,
      CONFIG.TREE.TRUNK_HEIGHT * 0.95,
      CONFIG.TREE.TRUNK_SEGMENTS
    ),
    glowMaterial
  )
  glowMesh.position.y = CONFIG.TREE.TRUNK_HEIGHT / 2
  trunk.add(glowMesh)
  
  scene.add(trunk)
  disposables.push({ geometry, material })
  disposables.push({ geometry: glowMesh.geometry, material: glowMaterial })
}

const createBranches = () => {
  const mainBranches = []
  
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const height = 3.0 + Math.random() * 0.5
    const branchLength = CONFIG.TREE.BRANCH_LENGTH * 0.8
    
    const mainBranch = createBranchSegment(branchLength, 0.06, 0.09, height, angle)
    mainBranch.rotation.z = Math.cos(angle) * 0.6
    mainBranch.rotation.x = Math.sin(angle) * 0.6
    mainBranch.rotation.y = -angle
    mainBranch.rotateX(-Math.PI / 3)
    
    mainBranches.push({
      angle,
      height,
      branch: mainBranch
    })
    
    scene.add(mainBranch)
  }
  
  for (let i = 0; i < CONFIG.TREE.BRANCH_COUNT - 8; i++) {
    const baseBranch = mainBranches[i % mainBranches.length]
    const angle = baseBranch.angle + (Math.random() - 0.5) * 0.5
    const height = baseBranch.height + 0.8 + Math.random() * 0.5
    const branchLength = CONFIG.TREE.BRANCH_LENGTH * (0.4 + Math.random() * 0.3)
    
    const subBranch = createBranchSegment(branchLength, 0.025, 0.05, height, angle)
    subBranch.rotation.z = Math.cos(angle) * 0.5 + (Math.random() - 0.5) * 0.3
    subBranch.rotation.x = Math.sin(angle) * 0.5 + (Math.random() - 0.5) * 0.3
    subBranch.rotation.y = -angle
    subBranch.rotateX(-Math.PI / 2.5 - Math.random() * Math.PI / 6)
    
    scene.add(subBranch)
  }
}

const createBranchSegment = (length, topRadius, bottomRadius, baseHeight, angle) => {
  const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, length, 8)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00CCFF,
    transparent: true,
    opacity: 0.5,
    emissive: 0x00CCFF,
    emissiveIntensity: 0.7
  })
  const branch = new THREE.Mesh(geometry, material)
  
  const branchRadius = 0.5 + Math.random() * 0.3
  branch.position.set(
    Math.cos(angle) * branchRadius,
    baseHeight,
    Math.sin(angle) * branchRadius
  )
  
  disposables.push({ geometry, material })
  return branch
}

const createLeafLayer = (config, layerIndex) => {
  const positions = new Float32Array(config.leafCount * 3)
  const colors = new Float32Array(config.leafCount * 3)
  const originalPositions = new Float32Array(config.leafCount * 3)
  const scatterPositions = new Float32Array(config.leafCount * 3)

  for (let i = 0; i < config.leafCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = config.radius * Math.cbrt(Math.random())

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.cos(phi) * 0.4 + config.height
    const z = r * Math.sin(phi) * Math.sin(theta)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    originalPositions[i * 3] = x
    originalPositions[i * 3 + 1] = y
    originalPositions[i * 3 + 2] = z

    const scatterR = 12 + Math.random() * 10
    const scatterTheta = Math.random() * Math.PI * 2
    const scatterPhi = Math.acos(2 * Math.random() - 1)
    scatterPositions[i * 3] = scatterR * Math.sin(scatterPhi) * Math.cos(scatterTheta)
    scatterPositions[i * 3 + 1] = scatterR * Math.sin(scatterPhi) * Math.sin(scatterTheta) * 0.3 + 5
    scatterPositions[i * 3 + 2] = scatterR * Math.cos(scatterPhi)

    const color = new THREE.Color(CONFIG.TREE.LEAF_COLORS[Math.floor(Math.random() * CONFIG.TREE.LEAF_COLORS.length)])
    const brightness = 0.7 + Math.random() * 0.3
    colors[i * 3] = color.r * brightness
    colors[i * 3 + 1] = color.g * brightness
    colors[i * 3 + 2] = color.b * brightness
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.07,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  const leaves = new THREE.Points(geometry, material)
  leaves.userData = {
    type: 'leaves',
    layer: layerIndex,
    originalPositions,
    scatterPositions,
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
    const radius = 4 + Math.random() * 3

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi) * 0.7 + 7
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    phases[i] = Math.random() * Math.PI * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

  const material = new THREE.PointsMaterial({
    size: 0.15,
    color: 0x00FFFF,
    transparent: true,
    opacity: 0.95,
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
  createBackgroundStars()
}

const createBackgroundStars = () => {
  const count = CONFIG.PARTICLES.STAR_COUNT
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50
    positions[i * 3 + 1] = Math.random() * 30 - 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20
    phases[i] = Math.random() * Math.PI * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

  const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00AADD,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  })

  const stars = new THREE.Points(geometry, material)
  stars.userData = { type: 'stars', phases }
  scene.add(stars)
  disposables.push({ geometry, material })
}

const createFloatingParticles = () => {
  const count = CONFIG.PARTICLES.FLOAT_COUNT
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 25
    positions[i * 3 + 1] = Math.random() * 20 - 3
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12
    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = 0.5 + Math.random() * 0.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1))

  const material = new THREE.PointsMaterial({
    size: 0.12,
    color: 0x00FFFF,
    transparent: true,
    opacity: 0.7,
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

const updateLeafLayers = (time, dt) => {
  leafLayers.forEach((leaves) => {
    const positions = leaves.geometry.attributes.position.array
    const originalPositions = leaves.userData.originalPositions
    const scatterPositions = leaves.userData.scatterPositions

    for (let i = 0; i < positions.length / 3; i++) {
      const idx = i * 3
      let targetX, targetY, targetZ

      if (STATE.mode === 'GATHER' || STATE.mode === 'NORMAL') {
        targetX = originalPositions[idx]
        targetY = originalPositions[idx + 1]
        targetZ = originalPositions[idx + 2]
      } else if (STATE.mode === 'SCATTER') {
        targetX = scatterPositions[idx]
        targetY = scatterPositions[idx + 1]
        targetZ = scatterPositions[idx + 2]
      } else if (STATE.mode === 'FOCUS') {
        const focusScale = 0.3
        targetX = originalPositions[idx] * focusScale
        targetY = originalPositions[idx + 1] * focusScale + 5
        targetZ = originalPositions[idx + 2] * focusScale
      }

      positions[idx] += (targetX - positions[idx]) * 3 * dt
      positions[idx + 1] += (targetY - positions[idx + 1]) * 3 * dt
      positions[idx + 2] += (targetZ - positions[idx + 2]) * 3 * dt

      const breathe = Math.sin(time * 0.001 + i * 0.1) * 0.05
      positions[idx] *= (1 + breathe * 0.1)
      positions[idx + 1] += breathe
      positions[idx + 2] *= (1 + breathe * 0.1)
    }
    leaves.geometry.attributes.position.needsUpdate = true
  })
}

const updateGlowParticles = (time) => {
  treeParticles.forEach((particle) => {
    if (particle.userData.type === 'glow') {
      particle.rotation.y -= CONFIG.ANIMATION.GLOW_ROTATION_SPEED
    }
    if (particle.userData.type === 'stars') {
      const positions = particle.geometry.attributes.position.array
      const phases = particle.userData.phases
      for (let i = 0; i < positions.length / 3; i++) {
        const idx = i * 3
        const twinkle = Math.sin(time * 0.003 + phases[i]) * 0.3 + 0.7
        positions[idx + 1] += Math.sin(time * 0.001 + phases[i]) * 0.001
      }
      particle.geometry.attributes.position.needsUpdate = true
      particle.material.opacity = 0.4 + Math.sin(time * 0.002) * 0.2
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
  const dt = clock.getDelta()

  updateLeafLayers(time, dt)
  updateGlowParticles(time)
  updateFloatingParticles(time)
  updateDandelions(time)
  updateWishParticles(time)

  if (STATE.hand.detected && gestureEnabled.value) {
    const sensitivity = 0.005
    STATE.rotation.y = STATE.hand.x * 2
    STATE.rotation.x = STATE.hand.y * 1
    scene.rotation.y += (STATE.rotation.y - scene.rotation.y) * 0.05
    scene.rotation.x += (STATE.rotation.x - scene.rotation.x) * 0.05
    scene.rotation.x = Math.max(-0.5, Math.min(0.5, scene.rotation.x))
  } else if (!isDragging) {
    scene.rotation.y += CONFIG.ANIMATION.TREE_ROTATION_SPEED
    scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, 0, 2 * dt)
  }

  const targetZoom = STATE.mode === 'FOCUS' ? 0.6 : 1
  STATE.zoom = THREE.MathUtils.lerp(STATE.zoom, targetZoom, 2 * dt)
  camera.position.z = CONFIG.CAMERA.INITIAL_POSITION.z * STATE.zoom

  camera.position.x = Math.sin(time * CONFIG.ANIMATION.CAMERA_SWAY_SPEED) * CONFIG.ANIMATION.CAMERA_SWAY_AMOUNT
  camera.lookAt(CONFIG.CAMERA.LOOK_AT.x, CONFIG.CAMERA.LOOK_AT.y, CONFIG.CAMERA.LOOK_AT.z)

  renderer.render(scene, camera)
}

const setupMouseControls = () => {
  const onPointerDown = (x, y) => {
    isDragging = true
    previousMousePosition = { x, y }
  }

  const onPointerMove = (x, y) => {
    if (!isDragging) return

    const deltaMove = {
      x: x - previousMousePosition.x,
      y: y - previousMousePosition.y
    }

    if (!STATE.hand.detected || !gestureEnabled.value) {
      const sensitivity = 0.005
      scene.rotation.y += deltaMove.x * sensitivity
      scene.rotation.x += deltaMove.y * sensitivity
      scene.rotation.x = Math.max(-0.5, Math.min(0.5, scene.rotation.x))
    }

    previousMousePosition = { x, y }
  }

  const onPointerUp = () => {
    isDragging = false
  }

  const onWheel = (e) => {
    e.preventDefault()
    const zoomSpeed = 0.001
    STATE.zoom = Math.max(0.5, Math.min(2, STATE.zoom + e.deltaY * zoomSpeed))
    camera.position.z = CONFIG.CAMERA.INITIAL_POSITION.z * STATE.zoom
  }

  canvas.value.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY))
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY))
  window.addEventListener('mouseup', onPointerUp)

  canvas.value.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY)
  }, { passive: false })

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) onPointerMove(e.touches[0].clientX, e.touches[0].clientY)
  }, { passive: false })

  window.addEventListener('touchend', onPointerUp)

  canvas.value.addEventListener('wheel', onWheel, { passive: false })
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
  setupMouseControls()
  animate()

  setInterval(() => {
    const idx = Math.floor(Math.random() * BLESSINGS.length)
    currentBlessing.value = BLESSINGS[idx]
  }, 5000)
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

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 150;
}

.gesture-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: rgba(0, 30, 60, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gesture-toggle:hover {
  border-color: #00FFFF;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.toggle-label {
  color: #fff;
  font-size: 14px;
}

.toggle-switch {
  width: 40px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: #00FFFF;
}

.toggle-knob {
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.toggle-switch.active .toggle-knob {
  left: 22px;
}

.tips {
  margin-top: 10px;
  padding: 10px 15px;
  background: rgba(0, 30, 60, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.tip-title {
  color: #00FFFF;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  padding-bottom: 5px;
}

.tip-item {
  margin: 5px 0;
}

.webcam-preview {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 160px;
  height: 120px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  z-index: 150;
  background: #000;
}

.webcam-preview video {
  display: none;
}

.webcam-preview canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.wish-input-area {
  position: absolute;
  bottom: 120px;
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
    bottom: 100px;
  }

  .wish-input {
    width: 260px;
  }

  .text-blessing p {
    font-size: 2rem;
  }

  .webcam-preview {
    width: 120px;
    height: 90px;
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
