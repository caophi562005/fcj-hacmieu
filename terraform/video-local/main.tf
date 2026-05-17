terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.95.0, < 6.0.0"
    }
  }
}

provider "aws" {
  region = var.region
}

module "video_processing" {
  source = "../modules/video-processing"

  project_name          = var.project_name
  region                = var.region
  bucket_name           = var.bucket_name
  bucket_arn            = "arn:aws:s3:::${var.bucket_name}"
  mediaconvert_endpoint = var.mediaconvert_endpoint
  tags                  = var.tags
}
