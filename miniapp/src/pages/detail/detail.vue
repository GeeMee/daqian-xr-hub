<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y :show-scrollbar="false">
      <!-- 视频 / 海报区域 -->
      <view class="video-section">
        <video
          v-if="product?.video && showVideo"
          class="product-video"
          :src="product.video"
          :poster="ossImg(product.poster, 800)"
          controls
          autoplay
          object-fit="cover"
        />
        <view v-else class="video-placeholder">
          <image class="video-poster" :src="ossImg(product?.poster, 800)" mode="aspectFill" lazy-load />
          <view v-if="product?.video" class="play-btn tap-feedback" hover-class="tap-feedback-hover" @click="startVideo">
            <text class="play-icon">▶</text>
          </view>
        </view>

        <view class="back-btn tap-feedback" hover-class="tap-feedback-hover" :style="{ top: (statusBarHeight + 12) + 'px' }" @click="goBack">
          <view class="back-arrow"></view>
        </view>
      </view>

      <view v-if="product" class="content">
        <text class="product-name">{{ product.name }}</text>

        <view class="meta-row">
          <text class="meta-item">上线时间：{{ product.onlineDate }}</text>
          <text class="meta-dot">·</text>
          <text class="meta-item">产品时长：{{ product.duration }}</text>
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
        <view class="skeleton-line detail-title-skeleton skeleton-block"></view>
        <view class="skeleton-line detail-meta-skeleton skeleton-block"></view>
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
import { onLoad } from '@dcloudio/uni-app'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'

const product = ref<any>(null)
const isFavorited = ref(false)
const statusBarHeight = ref(0)
const showVideo = ref(false)

const isEscapeRoom = computed(() => {
  const name = product.value?.categoryName || ''
  return name.includes('密室')
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
  showVideo.value = false
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  if (options?.id) {
    try {
      product.value = await api.getProduct(options.id)
    } catch (e) {
      console.error('Failed to load product:', e)
    }
  }
})

function startVideo() {
  showVideo.value = true
}

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
  background-color: #ffffff;
  position: relative;
}

.page-scroll {
  height: 100vh;
  background: #ffffff;
}

/* Figma: Video Section 375×200 */
.video-section {
  position: relative;
  width: 100%;
  height: 400rpx;
  background: #141414;
  overflow: hidden;
  animation: detail-fade-in 0.45s ease-out both;
}

.product-video,
.video-placeholder,
.video-poster {
  width: 100%;
  height: 100%;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(26, 33, 30, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  color: #ffffff;
  font-size: 28rpx;
  margin-left: 5rpx;
}

.back-btn {
  position: fixed;
  left: 32rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(26, 33, 30, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.back-arrow {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #ffffff;
  border-bottom: 4rpx solid #ffffff;
  transform: rotate(45deg);
  margin-left: 6rpx;
}

/* Figma: Content padding 24px */
.content {
  padding: 48rpx 48rpx 0;
  background: #ffffff;
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
  width: 420rpx;
  height: 28rpx;
  margin-top: 24rpx;
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

.product-name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a211e;
  line-height: 48rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  margin-top: 24rpx;
}

.meta-item,
.meta-dot {
  font-size: 26rpx;
  font-weight: 400;
  color: #7c8481;
  line-height: 32rpx;
}

.meta-dot {
  margin: 0 16rpx;
}

.horror-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
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
