<template>
  <view class="navbar" :class="[`navbar-${variant}`]" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content">
      <view class="navbar-left">
        <image v-if="showLogo" class="logo" src="/static/logo.png" mode="aspectFit" />
      </view>
      <view class="navbar-title">{{ title }}</view>
      <view class="navbar-right"></view>
    </view>
  </view>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'

withDefaults(defineProps<{
  title?: string
  variant?: 'transparent' | 'light'
  showLogo?: boolean
}>(), {
  title: '大千迷境XR影院',
  variant: 'transparent',
  showLogo: true,
})

const statusBarHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})
</script>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: transparent;
  z-index: 1000;
}

.navbar-light {
  background: linear-gradient(180deg, #a1ded2 0%, #ffffff 100%);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}

.navbar-left,
.navbar-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
}

.logo {
  width: 60rpx;
  height: 60rpx;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}

.navbar-light .navbar-title {
  font-size: 32rpx;
  color: #1a211e;
}
</style>
