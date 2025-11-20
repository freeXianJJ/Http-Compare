# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary
实现一个以前端 UI 为主的 HTTP 接口对比工具（用于迁移/回归验证，目标兼容 200+ endpoints）。核心能力包括：前端触发并发双端请求、按规则比较响应（状态码/头/体/耗时）、支持字段级映射/忽略/规范化、在 UI 中展示差异并支持导出 JSON/HTML 报告及下载可回放的 artifacts（`runs/<id>/`）。

技术方案初选：优先复用现有 React + TypeScript 前端资源（`src/services/requestService.ts` 与 `src/services/diffService.ts`），在浏览器环境或桌面版（Electron）中运行比较流程；后端/CLI 与 CI 支持为可选延伸，不在当前交付范围。存储层默认采用浏览器下载或桌面写入的 artifacts，测试以本地运行的 Jest 单元测试与前端功能测试为主。

## Technical Context

**Language/Version**: Node.js 18+ with TypeScript 5.x（与项目宪法一致，优先复用现有 TypeScript 代码）。
**Primary Dependencies**:
- HTTP client: `axios`（前端环境优先，浏览器兼容）；在 node/electron 环境可替换为 `undici`。
- 前端框架：React + TypeScript（复用现有代码）。
- JSON/JSON-schema 比较：现有 `diffService`（首选）；可引入 `fast-deep-equal` / `ajv` 用于契约或规则验证。
- 报告模板：`mustache` / 浏览器端生成 HTML/PDF（供用户下载）。
- 可选：`better-sqlite3` 仅在桌面/开发环境用于索引历史（非必须）。
**Storage**: 默认使用本地文件系统保存 run artifacts（`runs/<id>/`），可选使用 SQLite 保存元数据与索引（便于查询历史）。
**Testing**: 单元使用 `jest`；前端功能测试使用 `@testing-library/react` 或 Playwright（本地运行）。不依赖远程 CI；所有测试可在本地运行并手动验证，CI 配置为可选后续工作。
**Target Platform**: 浏览器（React web UI），可选桌面包装（Electron）用于直接写入文件系统。当前交付以浏览器前端为主，兼容 Windows/macOS/Linux 浏览器环境。
**Project Type**: 以现有前端仓库为主，复用 `src/components/`、`src/services/`，测试在 `tests/` 或 `src/__tests__/`。
**Performance Goals**: 在同一数据中心条件下，完成 200 endpoints 比较总耗时 < 10 分钟（默认并发 N=20，可配置）；单 endpoint 对比目标 p95 < 500ms（网络可变性除外）。
**Constraints**: 支持可配置并发、重试与超时策略；对大体积响应支持流式或采样比较以避免 OOM；报告大小和存储受限于磁盘空间配置。
**Scale/Scope**: 主要目标为单次 200-500 endpoints 的迁移回归测试；长期可扩展到数千 endpoint 的批量比较，但需额外资源规划。

## Constitution Check

GATE: 以下项需在 Phase 0 之前评估并通过（或记录合理豁免）：

- **类型与语言**：宪法要求共享代码使用 TypeScript；计划选用 TypeScript → 符合。
- **测试策略**：宪法要求关键模块 >=80% 覆盖并在 CI 检查。计划包含 Jest 覆盖门控 → 符合（需在 CI pipeline 中配置）。
- **格式化与静态检查**：必须有 ESLint/Prettier 与 `tsc` 检查 → 计划包含这些工具。
- **性能/观测**：计划提出性能目标与可观测性（日志/metrics） → 符合宪法原则。

判定：计划在技术选型上遵守宪法（无直接违反项）。后续实现必须在 CI 中添加相应 gate（lint/type/test/coverage）以保证合规。

## Project Structure

### Documentation (this feature)

```text
specs/1-http-api-compare/
├── plan.md
├── research.md
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: 采用前端优先结构：复用现有 `src/` 前端代码，核心服务放在 `src/services/`（`requestService`、`diffService`），UI 组件放在 `src/components/ResponseDiff` 与 `src/components/ServiceConfig`。不新增 CLI 目录。

## Phase 1 — 设计产物与任务

目标：产出 Phase1 文档与代码骨架，包含 `data-model.md`、`contracts/`、`quickstart.md`，并拆解实现任务以便进入 Phase 2 开发。

交付物：
- `specs/1-http-api-compare/data-model.md` (已生成)
- `specs/1-http-api-compare/contracts/`（OpenAPI 草案，已生成 `openapi.yaml`）
- `specs/1-http-api-compare/quickstart.md` (已生成)

任务清单（Phase 1 — 前端 UI 优先）:

1. 复用并封装现有服务：在 `src/services/` 中确认并调整 `requestService.ts` 与 `diffService.ts` 的导出与类型，确保可在 UI 组件中直接调用 — 0.5d
2. UI 集成骨架：实现 `src/components/CompareRunner` 组件，提供导入 ApiConfig、选择对端、并触发批量运行的控制面板（支持并发配置、重试、超时）— 1.0d
3. 结果展示组件：改造 `src/components/ResponseDiff`，支持分页/筛选、差异高亮、导出 JSON/HTML 报告与下载 artifacts（`runs/<id>/` 打包下载）— 1.0d
4. 测试骨架：编写 Jest 单元测试（服务逻辑）与 React Testing Library 的关键功能测试（控制面板交互、结果渲染）— 0.75d
5. 开发文档与 Quickstart：更新 `quickstart.md` 为 UI 使用指南（如何导入配置、运行对比、导出结果）— 0.25d

估算总计：~3.5 天（单人）以交付前端可用 MVP（支持批量运行、差异展示与导出）。

验收条件（Phase1 完成定义）:
- `data-model.md` 与 `quickstart.md` 已提交到 `1-http-api-compare` 分支并通过 Review。
- 前端包含能批量触发对比的 UI（`CompareRunner`）并能在 UI 中查看差异、导出 JSON/HTML 报告及下载 artifacts。
- 所有核心服务逻辑（请求/比较）有对应的单元测试，前端关键功能有至少一条自动化交互测试可在本地运行。

下一步：若你同意上述任务与估算，我将开始生成 Phase1 的前端集成代码骨架（实现 `src/components/CompareRunner`、调整 `src/services/*`、添加测试骨架），并提交到当前分支；如果你想先调整估算或拆分任务，请指示。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
