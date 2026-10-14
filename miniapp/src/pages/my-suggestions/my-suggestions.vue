<template>
  <view class="page">
    <!-- 顶部自定义导航 -->
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="nav-back tap-feedback" hover-class="tap-feedback-hover" @click="goBack">
          <view class="back-arrow"></view>
        </view>
        <text class="nav-title">我的建议</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view class="body" scroll-y :show-scrollbar="false" :style="{ paddingTop: navHeight + 'px' }">
      <view v-if="loading" class="state-text">加载中...</view>

      <view v-else-if="list.length === 0" class="empty">
        <text class="empty-text">还没有提交过建议</text>
        <view class="empty-btn tap-feedback" hover-class="tap-feedback-hover" @click="goSubmit">
          <text class="empty-btn-text">去提建议</text>
        </view>
      </view>

      <template v-else>
        <view v-for="item in list" :key="item.id" class="card">
          <view class="card-top">
            <text class="card-time">{{ formatTime(item.createdAt) }}</text>
            <text class="status" :class="'status-' + item.status">{{ item.statusLabel }}</text>
          </view>
          <text class="card-content">{{ item.content }}</text>
          <view v-if="item.images && item.images.length" class="img-row">
            <image
              v-for="img in item.images"
              :key="img"
              class="img-thumb"
              :src="ossImg(img, 200)"
              mode="aspectFill"
              @click="previewImage(item.images, img)"
            />
          </view>
          <view v-if="item.reply" class="reply">
            <text class="reply-label">官方回复</text>
            <text class="reply-text">{{ item.reply }}</text>
          </view>
        </view>
      </template>

      <view class="footer-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'
import { getMySuggestionIds, markRepliesRead, refreshReplyTabBadge } from '../../lib/mySuggestions'

const navHeight = ref(0)
const statusBarHeight = ref(0)
const loading = ref(true)
const list = ref<any[]>([])

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight.value + 44

  const ids = getMySuggestionIds()
  if (ids.length === 0) {
    loading.value = false
    return
  }
  try {
    list.value = await api.getMySuggestions(ids)
    // 看过即标记回复为已读，清掉红点
    const repliedIds = list.value.filter((s: any) => s && s.reply).map((s: any) => s.id)
    markRepliesRead(repliedIds)
    refreshReplyTabBadge()
  } catch (e) {
    uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
  } finally {
    loading.value = false
  }
})

function goBack() {
  uni.navigateBack()
}

function goSubmit() {
  uni.redirectTo({ url: '/pages/suggestion/suggestion' })
}

function formatTime(t: string) {
  return (t || '').slice(0, 16).replace('T', ' ')
}

function previewImage(images: string[], current: string) {
  uni.previewImage({ urls: images, current })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #a8e0d5 0%, #cdeae3 16%, #eef2f1 36%, #f5f7f6 60%);
  display: flex;
  flex-direction: column;
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}
.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
}
.back-arrow {
  width: 22rpx;
  height: 22rpx;
  border-left: 4rpx solid #1a211e;
  border-bottom: 4rpx solid #1a211e;
  transform: rotate(45deg);
  margin-left: 8rpx;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #1a211e;
}
.nav-placeholder {
  width: 64rpx;
}

.body {
  flex: 1;
  height: 0;
  box-sizing: border-box;
  padding: 16rpx 32rpx 0;
}

.state-text {
  margin-top: 120rpx;
  text-align: center;
  font-size: 28rpx;
  color: #7c8491;
}

.empty {
  margin-top: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #7c8491;
}
.empty-btn {
  height: 76rpx;
  padding: 0 56rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #14b3a1 0%, #12a594 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.card-time {
  font-size: 24rpx;
  color: #9aa3a0;
}
.status {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}
.status-pending {
  color: #7c8491;
  background: #eef1f0;
}
.status-viewed {
  color: #2f7cf6;
  background: #e8f1ff;
}
.status-replied {
  color: #12a594;
  background: #e0f6f1;
}
.card-content {
  font-size: 28rpx;
  color: #1a211e;
  line-height: 42rpx;
  white-space: pre-wrap;
  word-break: break-word;
}
.img-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}
.img-thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #eef1f0;
}
.reply {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f4faf8;
  border-radius: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.reply-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #12a594;
}
.reply-text {
  font-size: 27rpx;
  color: #3a423f;
  line-height: 40rpx;
  white-space: pre-wrap;
  word-break: break-word;
}
.footer-space {
  height: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
