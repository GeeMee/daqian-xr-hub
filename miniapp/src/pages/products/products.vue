<template>
  <view class="page">
    <NavBar variant="light" :show-logo="false" />
    <view class="page-content" :style="{ paddingTop: navHeight + 'px' }">
      <!-- 顶部 Tab：正在热映 / 即将上映 -->
      <view class="top-tabs">
        <view
          class="top-tab"
          :class="{ active: currentTab === 'showing' }"
          @click="switchTab('showing')"
        >
          <text class="top-tab-text">正在热映</text>
          <view v-if="currentTab === 'showing'" class="top-tab-underline"></view>
        </view>
        <view
          class="top-tab"
          :class="{ active: currentTab === 'upcoming' }"
          @click="switchTab('upcoming')"
        >
          <text class="top-tab-text">即将上映</text>
          <view v-if="currentTab === 'upcoming'" class="top-tab-underline"></view>
        </view>
      </view>

      <!-- 正在热映 -->
      <block v-if="currentTab === 'showing'">
        <view class="filter-bar">
          <view
            class="filter-trigger"
            :class="{ active: panelKey === 'category' }"
            @click="openPanel('category')"
          >
            <text class="filter-text">{{ selectedCategoryLabel }}</text>
            <text class="filter-arrow" :class="{ up: panelKey === 'category' }"></text>
          </view>
          <view
            class="filter-trigger"
            :class="{ active: panelKey === 'sort' }"
            @click="openPanel('sort')"
          >
            <text class="filter-text">{{ selectedSortLabel }}</text>
            <text class="filter-arrow" :class="{ up: panelKey === 'sort' }"></text>
          </view>
        </view>

        <view class="content-area">
          <scroll-view class="product-list" scroll-y :show-scrollbar="false" @scrolltolower="loadMoreShowing">
            <view v-if="isShowingLoading" class="product-skeleton-list">
              <view v-for="item in 3" :key="item" class="product-card skeleton-card">
                <view class="poster-wrap skeleton-block"></view>
                <view class="card-body">
                  <view class="skeleton-line skeleton-title skeleton-block"></view>
                  <view class="skeleton-line skeleton-short skeleton-block"></view>
                  <view class="skeleton-line skeleton-long skeleton-block"></view>
                </view>
              </view>
            </view>
            <view v-else-if="filteredProducts.length === 0" class="empty-state">
              <text class="empty-text">暂无产品</text>
            </view>
            <view
              v-for="(product, index) in visibleProducts"
              :key="product.id"
              class="product-card tap-feedback"
              hover-class="tap-feedback-hover"
              @click="goDetail(product.id)"
            >
              <view class="poster-wrap">
                <image class="poster" :src="product.poster" mode="aspectFill" lazy-load />
              </view>
              <view class="card-body">
                <view class="card-main">
                  <text class="card-name">{{ product.name }}</text>
                  <text class="card-duration">时长：{{ product.duration }}</text>
                  <text v-if="product.shortDesc" class="card-desc">{{ product.shortDesc }}</text>
                </view>
                <view class="buy-btn tap-feedback" hover-class="tap-feedback-hover" @click.stop="goDetail(product.id)">
                  <text class="buy-btn-text">详情</text>
                </view>
              </view>
            </view>
            <view class="footer-space"></view>
          </scroll-view>

          <!-- 筛选面板 -->
          <view v-if="panelKey" class="panel-mask" @click="closePanel">
            <view class="panel" @click.stop>
              <view class="panel-options" :class="panelKey === 'category' ? 'category-options' : 'sort-options'">
                <view
                  v-for="(opt, index) in panelOptions"
                  :key="opt.id"
                  class="panel-option"
                  :class="[getPanelDelayClass(index), { active: currentPanelValue === opt.id }]"
                  @click="selectPanelOption(opt.id)"
                >
                  <text class="panel-option-text">{{ opt.name }}</text>
                  <text v-if="panelKey === 'sort' && opt.id !== 'default'" class="panel-option-arrow"></text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </block>

      <!-- 即将上映 -->
      <view v-else class="upcoming-area">
        <scroll-view class="upcoming-scroll" scroll-y :show-scrollbar="false" @scrolltolower="loadMoreUpcoming">
          <view v-if="upcomingLoading" class="product-skeleton-list upcoming-skeleton-list">
            <view v-for="item in 3" :key="item" class="product-card skeleton-card">
              <view class="poster-wrap skeleton-block"></view>
              <view class="card-body">
                <view class="skeleton-line skeleton-title skeleton-block"></view>
                <view class="skeleton-line skeleton-short skeleton-block"></view>
                <view class="skeleton-line skeleton-long skeleton-block"></view>
              </view>
            </view>
          </view>
          <view v-else-if="upcomingAll.length === 0" class="empty-state">
            <text class="empty-text">敬请期待</text>
          </view>

          <template v-else>
            <!-- 推荐栏 -->
            <block v-if="upcomingRecommended.length > 0">
              <view class="upcoming-section-title">
                <text class="upcoming-section-text">推荐</text>
              </view>
              <scroll-view class="recommended-scroll" scroll-x :show-scrollbar="false">
                <view class="recommended-track">
                  <view
                    v-for="(product, index) in upcomingRecommended"
                    :key="product.id"
                    class="poster-cell tap-feedback"
                    hover-class="tap-feedback-hover"
                    @click="goDetail(product.id)"
                  >
                    <view class="poster-cell-img">
                      <image class="poster-img" :src="product.poster" mode="aspectFill" lazy-load />
                    </view>
                    <text class="poster-cell-name">{{ product.name }}</text>
                  </view>
                </view>
              </scroll-view>
            </block>

            <!-- 敬请期待栏 -->
            <view class="upcoming-section-title">
              <text class="upcoming-section-text">敬请期待</text>
            </view>
            <view class="upcoming-list">
              <view
                v-for="(product, index) in visibleUpcomingAll"
                :key="product.id"
                class="product-card tap-feedback"
                hover-class="tap-feedback-hover"
                @click="goDetail(product.id)"
              >
                <view class="poster-wrap">
                  <image class="poster" :src="product.poster" mode="aspectFill" lazy-load />
                </view>
                <view class="card-body">
                  <view class="card-main">
                    <text class="card-name">{{ product.name }}</text>
                    <text class="card-duration">时长：{{ product.duration }}</text>
                    <text v-if="product.shortDesc" class="card-desc">{{ product.shortDesc }}</text>
                  </view>
                </view>
              </view>
            </view>
          </template>
          <view class="footer-space"></view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '../../components/NavBar.vue'
