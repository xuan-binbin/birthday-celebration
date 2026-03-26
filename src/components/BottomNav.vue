<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.id"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <span class="nav-icon" v-html="item.icon"></span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { id: 'home', path: '/', label: '首页', icon: '&#127968;' },
  { id: 'cake', path: '/cake', label: '蛋糕', icon: '&#127874;' },
  { id: 'timeline', path: '/timeline', label: '时光', icon: '&#128197;' },
  { id: 'wish', path: '/wish', label: '许愿', icon: '&#10024;' }
]

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 12px 25px;
  background: rgba(20, 10, 40, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 35px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 
    0 10px 50px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(255, 215, 0, 0.2);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  background: transparent;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 65px;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 107, 107, 0.25));
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.nav-item.active .nav-icon {
  transform: scale(1.3);
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
}

.nav-item.active .nav-label {
  color: #ffd700;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.nav-icon {
  font-size: 1.6rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
}

.nav-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
  transition: all 0.4s ease;
  letter-spacing: 0.5px;
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