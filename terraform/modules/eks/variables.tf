variable "cluster_name" {
  type = string
}

variable "cluster_version" {
  type = string
}

variable "cluster_endpoint_public_access" {
  type    = bool
  default = false
}

variable "cluster_endpoint_private_access" {
  type    = bool
  default = true
}

variable "enable_cluster_creator_admin_permissions" {
  type    = bool
  default = true
}

variable "enable_irsa" {
  type    = bool
  default = true
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "cluster_addons" {
  type    = map(any)
  default = {}
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

variable "capacity_type" {
  type    = string
  default = "ON_DEMAND"
}

variable "upgrade_policy_support_type" {
  type    = string
  default = "STANDARD"
}

variable "tags" {
  type    = map(string)
  default = {}
}
