# 错误码规范

## 1. 通用错误结构

```json
{
  "detail": "错误描述",
  "code": "ERROR_CODE"
}
```

## 2. 通用错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| BAD_REQUEST | 400 | 请求参数错误 |
| UNAUTHORIZED | 401 | 未登录或认证失败 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 业务冲突 |
| VALIDATION_ERROR | 422 | 字段校验失败 |
| INTERNAL_ERROR | 500 | 系统异常 |

## 3. 认证错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| AUTH_TOKEN_MISSING | 401 | 缺少 Token |
| AUTH_TOKEN_INVALID | 401 | Token 无效 |
| AUTH_TOKEN_EXPIRED | 401 | Token 过期 |
| AUTH_LOGIN_FAILED | 401 | 用户名或密码错误 |
| AUTH_USER_DISABLED | 403 | 用户已停用 |

## 4. 球员错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| PLAYER_NOT_FOUND | 404 | 球员不存在 |
| PLAYER_NAME_REQUIRED | 422 | 球员姓名必填 |
| PLAYER_NAME_DUPLICATED | 409 | 球员姓名重复 |
| PLAYER_STATUS_INVALID | 422 | 球员状态无效 |

## 5. 球队错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| TEAM_NOT_FOUND | 404 | 球队不存在 |
| TEAM_NAME_REQUIRED | 422 | 球队名称必填 |
| TEAM_NAME_DUPLICATED | 409 | 球队名称重复 |
| TEAM_STATUS_INVALID | 422 | 球队状态无效 |
| TEAM_MEMBER_DUPLICATED | 409 | 球队成员重复 |

## 6. 比赛项目错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| ITEM_NOT_FOUND | 404 | 比赛项目不存在 |
| ITEM_NAME_REQUIRED | 422 | 项目名称必填 |
| ITEM_TYPE_INVALID | 422 | 项目类型无效 |

## 7. 成绩错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| RESULT_NOT_FOUND | 404 | 成绩不存在 |
| RESULT_SCOPE_INVALID | 422 | 结果范围无效 |
| RESULT_ITEM_REQUIRED | 422 | 比赛项目必填 |
| RESULT_POINTS_INVALID | 422 | 积分无效 |
| RESULT_PLAYER_REQUIRED | 422 | 个人结果必须选择球员 |
| RESULT_TEAM_REQUIRED | 422 | 球队结果必须选择球队 |
| RESULT_SCOPE_ITEM_MISMATCH | 409 | 结果范围与项目类型不匹配 |
| RESULT_DELETE_DISABLED | 409 | 当前不允许删除成绩 |

## 8. 上传错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| UPLOAD_NOT_FOUND | 404 | 上传批次不存在 |
| UPLOAD_FILE_REQUIRED | 422 | 文件必填 |
| UPLOAD_FILE_TYPE_INVALID | 400 | 文件类型不支持 |
| UPLOAD_PARSE_FAILED | 400 | 文件解析失败 |
| UPLOAD_STATUS_INVALID | 409 | 上传状态不允许当前操作 |
| UPLOAD_ROW_INVALID | 422 | 上传行数据无效 |
| UPLOAD_CONFIRM_EMPTY | 422 | 确认导入行不能为空 |

## 9. 排名错误码

| 错误码 | HTTP 状态 | 说明 |
|---|---:|---|
| RANKING_QUERY_INVALID | 422 | 排名查询参数无效 |

## 10. 前端处理建议

- 401：跳转后台登录页，公共端不应出现 401。
- 404：显示资源不存在。
- 409：显示业务冲突说明。
- 422：展示字段校验或参数错误。
- 500：显示系统异常，并提供刷新入口。
