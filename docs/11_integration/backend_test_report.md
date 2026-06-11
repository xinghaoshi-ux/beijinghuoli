# 后端测试报告

## 1. 测试时间

2026-06-07

## 2. 测试范围

本次测试覆盖 Phase 6 后端 MVP 主链路：

- 健康检查
- 后台登录
- 当前用户接口
- 球队创建
- 球员创建
- 球队成员维护
- 比赛项目创建
- 手工成绩录入
- 公共个人排名
- 公共球队排名
- 公共比赛结果搜索
- Excel 上传
- Excel 解析预览
- Excel 确认导入

## 3. 测试命令

```bash
uv run pytest
uv run ruff check app tests
```

## 4. 测试结果

pytest：

```text
4 passed, 1 warning
```

ruff：

```text
All checks passed
```

## 5. 说明

测试中存在一个来自 passlib 依赖的 Python 3.13 `crypt` 弃用警告，不影响当前 Python 3.11 运行。

## 6. 结论

后端 MVP 主链路测试通过，可以进入前端开发或继续补充后端增强测试。
