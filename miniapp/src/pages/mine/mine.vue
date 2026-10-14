<template>
  <view class="page">
    <NavBar title="我的" variant="light" :show-logo="false" />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <!-- 建议箱入口（置顶） -->
      <view class="menu-list">
        <view class="menu-item tap-feedback" hover-class="tap-feedback-hover" @click="goSuggestion">
          <view class="menu-item-left">
            <view class="menu-icon">
              <text class="menu-icon-emoji">✉️</text>
            </view>
            <view class="menu-item-texts">
              <text class="menu-item-label">建议箱</text>
              <text class="menu-item-sub">有好的建议欢迎告诉我们</text>
            </view>
          </view>
          <text class="menu-item-arrow">›</text>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item tap-feedback" hover-class="tap-feedback-hover" @click="goMySuggestions">
          <view class="menu-item-left">
            <view class="menu-icon">
              <text class="menu-icon-emoji">📋</text>
            </view>
            <view class="menu-item-texts">
              <view class="menu-item-label-row">
                <text class="menu-item-label">我的建议</text>
                <view v-if="unreadReply > 0" class="menu-dot"></view>
              </view>
              <text class="menu-item-sub">查看已提交建议的处理状态</text>
            </view>
          </view>
          <text class="menu-item-arrow">›</text>
        </view>
      </view>

      <!-- 占位（功能开发中） -->
      <view class="placeholder">
        <image
          class="placeholder-image"
          src="/static/figma-mine/Bl6Xc2XtW7QOmaCppJdb3Z_2049_898.png"
          mode="aspectFit"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import NavBar from '../../components/NavBar.vue'
import { refreshReplyTabBadge } from '../../lib/mySuggestions'

const navHeight = ref(0)
const unreadReply = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight + 44
})

onShow(async () => {
  unreadReply.value = await refreshReplyTabBadge()
})

function goSuggestion() {
  uni.navigateTo({ url: '/pages/suggestion/suggestion' })
}

function goMySuggestions() {
  uni.navigateTo({ url: '/pages/my-suggestions/my-suggestions' })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  /* 顶部品牌色渐变背景，向下淡出到页面底色 */
  background: linear-gradient(180deg, #a8e0d5 0%, #cdeae3 16%, #eef2f1 36%, #f5f7f6 60%);
}

.page-content {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 24rpx;
}

/* 建议箱入口卡片 */
.menu-list {
  margin-top: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(18, 165, 148, 0.10);
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120rpx;
  padding: 0 28rpx;
}
.menu-divider {
  height: 1rpx;
  margin: 0 28rpx;
  background: #f0f3f2;
}
.menu-item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #a8e6d8 0%, #c9e8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-icon-emoji {
  font-size: 36rpx;
}
.menu-item-texts {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.menu-item-label-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.menu-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ff3b30;
}
.menu-item-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a211e;
}
.menu-item-sub {
  font-size: 22rpx;
  color: #9aa3a0;
}
.menu-item-arrow {
  font-size: 40rpx;
  color: #c4c9c7;
}

/* 占位（功能开发中），移到建议箱下方居中展示 */
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  box-sizing: border-box;
}
.placeholder-image {
  width: 426rpx;
  height: 500rpx;
}
</style>
