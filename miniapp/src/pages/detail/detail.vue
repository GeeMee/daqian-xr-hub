<template>
  <scroll-view class="page" scroll-y>
    <!-- 视频区域 -->
    <view class="video-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <video
        v-if="product?.video"
        class="product-video"
        :src="product.video"
        :poster="product.poster"
        controls
        object-fit="cover"
      />
      <view v-else class="video-placeholder">
        <image class="video-poster" :src="product?.poster" mode="aspectFill" />
        <view class="play-btn">
          <text class="play-icon">▶</text>
        </view>
      </view>
      <!-- 返回按钮 -->
      <view class="back-btn" :style="{ top: (statusBarHeight + 10) + 'px' }" @click="goBack">
        <view class="back-arrow"></view>
      </view>
    </view>

    <view v-if="product" class="content">
      <!-- 产品名称 -->
      <text class="product-name">{{ product.name }}</text>

      <!-- 基础信息 -->
      <view class="meta-row">
        <text class="meta-item">上线时间：{{ product.onlineDate }}</text>
        <text class="meta-dot">·</text>
        <text class="meta-item">产品时长：{{ product.duration }}</text>
      </view>

      <!-- 产品简介 -->
      <view class="desc-section section-block">
        <text class="section-title">产品简介</text>
        <rich-text class="desc-text" :nodes="product.description || ''" />
      </view>

      <!-- 产品图片 -->
      <view v-if="product.images && product.images.length > 0" class="images-section section-block">
        <scroll-view class="images-scroll" scroll-x :show-scrollbar="false">
          <view class="images-track">
            <image
              v-for="(img, index) in product.images"
              :key="index"
              class="detail-image"
              :src="img"
              mode="aspectFill"
              @click="previewImage(index)"
            />
          </view>
        </scroll-view>
      </view>

      <!-- 官方推荐 -->
      <view v-if="product.recommendations && product.recommendations.length > 0" class="recommend-section section-block">
        <text class="section-title">官方推荐</text>
        <view class="recommend-list">
          <view v-for="(item, index) in product.recommendations" :key="index" class="recommend-item">
            <text class="recommend-icon">{{ item.icon }}</text>
            <text class="recommend-text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <!-- 观演须知 -->
      <view v-if="product.notices" class="notice-section section-block">
        <text class="section-title">【观演须知】</text>
        <rich-text class="notice-text" :nodes="product.notices" />
      </view>
    </view>

    <!-- 底部收藏栏 -->
    <view class="bottom-bar">
      <view class="btn-favorite" @click="toggleFavorite">
        <text class="favorite-icon">{{ isFavorited ? '★' : '☆' }}</text>
        <text class="favorite-label">收藏</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '../../lib/api'

const product = ref<any>(null)
const isFavorited = ref(false)
const statusBarHeight = ref(0)

onLoad(async (options) => {
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
.page {
  height: 100vh;
  background-color: #ffffff;
}

/* 视频区域 */
.video-section {
  position: relative;
  width: 100%;
  background: #ffffff;
}

.product-video {
  width: 100%;
  height: 420rpx;
}

.video-placeholder {
  position: relative;
  width: 100%;
  height: 420rpx;
}

.video-poster {
  width: 100%;
  height: 100%;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  color: #ffffff;
  font-size: 36rpx;
  margin-left: 6rpx;
}

/* 返回按钮 */
.back-btn {
  position: fixed;
  left: 24rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-left: 4rpx solid #ffffff;
  border-bottom: 4rpx solid #ffffff;
  transform: rotate(45deg);
  margin-left: 6rpx;
}

/* 内容区 */
.content {
  padding: 32rpx;
}

.product-name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.meta-dot {
  margin: 0 16rpx;
  font-size: 24rpx;
  color: #ccc;
}

/* 段落区块 */
.section-block {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-block:last-child {
  border-bottom: none;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20rpx;
}

/* 产品简介 */
.desc-section {
  padding: 32rpx 0;
}

.desc-text {
  font-size: 28rpx;
  color: #333;
  line-height: 2;
}

/* 产品图片 */
.images-section {
  padding: 24rpx 0;
}

.images-scroll {
  width: 100%;
  white-space: nowrap;
}

.images-track {
  display: inline-flex;
  gap: 16rpx;
}

.detail-image {
  width: 400rpx;
  height: 300rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

/* 官方推荐 */
.recommend-section {
  padding: 32rpx 0;
}

.recommend-list {
  background: #f9f9f9;
  border-radius: 12rpx;
  overflow: hidden;
}

.recommend-item {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 30rpx;
}

.recommend-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.recommend-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
}

/* 观演须知 */
.notice-section {
  padding-top: 32rpx;
}

.notice-text {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 2;
  white-space: pre-wrap;
}

/* 底部栏 */
.bottom-bar {
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
}

.btn-favorite {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.favorite-icon {
  font-size: 44rpx;
  color: #fa8c16;
}

.favorite-label {
  font-size: 20rpx;
  color: #666;
  margin-top: 2rpx;
}
</style>
