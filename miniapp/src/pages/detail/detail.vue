<template>
  <view class="page">
    <!-- 顶部渐变标头（沿用「我的」页浅色渐变风格），标题移到内容区左上角 -->
    <NavBar title="" variant="light" :show-logo="false" />
    <view
      class="detail-back tap-feedback"
      hover-class="tap-feedback-hover"
      :style="{ top: (statusBarHeight + 6) + 'px' }"
      @click="goBack"
    >
      <view class="back-arrow"></view>
    </view>

    <scroll-view class="page-scroll" scroll-y :show-scrollbar="false">
      <!-- 标头占位 -->
      <view class="nav-placeholder" :style="{ height: navHeight + 'px' }"></view>

      <view v-if="product" class="content">
        <!-- 标头改版：海报图在左，右侧竖排 名称 / 上线时间 / 时长（参考想看卡片的排版） -->
        <view class="header-row">
          <image
            v-if="product.poster"
            class="header-poster"
            :src="ossImg(product.poster, 420)"
            mode="aspectFill"
          />
          <!-- 右侧信息列撑满海报高度：名称 + 标签在上，时间/时长/星级贴底，避免内容全挤在上半部分 -->
          <view class="header-info">
            <view class="header-top">
              <text class="product-name">{{ product.name }}</text>
              <view v-if="headerTags.length > 0" class="tag-row">
                <text v-for="tag in headerTags" :key="tag" class="header-tag">{{ tag }}</text>
              </view>
            </view>

            <view class="header-bottom">
              <view class="meta-col">
                <text v-if="product.onlineDate" class="meta-item">上线时间：{{ product.onlineDate }}</text>
                <text v-if="product.duration" class="meta-item">产品时长：{{ product.duration }}</text>
              </view>

              <view v-if="isEscapeRoom && product.horrorLevel" class="horror-row">
                <text class="horror-label">恐怖指数</text>
                <view class="horror-stars">
                  <text
                    v-for="n in 5"
                    :key="n"
                    class="horror-star"
                    :class="{ filled: n <= product.horrorLevel }"
                  >★</text>
                </view>
              </view>

              <view v-if="isEscapeRoom && product.puzzleLevel" class="horror-row">
                <text class="horror-label">解密难度</text>
                <view class="horror-stars">
                  <text
                    v-for="n in 5"
                    :key="n"
                    class="horror-star puzzle-star"
                    :class="{ filled: n <= product.puzzleLevel }"
                  >★</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="section-block">
          <view class="section-title-row">
            <view class="section-title-mark"></view>
            <text class="section-title">产品简介</text>
          </view>
          <rich-text class="section-text" :nodes="product.description || ''" />
        </view>

        <view v-if="product.images && product.images.length > 0" class="section-block images-section">
          <view class="section-title-row">
            <view class="section-title-mark"></view>
            <text class="section-title">产品图片</text>
          </view>
          <scroll-view class="images-scroll" scroll-x :show-scrollbar="false">
            <view class="images-track">
              <image
                v-for="(img, index) in product.images"
                :key="index"
                class="detail-image"
                :src="ossImg(img, 640)"
                mode="aspectFill"
                lazy-load
                @click="previewImage(index)"
              />
            </view>
          </scroll-view>
        </view>

        <view v-if="product.recommendations && product.recommendations.length > 0" class="section-block">
          <view class="section-title-row">
            <view class="section-title-mark"></view>
            <text class="section-title">官方推荐</text>
          </view>
          <view class="recommend-text-wrap">
            <text
              v-for="(item, index) in product.recommendations"
              :key="index"
              class="section-text recommend-line"
            >{{ item.icon || '✦' }} {{ item.text }}</text>
          </view>
        </view>

        <view v-if="product.notices" class="section-block notice-section">
          <view class="section-title-row">
            <view class="section-title-mark"></view>
            <text class="section-title">观演须知</text>
          </view>
          <view class="notice-lines">
            <view
              v-for="(line, index) in noticeLines"
              :key="index"
              class="notice-line"
            >
              <text
                class="section-text notice-line-text"
                :class="{ 'notice-body-text': !isNoticeHeading(line) }"
              >{{ String(line) }}</text>
            </view>
          </view>
        </view>

        <view class="content-bottom-space"></view>
      </view>
      <view v-else class="content detail-skeleton">
        <view class="header-row">
          <view class="header-poster skeleton-block"></view>
          <view class="header-info">
            <view class="skeleton-line detail-title-skeleton skeleton-block"></view>
            <view class="skeleton-line detail-meta-skeleton skeleton-block"></view>
            <view class="skeleton-line detail-meta-skeleton short skeleton-block"></view>
          </view>
        </view>
        <view class="section-block">
          <view class="section-title-row">
            <view class="section-title-mark"></view>
            <view class="skeleton-line detail-section-title-skeleton skeleton-block"></view>
          </view>
          <view class="skeleton-line detail-text-skeleton skeleton-block"></view>
          <view class="skeleton-line detail-text-skeleton short skeleton-block"></view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="btn-favorite tap-feedback" hover-class="tap-feedback-hover" @click="toggleFavorite">
        <text class="favorite-icon">{{ isFavorited ? '★' : '☆' }}</text>
        <text class="favorite-label">收藏</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import NavBar from '../../components/NavBar.vue'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'

