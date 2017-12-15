data "archive_file" "papertrail_lambda" {
    type = "zip"
    source_dir = "${path.module}/papertrail-lambda-files"
    output_path = "${path.module}/papertrail-lambda.zip"
}

resource "aws_iam_role" "iam_for_lambda" {
    name = "iam_role_for_papertrail_lambda"
    assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": "TODO"
        }
    ]
}
EOF
}

resource "aws_cloudwatch_log_group" "papertrail_lambda" {
    name = "${var.log_group_to_monitor}"
}

resource "aws_lambda_permission" "allow_cloudwatch" {
    statement_id   = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = "${aws_lambda_function.papertrail.function_name}"
    principal = "${aws_cloudwatch_log_group.papertrail_lambda.arn}"
}

resource "aws_cloudwatch_log_subscription_filter" "all_logs" {
    name = "${var.log_group_to_monitor}-papertrail-subscription"
    destination_arn = "${aws_lambda_function.papertrail.arn}"
    log_group_name = "${var.log_group_to_monitor}"
    filter_pattern = "${var.filter_pattern}"
}

resource "aws_lambda_function" "papertrail" {
    filename = "${data.archive_file.papertrail_lambda.output_path}"
    function_name = "${var.log_group_to_monitor}-papertrail-lambda"
    handler = "cloudwatch-papertrail.handler"
    role = "${aws_iam_role.iam_for_papertrail_lambda.arn}"
    description = "Receives events from a CloudWatch log group and sends them to Papertrail"
    runtime = "nodejs6.10"
    timeout = "${var.timeout}"
    environment = {
        PAPERTRAIL_HOST = "${var.papertrail_host}"
        PAPERTRAIL_PORT = "${var.papertrail_port}"
    }
    source_code_hash = "${data.archive_file.papertrail_lambda.output_base64sha256}"
}