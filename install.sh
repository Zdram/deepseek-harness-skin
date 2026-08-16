#!/usr/bin/env bash
# deepseek-harness-skin 安装脚本（Linux/macOS / Git Bash）
# 用法：./install.sh [background-path] [profile]
# background-path 可省略；提供时会同时写入 profile 的 cordis.patch.yml。
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKGROUND="${1:-}"
PROFILE="${2:-web}"

is_dsh_root() {
  [[ -n "$1" && -d "$1/apps/cli" && -f "$1/package.json" ]]
}

write_background() {
  local patch_file="${DSH_HOME:-$HOME/.dsh}/profiles/${PROFILE}/cordis.patch.yml"
  local escaped block
  escaped="$(printf '%s' "$BACKGROUND" | sed "s/'/''/g")"
  block="# deepseek-harness-skin: 自定义背景图（由 install.sh 写入，可编辑或删除）
- id: deepseek-harness-skin
  config:
    background: '${escaped}'
"
  mkdir -p "$(dirname "$patch_file")"
  if [[ ! -f "$patch_file" ]]; then
    printf '%s' "$block" > "$patch_file"
  elif grep -qE '^[[:space:]]*\[[[:space:]]*\][[:space:]]*$' "$patch_file"; then
    grep -vE '^[[:space:]]*\[[[:space:]]*\][[:space:]]*$' "$patch_file" > "$patch_file.tmp" || true
    mv "$patch_file.tmp" "$patch_file"
    printf '\n%s' "$block" >> "$patch_file"
  else
    printf '\n%s' "$block" >> "$patch_file"
  fi
  echo "[deepseek-harness-skin] 已在 ${patch_file} 写入背景路径，重启 DSH 生效。"
}

run_install() {
  local dsh_root="$1"
  shift
  if [[ -n "$dsh_root" ]]; then
    (cd "$dsh_root" && pnpm dsh "$@")
  else
    dsh "$@"
  fi
}

# 定位 dsh：优先 PATH 上的 dsh 命令，其次 DSH_ROOT 环境变量，
# 再尝试插件目录旁边的 deepseek-harness 源码目录，最后是当前目录。
DSH_ROOT_DIR=""
DSH_COMMAND=""
if command -v dsh >/dev/null 2>&1; then
  DSH_COMMAND="dsh"
fi
if [[ -z "$DSH_COMMAND" && -n "${DSH_ROOT:-}" ]] && is_dsh_root "$DSH_ROOT"; then
  DSH_ROOT_DIR="$DSH_ROOT"
fi
if [[ -z "$DSH_COMMAND" && -z "$DSH_ROOT_DIR" ]] &&
   is_dsh_root "$(dirname "$HERE")/deepseek-harness"; then
  DSH_ROOT_DIR="$(dirname "$HERE")/deepseek-harness"
fi
if [[ -z "$DSH_COMMAND" && -z "$DSH_ROOT_DIR" ]] && is_dsh_root "$PWD"; then
  DSH_ROOT_DIR="$PWD"
fi

if [[ -z "$DSH_COMMAND" && -z "$DSH_ROOT_DIR" ]]; then
  echo
  echo "[deepseek-harness-skin] 未找到可用的 dsh 命令或 DeepSeek Harness 源码目录。"
  echo "请先构建 DeepSeek Harness，然后手动执行："
  echo "  cd <deepseek-harness 目录>"
  echo "  pnpm dsh plugin --profile ${PROFILE} add \"${HERE}\""
  exit 1
fi

if [[ -n "$DSH_ROOT_DIR" ]] && ! command -v pnpm >/dev/null 2>&1; then
  echo "[deepseek-harness-skin] 未找到 pnpm，DSH 源码目录模式需要 pnpm。" >&2
  exit 1
fi

echo "[deepseek-harness-skin] 安装到 profile: ${PROFILE}"
run_install "$DSH_ROOT_DIR" plugin --profile "$PROFILE" add "$HERE"
if [[ -n "$BACKGROUND" ]]; then
  write_background
else
  echo "[deepseek-harness-skin] 使用内置默认背景。自定义背景可在 profile 的 cordis.patch.yml 中配置。"
fi
echo "[deepseek-harness-skin] 完成！重启 DSH 后皮肤生效。"
