# deepseek-harness-skin 安装脚本（Windows / PowerShell）
# 用法（在插件目录运行，或任意目录）：
#   powershell -ExecutionPolicy Bypass -File .\install.ps1
# 可选项：
#   -Background "D:/path/to/your.png"   同时把自定义背景写入 profile 配置
#   -Profile web                        目标 profile（默认 web）
param(
  [string]$Background = "",
  [string]$Profile = "web"
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-DshSourceRoot {
  param([string]$Path)
  if ([string]::IsNullOrWhiteSpace($Path)) { return $false }
  return (Test-Path -LiteralPath (Join-Path $Path 'apps\cli')) -and
         (Test-Path -LiteralPath (Join-Path $Path 'package.json'))
}

function Write-BackgroundConfig {
  param([string]$BackgroundPath, [string]$ProfileName)
  $patchFile = Join-Path $env:USERPROFILE ".dsh\profiles\$ProfileName\cordis.patch.yml"
  New-Item -ItemType Directory -Path (Split-Path -Parent $patchFile) -Force | Out-Null
  $escaped = $BackgroundPath.Replace("'", "''")
  $block = @"

# deepseek-harness-skin: 自定义背景图（由 install.ps1 写入，可编辑或删除）
- id: deepseek-harness-skin
  config:
    background: '$escaped'
"@
  if (-not (Test-Path -LiteralPath $patchFile)) {
    $content = $block.TrimStart() + "`n"
  } else {
    $old = Get-Content -Raw -LiteralPath $patchFile
    if ($old -match '(?m)^[ \t]*\[[ \t]*\][ \t]*\r?$') {
      $content = [regex]::Replace($old, '(?m)^[ \t]*\[[ \t]*\][ \t]*\r?$', '')
      $content = $content.TrimEnd() + "`n`n" + $block.TrimStart() + "`n"
    } else {
      $content = $old.TrimEnd() + "`n`n" + $block.TrimStart() + "`n"
    }
  }
  [System.IO.File]::WriteAllText($patchFile, $content, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "[deepseek-harness-skin] 已在 $patchFile 写入背景路径，重启 DSH 生效。"
}

# 定位 dsh：优先 PATH 上的 dsh 命令，其次 DSH_ROOT 环境变量，
# 再尝试插件目录旁边的 deepseek-harness 源码目录，最后是当前目录。
$dshCommand = Get-Command dsh -ErrorAction SilentlyContinue
$runIn = $null
if (-not $dshCommand) {
  if ($env:DSH_ROOT -and (Test-DshSourceRoot $env:DSH_ROOT)) { $runIn = $env:DSH_ROOT }
}
if (-not $dshCommand -and -not $runIn) {
  $adjacent = Join-Path (Split-Path $here -Parent) 'deepseek-harness'
  if (Test-DshSourceRoot $adjacent) { $runIn = $adjacent }
}
if (-not $dshCommand -and -not $runIn) {
  if (Test-DshSourceRoot (Get-Location).Path) { $runIn = (Get-Location).Path }
}

if (-not $dshCommand -and -not $runIn) {
  Write-Host ""
  Write-Host "[deepseek-harness-skin] 未找到可用的 dsh 命令或 DeepSeek Harness 源码目录。"
  Write-Host "请先构建 DeepSeek Harness，然后手动执行："
  Write-Host "  cd <deepseek-harness 目录>"
  Write-Host "  pnpm dsh plugin --profile $Profile add `"$here`""
  exit 1
}

Write-Host "[deepseek-harness-skin] 安装到 profile: $Profile"
if ($dshCommand) {
  & $dshCommand.Source plugin --profile $Profile add $here
} else {
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw "未找到 pnpm，DSH 源码目录模式需要 pnpm。"
  }
  Push-Location $runIn
  try {
    pnpm dsh plugin --profile $Profile add $here
  } finally {
    Pop-Location
  }
}
if ($LASTEXITCODE -ne 0) { throw "dsh plugin add 失败" }

if ($Background -ne "") {
  Write-BackgroundConfig -BackgroundPath $Background -ProfileName $Profile
} else {
  Write-Host "[deepseek-harness-skin] 使用内置默认背景。自定义背景可在 profile 的 cordis.patch.yml 中配置。"
}
Write-Host "[deepseek-harness-skin] 完成！重启 DSH 后皮肤生效。"
