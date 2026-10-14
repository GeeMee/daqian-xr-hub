# 大千迷境 XR 产品数据 开放接口说明

对外提供产品库的只读查询能力，供其它系统（小程序、官网、门店大屏等）取产品列表与产品详情。

## 基础信息

- 生产环境 Base URL：`https://daqianxr-admin.daqianmijing.com/api`
  （同一台服务器也可用 `http://8.153.73.225/api`，建议用域名）
- 协议：HTTP/HTTPS，`Content-Type: application/json`，全站 UTF-8
- 鉴权：**所有 GET 查询接口无需 token，可直接调用**（服务端已开放跨域 CORS）。写操作（POST/PUT/DELETE）需要管理员 JWT，不对外提供。
- 返回：HTTP 200 + JSON；产品不存在返回 404 `{ "error": "Not found" }`

---

## 一、产品列表

```
GET /api/products
```

Query 参数（全部可选）：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `page` | number | 页码，默认 `1` |
| `pageSize` | number | 每页条数，默认 `20`（取全量可传 100） |
| `category` | string | 题材（二级分类）ID，按题材筛选 |
| `search` | string | 按产品名称模糊搜索 |
| `status` | string | `on`=已上架，`off`=未上架（即将上线）；不传则全部 |

示例：`GET /api/products?pageSize=100&status=on`

响应：

```json
{
  "data": [ { /* 产品对象，见下方字段表 */ } ],
  "total": 37,
  "page": 1,
  "pageSize": 100
}
```

> 注意：列表里的 `images` 是 **JSON 字符串**（如 `"[\"https://...\"]"`），需要自己 `JSON.parse`；详情接口返回的是已解析好的数组。

---

## 二、首页数据（含「近期上新」）

```
GET /api/products/home
```

无参数。一次性返回轮播图、推荐产品、近期上新三组数据：

```json
{
  "banners": [
    { "id": "...", "image": "https://...", "productId": "...", "productName": "禁闭岛：机械纪元" }
  ],
  "recommended": [ /* isRecommended=true 且已上架，按 sortOrder 升序，最多 6 个 */ ],
  "recent":      [ /* isNew=true 且已上架，按创建时间倒序，即「近期上新」 */ ]
}
```

`recommended` / `recent` 里的每一项都是产品对象（字段同下表，`images` 同样是 JSON 字符串）。

---

## 三、即将上线产品

```
GET /api/products/upcoming
```

返回所有 `isOnShelf=false` 的产品：

```json
{
  "recommended": [ /* 其中 isRecommended=true 的 */ ],
  "all":         [ /* 全部未上架产品，按 sortOrder 升序 */ ]
}
```

---

## 四、产品详情

```
GET /api/products/{id}
```

`id` 取列表里的 `id` 字段。示例：`GET /api/products/clx8k2p9a0001abcd1234efgh`

响应就是一个产品对象（顶层，无 `data` 包装），与列表相比多两点：
- `images` 已是**字符串数组**
- `description` / `notices` 为完整长文本

```json
{
  "id": "clx8k2p9a0001abcd1234efgh",
  "name": "深海遗迹",
  "poster": "https://cdn.daqianmijing.com/.../poster.jpg",
  "video": "https://cdn.daqianmijing.com/.../preview.mp4",
  "productType": "VR体验",
  "shortDesc": "沉浸式深海探秘",
  "horrorLevel": 3,
  "playerCount": "4-6人",
  "duration": "60分钟",
  "onlineDate": "2024-06",
  "description": "在无尽深海中，一座被遗忘的古老神殿正在苏醒……",
  "recommendations": [ { "icon": "✨", "text": "全国首发独家剧本" } ],
  "notices": "温馨提示全文（多行文本）",
  "images": ["https://cdn.daqianmijing.com/.../1.jpg"],
  "isRecommended": true,
  "isNew": false,
  "isOnShelf": true,
  "sortOrder": 1,
  "categories": [ { "id": "cat_xxx", "name": "科幻" } ],
  "categoryNames": "科幻、解谜",
  "createdAt": "2024-06-01T08:00:00.000Z",
  "updatedAt": "2026-07-20T03:12:44.000Z"
}
```

### 产品字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 产品唯一 ID |
| `name` | string | 产品名称 |
| `poster` | string | 主海报图 URL（未上传时自动使用「敬请期待」占位图） |
| `video` | string | 预告视频 URL，可能为空 |
| `productType` | string | 一级大类名称，如「VR体验」「密室逃脱」，可能为空 |
| `shortDesc` | string | 一句话简介 |
| `horrorLevel` | number | 恐怖指数 0–5（0 表示无，密室类产品使用） |
| `playerCount` | string | 适合人数，如「4-6人」 |
| `duration` | string | 时长，如「60分钟」 |
| `onlineDate` | string | 上线时间，如「2024-06」 |
| `description` | string | 剧情/产品详细介绍（长文本） |
| `recommendations` | array | 官方推荐理由，不限条数/字数，元素为 `{ icon, text }` |
| `notices` | string | 温馨提示（长文本，含换行） |
| `images` | array / string | 详情图集。**详情接口=数组，列表接口=JSON 字符串** |
| `isRecommended` | boolean | 是否首页推荐 |
| `isNew` | boolean | 是否近期上新 |
| `isOnShelf` | boolean | `true`=已上架，`false`=即将上线 |
| `sortOrder` | number | 排序权重，越小越靠前 |
| `categories` | array | 所属题材（二级分类），元素为 `{ id, name }` |
| `categoryNames` | string | 题材名称拼接，顿号分隔，方便直接展示 |
| `createdAt` / `updatedAt` | string | ISO8601 时间 |

---

## 五、分类字典

题材（二级分类，用于列表 `category` 参数）：

```
GET /api/categories
→ { "data": [ { "id": "...", "name": "科幻", "sortOrder": 1, "productCount": 8 } ] }
```

一级大类（对应产品的 `productType` 名称）：

```
GET /api/primary-categories
→ { "data": [ { "id": "...", "name": "VR体验", "sortOrder": 1, "productCount": 12, "noticeTemplate": "..." } ] }
```

> 一级大类是按**名称**跟产品的 `productType` 关联的，按大类筛选产品请在客户端用 `productType === 大类名称` 过滤（列表接口目前没有 `productType` 查询参数）。

---

## 六、其它

服务健康检查：

```
GET /api/health  → { "status": "ok", "time": "2026-07-24T..." }
```

## 调用示例

curl：

```bash
curl "https://daqianxr-admin.daqianmijing.com/api/products?pageSize=100&status=on"
curl "https://daqianxr-admin.daqianmijing.com/api/products/home"
curl "https://daqianxr-admin.daqianmijing.com/api/products/clx8k2p9a0001abcd1234efgh"
```

JavaScript：

```js
const BASE = 'https://daqianxr-admin.daqianmijing.com/api'

// 产品列表
const { data: products } = await fetch(`${BASE}/products?pageSize=100`).then(r => r.json())

// 近期上新
const { recent } = await fetch(`${BASE}/products/home`).then(r => r.json())

// 产品详情
const detail = await fetch(`${BASE}/products/${products[0].id}`).then(r => r.json())
```

## 使用建议

- 图片/视频均为 CDN 直链，接口已统一强制 `https`，可直接使用。
- 海报较大，列表页建议走 OSS 缩略图参数，例如在图片 URL 后拼 `?x-oss-process=image/resize,w_400/quality,q_80`。
- 产品数据变动不频繁，调用方可自行缓存 5–10 分钟，避免高频拉取。
