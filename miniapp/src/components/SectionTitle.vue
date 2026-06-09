<template>
  <view class="section-title">
    <view class="title-line"></view>
    <text class="title-text">{{ title }}</text>
    <view class="title-line"></view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0 24rpx;
}

.title-line {
  width: 48rpx;
  height: 2rpx;
  background-color: #b8eae0;
}

.title-text {
  margin: 0 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 2rpx;
}
</style>
