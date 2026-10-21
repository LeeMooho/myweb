#!/usr/bin/env bash
# Sourced by deployment scripts. Secrets stay in the server-side env file.
set -euo pipefail
repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
env_file=${DEPLOY_ENV_FILE:-/etc/myweb/.env.prod}
project_name=${COMPOSE_PROJECT_NAME:-myweb}
if [[ ! -f "$env_file" || ! -r "$env_file" ]]; then
  echo "Set DEPLOY_ENV_FILE to a readable server-side env file." >&2
  exit 1
fi
if [[ ! "$project_name" =~ ^[a-z0-9][a-z0-9_-]*$ ]]; then
  echo "Invalid COMPOSE_PROJECT_NAME." >&2
  exit 1
fi
command -v docker >/dev/null
docker compose version >/dev/null
compose=(docker compose --project-name "$project_name" --env-file "$env_file" -f "$repo_root/deploy/compose.yml")
"${compose[@]}" config --quiet
