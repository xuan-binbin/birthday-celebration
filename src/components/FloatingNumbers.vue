<template>
  <div class="floating-numbers">
    <div
      v-for="num in numbers"
      :key="num.id"
      class="number"
      :class="[`number-${num.id}`, { clicked: num.clicked }]"
      :style="{
        left: num.x + '%',
        top: num.y + '%',
        '--delay': num.delay + 's',
        '--duration': num.duration + 's',
        '--x-offset': num.xOffset + 'px',
        '--y-offset': num.yOffset + 'px',
        fontSize: num.size + 'px',
        color: num.color,
        opacity: num.opacity
      }"
      @click="handleClick(num)"
    >
      {{ num.value }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const numbers = ref([])

// 初始化数字
const initNumbers = () => {
  const numberData = [
    { value: '2', id: 1 },
    { value: '0', id: 2 }
  ]

  const colors = [
    '#ffd700', '#ff69b4', '#4ecdc4', '#ff6b6b',
    '#ffe66d', '#00d2d3', '#ff9ff3', '#feca57'
  ]

  numberData.forEach((num, index) => {
    const baseX = index === 0 ? 25 : 65

    numbers.value.push({
      ...num,
      x: baseX + (Math.random() - 0.5) * 10,
      y: 15 + Math.random() * 20,
      size: 80 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: index * 0.5,
      duration: 8 + Math.random() * 4,
      xOffset: (Math.random() - 0.5) * 100,
      yOffset: Math.random() * 50 + 20,
      opacity: 0.15,
      rotation: (Math.random() - 0.5) * 30,
      clicked: false
    })
  })

  // 添加装饰性数字
  for (let i = 0; i < 8; i++) {
    numbers.value.push({
      value: Math.random() > 0.5 ? '2' : '0',
      id: i + 10,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 10 + Math.random() * 5,
      xOffset: (Math.random() - 0.5) * 150,
      yOffset: Math.random() * 80,
      opacity: 0.08,
      rotation: (Math.random() - 0.5) * 45,
      clicked: false
    })
  }
}

// 处理点击
const handleClick = (num) => {
  num.clicked = true
  num.size = num.size * 1.5
  num.opacity = 1

  setTimeout(() => {
    num.clicked = false
    num.size = num.size / 1.5
    num.opacity = 0.15
  }, 500)
}

onMounted(() => {
  initNumbers()
})
</script>

<style scoped>
.floating-numbers {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.number {
  position: absolute;
  font-family: 'Great Vibes', cursive;
  font-weight: bold;
  text-shadow: 0 0 20px currentColor;
  animation: floatNumber var(--duration) ease-in-out var(--delay) infinite;
  transform: rotate(var(--rotation));
  transition: all 0.3s ease;
  cursor: pointer;
  pointer-events: auto;
}

.number:hover {
  transform: rotate(var(--rotation)) scale(1.2);
  text-shadow: 0 0 40px currentColor;
}

.number.clicked {
  animation: pulseNumber 0.5s ease-out;
}

@keyframes floatNumber {
  0%, 100% {
    transform: rotate(var(--rotation)) translate(0, 0);
  }
  25% {
    transform: rotate(calc(var(--rotation) + 5deg)) translate(var(--x-offset), var(--y-offset));
  }
  50% {
    transform: rotate(var(--rotation)) translate(calc(var(--x-offset) * 0.5), calc(var(--y-offset) * -1));
  }
  75% {
    transform: rotate(calc(var(--rotation) - 5deg)) translate(calc(var(--x-offset) * -0.5), calc(var(--y-offset) * 0.5));
  }
}

@keyframes pulseNumber {
  0% {
    transform: rotate(var(--rotation)) scale(1);
    text-shadow: 0 0 20px currentColor;
  }
  50% {
    transform: rotate(var(--rotation)) scale(1.5);
    text-shadow: 0 0 60px currentColor, 0 0 100px currentColor;
  }
  100% {
    transform: rotate(var(--rotation)) scale(1);
    text-shadow: 0 0 20px currentColor;
  }
}

@media (max-width: 768px) {
  .number {
    font-size: 60px !important;
  }
}
</style>