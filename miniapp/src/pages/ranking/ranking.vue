<template>
  <view class="page">
    <view class="hero">
      <image
        class="hero-bg"
        src="/static/figma-ranking/Bl6Xc2XtW7QOmaCppJdb3Z_2045_163.png"
        mode="aspectFill"
      />
    </view>

    <view v-if="showRankTabs" class="rank-tabs">
      <view
        class="rank-tab tap-feedback"
        :class="{ active: currentTab === 'total' }"
        hover-class="tap-feedback-hover"
        @click="switchRankTab('total')"
      >
        <text class="rank-tab-text">总榜</text>
        <view v-if="currentTab === 'total'" class="rank-tab-underline"></view>
      </view>
      <view
        class="rank-tab tap-feedback"
        :class="{ active: currentTab === 'monthly' }"
        hover-class="tap-feedback-hover"
        @click="switchRankTab('monthly')"
      >
        <text class="rank-tab-text">月榜</text>
        <view v-if="currentTab === 'monthly'" class="rank-tab-underline"></view>
      </view>
    </view>

    <scroll-view class="rank-list" scroll-y :show-scrollbar="false" @scrolltolower="loadMoreRanks">
      <view v-if="isRankingLoading" class="rank-skeleton-list">
        <view v-for="item in 4" :key="item" class="rank-item skeleton-rank-item">
          <view class="rank-badge skeleton-block"></view>
          <view class="rank-poster skeleton-block"></view>
          <view class="rank-info">
            <view class="rank-skeleton-line skeleton-name skeleton-block"></view>
            <view class="rank-skeleton-line skeleton-duration skeleton-block"></view>
          </view>
        </view>
      </view>
      <view v-else-if="rankedProducts.length === 0" class="empty-state">
        <text class="empty-text">暂无数据</text>
      </view>

      <view
        v-for="(item, index) in visibleRankedProducts"
        :key="item.id"
        class="rank-item tap-feedback"
        hover-class="tap-feedback-hover"
        @click="goDetail(item.id)"
      >
        <view class="rank-badge" :class="getBadgeClass(index)">
          <text class="badge-text">{{ index < 3 ? `TOP ${index + 1}` : index + 1 }}</text>
        </view>
        <view class="rank-poster">
          <image class="poster-img" :src="posterImg(item.poster, 280)" mode="aspectFill" lazy-load />
        </view>
        <view class="rank-info">
          <text class="rank-name">{{ item.name }}</text>
          <text class="rank-duration">时长：{{ item.duration }}</text>
          <text v-if="item.shortDesc" class="rank-desc">{{ item.shortDesc }}</text>
        </view>
      </view>

      <view class="footer-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '../../lib/api'
import { posterImg } from '../../lib/image'

type RankTab = 'total' | 'monthly'

// 榜单数据来自外部排序API：月榜=当月(type1)；总榜=供应商提供的总榜type
// TODO: 供应商给出总榜 type 后，把 TOTAL_RANK_TYPE 改成对应值即可
const MONTHLY_RANK_TYPE = 1
const TOTAL_RANK_TYPE = 2

// 总榜接口未就绪：本期只显示月榜并隐藏 tab。总榜上线后改回 true、默认 tab 可设为 'total'
const showRankTabs = false

const currentTab = ref<RankTab>('monthly')
const allProducts = ref<any[]>([])
const rankedProducts = ref<any[]>([])
const isRankingLoading = ref(true)
const sortListCache: Record<RankTab, string[] | null> = { total: null, monthly: null }

const RANK_BATCH_SIZE = 10
const MAX_RANK_COUNT = 20 // 票房榜单只显示前20名
const rankRenderCount = ref(RANK_BATCH_SIZE)

const visibleRankedProducts = computed(() => rankedProducts.value.slice(0, rankRenderCount.value))

function loadMoreRanks() {
  if (rankRenderCount.value < rankedProducts.value.length) {
    rankRenderCount.value += RANK_BATCH_SIZE
  }
}

// 名称归一化：去空格、全角转半角、去掉常见分隔标点，避免"云顶之城 2077"↔"云顶之城2077"、
// "星际远征：未知疆域"↔"星际远征-未知疆域"这类标点/空格差异导致匹配失败。
function normalizeName(s: string): string {
  return (s || '')
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)) // 全角转半角
    .replace(/[\s·・、。,.\-—–~～:：_]/g, '') // 去空格与常见分隔标点
    .toLowerCase()
}

// 按排序API返回的有序名字匹配产品：命中即进榜（归一化后精确优先，再子串），
// 未命中的名字顺延跳过，不留空号；不在名单里的产品不展示。
function buildRankedProducts(products: any[], sortList: string[]) {
  const used = new Set<string>()
  const result: any[] = []
  const norm = products.map((p: any) => ({ p, n: normalizeName(p.name) }))
  for (const name of sortList) {
    const key = normalizeName(name)
    if (!key) continue
    let hit = norm.find((x) => !used.has(x.p.id) && x.n === key)
    if (!hit) {
      hit = norm.find((x) => !used.has(x.p.id) && x.n !== '' && (x.n.includes(key) || key.includes(x.n)))
    }
    if (hit) {
      used.add(hit.p.id)
      result.push(hit.p)
    }
  }
  return result
}

