# API 规范 v1.0

## 1. 通用约定

### 1.1 基础信息

| 项目 | 值 |
|---|---|
| Base URL | `/api/v1` |
| 公共接口前缀 | `/api/v1/public` |
| 后台接口前缀 | `/api/v1/admin` |
| 内容类型 | `application/json` |
| 文件上传 | `multipart/form-data` |
| 后台认证 | Bearer Token，是否启用待最终确认 |
| 分页参数 | `page`、`page_size` |

### 1.2 通用成功响应

单对象：

```json
{
  "data": {},
  "message": "ok"
}
```

列表：

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "page_size": 20
}
```

### 1.3 通用错误响应

```json
{
  "detail": "错误描述",
  "code": "ERROR_CODE"
}
```

## 2. 公共接口

### 2.1 获取赛事信息

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/public/event-info` |
| 用途 | 获取公共端赛事标题和基础说明 |
| 认证 | 无 |

响应：

```json
{
  "data": {
    "name": "北京市活力网球交流系列赛",
    "subtitle": "赛果积分查看平台",
    "description": null
  }
}
```

### 2.2 查询比赛结果

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/public/results` |
| 用途 | 公共端查询比赛结果 |
| 认证 | 无 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 50，最大 100 |
| search | string | 否 | 搜索球员、球队、项目、成绩标签、备注 |
| scope | string | 否 | `individual` / `team`，为空表示全部 |

响应：

```json
{
  "data": [
    {
      "id": 1,
      "item_id": 1,
      "item_name": "男子双打",
      "result_scope": "individual",
      "rank_label": "冠军",
      "rank_order": 1,
      "players": [
        { "id": 1, "name": "张三", "team_name": "住建部队" },
        { "id": 2, "name": "李四", "team_name": "住建部队" }
      ],
      "team": null,
      "score_text": "6:4",
      "points": 100,
      "note": null
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

### 2.3 查询个人排名

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/public/rankings/players` |
| 用途 | 公共端查询个人积分排名 |
| 认证 | 无 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 50，最大 100 |
| search | string | 否 | 搜索球员姓名 |

响应：

```json
{
  "data": [
    {
      "ranking": 1,
      "player_id": 1,
      "player_name": "张三",
      "team_id": 1,
      "team_name": "住建部队",
      "total_points": 180,
      "result_count": 2
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

### 2.4 查询球队排名

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/public/rankings/teams` |
| 用途 | 公共端查询球队积分排名 |
| 认证 | 无 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 50，最大 100 |
| search | string | 否 | 搜索球队名称 |

响应：

```json
{
  "data": [
    {
      "ranking": 1,
      "team_id": 1,
      "team_name": "住建部队",
      "total_points": 300,
      "result_count": 3
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

## 3. 后台认证接口

> 是否启用后台登录待最终确认。若启用，后台管理接口均要求 Bearer Token。

### 3.1 登录

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/auth/login` |
| 用途 | 后台登录 |

请求：

```json
{
  "username": "admin",
  "password": "password"
}
```

响应：

```json
{
  "data": {
    "access_token": "token",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "display_name": "管理员"
    }
  }
}
```

### 3.2 当前用户

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/auth/me` |
| 用途 | 获取当前登录用户 |

响应：

```json
{
  "data": {
    "id": 1,
    "username": "admin",
    "display_name": "管理员"
  }
}
```

## 4. 后台基础数据接口

### 4.1 球员列表

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/players` |
| 用途 | 查询球员列表 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 20，最大 100 |
| search | string | 否 | 姓名搜索 |

响应：

```json
{
  "data": [
    {
      "id": 1,
      "name": "张三",
      "team_id": 1,
      "team_name": "住建部队",
      "phone": null,
      "note": null,
      "status": "active",
      "created_at": "2026-06-07T10:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### 4.2 新建球员

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/players` |
| 用途 | 新建球员 |

请求：

```json
{
  "name": "张三",
  "team_id": 1,
  "phone": null,
  "note": null,
  "status": "active"
}
```

### 4.3 更新球员

| 项目 | 值 |
|---|---|
| 方法 | PUT |
| 路径 | `/admin/players/{player_id}` |
| 用途 | 更新球员 |

请求字段同新建球员，均可按后端 schema 控制是否必填。

### 4.4 球队列表

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/teams` |
| 用途 | 查询球队列表 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 20，最大 100 |
| search | string | 否 | 球队名称搜索 |

响应：

```json
{
  "data": [
    {
      "id": 1,
      "name": "住建部队",
      "member_count": 8,
      "note": null,
      "status": "active",
      "created_at": "2026-06-07T10:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### 4.5 新建球队

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/teams` |
| 用途 | 新建球队 |

请求：

```json
{
  "name": "住建部队",
  "note": null,
  "status": "active"
}
```

### 4.6 更新球队

| 项目 | 值 |
|---|---|
| 方法 | PUT |
| 路径 | `/admin/teams/{team_id}` |
| 用途 | 更新球队 |

请求字段同新建球队。

### 4.7 查询球队成员

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/teams/{team_id}/members` |
| 用途 | 查询球队成员 |

响应：

```json
{
  "data": [
    {
      "id": 1,
      "player_id": 1,
      "player_name": "张三",
      "role": "member",
      "is_active": true
    }
  ]
}
```

### 4.8 保存球队成员

| 项目 | 值 |
|---|---|
| 方法 | PUT |
| 路径 | `/admin/teams/{team_id}/members` |
| 用途 | 覆盖保存球队成员 |

请求：

```json
{
  "members": [
    { "player_id": 1, "role": "member", "is_active": true },
    { "player_id": 2, "role": "captain", "is_active": true }
  ]
}
```

## 5. 后台比赛项目接口

### 5.1 查询比赛项目

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/items` |
| 用途 | 查询比赛项目 |

响应：

```json
{
  "data": [
    {
      "id": 1,
      "name": "男子双打",
      "item_type": "individual",
      "display_order": 1,
      "note": null
    }
  ]
}
```

### 5.2 新建比赛项目

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/items` |
| 用途 | 新建比赛项目 |

请求：

```json
{
  "name": "男子双打",
  "item_type": "individual",
  "display_order": 1,
  "note": null
}
```

### 5.3 更新比赛项目

| 项目 | 值 |
|---|---|
| 方法 | PUT |
| 路径 | `/admin/items/{item_id}` |
| 用途 | 更新比赛项目 |

请求字段同新建比赛项目。

## 6. 后台成绩接口

### 6.1 查询成绩列表

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/results` |
| 用途 | 后台查询成绩 |

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | integer | 否 | 默认 1 |
| page_size | integer | 否 | 默认 20，最大 100 |
| search | string | 否 | 搜索项目、球员、球队、备注 |
| scope | string | 否 | `individual` / `team` |

响应结构同公共比赛结果，后台可额外返回 `source_type`、`upload_batch_id`、`created_at`。

### 6.2 手工创建成绩

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/results` |
| 用途 | 手工录入成绩 |

个人结果请求：

```json
{
  "item_id": 1,
  "result_scope": "individual",
  "rank_label": "冠军",
  "rank_order": 1,
  "player_ids": [1, 2],
  "score_text": "6:4",
  "points": 100,
  "note": null
}
```

球队结果请求：

```json
{
  "item_id": 2,
  "result_scope": "team",
  "rank_label": "第 1 名",
  "rank_order": 1,
  "team_id": 1,
  "score_text": null,
  "points": 120,
  "note": null
}
```

响应：

```json
{
  "data": {
    "id": 1,
    "item_id": 1,
    "result_scope": "individual",
    "points": 100
  },
  "message": "ok"
}
```

### 6.3 更新成绩

| 项目 | 值 |
|---|---|
| 方法 | PUT |
| 路径 | `/admin/results/{result_id}` |
| 用途 | 编辑成绩并同步更新积分 |

请求结构同创建成绩。

### 6.4 删除成绩

| 项目 | 值 |
|---|---|
| 方法 | DELETE |
| 路径 | `/admin/results/{result_id}` |
| 用途 | 删除成绩并同步删除积分 |
| 状态 | 待确认 |

说明：

- 是否开放删除能力待确认。
- 如开放，删除需清理 MatchResultPlayer、PlayerPoints、TeamPoints。

## 7. Excel 上传接口

### 7.1 上传并解析 Excel

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/uploads` |
| 用途 | 上传 Excel 并解析为预览 |
| 内容类型 | `multipart/form-data` |

表单字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| file | file | 是 | `.xlsx` 文件 |

响应：

```json
{
  "data": {
    "id": 1,
    "filename": "results.xlsx",
    "status": "parsed",
    "total_rows": 10,
    "valid_rows": 9,
    "error_rows": 1
  }
}
```

### 7.2 查询上传批次

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/uploads/{upload_id}` |
| 用途 | 查询上传状态 |

### 7.3 查询上传预览

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/uploads/{upload_id}/preview` |
| 用途 | 查询解析预览 |

响应：

```json
{
  "data": [
    {
      "row_number": 2,
      "item_name": "男子双打",
      "item_id": 1,
      "result_scope": "individual",
      "rank_label": "冠军",
      "rank_order": 1,
      "player_names": ["张三", "李四"],
      "player_ids": [1, 2],
      "team_name": null,
      "team_id": null,
      "score_text": "6:4",
      "points": 100,
      "row_status": "normal",
      "error_message": null
    }
  ]
}
```

### 7.4 确认导入

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/uploads/{upload_id}/confirm` |
| 用途 | 确认导入正常行 |

请求：

```json
{
  "confirmed_rows": [2, 3, 4],
  "ignored_rows": [5]
}
```

### 7.5 取消上传

| 项目 | 值 |
|---|---|
| 方法 | POST |
| 路径 | `/admin/uploads/{upload_id}/cancel` |
| 用途 | 取消上传批次 |

## 8. 后台排名接口

### 8.1 后台个人排名预览

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/rankings/players` |
| 用途 | 后台查看个人排名 |

请求和响应同 `/public/rankings/players`。

### 8.2 后台球队排名预览

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/rankings/teams` |
| 用途 | 后台查看球队排名 |

请求和响应同 `/public/rankings/teams`。

## 9. 后台概览接口

### 9.1 获取后台概览

| 项目 | 值 |
|---|---|
| 方法 | GET |
| 路径 | `/admin/dashboard` |
| 用途 | 后台首页概览 |

响应：

```json
{
  "data": {
    "player_count": 24,
    "team_count": 4,
    "result_count": 18,
    "top_players": [],
    "top_teams": []
  }
}
```

## 10. 待确认项

- 后台登录是否强制启用。
- 删除成绩接口是否开放。
- Excel 模板是否拆分个人结果和球队结果。
- Excel 是否允许自动创建不存在的球员或球队。
