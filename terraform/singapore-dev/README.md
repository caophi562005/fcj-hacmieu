# Terraform + Bastion Flow

This stack is split into 2 phases so EKS can stay private while Kubernetes and Helm are still manageable.

## Phase 1: Provision infrastructure from local machine

```bash
terraform -chdir=terraform/singapore-dev init -upgrade
terraform -chdir=terraform/singapore-dev plan
terraform -chdir=terraform/singapore-dev apply
```

This creates:

- VPC
- Private EKS cluster
- Bastion host in a public subnet
- EKS access entry for the bastion role

## Phase 2: Run platform resources from bastion

Open an SSM session to the bastion:

```bash
aws ssm start-session --target <bastion-instance-id>
```

Then run:

```bash
terraform -chdir=terraform/singapore-dev plan -var deploy_platform_resources=true
terraform -chdir=terraform/singapore-dev apply -var deploy_platform_resources=true
helm upgrade --install be-platform ./helm --namespace default --create-namespace
```

## Verify

```bash
kubectl rollout status deployment/be-platform-iam-service -n default
kubectl rollout status deployment/be-platform-customer-bff -n default
kubectl get svc -n default
kubectl get ingress -n default
```

## Notes

- `deploy_platform_resources=false` keeps the stack in infra-only mode.
- `deploy_platform_resources=true` enables Kubernetes ServiceAccounts and the AWS Load Balancer Controller.
- Use `helm upgrade --install` instead of plain `helm upgrade` for the first deployment.

#===Step 2: Chạy lệnh sau để update file config trong thư mục ~/.kube/config (Đối với windows là: C:\Users\{username}\.kube\config)
aws eks update-kubeconfig --region ap-southeast-1 --name fcj-hacmieu

#Check context
kubectl config get-contexts #[Optional] Set context nếu có nhiều cluster và current context chưa đúng.
kubectl config use-context arn:aws:eks:ap-southeast-1:491333778094:cluster/fcj-hacmieu

#Get cluster info
kubectl cluster-info

kubectl apply -k helm/manifests/