async function loadTab(tab: RankTab) {
  isRankingLoading.value = true
  try {
    let sortList = sortListCache[tab]
    if (!sortList) {
      const type = tab === 'monthly' ? MONTHLY_RANK_TYPE : TOTAL_RANK_TYPE
      sortList = await api.getSortList(type)
      sortListCache[tab] = sortList
    }
    rankedProducts.value = buildRankedProducts(allProducts.value, sortList).slice(0, MAX_RANK_COUNT)
    rankRenderCount.value = RANK_BATCH_SIZE
  } catch (e) {
    console.error('Failed to load ranking:', e)
    rankedProducts.value = []
  } finally {
    isRankingLoading.value = false
  }
}

function switchRankTab(tab: RankTab) {
  if (currentTab.value === tab) return
  currentTab.value = tab
  loadTab(tab)
}

// tab 页只创建一次，后台改了产品名/海报后不刷新会一直显示旧内容（详情页每次都是新拉的，
// 于是出现「榜单名字和详情页对不上」）。切回该 tab 且超过 REFRESH_INTERVAL 时静默重拉产品。
const REFRESH_INTERVAL = 30 * 1000
let lastLoadedAt = 0

onMounted(async () => {
  try {
    const prodRes = await api.getProducts({ status: 'on' })
    allProducts.value = prodRes.data
    lastLoadedAt = Date.now()
    await loadTab(currentTab.value)
  } catch (e) {
    console.error('Failed to load ranking products:', e)
    isRankingLoading.value = false
  }
})

// 静默刷新：只换数据、不显示骨架屏
onShow(async () => {
  if (!lastLoadedAt || Date.now() - lastLoadedAt < REFRESH_INTERVAL) return
  try {
    const prodRes = await api.getProducts({ status: 'on' })
    allProducts.value = prodRes.data
    lastLoadedAt = Date.now()
    const sortList = sortListCache[currentTab.value]
    if (sortList) {
      rankedProducts.value = buildRankedProducts(allProducts.value, sortList).slice(0, MAX_RANK_COUNT)
    }
  } catch (e) {
    console.error('Failed to refresh ranking products:', e)
  }
})

function getBadgeClass(index: number) {
  if (index === 0) return 'badge-gold'
  if (index === 1) return 'badge-silver'
  if (index === 2) return 'badge-bronze'
  return 'badge-normal'
}

function goDetail(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}
</script>

<style scoped lang="scss">
.page {
  height: 100vh;
  overflow: hidden;
  background-color: #f7f9f8;
  display: flex;
  flex-direction: column;
}

.hero {
  flex-shrink: 0;
  width: 100%;
  height: 440rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #f5f7f6 0%, #eef1f0 100%);
}

.hero-bg {
  width: 100%;
  height: 100%;
}

.rank-tabs {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 48rpx;
  padding: 0 48rpx;
  height: 88rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #dfe2e0;
}
.rank-tab {
  position: relative;
  height: 88rpx;
  display: flex;
  align-items: center;
}
.rank-tab-text {
  font-size: 30rpx;
  color: #7c8481;
  font-weight: 500;
}
.rank-tab.active .rank-tab-text {
  color: #1a211e;
  font-weight: 700;
}
.rank-tab-underline {
  position: absolute;
  left: 50%;
  bottom: 12rpx;
  transform: translateX(-50%);
  width: 44rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #12a594;
}

.rank-list {
  flex: 1;
  height: 0;
  background: #f7f9f8;
}

.rank-item {
  width: 100%;
  height: 176rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 16rpx 48rpx;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 1rpx solid #dfe2e0;
}

.rank-skeleton-list { width: 100%; }
.skeleton-rank-item { pointer-events: none; }
.rank-skeleton-line { border-radius: 999rpx; }
.skeleton-name { width: 220rpx; height: 32rpx; }
.skeleton-duration { width: 160rpx; height: 26rpx; margin-top: 18rpx; }

.rank-badge {
  flex-shrink: 0;
  width: 96rpx;
  height: 40rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-radius: 16rpx;
  overflow: hidden;
  background: #ffffff;
}
.badge-gold { background: linear-gradient(135deg, #f59e0b 0%, #ffe54d 48%, #fbbf24 100%); }
.badge-silver { background: linear-gradient(135deg, #b0cbda 0%, #d3d3d3 48%, #7e94b4 100%); }
.badge-bronze { background: linear-gradient(135deg, #d08c39 0%, #e3a55f 48%, #b8752e 100%); }
.badge-normal { background: #f7f9f8; }
.badge-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 40rpx;
}
.badge-normal .badge-text { color: #868e8b; }

.rank-poster {
  flex-shrink: 0;
  width: 108rpx;
  height: 144rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #eef1f0;
}
.poster-img { width: 100%; height: 100%; }
.poster-placeholder { background: linear-gradient(135deg, #eef1f0 0%, #f7f9f8 100%); }

.rank-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
  overflow: hidden;
}
.rank-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a211e;
  line-height: 34rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-duration, .rank-desc {
  font-size: 24rpx;
  line-height: 28rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-duration { color: #7c8481; }
.rank-desc { color: #5f6563; }

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}
.empty-text { font-size: 28rpx; color: #868e8b; }
.footer-space { height: calc(120rpx + env(safe-area-inset-bottom)); }
</style>
