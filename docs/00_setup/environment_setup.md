# 环境配置说明

## 1. 项目类型

前后端分离 Web 应用。

公共端和后台管理端都需要支持浏览器访问，其中公共端必须适配手机端。

## 2. 建议技术栈

后端：

- Python 3.11
- FastAPI
- SQLAlchemy
- Pydantic
- pytest

前端：

- Node.js LTS
- Vue 3
- Vite
- TypeScript
- Element Plus 或轻量组件库

数据库：

- MVP 阶段建议 SQLite 起步，方便独立部署和快速验证。
- 如后续并发、权限、长期运营需求增强，可切换 PostgreSQL。

## 3. 环境变量

建议使用 `.env` 管理本地环境变量，生产环境通过部署平台或服务器环境变量注入。

建议变量：

- `DATABASE_URL`
- `SECRET_KEY`
- `ADMIN_INITIAL_USERNAME`
- `ADMIN_INITIAL_PASSWORD`
- `UPLOAD_DIR`
- `CORS_ORIGINS`

敏感信息不得提交到 Git。

## 4. 本地开发基本要求

- 能启动后端服务
- 能访问后端 API 文档
- 能启动前端开发服务
- 能完成数据库初始化
- 能运行基础测试

## 5. 当前阶段限制

Phase 1 不创建业务代码，不安装依赖，不启动开发服务。

依赖安装、项目脚手架和业务实现将在后续开发阶段执行。
