## 项目进度与变更记录

日期：2025-11-20

本文档汇总本次会话中我在仓库中完成的修改、排查过程、复现步骤以及后续建议，方便你快速回顾和继续开发。

**一、已完成的主要修改**

- `src/services/requestService.ts`
  - 新增 `proxyPrefix` 支持与 `setProxyPrefix` 方法。
  - 增加 `setUseProxy` 使用开关（已存在，已继续使用）。
  - 当 `useProxy===true` 时，`buildUrl` 会返回以 `proxyPrefix` 开头的相对路径，确保 Vite dev-server 的 proxy 能正确匹配并转发请求。
  - 自动根据请求 body 设置 `Content-Type`（对象 -> `application/json`，字符串 -> `application/x-www-form-urlencoded`）。
  - 仅对支持 body 的方法发送 `data`，并提供 `withCredentials` 选项（默认 false）。

- `vite.config.ts`
  - 更新 dev-server proxy 配置：把 `'/api'` 的 `target` 修改为 `http://localhost:8888`（以匹配你的后端端口），并在转发时去除 `/api` 前缀：`rewrite: path => path.replace(/^/api/, '')`。

- `src/stores/serviceStore.ts`
  - 将代理控制提升为全局状态：新增 `useProxy: boolean`、`proxyPrefix: string`，并添加 `setUseProxy` / `setProxyPrefix`。

- `src/App.tsx`
  - 把“使用代理”开关移至顶部 Header（全局开/关），并在发送请求前从 store 中读取 `useProxy` / `proxyPrefix`，再调用 `RequestService.setUseProxy` 与 `setProxyPrefix`。
  - 精简并美化差异展示：使用单行、符号(`+`、`-`、`~`、`≠`)和颜色标记差异，字段路径清晰可见。

**二、排查与调试（已执行）**

- 已在本地安装依赖并启动开发服务器：

```powershell
npm install
npm run dev
```

- Dev server 启动信息（在我的运行中）：

  - Vite 在 `http://localhost:3001/` 启动（若 3000 被占用会自动换端口）。

- 通过浏览器日志与 curl 验证发现的问题：

  - 直接请求后端（关闭代理）时，浏览器报错：
    - `Access to XMLHttpRequest at 'http://localhost:8888/from/me' from origin 'http://localhost:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...`。
    - 说明后端未返回允许的 CORS 头，浏览器拦截了响应（前端拿不到返回体）。

  - 开启代理（通过 Vite）时，最开始出现 `ECONNREFUSED`，原因是 proxy 的 `target` 端口不对（原为 `8080`，而你的后端在 `8888`）。我已把 proxy `target` 改为 `http://localhost:8888` 并重启 dev server。

  - 你随后在开启代理时观察到 `GET http://localhost:3001/api/from/me 500 (Internal Server Error)`，并且 Vite 报出 `http proxy error` 日志（在我这里出现的最初为 `ECONNREFUSED`；若出现 500，说明代理已转发到后端，但后端返回了 500，需要检查后端日志以定位具体错误）。

**三、如何复现和验证（建议步骤）**

1. 启动本项目的 dev server：

```powershell
npm install
npm run dev
```

2. 在浏览器中打开 `http://localhost:3001/`，确保 Header 中的 `使用代理` 开关为打开（若你希望通过代理避免 CORS）。

3. 在“接口路径”填写以 `/api` 为前缀的路径来命中代理规则，例如：`/api/from/me`（我们在 `vite.config.ts` 中配置了将 `/api` 去掉再转发，所以后端最终会收到 `/from/me`）。

4. 观察浏览器 DevTools → Network：检查 Request URL、Request Headers（包括 `Content-Type`）、Request Payload，以及 Response Headers/Body。

5. 可在终端执行以下命令来辅助定位：

```powershell
# 直接请求后端（检查是否返回 CORS 头）
curl -i -H "Origin: http://localhost:3001" http://localhost:8888/from/me

# 通过 Vite 代理请求（验证 proxy 是否转发且返回正确）
curl -i -H "Origin: http://localhost:3001" http://localhost:3001/api/from/me

# 检查预检（OPTIONS）
curl -i -X OPTIONS -H "Origin: http://localhost:3001" -H "Access-Control-Request-Method: GET" http://localhost:8888/from/me
```

**四、建议的后端（CORS）修复示例**

- Node/Express（最常见示例）：

```js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

app.options('*', cors());

app.post('/from/me', (req, res) => {
  res.json({ ok: true, body: req.body });
});

app.listen(8888);
```

**五、差异显示（说明）**

- 差异现在以“单行”样式展示：
  - 左侧符号：`+`（新增，绿色）、`-`（删除，红色）、`~`（修改，橙色）、`≠`（类型不匹配，紫色）。
  - 中间显示字段路径（例如 `user.name`）。
  - 右侧显示简短的值（旧值/新值），`modified` 类型显示 `- old → + new`。

这有助于在大量差异中快速定位是哪个字段发生了变化，并快速识别变更类型。

**六、下一步建议（可选）**

- 将 `proxyPrefix` 暴露到 UI 的设置面板（方便在不同后端前缀间切换）。
- 在差异行上添加“展开”按钮，点击后可查看格式化的旧/新值详情（如果值很长或复杂）。
- 增加 `withCredentials` 的 UI 开关（如果后端需要 cookie 验证）。
- 若需我继续调试：可以把后端的错误日志（当出现 500 时）贴上来，我可以根据后端返回的堆栈/错误信息给出修复方案。

---

如果你需要我把这份文档放到仓库的另一个位置、改为 `CHANGELOG.md`、或者把其中某部分展开成 README 或设置页面说明，我可以继续修改。你要我接下来做哪一步？
