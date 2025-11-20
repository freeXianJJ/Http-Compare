# Phase 0 — Research: 解决技术未决项

本文件记录为 `specs/1-http-api-compare` 在 Phase 0 中需要决策的未决项、每项的决策、理由及备选方案总结。

## 决策一：语言与运行时
- Decision: 使用 Node.js 18+ 与 TypeScript 5.x（后端/CLI 统一 TypeScript）。
- Rationale: 当前仓库以 TypeScript 为主（frontend 使用 React+TS），项目宪法要求共享代码使用 TypeScript；TypeScript 可同时满足 CLI、服务与前端复用的需求，开发/测试工具成熟、生态完善，且与现有工程兼容性最好。
- Alternatives considered:
  - Python（快速开发），缺点：与现有前端/共享代码兼容差，团队若以 TypeScript 为主则增加多语言维护成本。
  - Go/Rust（高性能），缺点：开发周期与生态成本较高，调试和实现变换规则复杂度提升。

## 决策二：HTTP 客户端与并发策略
- Decision: 采用 `undici`（或 Node 内建 fetch）为首选 HTTP 客户端，默认并发 N=20，可配置；对失败使用指数退避重试（默认 3 次）。
- Rationale: `undici` 性能优秀且为 Node 官方推荐，支持高并发场景；并发可配置以在 CI/不同网络场景下自调。
- Alternatives:
  - `axios`：API 友好但性能略逊，体现在高并发下。

## 决策三：比较与契约验证库
- Decision: 使用 `ajv` 做 JSON schema 验证与规范契约测试，使用增量/字段级比较工具（自定义规则 + `fast-deep-equal`）处理对象比较；支持正则/路径忽略与字段重命名的 MappingRule。
- Rationale: `ajv` 支持 JSON Schema 且性能良好；对于非结构化文本或复杂差异，允许用户定义 transform/ignore 规则以减少误报。

## 决策四：存储与运行记录
- Decision: 默认文件系统保存运行产物（`runs/<id>/`），并提供可选 SQLite（`better-sqlite3`）用于索引与快速查询历史记录。
- Rationale: 文件系统易于调试与回放（保留原始请求/响应），SQLite 提供轻量级可查询存储，不引入额外服务。

## 决策五：测试与 CI
- Decision: 使用 `jest` 进行单元与集成测试；使用 `nock` 对外部 HTTP 进行 mock；CI pipeline 包含 `tsc --noEmit`、ESLint、Prettier、jest tests + coverage，关键模块 coverage 门控设为 80%。
- Rationale: 满足宪法的测试与覆盖要求，生态成熟。

## 决策六：报告输出
- Decision: 导出 JSON 与 CSV 作为机器可读格式，并生成 HTML 摘要报告（可直接打开或上传到 CI 构件）。

## 决策七：默认容差与认证（基于已确认 Q1/Q2）
- Authentication: 初始支持 API Key / 静态 Header Token（可在目标配置中指定 header 名称和值）；未来可扩展 OAuth2 client-credentials 与 mTLS。
- Tolerance: 数值字段默认绝对差 ±0.1，时间字段 ±5 秒；可在 MappingRule 中为具体字段覆盖。

## Implementation Impact & Next Steps
- 以上决策已被写入 `plan.md` 的技术上下文（Technical Context）。
- Phase 1（设计）应根据以上决策生成 `data-model.md`（描述 `EndpointDefinition`、`Run`、`ComparisonResult` 模型）、`contracts/`（若需 OpenAPI 或契约测试），以及 `quickstart.md`（如何运行 CLI/在 CI 使用）。

---

如果你同意这些决策，我会把 `research.md` 和更新后的 `plan.md` 一并提交到当前分支（我已在本地写入文件）；如需调整某项（例如并发 N 值或容差阈值），请指出要修改的决策项，我会更新并重新提交。 
