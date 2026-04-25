variable "name" {
  type = string
}

variable "role_name" {
  type = string
}

variable "instance_profile_name" {
  type = string
}

variable "security_group_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "tags" {
  type    = map(string)
  default = {}
}
