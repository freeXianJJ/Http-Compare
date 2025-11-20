# 快速开始（quickstart.md）

本指南给出如何在本地运行前端 UI 的最小步骤，重点是使用浏览器界面完成接口导入、批量触发对比、查看差异与导出结果。

前提

- 已安装 Node.js 18+、npm 或 pnpm（用于开发与本地启动）。
- 已在内网环境中可访问要比较的两个服务地址。

安装依赖（在仓库根目录）：

```powershell
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

运行开发环境（UI）：

```powershell
npm run dev
# 在浏览器打开 http://localhost:5173 （默认 Vite 端口）
```

使用 UI 进行对比（步骤）

1. 打开页面 -> 导入或新建 `ApiConfig`（填写 URL、Method、参数）。
2. 在 Service 配置处填写 `oldService` 和 `newService` 的 Host/Port 与 Token。
3. 在控制面板（CompareRunner）设置并发、重试与超时策略，然后点击“开始对比”。
4. 对比完成后，在结果界面查看差异、筛选/分页、并可导出 JSON/HTML 报告或下载 artifacts（`runs/<id>/` 打包）。

开发与测试

- 核心服务逻辑位于 `src/services/requestService.ts` 与 `src/services/diffService.ts`，可直接在 UI 中调用。  
- 单元测试：`jest`（针对服务函数），功能测试：`@testing-library/react` 或 Playwright（本地运行）。

后续说明

- 本快速开始仅覆盖前端 UI 使用场景。若未来需要桌面写文件或 CLI/CI 集成，可作为后续扩展项实现。
