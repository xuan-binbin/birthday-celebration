<template>
  <div class="timeline-page">
    <StarsBackground />
    <div class="timeline-content">
      <Timeline />
    </div>
  </div>
</template>

<script setup>
import StarsBackground from '../components/StarsBackground.vue'
import Timeline from '../components/Timeline.vue'
</script>

<style scoped>
.timeline-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.timeline-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  padding: 40px 20px;
}
</style>
