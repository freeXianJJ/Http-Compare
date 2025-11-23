# Tasks for HTTP API Comparison Tool

Feature: HTTP API Comparison Tool

Phase 1: Setup

- [ ] T001 Install project dependencies referenced in `package.json` (path: `package.json`)
- [ ] T002 Ensure `runs/` artifact directory exists and is git-ignored (path: `runs/`, `.gitignore`)
- [ ] T003 Add local dev scripts for running the UI and tests in `package.json` (path: `package.json`)

Phase 2: Foundational

- [ ] T004 [P] Standardize core types: reconcile and export `ApiConfig`, `ServiceConfig`, `Run`, `ComparisonResult` in `src/types/api.ts` (path: `src/types/api.ts`)
- [ ] T005 [P] Refactor `src/services/requestService.ts` to export a typed `sendRequest(apiConfig, serviceConfig)` and config for concurrency/retry (path: `src/services/requestService.ts`)
- [ ] T006 [P] Refactor `src/services/diffService.ts` to export `compareResponses(oldResp, newResp, mappingRules?)` and a serializable `DiffResult` (path: `src/services/diffService.ts`)
- [ ] T007 Implement runs artifact writer to persist `Run` and `ComparisonResult` JSON into `runs/<id>/` (path: `src/services/runWriter.ts`)

Phase 3: User Stories (priority order)

**User Story 1 - Quick Compatibility Check (P1)**

- [ ] T008 [US1] Create a single-endpoint compare API in UI: wire a control in `src/components/CompareRunner/CompareRunner.tsx` to call `requestService` + `diffService` for one `ApiConfig` and display result (path: `src/components/CompareRunner/CompareRunner.tsx`)
- [ ] T009 [US1] Implement UI result panel for a single comparison showing status/header/body diffs and pass/fail in `src/components/ResponseDiff/index.tsx` (path: `src/components/ResponseDiff/index.tsx`)
- [ ] T010 [US1] Add replay artifact export for a single run to `runs/<id>/single/` including request/response pair (path: `src/components/ResponseDiff/index.tsx` and `src/services/runWriter.ts`)
- [ ] T011 [US1] Add a Jest unit test for `diffService.compareResponses` covering status/header/body diff cases (path: `src/services/__tests__/diffService.test.ts`)
- [ ] T012 [US1] Add UI-level integration test for single-endpoint flow in `src/components/CompareRunner/__tests__/CompareRunner.test.tsx` using React Testing Library (path: `src/components/CompareRunner/__tests__/CompareRunner.test.tsx`)

**User Story 2 - Batch Regression Run (P1)**

- [ ] T013 [US2] Implement batch runner in `src/services/batchRunner.ts` that accepts an `ApiConfig[]`, `oldService`, `newService`, concurrency config, retry and timeout; emits `Run` progress events (path: `src/services/batchRunner.ts`)
- [ ] T014 [US2] Add UI controls to `CompareRunner` for importing list (CSV/JSON) and starting a batch run (path: `src/components/CompareRunner/CompareRunner.tsx`)
- [ ] T015 [US2] Implement run summary aggregation (Passed/Failed/Skipped counts) and store in `Run.summary` (path: `src/services/batchRunner.ts` and `src/services/runWriter.ts`)
- [ ] T016 [US2] Implement pagination, filtering and per-endpoint detail links in the results view (path: `src/components/ResponseDiff/index.tsx`)
- [ ] T017 [US2] Add an end-to-end test that runs a small batch (3 mocked endpoints) and asserts summary counts and artifacts are written (path: `src/services/__tests__/batchRunner.test.ts`)
- [ ] T018 [US2] Provide CSV/JSON export tasks: add exporter utilities `src/services/exporter.ts` to write `Run` as CSV/JSON (path: `src/services/exporter.ts`)

**User Story 3 - Mapping & Transformations (P2)**

- [ ] T019 [US3] Define `MappingRule` model and parser in `src/types/mapping.ts` and include examples in `specs/1-http-api-compare/data-model.md` (path: `src/types/mapping.ts`, `specs/1-http-api-compare/data-model.md`)
- [ ] T020 [US3] Implement mapping/transform pipeline in `diffService` to apply `MappingRule` before comparison (path: `src/services/diffService.ts`)
- [ ] T021 [US3] Add UI to create/edit mapping rules in `src/components/ServiceConfig/` and persist with run invocation (path: `src/components/ServiceConfig/`)
- [ ] T022 [US3] Add unit tests covering mapping rules: rename, ignore, tolerance for number/time fields (path: `src/services/__tests__/diffService-mapping.test.ts`)

