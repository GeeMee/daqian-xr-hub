<template>
  <view class="navbar" :class="[`navbar-${variant}`]" :style="{ paddingTop: statusBarHeight + 'px' }">
    <image
      v-if="variant === 'transparent'"
      class="navbar-texture"
      src="/static/bg-texture.png"
      mode="aspectFill"
    />
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
  overflow: hidden;
  z-index: 1000;
}

/* 顶部花纹层：仅透明标头使用，与首页 .page-bg-brand 参数一致，
   由 .navbar 的 overflow:hidden 裁剪成标头顶部切片，使花纹从最顶端开始 */
.navbar-texture {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 720rpx;
  opacity: 0.55;
  z-index: 0;
}

/* 透明导航栏需用品牌渐变封住顶部，避免列表上滑时内容透出状态栏区域。
   渐变与首页 .page-bg-gradient 完全一致并对齐顶部（background-size 取其高度），
   使导航栏成为渐变顶部切片，既无缝衔接又能遮挡滚动内容。 */
.navbar-transparent {
  background-image: linear-gradient(180deg, #10a997 0%, #75d2c5 46%, #dff4ee 76%, #f7f9f8 100%);
  background-size: 100% 820rpx;
  background-repeat: no-repeat;
}

.navbar-light {
  background: linear-gradient(180deg, #a1ded2 0%, #ffffff 100%);
}

.navbar-content {
  position: relative;
  z-index: 1;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.navbar-light .navbar-title {
  font-size: 32rpx;
  color: #1a211e;
}
</style>
