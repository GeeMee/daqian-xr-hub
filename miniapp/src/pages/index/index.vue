<template>
  <view class="page">
    <NavBar />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <!-- 轮播图 -->
      <view v-if="homeData.banners.length > 0" class="banner-section">
        <swiper
          class="banner-swiper"
          :autoplay="homeData.banners.length > 1"
          :interval="3000"
          :circular="true"
          :indicator-dots="homeData.banners.length > 1"
          indicator-color="rgba(255,255,255,0.4)"
          indicator-active-color="#ffffff"
        >
          <swiper-item v-for="banner in homeData.banners" :key="banner.id" @click="goDetail(banner.productId)">
            <image class="banner-image" :src="banner.image" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </view>

      <!-- 本月推荐 -->
      <view v-if="homeData.recommendedProducts.length > 0" class="section">
        <view class="section-header">
          <text class="section-header-title">本月推荐</text>
          <text class="section-header-stars">★★★★★</text>
        </view>
        <view class="recommend-list">
          <view
            v-for="product in homeData.recommendedProducts"
            :key="product.id"
            class="recommend-item"
            @click="goDetail(product.id)"
          >
            <view class="recommend-text">
              <text class="recommend-name">{{ product.name }}</text>
              <text class="recommend-desc">{{ product.shortDesc }}</text>
            </view>
            <view class="recommend-thumb">
              <image class="thumb-image" :src="product.poster" mode="aspectFill" />
            </view>
          </view>
        </view>
      </view>

      <!-- 近期上新 -->
      <view v-if="homeData.newProducts.length > 0" class="section">
        <SectionTitle title="近期上新" />
        <view class="new-list">
          <view
            v-for="product in homeData.newProducts"
            :key="product.id"
            class="new-card"
            @click="goDetail(product.id)"
          >
            <view class="new-poster-wrap">
              <image class="new-poster" :src="product.poster" mode="aspectFill" />
            </view>
            <view class="new-info">
              <text class="new-name">{{ product.name }}</text>
              <text class="new-date">上线日期：{{ product.onlineDate }}</text>
              <text class="new-desc">{{ stripHtml(product.description) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="footer-space"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '../../components/NavBar.vue'
import SectionTitle from '../../components/SectionTitle.vue'
import { api } from '../../lib/api'

const navHeight = ref(0)
const homeData = ref<{ banners: any[]; recommendedProducts: any[]; newProducts: any[] }>({
  banners: [],
  recommendedProducts: [],
  newProducts: [],
})

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight + 44

  try {
    const data = await api.getHomeData()
    homeData.value = {
      banners: data.banners,
      recommendedProducts: data.recommended,
      newProducts: data.recent,
    }
  } catch (e) {
    console.error('Failed to load home data:', e)
  }
})

function goDetail(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '')
}

function getTagClass(tag: string): string {
  if (tag === '爆款') return 'tag-hot'
  if (tag === '新品') return 'tag-new'
  if (tag === '限时特惠') return 'tag-sale'
  return ''
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.page-content {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 轮播图 */
.banner-section {
  padding: 20rpx 24rpx 0;
}

.banner-swiper {
  width: 100%;
  height: 340rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

/* 区块 */
.section {
  padding: 0 24rpx;
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0 20rpx;
}

.section-header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.section-header-stars {
  font-size: 24rpx;
  color: #fa8c16;
}

/* 本月推荐 */
.recommend-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rpx;
  background: #e5e5e5;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  overflow: hidden;
}

.recommend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 24rpx 20rpx;
  min-height: 140rpx;
}

.recommend-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-right: 16rpx;
}

.recommend-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
}

.recommend-desc {
  font-size: 22rpx;
  color: #999;
  line-height: 1.4;
}

.recommend-thumb {
  flex-shrink: 0;
  width: 90rpx;
  height: 120rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.thumb-image {
  width: 100%;
  height: 100%;
}

/* 近期上新 */
.new-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.new-card {
  display: flex;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.new-poster-wrap {
  flex-shrink: 0;
  width: 180rpx;
  height: 240rpx;
}

.new-poster {
  width: 100%;
  height: 100%;
}

.new-info {
  flex: 1;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.new-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.new-date {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.new-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.footer-space {
  height: 40rpx;
}
</style>
