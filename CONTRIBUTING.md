# Contributing to cloudwatch-logs-to-papertrail

Want to contribute to this project? This page describes how to setup the development environment and how to correctly update the files of the project if you make any changes.

## Setup

Make sure you have the correct version of node. This project uses the same node version as Lambda so that we can run the unit tests with the right version. Check package.json's engines.node section to see what the actual version is. Or if you have nvm you can run `nvm use` which will use the correct version based on the .nvmrc file.

Next run `npm install` to install the dependencies.

## Running tests

Run `npm test` to run the unit tests for this project.

## Updating the generated Lambda deployment ZIP files

This project relies on AWS Lambda/node.js to push logs from Cloudwatch to Papertrail. However the code for the Lambda is written in TypeScript. Therefore, the sources need to be compiled from TS to JS before the Lambda package can be created.

If you make any updates to the TypeScript code or add any npm dependencies you need to run `./prepare-module.sh` in the project root to regenerate the ZIP-files in the tf_module* folders. 

When you have rebuilt the ZIP files, you should commit the `tf_module*/cloudwatch-papertrail-lambda.zip` files to Git. Then you should create a new version tag and push that to the repository. Use `git tag` to see what the currently available tags are and choose a new version accordingly.

The versioning should attempt to follow semantic versioning as closely as possible. We still need to work out exactly what that will entail in the case of a Terraform module.
