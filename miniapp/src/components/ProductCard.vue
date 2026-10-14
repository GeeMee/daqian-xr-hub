<template>
  <view class="product-card" :class="[`mode-${mode}`]" @click="handleClick">
    <view class="card-poster">
      <image class="poster-image" :src="posterImg(product.poster, 400)" mode="aspectFill" lazy-load />
      <view v-if="product.tags.length > 0" class="card-tags">
        <text v-for="tag in product.tags" :key="tag" class="tag" :class="getTagClass(tag)">
          {{ tag }}
        </text>
      </view>
    </view>
    <view class="card-info">
      <text class="card-name">{{ product.name }}</text>
      <text v-if="showDesc" class="card-desc">{{ product.shortDesc }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Product } from '../types'
import { posterImg } from '../lib/image'

const props = defineProps<{
  product: Product
  mode?: 'grid' | 'recommend' | 'new'
  showDesc?: boolean
}>()

const emit = defineEmits<{
  click: [product: Product]
}>()

function handleClick() {
  emit('click', props.product)
}

function getTagClass(tag: string): string {
  if (tag === '爆款') return 'tag-hot'
  if (tag === '新品') return 'tag-new'
  if (tag === '限时特惠') return 'tag-sale'
  return ''
}
</script>

<style scoped lang="scss">
.product-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.card-poster {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.mode-grid .card-poster {
  padding-top: 133%; /* 3:4 比例 */
}

.mode-recommend .card-poster {
  padding-top: 100%; /* 1:1 正方形 */
}

.mode-new .card-poster {
  padding-top: 100%;
}

.poster-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.card-tags {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  display: flex;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: #ffffff;
}

.tag-hot {
  background-color: #ff4d4f;
}

.tag-new {
  background-color: #1890ff;
}

.tag-sale {
  background-color: #fa8c16;
}

.card-info {
  padding: 16rpx 12rpx;
  text-align: center;
}

.card-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
