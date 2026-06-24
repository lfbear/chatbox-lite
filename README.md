# Chatbox Lite

> A **single-file** browser-based multi-model chat page — double-click the HTML and it just works.

Zero dependencies, zero backend, zero install. All data lives in your browser's `localStorage` and is never uploaded to any third-party server. One HTML file is the entire application.

---

## ✨ Features

- **Unified UI across providers**: OpenAI compatible (DeepSeek / Moonshot / SiliconFlow / OpenRouter / vLLM …), Anthropic Claude, Google Gemini, local Ollama / llama.cpp / LM Studio.
- **Streaming output**: Server-Sent Events / NDJSON both supported, rendered as it streams.
- **Resilient local-model streaming**: when a local server (llama.cpp / LM Studio / Ollama) closes the stream with no tokens, or hits a transient network / 5xx error, the request auto-retries a few times before surfacing anything — so the occasional "empty response" recovers itself instead of leaving a blank bubble. Tunable via `state.general.emptyRetries` (default 2).
- **Visible thinking process**: Compatible with OpenAI `reasoning_content`, Ollama `thinking`, Claude `thinking_delta`, Gemini `thought`, and inline `<think>` / `<thinking>` tags (DeepSeek-R1, etc.). One-click toggle, auto-strips leaked prefixes.
- **Full Markdown stack**: GFM tables, code highlighting (highlight.js), KaTeX math, DOMPurify XSS filtering.
- **Vision + files**: Paste/drag-drop images; PDF / DOCX / TXT / source code parsed as context.
- **Self-service model lists**: After filling in Base URL and API Key, click "🔄 Fetch model list" and pick the models you want from a checkbox panel — no more typos.
- **Smart vendor detection**: In OpenAI-compatible mode, the vendor name is auto-extracted from the host as a prefix (`api.deepseek.com` → `DeepSeek · model`).
- **Refined scroll behavior**: Manually scrolling up during streaming pauses auto-follow and floats a "back to latest" button with an unread dot.
- **Personalization**: Custom user / AI display names, light/dark theme, system prompt, temperature, context length, thinking budget.
- **Multi-session**: Manage, rename, delete chats from the left sidebar; JSON export / import.
- **Per-message actions**: Regenerate (re-answer with a different model), edit & resend (puts the message back in the input and truncates what follows).
- **Clear context, keep history**: Drop a "✂ Context cleared" divider with one click (or `Ctrl/⌘+K`) — past messages stay on screen but won't be sent to the model.
- **Responsive**: Collapsible sidebar on mobile, wide layout on desktop.
- **Keyboard friendly**: `Enter` to send, `Shift+Enter` for newline, `Ctrl/⌘+N` for new chat.
- **i18n**: Built-in English / Chinese UI switch (top-left "EN / 中" toggle).

---

## 🚀 Quick start

