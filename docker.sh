#!/bin/bash
set -e

IMAGE="ghcr.io/nett/wemeetatplace-server:latest"

case "$1" in
  login)
    source .env
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u Nett --password-stdin
    ;;
  build)
    docker build -f Dockerfile -t "$IMAGE" .
    ;;
  push)
    docker push "$IMAGE"
    ;;
  deploy)
    docker build -f Dockerfile -t "$IMAGE" .
    docker push "$IMAGE"
    ;;
  *)
    echo "Usage: ./docker.sh {login|build|push|deploy}"
    echo ""
    echo "  login   - authenticate with GitHub Container Registry"
    echo "  build   - build the Docker image"
    echo "  push    - push the image to ghcr.io"
    echo "  deploy  - build and push in one step"
    exit 1
    ;;
esac
