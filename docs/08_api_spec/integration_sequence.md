# 联调顺序

## 1. 原则

- 先基础数据，后成绩录入。
- 先后台录入，后公共端展示。
- 先手工录入，后 Excel 上传。
- 排名必须由后端返回，前端不自行计算。

## 2. 后端接口开发顺序

### 第 1 批：健康检查与基础结构

- `GET /api/v1/health`
- 通用错误结构
- CORS

### 第 2 批：后台认证，可选但建议

- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/auth/me`

如最终不启用登录，可跳过这一批或保留开发模式认证开关。

### 第 3 批：基础数据

- `GET /api/v1/admin/teams`
- `POST /api/v1/admin/teams`
- `PUT /api/v1/admin/teams/{id}`
- `GET /api/v1/admin/players`
- `POST /api/v1/admin/players`
- `PUT /api/v1/admin/players/{id}`
- `GET /api/v1/admin/teams/{id}/members`
- `PUT /api/v1/admin/teams/{id}/members`

### 第 4 批：比赛项目

- `GET /api/v1/admin/items`
- `POST /api/v1/admin/items`
- `PUT /api/v1/admin/items/{id}`

### 第 5 批：手工成绩录入

- `GET /api/v1/admin/results`
- `POST /api/v1/admin/results`
- `PUT /api/v1/admin/results/{id}`

删除接口是否实现待确认。

### 第 6 批：排名

- `GET /api/v1/admin/rankings/players`
- `GET /api/v1/admin/rankings/teams`
- `GET /api/v1/public/rankings/players`
- `GET /api/v1/public/rankings/teams`

### 第 7 批：公共结果查询

- `GET /api/v1/public/event-info`
- `GET /api/v1/public/results`

### 第 8 批：Excel 上传

- `POST /api/v1/admin/uploads`
- `GET /api/v1/admin/uploads/{id}`
- `GET /api/v1/admin/uploads/{id}/preview`
- `POST /api/v1/admin/uploads/{id}/confirm`
- `POST /api/v1/admin/uploads/{id}/cancel`

### 第 9 批：后台概览

- `GET /api/v1/admin/dashboard`

## 3. 前端联调顺序

### 第 1 批：公共端基础页面

- 页面框架
- 赛事信息接口
- 空状态和错误态

### 第 2 批：后台基础管理

- 球员管理
- 球队管理
- 球队成员管理

### 第 3 批：手工成绩录入

- 项目选择
- 个人结果录入
- 球队结果录入
- 成绩列表

### 第 4 批：排名预览

- 后台个人排名
- 后台球队排名

### 第 5 批：公共端查询

- 比赛结果 tab
- 球队排名 tab
- 个人排名 tab
- 搜索
- 手机端检查

### 第 6 批：Excel 上传

- 上传控件
- 解析预览
- 确认导入
- 错误行提示

## 4. 测试数据建议

最小测试数据：

- 4 支球队
- 每队 4 到 8 名球员
- 2 个个人项目
- 1 个球队项目
- 至少 8 条个人结果
- 至少 4 条球队结果

需要覆盖：

- 同分并列
- 下一名跳号
- 搜索球员
- 搜索球队
- 个人结果多人关联
- 球队结果不分摊给个人

## 5. 验收顺序

1. 后台能录入球员。
2. 后台能录入球队。
3. 后台能维护球队成员。
4. 后台能录入个人结果。
5. 后台能录入球队结果。
6. 后台能看到排名预览。
7. 公共端能看到比赛结果。
8. 公共端能看到个人排名。
9. 公共端能看到球队排名。
10. Excel 上传可解析、预览、确认导入。
11. 手机端公共端无横向溢出。

## 6. 暂不联调

- 球员主页。
- 球队主页。
- 数据导出。
- 操作日志。
- 多赛季。
- 多赛事切换。
