<template>
  <view class="page">
    <NavBar title="建议箱" variant="light" :show-logo="false" />
    <view
      class="back-btn tap-feedback"
      hover-class="tap-feedback-hover"
      :style="{ top: (statusBarHeight + 12) + 'px' }"
      @click="goBack"
    >
      <view class="back-arrow"></view>
    </view>
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <view class="card">
        <text class="tip">欢迎提出你的宝贵建议，我们会认真查看每一条反馈。</text>
        <textarea
          class="input"
          v-model="content"
          placeholder="请输入你的建议（最多500字）"
          maxlength="500"
          :disabled="submitting"
          auto-height
        />
        <view class="count">{{ content.length }}/500</view>
        <view
          class="submit-btn tap-feedback"
          :class="{ disabled: !content.trim() || submitting }"
          hover-class="tap-feedback-hover"
          @click="submit"
        >
          <text class="submit-text">{{ submitting ? '提交中...' : '提交建议' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '../../components/NavBar.vue'
import { api } from '../../lib/api'

const navHeight = ref(0)
const statusBarHeight = ref(0)
const content = ref('')
const submitting = ref(false)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight.value + 44
})

function goBack() {
  uni.navigateBack()
}

async function submit() {
  const text = content.value.trim()
  if (!text || submitting.value) return
  submitting.value = true
  try {
    await api.submitSuggestion(text)
    uni.showToast({ title: '提交成功，感谢反馈', icon: 'success' })
    content.value = ''
    setTimeout(() => uni.navigateBack(), 1200)
  } catch (e) {
    uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f7f9f8;
}
.back-btn {
  position: fixed;
  left: 24rpx;
  z-index: 1001;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-arrow {
  width: 22rpx;
  height: 22rpx;
  border-left: 4rpx solid #1a211e;
  border-bottom: 4rpx solid #1a211e;
  transform: rotate(45deg);
  margin-left: 8rpx;
}
.page-content {
  box-sizing: border-box;
  padding: 24rpx 32rpx;
}
.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
}
.tip {
  display: block;
  font-size: 26rpx;
  color: #7c8481;
  line-height: 38rpx;
  margin-bottom: 24rpx;
}
.input {
  width: 100%;
  box-sizing: border-box;
  min-height: 280rpx;
  padding: 24rpx;
  background: #f7f9f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1a211e;
  line-height: 42rpx;
}
.count {
  text-align: right;
  font-size: 24rpx;
  color: #c4c9c7;
  margin-top: 12rpx;
}
.submit-btn {
  margin-top: 32rpx;
  height: 88rpx;
  border-radius: 999rpx;
  background: #12a594;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn.disabled {
  background: #b5d8d2;
}
.submit-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
}
</style>