import { api } from '../../lib/api'

type TabKey = 'showing' | 'upcoming'
type PanelKey = '' | 'category' | 'sort'

const navHeight = ref(0)
const currentTab = ref<TabKey>('showing')

const categories = ref<any[]>([])
const products = ref<any[]>([])
const upcomingRecommended = ref<any[]>([])
const upcomingAll = ref<any[]>([])
const upcomingLoaded = ref(false)
const upcomingLoading = ref(false)
const isShowingLoading = ref(true)

const selectedCategory = ref<string>('all')
const selectedSort = ref<string>('default')
const sortOrderList = ref<string[]>([])

const panelKey = ref<PanelKey>('')
const PAGE_BATCH_SIZE = 6
const showingRenderCount = ref(PAGE_BATCH_SIZE)
const upcomingRenderCount = ref(PAGE_BATCH_SIZE)

const sortOptions = [
  { id: 'default', name: '综合排序' },
  { id: 'monthly', name: '当月最热' },
  { id: 'daily', name: '当日最热' },
]

const selectedCategoryLabel = computed(() => {
  if (selectedCategory.value === 'all') return '全部类型'
  return categories.value.find((item) => item.id === selectedCategory.value)?.name || '全部类型'
})

const selectedSortLabel = computed(() => {
  return sortOptions.find((item) => item.id === selectedSort.value)?.name || '综合排序'
})

const panelOptions = computed(() => {
  if (panelKey.value === 'category') {
    return [{ id: 'all', name: '全部' }, ...categories.value]
  }
  if (panelKey.value === 'sort') {
    return sortOptions
  }
  return []
})

