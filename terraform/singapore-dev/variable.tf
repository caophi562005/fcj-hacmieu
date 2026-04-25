variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project_name" {
  type    = string
  default = "fcj-hacmieu"
}

variable "cluster_name" {
  type    = string
  default = "fcj-hacmieu"
}

variable "cluster_version" {
  type    = string
  default = "1.33"
}

variable "azs" {
  type = list(string)
}

variable "vpc_cidr" {
  type = string
}

variable "public_subnets" {
  type = list(string)
}

variable "private_subnets" {
  type = list(string)
}

variable "node_instance_types" {
  type    = list(string)
  default = ["t3.medium"]
}

variable "node_min_size" {
  type    = number
  default = 1
}

variable "node_max_size" {
  type    = number
  default = 3
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_capacity_type" {
  type    = string
  default = "ON_DEMAND"
}

variable "bastion_instance_type" {
  type    = string
  default = "t3.small"
}

variable "alb_controller_chart_version" {
  type    = string
  default = "1.14.0"
}

variable "eks_upgrade_policy_support_type" {
  type    = string
  default = "STANDARD"
}

variable "tags" {
  type    = map(string)
  default = {}
}
