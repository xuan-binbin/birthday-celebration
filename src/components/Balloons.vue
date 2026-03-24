<template>
  <div class="balloons-container">
    <div
      v-for="balloon in balloons"
      :key="balloon.id"
      class="balloon"
      :style="{
        left: balloon.x + '%',
        bottom: balloon.bottom + 'px',
        '--sway-delay': balloon.swayDelay + 's',
        '--sway-duration': balloon.swayDuration + 's',
        '--rise-duration': balloon.riseDuration + 's',
        '--rise-delay': balloon.riseDelay + 's'
      }"
      @click="popBalloon(balloon)"
    >
      <div class="balloon-body" :style="{ backgroundColor: balloon.color }">
        <div class="balloon-shine"></div>
        <div class="balloon-string" :style="{ height: balloon.stringLength + 'px' }"></div>
      </div>
      <div class="balloon-pop" v-if="balloon.popped">
        <span>{{ balloon.popText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const balloons = ref([])

const popMessages = [
  '生日快乐!', '庆祝!', '开心!', '欢呼!',
  '幸福!', '好运!', '美满!', '甜蜜!',
  '欢笑!', '欢乐!', '精彩!', '辉煌!'
]

const initBalloons = () => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff69b4',
    '#00d2d3', '#ff9ff3', '#feca57', '#48dbfb'
  ]

  for (let i = 0; i < 15; i++) {
    balloons.value.push({
      id: i,
      x: Math.random() * 100,
      bottom: -100 - Math.random() * 200,
      color: colors[Math.floor(Math.random() * colors.length)],
      stringLength: 60 + Math.random() * 40,
      swayDelay: Math.random() * 2,
      swayDuration: 3 + Math.random() * 2,
      riseDuration: 15 + Math.random() * 10,
      riseDelay: Math.random() * 10,
      size: 0.8 + Math.random() * 0.4,
      popped: false,
      popText: popMessages[Math.floor(Math.random() * popMessages.length)]
    })
  }
}

const popBalloon = (balloon) => {
  if (balloon.popped) return

  balloon.popped = true

  setTimeout(() => {
    balloon.bottom = window.innerHeight + 100
  }, 10)

  setTimeout(() => {
    balloon.popped = false
    balloon.bottom = -100 - Math.random() * 200
  }, 2000)
}

onMounted(() => {
  initBalloons()
})
</script>

<style scoped>
.balloons-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.balloon {
  position: absolute;
  width: 80px;
  height: 100px;
  cursor: pointer;
  pointer-events: auto;
  animation: rise var(--rise-duration) ease-in var(--rise-delay) forwards,
             sway var(--sway-duration) ease-in-out var(--sway-delay) infinite;
  transform-origin: center bottom;
}

@keyframes rise {
  from {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: translateY(calc(-100vh - 200px)) rotate(0deg);
    opacity: 1;
  }
}

@keyframes sway {
  0%, 100% {
    transform: translateX(0) rotate(-3deg);
  }
  50% {
    transform: translateX(20px) rotate(3deg);
  }
}

.balloon-body {
  position: relative;
  width: 100%;
  height: 70%;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow:
    inset -10px -10px 30px rgba(0, 0, 0, 0.2),
    inset 5px 5px 15px rgba(255, 255, 255, 0.3),
    0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transform: scale(var(--size, 1));
}

.balloon-shine {
  position: absolute;
  top: 10%;
  left: 15%;
  width: 30%;
  height: 40%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  border-radius: 50%;
  transform: rotate(-30deg);
}

.balloon-string {
  position: absolute;
  bottom: -100%;
  left: 50%;
  width: 2px;
  background: linear-gradient(
    to bottom,
    rgba(100, 100, 100, 0.8),
    rgba(100, 100, 100, 0.2)
  );
  transform: translateX(-50%);
}

.balloon-pop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  animation: popText 1s ease-out forwards;
  pointer-events: none;
  white-space: nowrap;
}

@keyframes popText {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(1);
  }
}

@media (max-width: 768px) {
  .balloon {
    width: 60px;
    height: 80px;
  }

  .balloon-string {
    height: 40px !important;
  }
}
</style>