const currentPanelValue = computed(() => {
  if (panelKey.value === 'category') return selectedCategory.value
  if (panelKey.value === 'sort') return selectedSort.value
  return ''
})

const filteredProducts = computed(() => {
  let list = products.value
  if (selectedCategory.value !== 'all') {
    list = list.filter((p) => p.categoryId === selectedCategory.value)
  }
  const sorted = [...list]
  if ((selectedSort.value === 'monthly' || selectedSort.value === 'daily') && sortOrderList.value.length > 0) {
    sorted.sort((a, b) => {
      const idxA = getSortIndex(a.name)
      const idxB = getSortIndex(b.name)
      return idxA - idxB
    })
  } else {
    sorted.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }
  return sorted
})

const visibleProducts = computed(() => filteredProducts.value.slice(0, showingRenderCount.value))
const visibleUpcomingAll = computed(() => upcomingAll.value.slice(0, upcomingRenderCount.value))

function loadMoreShowing() {
  if (showingRenderCount.value < filteredProducts.value.length) {
    showingRenderCount.value += PAGE_BATCH_SIZE
  }
}

function loadMoreUpcoming() {
  if (upcomingRenderCount.value < upcomingAll.value.length) {
    upcomingRenderCount.value += PAGE_BATCH_SIZE
  }
}

function resetShowingRenderCount() {
  showingRenderCount.value = PAGE_BATCH_SIZE
}

function resetUpcomingRenderCount() {
  upcomingRenderCount.value = PAGE_BATCH_SIZE
}

function getSortIndex(productName: string): number {
  // 优先精确匹配
  for (let i = 0; i < sortOrderList.value.length; i++) {
    if (sortOrderList.value[i] === productName) {
      return i
    }
  }
  // 子串匹配，取排名最靠前的
  let minIdx = 9999
  for (let i = 0; i < sortOrderList.value.length; i++) {
    const sortName = sortOrderList.value[i]
    if (productName.includes(sortName) || sortName.includes(productName)) {
      minIdx = Math.min(minIdx, i)
    }
  }
  return minIdx
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navHeight.value = statusBarHeight + 44

  try {
    const [catRes, prodRes] = await Promise.all([
      api.getCategories(),
      api.getProducts({ status: 'on' }),
    ])
    categories.value = catRes.data
    products.value = prodRes.data
    resetShowingRenderCount()
  } catch (e) {
    console.error('Failed to load showing products:', e)
  } finally {
    isShowingLoading.value = false
  }
})

async function loadUpcomingOnce() {
  if (upcomingLoaded.value || upcomingLoading.value) return
  upcomingLoading.value = true
  try {
    const upcomingRes = await api.getUpcoming()
    upcomingRecommended.value = upcomingRes.recommended
    upcomingAll.value = upcomingRes.all
    upcomingLoaded.value = true
    resetUpcomingRenderCount()
  } catch (e) {
    console.error('Failed to load upcoming products:', e)
  } finally {
    upcomingLoading.value = false
  }
}

function switchTab(key: TabKey) {
  currentTab.value = key
  closePanel()
  if (key === 'upcoming') {
    if (!upcomingLoaded.value) {
      loadUpcomingOnce()
    }
  }
}

function openPanel(key: 'category' | 'sort') {
  if (panelKey.value === key) {
    closePanel()
    return
  }
  panelKey.value = key
}

function closePanel() {
  panelKey.value = ''
}

async function selectPanelOption(id: string) {
  if (panelKey.value === 'category') {
    selectedCategory.value = id
    resetShowingRenderCount()
  } else if (panelKey.value === 'sort') {
    await fetchSortList(id)
    selectedSort.value = id
    resetShowingRenderCount()
  }
  closePanel()
}

async function fetchSortList(sortKey: string) {
  if (sortKey === 'monthly' || sortKey === 'daily') {
    try {
      const type = sortKey === 'daily' ? 0 : 1
      sortOrderList.value = await api.getSortList(type)
    } catch (e) {
      sortOrderList.value = []
    }
  } else {
    sortOrderList.value = []
  }
}

