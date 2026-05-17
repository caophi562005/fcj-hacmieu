data "aws_caller_identity" "current" {}

locals {
  function_name          = "${var.project_name}-video-submit"
  complete_function_name = "${var.project_name}-video-complete"
  queue_name             = "${var.project_name}-video-processing"
  dlq_name               = "${var.project_name}-video-processing-dlq"
  status_queue_name      = "update_video_status_hacmieu"
}

# ============================================================
# SQS
# ============================================================

resource "aws_sqs_queue" "video_processing_dlq" {
  name                      = local.dlq_name
  message_retention_seconds = 604800
  tags                      = var.tags
}

resource "aws_sqs_queue" "video_processing" {
  name                       = local.queue_name
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.video_processing_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

resource "aws_sqs_queue" "video_status" {
  name                       = local.status_queue_name
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
  tags                       = var.tags
}

resource "aws_sqs_queue_policy" "allow_s3" {
  queue_url = aws_sqs_queue.video_processing.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowS3SendMessage"
        Effect    = "Allow"
        Principal = { Service = "s3.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.video_processing.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = var.bucket_arn
          }
        }
      }
    ]
  })
}

# ============================================================
# S3 Event Notification
# ============================================================

resource "aws_s3_bucket_notification" "video_upload" {
  bucket = var.bucket_name

  queue {
    queue_arn     = aws_sqs_queue.video_processing.arn
    events        = ["s3:ObjectCreated:*"]
    filter_prefix = var.input_prefix
    filter_suffix = ".mp4"
  }

  depends_on = [aws_sqs_queue_policy.allow_s3]
}

# ============================================================
# MediaConvert IAM Role
# ============================================================

resource "aws_iam_role" "mediaconvert_role" {
  name = "${var.project_name}-mediaconvert-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "mediaconvert.amazonaws.com" }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "mediaconvert_policy" {
  name = "${var.project_name}-mediaconvert-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "S3Access"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = ["${var.bucket_arn}/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "mediaconvert_policy_attach" {
  role       = aws_iam_role.mediaconvert_role.name
  policy_arn = aws_iam_policy.mediaconvert_policy.arn
}

# ============================================================
# Lambda: Submit MediaConvert Job (triggered by SQS)
# ============================================================

resource "aws_iam_role" "lambda_submit_role" {
  name = "${local.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "lambda_submit_policy" {
  name = "${local.function_name}-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SQSConsume"
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = [aws_sqs_queue.video_processing.arn]
      },
      {
        Sid      = "SQSSendStatus"
        Effect   = "Allow"
        Action   = ["sqs:SendMessage"]
        Resource = [aws_sqs_queue.video_status.arn]
      },
      {
        Sid      = "MediaConvert"
        Effect   = "Allow"
        Action   = ["mediaconvert:CreateJob", "mediaconvert:DescribeEndpoints"]
        Resource = ["*"]
      },
      {
        Sid      = "PassRole"
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = [aws_iam_role.mediaconvert_role.arn]
      },
      {
        Sid    = "Logs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = ["arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:*"]
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_submit_attach" {
  role       = aws_iam_role.lambda_submit_role.name
  policy_arn = aws_iam_policy.lambda_submit_policy.arn
}

data "archive_file" "lambda_submit_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/index.mjs"
  output_path = "${path.module}/lambda-submit.zip"
}

resource "aws_lambda_function" "video_submit" {
  function_name = local.function_name
  role          = aws_iam_role.lambda_submit_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  package_type  = "Zip"
  timeout       = 30
  memory_size   = 128

  filename         = data.archive_file.lambda_submit_zip.output_path
  source_code_hash = data.archive_file.lambda_submit_zip.output_base64sha256

  environment {
    variables = {
      VIDEO_STATUS_QUEUE_URL = aws_sqs_queue.video_status.url
      MEDIACONVERT_ENDPOINT  = var.mediaconvert_endpoint
      MEDIACONVERT_ROLE_ARN  = aws_iam_role.mediaconvert_role.arn
      REGION                 = var.region
    }
  }

  tags = var.tags
}

resource "aws_lambda_event_source_mapping" "sqs_to_submit" {
  event_source_arn = aws_sqs_queue.video_processing.arn
  function_name    = aws_lambda_function.video_submit.arn
  batch_size       = 1
  enabled          = true
}

# ============================================================
# Lambda: Handle MediaConvert Job Complete (triggered by EventBridge)
# ============================================================

resource "aws_iam_role" "lambda_complete_role" {
  name = "${local.complete_function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "lambda_complete_policy" {
  name = "${local.complete_function_name}-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "SQSSendStatus"
        Effect   = "Allow"
        Action   = ["sqs:SendMessage"]
        Resource = [aws_sqs_queue.video_status.arn]
      },
      {
        Sid      = "S3Delete"
        Effect   = "Allow"
        Action   = ["s3:DeleteObject"]
        Resource = ["${var.bucket_arn}/${var.input_prefix}*"]
      },
      {
        Sid    = "Logs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = ["arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:*"]
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_complete_attach" {
  role       = aws_iam_role.lambda_complete_role.name
  policy_arn = aws_iam_policy.lambda_complete_policy.arn
}

data "archive_file" "lambda_complete_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda-complete/index.mjs"
  output_path = "${path.module}/lambda-complete.zip"
}

resource "aws_lambda_function" "video_complete" {
  function_name = local.complete_function_name
  role          = aws_iam_role.lambda_complete_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  package_type  = "Zip"
  timeout       = 30
  memory_size   = 128

  filename         = data.archive_file.lambda_complete_zip.output_path
  source_code_hash = data.archive_file.lambda_complete_zip.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME            = var.bucket_name
      VIDEO_STATUS_QUEUE_URL = aws_sqs_queue.video_status.url
      REGION                 = var.region
    }
  }

  tags = var.tags
}

# ============================================================
# EventBridge: MediaConvert Job State Change → Lambda Complete
# ============================================================

resource "aws_cloudwatch_event_rule" "mediaconvert_complete" {
  name = "${var.project_name}-mediaconvert-complete"

  event_pattern = jsonencode({
    source      = ["aws.mediaconvert"]
    detail-type = ["MediaConvert Job State Change"]
    detail = {
      status = ["COMPLETE", "ERROR"]
    }
  })

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "mediaconvert_to_lambda" {
  rule      = aws_cloudwatch_event_rule.mediaconvert_complete.name
  target_id = "video-complete-lambda"
  arn       = aws_lambda_function.video_complete.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.video_complete.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.mediaconvert_complete.arn
}
