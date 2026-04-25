terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.95.0, < 6.0.0"
    }
  }
}

resource "aws_iam_policy" "alb_controller" {
  name        = "${var.project_name}-AWSLoadBalancerControllerIAMPolicy"
  description = "Policy for AWS Load Balancer Controller on EKS"
  policy      = file(var.alb_policy_file)
}

module "alb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${var.project_name}-alb-controller-irsa-role"

  role_policy_arns = {
    controller = aws_iam_policy.alb_controller.arn
  }

  oidc_providers = {
    main = {
      provider_arn               = var.oidc_provider_arn
      namespace_service_accounts = ["kube-system:${var.alb_controller_service_account_name}"]
    }
  }
}

resource "aws_iam_policy" "app_irsa" {
  name        = "${var.project_name}-app-irsa-policy"
  description = "Shared policy for all app pods to access SQS and S3"
  policy      = file(var.app_irsa_policy_file)
}

module "app_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${var.project_name}-app-irsa-role"

  role_policy_arns = {
    app = aws_iam_policy.app_irsa.arn
  }

  oidc_providers = {
    main = {
      provider_arn               = var.oidc_provider_arn
      namespace_service_accounts = ["default:${var.app_service_account_name}"]
    }
  }
}
