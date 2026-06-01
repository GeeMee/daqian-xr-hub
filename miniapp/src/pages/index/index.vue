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

      <!-- 推荐区域 -->
      <view class="section recommend-section">
        <view class="section-header">
          <view class="section-tabs">
            <text
              class="section-tab"
              :class="{ active: recommendTab === 'showing' }"
              @click="recommendTab = 'showing'"
            >热映推荐</text>
            <text
              class="section-tab"
              :class="{ active: recommendTab === 'upcoming' }"
              @click="recommendTab = 'upcoming'"
            >待映推荐</text>
          </view>
          <text class="all-films-link" @click="goAllFilms">全部影片</text>
        </view>
        <scroll-view class="recommend-scroll" scroll-x :show-scrollbar="false">
          <view class="recommend-track">
            <view
              v-for="(column, idx) in activeRecommendColumns"
              :key="idx"
              class="recommend-column"
            >
              <view
                v-for="product in column"
                :key="product.id"
                class="recommend-card"
                @click="goDetail(product.id)"
              >
                <view class="recommend-cover">
                  <image class="cover-image" :src="product.poster" mode="aspectFit" />
                </view>
                <view class="recommend-info">
                  <text class="recommend-name">{{ product.name }}</text>
                  <text class="recommend-desc">{{ product.shortDesc }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
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
import { ref, computed, onMounted } from 'vue'
import NavBar from '../../components/NavBar.vue'
import SectionTitle from '../../components/SectionTitle.vue'
import { api } from '../../lib/api'

const navHeight = ref(0)
const recommendTab = ref<'showing' | 'upcoming'>('showing')
const homeData = ref<{ banners: any[]; recommendedProducts: any[]; newProducts: any[] }>({
  banners: [],
  recommendedProducts: [],
  newProducts: [],
})
const upcomingRecommended = ref<any[]>([])

const recommendColumns = computed(() => {
  const list = homeData.value.recommendedProducts
  const cols: any[][] = []
  for (let i = 0; i < list.length; i += 3) {
    cols.push(list.slice(i, i + 3))
  }
  return cols
})

const upcomingColumns = computed(() => {
  const list = upcomingRecommended.value
  const cols: any[][] = []
  for (let i = 0; i < list.length; i += 3) {
    cols.push(list.slice(i, i + 3))
  }
  return cols
})

const activeRecommendColumns = computed(() => {
  return recommendTab.value === 'showing' ? recommendColumns.value : upcomingColumns.value
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

  try {
    const upcomingRes = await api.getUpcoming()
    upcomingRecommended.value = upcomingRes.recommended
  } catch (e) {
    console.error('Failed to load upcoming:', e)
  }
})

function goDetail(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}

function goAllFilms() {
  uni.switchTab({ url: '/pages/products/products' })
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

.section-tabs {
  display: flex;
  gap: 32rpx;
  align-items: center;
}

.section-tab {
  font-size: 30rpx;
  font-weight: 500;
  color: #999;
  position: relative;
  padding-bottom: 14rpx;
  line-height: 1;
  transition: color 0.2s, font-weight 0.2s;
}

.section-tab.active {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.section-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 5rpx;
  border-radius: 2.5rpx;
  background: linear-gradient(90deg, #34d399, #6ee7b7);
}

/* 全部影片链接 */
.all-films-link {
  font-size: 24rpx;
  color: #666;
  letter-spacing: 1rpx;
}

/* 本月推荐 - 3 行网格，超出向右滚动 */
.recommend-section {
  padding: 0;
}

.recommend-section .section-header {
  padding: 32rpx 24rpx 20rpx;
}

.recommend-scroll {
  width: 100%;
  white-space: nowrap;
}

.recommend-track {
  display: inline-flex;
  gap: 14rpx;
  padding: 0 24rpx 8rpx;
  align-items: flex-start;
}

.recommend-column {
  flex-shrink: 0;
  width: 440rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.recommend-card {
  width: 100%;
  display: flex;
  background: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  white-space: normal;
}

.recommend-cover {
  flex-shrink: 0;
  width: 120rpx;
  height: 160rpx;
  background: #f0f0f2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.recommend-info {
  flex: 1;
  padding: 14rpx 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.recommend-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.recommend-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #888;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
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
