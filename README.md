# deepseek-harness-skin

给 **DeepSeek Harness** 的 Web 界面设置动漫背景皮肤的本地常驻插件，仓库内已包含可直接发布的完整包。

- 通过 `webServer.tapIndex()` 往每次返回的 `index.html` 注入背景 CSS，刷新 / 重启后持续生效。
- 背景图清晰可见，只盖一层极淡遮罩；聊天区、侧栏等 UI 面板保持自身可读背景，切换会话不会闪回白底。
- **默认背景图随包发布**（`assets/bg.png`），也支持用 `config.background` 指向任意本地图片。
- **零外部依赖**：`index.js` 只使用 Node 内置模块，不需要 `schemastery` 等 workspace 内部包。

## 目录

```
deepseek-harness-skin/
├── package.json       # dsh.bundle 声明（可被 dsh plugin add 安装）
├── cordis.patch.yml   # bundle 配置层：插入插件
├── index.js           # 插件本体（ESM，零外部依赖）
├── src/index.ts       # 同一插件的 TypeScript 源
├── assets/bg.png      # 内置默认背景图
├── install.ps1        # Windows 一键安装脚本
├── install.sh         # Linux/macOS/Git Bash 一键安装脚本
├── LICENSE            # MIT
└── .gitignore
```

## 安装

### 方式 A：一键安装脚本

Windows PowerShell：

```powershell
cd /path/to/deepseek-harness-skin
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Linux / macOS / Git Bash：

```bash
cd /path/to/deepseek-harness-skin
./install.sh
```

脚本会优先使用 PATH 上的 `dsh` 命令；也支持 `DSH_ROOT` 环境变量、插件目录旁边的 `deepseek-harness` 源码目录或当前目录，找到后会改用 `pnpm dsh`。找不到 DSH 时，脚本会打印手动安装命令。

### 方式 B：已有 dsh CLI

```sh
dsh plugin --profile web add /path/to/deepseek-harness-skin
```

### 方式 C：DSH 源码目录

```sh
cd /path/to/deepseek-harness
pnpm dsh plugin --profile web add /path/to/deepseek-harness-skin
```

也可以直接从 GitHub 安装（不需要克隆本仓库）：

```sh
dsh plugin --profile web add github:Zdram/deepseek-harness-skin
```

安装后重启 DSH，打开 Web 界面即可看到背景。脚本和文档里的仓库路径都没有写死本机路径，其他人 clone 后可以直接使用。

## 自定义背景

默认使用随包发布的 `assets/bg.png`。想换成自己的图片时，在 profile 的 `cordis.patch.yml` 中覆盖插件配置：

```yaml
- id: deepseek-harness-skin
  config:
    background: 'C:/path/to/your-background.png'
```

Linux / macOS 示例：

```yaml
- id: deepseek-harness-skin
  config:
    background: '/home/you/Pictures/your-background.jpg'
```

支持 `png`、`jpg`、`jpeg`、`webp`、`gif`。配置的路径不存在时，插件会回退到内置的 `assets/bg.png`，不会导致网页白屏或插件加载失败。

安装脚本也可以直接写入这一配置：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Background "D:/path/to/your-background.png"
```

```bash
./install.sh "/home/you/Pictures/your-background.jpg"
```

安装脚本会保留 profile 里已有的其他 patch 内容，只追加 `deepseek-harness-skin` 的覆盖项。

想直接把默认图换成自己的图，也可以替换 `assets/bg.png` 后重启 DSH，不需要改代码或配置。

## AI 修改引导

如果 DeepSeek Harness 或其他 AI 编码代理需要修改本仓库，仓库根目录的 [`AGENTS.md`](./AGENTS.md) 定义了安全换背景的约束：换图只允许覆盖 `assets/bg.png` 或写 profile 的 `config.background`，不允许为了换图重写皮肤逻辑，防闪白和聊天框白边修复必须保留。

## 发布到 GitHub

1. 新建 GitHub 仓库，在当前目录初始化并推送：

   ```sh
   git init
   git add .
   git commit -m "deepseek-harness-skin: DeepSeek Harness 背景皮肤插件"
   git remote add origin https://github.com/Zdram/deepseek-harness-skin.git
   git push -u origin main
   ```

   `.gitignore` 已排除 `node_modules/`、日志和本机专用的 `patch-local.yml`，不会把本机路径泄露出去。

2. 其他人 clone 后运行 `install.sh` / `install.ps1`，或直接用 `dsh plugin add github:Zdram/deepseek-harness-skin` 安装。

## 皮肤效果

- 全屏 `cover` 铺底，背景固定不滚动；
- 只在最底层盖极淡遮罩，背景自然透出；
- 聊天区、侧栏、设置面板保持可读的浅色半透明底；
- 切换会话不会闪回白底，聊天框不会出现白边。

## License

[MIT](./LICENSE)
