output "sqs_queue_url" {
  value = module.video_processing.sqs_queue_url
}

output "sqs_queue_arn" {
  value = module.video_processing.sqs_queue_arn
}

output "video_status_queue_url" {
  value = module.video_processing.video_status_queue_url
}

output "submit_lambda_name" {
  value = module.video_processing.submit_lambda_name
}

output "complete_lambda_name" {
  value = module.video_processing.complete_lambda_name
}

output "mediaconvert_role_arn" {
  value = module.video_processing.mediaconvert_role_arn
}
