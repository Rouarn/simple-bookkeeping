#!/bin/bash
# 上传小绿记账 APK 到 VaKao 软件中心（APK 由 HBuilderX 手动打包，本脚本不构建）
# 用法: scripts/ship.sh [--apk <path>] [--dry-run] [--no-publish]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="${HUB_CLI:-/Users/woyuxiaji/Rouarn/AliyunCloud/vakao-hub/tools/hub-cli.mjs}"
APK="$ROOT/unpackage/android-local/simpleDemo/release/simpleDemo-release.apk"
if [ "${1:-}" = "--apk" ]; then APK="$2"; shift 2; fi
META=$(python3 - "ROOT" "$ROOT" <<'PY'
import json,re,sys
t=open(sys.argv[2]+"/manifest.json",encoding="utf-8").read()
v=re.search(r'"versionName"\s*:\s*"([^"]+)"',t).group(1)
c=re.search(r'"versionCode"\s*:\s*(\d+)',t).group(1)
print(v,c)
PY
)
VERSION=$(echo "$META" | awk '{print $1}')
CODE=$(echo "$META" | awk '{print $2}')
[ -f "$APK" ] || { echo "找不到 APK：$APK（先用 HBuilderX 发行→原生 App 云打包）" >&2; exit 1; }
exec node "$CLI" release --app xiaolv --version "$VERSION" --code "$CODE" \
  --file "$APK" --platform android --arch universal --format apk \
  --notes "小绿记账 $VERSION" "$@"
