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
echo "=== Enabling ingress addon ==="
minikube addons enable ingress

echo ""
echo "=== Patching ingress controller to LoadBalancer (for minikube tunnel) ==="
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec":{"type":"LoadBalancer"}}' --type=merge 2>/dev/null || true

echo ""
echo "=== Installing ArgoCD ==="
if kubectl get namespace argocd &> /dev/null; then
  echo "Namespace argocd already exists, skipping creation."
else
  kubectl create namespace argocd
fi
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo ""
echo "=== Installing ArgoCD Image Updater ==="
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

echo ""
echo "=== Waiting for ArgoCD Image Updater to be ready ==="
kubectl rollout status deployment argocd-image-updater -n argocd --timeout=120s

echo ""
echo "=== Applying ArgoCD Image Updater config ==="
kubectl apply -f k8s/argocd/image-updater.yaml

echo ""
echo "=== Restarting ArgoCD deployments (prevents stale init container issues) ==="
kubectl rollout restart deployment argocd-repo-server -n argocd

echo ""
echo "=== Waiting for ArgoCD pods to be ready ==="
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-repo-server -n argocd --timeout=120s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=120s

echo ""
echo "=== Creating staging namespace ==="
if kubectl get namespace staging &> /dev/null; then
  echo "Namespace staging already exists, skipping creation."
else
  kubectl create namespace staging
fi

echo ""
echo "=== Creating Postgres secret ==="
if kubectl get secret wemeetatplace-postgres -n staging &> /dev/null; then
  echo "Secret wemeetatplace-postgres already exists, skipping creation."
else
  kubectl create secret generic wemeetatplace-postgres \
    --namespace=staging \
    --from-literal=POSTGRES_DB=emeetatplace_staging \
    --from-literal=POSTGRES_USER=emeetatplace_staging_user \
    --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD env var before running this script}" \
    --from-literal=POSTGRES_HOST=wemeetatplace-postgres \
    --from-literal=POSTGRES_PORT=5432
fi

echo ""
echo "=== Creating ghcr.io pull secret ==="
if kubectl get secret ghcr-secret -n staging &> /dev/null; then
  echo "Secret ghcr-secret already exists, skipping creation."
else
  kubectl create secret docker-registry ghcr-secret \
    --namespace=staging \
    --docker-server=ghcr.io \
    --docker-username=Nett \
    --docker-password="${GITHUB_TOKEN:?Set GITHUB_TOKEN env var before running this script}"
fi

echo ""
echo "=== ArgoCD admin password ==="
if [ -n "${ARGOCD_PASSWORD:-}" ]; then
  echo "Using ARGOCD_PASSWORD from environment."
elif [ -t 0 ]; then
  echo "Enter ArgoCD admin password (or press Enter to fetch initial password for first-time setup):"
  read -rs ARGOCD_PASSWORD
  echo ""
  if [ -z "$ARGOCD_PASSWORD" ]; then
    ARGOCD_PASSWORD=$(argocd admin initial-password -n argocd | head -1)
    echo "Initial password: $ARGOCD_PASSWORD"
  fi
else
  ARGOCD_PASSWORD=$(argocd admin initial-password -n argocd | head -1)
  echo "Initial password: $ARGOCD_PASSWORD"
fi

echo ""
echo "=== Port-forwarding ArgoCD UI (background) ==="
if command -v lsof &>/dev/null && lsof -i :8080 -sTCP:LISTEN -t &>/dev/null; then
  echo "Port 8080 already in use, skipping port-forward (ArgoCD may already be forwarded)."
else
  kubectl port-forward svc/argocd-server -n argocd 8080:443 &
  sleep 3
fi

echo ""
echo "=== Logging into ArgoCD ==="
login_ok=false
run_login() {
  if [ "$1" = "core" ]; then
    argocd login localhost:8080 --plaintext --core
  else
    argocd login localhost:8080 --username admin --password "$ARGOCD_PASSWORD" --insecure --plaintext
  fi
}
for method in core password; do
  run_login "$method" &
  login_pid=$!
  for _ in $(seq 1 10); do
    sleep 1
    if ! kill -0 $login_pid 2>/dev/null; then
      wait $login_pid 2>/dev/null
      login_exit=$?
      if [ "$login_exit" = 0 ]; then
        login_ok=true
        echo "Logged in."
      fi
      break
    fi
  done
  kill $login_pid 2>/dev/null || true
  [ "$login_ok" = true ] && break
