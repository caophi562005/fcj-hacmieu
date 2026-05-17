variable "project_name" {
  type = string
}

variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "bucket_name" {
  type        = string
  description = "Tên S3 bucket chung (đã tạo riêng)"
}

variable "bucket_arn" {
  type        = string
  description = "ARN S3 bucket (truyền vào, không tạo)"
}

variable "input_prefix" {
  type        = string
  default     = "shops/"
  description = "Prefix cho video gốc upload (trigger SQS) — shops/{shopId}/videos/"
}

variable "mediaconvert_endpoint" {
  type        = string
  description = "MediaConvert API endpoint (account-specific, get via: aws mediaconvert describe-endpoints)"
}

variable "tags" {
  type    = map(string)
  default = {}
}
