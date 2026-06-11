# 前端联调计划

## 1. 当前前端检查结论

Figma Make 生成的前端页面已放入：

```text
frontend/
```

当前前端技术栈：

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/Radix UI 组件
- lucide-react 图标

当前已包含页面：

- `PublicHome`
- `AdminLogin`
- `AdminLayout`
- `AdminDashboard`
- `AdminPlayers`
- `AdminTeams`
- `AdminResultEntry`
- `AdminResults`
- `AdminRankings`

当前主要问题：

- 页面导航使用 `App.tsx` 内部 `useState` 切换，不是真实路由。
- 页面数据来自 `frontend/src/app/components/mock-data.ts`。
- 多个后台页面在组件内部用 `useState` 临时增删改数据。
- 排名由前端 Mock 函数 `computePlayerRankings`、`computeTeamRankings` 计算。
- 这些 Mock 能力必须在联调阶段替换为真实后端 API。

## 2. 联调原则

必须遵守：

- 前端 Mock API 必须替换成真实后端服务 API。
- 所有接口必须基于 `docs/08_api_spec/api_spec-v1.0.md`。
- 后端当前版本未实现的接口，前端只能标注“未开发”。
- 前端不得自行伪造后端能力。
- 排名必须使用后端返回结果，不允许前端自行计算。
- 成绩录入、编辑、删除必须调用后端接口。
- Excel 上传、解析、预览、确认导入必须调用后端接口。
- 每一批接口替换后都要做接口集成测试。

## 3. 后端服务基准

后端目录：

```text
backend/
```

后端启动命令：

```bash
cd backend
uv run uvicorn app.main:app --reload
```

默认后端地址：

```text
http://localhost:8000
```

API Base URL：

```text
http://localhost:8000/api/v1
```

后台默认账号：

```text
admin / admin123
```

## 4. 前端改造目标

### 4.1 新增 API 层

建议新增：

```text
frontend/src/app/api/
```

包含：

- `client.ts`
- `auth.ts`
- `players.ts`
- `teams.ts`
- `items.ts`
- `results.ts`
- `rankings.ts`
- `uploads.ts`
- `dashboard.ts`
- `public.ts`

### 4.2 新增类型定义

建议新增：

```text
frontend/src/app/types/
```

包含：

- `api.ts`
- `auth.ts`
- `player.ts`
- `team.ts`
- `item.ts`
- `result.ts`
- `ranking.ts`
- `upload.ts`
- `dashboard.ts`

### 4.3 替换 Mock 数据

需要移除或停用：

```text
frontend/src/app/components/mock-data.ts
```

需要替换的引用：

| 页面 | 当前 Mock | 替换为 |
|---|---|---|
| `PublicHome` | `results`、`computeTeamRankings`、`computePlayerRankings` | 公共结果、球队排名、个人排名 API |
| `AdminDashboard` | `players`、`teams`、`results`、排名计算 | 后台概览 API |
| `AdminPlayers` | `initialPlayers`、本地增改 | 球员管理 API |
| `AdminTeams` | `initialTeams`、本地增改 | 球队管理 API、成员 API |
| `AdminResultEntry` | `results`、`teams`、`players` | 项目、球员、球队、成绩、上传 API |
| `AdminResults` | `resultsStore`、本地编辑删除 | 成绩管理 API |
| `AdminRankings` | `computePlayerRankings`、`computeTeamRankings` | 后台排名 API |
| `ResultForm` | `teams`、`players` | 球员、球队、项目 API |

## 5. API 对接清单

### 5.1 公共端

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 赛事信息 | `GET /api/v1/public/event-info` | `PublicHome` |
| 公共筛选项 | `GET /api/v1/public/filter-options` | `PublicHome` |
| 比赛结果 | `GET /api/v1/public/results` | `PublicHome` |
| 球队排名 | `GET /api/v1/public/rankings/teams` | `PublicHome` |
| 个人排名 | `GET /api/v1/public/rankings/players` | `PublicHome` |

公共端新增筛选参数：

```text
match_month
match_date
team_id
age_group
```

说明：

- 比赛结果支持 `match_month`、`match_date`、`team_id`、`age_group`。
- 球队排名公共端只发送 `search`、`team_id`，展示最新全局总榜。
- 个人排名公共端只发送 `search`、`team_id`，展示最新全局总榜。
- 排名页筛选球队后只缩小展示范围，排名数字不重新计算。
- 筛选下拉选项必须来自真实接口，不得前端写死。

