# Chatbox Lite

> A **single-file** browser-based multi-model chat page — double-click the HTML and it just works.

Zero dependencies, zero backend, zero install. All data lives in your browser's `localStorage` and is never uploaded to any third-party server. One HTML file is the entire application.

---

## ✨ Features

- **Unified UI across providers**: OpenAI compatible (DeepSeek / Moonshot / SiliconFlow / OpenRouter / vLLM …), Anthropic Claude, Google Gemini, local Ollama / llama.cpp / LM Studio.
- **Streaming output**: Server-Sent Events / NDJSON both supported, rendered as it streams.
- **Resilient local-model streaming**: when a local server (llama.cpp / LM Studio / Ollama) closes the stream with no tokens, or hits a transient network / 5xx error, the request auto-retries a few times before surfacing anything — so the occasional "empty response" recovers itself instead of leaving a blank bubble. Tunable via `state.general.emptyRetries` (default 2). A response that contains *only* thinking (a small model running out of output tokens mid-thought) is reported as such rather than retried as if it were empty, and error / aborted bubbles are never fed back to the model as context.
- **Visible thinking process**: Compatible with OpenAI `reasoning_content`, Ollama `thinking`, Claude `thinking_delta`, Gemini `thought`, and inline `<think>` / `<thinking>` tags. One-click toggle, auto-strips leaked prefixes. Templates that pre-fill `<think>` in the prompt (DeepSeek-R1 family) emit an orphan `</think>` with no opening tag — that case is detected too, so the chain of thought never leaks into the answer.
- **Thinking mode is separate from thinking display**: *Settings → General → Thinking mode* controls what is **requested** (`auto` / force on / force off), while the "show thinking" switch only controls what is **displayed**. Forcing it off sends `chat_template_kwargs.enable_thinking:false` (vLLM / SGLang / llama.cpp `--jinja`) and Ollama's `think:false` — without it, hiding the thinking still pays for every thinking token on a hybrid model like Qwen3.
- **Local-model sampling controls**: optional `top_p` / `top_k` / `min_p` / `presence_penalty` (empty = the field is not sent at all; an explicit `0` is preserved). Small local models loop endlessly without these — Qwen3 recommends thinking: temp 0.6 / top_p 0.95 / top_k 20 / min_p 0, non-thinking: temp 0.7 / top_p 0.8 / top_k 20, plus `presence_penalty` 0.5–1.5 against repetition.
- **Ollama context window & residency**: `num_ctx` is configurable (Ollama defaults to a small window and *silently* drops whatever does not fit — starting with the system prompt), and `keep_alive` keeps the model loaded so the next turn does not cold-start into the connect timeout.
- **Endpoint self-healing**: a `400 Unrecognized request argument` from a strict endpoint automatically retries once with all non-standard fields stripped; a `404` on a URL without a `/vN` segment retries once with `/v1` added (and local/LAN Base URLs get `/v1` appended up front). Non-standard reasoning fields (`include_reasoning`, `reasoning`) are only sent to OpenRouter now, instead of to every endpoint.
- **Context token budget**: an optional second-stage trim on top of the message-count window — oldest messages are dropped until the estimated prompt fits, so a couple of PDF attachments can no longer blow past an 8B model's context.
- **Full Markdown stack**: GFM tables, code highlighting (highlight.js), KaTeX math, DOMPurify XSS filtering.
- **Vision + files**: Paste/drag-drop images; PDF / DOCX / TXT / source code parsed as context.
- **Token-aware image & attachment handling**: three image-quality presets (High / Standard / Saver) trade resolution for input tokens — vision tokens scale with pixel count, not file size. A configurable "attachment retention window" also stops old images/files from being silently resent forever; only the most recent N messages keep their attachments, older ones fall back to text-only.
- **Self-service model lists**: After filling in Base URL and API Key, click "🔄 Fetch model list" and pick the models you want from a checkbox panel — no more typos.
- **Smart vendor detection**: In OpenAI-compatible mode, the vendor name is auto-extracted from the host as a prefix (`api.deepseek.com` → `DeepSeek · model`).
- **Refined scroll behavior**: Manually scrolling up during streaming pauses auto-follow and floats a "back to latest" button with an unread dot.
- **Personalization**: Custom user / AI display names, light/dark theme, system prompt, temperature, context length, thinking budget.
- **🎬 Scenario chats + automatic memory**: a dedicated chat type for context-heavy tasks (fixed-tone translation, roleplay, language practice). Define a persona/tone + optional target language once; once the conversation grows large, older turns auto-compress into a compact long-term memory (hard size cap, boundary-aware truncation, rollback history) — see the dedicated section below.
- **Multi-session**: Manage, rename, delete chats from the left sidebar; JSON export / import.
- **Drag to reorder chats**: rearrange the sidebar chat list by dragging entries up or down.
- **Web CLI mode**: switch the main workspace into a terminal-style view for `models`, `chats`, `use`, `new`, and streaming `ask` commands against the same browser state.
- **Per-message actions**: Regenerate (re-answer with a different model), edit & resend (puts the message back in the input and truncates what follows).
- **Clear context, keep history**: Drop a "✂ Context cleared" divider with one click (or `Ctrl/⌘+K`) — past messages stay on screen but won't be sent to the model. On 🎬 scenario chats this compresses the discarded context into memory first, instead of just throwing it away.
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

