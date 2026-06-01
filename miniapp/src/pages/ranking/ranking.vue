<template>
  <view class="page">
    <view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="hero-content">
        <text class="hero-title">票房榜单</text>
      </view>
    </view>

    <view class="sub-header">
      <text class="sub-header-text">按用户交易数据排序 · 每日更新</text>
    </view>

    <scroll-view class="rank-list" scroll-y :show-scrollbar="false">
      <view v-if="rankedProducts.length === 0" class="empty-state">
        <text class="empty-text">暂无数据</text>
      </view>
      <view
        v-for="(item, index) in rankedProducts"
        :key="index"
        class="rank-item"
        @click="goDetail(item.id)"
      >
        <view class="rank-badge" :class="'badge-' + (index < 3 ? index : 'normal')">
          <text class="badge-text">{{ index + 1 }}</text>
        </view>
        <view class="rank-poster">
          <image class="poster-img" :src="item.poster" mode="aspectFill" />
        </view>
        <view class="rank-info">
          <text class="rank-name">{{ item.name }}</text>
          <text class="rank-duration">时长：{{ item.duration }}</text>
          <text v-if="item.shortDesc" class="rank-desc">{{ item.shortDesc }}</text>
        </view>
        <view class="detail-btn" @click.stop="goDetail(item.id)">
          <text class="detail-btn-text">详情</text>
        </view>
      </view>
      <view class="footer-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../lib/api'

const statusBarHeight = ref(0)
const rankedProducts = ref<any[]>([])

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  try {
    const [sortList, prodRes] = await Promise.all([
      api.getSortList(0),
      api.getProducts({ status: 'on' }),
    ])
    const products = prodRes.data
    const result: any[] = []
    for (const name of sortList) {
      const match = products.find(
        (p: any) => p.name === name || p.name.includes(name) || name.includes(p.name)
      )
      if (match && !result.find((r) => r.id === match.id)) {
        result.push(match)
      }
    }
    // 添加未匹配到的产品到末尾
    for (const p of products) {
      if (!result.find((r) => r.id === p.id)) {
        result.push(p)
      }
    }
    rankedProducts.value = result
  } catch (e) {
    // silently fail
  }
})

function goDetail(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.hero {
  background: linear-gradient(180deg, #0f2e0f, #1a4a1a, #0f2e0f);
  position: relative;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56rpx 32rpx 64rpx;
}

.hero-title {
  font-size: 52rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 8rpx;
}

.sub-header {
  background: #ffffff;
  padding: 20rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.sub-header-text {
  font-size: 22rpx;
  color: #999;
}

.rank-list {
  flex: 1;
  padding: 0;
  box-sizing: border-box;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;
}

.rank-badge {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.badge-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #ffffff;
}

.badge-0 {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.badge-1 {
  background: linear-gradient(135deg, #9ca3af, #d1d5db);
}

.badge-1 .badge-text {
  color: #ffffff;
}

.badge-2 {
  background: linear-gradient(135deg, #b45309, #d97706);
}

.badge-normal {
  background: #e5e7eb;
}

.badge-normal .badge-text {
  color: #666;
}

.rank-poster {
  flex-shrink: 0;
  width: 180rpx;
  height: 240rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-right: 20rpx;
}

.poster-img {
  width: 100%;
  height: 100%;
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-right: 16rpx;
}

.rank-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.rank-duration {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.rank-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.detail-btn {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  background: #1a1a1a;
  border-radius: 24rpx;
}

.detail-btn-text {
  font-size: 24rpx;
  color: #ffffff;
  line-height: 1;
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
