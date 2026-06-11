# 住建部、人社部、环保部网球交流赛赛果积分查看平台

本项目是一个独立的单场赛事赛果与积分查看平台，用于支持“住建部、人社部、环保部网球交流赛”的公共查询与后台录入。

当前阶段为 Phase 6：后端 MVP 开发。当前已完成后端主链路实现和测试。

## 项目定位

- 独立项目，不直接改造原有年度积分平台。
- 支持 Web 端和手机端访问。
- 面向单场赛事，不做多赛季、多赛事切换。
- 后续如需求稳定，可再评估与原年度积分系统整合。

## 本版核心功能

公共端：

- 比赛结果查询
- 球队排名与积分
- 个人排名与积分

后台：

- 球队录入
- 球员录入
- 成绩录入

## 暂不实现

- 多赛季管理
- 多赛事切换
- 球员个人主页
- 球队主页
- 数据导出
- 数据变更记录
- 团体积分分摊到个人
- 与原年度积分系统直接集成

## 目录结构

```text
project-root/
├─ frontend/
├─ backend/
├─ docs/
│  ├─ 00_setup/
│  ├─ 03_problem_modeling/
│  ├─ 04_interaction_design/
│  ├─ 05_prd/
│  ├─ 06_architecture/
│  ├─ 07_data_model/
│  ├─ 08_api_spec/
│  ├─ 09_frontend_plan/
│  ├─ 10_ui_design/
│  ├─ 11_integration/
│  └─ 12_release_deployment/
├─ AGENTS.md
└─ README.md
```

## 已完成阶段输出物

- `README.md`
- `AGENTS.md`
- `docs/00_setup/project_boundary.md`
- `docs/00_setup/environment_setup.md`
- `docs/00_setup/tooling_checklist.md`
- `docs/00_setup/dependency_strategy.md`
- `docs/00_setup/local_dev_commands.md`
- `docs/03_problem_modeling/mvp_scope.md`
- `docs/05_prd/prd-v1.0.md`
- `docs/05_prd/mvp_feature_matrix.md`
- `docs/07_data_model/data_model_spec-v1.0.md`
- `docs/07_data_model/entity_relationships.md`
- `docs/07_data_model/field_dictionary.md`
- `docs/07_data_model/business_rules.md`
- `docs/04_interaction_design/main_user_journey.md`
- `docs/04_interaction_design/admin_workflow.md`
- `docs/04_interaction_design/state_and_exception_paths.md`
- `docs/09_frontend_plan/page_inventory.md`
- `docs/09_frontend_plan/frontend_implementation_plan.md`
- `docs/10_ui_design/ui_design_brief.md`
- `docs/08_api_spec/api_spec-v1.0.md`
- `docs/08_api_spec/error_code_spec.md`
- `docs/08_api_spec/integration_sequence.md`
- `docs/08_api_spec/excel_template_spec.md`
- `backend/`
- `docs/06_architecture/backend_implementation_summary.md`
- `docs/11_integration/backend_test_report.md`

## 开发原则

- 先文档，后代码。
- 先收口，后实现。
- 先契约，后联调。
- 主链路优先，MVP 优先。
- 前端不得伪造后端真实能力。
- 后端不得擅自改变 API 契约。
