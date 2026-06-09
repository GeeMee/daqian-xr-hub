<script setup lang="ts">
const appReady = true
</script>

<style>
/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.tap-feedback {
  transition: transform 0.12s ease, opacity 0.12s ease;
}

.tap-feedback-hover {
  transform: scale(0.98);
  opacity: 0.86;
}

.skeleton-block {
  position: relative;
  overflow: hidden;
  background: #eef1f0;
}

.skeleton-block::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { left: -60%; }
  100% { left: 120%; }
}

@keyframes fade-up-soft {
  0% {
    opacity: 0;
    transform: translateY(16rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-soft {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes scale-in-soft {
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