function getPanelDelayClass(index: number) {
  return `panel-delay-${Math.min(index, 8)}`
}

function goDetail(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}
</script>

<style scoped lang="scss">
@keyframes product-fade-up {
  0% {
    opacity: 0.18;
    transform: translateY(34rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes product-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes filter-panel-down {
  0% {
    opacity: 0;
    transform: translateY(-28rpx) scaleY(0.96);
    transform-origin: top center;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
    transform-origin: top center;
  }
}

@keyframes filter-option-pop {
  0% {
    opacity: 0;
    transform: translateY(18rpx) scale(0.94);
  }
  70% {
    opacity: 1;
    transform: translateY(-2rpx) scale(1.015);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.page {
  min-height: 100vh;
  background-color: #f7f9f8;
}

.page-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #f7f9f8;
}

/* Figma: 二级 Tab Bar 375×53，白底，底部留 12px */
.top-tabs {
  display: flex;
  flex-shrink: 0;
  height: 106rpx;
  background: #ffffff;
  padding: 0 0 24rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #eef1f0;
  animation: product-fade-in 0.28s ease-out both;
}

.top-tab {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
  padding-top: 32rpx;
  box-sizing: border-box;
}

.top-tab-text {
  font-size: 30rpx;
  line-height: 36rpx;
  color: #868e8b;
  font-weight: 400;
}

.top-tab.active .top-tab-text {
  color: #1a211e;
  font-weight: 700;
}

.top-tab-underline {
  width: 80rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: linear-gradient(90deg, #12a594 0%, #75d2c5 100%);
}

/* Figma: Filter Bar 375×52，白底，左对齐两枚“综合排序”样式胶囊 */
.filter-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 24rpx;
  height: 104rpx;
  padding: 24rpx 48rpx;
  box-sizing: border-box;
  background: #ffffff;
  animation: product-fade-in 0.28s ease-out 0.04s both;
}

.filter-trigger {
  min-width: 200rpx;
  height: 64rpx;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 0 32rpx;
  box-sizing: border-box;
  background: #eef1f0;
  border-radius: 32rpx;
  transition: background-color 0.18s ease-out, transform 0.16s ease-out;
}

.filter-trigger:active {
  transform: scale(0.96);
}

.filter-trigger.active {
  background: #e3f5f1;
}

.filter-text {
  font-size: 26rpx;
  line-height: 32rpx;
  color: #1a211e;
  transition: color 0.18s ease-out, font-weight 0.18s ease-out;
}

.filter-arrow {
  width: 0;
  height: 0;
  border-left: 7rpx solid transparent;
  border-right: 7rpx solid transparent;
  border-top: 9rpx solid #1a211e;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), border-top-color 0.18s ease-out;
}

.filter-arrow.up {
  transform: rotate(180deg);
  border-top-color: #12a594;
}

.filter-trigger.active .filter-text {
  color: #12a594;
}

/* 内容区 */
.content-area,
.upcoming-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f7f9f8;
}

.product-list {
  height: 100%;
  padding: 32rpx 32rpx 0;
  box-sizing: border-box;
}

.product-card {
  display: flex;
  align-items: center;
  min-height: 208rpx;
  padding: 24rpx;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.product-skeleton-list {
  width: 100%;
}

.upcoming-skeleton-list {
  padding: 32rpx 32rpx 0;
  box-sizing: border-box;
}

.skeleton-card {
  pointer-events: none;
}

.skeleton-line {
  border-radius: 999rpx;
}

.skeleton-title {
  width: 180rpx;
  height: 32rpx;
}

.skeleton-short {
  width: 140rpx;
  height: 24rpx;
  margin-top: 18rpx;
}

.skeleton-long {
  width: 260rpx;
  height: 24rpx;
  margin-top: 16rpx;
}

.poster-wrap {
  flex-shrink: 0;
  width: 120rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #eef1f0;
}

.poster {
  width: 100%;
  height: 100%;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding-left: 24rpx;
  overflow: hidden;
}

.card-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.card-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a211e;
  line-height: 36rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.card-duration {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #868e8b;
  line-height: 34rpx;
}

.card-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #5f6563;
  line-height: 34rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* Figma 列表页没有详情按钮，隐藏但保留结构避免影响逻辑 */
.buy-btn {
  display: none;
}

.product-list ::-webkit-scrollbar,
.upcoming-scroll ::-webkit-scrollbar,
.recommended-scroll ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  -webkit-appearance: none;
  background: transparent;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #868e8b;
}

.footer-space {
  height: calc(120rpx + env(safe-area-inset-bottom));
}

/* 筛选下拉面板：全部类型=自由换行胶囊，综合排序=居中竖向胶囊 */
.panel-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.22);
  z-index: 100;
  animation: product-fade-in 0.16s ease-out both;
}

.panel {
  width: 100%;
  background: #eef1f0;
  padding: 24rpx 56rpx 32rpx;
  box-sizing: border-box;
  border-radius: 0 0 24rpx 24rpx;
  box-shadow: 0 16rpx 40rpx rgba(26, 33, 30, 0.08);
  animation: filter-panel-down 0.22s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  will-change: transform, opacity;
}

.panel-options.category-options {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 20rpx 16rpx;
}

.category-options .panel-option {
  height: 64rpx;
  min-width: 104rpx;
  padding: 0 32rpx;
  border-radius: 32rpx;
}

.panel-options.sort-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.panel-option {
  height: 64rpx;
  min-width: 104rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 32rpx;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 32rpx;
  transition: background-color 0.18s ease-out, transform 0.16s ease-out, box-shadow 0.18s ease-out;
  animation: filter-option-pop 0.34s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  will-change: transform, opacity;
}

.panel-option:active {
  transform: scale(0.96);
}

.panel-option.active {
  background: #e0f6f1;
  box-shadow: 0 4rpx 12rpx rgba(18, 165, 148, 0.12);
}

.panel-delay-0 { animation-delay: 0s; }
.panel-delay-1 { animation-delay: 0.12s; }
.panel-delay-2 { animation-delay: 0.24s; }
.panel-delay-3 { animation-delay: 0.36s; }
.panel-delay-4 { animation-delay: 0.48s; }
.panel-delay-5 { animation-delay: 0.60s; }
.panel-delay-6 { animation-delay: 0.72s; }
.panel-delay-7 { animation-delay: 0.84s; }
.panel-delay-8 { animation-delay: 0.96s; }

.sort-options .panel-option {
  width: 638rpx;
  height: 80rpx;
  border-radius: 32rpx;
}

.panel-option-text {
  font-size: 26rpx;
  line-height: 32rpx;
  color: #1a211e;
}

.panel-option.active .panel-option-text {
  color: #12a594;
  font-weight: 500;
}

.panel-option-arrow {
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 8rpx solid currentColor;
  color: #1a211e;
}

/* 即将上映：Figma Content padding 16px 左右、顶部 4px */
.upcoming-scroll {
  height: 100%;
  padding: 8rpx 32rpx 0;
  box-sizing: border-box;
}

.upcoming-section-title {
  display: flex;
  align-items: center;
  height: 92rpx;
  padding: 32rpx 0 24rpx;
  box-sizing: border-box;
}

.upcoming-section-text {
  position: relative;
  padding-left: 22rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a211e;
  line-height: 36rpx;
}

.upcoming-section-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 6rpx;
  height: 32rpx;
  transform: translateY(-50%);
  border-radius: 4rpx;
  background: #12a594;
}

.recommended-scroll {
  width: 100%;
  white-space: nowrap;
}

.recommended-track {
  display: inline-flex;
  gap: 20rpx;
  padding: 8rpx 0;
  height: 314rpx;
  box-sizing: border-box;
}

.poster-cell {
  flex-shrink: 0;
  width: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poster-cell-img {
  width: 200rpx;
  height: 260rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #eef1f0;
}

.poster-img {
  width: 100%;
  height: 100%;
}

.poster-cell-name {
  width: 100%;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #5f6563;
  line-height: 26rpx;
  text-align: center;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
}
</style>
