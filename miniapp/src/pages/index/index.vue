<template>
  <view class="page">
    <view class="page-bg-gradient" />
    <image
      class="page-bg-brand"
      src="/static/bg-texture.png"
      mode="aspectFill"
    />
    <view class="page-bg-fade" />
    <NavBar />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <!-- 轮播图 -->
      <view v-if="isHomeLoading" class="banner-section">
        <view class="banner-skeleton skeleton-block"></view>
      </view>
      <view v-else-if="homeData.banners.length > 0" class="banner-section">
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
            <image class="banner-image tap-feedback" hover-class="tap-feedback-hover" :src="ossImg(banner.image, 750)" mode="aspectFill" lazy-load />
          </swiper-item>
        </swiper>
      </view>

      <!-- 推荐区域 -->
      <view class="recommend-section">
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
          <text class="all-films-link" @click="goAllFilms">全部影片 ›</text>
        </view>
        <scroll-view class="recommend-scroll" scroll-x :show-scrollbar="false">
          <view class="recommend-track">
            <view
              v-for="(column, idx) in activeRecommendColumns"
              :key="idx"
              class="recommend-column"
            >
              <view
                v-for="(product, index) in column"
                :key="product.id"
                class="recommend-card tap-feedback"
                :class="getHomeDelayClass(index + idx * 3)"
                hover-class="tap-feedback-hover"
                @click="goDetail(product.id)"
              >
                <view class="recommend-cover">
                  <image class="cover-image" :src="posterImg(product.poster, 300)" mode="aspectFill" lazy-load />
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
      <view v-if="homeData.newProducts.length > 0" class="section new-section-wrapper">
        <SectionTitle title="近期上新" />
        <view class="new-list">
          <view
            v-for="(product, index) in homeData.newProducts"
            :key="product.id"
            class="new-card tap-feedback"
            :class="getHomeDelayClass(index)"
            hover-class="tap-feedback-hover"
            @click="goDetail(product.id)"
          >
            <view class="new-poster-wrap">
              <image class="new-poster" :src="posterImg(product.poster, 400)" mode="aspectFill" lazy-load />
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
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import NavBar from '../../components/NavBar.vue'
import SectionTitle from '../../components/SectionTitle.vue'
import { api } from '../../lib/api'
import { ossImg, posterImg } from '../../lib/image'

const navHeight = ref(0)
const isHomeLoading = ref(true)
const recommendTab = ref<'showing' | 'upcoming'>('showing')
const homeData = ref<{ banners: any[]; recommendedProducts: any[]; newProducts: any[] }>({
  banners: [],
  recommendedProducts: [],
  newProducts: [],
})
const upcomingRecommended = ref<any[]>([])

// 推荐位每列 3 个，一屏正好 4 列（列宽见样式），超过 12 个横向滑动查看
const RECOMMEND_ROWS = 3

function toColumns(list: any[]) {
  const cols: any[][] = []
  for (let i = 0; i < list.length; i += RECOMMEND_ROWS) {
    cols.push(list.slice(i, i + RECOMMEND_ROWS))
  }
  return cols
}

const recommendColumns = computed(() => toColumns(homeData.value.recommendedProducts))

const upcomingColumns = computed(() => toColumns(upcomingRecommended.value))

const activeRecommendColumns = computed(() => {
  return recommendTab.value === 'showing' ? recommendColumns.value : upcomingColumns.value
})

// tab 页只创建一次，后台改了产品名/海报后不刷新会一直显示旧内容（详情页每次都是新拉的，
// 于是出现「列表名字和详情页对不上」）。这里在页面重新展示且数据超过 REFRESH_INTERVAL 时静默重拉。
const REFRESH_INTERVAL = 30 * 1000
let lastLoadedAt = 0

async function loadHome() {
  const [homeRes, upcomingRes] = await Promise.allSettled([
    api.getHomeData(),
    api.getUpcoming(),
  ])

  if (homeRes.status === 'fulfilled') {
    const data = homeRes.value
    homeData.value = {
      banners: data.banners,
      recommendedProducts: data.recommended,
      newProducts: data.recent,
    }
  } else {
    console.error('Failed to load home data:', homeRes.reason)
  }

  if (upcomingRes.status === 'fulfilled') {
    upcomingRecommended.value = upcomingRes.value.recommended
  } else {
    console.error('Failed to load upcoming:', upcomingRes.reason)
  }

  lastLoadedAt = Date.now()
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight + 44

  await loadHome()
  isHomeLoading.value = false
})

// 从详情页返回 / 切回该 tab 时静默刷新（不显示骨架屏）
onShow(() => {
  if (!lastLoadedAt || Date.now() - lastLoadedAt < REFRESH_INTERVAL) return
  loadHome()
})

