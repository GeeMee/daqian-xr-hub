<template>
  <view class="page">
    <view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="hero-content">
        <view class="hero-badge">
          <text class="hero-badge-icon">🏆</text>
        </view>
        <text class="hero-title">票房榜单</text>
        <text class="hero-subtitle">当日实时热度排行</text>
        <text class="hero-date">{{ today }}</text>
      </view>
    </view>

    <view class="list-wrap">
      <scroll-view class="rank-list" scroll-y :show-scrollbar="false">
        <view v-if="rankList.length === 0" class="empty-state">
          <text class="empty-text">暂无数据</text>
        </view>
        <view
          v-for="(item, index) in rankList"
          :key="index"
          class="rank-item"
        >
          <view class="rank-num" :class="'rank-' + (index < 3 ? index : 'normal')">
            <text class="rank-num-text">{{ index + 1 }}</text>
          </view>
          <text class="rank-name">{{ item }}</text>
          <view class="rank-bar-wrap">
            <view
              class="rank-bar"
              :class="'bar-level-' + Math.min(index, 4)"
              :style="{ width: getBarWidth(index) + '%' }"
            ></view>
          </view>
        </view>
        <view class="footer-space"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../lib/api'

const statusBarHeight = ref(0)
const rankList = ref<string[]>([])
const today = ref('')

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  const now = new Date()
  today.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`

  try {
    rankList.value = await api.getSortList(0)
  } catch (e) {
    console.error('Failed to load ranking:', e)
  }
})

function getBarWidth(index: number): number {
  const total = rankList.value.length
  if (total === 0) return 0
  return Math.max(15, 100 - (index / total) * 85)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f7;
  display: flex;
  flex-direction: column;
}

.hero {
  background: linear-gradient(135deg, #065f46, #059669, #34d399);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -60rpx;
  left: -30rpx;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx 56rpx;
}

.hero-badge {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.hero-badge-icon {
  font-size: 40rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 4rpx;
}

.hero-subtitle {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.hero-date {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.list-wrap {
  flex: 1;
  margin-top: -24rpx;
  border-radius: 24rpx 24rpx 0 0;
  background: #f5f5f7;
  overflow: hidden;
  padding-top: 24rpx;
}

.rank-list {
  height: 100%;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 10rpx;
}

.rank-num {
  flex-shrink: 0;
  width: 44rpx;
  height: 44rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  background: #f0f0f2;
}

.rank-num-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #999;
}

.rank-0 {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.rank-0 .rank-num-text {
  color: #ffffff;
}

.rank-1 {
  background: linear-gradient(135deg, #9ca3af, #d1d5db);
}

.rank-1 .rank-num-text {
  color: #ffffff;
}

.rank-2 {
  background: linear-gradient(135deg, #b45309, #d97706);
}

.rank-2 .rank-num-text {
  color: #ffffff;
}

.rank-name {
  flex-shrink: 0;
  width: 240rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-bar-wrap {
  flex: 1;
  height: 20rpx;
  background: #f0f0f2;
  border-radius: 10rpx;
  overflow: hidden;
  margin-left: 16rpx;
}

.rank-bar {
  height: 100%;
  border-radius: 10rpx;
  transition: width 0.4s ease;
}

.bar-level-0 {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.bar-level-1 {
  background: linear-gradient(90deg, #f97316, #fb923c);
}

.bar-level-2 {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.bar-level-3 {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.bar-level-4 {
  background: linear-gradient(90deg, #60a5fa, #93c5fd);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.footer-space {
  height: 40rpx;
}
</style>
