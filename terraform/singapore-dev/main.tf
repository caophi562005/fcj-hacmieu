terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.95.0, < 6.0.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.30.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.13.0"
    }
  }
}

provider "aws" {
  region = var.region
}

locals {
  alb_controller_service_account_name = "aws-load-balancer-controller"
  app_service_account_name            = "hacmieu-sa"
}

module "vpc" {
  source = "../modules/vpc"

  name            = "${var.project_name}-vpc"
  cidr            = var.vpc_cidr
  azs             = var.azs
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
  cluster_name    = var.cluster_name
  tags            = var.tags
}

module "eks" {
  source = "../modules/eks"

  cluster_name                             = var.cluster_name
  cluster_version                          = var.cluster_version
  cluster_endpoint_public_access           = true
  cluster_endpoint_private_access          = true
  enable_cluster_creator_admin_permissions = true
  enable_irsa                              = true
  vpc_id                                   = module.vpc.vpc_id
  subnet_ids                               = module.vpc.private_subnet_ids
  cluster_addons = {
    coredns    = {}
    kube-proxy = {}
    vpc-cni    = {}
  }
  node_instance_types         = var.node_instance_types
  node_min_size               = var.node_min_size
  node_max_size               = var.node_max_size
  node_desired_size           = var.node_desired_size
  capacity_type               = var.node_capacity_type
  upgrade_policy_support_type = var.eks_upgrade_policy_support_type
  tags                        = var.tags
}

module "bastion" {
  source = "../modules/bastion"

  name                  = "${var.project_name}-bastion"
  role_name             = "${var.project_name}-bastion-role"
  instance_profile_name = "${var.project_name}-bastion-profile"
  security_group_name   = "${var.project_name}-bastion-sg"
  vpc_id                = module.vpc.vpc_id
  subnet_id             = module.vpc.public_subnet_ids[0]
  instance_type         = var.bastion_instance_type
  tags                  = var.tags
}

resource "aws_security_group_rule" "bastion_to_eks" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = module.eks.cluster_security_group_id
  source_security_group_id = module.bastion.security_group_id
  description              = "Allow bastion to reach EKS API"
}

resource "aws_eks_access_entry" "bastion" {
  cluster_name  = module.eks.cluster_name
  principal_arn = module.bastion.role_arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "bastion_admin" {
  cluster_name  = module.eks.cluster_name
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  principal_arn = module.bastion.role_arn

  access_scope {
    type = "cluster"
  }
}

data "aws_eks_cluster" "this" {
  name       = module.eks.cluster_name
  depends_on = [module.eks]
}

data "aws_eks_cluster_auth" "this" {
  name       = module.eks.cluster_name
  depends_on = [module.eks]
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.this.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.this.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.this.token
}

provider "helm" {
  kubernetes = {
    host                   = data.aws_eks_cluster.this.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.this.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.this.token
  }
}

module "iam" {
  source = "../modules/iam"

  project_name                        = var.project_name
  oidc_provider_arn                   = module.eks.oidc_provider_arn
  alb_controller_service_account_name = local.alb_controller_service_account_name
  app_service_account_name            = local.app_service_account_name
  alb_policy_file                     = "./iam_policy.json"
  app_irsa_policy_file                = "./app-irsa-policy.json"
}

resource "kubernetes_service_account_v1" "alb_controller" {
  metadata {
    name      = local.alb_controller_service_account_name
    namespace = "kube-system"
    annotations = {
      "eks.amazonaws.com/role-arn" = module.iam.alb_controller_irsa_role_arn
    }
  }

  depends_on = [aws_eks_access_policy_association.bastion_admin]
}

resource "kubernetes_service_account_v1" "app" {
  metadata {
    name      = local.app_service_account_name
    namespace = "default"
    annotations = {
      "eks.amazonaws.com/role-arn" = module.iam.app_irsa_role_arn
    }
  }

  depends_on = [aws_eks_access_policy_association.bastion_admin]
}

resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = var.alb_controller_chart_version

  set = [
    {
      name  = "clusterName"
      value = module.eks.cluster_name
    },
    {
      name  = "region"
      value = var.region
    },
    {
      name  = "vpcId"
      value = module.vpc.vpc_id
    },
    {
      name  = "serviceAccount.create"
      value = "false"
    },
    {
      name  = "serviceAccount.name"
      value = local.alb_controller_service_account_name
    }
  ]

  depends_on = [kubernetes_service_account_v1.alb_controller]
}