1. Grab `index.html` from [Releases](https://github.com/lfbear/chatbox-lite/) or `git clone` the repo.
2. Double-click to open in a browser (Chrome / Edge / Firefox recommended).
3. Click "⚙ Settings" at the bottom-left → fill in the Base URL and API Key for any provider.
4. Click **🔄 Fetch model list** next to the model list, pick the models you want → Save.
5. Pick a model from the top dropdown and start chatting.

> You can also host it on any static server (Nginx / GitHub Pages / Cloudflare Pages); the single HTML file needs no build step.

---

## 📱 Install as a desktop / mobile app (PWA)

`index.html` always runs fine on its own as a plain web page. To also make it **installable as a native-style app with offline support**, drop these optional companion files next to it and host everything over **HTTPS** (or `localhost`):

| File | Purpose |
| --- | --- |
| `manifest.webmanifest` | Web App Manifest. Chrome/Edge only offer "Install" when the manifest is a real `https:` file — they reject the inline `blob:` one the page generates on its own. |
| `icon-192.png`, `icon-512.png` | App icons referenced by the manifest. |
| `sw.js` | Service worker — caches the app shell for offline use and makes installability reliable. |

**All of these are optional.** If any is missing (or you open the page via `file://`), `index.html` silently falls back to its built-in inline manifest and keeps working as a normal single-page app — it just won't be installable in Chrome/Edge. Nothing breaks.

- **Chrome / Edge desktop** *(needs the companion files)* — an install icon (⊕) appears at the right of the address bar, or ⋮ menu → **Cast, Save and Share → Install page as App…**. Launches in a chrome-less window.
- **Android Chrome** *(needs the companion files)* — ⋮ menu → **Install app**.
- **macOS Safari (17+)** — **File → Add to Dock…**. Works even in single-file mode (Safari uses the inline `apple-touch-icon` / meta tags).
- **iOS / iPadOS Safari** — Share button → **Add to Home Screen**. Also works in single-file mode.

> **Offline**: once `sw.js` is deployed and you've loaded the page online at least once, the app shell is cached and opens with no network at all. (You still need your model API reachable to actually chat.) Bump the `VERSION` constant in `sw.js` after shipping a new `index.html` to refresh the cache.
>
> **Heads-up after deploying**: Chrome caches the old service worker and installability state aggressively. After updating, hard-reload (DevTools → Application → Service Workers → *Update*), or check in an Incognito window. DevTools → Application → **Manifest** should show the manifest source as your `https://…/manifest.webmanifest` (not a `blob:` URL) — that's the signal it's installable.

**Refresh inside the installed app**: standalone PWAs have no browser refresh button. Tap the **↻** icon that appears in the sidebar header (only shown when running standalone), or on iOS/Android pull down on the message list.

---

## 🔌 Provider configuration

| Type | Base URL example | API Key source |
| --- | --- | --- |
| OpenAI official | `https://api.openai.com/v1` | platform.openai.com |
| DeepSeek | `https://api.deepseek.com/v1` | platform.deepseek.com |
| Moonshot | `https://api.moonshot.cn/v1` | platform.moonshot.cn |
| SiliconFlow | `https://api.siliconflow.cn/v1` | cloud.siliconflow.cn |
| OpenRouter | `https://openrouter.ai/api/v1` | openrouter.ai |
| Anthropic Claude | `https://api.anthropic.com/v1` | console.anthropic.com |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta` | aistudio.google.com |
| Ollama | `http://localhost:11434` | (can be empty) |
| LM Studio | `http://localhost:1234/v1` | (can be empty) |
| llama.cpp | `http://localhost:8080/v1` | (can be empty) |

Any "OpenAI-compatible" relay / proxy can go in the **OpenAI compatible** block; the vendor name is auto-detected from the host and used as the dropdown prefix.

---

## 🌐 CORS and direct-from-browser calls

Because this is a pure front-end app, every request goes **directly from the browser**, so the target service must allow cross-origin requests.

- **OpenAI / Claude / Gemini official endpoints**: native CORS support, works out of the box. Claude requests automatically include `anthropic-dangerous-direct-browser-access: true`.
- **Ollama**: set the environment variable `OLLAMA_ORIGINS=*` before launch, otherwise the browser preflight will be blocked.
  ```bash
  # macOS / Linux
  OLLAMA_ORIGINS=* ollama serve

  # Windows (PowerShell)
  $env:OLLAMA_ORIGINS="*"; ollama serve
  ```
- **Self-hosted reverse proxies**: make sure to return `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers`.

---

## 🔒 Privacy & security

- All API keys, chat history, and configuration are stored **only in local `localStorage`** and are never sent anywhere (except to the model APIs you've configured).
- Do not use on shared computers; exported JSON files contain plaintext keys — keep them safe.
- Markdown rendering is XSS-filtered with DOMPurify.

---

## ⌨️ Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Enter` | Send |
| `Shift+Enter` | Newline |
| `Ctrl` / `⌘` + `Shift` + `O` | New chat |
| `Ctrl` / `⌘` + `N` | New chat (fallback — most browsers reserve this for "new window") |
| `Ctrl` / `⌘` + `K` | Clear context (keep visible history) |

---

## 🛠️ Tech stack

Pure static, no build step:

- [marked](https://marked.js.org/) · Markdown rendering
- [highlight.js](https://highlightjs.org/) · code highlighting
- [KaTeX](https://katex.org/) · math
- [DOMPurify](https://github.com/cure53/DOMPurify) · XSS filtering
- [pdf.js](https://mozilla.github.io/pdf.js/) · PDF text extraction
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) · DOCX text extraction

All libraries are loaded via CDN; if you want fully offline use, replace the `<script>` / `<link>` URLs with local paths.

---

## 📋 Known limitations

- Browser-side calls are sensitive to CORS configuration on self-hosted relays; if you see `Failed to fetch`, check CORS first.
- No Function Calling / Tool Use (this app focuses on plain conversation).
- No streaming token usage stats (some providers don't return them either).
- Image generation, TTS, ASR, and other non-chat capabilities are out of scope.

---

## 🗺️ Roadmap

Suggestions welcome in Issues:

- [ ] Custom providers (add a standalone block for any OpenAI-compatible endpoint)
- [ ] Conversation search
- [ ] Prompt library
- [x] Installable PWA / offline support (optional `manifest.webmanifest` + `sw.js`)

---

## 🤝 Contributing

PRs / issues welcome. The whole app lives in `index.html` — just edit it directly, no build needed. The repo also ships optional PWA companion files (`manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `sw.js`); they're only needed for install/offline and the app runs fine without them.

---

## 📄 License

MIT

---

# Chatbox Lite（中文）

> 一个 **单文件** 浏览器端多模型聊天页面 —— 双击 HTML 文件即开即用。

零依赖、零后端、零安装。所有数据存在你浏览器的 `localStorage` 里，不会上传到任何第三方服务器。一个 HTML 文件就是一个完整的应用。

---

## ✨ 特性

- **多供应商统一界面**：OpenAI 兼容（DeepSeek / Moonshot / 硅基流动 / OpenRouter / vLLM …）、Anthropic Claude、Google Gemini、本地 Ollama / llama.cpp / LM Studio。
- **流式输出**：Server-Sent Events / NDJSON 全部支持，边生成边渲染。
- **本地模型流式容错**：本地服务（llama.cpp / LM Studio / Ollama）有时会在没吐任何 token 的情况下关闭流，或遇到瞬时网络 / 5xx 错误；此时请求会自动重试几次再决定是否报错 —— 偶发的"空响应"能自行恢复，而不是留下一个空气泡。可通过 `state.general.emptyRetries` 调整（默认 2 次）。
- **思考过程可视化**：兼容 OpenAI `reasoning_content`、Ollama `thinking`、Claude `thinking_delta`、Gemini `thought`、以及内联 `<think>` / `<thinking>` 标签（DeepSeek-R1 等），可一键开关、自动剥离泄漏前缀。
- **Markdown 全家桶**：GFM 表格、代码高亮（highlight.js）、KaTeX 数学公式、DOMPurify XSS 过滤。
- **视觉 + 文件**：图片粘贴/拖拽、PDF / DOCX / TXT / 代码文件解析为上下文。
- **模型列表自助拉取**：填完 Base URL 和 API Key，点"🔄 获取模型列表"，从复选框面板里勾选要用的模型，告别手填错字。
- **智能厂商识别**：OpenAI 兼容模式下，自动从 host 提取厂商名作为前缀（`api.deepseek.com` → `DeepSeek · model`）。
- **细致的滚动控制**：流式输出时手动上滚即暂停自动跟随，浮出"回到最新"按钮，含未读小红点。
- **个性化**：自定义"用户名 / AI 名称"、深浅色主题、系统提示词、温度、上下文长度、思考预算。
- **多会话**：左侧栏管理对话、改名、删除；支持 JSON 导出 / 导入。
- **消息级操作**：重新生成（换模型重答）、编辑重发（把消息放回输入框并截断后续）。
- **清除上下文、保留历史**：一键（或 `Ctrl/⌘+K`）插入"✂ 上下文已清除"分隔线 —— 历史消息仍在屏幕上，但不会再发送给模型。
- **响应式**：移动端折叠侧栏、桌面端宽布局。
- **键盘友好**：`Enter` 发送、`Shift+Enter` 换行、`Ctrl/⌘+N` 新建对话。
- **多语言**：内置中英文 UI 切换（左上角"EN / 中"按钮）。

---

## 🚀 快速开始

1. 从 [Releases](https://github.com/lfbear/chatbox-lite/) 或直接 `git clone` 拿到 `index.html`。
2. 双击在浏览器中打开（推荐 Chrome / Edge / Firefox）。
3. 点左下角"⚙ 设置" → 填入任意一个供应商的 Base URL 和 API Key。
4. 点击模型列表旁的 **🔄 获取模型列表**，勾选你要用的模型 → 保存。
5. 顶部下拉选模型，开聊。

> 也可以挂到任意静态服务器（Nginx / GitHub Pages / Cloudflare Pages），单个 HTML 文件无需构建。

---

## 📱 安装为桌面 / 移动应用（PWA）

`index.html` 单独使用时始终能作为普通网页正常运行。如果还想让它**可安装为原生风格的 App，并支持离线**，把下面这几个可选的配套文件和它放在一起，整体挂到 **HTTPS** 网址（或 `localhost`）下即可：

| 文件 | 作用 |
| --- | --- |
| `manifest.webmanifest` | Web App Manifest。Chrome/Edge 只在 manifest 是真实的 `https:` 文件时才提供"安装"——页面自身生成的内联 `blob:` manifest 会被拒绝。 |
| `icon-192.png`、`icon-512.png` | manifest 引用的应用图标。 |
| `sw.js` | Service worker —— 缓存应用外壳以支持离线，并让安装更可靠。 |

**这些文件全都是可选的。** 任意一个缺失（或用 `file://` 直接打开），`index.html` 会静默回退到内置的内联 manifest，继续作为普通单页应用运行 —— 只是在 Chrome/Edge 里无法安装而已，不会出任何错。

- **Chrome / Edge 桌面端**（需要配套文件）—— 地址栏右侧会出现安装图标（⊕），或 ⋮ 菜单 → **投放、保存和共享 → 将页面安装为应用…**。会在独立窗口运行。
- **Android Chrome**（需要配套文件）—— ⋮ 菜单 → **安装应用**。
- **macOS Safari (17+)** —— **文件 → 添加到程序坞…**。单文件模式下也能用（Safari 用的是内联的 `apple-touch-icon` / meta 标签）。
- **iOS / iPadOS Safari** —— 分享按钮 → **添加到主屏幕**。单文件模式下同样可用。

> **离线**：部署了 `sw.js` 并在线打开过至少一次后，应用外壳会被缓存，之后完全断网也能打开（但真正聊天仍需你配置的模型 API 可连通）。更新 `index.html` 后，改一下 `sw.js` 里的 `VERSION` 常量即可刷新缓存。
>
> **部署后注意**：Chrome 对旧的 service worker 和可安装状态缓存得很激进。更新后请强制刷新（DevTools → Application → Service Workers → *Update*），或用无痕窗口验证。DevTools → Application → **Manifest** 里 manifest 来源应显示为你的 `https://…/manifest.webmanifest`（而不是 `blob:` URL）—— 这就是"可安装"的标志。

**安装后如何刷新**：独立 PWA 窗口没有浏览器的刷新按钮。点侧栏顶部的 **↻** 图标（仅在独立模式下显示），或在 iOS / Android 上从消息列表顶端下拉。

---

## 🔌 模型供应商配置

| 类型 | Base URL 示例 | API Key 来源 |
| --- | --- | --- |
| OpenAI 官方 | `https://api.openai.com/v1` | platform.openai.com |
| DeepSeek | `https://api.deepseek.com/v1` | platform.deepseek.com |
| Moonshot | `https://api.moonshot.cn/v1` | platform.moonshot.cn |
| 硅基流动 | `https://api.siliconflow.cn/v1` | cloud.siliconflow.cn |
| OpenRouter | `https://openrouter.ai/api/v1` | openrouter.ai |
| Anthropic Claude | `https://api.anthropic.com/v1` | console.anthropic.com |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta` | aistudio.google.com |
| Ollama | `http://localhost:11434` | （可留空） |
| LM Studio | `http://localhost:1234/v1` | （可留空） |
| llama.cpp | `http://localhost:8080/v1` | （可留空） |

任何"OpenAI 兼容"的中转 / 代理都可以填进 **OpenAI 兼容** 那一栏，会自动从 host 识别厂商名作为下拉前缀。

---

## 🌐 CORS 与浏览器直连

因为是纯前端调用，所有请求都走 **浏览器直连**，需要目标服务允许跨域。

- **OpenAI / Claude / Gemini 官方端点**：均原生支持 CORS，开箱即用。Claude 会自动带上 `anthropic-dangerous-direct-browser-access: true`。
- **Ollama**：启动前需要设置环境变量 `OLLAMA_ORIGINS=*`，否则浏览器会被预检请求拦下。
  ```bash
  # macOS / Linux
  OLLAMA_ORIGINS=* ollama serve

  # Windows (PowerShell)
  $env:OLLAMA_ORIGINS="*"; ollama serve
  ```
- **自建反向代理**：确保返回 `Access-Control-Allow-Origin` 和 `Access-Control-Allow-Headers`。

---

## 🔒 隐私与安全

- 所有 API Key、对话记录、配置都只存在 **本地 `localStorage`**，不会发往任何第三方（除了你配置的模型 API 本身）。
- 请勿在公共电脑上使用；导出的 JSON 文件包含明文 Key，请妥善保管。
- 渲染 Markdown 时使用 DOMPurify 进行 XSS 过滤。

---

## ⌨️ 快捷键

| 快捷键 | 动作 |
| --- | --- |
| `Enter` | 发送 |
| `Shift+Enter` | 换行 |
| `Ctrl` / `⌘` + `Shift` + `O` | 新建对话 |
| `Ctrl` / `⌘` + `N` | 新建对话（兜底 —— 大多数浏览器会把此组合保留给"新建窗口"）|
| `Ctrl` / `⌘` + `K` | 清除上下文（保留可见历史）|

---

## 🛠️ 技术栈

纯静态，无构建：

- [marked](https://marked.js.org/) · Markdown 渲染
- [highlight.js](https://highlightjs.org/) · 代码高亮
- [KaTeX](https://katex.org/) · 数学公式
- [DOMPurify](https://github.com/cure53/DOMPurify) · XSS 过滤
- [pdf.js](https://mozilla.github.io/pdf.js/) · PDF 文本提取
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) · DOCX 文本提取

所有库均通过 CDN 引入；如需完全离线，把 `<script>` / `<link>` 改成本地路径即可。

---

## 📋 已知限制

- 浏览器端调用对一些自建中转的 CORS 配置很敏感，遇到 `Failed to fetch` 优先排查 CORS。
- 不支持 Function Calling / Tool Use（专注于普通对话场景）。
- 不支持流式 token 用量统计（部分供应商也不返回）。
- 图像生成、TTS、ASR 等非聊天能力不在范围内。

---

## 🗺️ 路线图

欢迎在 Issues 里提建议：

- [ ] 自定义供应商（任意 OpenAI 兼容端点都能加一个独立块）
- [ ] 对话搜索
- [ ] 提示词 / Prompt 库
- [x] PWA 离线可装（可选的 `manifest.webmanifest` + `sw.js`）

---

## 🤝 贡献

PR / Issue 都欢迎。整个应用都在 `index.html` 里，直接编辑即可，无需构建。仓库里另有可选的 PWA 配套文件（`manifest.webmanifest`、`icon-192.png`、`icon-512.png`、`sw.js`），仅用于安装 / 离线，缺了它们应用照常运行。

---

## 📄 License

MIT
