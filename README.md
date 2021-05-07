# Introduction

This repository contains a solution for pushing log entries from an AWS CloudWatch log group to the Papertrail log management service (papertrailapp.com). The solution relies on the following AWS services:

1. CloudWatch log groups, aggregated log streams of logs from various sources, eg the logs from multiple separate Lambda function invocations
2. CloudWatch log group subscriptions, the part that will subscribe to new events to a log group and push them to a Lambda
3. Lambda, a "serverless" on-demand computation service that will be used to push the received log entries to Papertrail

See the following links for more information relating to the log subscription:

http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html
http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/SubscriptionFilters.html

The solution mentioned above is provided as a Terraform module that can be used in your Terraform configuration to automatically create the necessary parts for this solution to run. If you are not using Terraform, you can use the code from this repository as a base for creating your own custom solution.

# Requirements

- An AWS account with a resource that outputs log entries into a CloudWatch log group (for example an AWS Lambda)
- An IAM role for the Lambda which sends data to Papertrail, this role only needs basic CloudWatch logging permissions
- Terraform (if you want to automatically create the required infrastructure resources). We are not currently aware of any specific minimum version of Terraform required to use this module. Please open up an issue if you cannot use this with your version. We have tested this with Terraform 0.10.0
- A Papertrail account

# Usage

Note! This repository is provided under the MIT license and we make no guarantees about the safety of the source code that is located here. Please review the source code yourself before using the solution and don't blindly trust other people's code online.

## Custom REGEX

You can customize the log parsing by adding a regex and a mapping in the environment

e.g RAILS semantic logger

```
LOG_LEVEL_REGEX='\s([DIWEF])\s\['
LOG_LEVEL_MAPPING='{"D": "debug","I": "info", "W": "warn", "E": "error", "F": "crit"}'
```

default for winston (Leave blank to use these)

```
LOG_LEVEL_REGEX='^[^\t]+\t[^\t]+\t(\w+):'
LOG_LEVEL_MAPPING='{ "silly": "info","debug": "notice","verbose": "info","http": "info","info": "info", "warn": "warn","error": "error" }'
```

## Usage with Terraform 0.11.x

To use the module with Terraform 0.11.x, add the segment below to your Terraform configuration:

```
module "cloudwatch-log-group-x-papertrail" {
    source = "github.com/vaana-tech/cloudwatch-logs-to-papertrail//tf_module_0.11?ref=GIT_TAG_TO_USE"
    monitor_log_group_names = ["/aws/lambda/my-lambda-function", "/aws/some/other/log/group/name"]
    papertrail_host = "logsX.papertrailapp.com"
    papertrail_port = "12345"
    filter_pattern = FILTER_PATTERN | ""
    timeout = "10"
    lambda_log_role_arn = ARN_OF_LAMDA_ROLE_WITH_CW_LOGS_WRITE_PERMISSION
    lambda_name_prefix = "MyLambdaFunction"
    parse_log_levels = "true"
}
```

Note: Some of the variables have default values and don't need to be explicitly specified, check the `tf_module_0.11/variables.tf` file for the default values.

## Usage with Terraform 0.12.x

To use the module with Terraform 0.12.x, do the same as for 0.11, but use the following source line instead:
```
source = "github.com/vaana-tech/cloudwatch-logs-to-papertrail//tf_module_0.12?ref=GIT_TAG_TO_USE"
```

## Notes

1. You can check the name of your log groups from the CloudWatch "Logs" tab.
2. The double slash in the module source is not a typo, it is used to refer to the Terraform module subdirectory inside this repository
3. Using Terraform modules directly from Github reporitories does not support proper versioning, but you can use the `ref` query parameter to refer to a specific tag in the repository, please check the CHANGELOG.md file for which versions are available and what has been updated in each version
4. Check your Papertrail "Destination settings" for the correct values for `papertrail_host` and `papertrail_port`
5. You may have noticed that we have checked in some Javascript files that are built from typescript files as well as node_modules dependencies into version control. There are two reasons for this: 1) We rely on Github for hosting the files, for simplicity, and 2) We want to reduce the number of system dependencies for the user, this way the user doesn't even need node/npm
6. If you enable the `parse_log_levels` functionality to parse out the log level from the cloudwatch log messages, you must use the npm winston simple log format that prefixes log entries with "LOGLEVEL:"

# Acknowledgements

This project was based on source code from this project: https://github.com/apiaryio/cloudwatch-to-papertrail