const product = ref<any>(null)
const productId = ref('')
const isFavorited = ref(false)
const statusBarHeight = ref(0)
const navHeight = computed(() => statusBarHeight.value + 44)
const isEscapeRoom = computed(() => {
  if ((product.value?.productType || '').includes('密室')) return true
  const cats = product.value?.categories || []
  return cats.some((c: any) => (c.name || '').includes('密室'))
})

// 标头标签：一级大类 + 最多两个题材，去重后展示
const headerTags = computed<string[]>(() => {
  const names = [
    product.value?.productType,
    ...(product.value?.categories || []).map((c: any) => c?.name),
  ]
  const tags: string[] = []
  for (const name of names) {
    const text = String(name || '').trim()
    if (text && !tags.includes(text)) tags.push(text)
    if (tags.length >= 3) break
  }
  return tags
})

const noticeLines = computed(() => {
  const notices = product.value?.notices
  if (!notices) return []

  const normalizeText = (value: unknown): string[] => {
    if (value === null || value === undefined) return []

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split(/\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) => normalizeText(item))
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>
      const preferredKeys = ['duration', 'preparation', 'safety', 'content', 'text', 'notice', 'notices']
      const preferred = preferredKeys.flatMap((key) => normalizeText(obj[key]))
      if (preferred.length > 0) return preferred
      return Object.values(obj).flatMap((item) => normalizeText(item))
    }

    return []
  }

  return normalizeText(notices)
})

onLoad(async (options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  if (options?.id) {
    productId.value = options.id
    try {
      product.value = await api.getProduct(options.id)
    } catch (e) {
      console.error('Failed to load product:', e)
    }
  }
})

// 分享卡片封面：用产品海报，没有则让微信自动截图
function getShareImage(): string {
  return product.value?.poster ? ossImg(product.value.poster, 750) : ''
}

// 转发给朋友（右上角"···"菜单 → 转发）
onShareAppMessage(() => {
  const imageUrl = getShareImage()
  return {
    title: product.value?.name || '大千迷境XR影院',
    path: `/pages/detail/detail?id=${productId.value}`,
    ...(imageUrl ? { imageUrl } : {}),
  }
})

// 分享到朋友圈（需基础库 2.11.3+）
onShareTimeline(() => {
  const imageUrl = getShareImage()
  return {
    title: product.value?.name || '大千迷境XR影院',
    query: `id=${productId.value}`,
    ...(imageUrl ? { imageUrl } : {}),
  }
})

function isNoticeHeading(line: unknown): boolean {
  return /^【.*】$/.test(String(line).trim())
}

function goBack() {
  uni.navigateBack()
}

function toggleFavorite() {
  isFavorited.value = !isFavorited.value
}

function previewImage(index: number) {
  uni.previewImage({
    current: index,
    urls: product.value.images,
  })
}
</script>

