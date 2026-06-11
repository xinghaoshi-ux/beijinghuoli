# 本地开发命令说明

## 1. 当前阶段

当前为 Phase 1，只建立文档和项目规则，不启动前后端服务。

以下命令为后续代码阶段的建议命令，最终以实际脚手架为准。

## 2. 后端建议命令

安装依赖：

```bash
uv sync
```

启动服务：

```bash
uv run uvicorn app.main:app --reload
```

运行测试：

```bash
uv run pytest
```

## 3. 前端建议命令

安装依赖：

```bash
pnpm install
```

启动开发服务：

```bash
pnpm dev
```

构建：

```bash
pnpm build
```

## 4. 最小验证标准

后续进入代码阶段后，最小验证标准为：

- 后端 API 文档可访问。
- 后端测试通过。
- 前端开发服务可访问。
- 公共端三大功能入口可见。
- 后台三大录入入口可见。
