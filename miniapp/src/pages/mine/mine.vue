<template>
  <view class="page">
    <NavBar title="我的" variant="light" :show-logo="false" />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <view class="placeholder">
        <image
          class="placeholder-image"
          src="/static/figma-mine/Bl6Xc2XtW7QOmaCppJdb3Z_2049_898.png"
          mode="aspectFit"
        />
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
  background: #ffffff;
}

.page-content {
  min-height: 100vh;
  box-sizing: border-box;
  background: #ffffff;
}

/* Figma: Placeholder 375×490, center, padding top/bottom 120px */
.placeholder {
  height: 980rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 240rpx 48rpx;
  box-sizing: border-box;
}

.placeholder-image {
  width: 426rpx;
  height: 500rpx;
}
</style>