## 🎬 Scenario chats & long-term memory

For anything that needs a **persistent context** — translation with a fixed tone, a roleplay persona, a language-practice partner — use a **🎬 scenario chat** instead of a regular one.

**Creating one**: sidebar → **🎬 New scenario** → pick a golden preset or write your own:

- **Scenario & tone instructions** — the persona/rules baked into the system prompt on every turn (e.g. *"Casual Discord chat with overseas gamers; colloquial tone, use abbreviations like lol"*).
- **Target language** *(optional)* — for translation/practice scenarios, replies are always produced in this language regardless of what language you type in.

**Editing later**: hover a scenario chat in the sidebar and click its **⚙** icon, or open it and click the **🎬** icon in the top bar.

**Automatic memory — no button to press**:

- Once the live context (messages since the last compression or clear) grows past a size threshold, older turns are automatically summarized into a compact memory and folded into the system prompt on every future request; the most recent few turns stay live for continuity.
- The summary only ever contains text — images/files are never fed into the summarizer and never described in memory.
- Memory has a hard character cap; if the model's summary runs long, it's trimmed at the nearest bullet/sentence boundary instead of mid-sentence.
- Every past memory version is kept (up to 10) — open the scenario editor to see the history dropdown and **restore** an older version if a compression accidentally dropped something important.
- Clicking **✂ Clear context** on a scenario chat compresses first, then clears — so manually clearing never just throws context away.
- Tunable in **Settings → General**: auto-compress on/off, the size threshold, and the memory character cap.

**Token-saving controls** (Settings → General, apply to every chat, not just scenarios):

- **Image upload quality** — High / Standard / Saver presets trade image resolution for input tokens, since vision tokens scale with pixel count, not file size (JPEG quality only affects upload bytes).
- **Attachment retention window** — images/files are no longer resent forever as "memory"; only the most-recent N messages (default 1) keep their attachments in the request, older ones fall back to text-only. Applies uniformly across all four providers.

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

### Node refactor track

The browser app remains a single-page/static app. Node is used only for development-side refactoring, tests, and future CLI support:

```bash
npm run test:core   # smoke-test the shared chat core
npm run build:html  # emit dist/index.html as the single-file browser artifact
```

The extracted core currently lives in `src/chat-core.mjs`; the next step is to move browser UI calls onto that shared core before adding the CLI entry.

### CLI preview

The Node CLI uses the same state shape as the browser export/import format:

```bash
npm run cli -- state-path
npm run cli -- config set config.openai.key sk-...
npm run cli -- config set config.openai.base https://api.openai.com/v1
npm run cli -- models list
npm run cli -- ask -m openai::gpt-4o "Hello"
```

By default the CLI stores state at `~/.chatbox-lite/state.json`. Set `CHATBOX_LITE_STATE=/path/to/state.json` to use a different file.

---

## 📋 Known limitations

