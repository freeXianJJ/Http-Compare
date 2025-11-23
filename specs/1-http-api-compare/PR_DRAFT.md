# PR 草稿：1-http-api-compare — 前端 HTTP 接口对比 MVP 基础实现

分支: `1-http-api-compare`

提交摘要（中文）
- 实现并完善了 Feature `HTTP API Comparison Tool` 的 Phase0/Phase1 基础工作，重点为 MVP（单接口对比）的可运行实现与自动化测试。

主要变更文件
- 新增/修改类型与工具：
  - `src/types/api.ts`（新增 `Run`、`RunSummary`、`ComparisonResult`）
  - `src/utils/id.ts`（新增 `createId()`，使用 `nanoid`）

- 服务层调整与兼容 API：
  - `src/services/requestService.ts`（添加 `RequestConfig`、`defaultRequestConfig`，并导出兼容的 `sendRequest` 包装函数）
  - `src/services/diffService.ts`（保留 `DiffService` 类，新增兼容函数 `compareResponses(oldResp, newResp, mappingRules?)`）
  - `src/services/runWriter.ts`（新增：`writeRun(run, baseDir='runs')`，将 `run.json` 与每个结果写入磁盘）

- 前端组件：
  - `src/components/CompareRunner/CompareRunner.tsx`（已包含单次运行的最小 UI 与并发/重试/超时逻辑）
  - `src/components/ResponseDiff/index.tsx`（结果展示与 JSON 导出）
  - `src/components/ResponseDiff/SingleResult.tsx`（新增：单条结果呈现组件）

- 测试与工具配置：
  - `src/services/__tests__/diffService.test.ts`（已适配 Vitest globals）
  - `src/services/__tests__/requestService.test.ts`（新增，mock axios）
  - `src/services/__tests__/runWriter.test.ts`（新增，验证 run 写入并清理）
  - `vitest.config.ts`（新增，设置 test environment 为 `jsdom`）

主要目标达成情况
- 实现的 MVP 功能（US1 - 单接口对比）包括：
  - 前端可输入 `ApiConfig` JSON 数组，触发单接口 run（对 `client` 与 `user` token 进行两次对比）。
  - 请求由 `requestService` 发出，响应通过 `diffService` 计算差异并通过 `ResponseDiff` 展示。 
  - 可将运行结果导出为 JSON（前端导出）并支持 `runWriter` 将 `runs/<id>/run.json` 与每个结果写入文件系统（用于桌面/Electron 场景或本地测试）。

测试结果
- 我在本地运行了测试：

```powershell
npm install
npm run test
```

- 结果：所有当前测试通过
  - 测试套件：4 个测试文件，5 个测试通过（包括新增的 `runWriter` 测试）

如何在本地验证（复现步骤）
1. 在项目根执行依赖安装：
```powershell
npm install
```
2. 运行所有测试：
```powershell
npm run test
```
3. 在浏览器中运行开发服务器并打开 UI（手动验证）：
```powershell
npm run dev
# 打开 http://localhost:5173
```
4. 在 `CompareRunner` 文本框粘贴示例 `ApiConfig` 数组并点击 “开始对比”，观察结果并导出 JSON。示例：
```json
[ { "id": "1", "name": "ping", "url": "/ping", "method": "GET", "parameters": [], "headers": [] } ]
```

已完成的任务（摘录）
- T001–T003: 初始化/脚本建议（文档层面）
- T004–T007: 类型与基础服务规范
- T028–T036: 类型、`createId`、`requestService`/`diffService` 的改进与单元测试
- T037: `runWriter` 实现与测试
- T039–T043: UI 单次对比实现与展示组件

剩余核心任务（建议下一个 PR 或后续迭代）
- T013/T018: 批量 runner (`batchRunner.ts`) 与导出工具(`exporter.ts`) 的实现与测试
- T019–T022: MappingRule（映射/变换）模型与应用于 `diffService` 的流水线
- T023–T027: 认证 UI、日志/观测、CI 配置与性能调优

建议的 PR 标题与描述
- 标题（建议）："feat: http-api-compare — MVP 单接口对比实现（types, request/diff services, runWriter, UI & tests）"
- PR 描述要点：
  - 本次提交实现了前端优先的单接口对比 MVP：类型、请求/比较服务、run 写入器、UI 最小实现与测试。
  - 附带测试与 `vitest` 配置，所有本地测试通过。建议 reviewer 重点关注 `requestService` 的并发/默认配置、`diffService` 的比较策略和 `runWriter` 的文件写入路径。

建议 reviewers
- `@freeXianJJ`（仓库所有者/功能负责人）
- 前端/测试负责人（如有）

注意事项 / 风险
- `runWriter` 写入文件系统在浏览器环境不可用（仅在 Electron/Node 环境有效）。当前实现假设运行在能访问文件系统的环境或仅供本地调试。若目标仅为浏览器，应使用浏览器端下载或后端服务进行持久化。
- `requestService` 目前使用 `axios`，并在 `research.md` 中建议在 Node 高并发场景考虑 `undici`。后续可评估替换以提升性能。

下一步建议
1. 将本次变更合并到 `1-http-api-compare` 的主分支（或创建 PR 以便 Review）。
2. 在合入后优先实现批量 runner（T013）以满足 US2。
3. 为 MappingRule（T019）补充设计并实现，以减少误报并覆盖 US3。

---
对于单人项目，我们推荐更简洁的 git 流程（无需复杂的多人 PR 步骤）。下面提供两种常用选项：

- 选项 A（推荐：在 feature 分支上工作并直接合并到 `main`）：

```powershell
# 在 feature 分支完成开发后：
git add -A
git commit -m "feat(http-compare): MVP single-run implementation, types, runWriter, tests"
git push origin HEAD

# 将变更合并到主分支（fast-forward 合并，保证线性历史）：
git checkout main
git pull origin main
git merge --ff-only HEAD@{1}  # 将刚刚推送的分支 fast-forward 合并到 main
git push origin main
```

- 选项 B（更简单：直接提交到 `main`，适用于单人小项目）：

```powershell
git checkout main
git pull origin main
git add -A
git commit -m "feat(http-compare): 小改动描述"
git push origin main
```

可选：仓库根下提供了一个方便的 PowerShell 辅助脚本 `scripts/git-single-dev.ps1`，会交互式完成 commit/push 并可选择将当前分支合并到 `main` 并推送。使用方法：

```powershell
# 交互式运行脚本（会提示输入 commit message 与是否合并到 main）
pwsh .\\scripts\\git-single-dev.ps1
```

如果你希望我代为运行提交并合并（我可以在本地执行 `git` 操作并推送），请明确授权。我也可以仅把上述命令提供给你，由你在本地执行。 
