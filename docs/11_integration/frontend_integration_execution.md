# 前端联调执行结果

执行日期：2026-06-08

## 1. 本次已完成

- 已将 Figma Make 生成的前端页面放入 `frontend/`。
- 已新增真实 API 调用层：`frontend/src/app/api/`。
- 已新增契约类型：`frontend/src/app/types/api.ts`。
- 已将公共端查询、后台登录、后台概览、球员管理、球队管理、成绩录入、成绩管理、排名预览接入真实后端 API。
- 页面已停止引用 `frontend/src/app/components/mock-data.ts`。
- 排名展示使用后端返回的 `ranking`，前端不再自行计算排名。
- Excel 上传使用后端上传、预览、确认导入、取消上传接口。

## 2. 按页面接入结果

| 页面 | 接入结果 | 说明 |
|---|---|---|
| `PublicHome` | 已接入 | 使用公共赛事信息、比赛结果、球队排名、个人排名 API |
| `AdminLogin` | 已接入 | 使用真实登录接口，保存 Bearer Token |
| `AdminLayout` | 已接入 | 显示当前用户，退出时清空 Token |
| `AdminDashboard` | 已接入 | 使用后台概览 API |
| `AdminPlayers` | 已接入 | 支持球员列表、新建、编辑 |
| `AdminTeams` | 已接入 | 支持球队列表、新建、编辑、成员查询、成员保存 |
| `AdminResultEntry` | 已接入 | 支持手工录入和 Excel 上传 |
| `AdminResults` | 已接入 | 支持成绩列表、编辑、删除 |
| `AdminRankings` | 已接入 | 使用后台个人排名、球队排名 API |
| 项目管理页面 | 未开发 | 当前前端没有项目管理页面；比赛项目需先通过后端 API 或数据库配置 |

## 3. API 差异记录

后台概览接口当前真实返回：

```json
{
  "player_count": 0,
  "team_count": 0,
  "result_count": 0,
  "top_players": [],
  "top_teams": []
}
```

`docs/08_api_spec/api_spec-v1.0.md` 中曾规划 `individual_result_count`、`team_result_count` 字段，但当前后端返回中没有这两个字段。

前端处理方式：

- 不伪造字段。
- 将这两个字段按可选字段处理。
- 页面缺失值显示为 `0`。

## 4. 集成测试记录

### 4.1 后端自动化测试

命令：

```bash
cd backend
uv run pytest
```

结果：

```text
4 passed, 1 warning
```

### 4.2 前端构建测试

命令：

```bash
cd frontend
pnpm run build
```

结果：

```text
vite v6.3.5 building for production...
1705 modules transformed.
built in 1.12s
```

### 4.3 后端接口冒烟测试

临时启动：

```bash
cd backend
uv run uvicorn app.main:app --host 127.0.0.1 --port 8010
```

已验证：

| 接口 | 结果 |
|---|---|
| `GET /api/v1/health` | 通过，返回 `{"status":"ok"}` |
| `GET /api/v1/public/event-info` | 通过，返回赛事名称和副标题 |
| `GET /api/v1/public/results?page=1&page_size=5` | 通过，返回空列表 |
| `POST /api/v1/admin/auth/login` | 通过，返回 Bearer Token |
| `GET /api/v1/admin/auth/me` | 通过，返回管理员用户 |
| `GET /api/v1/admin/dashboard` | 通过，返回后台概览数据 |
| `GET /api/v1/admin/players?page=1&page_size=5` | 通过，返回空列表 |

## 5. 依赖安装说明

前端依赖安装时，当前机器的 registry 证书链校验失败，错误为：

```text
UNABLE_TO_GET_ISSUER_CERT_LOCALLY
```

本次为了完成本地构建校验，使用了一次性环境变量关闭 TLS 校验安装依赖：

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm install --registry=https://registry.npmjs.org --config.strict-ssl=false
```

这只是本地安装依赖的临时处理，不影响前端业务代码和 API 契约。