done
if [ "$login_ok" = false ]; then
  echo ""
  echo "ArgoCD login failed or timed out (10s). Port 8080 may have a different service."
  echo "Run manually: ./port-forward.sh  then  argocd login localhost:8080 --plaintext --core"
  echo ""
  if [ -t 0 ]; then
    read -p "Continue without ArgoCD login? (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]] || exit 1
  else
    exit 1
  fi
fi

echo ""
echo "=== Creating ArgoCD project ==="
kubectl apply -n argocd -f - <<'EOF'
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: wemeetatplace
  namespace: argocd
spec:
  description: WeMeetAtPlace project
  sourceRepos:
    - git@github.com:Nett/WeMeetAtPlace.git
  destinations:
    - namespace: staging
      server: https://kubernetes.default.svc
    - namespace: production
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: '*'
      kind: '*'
EOF

echo ""
echo "=== Adding repo to ArgoCD (SSH deploy key) ==="
# With --core, argocd uses namespace from kube context; ensure it's argocd
SAVED_NS=$(kubectl config view --minify -o jsonpath='{.contexts[0].context.namespace}' 2>/dev/null || true)
kubectl config set-context --current --namespace=argocd 2>/dev/null || true

argocd repo add git@github.com:Nett/WeMeetAtPlace.git \
  --ssh-private-key-path "${ARGOCD_SSH_KEY:=$HOME/.ssh/argocd_github}"

echo ""
echo "=== Creating ArgoCD applications (infra + apps) ==="
argocd app create wemeetatplace-infra --upsert \
  --project wemeetatplace \
  --repo git@github.com:Nett/WeMeetAtPlace.git \
  --path k8s/overlays/staging/infra \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging

argocd app create wemeetatplace-apps --upsert \
  --project wemeetatplace \
  --repo git@github.com:Nett/WeMeetAtPlace.git \
  --path k8s/overlays/staging/apps \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging

 argocd app create wemeetatplace-monitoring --upsert \
  --project wemeetatplace \
  --repo git@github.com:Nett/WeMeetAtPlace.git \
  --path k8s/overlays/staging/monitoring \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace staging

argocd app set wemeetatplace-infra --sync-policy automated --auto-prune --self-heal
argocd app set wemeetatplace-apps --sync-policy automated --auto-prune --self-heal
argocd app set wemeetatplace-monitoring --sync-policy automated --auto-prune --self-heal

echo ""
echo "=== Patching wemeetatplace-apps for Image Updater (kustomize + hard refresh) ==="
kubectl patch application wemeetatplace-apps -n argocd --type merge -p '{
  "spec": {
    "source": {
      "repoURL": "git@github.com:Nett/WeMeetAtPlace.git",
      "path": "k8s/overlays/staging/apps",
      "targetRevision": "staging"
    }
  },
  "metadata": {
    "annotations": {
      "argocd.argoproj.io/refresh": "hard"
    }
  }
}'

echo ""
echo "=== Syncing (infra first, then apps) ==="
argocd app sync wemeetatplace-infra
argocd app sync wemeetatplace-apps

[ -n "$SAVED_NS" ] && kubectl config set-context --current --namespace="$SAVED_NS" 2>/dev/null || true

echo ""
echo "=== Done ==="
echo "ArgoCD UI: https://localhost:8080"
echo "Username: admin"
echo "Password: $ARGOCD_PASSWORD"
echo ""
echo "For ingress (http://staging.wemeetatplace.local):"
echo "  Run 'minikube tunnel' in another terminal (requires sudo)"
echo "  Add '127.0.0.1 staging.wemeetatplace.local' to /etc/hosts"
echo ""
echo "Change your password with:"
echo "  argocd account update-password"