### 5.2 后台认证

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 登录 | `POST /api/v1/admin/auth/login` | `AdminLogin` |
| 当前用户 | `GET /api/v1/admin/auth/me` | `AdminLayout` |

### 5.3 球员管理

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 球员列表 | `GET /api/v1/admin/players` | `AdminPlayers` |
| 新建球员 | `POST /api/v1/admin/players` | `AdminPlayers` |
| 编辑球员 | `PUT /api/v1/admin/players/{player_id}` | `AdminPlayers` |

### 5.4 球队管理

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 球队列表 | `GET /api/v1/admin/teams` | `AdminTeams` |
| 新建球队 | `POST /api/v1/admin/teams` | `AdminTeams` |
| 编辑球队 | `PUT /api/v1/admin/teams/{team_id}` | `AdminTeams` |
| 查询成员 | `GET /api/v1/admin/teams/{team_id}/members` | `AdminTeams` |
| 保存成员 | `PUT /api/v1/admin/teams/{team_id}/members` | `AdminTeams` |

### 5.5 比赛项目

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 项目列表 | `GET /api/v1/admin/items` | `AdminResultEntry`、`ResultForm` |
| 新建项目 | `POST /api/v1/admin/items` | 如页面无入口，暂不接 |
| 编辑项目 | `PUT /api/v1/admin/items/{item_id}` | 如页面无入口，暂不接 |

说明：

- 当前 Figma 页面没有明确“项目管理”页面。
- 如果前端没有项目管理入口，项目新建/编辑可先标注“未开发”。

### 5.6 成绩管理

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 成绩列表 | `GET /api/v1/admin/results` | `AdminResults` |
| 新建成绩 | `POST /api/v1/admin/results` | `AdminResultEntry` |
| 编辑成绩 | `PUT /api/v1/admin/results/{result_id}` | `AdminResults` |
| 删除成绩 | `DELETE /api/v1/admin/results/{result_id}` | `AdminResults` |

### 5.7 排名预览

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 后台个人排名 | `GET /api/v1/admin/rankings/players` | `AdminRankings` |
| 后台球队排名 | `GET /api/v1/admin/rankings/teams` | `AdminRankings` |

### 5.8 Excel 上传

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 上传解析 | `POST /api/v1/admin/uploads` | `AdminResultEntry` |
| 查询状态 | `GET /api/v1/admin/uploads/{upload_id}` | `AdminResultEntry` |
| 查询预览 | `GET /api/v1/admin/uploads/{upload_id}/preview` | `AdminResultEntry` |
| 确认导入 | `POST /api/v1/admin/uploads/{upload_id}/confirm` | `AdminResultEntry` |
| 取消上传 | `POST /api/v1/admin/uploads/{upload_id}/cancel` | `AdminResultEntry` |

### 5.9 后台概览

| 功能 | 接口 | 前端页面 |
|---|---|---|
| 概览数据 | `GET /api/v1/admin/dashboard` | `AdminDashboard` |

## 6. 分批执行计划

### 第 1 批：前端基础工程整理

目标：

- 保留 Figma Make 生成的 UI。
- 建立真实 API 调用层。
- 设置 API Base URL。
- 建立 Token 存储和请求拦截。

计划操作：

1. 新增 `frontend/src/app/api/client.ts`。
2. 新增 `.env` 示例或 Vite 环境变量说明。
3. 将 `App.tsx` 的原型切换方式整理为可维护结构。
4. 暂不替换全部 Mock，只先建立 API 能力。

集成测试：

- 前端能启动。
- API client 能请求 `GET /api/v1/health`。

### 第 2 批：后台登录联调

目标：

- `AdminLogin` 使用真实登录接口。
- 登录成功保存 Token。
- 后台请求带 Bearer Token。

替换：

- `AdminLogin` 的本地登录逻辑。
- `AdminLayout` 的退出逻辑。

集成测试：

1. 输入 `admin / admin123`。
2. 调用 `POST /admin/auth/login`。
3. 登录成功进入后台。
4. 刷新或进入后台时调用 `GET /admin/auth/me`。
5. 退出后清除 Token。

### 第 3 批：公共端查询联调

目标：

- `PublicHome` 完全移除 Mock 排名和 Mock 结果。
- 公共端只展示后端真实数据。

替换：

- `GET /public/event-info`
- `GET /public/results`
- `GET /public/rankings/teams`
- `GET /public/rankings/players`

集成测试：

