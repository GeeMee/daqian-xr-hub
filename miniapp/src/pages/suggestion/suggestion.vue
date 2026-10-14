<template>
  <view class="page">
    <!-- 顶部自定义导航 -->
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="nav-back tap-feedback" hover-class="tap-feedback-hover" @click="goBack">
          <view class="back-arrow"></view>
        </view>
        <text class="nav-title">意见反馈</text>
        <view class="nav-mine tap-feedback" hover-class="tap-feedback-hover" @click="goMine">
          <text class="nav-mine-text">我的建议</text>
        </view>
      </view>
    </view>

    <scroll-view class="body" scroll-y :show-scrollbar="false" :style="{ paddingTop: navHeight + 'px' }">
      <view class="hello">Hello</view>
      <view class="subtitle">有什么好的建议可以分享下哦～</view>

      <!-- 反馈内容 -->
      <view class="card">
        <view class="card-label-row">
          <text class="card-label">反馈内容</text>
          <text class="card-label-star">✦</text>
        </view>
        <textarea
          class="content-input"
          v-model="content"
          placeholder="请填写10个字以上的内容，以便我们为您提供更好的内容"
          placeholder-class="content-placeholder"
          maxlength="500"
          :disabled="submitting"
        />
        <view class="image-row">
          <view
            v-for="(img, idx) in images"
            :key="img"
            class="image-item"
          >
            <image class="image-thumb" :src="ossImg(img, 200)" mode="aspectFill" />
            <view class="image-del" @click="removeImage(idx)">×</view>
          </view>
          <view
            v-if="images.length < 6"
            class="image-add tap-feedback"
            hover-class="tap-feedback-hover"
            @click="chooseImage"
          >
            <text class="image-add-icon">＋</text>
          </view>
        </view>
      </view>

      <!-- 手机号/微信号 -->
      <view class="card">
        <view class="card-label-row">
          <text class="card-label">手机号/微信号</text>
          <text class="card-label-star">✦</text>
        </view>
        <input
          class="contact-input"
          v-model="contact"
          placeholder="请填写手机号/微信号，便于我们回复"
          placeholder-class="content-placeholder"
          maxlength="50"
          :disabled="submitting"
        />
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <view class="privacy-tip">
        <text class="privacy-tip-text">为便于回复，我们将收集你填写的反馈内容与联系方式。提交前请阅读</text>
        <text class="privacy-link tap-feedback" hover-class="tap-feedback-hover" @click="openPrivacy">《用户隐私保护指引》</text>
      </view>
      <!-- #endif -->

      <view class="footer-space"></view>
    </scroll-view>

    <!-- 提交 -->
    <view class="submit-wrap" :style="{ paddingBottom: 'calc(24rpx + env(safe-area-inset-bottom))' }">
      <view
        class="submit-btn tap-feedback"
        :class="{ disabled: submitting }"
        hover-class="tap-feedback-hover"
        @click="submit"
      >
        <text class="submit-text">{{ submitting ? '提交中...' : '提交' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'
import { addMySuggestionId } from '../../lib/mySuggestions'

const navHeight = ref(0)
const statusBarHeight = ref(0)
const content = ref('')
const contact = ref('')
const images = ref<string[]>([])
const submitting = ref(false)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight.value + 44
})

// 进入页面即触发隐私授权：未授权则弹官方授权弹窗，拒绝则退出本页
onLoad(() => {
  // #ifdef MP-WEIXIN
  // @ts-ignore
  if (typeof wx.getPrivacySetting !== 'function') return
  // @ts-ignore
  wx.getPrivacySetting({
    success: (res: any) => {
      if (!res.needAuthorization) return
      // @ts-ignore
      wx.requirePrivacyAuthorize({
        // 同意：留在页面，正常使用
        success: () => {},
        // 拒绝：退出建议箱
        fail: () => {
          uni.navigateBack({
            fail: () => uni.switchTab({ url: '/pages/index/index' }),
          })
        },
      })
    },
  })
  // #endif
})

function goBack() {
  uni.navigateBack()
}

function goMine() {
  uni.navigateTo({ url: '/pages/my-suggestions/my-suggestions' })
}

