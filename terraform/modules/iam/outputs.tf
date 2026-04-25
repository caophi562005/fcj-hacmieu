output "alb_controller_irsa_role_arn" {
  value = module.alb_controller_irsa.iam_role_arn
}

output "app_irsa_role_arn" {
  value = module.app_irsa.iam_role_arn
}

output "alb_controller_policy_arn" {
  value = aws_iam_policy.alb_controller.arn
}

output "app_irsa_policy_arn" {
  value = aws_iam_policy.app_irsa.arn
}
