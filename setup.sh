#!/bin/bash
set -e

echo "=== Checking prerequisites ==="
for cmd in minikube kubectl argocd; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "Error: $cmd is not installed."
    echo "Install with: brew install $cmd"
    exit 1
  fi
done
echo "All prerequisites found."

echo ""
echo "=== Starting minikube ==="
if minikube status &> /dev/null; then
  echo "Minikube is already running, skipping start."
else
  minikube start
fi

echo ""
echo "=== Installing ArgoCD ==="
if kubectl get namespace argocd &> /dev/null; then
  echo "Namespace argocd already exists, skipping creation."
else
  kubectl create namespace argocd
fi
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo ""
echo "=== Waiting for ArgoCD pods to be ready ==="
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=120s

echo ""
echo "=== Creating staging namespace ==="
if kubectl get namespace staging &> /dev/null; then
  echo "Namespace staging already exists, skipping creation."
else
  kubectl create namespace staging
fi

echo ""
echo "=== Getting ArgoCD initial admin password ==="
ARGOCD_PASSWORD=$(argocd admin initial-password -n argocd | head -1)
echo "Initial password: $ARGOCD_PASSWORD"

echo ""
echo "=== Port-forwarding ArgoCD UI (background) ==="
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
sleep 3

echo ""
echo "=== Logging into ArgoCD ==="
argocd login localhost:8080 --username admin --password "$ARGOCD_PASSWORD" --insecure --grpc-web

echo ""
echo "=== Adding repo to ArgoCD (SSH deploy key) ==="
argocd repo add git@github.com:Nett/WeMeetAtPlace.git \
  --ssh-private-key-path "${ARGOCD_SSH_KEY:=$HOME/.ssh/argocd_github}"

echo ""
echo "=== Creating ArgoCD application ==="
argocd app create wemeetatplace \
  --repo git@github.com:Nett/WeMeetAtPlace.git \
  --path k8s/overlays/staging \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging

argocd app set wemeetatplace --sync-policy automated --auto-prune --self-heal

echo ""
echo "=== Syncing ==="
argocd app sync wemeetatplace

echo ""
echo "=== Done ==="
echo "ArgoCD UI: https://localhost:8080"
echo "Username: admin"
echo "Password: $ARGOCD_PASSWORD"
echo ""
echo "Change your password with:"
echo "  argocd account update-password"