function openPrivacy() {
  // #ifdef MP-WEIXIN
  // @ts-ignore 打开微信后台配置的《用户隐私保护指引》
  wx.openPrivacyContract({
    fail: (err: any) => {
      // 预览/开发版下 url 可能为 null，属已知限制；上传为体验版/正式版后正常
      console.error('openPrivacyContract fail:', err)
      uni.showToast({ title: '请在体验版或正式版中查看', icon: 'none' })
    },
  })
  // #endif
}

function chooseImage() {
  const remain = 6 - images.value.length
  if (remain <= 0) return
  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    success: async (res) => {
      const paths = res.tempFilePaths || []
      uni.showLoading({ title: '上传中...', mask: true })
      try {
        for (const p of paths) {
          const url = await api.uploadSuggestionImage(p)
          images.value.push(url)
        }
      } catch (e) {
        uni.showToast({ title: '图片上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
  })
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

async function submit() {
  if (submitting.value) return
  const text = content.value.trim()
  if (text.length < 10) {
    uni.showToast({ title: '请填写10个字以上的内容', icon: 'none' })
    return
  }
  const contactText = contact.value.trim()
  if (!contactText) {
    uni.showToast({ title: '请填写手机号/微信号', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const res = await api.submitSuggestion({
      content: text,
      images: images.value,
      contact: contactText,
    })
    if (res?.id) addMySuggestionId(res.id)
    uni.showToast({ title: '提交成功，感谢反馈', icon: 'success' })
    content.value = ''
    contact.value = ''
    images.value = []
    setTimeout(() => uni.navigateTo({ url: '/pages/my-suggestions/my-suggestions' }), 1200)
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
  background: linear-gradient(180deg, #a8e0d5 0%, #cdeae3 16%, #eef2f1 36%, #f5f7f6 60%);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
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
.nav-mine {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 64rpx;
  padding-left: 12rpx;
}
.nav-mine-text {
  font-size: 26rpx;
  color: #12a594;
  font-weight: 500;
}

.body {
  flex: 1;
  height: 0;
  box-sizing: border-box;
  padding-left: 32rpx;
  padding-right: 32rpx;
}

.hello {
  margin-top: 24rpx;
  font-size: 56rpx;
  font-weight: 700;
  color: #1a211e;
}
.subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #7c8491;
  margin-bottom: 28rpx;
}

.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 28rpx;
}
.card-label-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
}
.card-label {
  position: relative;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a211e;
  padding: 4rpx 4rpx;
}
/* 标签底部渐变高亮，呼应设计稿 */
.card-label::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #9ff0d8 0%, #cfe6ff 100%);
  z-index: -1;
}
.card-label-star {
  font-size: 22rpx;
  color: #12a594;
}

.content-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 220rpx;
  font-size: 28rpx;
  color: #1a211e;
  line-height: 42rpx;
}
.content-placeholder {
  color: #b5bcc6;
  font-size: 28rpx;
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}
.image-item {
  position: relative;
  width: 140rpx;
  height: 140rpx;
}
.image-thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #eef1f0;
}
.image-del {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 26rpx;
  line-height: 36rpx;
  text-align: center;
}
.image-add {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #f1f3f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-add-icon {
  font-size: 56rpx;
  color: #b5bcc6;
  font-weight: 300;
}

.contact-input {
  width: 100%;
  box-sizing: border-box;
  height: 64rpx;
  font-size: 28rpx;
  color: #1a211e;
}

.privacy-tip {
  margin-top: 8rpx;
  padding: 0 8rpx;
  font-size: 24rpx;
  line-height: 38rpx;
  color: #9aa3a0;
  text-align: center;
}
.privacy-link {
  color: #12a594;
}

.footer-space {
  height: 40rpx;
}

.submit-wrap {
  flex-shrink: 0;
  padding: 24rpx 32rpx 0;
}
.submit-btn {
  height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #14b3a1 0%, #12a594 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(18, 165, 148, 0.28);
}
.submit-btn.disabled {
  opacity: 0.6;
}
.submit-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}
</style>
