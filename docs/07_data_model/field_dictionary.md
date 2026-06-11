# 字段字典

## 1. 通用字段

| 字段 | 含义 | 类型 | 说明 |
|---|---|---|---|
| id | 唯一标识 | integer | 主键，自增 |
| created_at | 创建时间 | datetime | 后端生成 |
| updated_at | 更新时间 | datetime | 更新时生成 |
| status | 状态 | string | 业务状态 |
| note | 备注 | string | 可选说明 |

## 2. Player

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 球员 ID | integer | 是 | 否 | 主键 |
| name | 球员姓名 | string | 是 | 是 | 搜索字段 |
| team_id | 默认球队 ID | integer | 否 | 间接展示 | 可为空 |
| phone | 联系方式 | string | 否 | 否 | 后台字段 |
| note | 备注 | string | 否 | 否 | 后台字段 |
| status | 状态 | string | 是 | 否 | active / inactive |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |
| updated_at | 更新时间 | datetime | 否 | 否 | 系统字段 |

## 3. Team

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 球队 ID | integer | 是 | 否 | 主键 |
| name | 球队名称 | string | 是 | 是 | 搜索字段 |
| note | 备注 | string | 否 | 否 | 后台字段 |
| status | 状态 | string | 是 | 否 | active / inactive |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |
| updated_at | 更新时间 | datetime | 否 | 否 | 系统字段 |

## 4. TeamMember

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 成员关系 ID | integer | 是 | 否 | 主键 |
| team_id | 球队 ID | integer | 是 | 否 | 外键 |
| player_id | 球员 ID | integer | 是 | 是 | 可用于展示成员 |
| role | 成员角色 | string | 否 | 可选 | captain / member |
| is_active | 是否有效 | boolean | 是 | 否 | 默认 true |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |

## 5. CompetitionItem

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 项目 ID | integer | 是 | 否 | 主键 |
| name | 项目名称 | string | 是 | 是 | 例如男子双打、团体积分赛 |
| item_type | 项目类型 | string | 是 | 是 | individual / team |
| display_order | 展示顺序 | integer | 否 | 否 | 前端排序 |
| note | 备注 | string | 否 | 否 | 后台字段 |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |
| updated_at | 更新时间 | datetime | 否 | 否 | 系统字段 |

## 6. MatchResult

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 结果 ID | integer | 是 | 否 | 主键 |
| item_id | 项目 ID | integer | 是 | 是 | 外键 |
| result_scope | 结果范围 | string | 是 | 是 | individual / team |
| rank_label | 名次标签 | string | 否 | 是 | 冠军、亚军、第 1 名等 |
| rank_order | 名次排序值 | integer | 否 | 否 | 用于结果排序 |
| team_id | 球队 ID | integer | 否 | 是 | 球队结果时必填 |
| score_text | 比分文本 | string | 否 | 是 | 可为空 |
| points | 积分 | integer | 是 | 是 | 该结果产生积分 |
| source_type | 来源类型 | string | 是 | 否 | manual / excel |
| upload_batch_id | 上传批次 ID | integer | 否 | 否 | Excel 导入来源 |
| note | 备注 | string | 否 | 是 | 可选展示 |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |
| updated_at | 更新时间 | datetime | 否 | 否 | 系统字段 |

## 7. MatchResultPlayer

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 关联 ID | integer | 是 | 否 | 主键 |
| match_result_id | 结果 ID | integer | 是 | 否 | 外键 |
| player_id | 球员 ID | integer | 是 | 是 | 外键 |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |

## 8. PlayerPoints

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 积分 ID | integer | 是 | 否 | 主键 |
| player_id | 球员 ID | integer | 是 | 是 | 外键 |
| item_id | 项目 ID | integer | 是 | 是 | 外键 |
| match_result_id | 来源结果 ID | integer | 否 | 否 | 外键 |
| points | 积分 | integer | 是 | 是 | 排名来源 |
| description | 积分说明 | string | 否 | 是 | 可选展示 |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |

## 9. TeamPoints

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 积分 ID | integer | 是 | 否 | 主键 |
| team_id | 球队 ID | integer | 是 | 是 | 外键 |
| item_id | 项目 ID | integer | 是 | 是 | 外键 |
| match_result_id | 来源结果 ID | integer | 否 | 否 | 外键 |
| points | 积分 | integer | 是 | 是 | 排名来源 |
| description | 积分说明 | string | 否 | 是 | 可选展示 |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |

## 10. UploadBatch

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 上传批次 ID | integer | 是 | 否 | 主键 |
| filename | 原始文件名 | string | 是 | 否 | 后台展示 |
| file_path | 文件路径 | string | 是 | 否 | 后端内部 |
| status | 状态 | string | 是 | 否 | pending / parsed / imported / failed / cancelled |
| total_rows | 总行数 | integer | 否 | 否 | 解析统计 |
| valid_rows | 有效行数 | integer | 否 | 否 | 解析统计 |
| error_rows | 错误行数 | integer | 否 | 否 | 解析统计 |
| preview_data | 预览数据 | json | 否 | 否 | 后台确认使用 |
| error_log | 错误日志 | text | 否 | 否 | 后台展示 |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |

## 11. AdminUser

| 字段 | 含义 | 类型 | 必填 | 公共端展示 | 说明 |
|---|---|---|---|---|---|
| id | 管理员 ID | integer | 是 | 否 | 主键 |
| username | 用户名 | string | 是 | 否 | 登录名 |
| password_hash | 密码哈希 | string | 是 | 否 | 不存明文 |
| display_name | 显示名 | string | 否 | 否 | 后台展示 |
| status | 状态 | string | 是 | 否 | active / inactive |
| created_at | 创建时间 | datetime | 是 | 否 | 系统字段 |

## 12. 枚举值

### 12.1 status

| 值 | 含义 |
|---|---|
| active | 有效 |
| inactive | 停用 |

### 12.2 CompetitionItem.item_type

| 值 | 含义 |
|---|---|
| individual | 个人项目 |
| team | 球队或积分赛项目 |

### 12.3 MatchResult.result_scope

| 值 | 含义 |
|---|---|
| individual | 个人结果 |
| team | 球队结果 |

### 12.4 MatchResult.source_type

| 值 | 含义 |
|---|---|
| manual | 手工录入 |
| excel | Excel 上传 |

### 12.5 UploadBatch.status

| 值 | 含义 |
|---|---|
| pending | 已上传，待解析 |
| parsed | 已解析，待确认 |
| imported | 已导入 |
| failed | 解析失败 |
| cancelled | 已取消 |
