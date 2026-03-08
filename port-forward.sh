#!/bin/bash

echo "=== Port-forwarding staging services ==="
echo "=== MAKE SURE YOU RUN THIS SCRIPT WITH SUDO ==="

# minikube tunnel exposes LoadBalancer services (ingress) on ports 80/443. Requires sudo.
sudo -E minikube tunnel &
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
kubectl port-forward svc/wemeetatplace-server -n staging 8081:80 &
kubectl port-forward svc/wemeetatplace-postgres -n staging 5432:5432 &
kubectl port-forward svc/wemeetatplace-nats -n staging 4222:4222 &

echo ""
echo "ArgoCD:   https://localhost:8080"
echo "Ingress:  http://staging.wemeetatplace.local (add 127.0.0.1 staging.wemeetatplace.local to /etc/hosts)"
echo "Server:   http://localhost:8081"
echo "Postgres: localhost:5432"
echo "NATS:     localhost:4222"
echo ""
echo "Press Ctrl+C to stop all."

wait
