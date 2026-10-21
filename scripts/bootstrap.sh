#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/compose-common.sh"
# One-time infrastructure setup; repeated runs reuse the same named volumes.
"${compose[@]}" build minio
"${compose[@]}" up -d --wait --wait-timeout 180 db minio
# Current application renders public attachment URLs; never allow anonymous writes.
"${compose[@]}" exec -T minio sh -eu <<'MINIO_INIT'
mc_config=$(mktemp -d)
trap 'rm -rf "$mc_config"' EXIT
mc --config-dir "$mc_config" alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
mc --config-dir "$mc_config" mb --ignore-existing local/mywebbucket >/dev/null
mc --config-dir "$mc_config" anonymous set download local/mywebbucket >/dev/null
MINIO_INIT
echo "DB and object storage are ready; mywebbucket permits anonymous reads, not writes."