1. 后端无数据时显示空状态。
2. 后端有数据时显示比赛结果。
3. 球队排名来自后端。
4. 个人排名来自后端。
5. 搜索参数传给后端。
6. 月份下拉来自 `GET /public/filter-options`。
7. 选择月份后，比赛日期下拉只显示该月份有比赛的日期。
8. 选择球队后，比赛结果只显示该球队参与的比赛。
9. 个人排名选择球队后只过滤展示该球队球员，排名保留全局名次。
10. 年龄组筛选参数只在比赛结果页传给后端。
11. 手机端布局不横向溢出。

### 第 4 批：后台球员、球队联调

目标：

- `AdminPlayers` 和 `AdminTeams` 使用真实 API。
- 本地 `useState` 只保留 UI 状态，不再保存业务数据。

替换：

- 球员列表、新建、编辑。
- 球队列表、新建、编辑。
- 球队成员查询、保存。

集成测试：

1. 新建球队。
2. 新建球员并选择默认球队。
3. 搜索球员。
4. 搜索球队。
5. 打开成员管理。
6. 添加成员并保存。
7. 刷新后成员仍存在。

### 第 5 批：比赛项目和手工成绩录入联调

目标：

- `AdminResultEntry` 的手工录入使用真实接口。
- `ResultForm` 的球员、球队、项目选项来自真实接口。
- 手工录入和 Excel 上传均支持比赛日期。
- 后台所有“组别”文案改为“年龄组”。

替换：

- 项目列表 API。
- 球员列表 API。
- 球队列表 API。
- 新建成绩 API。

未开发标注：

- 当前前端没有项目管理页面。若需要新建/编辑项目入口，先在页面中标注“项目管理未开发”，不在前端伪造。

集成测试：

1. 选择比赛日期。
2. 填写比赛日期、场地、年龄组。
3. 选择两支球队。
4. 选择双方球员。
5. 填写双方比分并保存。
6. 后端自动计算胜方。
7. 公共端比赛结果可按该日期查询到新增比赛。

### 第 6 批：成绩管理和排名预览联调

目标：

- `AdminResults` 使用真实成绩列表、编辑、删除接口。
- `AdminRankings` 使用后端排名接口。

替换：

- 成绩列表 API。
- 成绩编辑 API。
- 成绩删除 API。
- 后台个人排名 API。
- 后台球队排名 API。

集成测试：

1. 查看成绩列表。
2. 搜索成绩。
3. 编辑成绩积分。
4. 保存后排名同步变化。
5. 删除成绩。
6. 删除后对应排名同步变化。
7. 后台排名与公共端排名一致。

### 第 7 批：Excel 上传联调

目标：

- `AdminResultEntry` 的 Excel 上传使用真实上传接口。
- 不再使用本地 samplePreview。

替换：

- 上传解析 API。
- 预览 API。
- 确认导入 API。
- 取消上传 API。

集成测试：

1. 上传 `.xlsx` 文件。
2. 后端返回上传批次。
3. 页面展示解析预览。
4. 错误行标注错误说明。
5. 正常行可确认导入。
6. 确认导入后成绩列表出现导入数据。
7. 公共端排名和比赛结果同步变化。

## 7. 真实接口测试顺序

每一批完成后执行：

1. 后端测试：

```bash
cd backend
uv run pytest
```

2. 前端构建：

```bash
cd frontend
pnpm install
pnpm build
```

3. 启动后端：

```bash
cd backend
uv run uvicorn app.main:app --reload
```

4. 启动前端：

```bash
cd frontend
pnpm dev
```

5. 浏览器手工联调：

- 公共端
- 后台登录
- 球员管理
- 球队管理
- 成绩录入
- 成绩管理
- 排名预览
- Excel 上传

## 8. 未开发标注规则

如果后端当前版本没有接口，前端必须显示：

```text
未开发
```

当前预计可能需要标注“未开发”的位置：

- 比赛项目管理页面，当前前端未设计该页面。
- 如后续发现 Figma 原型中存在后端无接口的按钮，也必须标注“未开发”。

不得：

- 用本地数组模拟接口成功。
- 用前端计算替代排名接口。
- 用静态数据冒充上传结果。
- 用本地状态冒充保存成功。

## 9. 待确认后再执行

待你确认后，才开始执行：

1. 建立前端 API 层。
2. 替换 Mock 数据。
3. 分批联调接口。
4. 运行构建和接口测试。
5. 根据联调结果修正前端页面。
