#!/bin/bash
set -euo pipefail

ACTION="${1:-}"
APP="${2:-server}"

OWNER="${GHCR_OWNER:-nett}"
BRANCH="${GIT_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
SHORT_SHA="$(git rev-parse --short HEAD)"

if [ -n "${3:-}" ]; then
  TAG="$3"
else
  if [ "$BRANCH" = "main" ]; then
    PREFIX="main"
  elif [ "$BRANCH" = "staging" ]; then
    PREFIX="staging"
  else
    PREFIX="$(echo "$BRANCH" | tr '/' '-' | tr '[:upper:]' '[:lower:]')"
  fi
  TAG="${PREFIX}-${SHORT_SHA}"
fi

IMAGE="ghcr.io/${OWNER}/wemeetatplace-${APP}:${TAG}"
DOCKERFILE="apps/${APP}/Dockerfile"

case "$ACTION" in
  login)
    source .env
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "${GITHUB_USERNAME:-Nett}" --password-stdin
    ;;

  build)
    docker build -f "$DOCKERFILE" -t "$IMAGE" .
    ;;

  push)
    docker push "$IMAGE"
    ;;

  deploy)
    docker build -f "$DOCKERFILE" -t "$IMAGE" .
    docker push "$IMAGE"
    ;;

  buildx)
    docker buildx build \
      --platform linux/amd64,linux/arm64 \
      -f "$DOCKERFILE" \
      -t "$IMAGE" \
      --push \
      .
    ;;

  *)
    echo "Usage: ./docker.sh {login|build|push|deploy|buildx} [server|user] [tag]"
    echo ""
    echo "  login   - authenticate with GitHub Container Registry"
    echo "  build   - build the Docker image locally"
    echo "  push    - push the image to ghcr.io"
    echo "  deploy  - build and push in one step"
    echo "  buildx  - build and push multi-arch image (linux/amd64,linux/arm64)"
    echo ""
    echo "Defaults:"
    echo "  app     - server"
    echo "  owner   - nett (or GHCR_OWNER env var)"
    echo "  tag     - derived from branch + short SHA"
    echo ""
    echo "Tag examples:"
    echo "  main branch      -> main-${SHORT_SHA}"
    echo "  staging branch   -> staging-${SHORT_SHA}"
    echo "  feature/my-test  -> feature-my-test-${SHORT_SHA}"
    echo ""
    echo "Examples:"
    echo "  ./docker.sh build server"
    echo "  ./docker.sh deploy user"
    echo "  ./docker.sh deploy server staging-123abcd"
    echo "  ./docker.sh buildx server"
    exit 1
    ;;
esac

echo "Image: $IMAGE"