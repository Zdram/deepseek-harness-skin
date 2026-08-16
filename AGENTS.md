# AGENTS.md

本文件是给 AI 代理（包括 DeepSeek Harness 中的编码代理）修改本仓库时的行为规范。修改背景时，只允许走下方“安全换背景”流程，不允许为了换图重写 `index.js` 或 `src/index.ts` 的皮肤逻辑。

## 不可破坏的行为不变量

下面的行为是插件正确工作的核心，任何改动都必须保持：

1. `<html>` 上持续保持背景，且 `background-attachment: fixed`；`<body>` 保持透明。
2. 插件注入一个 `position: fixed; z-index: -1` 的背景层作为兜底。
3. `setInterval(ensure, 300)` 和 `MutationObserver` 必须保留，否则切换会话时可能闪回白底。
4. 聊天区底部 `composerSeat` / `composerStack` 的白色渐变必须保持透明，否则窗口化时输入框下方会出现白边。
5. 全屏不透明 UI 层会被清除透明，侧栏、主聊天区、设置面板保持浅色半透明可读背景。
6. 发布文件里不得出现 `D:/AI/...`、`C:/Users/...` 等本机硬编码路径。
7. 插件只使用 Node 内置模块，不得新增外部依赖。

## 安全换背景流程

### 用户发来一张新图，要求换成默认背景

1. 把图片保存为 `assets/bg.png`，覆盖原文件；不修改任何代码。
2. 检查用户 profile 的 `cordis.patch.yml` 中是否存在 `deepseek-harness-skin` 的 `config.background` 覆盖项；如果存在，需要同步更新或删除覆盖项，否则内置图不会生效。
3. 保存后重启 DSH，或让用户刷新 Web 页面。

profile 路径：

- Windows：`%USERPROFILE%\.dsh\profiles\<profile>\cordis.patch.yml`
- Linux / macOS：`$HOME/.dsh/profiles/<profile>/cordis.patch.yml`（或 `$DSH_HOME/...`）

默认 profile 是 `web`。

### 用户要求使用某张已存在的图片路径

在 profile 的 `cordis.patch.yml` 中追加覆盖项，不要改动仓库内 `cordis.patch.yml` 的插入逻辑：

```yaml
- id: deepseek-harness-skin
  config:
    background: '/absolute/path/to/your-image.png'
```

Windows 示例：

```yaml
- id: deepseek-harness-skin
  config:
    background: 'D:/Pictures/your-background.jpg'
```

支持 `png`、`jpg`、`jpeg`、`webp`、`gif`。路径不存在时插件会自动回退到 `assets/bg.png`，不要因为这个警告而删除插件逻辑。

### 用户要求恢复默认背景

从 profile 的 `cordis.patch.yml` 删除 `deepseek-harness-skin` 的 `config.background` 覆盖项，确认 `assets/bg.png` 是默认图，然后重启 DSH。

## 修改代码时的约束

如果用户明确要求修改皮肤代码（不是换图），必须：

- 只在 `src/index.ts` 做主要修改，并同步更新 `index.js`；当前运行使用的是 `index.js`。
- 保留上面第 3、4 条列出的防闪白和白边逻辑。
- 修改后运行 `node --check index.js` 确认语法正确。
- 重启 DSH 后检查 `http://127.0.0.1:3080/` 页面注入是否仍存在，以及 `/deepseek-harness-skin/bg.png` 返回 200 且为图片类型。

## 禁止事项

- 不要仅仅为了换背景图片就重写或删除 `index.js` 中的防闪白、MutationObserver、composer 清理逻辑。
- 不要往发布文件里写入本机绝对路径。
- 不要把 `patch-local.yml`（本机专用文件）加入提交或发布包。
- 不要修改 `assets/bg.png` 为非图片文件，或删除它；删除后插件会失去默认背景的路由目标。
