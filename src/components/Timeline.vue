<template>
  <div class="timeline-section" ref="timelineSection">
    <h2 class="section-title">20年的精彩旅程</h2>
    <div class="timeline">
      <div
        v-for="(event, index) in timelineEvents"
        :key="event.year"
        class="timeline-item"
        :class="{ visible: visibleItems.includes(index), left: index % 2 === 0 }"
        :style="{ animationDelay: index * 0.2 + 's' }"
        @click="showDetail(event)"
      >
        <div class="timeline-marker">
          <div class="marker-dot"></div>
          <div class="marker-ring"></div>
        </div>
        <div class="timeline-content">
          <div class="timeline-year">{{ event.year }}</div>
          <div class="timeline-title">{{ event.title }}</div>
          <div class="timeline-description">{{ event.description }}</div>
        </div>
        <div class="timeline-icon" v-html="event.icon"></div>
      </div>
    </div>

    <transition name="fade">
      <div class="event-detail" v-if="selectedEvent" @click="selectedEvent = null">
        <div class="detail-card" @click.stop>
          <button class="close-detail" @click="selectedEvent = null">&times;</button>
          <div class="detail-icon" v-html="selectedEvent.icon"></div>
          <h3>{{ selectedEvent.year }} - {{ selectedEvent.title }}</h3>
          <p>{{ selectedEvent.detail }}</p>
          <div class="detail-tags">
            <span
              v-for="tag in selectedEvent.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timelineSection = ref(null)
const visibleItems = ref([])
const selectedEvent = ref(null)

const timelineEvents = [
  {
    year: 2006,
    title: '来到这个世界',
    description: '一个美好的开始',
    detail: '2006年的那一天，一个新生命来到了这个世界，为家庭带来了无尽的欢乐和希望。从那一刻起，生命中最精彩的旅程正式开始。',
    icon: '&#127880;',
    tags: ['新生', '希望', '开始']
  },
  {
    year: 2008,
    title: '迈出第一步',
    description: '学会走路',
    detail: '在家人的关爱中，你勇敢地迈出了人生的第一步。那摇摇晃晃的身影，是成长路上最珍贵的记忆。',
    icon: '&#128170;',
    tags: ['成长', '勇气', '第一步']
  },
  {
    year: 2010,
    title: '背上小书包',
    description: '开始上学',
    detail: '背上崭新的书包，走进校园，开启知识的大门。在教室里结交新朋友，在操场上尽情奔跑。',
    icon: '&#128218;',
    tags: ['学习', '友谊', '校园']
  },
  {
    year: 2014,
    title: '发现兴趣',
    description: '找到热情所在',
    detail: '在不断的探索中，发现了自己真正热爱的事物。这份热情将伴随你走过未来的每一个日夜。',
    icon: '&#11088;',
    tags: ['兴趣', '热情', '发现']
  },
  {
    year: 2018,
    title: '青春期的开始',
    description: '变得更加独立',
    detail: '青春期的到来带来了许多变化，也带来了更多的思考。你开始形成自己的世界观和价值观。',
    icon: '&#128148;',
    tags: ['青春', '独立', '思考']
  },
  {
    year: 2022,
    title: '人生新阶段',
    description: '迎接新的挑战',
    detail: '进入人生的新阶段，面对新的环境和挑战。你展现出了惊人的适应能力和坚韧不拔的精神。',
    icon: '&#127881;',
    tags: ['挑战', '成长', '突破']
  },
  {
    year: 2026,
    title: '二十岁',
    description: '最美的年华',
    detail: '20岁，是青春最美好的时光。带着前20年的积累，带着对未来的憧憬，正式踏入人生的新篇章。愿你的20岁精彩纷呈！',
    icon: '&#127942;',
    tags: ['20岁', '青春', '庆典']
  }
]

let observer

const handleScroll = () => {
  const section = timelineSection.value
  if (!section) return

  const rect = section.getBoundingClientRect()
  const sectionTop = rect.top
  const sectionHeight = rect.height

  if (sectionTop < window.innerHeight * 0.8) {
    timelineEvents.forEach((_, index) => {
      if (!visibleItems.value.includes(index)) {
        const delay = (index - visibleItems.value.length) * 0.2
        setTimeout(() => {
          visibleItems.value.push(index)
        }, delay * 1000)
      }
    })
  }
}

const showDetail = (event) => {
  selectedEvent.value = event
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.timeline-section {
  position: relative;
  z-index: 10;
  padding: 80px 20px;
  min-height: 100vh;
  background: linear-gradient(180deg, transparent 0%, rgba(26, 26, 46, 0.8) 30%, rgba(26, 26, 46, 0.9) 100%);
}

.section-title {
  font-family: 'Great Vibes', cursive;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 60px;
  background: linear-gradient(135deg, #ffd700, #ff69b4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #ffd700, #ff69b4, #4ecdc4);
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  width: 45%;
  padding: 20px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  cursor: pointer;
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.5s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-item.left {
  margin-left: 0;
  transform: translateX(-50px);
}

.timeline-item:not(.left) {
  margin-left: 55%;
  transform: translateX(50px);
}

.timeline-item.visible {
  opacity: 1;
  transform: translateX(0);
}

.timeline-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.timeline-item.left:hover {
  transform: translateX(0) scale(1.02);
}

.timeline-marker {
  position: absolute;
  top: 30px;
  width: 20px;
  height: 20px;
}

.timeline-item.left .timeline-marker {
  right: -10px;
}

.timeline-item:not(.left) .timeline-marker {
  left: -10px;
}

.marker-dot {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ffd700, #ff69b4);
  border-radius: 50%;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.marker-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border: 2px solid #ffd700;
  border-radius: 50%;
  opacity: 0;
  animation: ringPulse 2s ease-out infinite;
}

.timeline-item.visible .marker-ring {
  animation-delay: 0.5s;
}

@keyframes ringPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.timeline-content {
  padding: 0 15px;
}

.timeline-year {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffd700;
  font-family: 'Poppins', sans-serif;
}

.timeline-title {
  font-size: 1.3rem;
  color: white;
  margin: 10px 0;
  font-weight: 600;
}

.timeline-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.timeline-icon {
  position: absolute;
  top: 20px;
  font-size: 1.5rem;
}

.timeline-item.left .timeline-icon {
  right: 20px;
}

.timeline-item:not(.left) .timeline-icon {
  left: 20px;
}

/* 详情卡片 */
.event-detail {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.detail-card {
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.95));
  padding: 40px;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  position: relative;
  border: 1px solid rgba(255, 215, 0, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.close-detail {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-detail:hover {
  color: #ffd700;
}

.detail-icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 20px;
  animation: iconBounce 1s ease infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.detail-card h3 {
  font-family: 'Great Vibes', cursive;
  font-size: 2rem;
  color: #ffd700;
  text-align: center;
  margin-bottom: 20px;
}

.detail-card p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  text-align: center;
  margin-bottom: 20px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.tag {
  padding: 5px 15px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 105, 180, 0.2));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  font-size: 0.85rem;
  color: #ffd700;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .timeline::before {
    left: 20px;
  }

  .timeline-item {
    width: calc(100% - 50px);
    margin-left: 50px !important;
  }

  .timeline-item.left .timeline-marker,
  .timeline-item:not(.left) .timeline-marker {
    left: -10px;
    right: auto;
  }

  .timeline-item.left,
  .timeline-item:not(.left) {
    transform: translateX(50px);
  }

  .timeline-item.visible {
    transform: translateX(0);
  }

  .section-title {
    font-size: 2rem;
  }

  .timeline-year {
    font-size: 1.8rem;
  }
}
</style>