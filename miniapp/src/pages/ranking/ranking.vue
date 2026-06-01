<template>
  <view class="page">
    <NavBar />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <view class="header">
        <text class="title">票房榜单</text>
        <text class="date">{{ today }}</text>
      </view>

      <scroll-view class="rank-list" scroll-y :show-scrollbar="false">
        <view v-if="rankList.length === 0" class="empty-state">
          <text class="empty-text">暂无数据</text>
        </view>
        <view
          v-for="(item, index) in rankList"
          :key="index"
          class="rank-item"
        >
          <view class="rank-num" :class="{ top: index < 3 }">
            <text class="rank-num-text">{{ index + 1 }}</text>
          </view>
          <view class="rank-info">
            <text class="rank-name">{{ item }}</text>
            <view class="rank-bar-bg">
              <view
                class="rank-bar"
                :class="'bar-' + Math.min(index, 4)"
                :style="{ width: getBarWidth(index) + '%' }"
              ></view>
            </view>
          </view>
        </view>
        <view class="footer-space"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '../../components/NavBar.vue'
import { api } from '../../lib/api'

const navHeight = ref(0)
const rankList = ref<string[]>([])
const today = ref('')

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight + 44

  const now = new Date()
  today.value = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`

  try {
    rankList.value = await api.getSortList(0)
  } catch (e) {
    console.error('Failed to load ranking:', e)
  }
})

function getBarWidth(index: number): number {
  const total = rankList.value.length
  if (total === 0) return 0
  return Math.max(20, 100 - (index / total) * 80)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.page-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.header {
  padding: 32rpx 32rpx 24rpx;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.date {
  font-size: 24rpx;
  color: #999;
}

.rank-list {
  flex: 1;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 24rpx 16rpx;
  background: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.rank-num {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.rank-num-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #999;
}

.rank-num.top .rank-num-text {
  color: #f59e0b;
}

.rank-info {
  flex: 1;
  overflow: hidden;
}

.rank-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.rank-bar-bg {
  height: 16rpx;
  background: #f0f0f2;
  border-radius: 8rpx;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.bar-0 {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.bar-1 {
  background: linear-gradient(90deg, #f97316, #fb923c);
}

.bar-2 {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.bar-3 {
  background: linear-gradient(90deg, #34d399, #6ee7b7);
}

.bar-4 {
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
