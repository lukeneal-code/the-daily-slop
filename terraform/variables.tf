variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "anthropic_api_key" {
  description = "Anthropic API key for Claude satire generation"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key for DALL-E image generation"
  type        = string
  sensitive   = true
}