- Browser-side calls are sensitive to CORS configuration on self-hosted relays; if you see `Failed to fetch`, check CORS first.
- No Function Calling / Tool Use (this app focuses on plain conversation).
- No streaming token usage stats (some providers don't return them either).
- Image generation, TTS, ASR, and other non-chat capabilities are out of scope.
- Scenario memory compression is LLM-generated summarization — inherently lossy by design (it decides what's "important"). Use the memory-history rollback in the scenario editor if a compression drops something you needed.
- Drag-to-reorder works via desktop mouse drag; touch/mobile chat reordering isn't supported yet.

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
- **图片 / 附件的 token 优化**：三档图片画质（高清 / 标准 / 省流）用分辨率换输入 token —— 视觉 token 由像素数决定，不是文件大小；还有一个可调的"附件保留窗口"，防止旧图片/文件被无限期重复发送——只有最近 N 条消息会保留附件，更早的只留文字。
- **模型列表自助拉取**：填完 Base URL 和 API Key，点"🔄 获取模型列表"，从复选框面板里勾选要用的模型，告别手填错字。
- **智能厂商识别**：OpenAI 兼容模式下，自动从 host 提取厂商名作为前缀（`api.deepseek.com` → `DeepSeek · model`）。
- **细致的滚动控制**：流式输出时手动上滚即暂停自动跟随，浮出"回到最新"按钮，含未读小红点。
- **个性化**：自定义"用户名 / AI 名称"、深浅色主题、系统提示词、温度、上下文长度、思考预算。
- **🎬 场景对话 + 自动记忆**：专为需要长期上下文的场景设计的对话类型（固定语气翻译、角色扮演、语言陪练）。一次性定义角色/语气 + 可选目标语言；聊得久了，较早的内容会自动压缩成一段简洁的长期记忆（带硬性大小上限、按边界截断、可回滚的版本历史）——详见下方专门章节。
- **多会话**：左侧栏管理对话、改名、删除；支持 JSON 导出 / 导入。
- **拖拽调整对话顺序**：在侧栏上下拖动对话条目即可重新排序。
- **Web CLI 模式**：将主工作区切换为终端式视图，用 `models`、`chats`、`use`、`new`、流式 `ask` 等命令操作同一份浏览器状态。
- **消息级操作**：重新生成（换模型重答）、编辑重发（把消息放回输入框并截断后续）。
- **清除上下文、保留历史**：一键（或 `Ctrl/⌘+K`）插入"✂ 上下文已清除"分隔线 —— 历史消息仍在屏幕上，但不会再发送给模型。在 🎬 场景对话里，这个操作会先把要丢弃的上下文压缩进记忆，而不是直接扔掉。
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

## 🎬 场景对话与长期记忆

需要**长期保持某种语境**的场景——固定语气的翻译、角色扮演、语言陪练——用 **🎬 场景对话** 而不是普通对话。

**创建方式**：侧栏 → **🎬 新建场景** → 选一个黄金模版，或自己填写：

- **场景 & 语气设定** —— 每一轮都会写进系统提示词的角色/规则（例如"在 Discord 上和老外联机聊天，语气极度口语化，多用缩写(lol)"）。
- **目标语言**（可选）—— 用于翻译/语言陪练类场景，无论你用什么语言输入，回复都固定用这个语言。

**之后编辑**：把鼠标移到侧栏的场景对话上，点 **⚙** 图标；或者打开它，点顶栏的 **🎬** 图标。

**自动记忆 —— 不用点任何按钮**：

- 当前活动上下文（自上次压缩/清除以来的消息）超过设定的大小阈值后，较早的部分会自动被总结成一段简洁记忆，写进之后每一轮请求的系统提示词；最近几轮消息保持原样，保证衔接自然。
- 记忆只存文字——图片/文件从不会被喂给压缩器，也绝不会被写进记忆里。
- 记忆设有硬性字符上限；如果模型总结超长，会在最近的一个 bullet / 句子边界处截断，而不是从句子中间硬切。
- 每一个历史版本都会保留（最多 10 个）——打开场景编辑面板能看到历史下拉框，如果某次压缩不小心把重要内容概括没了，可以**恢复**到更早的版本。
- 在场景对话里点 **✂ 清除上下文** 会先压缩、再清空——手动清除也不会把内容白白丢掉。
- 可在 **设置 → 通用** 里调节：自动压缩开关、触发阈值、记忆字符上限。

**省 token 的控制项**（设置 → 通用，对所有对话生效，不限于场景对话）：

- **图片上传画质** —— 高清 / 标准 / 省流三档，本质是用分辨率换 token，因为视觉 token 由像素数决定而非文件大小（JPEG 画质只影响上传体积）。
- **附件保留窗口** —— 图片/文件不会再作为"记忆"被永久重发；只有最近 N 条消息（默认 1）会在请求里保留附件，更早的消息只保留文字。四个供应商统一生效。

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

### Node 重构路线

浏览器应用仍然保持单页/纯静态。Node 只用于开发侧重构、测试，以及后续 CLI 支持：

```bash
npm run test:core   # 冒烟测试共享聊天核心
npm run build:html  # 生成 dist/index.html 单文件浏览器产物
```

已抽出的核心位于 `src/chat-core.mjs`；下一步是把浏览器 UI 调用逐步迁移到这个共享核心上，然后再增加 CLI 入口。

### CLI 预览

Node CLI 使用与浏览器导出 / 导入兼容的同一套 state 结构：

```bash
npm run cli -- state-path
npm run cli -- config set config.openai.key sk-...
npm run cli -- config set config.openai.base https://api.openai.com/v1
npm run cli -- models list
npm run cli -- ask -m openai::gpt-4o "Hello"
```

默认状态文件位于 `~/.chatbox-lite/state.json`。可以通过 `CHATBOX_LITE_STATE=/path/to/state.json` 指定其他文件。

---

## 📋 已知限制

- 浏览器端调用对一些自建中转的 CORS 配置很敏感，遇到 `Failed to fetch` 优先排查 CORS。
- 不支持 Function Calling / Tool Use（专注于普通对话场景）。
- 不支持流式 token 用量统计（部分供应商也不返回）。
- 图像生成、TTS、ASR 等非聊天能力不在范围内。
- 场景记忆压缩本质是模型生成的摘要——设计上就是有损的（由模型判断什么"重要"）。如果某次压缩丢了你需要的内容，可以在场景编辑面板里用记忆历史回滚。
- 拖拽排序目前只支持桌面端鼠标拖动，移动端触屏暂不支持。

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