function getHomeDelayClass(index: number) {
  return `home-delay-${Math.min(index, 8)}`
}

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

const SHARE_TITLE = '大千迷境XR影院 · 沉浸式观影体验'

// 分享卡片封面：优先用首页第一张轮播图，没有则返回空（让微信自动截图）
function getShareImage(): string {
  const firstBanner = homeData.value.banners[0]
  return firstBanner?.image ? ossImg(firstBanner.image, 750) : ''
}

// 转发给朋友（右上角"···"菜单 → 转发）
onShareAppMessage(() => {
  const imageUrl = getShareImage()
  return {
    title: SHARE_TITLE,
    path: '/pages/index/index',
    ...(imageUrl ? { imageUrl } : {}),
  }
})

// 分享到朋友圈（需基础库 2.11.3+）
onShareTimeline(() => {
  const imageUrl = getShareImage()
  return {
    title: SHARE_TITLE,
    query: '',
    ...(imageUrl ? { imageUrl } : {}),
  }
})

</script>

<style scoped lang="scss">
@keyframes home-fade-up-card {
  0% {
    opacity: 0.18;
    transform: translateY(34rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes home-fade-up {
  0% {
    opacity: 0;
    transform: translateY(34rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes home-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.page {
  min-height: 100vh;
  background-color: #f7f9f8;
  position: relative;
}

/* 顶部品牌背景：渐变底色 + 纹理图 + 底部淡出，贴近 Figma 表头 */
.page-bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 820rpx;
  z-index: 0;
  background: linear-gradient(180deg, #10a997 0%, #75d2c5 46%, #dff4ee 76%, #f7f9f8 100%);
}

.page-bg-brand {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 720rpx;
  z-index: 0;
  opacity: 0.55;
}

.page-bg-fade {
  position: fixed;
  top: 420rpx;
  left: 0;
  right: 0;
  height: 360rpx;
  z-index: 0;
  background: linear-gradient(180deg, rgba(247, 249, 248, 0) 0%, #f7f9f8 92%);
}

.page-content {
  position: relative;
  z-index: 1;
  padding-bottom: env(safe-area-inset-bottom);
}

/* 轮播图 */
.banner-section {
  padding: 20rpx 24rpx 0;
  animation: home-fade-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.banner-swiper,
.banner-skeleton {
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
  color: #1a211e;
}

.section-tabs {
  display: flex;
  gap: 32rpx;
  align-items: flex-start;
}

.section-tab {
  font-size: 30rpx;
  font-weight: 500;
  color: #868e8b;
  position: relative;
  padding-bottom: 10rpx;
  line-height: 36rpx;
  transition: color 0.2s, font-weight 0.2s;
}

.section-tab.active {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a211e;
}

.section-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: linear-gradient(90deg, #12a594, #a1ded2);
}

/* 全部影片链接 */
.all-films-link {
  width: 110rpx;
  height: 36rpx;
  font-size: 24rpx;
  font-weight: 400;
  color: #868e8b;
  line-height: 29rpx;
  text-align: center;
  padding-bottom: 8rpx;
  box-sizing: border-box;
}

/* 推荐区 - 白底圆角卡片包裹，严格按 Figma: margin 0 24rpx, 无额外padding */
.recommend-section {
  margin: 16rpx 24rpx 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  animation: home-fade-up 0.52s cubic-bezier(0.2, 0.8, 0.2, 1) 0.08s both;
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
  height: 512rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.recommend-card {
  width: 100%;
  height: 160rpx;
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
  height: 160rpx;
  padding: 14rpx 16rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
  overflow: hidden;
}

.recommend-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #1a211e;
  line-height: 31rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.recommend-desc {
  margin-top: 0;
  font-size: 22rpx;
  font-weight: 400;
  color: #868e8b;
  line-height: 26rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 近期上新 - 白底圆角卡片包裹，严格按 Figma: padding 16rpx 24rpx */
.section.new-section-wrapper {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 0 24rpx 24rpx;
  margin: 0 24rpx 32rpx;
}

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
  animation: home-fade-up-card 0.38s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.home-delay-0 { animation-delay: 0s; }
.home-delay-1 { animation-delay: 0.04s; }
.home-delay-2 { animation-delay: 0.08s; }
.home-delay-3 { animation-delay: 0.12s; }
.home-delay-4 { animation-delay: 0.16s; }
.home-delay-5 { animation-delay: 0.20s; }
.home-delay-6 { animation-delay: 0.24s; }
.home-delay-7 { animation-delay: 0.28s; }
.home-delay-8 { animation-delay: 0.32s; }

/* Figma: poster 90×120px = 180×240rpx，严格对齐 */
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
  color: #1a211e;
}

.new-date {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #868e8b;
}

.new-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #5f6563;
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
