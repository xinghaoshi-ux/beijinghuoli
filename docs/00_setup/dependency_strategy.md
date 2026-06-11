# 依赖策略

## 1. 总原则

- 依赖选择以稳定、轻量、易部署为优先。
- MVP 阶段不引入不必要的大型框架。
- 业务能力优先使用后端真实数据，不在前端伪造。
- 前后端依赖版本在进入代码阶段后锁定。

## 2. 后端依赖建议

建议核心依赖：

- `fastapi`
- `uvicorn`
- `sqlalchemy`
- `pydantic`
- `pydantic-settings`
- `python-multipart`
- `openpyxl`
- `pytest`
- `pytest-asyncio`
- `httpx`

说明：

- `openpyxl` 用于 Excel 成绩上传解析。
- `python-multipart` 用于文件上传。
- 如果后台需要登录，可加入鉴权相关依赖。

## 3. 前端依赖建议

建议核心依赖：

- `vue`
- `vite`
- `typescript`
- `vue-router`
- `axios`
- `element-plus`

说明：

- 公共端需要响应式布局。
- 后台管理端可使用 Element Plus 提升表单和表格开发效率。

## 4. 数据库策略

MVP 建议 SQLite 起步：

- 部署简单
- 适合单场赛事
- 便于快速验证后台录入和公共查询

后续如需长期运营或多人并发录入，可迁移 PostgreSQL。

## 5. 锁定策略

进入代码阶段后：

- 后端使用锁文件或明确版本范围。
- 前端使用 lockfile。
- 不随意升级依赖。
- 升级依赖必须先跑测试和构建。
