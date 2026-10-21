#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/compose-common.sh"
command -v python3 >/dev/null
# Infrastructure is managed separately so app deployments cannot recreate it.
for service in db minio; do
  container_id=$("${compose[@]}" ps -q "$service")
  if [[ -z "$container_id" ]] || [[ $(docker inspect --format '{{.State.Health.Status}}' "$container_id") != healthy ]]; then
    echo "Infrastructure unavailable: $service. Run scripts/bootstrap.sh first." >&2
    exit 1
  fi
done
# Build before replacing the running application. A failed build leaves it intact.
"${compose[@]}" build backend
"${compose[@]}" build frontend
# Restart nginx too: it must resolve the new backend container address.
"${compose[@]}" up -d --no-deps --force-recreate --wait --wait-timeout 240 backend frontend
"${compose[@]}" exec -T frontend wget -q -O - http://127.0.0.1/ | python3 -c '
import sys
assert "id=\"root\"" in sys.stdin.read(), "Missing React root element"
'
"${compose[@]}" exec -T frontend wget -q -O - 'http://127.0.0.1/api/board/board-list?searchCondition=all&searchKeyword=&page=0' | python3 -c '
import json, sys
result = json.load(sys.stdin)
assert result["statusCode"] == 200, "API did not return success"
assert isinstance(result["pageItems"]["content"], list), "Missing paginated board content"
'
echo "Deployment checks passed for $(git -C "$repo_root" rev-parse HEAD)."
