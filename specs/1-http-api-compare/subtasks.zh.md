# 子任务（细分）— 聚焦 MVP（US1）与基础工作

此文件将 `tasks.md` 中的高层任务拆解为小而可分配的代码变更步骤，任务 ID 延续主列表。

基础子任务（第 2 阶段：类型与核心服务）

- [ ] T028 [P] 在 `src/types/api.ts` 中创建 `ApiConfig` / `ServiceConfig` / `Run` / `ComparisonResult` 的 TypeScript 接口（路径：`src/types/api.ts`）
- [ ] T029 [P] 新增 `nanoid` 导入类型并在 `src/utils/id.ts` 中添加 `createId()` 辅助函数（路径：`src/utils/id.ts`）
- [ ] T030 [P] 更新现有文件以引用新类型：将 `src/services/requestService.ts` 与 `src/services/diffService.ts` 中的内联类型替换为 `src/types/api.ts`（路径：`src/services/requestService.ts`, `src/services/diffService.ts`）

- [ ] T031 [P] 在 `src/services/requestService.ts` 中导出带类型的 `sendRequest(apiConfig: ApiConfig, svc: ServiceConfig): Promise<RequestInfo>`（路径：`src/services/requestService.ts`）
- [ ] T032 [P] 在 `src/services/requestService.ts` 中实现并发与重试的配置对象及默认值（路径：`src/services/requestService.ts`）
- [ ] T033 [P] 为 `sendRequest` 添加单元测试（在测试中 mock 网络响应），文件 `src/services/__tests__/requestService.test.ts`（路径：`src/services/__tests__/requestService.test.ts`）

- [ ] T034 [P] 在 `src/services/diffService.ts` 中导出 `compareResponses(oldResp: ResponseInfo, newResp: ResponseInfo, mappingRules?: MappingRule[]): DiffResult`（路径：`src/services/diffService.ts`）
- [ ] T035 [P] 在 `src/services/diffService.ts` 中实现基本差异结果结构（状态/头/体）与可 JSON 序列化的 `DiffItem`（路径：`src/services/diffService.ts`）
- [ ] T036 [P] 为 `compareResponses` 添加单元测试：覆盖相同负载、状态不匹配、头差异、体差异等场景（路径：`src/services/__tests__/diffService.test.ts`）

- [ ] T037 实现 `runWriter.writeRun(run: Run): Promise<void>`，创建 `runs/<id>/` 并写入 `run.json` 与每个接口的 `results/*.json`（路径：`src/services/runWriter.ts`）
- [ ] T038 添加小工具确保 `.gitignore` 中忽略 `runs/`，并添加 `runs/README.md` 说明（路径：`.gitignore`, `runs/README.md`）

用户故事 1 的子任务（US1 — 单接口对比）

- [ ] T039 [US1] 在 `src/components/CompareRunner/CompareRunner.tsx` 中添加最小控制 UI：接收 `ApiConfig`、`oldService`、`newService`，并提供一个 "Run Single" 按钮，触发 `sendRequest`（路径：`src/components/CompareRunner/CompareRunner.tsx`）
- [ ] T040 [US1] 在 `CompareRunner` 中实现流程：分别调用 `sendRequest`（old/new），将响应传给 `compareResponses`，并接收 `DiffResult`（路径：`src/components/CompareRunner/CompareRunner.tsx`）
- [ ] T041 [US1] 在 `src/components/ResponseDiff/SingleResult.tsx` 下创建 `SingleResult` 呈现组件，用于渲染状态/头/体差异和通过/失败徽章（路径：`src/components/ResponseDiff/SingleResult.tsx`）
- [ ] T042 [US1] 将 `CompareRunner` 与 `SingleResult` 连接：运行完成后显示结果并包含耗时信息（路径：`src/components/CompareRunner/CompareRunner.tsx`, `src/components/ResponseDiff/SingleResult.tsx`）
- [ ] T043 [US1] 实现单次运行产物序列化：运行结束时调用 `runWriter.writeRun` 将 `runs/<id>/single/run.json` 与请求/响应对持久化（路径：`src/services/runWriter.ts`, `src/components/CompareRunner/CompareRunner.tsx`）

测试与 CI（用于 US1 验证）的子任务

- [ ] T044 [US1] 添加一个 Jest 单元测试：mock `requestService` 返回受控响应，并断言 `diffService.compareResponses` 的输出（路径：`src/services/__tests__/diffService.test.ts`）
- [ ] T045 [US1] 添加 React Testing Library 的集成测试：模拟用户输入并点击 "Run Single"，然后断言 `SingleResult` 被显示（路径：`src/components/CompareRunner/__tests__/CompareRunner.test.tsx`）
- [ ] T046 在 `package.json` 中添加 `npm run test:watch` 脚本，并在 `specs/1-http-api-compare/quickstart.md` 中记录运行测试的说明（路径：`package.json`, `specs/1-http-api-compare/quickstart.md`）

可选的小型 UX / 开发体验子任务（可并行）

- [ ] T047 [P] 添加一个用于本地开发的 mock JSON 文件夹 `specs/1-http-api-compare/mocks/`，包含示例 `ApiConfig` 与样例响应（路径：`specs/1-http-api-compare/mocks/sample-api.json`）
- [ ] T048 [P] （如果需要）在 `tsconfig.json` 中添加 TypeScript 路径别名以简化 `src/types` 与 `src/services` 的导入（路径：`tsconfig.json`）

分配说明

- 每个子任务尽量小（1-3 个文件改动）。在可并行的任务上标注 `[P]`。
- 优先级：按顺序完成 T028→T036（类型与服务），接着是 T037-T043（产物写入 + UI 单次运行），最后是测试 T044-T046。

使用说明

- 使用此文件为工程师分配具体子任务并跟踪进度。完成子任务后，请在主 `tasks.md` 或本文件中勾选对应复选框以更新状态。
