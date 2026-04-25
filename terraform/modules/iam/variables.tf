variable "project_name" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "alb_controller_service_account_name" {
  type = string
}

variable "app_service_account_name" {
  type = string
}

variable "alb_policy_file" {
  type = string
}

variable "app_irsa_policy_file" {
  type = string
}
