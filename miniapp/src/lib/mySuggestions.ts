// 本地记录用户提交过的建议 id（小程序无登录，用本地存储识别"我的建议"）
import { api } from './api'

const KEY = 'my_suggestion_ids'
const READ_KEY = 'my_suggestion_read_reply_ids'
// "我的" 在 tabBar 中的下标（pages.json tabBar 顺序：首页0 / 产品列表1 / 票房榜单2 / 我的3）
const MINE_TAB_INDEX = 3

export function getMySuggestionIds(): string[] {
  try {
    const raw = uni.getStorageSync(KEY)
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function addMySuggestionId(id: string): void {
  if (!id) return
  try {
    const ids = getMySuggestionIds()
    if (!ids.includes(id)) {
      // 新的放最前，最多保留 100 条
      uni.setStorageSync(KEY, [id, ...ids].slice(0, 100))
    }
  } catch {
    // 忽略存储异常
  }
}

// —— 回复红点：记录已读的回复 id ——
export function getReadReplyIds(): string[] {
  try {
    const raw = uni.getStorageSync(READ_KEY)
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function markRepliesRead(ids: string[]): void {
  if (!ids || ids.length === 0) return
  try {
    const merged = Array.from(new Set([...getReadReplyIds(), ...ids]))
    uni.setStorageSync(READ_KEY, merged.slice(-200))
  } catch {
    // 忽略
  }
}

// 拉取我的建议，统计"有回复且未读"的条数
export async function fetchUnreadReplyCount(): Promise<number> {
  const ids = getMySuggestionIds()
  if (ids.length === 0) return 0
  try {
    const list = await api.getMySuggestions(ids)
    const read = getReadReplyIds()
    return list.filter((s: any) => s && s.reply && !read.includes(s.id)).length
  } catch {
    return 0
  }
}

// 刷新底部 Tab 红点，并返回未读数（供页面内入口红点使用）
export async function refreshReplyTabBadge(): Promise<number> {
  const count = await fetchUnreadReplyCount()
  try {
    if (count > 0) uni.showTabBarRedDot({ index: MINE_TAB_INDEX })
    else uni.hideTabBarRedDot({ index: MINE_TAB_INDEX })
  } catch {
    // 非 tab 环境或调用失败时忽略
  }
  return count
}
