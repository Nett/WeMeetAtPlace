#!/bin/bash
set -e

APP="${2:-server}"
TAG="${3:-$(git rev-parse --short HEAD)}"
IMAGE="ghcr.io/nett/wemeetatplace-${APP}:${TAG}"

case "$1" in
  login)
    source .env
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u Nett --password-stdin
    ;;
  build)
    docker build -f "apps/$APP/Dockerfile" -t "$IMAGE" .
    ;;
  push)
    docker push "$IMAGE"
    ;;
  deploy)
    docker build -f "apps/$APP/Dockerfile" -t "$IMAGE" .
    docker push "$IMAGE"
    ;;
  *)
    echo "Usage: ./docker.sh {login|build|push|deploy} [server|user] [tag]"
    echo ""
    echo "  login   - authenticate with GitHub Container Registry"
    echo "  build   - build the Docker image (default: server)"
    echo "  push    - push the image to ghcr.io"
    echo "  deploy  - build and push in one step"
    echo ""
    echo "  tag     - optional, defaults to short git SHA"
    echo ""
    echo "Examples: ./docker.sh build server"
    echo "          ./docker.sh deploy user v1.2.3"
    exit 1
    ;;
esac
