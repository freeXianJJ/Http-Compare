# 数据模型（data-model.md）

以下模型基于仓库现有 `src/types` 与 `docs/技术方案设计.md` 中定义的类型整理，作为 Phase 1 的数据契约。所有实体以 TypeScript 接口形式表达。

实体清单

- **ApiConfig (EndpointDefinition)**
  - 描述：接口定义与请求配置
  - 字段：
    - `id: string`
    - `name: string`
    - `url: string` (例如 `/api/user/{id}`)
    - `method: HttpMethod`
    - `parameters: Parameter[]`
    - `headers: Parameter[]`
    - `createdAt: number`, `updatedAt: number`

- **Parameter**
  - 描述：单个参数或头的元数据
  - 字段：`id`, `name`, `type: ParamType`, `value`, `enabled`, `description?`

- **ServiceConfig**
  - 描述：目标服务的连接与认证信息
  - 字段：`protocol`, `host`, `port`, `token`, `tokenPrefix`, `tokenHeader`

- **RequestInfo**
  - 描述：发送到某一端的请求快照
  - 字段：`url`, `method`, `headers`, `body?`, `timestamp`, `duration`

- **ResponseInfo**
  - 描述：接收到的响应快照
  - 字段：`status`, `statusText`, `headers`, `body`, `timestamp`, `error?`

- **DiffItem / DiffResult**
  - DiffItem：单项差异，包含 `path`, `type`, `oldValue?`, `newValue?`, `oldType?`, `newType?`
  - DiffResult：`identical: boolean`, `differences: DiffItem[]`, `summary`（status/header/body 匹配与差异计数）

- **TestResult / Run**
  - TestResult：单接口一次比较的完整记录，包含 `apiConfig`, `oldService` request/response, `newService` request/response, `diffResult`, `timestamp`
  - Run：批量执行的元信息（id、开始/结束时间、summary、结果条目引用）

- **MappingRule (对比规则)**
  - 描述：允许用户声明字段重命名、忽略路径、正则替换、数值容差和时间窗口
  - 建议字段：
    - `id`, `name`, `rules: Array<{ path: string, action: 'ignore'|'rename'|'normalize'|'tolerance', opts?: any }>`

验证规则与约定

- 所有 ID 使用 `nanoid` 或类似生成器保证唯一。  
- 时间字段比较默认 `±5s`，数值默认 `±0.1`（可覆盖）。  
- 数组比较：简单值数组默认无序比较；复杂对象数组默认采用**键对齐**（key-alignment）策略，优先依据用户指定的主键字段进行匹配，若无指定则使用深度相等匹配策略。

存储说明

- 初始实现将 TestResult 与 Run 按文件系统保存为 JSON（`runs/<run-id>/`），并在 `runs/index.sqlite`（可选）做索引以便快速查询。  


消费端（UI）契约

- 前端 UI 应能接受 `ApiConfig` 列表（通过导入 Swagger 或 UI 管理）并触发比较运行，运行结果写入 artifacts（`runs/<id>/`）供下载或回放。
