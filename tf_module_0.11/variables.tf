variable "monitor_log_group_names" {
  description = "List of names of the log groups which should be sent to Papertrail"
  type        = "list"
}

variable "papertrail_host" {
  description = "FQDN or IP of the Papertrail service endpoint"
}

variable "papertrail_port" {
  description = "The endpoint TCP port"
}

variable "filter_pattern" {
  description = "A CloudWatch Logs filter pattern for the log group which is subscribed to"
}

variable "timeout" {
  description = "The timeout for the Lambda which sends log entries to Papertrail"
  default     = "10"
}

variable "lambda_log_role_arn" {
  description = "The ARN for the role used by the Lambda which sends logs to Papertrail. Must include permissions for writing to CloudWatch logs."
}

variable "lambda_name_prefix" {
  description = "Will be used to create the Papertrail sending Lambda function name as 'PREFIX-papertrail-lambda', has the same restrictions as a normal Lambda name"
}

variable "parse_log_levels" {
  description = "If true, the log entries will be parsed for markers describing their log level, see README.md in repo for details"
  default     = "false"
}

variable "log_format" {
  description = "when parse_log_levels == 'true'this defines the log format: WINSTON(default) or RAILS"
  default     = "WINSTON"
}

variable "log_level_regex" {
  description = "log level regex, should have one capture group. e.g. for Rails: \\s([DIWEF])\\s\\["
  default = ""
}

variable "log_level_mapping" {
  description = "log level mapping, hash e.g for captured {\"D\": \"debug\",\"I\": \"info\", \"W\": \"warn\", \"E\": \"error\", \"F\": \"crit\"}"
  default = ""
}