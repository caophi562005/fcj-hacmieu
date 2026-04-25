terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.95.0, < 6.0.0"
    }
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.34"

  cluster_endpoint_public_access           = var.cluster_endpoint_public_access
  cluster_endpoint_private_access          = var.cluster_endpoint_private_access
  enable_cluster_creator_admin_permissions = var.enable_cluster_creator_admin_permissions

  cluster_upgrade_policy = {
    support_type = var.upgrade_policy_support_type
  }

  enable_irsa = var.enable_irsa

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  cluster_addons = var.cluster_addons

  eks_managed_node_groups = {
    main = {
      name = "${var.cluster_name}-main"

      instance_types = var.node_instance_types
      min_size       = var.node_min_size
      max_size       = var.node_max_size
      desired_size   = var.node_desired_size

      subnet_ids    = var.subnet_ids
      capacity_type = var.capacity_type
    }
  }

  tags = var.tags
}
