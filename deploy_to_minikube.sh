#!/bin/bash

# Minikube 시작 (이미 실행 중이 아니라면)
minikube status || minikube start

# Minikube Docker 데몬 사용
eval $(minikube docker-env)

# 이미지 빌드 및 Minikube에 로드
docker build -t ps-ocr-microservice-auth:latest -f apps/auth/Dockerfile .
docker build -t ps-ocr-microservice-company:latest -f apps/company/Dockerfile .
docker build -t ps-ocr-microservice-receipt:latest -f apps/receipt/Dockerfile .

# 이미지가 Minikube에 로드되었는지 확인
minikube image ls | grep ps-ocr-microservice

# AWS 시크릿 키 설정
# 주의: 실제 시크릿 키를 스크립트에 직접 포함시키지 마세요. 환경 변수나 안전한 방법으로 관리하세요.
AWS_SECRET_KEY="MRrFIHxhMWR9K3mGSC81YKzy8/s+afy/O0Qjayp1"

# AWS 시크릿 생성 또는 업데이트
kubectl create secret generic aws-secret \
    --from-literal=secretkey="$AWS_SECRET_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -

# kube-manifests 디렉토리로 이동
cd kube-manifests

# MongoDB 구성 적용
kubectl apply -f mongodb/

# 다른 서비스의 Kubernetes 구성 적용
kubectl apply -f auth/
kubectl apply -f company/
kubectl apply -f rabbitMQ/
kubectl apply -f receipt/

# 파드 상태 확인
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=Ready pods --all --timeout=300s

# MongoDB 연결 정보 업데이트
MONGODB_IP=$(kubectl get service mongodb -o jsonpath='{.spec.clusterIP}')
kubectl set env deployment/auth MONGODB_URI="mongodb://${MONGODB_IP}:27017/auth"
kubectl set env deployment/company MONGODB_URI="mongodb://${MONGODB_IP}:27017/company"
kubectl set env deployment/receipt MONGODB_URI="mongodb://${MONGODB_IP}:27017/receipt"

# 업데이트된 deployment 재시작
kubectl rollout restart deployment auth
kubectl rollout restart deployment company
kubectl rollout restart deployment receipt

# 모든 리소스 상태 출력
echo "Current status of all resources:"
kubectl get all

echo "Deployment completed. Use 'kubectl get pods' to check the status of your pods."