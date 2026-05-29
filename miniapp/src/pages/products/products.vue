<template>
  <view class="page">
    <NavBar />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <view class="products-layout">
        <!-- 左侧分类Tab -->
        <view class="category-sidebar">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            :class="{ active: currentCategory === cat.id }"
            @click="switchCategory(cat.id)"
          >
            <text class="category-text">{{ cat.name }}</text>
          </view>
        </view>

        <!-- 右侧产品列表 -->
        <scroll-view class="product-list" scroll-y>
          <view v-if="currentProducts.length === 0" class="empty-state">
            <text class="empty-text">暂无产品</text>
          </view>
          <view
            v-for="product in currentProducts"
            :key="product.id"
            class="product-item"
            @click="goDetail(product.id)"
          >
            <view class="product-poster-wrap">
              <image class="product-poster" :src="product.poster" mode="aspectFill" />
            </view>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-date">上线时间：{{ product.onlineDate }}</text>
              <text class="product-desc">{{ stripHtml(product.description) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '../../components/NavBar.vue'
import { api } from '../../lib/api'

const navHeight = ref(0)
const categories = ref<any[]>([])
const currentCategory = ref('')
const currentProducts = ref<any[]>([])

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight + 44

  try {
    const catRes = await api.getCategories()
    categories.value = catRes.data
    if (catRes.data.length > 0) {
      currentCategory.value = catRes.data[0].id
      loadProducts()
    }
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
})

async function switchCategory(catId: string) {
  currentCategory.value = catId
  await loadProducts()
}

async function loadProducts() {
  try {
    const res = await api.getProducts(currentCategory.value)
    currentProducts.value = res.data
  } catch (e) {
    console.error('Failed to load products:', e)
  }
}

function goDetail(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '')
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.page-content {
  height: calc(100vh - env(safe-area-inset-bottom));
}

.products-layout {
  display: flex;
  height: 100%;
}

/* 左侧分类 */
.category-sidebar {
  width: 160rpx;
  background: #ffffff;
  border-right: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
  flex-shrink: 0;
}

.category-item {
  position: relative;
  padding: 28rpx 20rpx;
  text-align: center;
  transition: all 0.2s;
}

.category-item.active {
  background: #f5f5f7;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 36rpx;
  background: #1a1a1a;
  border-radius: 0 3rpx 3rpx 0;
}

.category-text {
  font-size: 26rpx;
  color: #666;
}

.category-item.active .category-text {
  color: #1a1a1a;
  font-weight: 600;
}

/* 右侧产品列表 */
.product-list {
  flex: 1;
  height: 100%;
  padding: 20rpx 24rpx;
}

.product-item {
  display: flex;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.product-poster-wrap {
  flex-shrink: 0;
  width: 180rpx;
  height: 240rpx;
}

.product-poster {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.product-info {
  flex: 1;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.product-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.product-date {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.product-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