Final Phase: Polish & Cross-Cutting Concerns

- [ ] T023 Add authentication UI and configuration storage for `ServiceConfig` supporting API Key / static header token (path: `src/components/ServiceConfig/` and `src/types/api.ts`)
- [ ] T024 Add logging/observability hooks to services (`src/services/*`) and make log level configurable (path: `src/services/logging.ts` and `src/services/*`)
- [ ] T025 Add CI checks: `tsc --noEmit`, `eslint`, `jest --coverage` in `.github/workflows/ci.yml` or local scripts (path: `.github/workflows/ci.yml`, `package.json`)
- [ ] T026 Add documentation updates and Quickstart verification steps in `specs/1-http-api-compare/quickstart.md` (path: `specs/1-http-api-compare/quickstart.md`)
- [ ] T027 [P] Add performance tuning knobs: concurrency default, batch chunking, and timeout settings (path: `src/services/batchRunner.ts` and `src/components/CompareRunner/CompareRunner.tsx`)

Dependencies

- Order: Phase 1 -> Phase 2 (foundational) -> User Stories (US1 & US2 are P1 and can proceed in parallel after foundational tasks) -> US3 -> Final Phase

```markdown
# HTTP 接口对比工具 任务清单

功能：HTTP 接口对比工具

第 1 阶段：初始化（Setup）

- [ ] T001 在 `package.json` 中安装项目依赖（路径：`package.json`）
- [ ] T002 确保存在 `runs/` 产物目录并将其加入 `.gitignore`（路径：`runs/`, `.gitignore`）
- [ ] T003 在 `package.json` 中添加本地开发脚本用于启动 UI 与运行测试（路径：`package.json`）

第 2 阶段：基础（Foundational）

- [ ] T004 [P] 统一核心类型：在 `src/types/api.ts` 中整理并导出 `ApiConfig`、`ServiceConfig`、`Run`、`ComparisonResult`（路径：`src/types/api.ts`）
- [ ] T005 [P] 重构 `src/services/requestService.ts`，导出带类型的 `sendRequest(apiConfig, serviceConfig)` 以及并发/重试配置（路径：`src/services/requestService.ts`）
- [ ] T006 [P] 重构 `src/services/diffService.ts`，导出 `compareResponses(oldResp, newResp, mappingRules?)` 并返回可序列化的 `DiffResult`（路径：`src/services/diffService.ts`）
- [ ] T007 实现运行产物写入器，将 `Run` 与 `ComparisonResult` 写入 `runs/<id>/`（路径：`src/services/runWriter.ts`）

第 3 阶段：用户故事（按优先级顺序）

**用户故事 1 — 快速兼容性检查（P1）**

- [ ] T008 [US1] 在 UI 中添加单接口对比控制：在 `src/components/CompareRunner/CompareRunner.tsx` 中接入控件，调用 `requestService` + `diffService` 对单个 `ApiConfig` 进行对比并展示结果（路径：`src/components/CompareRunner/CompareRunner.tsx`）
- [ ] T009 [US1] 实现单次对比的结果面板，展示状态码/头/Body 的差异并显示通过/失败（路径：`src/components/ResponseDiff/index.tsx`）
- [ ] T010 [US1] 为单次运行添加回放产物导出到 `runs/<id>/single/`，包含请求/响应对（路径：`src/components/ResponseDiff/index.tsx`, `src/services/runWriter.ts`）
- [ ] T011 [US1] 为 `diffService.compareResponses` 添加 Jest 单元测试，覆盖状态/头/体差异场景（路径：`src/services/__tests__/diffService.test.ts`）
- [ ] T012 [US1] 为单接口流程添加 UI 级集成测试，使用 React Testing Library（路径：`src/components/CompareRunner/__tests__/CompareRunner.test.tsx`）

**用户故事 2 — 批量回归运行（P1）**

- [ ] T013 [US2] 在 `src/services/batchRunner.ts` 中实现批量运行器，接受 `ApiConfig[]`、`oldService`、`newService`、并发/重试/超时配置，并支持 `Run` 进度事件（路径：`src/services/batchRunner.ts`）
- [ ] T014 [US2] 在 `CompareRunner` 中添加导入列表（CSV/JSON）与启动批量运行的 UI 控件（路径：`src/components/CompareRunner/CompareRunner.tsx`）
- [ ] T015 [US2] 实现运行汇总聚合（通过/失败/跳过计数）并存入 `Run.summary`（路径：`src/services/batchRunner.ts`, `src/services/runWriter.ts`）
- [ ] T016 [US2] 在结果视图中实现分页、筛选与每个接口的详情链接（路径：`src/components/ResponseDiff/index.tsx`）
- [ ] T017 [US2] 添加端到端测试：运行一个小批量（3 个 mock 接口）并断言汇总计数与产物写入（路径：`src/services/__tests__/batchRunner.test.ts`）
- [ ] T018 [US2] 提供 CSV/JSON 导出工具：新增 `src/services/exporter.ts` 将 `Run` 写为 CSV/JSON（路径：`src/services/exporter.ts`）

**用户故事 3 — 映射与变换（P2）**

- [ ] T019 [US3] 在 `src/types/mapping.ts` 中定义 `MappingRule` 模型与解析器，并在 `specs/1-http-api-compare/data-model.md` 中加入示例（路径：`src/types/mapping.ts`, `specs/1-http-api-compare/data-model.md`）
- [ ] T020 [US3] 在 `diffService` 中实现映射/变换流水线，在比较前应用 `MappingRule`（路径：`src/services/diffService.ts`）
- [ ] T021 [US3] 在 `src/components/ServiceConfig/` 中添加创建/编辑映射规则的 UI，并随运行保存（路径：`src/components/ServiceConfig/`）
- [ ] T022 [US3] 添加映射规则相关的单元测试：重命名、忽略、数值/时间容差（路径：`src/services/__tests__/diffService-mapping.test.ts`）

最终阶段：完善与横切关注点

- [ ] T023 添加认证 UI 与 `ServiceConfig` 的配置存储，支持 API Key / 静态 Header Token（路径：`src/components/ServiceConfig/`, `src/types/api.ts`）
- [ ] T024 为服务添加日志/观测埋点并支持可配置日志级别（路径：`src/services/logging.ts`, `src/services/*`）
- [ ] T025 添加 CI 检查：`tsc --noEmit`、`eslint`、`jest --coverage` 至 `.github/workflows/ci.yml` 或本地脚本（路径：`.github/workflows/ci.yml`, `package.json`）
- [ ] T026 更新文档并在 `specs/1-http-api-compare/quickstart.md` 中验证快速开始步骤（路径：`specs/1-http-api-compare/quickstart.md`）
- [ ] T027 [P] 添加性能调优开关：并发默认值、批次分片、超时设置（路径：`src/services/batchRunner.ts`, `src/components/CompareRunner/CompareRunner.tsx`）

Dependencies

- Order: Phase 1 -> Phase 2 (foundational) -> User Stories (US1 & US2 are P1 and can proceed in parallel after foundational tasks) -> US3 -> Final Phase

Parallel execution examples

- Multiple engineers can work in parallel on:
  - `T004` (types) and `T005`/`T006` (services) because they touch different files but must coordinate type names (`[P]`).
  - `T013` (batch runner) and `T014` (UI import controls) are parallelizable after services export are stabilized (`[P]`).
  - `T018` (exporter) and `T010` (single-run artifact export) can be implemented in parallel (`[P]`).

Implementation strategy

- MVP scope: Focus on **User Story 1** (single-endpoint compare) and minimal Run artifact writing. Deliverables: UI single-run flow, `diffService` core, `requestService` typed, and ability to export single-run JSON artifact. (MVP = US1)
- Incremental delivery: implement foundational types and service contracts first (T004-T006), then US1 (T008-T012). After MVP, implement US2 batch runner (T013-T018) and finally mapping (T019-T022).

Validation checklist

- ALL tasks above follow the required checklist format with Task IDs and file paths.

文件将被修改/生成（摘要）

- `src/types/api.ts`, `src/types/mapping.ts`
- `src/services/requestService.ts`, `src/services/diffService.ts`, `src/services/batchRunner.ts`, `src/services/runWriter.ts`, `src/services/exporter.ts`
- `src/components/CompareRunner/CompareRunner.tsx`, `src/components/ResponseDiff/index.tsx`, `src/components/ServiceConfig/*`
- `specs/1-http-api-compare/tasks.md`（此文件）
```
