## 0.0.1 (2017-12-15)

### Terraform

* Add initial version of tf_module folder

### Lambda

* Add initial version of sending Lambda function, currently only supporting Papertrail

## 0.1.0 (2020-01-29)

### Lambda

* Update to Node 12.14.1 due to lack of support from AWS (see: https://docs.aws.amazon.com/lambda/latest/dg/runtime-support-policy.html)
* Update dependencies to fix `WS-2018-0590`

## 0.1.1 (2020-01-31)

### Lambda

* Do not ignore changes to filename in `aws_lambda_function` resource due to issues it can cause when applying the configuration. 

## 0.1.2 (2020-10-27)

### Terraform

* Update 0.12 version code to remove deprecation warning

### Lambda

*  Fix security vulnerabilities of dev dependency
