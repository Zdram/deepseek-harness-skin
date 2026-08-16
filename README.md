# deepseek-harness-skin

为 **DeepSeek Harness** 的 Web 界面提供动漫背景皮肤的本地插件。安装后，界面使用全屏固定背景；聊天区、侧栏和设置面板保持半透明可读样式；切换会话不会闪回白底，聊天输入框底部不会出现白边。

## 功能特性

- 全屏背景铺底，背景固定不随页面滚动。
- 背景上方只有极淡遮罩，聊天内容保持可读。
- 侧栏、聊天区和设置面板使用浅色半透明玻璃样式。
- 切换会话时背景持续保留，不会闪回白色。
- 默认背景图随插件发布，也支持自定义本地图片。
- 支持 `png`、`jpg`、`jpeg`、`webp`、`gif`。

## 安装

以下方式任选一种。安装完成后需要重启 DeepSeek Harness。

### 方式一：从 GitHub 直接安装

已经可以使用 `dsh` 命令时，执行：

```sh
dsh plugin --profile web add github:Zdram/deepseek-harness-skin
```

安装完成后重启 DSH，并打开 Web 界面。

### 方式二：使用仓库安装脚本

克隆仓库：

```sh
git clone https://github.com/Zdram/deepseek-harness-skin.git
cd deepseek-harness-skin
```

Windows PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Linux / macOS / Git Bash：

```bash
./install.sh
```

安装脚本会依次尝试 PATH 上的 `dsh`、`DSH_ROOT`、插件目录附近的 `deepseek-harness` 源码目录以及当前目录。

### 方式三：在 DSH 源码目录中安装

```sh
cd /path/to/deepseek-harness
pnpm dsh plugin --profile web add /path/to/deepseek-harness-skin
```

也可以直接使用 GitHub 地址：

```sh
pnpm dsh plugin --profile web add github:Zdram/deepseek-harness-skin
```

### 验证安装

重启 DSH 并打开 Web 界面后：

- 页面显示背景图，而不是白色背景。
- 切换会话时背景不会闪回白色。
- 聊天输入框下方没有白色渐变边缘。
- 直接访问 `http://127.0.0.1:3080/deepseek-harness-skin/bg.png` 能返回图片。

## 更换背景

### 方法一：通过 profile 配置指定图片

编辑 profile 的 `cordis.patch.yml`：

- Windows：`%USERPROFILE%\.dsh\profiles\web\cordis.patch.yml`
- Linux / macOS：`~/.dsh/profiles/web/cordis.patch.yml`

使用其他 profile 时，把路径中的 `web` 换成对应名称。

在文件末尾添加：

```yaml
- id: deepseek-harness-skin
  config:
    background: 'D:/Pictures/your-background.png'
```

Linux / macOS 示例：

```yaml
- id: deepseek-harness-skin
  config:
    background: '/home/user/Pictures/your-background.jpg'
```

要求：

- Windows 路径建议使用 `/`，例如 `D:/Pictures/bg.png`。
- 每个 profile 只保留一个 `deepseek-harness-skin` 条目。
- 配置的图片路径不存在时，插件会自动回退到内置默认图。

保存文件后重启 DSH。

### 方法二：通过安装脚本指定图片

Windows：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Background "D:/Pictures/your-background.png"
```

Linux / macOS：

```bash
./install.sh /home/user/Pictures/your-background.jpg
```

### 方法三：替换仓库内置图片

在仓库模式下，可以用同名的 `assets/bg.png` 覆盖默认图，然后重启 DSH。此方式不需要修改配置，但只适合直接持有插件目录的情况。

## 卸载

执行：

```sh
dsh plugin --profile web remove deepseek-harness-skin
```

在 DSH 源码目录下：

```sh
pnpm dsh plugin --profile web remove deepseek-harness-skin
```

卸载后重启 DSH。如果 profile 的 `cordis.patch.yml` 中还有 `deepseek-harness-skin` 条目，应一并删除。

## 常见问题

### 安装后没有背景

重启 DSH 进程，并使用浏览器强制刷新（Windows / Linux 为 `Ctrl+F5`，macOS 为 `Cmd+Shift+R`）。

### 自定义背景没有生效

检查 `cordis.patch.yml` 中的配置是否写入了正确的 profile 文件，确认图片路径存在且格式受支持。路径不存在时，DSH 日志中会出现：

```text
[deepseek-harness-skin] configured background not found, using bundled asset
```

### 背景图加载失败

直接访问 `http://127.0.0.1:3080/deepseek-harness-skin/bg.png`。如果返回 404 或非图片内容，说明插件未正常加载，需要重新安装并重启。

### 启动时提示端口 3080 已被占用

`listen EADDRINUSE: address already in use 127.0.0.1:3080` 表示 3080 端口被其他进程占用。关闭占用端口的进程，或修改 DSH 的 Web 端口配置后重启。

### DeepSeek Harness 升级后效果异常

如果 DSH 升级后背景或聊天框样式异常，可以在仓库 Issues 页面反馈，并提供 DSH 版本号。

## 开发者

仓库根目录的 [`AGENTS.md`](./AGENTS.md) 定义了对本插件进行代码修改时的约束，包括换背景的安全流程、防闪白逻辑和发布文件要求。

## License

[MIT](./LICENSE)
