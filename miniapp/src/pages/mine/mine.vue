<template>
  <view class="page">
    <NavBar />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <view class="mine-placeholder">
        <text class="placeholder-icon">👤</text>
        <text class="placeholder-text">个人中心</text>
        <text class="placeholder-sub">功能开发中，敬请期待</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '../../components/NavBar.vue'

const navHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight + 44
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.page-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200rpx);
}

.mine-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.placeholder-icon {
  font-size: 80rpx;
}

.placeholder-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.placeholder-sub {
  font-size: 24rpx;
  color: #999;
}
</style>