<style scoped lang="scss">
@keyframes detail-fade-up {
  0% {
    opacity: 0;
    transform: translateY(48rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes detail-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.page {
  height: 100vh;
  background: #ffffff;
  position: relative;
}

.page-scroll {
  height: 100vh;
  background: transparent;
}

/* 返回按钮：浮在浅色标头左侧 */
.detail-back {
  position: fixed;
  left: 24rpx;
  z-index: 1001;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-placeholder {
  width: 100%;
}

.back-arrow {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #1a211e;
  border-bottom: 4rpx solid #1a211e;
  transform: rotate(45deg);
  margin-left: 6rpx;
}

/* Figma: Content padding 24px */
.content {
  padding: 40rpx 48rpx 0;
  background: transparent;
  box-sizing: border-box;
  animation: detail-fade-up 0.52s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.detail-skeleton {
  min-height: 520rpx;
}

.skeleton-line {
  border-radius: 999rpx;
}

.detail-title-skeleton {
  width: 280rpx;
  height: 48rpx;
}

.detail-meta-skeleton {
  width: 320rpx;
  height: 28rpx;
  margin-top: 24rpx;
}

.detail-meta-skeleton.short {
  width: 240rpx;
  margin-top: 16rpx;
}

.detail-section-title-skeleton {
  width: 140rpx;
  height: 30rpx;
}

.detail-text-skeleton {
  width: 100%;
  height: 24rpx;
  margin-top: 18rpx;
}

.detail-text-skeleton.short {
  width: 72%;
}

/* 标头：海报在左（竖版 3:4，与后台裁剪比例一致），信息列在右并撑满海报高度 */
.header-row {
  display: flex;
  align-items: stretch;
  gap: 28rpx;
}

.header-poster {
  flex-shrink: 0;
  width: 200rpx;
  height: 267rpx;
  border-radius: 16rpx;
  background: #eef1f0;
}

.header-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  /* 名称/标签靠上，时间与时长贴底，最后一行与海报下沿对齐 */
  justify-content: space-between;
}

.product-name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a211e;
  line-height: 50rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 14rpx;
}

.header-tag {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: rgba(18, 165, 148, 0.1);
  font-size: 22rpx;
  line-height: 30rpx;
  color: #12a594;
}

/* 上线时间、产品时长各占一行，带标签前缀；整块贴住海报下沿 */
.header-bottom {
  margin-top: 32rpx;
  /* 往上收，视觉上不贴海报下沿 */
  margin-bottom: 32rpx;
}

.meta-col {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.meta-item {
  font-size: 30rpx;
  font-weight: 400;
  color: #6b7370;
  line-height: 38rpx;
}

.horror-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 14rpx;
}

.horror-label {
  font-size: 26rpx;
  font-weight: 400;
  color: #7c8481;
  line-height: 32rpx;
}

.horror-stars {
  display: flex;
  gap: 4rpx;
}

.horror-star {
  font-size: 28rpx;
  line-height: 32rpx;
  color: #dfe2e0;
}

.horror-star.filled {
  color: #f5704a;
}

/* 解密难度用主题绿，和恐怖指数的橙色区分开 */
.puzzle-star.filled {
  color: #12a594;
}

.section-block {
  padding-top: 48rpx;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  height: 36rpx;
  margin-bottom: 20rpx;
}

.section-title-mark {
  width: 6rpx;
  height: 32rpx;
  border-radius: 4rpx;
  background: #12a594;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a211e;
  line-height: 36rpx;
}

.section-text {
  font-size: 24rpx;
  font-weight: 400;
  color: #1a211e;
  line-height: 44rpx;
}

.images-scroll {
  width: 100%;
  white-space: nowrap;
}

.images-track {
  display: inline-flex;
  gap: 20rpx;
}

.detail-image {
  flex-shrink: 0;
  width: 320rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: #eef1f0;
}

.recommend-text-wrap {
  display: flex;
  flex-direction: column;
}

.recommend-line {
  display: block;
  word-break: break-all;
}

.notice-section {
  padding-bottom: 0;
}

.notice-lines {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.notice-line {
  width: 100%;
  display: block;
}

.notice-line-text {
  width: 100%;
  display: block;
  text-align: left;
  white-space: normal;
  word-break: break-all;
}

.notice-body-text {
  box-sizing: border-box;
  padding-left: 8rpx;
}

.content-bottom-space {
  height: 220rpx;
}

/* Figma: Bottom Bar 375×71 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(142rpx + env(safe-area-inset-bottom));
  padding: 32rpx 48rpx calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: #ffffff;
  border-top: 1rpx solid #dfe2e0;
  z-index: 900;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  animation: detail-fade-in 0.4s ease-out both;
}

.btn-favorite {
  min-width: 88rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.favorite-icon {
  font-size: 34rpx;
  color: #1a211e;
  line-height: 34rpx;
}

.favorite-label {
  font-size: 20rpx;
  color: #5f6563;
  line-height: 24rpx;
}
</style>
