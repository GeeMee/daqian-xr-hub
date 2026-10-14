// 各一级大类的温馨提示默认模板。
// 后台未给某个一级分类单独设置模板时，按分类名称关键词回退到这里的内置内容。
// 文案基底提取自现有产品统一使用的「暖心须知」（✨标题 + <br> 换行 + 🌿结尾），
// 各大类仅追加一条针对性条目，保持门店既有文风。

const wrap = (lines: string[]) => `<p>${lines.join('<br>')}</p>`

const TITLE = '✨沉浸式观影·暖心须知✨'
const CLOSING = '感谢您的配合，愿光影相伴，尽享沉浸式奇遇🌿'

// 所有产品通用的三条基础须知（与现有产品文案一致）
const BASE_ITEMS = [
  '1.观影前请确认周边无障碍物，等候工作人员指示；',
  '2.轻拿轻放VR头显、手柄设备，爱护公共设备；',
  '3.观影中若出现眩晕、眼胀、不适，请立即摘下头显举手示意工作人员；',
]

// VR大空间：即现有产品在用的原版文案
const BIG_SPACE = wrap([TITLE, ...BASE_ITEMS, CLOSING])

// VR密室：追加恐怖元素提示
const ESCAPE_ROOM = wrap([
  TITLE,
  ...BASE_ITEMS,
  '4.本产品含恐怖、惊吓元素，心理承受能力较弱者请谨慎选择，孕妇及心脏病患者不建议体验；',
  CLOSING,
])

// MR游戏：追加虚实结合提示
const MR_GAME = wrap([
  TITLE,
  ...BASE_ITEMS,
  '4.MR为虚实结合体验，请留意周围真实环境与同伴位置，在指定区域内活动；',
  CLOSING,
])

// VR儿童密室：追加家长陪同提示
const KIDS_ESCAPE = wrap([
  TITLE,
  ...BASE_ITEMS,
  '4.未成年人请在家长陪同下体验，请提醒孩子听从工作人员指引；',
  CLOSING,
])

// 未匹配到关键词的通用模板
const GENERIC = wrap([TITLE, ...BASE_ITEMS, CLOSING])

/** 按一级分类名称匹配内置默认模板。「儿童」优先于「密室」判断。 */
export function defaultNoticeTemplate(name: string): string {
  const n = (name || '').toUpperCase()
  if (n.includes('儿童')) return KIDS_ESCAPE
  if (n.includes('密室')) return ESCAPE_ROOM
  if (n.includes('MR')) return MR_GAME
  if (n.includes('大空间')) return BIG_SPACE
  return GENERIC
}
