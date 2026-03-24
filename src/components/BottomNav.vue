<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="nav-item"
      :class="{ active: activeSection === item.id }"
      @click="scrollToSection(item.id)"
    >
      <span class="nav-icon" v-html="item.icon"></span>
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeSection = ref('home')
const navItems = [
  { id: 'home', label: '首页', icon: '&#127968;' },
  { id: 'cake', label: '蛋糕', icon: '&#127874;' },
  { id: 'timeline', label: '时光', icon: '&#128197;' },
  { id: 'wish', label: '许愿', icon: '&#10024;' }
]

const scrollToSection = (id) => {
  activeSection.value = id

  const sectionMap = {
    'home': document.querySelector('.birthday-app'),
    'cake': document.getElementById('cake'),
    'timeline': document.getElementById('timeline'),
    'wish': document.getElementById('wish')
  }

  const element = sectionMap[id]
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight / 2

  // 根据滚动位置更新 activeSection
  const sections = ['home', 'cake', 'timeline', 'wish']
  for (let i = sections.length - 1; i >= 0; i--) {
    const element = document.getElementById(sections[i])
    if (element && element.offsetTop <= scrollPosition) {
      activeSection.value = sections[i]
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(30, 30, 50, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background: transparent;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.nav-item:hover {
  background: rgba(255, 215, 0, 0.1);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 105, 180, 0.3));
}

.nav-item.active .nav-icon {
  transform: scale(1.2);
}

.nav-item.active .nav-label {
  color: #ffd700;
}

.nav-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.nav-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .bottom-nav {
    padding: 8px 15px;
    gap: 5px;
  }

  .nav-item {
    padding: 8px 10px;
    min-width: 50px;
  }

  .nav-icon {
    font-size: 1.2rem;
  }

  .nav-label {
    font-size: 0.65rem;
  }
}
</style>