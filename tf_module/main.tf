resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.papertrail.function_name}"
  principal     = "logs.amazonaws.com"
}

resource "aws_cloudwatch_log_subscription_filter" "all_logs" {
  name            = "${var.monitor_log_group_name}-papertrail-subscription"
  destination_arn = "${aws_lambda_function.papertrail.arn}"
  log_group_name  = "${var.monitor_log_group_name}"
  filter_pattern  = "${var.filter_pattern}"
}

resource "aws_lambda_function" "papertrail" {
  filename      = "cloudwatch-papertrail-lambda.zip"
  function_name = "${var.lambda_name_prefix}-papertrail-lambda"
  handler       = "cloudwatch-papertrail.handler"
  role          = "${var.lambda_log_role_arn}"
  description   = "Receives events from a CloudWatch log group and sends them to Papertrail"
  runtime       = "nodejs8.10"
  timeout       = "${var.timeout}"

  environment = {
    variables = {
      PAPERTRAIL_HOST  = "${var.papertrail_host}"
      PAPERTRAIL_PORT  = "${var.papertrail_port}"
      PARSE_LOG_LEVELS = "${var.parse_log_levels}"
    }
  }

  source_code_hash = "${data.archive_file.papertrail_lambda.output_base64sha256}"
}
