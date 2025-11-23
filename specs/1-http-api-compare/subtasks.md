# Subtasks (granular) — focused on MVP (US1) and foundational work

These subtasks break the high-level tasks in `tasks.md` into small, assignable code-change steps. IDs continue from the main list.

Foundational subtasks (Phase 2: Types & Core Services)

- [ ] T028 [P] Create `ApiConfig` / `ServiceConfig` / `Run` / `ComparisonResult` TypeScript interfaces in `src/types/api.ts` (path: `src/types/api.ts`)
- [ ] T029 [P] Add `nanoid` import types and helper `createId()` util in `src/utils/id.ts` (path: `src/utils/id.ts`)
- [ ] T030 [P] Update existing files to import new types: replace inline type definitions in `src/services/requestService.ts` and `src/services/diffService.ts` to use `src/types/api.ts` (path: `src/services/requestService.ts`, `src/services/diffService.ts`)

- [ ] T031 [P] Add typed export `sendRequest(apiConfig: ApiConfig, svc: ServiceConfig): Promise<RequestInfo>` to `src/services/requestService.ts` (path: `src/services/requestService.ts`)
- [ ] T032 [P] Implement concurrency and retry config object and default values in `src/services/requestService.ts` (path: `src/services/requestService.ts`)
- [ ] T033 [P] Add unit tests for `sendRequest` mocking network responses in `src/services/__tests__/requestService.test.ts` (path: `src/services/__tests__/requestService.test.ts`)

- [ ] T034 [P] In `src/services/diffService.ts` export `compareResponses(oldResp: ResponseInfo, newResp: ResponseInfo, mappingRules?: MappingRule[]): DiffResult` (path: `src/services/diffService.ts`)
- [ ] T035 [P] Implement basic diff result shape (status/header/body) and JSON-serializable `DiffItem` in `src/services/diffService.ts` (path: `src/services/diffService.ts`)
- [ ] T036 [P] Add unit tests for `compareResponses` covering: identical payloads, status mismatch, header diff, body diff (path: `src/services/__tests__/diffService.test.ts`)

- [ ] T037 Implement `runWriter.writeRun(run: Run): Promise<void>` that creates `runs/<id>/` and writes `run.json` and per-endpoint `results/*.json` (path: `src/services/runWriter.ts`)
- [ ] T038 Add a small helper to ensure `runs/` is ignored in `.gitignore` and create README note `runs/README.md` (path: `.gitignore`, `runs/README.md`)

User Story 1 subtasks (US1 — single-endpoint compare)

- [ ] T039 [US1] Add a minimal control UI in `src/components/CompareRunner/CompareRunner.tsx` that accepts `ApiConfig`, `oldService`, `newService`, and a "Run Single" button wired to `sendRequest` (path: `src/components/CompareRunner/CompareRunner.tsx`)
- [ ] T040 [US1] Implement the flow in `CompareRunner` to call `sendRequest` twice (old/new), pass responses to `compareResponses`, and receive a `DiffResult` (path: `src/components/CompareRunner/CompareRunner.tsx`)
- [ ] T041 [US1] Create a `SingleResult` presentational component under `src/components/ResponseDiff/SingleResult.tsx` to render status/header/body diffs and pass/fail badge (path: `src/components/ResponseDiff/SingleResult.tsx`)
- [ ] T042 [US1] Wire `CompareRunner` to show `SingleResult` after run completion and include timing information (path: `src/components/CompareRunner/CompareRunner.tsx`, `src/components/ResponseDiff/SingleResult.tsx`)
- [ ] T043 [US1] Implement artifact serialization for single-run: on run completion, call `runWriter.writeRun` to persist `runs/<id>/single/run.json` and request/response pairs (path: `src/services/runWriter.ts`, `src/components/CompareRunner/CompareRunner.tsx`)

Testing & CI subtasks (for US1 verification)

- [ ] T044 [US1] Add a Jest unit test that mocks `requestService` to return controlled responses and asserts `diffService.compareResponses` outputs (path: `src/services/__tests__/diffService.test.ts`)
- [ ] T045 [US1] Add a React Testing Library integration test for `CompareRunner` that simulates user input and clicks "Run Single", then asserts `SingleResult` is displayed (path: `src/components/CompareRunner/__tests__/CompareRunner.test.tsx`)
- [ ] T046 Add npm script `npm run test:watch` and document running tests in `package.json` and `specs/1-http-api-compare/quickstart.md` (path: `package.json`, `specs/1-http-api-compare/quickstart.md`)

Optional small UX / dev ergonomics subtasks (parallelizable)

- [ ] T047 [P] Add a small mock JSON folder `specs/1-http-api-compare/mocks/` with example `ApiConfig` and sample responses for local dev (path: `specs/1-http-api-compare/mocks/sample-api.json`)
- [ ] T048 [P] Add TypeScript path aliases (if missing) to `tsconfig.json` to simplify imports for `src/types` and `src/services` (path: `tsconfig.json`)

Assignment notes

- Each subtask is intentionally small (1-3 file edits). Mark tasks with `[P]` where safe to parallelize.
- Priority: work in order T028→T036 (types & services), then T037-T043 (run writer + UI single-run), then tests T044-T046.

Use this file to assign specific subtasks to engineers and track progress. When a subtask is complete, update the main `tasks.md` or this file to mark the checkbox.
