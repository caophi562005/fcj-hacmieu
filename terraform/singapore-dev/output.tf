output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "bastion_instance_id" {
  value = module.bastion.instance_id
}

output "bastion_public_ip" {
  value = module.bastion.public_ip
}

output "bastion_role_arn" {
  value = module.bastion.role_arn
}

output "app_irsa_role_arn" {
  value = module.iam.app_irsa_role_arn
}

output "alb_controller_irsa_role_arn" {
  value = module.iam.alb_controller_irsa_role_arn
}
