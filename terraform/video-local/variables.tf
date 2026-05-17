variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project_name" {
  type    = string
  default = "fcj-hacmieu"
}

variable "bucket_name" {
  type    = string
  default = "fcj-hacmieu-491333778094-ap-southeast-1-an"
}

variable "mediaconvert_endpoint" {
  type        = string
  description = "MediaConvert API endpoint (get via: aws mediaconvert describe-endpoints --region ap-southeast-1)"
}

variable "tags" {
  type    = map(string)
  default = {}
}
