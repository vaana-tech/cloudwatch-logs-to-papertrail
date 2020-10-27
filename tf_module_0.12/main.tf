locals {
  lambda_zip_file = "${path.module}/cloudwatch-papertrail-lambda.zip"
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.papertrail.function_name
  principal     = "logs.amazonaws.com"
}

resource "aws_cloudwatch_log_subscription_filter" "all_logs" {
  count           = length(var.monitor_log_group_names)
  name            = "${var.monitor_log_group_names[count.index]}-papertrail-subscription"
  destination_arn = aws_lambda_function.papertrail.arn
  log_group_name  = var.monitor_log_group_names[count.index]
  filter_pattern  = var.filter_pattern
}

resource "aws_lambda_function" "papertrail" {
  filename         = local.lambda_zip_file
  function_name    = "${var.lambda_name_prefix}-papertrail-lambda"
  handler          = "cloudwatch-papertrail.handler"
  role             = var.lambda_log_role_arn
  description      = "Receives events from CloudWatch log groups and sends them to Papertrail"
  runtime          = "nodejs12.x"
  timeout          = var.timeout
  source_code_hash = filebase64sha256(local.lambda_zip_file)

  environment {
    variables = {
      PAPERTRAIL_HOST  = var.papertrail_host
      PAPERTRAIL_PORT  = var.papertrail_port
      PARSE_LOG_LEVELS = var.parse_log_levels
    }
  }

  lifecycle {
    # NOTE: we'd like to add 'filename' to ignore_changes as it is random
    # because Terraform downloads this module to folder with a random string.
    # However, this causes problems when deploying the Lambda in some situatons,
    # so at the moment we cannot add it.
    ignore_changes = [last_modified]
  }
}
