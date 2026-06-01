<template>
  <view class="page">
    <NavBar />
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
            <text class="filter-text">分类</text>
            <text class="filter-arrow" :class="{ up: panelKey === 'category' }">▼</text>
          </view>
          <view
            class="filter-trigger"
            :class="{ active: panelKey === 'sort' }"
            @click="openPanel('sort')"
          >
            <text class="filter-text">排序</text>
            <text class="filter-arrow" :class="{ up: panelKey === 'sort' }">▼</text>
          </view>
        </view>

        <view class="content-area">
          <scroll-view class="product-list" scroll-y :show-scrollbar="false">
            <view v-if="filteredProducts.length === 0" class="empty-state">
              <text class="empty-text">暂无产品</text>
            </view>
            <view
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
              @click="goDetail(product.id)"
            >
              <view class="poster-wrap">
                <image class="poster" :src="product.poster" mode="aspectFill" />
              </view>
              <view class="card-body">
                <view class="card-main">
                  <text class="card-name">{{ product.name }}</text>
                  <text class="card-duration">时长：{{ product.duration }}</text>
                  <text v-if="product.shortDesc" class="card-desc">{{ product.shortDesc }}</text>
                </view>
                <view class="buy-btn" @click.stop="goDetail(product.id)">
                  <text class="buy-btn-text">详情</text>
                </view>
              </view>
            </view>
            <view class="footer-space"></view>
          </scroll-view>

          <!-- 筛选面板 -->
          <view v-if="panelKey" class="panel-mask" @click="closePanel">
            <view class="panel" @click.stop>
              <view class="panel-options">
                <view
                  v-for="opt in panelOptions"
                  :key="opt.id"
                  class="panel-option"
                  :class="{ active: tempSelected === opt.id }"
                  @click="tempSelected = opt.id"
                >
                  <text class="panel-option-text">{{ opt.name }}</text>
                </view>
              </view>
              <view class="panel-actions">
                <view class="panel-btn reset" @click="resetPanel">
                  <text class="panel-btn-text reset-text">重置</text>
                </view>
                <view class="panel-btn confirm" @click="confirmPanel">
                  <text class="panel-btn-text confirm-text">确定</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </block>

      <!-- 即将上映 -->
      <view v-else class="upcoming-area">
        <scroll-view class="upcoming-scroll" scroll-y :show-scrollbar="false">
          <view v-if="upcomingAll.length === 0" class="empty-state">
            <text class="empty-text">敬请期待</text>
          </view>

          <template v-else>
            <!-- 推荐栏 -->
            <block v-if="upcomingRecommended.length > 0">
              <view class="upcoming-section-title">
                <text class="upcoming-section-text">推荐</text>
              </view>
              <view class="poster-grid">
                <view
                  v-for="product in upcomingRecommended"
                  :key="product.id"
                  class="poster-cell"
                  @click="goDetail(product.id)"
                >
                  <view class="poster-cell-img">
                    <image class="poster-img" :src="product.poster" mode="aspectFill" />
                  </view>
                  <text class="poster-cell-name">{{ product.name }}</text>
                </view>
              </view>
            </block>

            <!-- 敬请期待栏 -->
            <view class="upcoming-section-title">
              <text class="upcoming-section-text">敬请期待</text>
            </view>
            <view class="upcoming-list">
              <view
                v-for="product in upcomingAll"
                :key="product.id"
                class="product-card"
                @click="goDetail(product.id)"
              >
                <view class="poster-wrap">
                  <image class="poster" :src="product.poster" mode="aspectFill" />
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

const selectedCategory = ref<string>('all')
const selectedSort = ref<string>('default')
const sortOrderList = ref<string[]>([])

const panelKey = ref<PanelKey>('')
const tempSelected = ref<string>('')

const sortOptions = [
  { id: 'default', name: '默认' },
  { id: 'monthly', name: '当月最热' },
  { id: 'daily', name: '当日最热' },
]

