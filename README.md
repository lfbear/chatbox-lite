# Chatbox Lite

> A **single-file** browser-based multi-model chat page — double-click the HTML and it just works.

Zero dependencies, zero backend, zero install. All data lives in your browser's `localStorage` and is never uploaded to any third-party server. One HTML file is the entire application.

---

## ✨ Features

- **Unified UI across providers**: OpenAI compatible (DeepSeek / Moonshot / SiliconFlow / OpenRouter / vLLM …), Anthropic Claude, Google Gemini, local Ollama / llama.cpp / LM Studio.
- **Streaming output**: Server-Sent Events / NDJSON both supported, rendered as it streams.
- **Visible thinking process**: Compatible with OpenAI `reasoning_content`, Ollama `thinking`, Claude `thinking_delta`, Gemini `thought`, and inline `<think>` / `<thinking>` tags (DeepSeek-R1, etc.). One-click toggle, auto-strips leaked prefixes.
- **Full Markdown stack**: GFM tables, code highlighting (highlight.js), KaTeX math, DOMPurify XSS filtering.
- **Vision + files**: Paste/drag-drop images; PDF / DOCX / TXT / source code parsed as context.
- **Self-service model lists**: After filling in Base URL and API Key, click "🔄 Fetch model list" and pick the models you want from a checkbox panel — no more typos.
- **Smart vendor detection**: In OpenAI-compatible mode, the vendor name is auto-extracted from the host as a prefix (`api.deepseek.com` → `DeepSeek · model`).
- **Refined scroll behavior**: Manually scrolling up during streaming pauses auto-follow and floats a "back to latest" button with an unread dot.
- **Personalization**: Custom user / AI display names, light/dark theme, system prompt, temperature, context length, thinking budget.
- **Multi-session**: Manage, rename, delete chats from the left sidebar; JSON export / import.
- **Per-message actions**: Regenerate (re-answer with a different model), edit & resend (puts the message back in the input and truncates what follows).
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
| `Ctrl` / `⌘` + `N` | New chat |

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
- [ ] Installable PWA / offline support

---

## 🤝 Contributing

PRs / issues welcome. Since this is a single-file project, just edit `chatbox-lite/index.html` directly — no build needed.

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
- **思考过程可视化**：兼容 OpenAI `reasoning_content`、Ollama `thinking`、Claude `thinking_delta`、Gemini `thought`、以及内联 `<think>` / `<thinking>` 标签（DeepSeek-R1 等），可一键开关、自动剥离泄漏前缀。
- **Markdown 全家桶**：GFM 表格、代码高亮（highlight.js）、KaTeX 数学公式、DOMPurify XSS 过滤。
- **视觉 + 文件**：图片粘贴/拖拽、PDF / DOCX / TXT / 代码文件解析为上下文。
- **模型列表自助拉取**：填完 Base URL 和 API Key，点"🔄 获取模型列表"，从复选框面板里勾选要用的模型，告别手填错字。
- **智能厂商识别**：OpenAI 兼容模式下，自动从 host 提取厂商名作为前缀（`api.deepseek.com` → `DeepSeek · model`）。
- **细致的滚动控制**：流式输出时手动上滚即暂停自动跟随，浮出"回到最新"按钮，含未读小红点。
- **个性化**：自定义"用户名 / AI 名称"、深浅色主题、系统提示词、温度、上下文长度、思考预算。
- **多会话**：左侧栏管理对话、改名、删除；支持 JSON 导出 / 导入。
- **消息级操作**：重新生成（换模型重答）、编辑重发（把消息放回输入框并截断后续）。
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
| `Ctrl` / `⌘` + `N` | 新建对话 |

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
- [ ] PWA 离线可装

---

## 🤝 贡献

PR / Issue 都欢迎。因为是单文件项目，改动直接编辑 `chatbox-lite/index.html` 即可，无需构建。

---

## 📄 License

MIT
