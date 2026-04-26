variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project_name" {
  type    = string
  default = "fcj-hacmieu-codebuild"
}

variable "github_repo_url" {
  type        = string
  description = "HTTPS URL of the GitHub repository, e.g. https://github.com/org/repo"
}

variable "github_org" {
  type        = string
  description = "GitHub organization or username, e.g. my-org"
}

variable "github_repo_name" {
  type        = string
  description = "GitHub repository name only (not full URL), e.g. my-repo"
}

variable "github_branch" {
  type        = string
  default     = "main"
  description = "Branch to build on push"
}

variable "tags" {
  type    = map(string)
  default = {}
}