const panelOptions = computed(() => {
  if (panelKey.value === 'category') {
    return [{ id: 'all', name: '全部' }, ...categories.value]
  }
  if (panelKey.value === 'sort') {
    return sortOptions
  }
  return []
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

function getSortIndex(productName: string): number {
  let minIdx = 9999
  for (let i = 0; i < sortOrderList.value.length; i++) {
    const sortName = sortOrderList.value[i]
    if (productName.includes(sortName) || sortName.includes(productName)) {
      minIdx = Math.min(minIdx, i)
      break
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
  } catch (e) {
    console.error('Failed to load showing products:', e)
  }

  // 即将上映接口可能尚未部署，单独捕获避免影响正在热映
  try {
    const upcomingRes = await api.getUpcoming()
    upcomingRecommended.value = upcomingRes.recommended
    upcomingAll.value = upcomingRes.all
  } catch (e) {
    console.error('Failed to load upcoming products:', e)
  }
})

function switchTab(key: TabKey) {
  currentTab.value = key
  closePanel()
}

function openPanel(key: 'category' | 'sort') {
  if (panelKey.value === key) {
    closePanel()
    return
  }
  panelKey.value = key
  tempSelected.value = key === 'category' ? selectedCategory.value : selectedSort.value
}

function closePanel() {
  panelKey.value = ''
}

function resetPanel() {
  if (panelKey.value === 'category') {
    tempSelected.value = 'all'
  } else if (panelKey.value === 'sort') {
    tempSelected.value = 'default'
  }
}

function confirmPanel() {
  if (panelKey.value === 'category') {
    selectedCategory.value = tempSelected.value
  } else if (panelKey.value === 'sort') {
    selectedSort.value = tempSelected.value
    fetchSortList(tempSelected.value)
  }
  closePanel()
}

async function fetchSortList(sortKey: string) {
  if (sortKey === 'monthly' || sortKey === 'daily') {
    try {
      const type = sortKey === 'daily' ? 0 : 1
      sortOrderList.value = await api.getSortList(type)
      console.log(`[排序] 类型: ${sortKey === 'daily' ? '当日' : '当月'}, 接口返回顺序:`, sortOrderList.value)
      console.log(`[排序] 当前产品列表:`, products.value.map(p => p.name))
    } catch (e) {
      console.error('Failed to fetch sort list:', e)
      sortOrderList.value = []
    }
  } else {
    sortOrderList.value = []
  }
}

function goDetail(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.page-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 顶部 Tab */
.top-tabs {
  display: flex;
  background: #ffffff;
  padding: 24rpx 0;
}

.top-tab {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
}

.top-tab-text {
  font-size: 32rpx;
  color: #999;
}

.top-tab.active .top-tab-text {
  color: #1a1a1a;
  font-weight: 700;
  font-size: 34rpx;
}

.top-tab-underline {
  position: absolute;
  bottom: -4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: linear-gradient(90deg, #5eead4, #34d399);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: #ffffff;
  padding: 24rpx 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.filter-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.filter-text {
  font-size: 28rpx;
  color: #1a1a1a;
}

.filter-arrow {
  font-size: 18rpx;
  color: #1a1a1a;
  transition: transform 0.2s;
}

.filter-arrow.up {
  transform: rotate(180deg);
  color: #34d399;
}

.filter-trigger.active .filter-text {
  color: #34d399;
}

/* 内容区 */
.content-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.product-list {
  height: 100%;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}

.product-card {
  display: flex;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.poster-wrap {
  flex-shrink: 0;
  width: 180rpx;
  height: 240rpx;
}

.poster {
  width: 100%;
  height: 100%;
}

.card-body {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20rpx 20rpx 20rpx 24rpx;
  overflow: hidden;
}

.card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  justify-content: flex-start;
  overflow: hidden;
  padding-right: 16rpx;
}

.card-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.card-duration {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #666;
}

.card-desc {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tag-list {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag-item {
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  color: #666;
  background: #f5f5f7;
  border-radius: 6rpx;
}

.buy-btn {
  flex-shrink: 0;
  width: 120rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border-radius: 22rpx;
}

.buy-btn-text {
  font-size: 22rpx;
  color: #ffffff;
  line-height: 1;
  text-align: center;
}

.product-list ::-webkit-scrollbar {
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
  color: #999;
}

.footer-space {
  height: 40rpx;
}

/* 筛选面板 */
.panel-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.panel {
  background: #ffffff;
  padding: 16rpx 0 32rpx;
}

.panel-options {
  padding: 0 32rpx;
}

.panel-option {
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.panel-option:last-child {
  border-bottom: none;
}

.panel-option-text {
  font-size: 28rpx;
  color: #1a1a1a;
}

.panel-option.active .panel-option-text {
  color: #34d399;
  font-weight: 600;
}

.panel-actions {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx 0;
}

.panel-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
}

.panel-btn.reset {
  background: #ffffff;
  border: 2rpx solid #d0d0d0;
}

.panel-btn.confirm {
  background: linear-gradient(90deg, #5eead4, #34d399);
}

.panel-btn-text {
  font-size: 28rpx;
}

.reset-text {
  color: #1a1a1a;
}

.confirm-text {
  color: #ffffff;
  font-weight: 600;
}

/* 即将上映 */
.upcoming-area {
  flex: 1;
  overflow: hidden;
}

.upcoming-scroll {
  height: 100%;
  padding: 8rpx 24rpx 0;
  box-sizing: border-box;
}

.upcoming-section-title {
  display: flex;
  align-items: center;
  padding: 24rpx 0 16rpx;
}

.upcoming-section-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  padding-left: 16rpx;
  border-left: 6rpx solid #34d399;
  line-height: 1.2;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.poster-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.poster-cell {
  width: calc((100% - 40rpx) / 3);
  display: flex;
  flex-direction: column;
}

.poster-cell-img {
  width: 100%;
  height: 280rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f0f0f0;
}

.poster-img {
  width: 100%;
  height: 100%;
}

.poster-cell-name {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #1a1a1a;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
</style>
