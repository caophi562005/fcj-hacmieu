output "sqs_queue_arn" {
  value = aws_sqs_queue.video_processing.arn
}

output "sqs_queue_url" {
  value = aws_sqs_queue.video_processing.url
}

output "video_status_queue_url" {
  value = aws_sqs_queue.video_status.url
}

output "video_status_queue_arn" {
  value = aws_sqs_queue.video_status.arn
}

output "submit_lambda_name" {
  value = aws_lambda_function.video_submit.function_name
}

output "complete_lambda_name" {
  value = aws_lambda_function.video_complete.function_name
}

output "mediaconvert_role_arn" {
  value = aws_iam_role.mediaconvert_role.arn
}
