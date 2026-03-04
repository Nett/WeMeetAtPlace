#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/application/.env"

echo "=== Fetching Postgres secret from staging namespace ==="

POSTGRES_DB=$(kubectl get secret wemeetatplace-postgres -n staging -o jsonpath='{.data.POSTGRES_DB}' | base64 -d)
POSTGRES_USER=$(kubectl get secret wemeetatplace-postgres -n staging -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)
POSTGRES_PASSWORD=$(kubectl get secret wemeetatplace-postgres -n staging -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d)

if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE"
  touch "$ENV_FILE"
fi

cat > "$ENV_FILE" <<EOF
NODE_ENV=development
APPLICATION_NAME=WeMeetAtPlace-DEV
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
EOF

echo "Written to $ENV_FILE"
