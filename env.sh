#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APPS_DIR="$SCRIPT_DIR/apps"

echo "=== Fetching Postgres secret from staging namespace ==="

POSTGRES_DB=$(kubectl get secret wemeetatplace-postgres -n staging -o jsonpath='{.data.POSTGRES_DB}' | base64 -d)
POSTGRES_USER=$(kubectl get secret wemeetatplace-postgres -n staging -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)
POSTGRES_PASSWORD=$(kubectl get secret wemeetatplace-postgres -n staging -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d)

for app_dir in "$APPS_DIR"/*/; do
  app_name=$(basename "$app_dir")
  env_file="$app_dir.env"

  if [ ! -f "$env_file" ]; then
    echo "Creating $env_file"
    touch "$env_file"
  fi

  case "$app_name" in
    server)
      cat > "$env_file" <<EOF
NODE_ENV=development
K8S_NAMESPACE=development
APPLICATION_NAME=WeMeetAtPlace
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
NATS_URL=nats://localhost:4222
EOF
      ;;
    user)
      cat > "$env_file" <<EOF
NODE_ENV=development
K8S_NAMESPACE=development
APPLICATION_NAME=WeMeetAtPlace-User
PORT=3001
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
NATS_URL=nats://localhost:4222
EOF
      ;;
    *)
      cat > "$env_file" <<EOF
NODE_ENV=development
K8S_NAMESPACE=development
APPLICATION_NAME=WeMeetAtPlace-$app_name
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
NATS_URL=nats://localhost:4222
EOF
      ;;
  esac

  echo "Written to $env_file"
done

echo ""
echo "For local dev, run from repo root: pnpm dev:server | pnpm dev:user"
