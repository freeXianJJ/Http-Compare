# Feature Specification: HTTP API Comparison Tool

**Feature Branch**: `1-http-api-compare`
**Created**: 2025-11-20
**Status**: Draft
**Input**: User description: "我的主要任务是重构一个老项目，大概有200个接口，我的新服务需要完全兼容这些接口，所以我需要开发一个http接口对比工具，具体可以参考docs已经生成的内容"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Compatibility Check (Priority: P1)

A developer wants to verify that the new service returns compatible responses for a single critical endpoint before merging a change.

**Why this priority**: Provides immediate developer feedback and prevents regressions on critical paths.

**Independent Test**: Invoke the comparison for the single endpoint and verify the diff report indicates pass/fail and shows detailed differences.

**Acceptance Scenarios**:

1. **Given** the old service and the new service are reachable and the endpoint mapping exists, **When** the developer runs a single-endpoint comparison, **Then** the tool returns a human-readable diff with status, header, and body differences and a pass/fail indication.
2. **Given** authentication is required and credentials are provided, **When** the developer runs the check, **Then** the tool authenticates and includes authentication-related headers in the comparison.

---

### User Story 2 - Batch Regression Run (Priority: P1)

QA needs to run a full regression comparison across ~200 endpoints to validate compatibility before release.

**Why this priority**: Verifies overall compatibility of the new service at scale; core to the migration's success.

**Independent Test**: Provide a list of endpoints (CSV/JSON) and run a batch job; verify the run completes and produces a summary report and detailed per-endpoint diffs.

**Acceptance Scenarios**:

1. **Given** a configured list of ~200 endpoints and optional mappings, **When** QA starts a batch run, **Then** the run completes (within success criteria time) and outputs a summary showing counts of Passed / Failed / Skipped and a per-endpoint detailed diff.

---

### User Story 3 - Compare with Mapping & Transformations (Priority: P2)

An integrator needs to compare endpoints that have different paths or minor schema differences and wants to define mapping rules (e.g., rename fields, ignore timestamps).

**Why this priority**: Some endpoints will not be 1:1; mappings increase coverage and reduce false negatives.

**Independent Test**: Create a mapping rule for a pair of endpoints and confirm that expected acceptable differences are ignored and the remaining differences are reported.

**Acceptance Scenarios**:

1. **Given** a mapping that renames field `createdAt` to `created_at` and ignores `requestId`, **When** a comparison runs for the mapped pair, **Then** differences limited to those transformed/ignored are not counted as failures.

---

### Edge Cases

- Endpoints requiring interactive or multi-step auth flows.
- Highly dynamic responses (timestamps, non-deterministic IDs) — must be configurable to ignore or normalize.
- Large payloads or streaming responses (may need truncation or sampling).
- Intermittent network failures or rate limiting — tool should retry with exponential backoff and mark transient failures distinctly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST import a list of endpoints to compare (CSV, JSON, or UI-managed list).
- **FR-002**: System MUST perform a single-endpoint comparison between two target base URLs and report differences in status code, headers, response time, and body.
- **FR-003**: System MUST support batch runs over N endpoints and produce an aggregated summary and per-endpoint detailed reports.
- **FR-004**: System MUST allow defining endpoint mappings and field-level transform/ignore rules to accommodate expected differences.
- **FR-005**: System MUST support authentication configuration per target (初始支持 API Key / 静态 Header Token；后续可扩展到 OAuth2 或 mTLS)。
- **FR-006**: System MUST classify differences by type (e.g., breaking vs. cosmetic) according to configurable rules and tolerance thresholds.
- **FR-007**: System MUST export reports in at least two machine-readable formats (JSON, CSV) and one human-readable format (HTML or Markdown summary).
-- **FR-008**: System MUST store run history with metadata (time, target base URLs, mapping used) for reproducibility.
-- **FR-009**: System MUST provide a UI entrypoint for running single and batch comparisons; CLI is out of scope for the initial delivery.
-- **FR-010**: System MUST surface per-endpoint reproducible request/response pairs so developers can replay failing cases locally.

### Key Entities *(include if feature involves data)*

- **EndpointDefinition**: Represents an API endpoint (method, path, query template, expected headers, optional auth config).
- **MappingRule**: Defines transformations or ignore rules applied to compare results (field renames, regex replaces, ignore lists).
- **ComparisonResult**: Stores the outcome for a single endpoint run (status codes, header diffs, body diffs, response times, pass/fail, error meta).
- **Run**: A batch execution containing many ComparisonResults, start/end time, summary metrics, and references to used mappings and configs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tool can complete a comparison of 200 endpoints in under 10 minutes when run from the same data center and network conditions.
- **SC-002**: At least 95% of endpoint comparisons complete without manual intervention (authentication configured or public endpoints).
- **SC-003**: For a provided baseline run, developers can reproduce any failing endpoint locally using provided replay artifacts in under 5 minutes.
- **SC-004**: Reports correctly classify true breaking changes with >= 98% precision (measured by a manual sample review) and provide clear actionable diffs for each failure.
- **SC-005**: Users can export reports in JSON and CSV and open the human-readable summary within 10 seconds for a 200-endpoint run.

## Assumptions

- Both the legacy and new services are reachable from the environment where the comparison tool runs.
- Authentication credentials or tokens for protected endpoints are available to the team running the comparisons.
- Tolerance rules for non-deterministic fields (timestamps, IDs) will be supplied via MappingRule configs or defaults.
- Performance target (200 endpoints < 10 minutes) assumes moderate concurrency (configurable) and reasonable network latency.

## Open Questions / Clarifications


1. 初始支持的认证方法：API Key / 静态 Header Token（由 Q1 选择）。后续可按需加入 OAuth2 Client Credentials 或 mTLS。

2. 默认容差规则（由 Q2 选择）：采用“数值绝对差值 + 时间窗口”的策略。默认值假设为：数值字段绝对差 ±0.1，时间字段允许 ±5 秒。具体阈值可在 MappingRule 中覆盖。

(Limit: up to 3 clarification items — these are prioritized.)

## Notes

- This specification focuses on WHAT the tool must do and WHY; implementation choices (languages, frameworks, storage) are intentionally omitted.
- If you want the spec in Chinese or need different measurable targets, indicate preferred values for `SC-001` and authentication scope.

- 初始交付为前端 UI 为主的实现（不包含 CLI 或后端服务），后续可按需扩展为桌面或 CLI 选项。
