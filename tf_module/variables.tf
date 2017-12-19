variable "log_group_to_monitor" {
    description = "The name of the log group to "
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
    default = "10"
}

variable "lambda_log_role_arn" {
    description = "The ARN for the role used by the Lambda which sends logs to Papertrail. Must include permissions for writing to CloudWatch logs."
}