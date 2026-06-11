# 工具检查清单

## 1. 必需工具

- Python 3.11
- Node.js LTS
- 包管理器：uv 或 pip
- 前端包管理器：pnpm 或 npm
- Git

## 2. 推荐工具

- FastAPI 自动文档
- pytest
- ruff
- TypeScript
- Vite
- 浏览器开发者工具

## 3. 本地检查命令

后续可使用以下命令检查本地环境：

```bash
python --version
node --version
git --version
```

如果使用 uv：

```bash
uv --version
```

如果使用 pnpm：

```bash
pnpm --version
```

## 4. 待确认项

- 前端包管理器最终使用 pnpm 还是 npm。
- 数据库 MVP 是否确定使用 SQLite。
- 后台是否必须登录。
- 部署目标是本地服务器、云服务器、Vercel/Render，还是 Docker。
