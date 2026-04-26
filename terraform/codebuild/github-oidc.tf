# OIDC Provider cho GitHub Actions
# Chỉ tạo 1 lần per AWS account - nếu đã có thì dùng data source thay resource
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# IAM Role cho GitHub Actions assume via OIDC
resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # Chỉ cho phép repo cụ thể, mọi branch/event
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo_name}:*"
          }
        }
      }
    ]
  })

  tags = var.tags
}

# Policy: push lên ECR Public
resource "aws_iam_role_policy" "github_actions_ecr" {
  name = "ecr-public-push"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr-public:GetAuthorizationToken",
          "ecr-public:BatchCheckLayerAvailability",
          "ecr-public:InitiateLayerUpload",
          "ecr-public:UploadLayerPart",
          "ecr-public:CompleteLayerUpload",
          "ecr-public:PutImage",
          "ecr-public:DescribeRepositories",
          "ecr-public:DescribeImages",
          "ecr-public:BatchDeleteImage",
          "sts:GetServiceBearerToken"
        ]
        Resource = "*"
      }
    ]
  })
}

output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "Dùng giá trị này làm AWS_ROLE_ARN secret trong GitHub repo"
}
