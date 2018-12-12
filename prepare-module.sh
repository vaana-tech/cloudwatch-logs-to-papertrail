#!/usr/bin/env bash

# This script builds the TypeScript code into the default lambda-files directory
# as specified in tsconfig.json. Next, it installs the production dependencies.
# This code should be checked in to version control to make it available to users
# through the Terraform module

set -e
set -u
set -o pipefail

mkdir -p lambda-files

echo "* Compiling TypeScript sources"
npm run-script build
cp package.json package-lock.json lambda-files
cd lambda-files || exit "Directory 'lambda-files' does not exist"

echo "* Installing Javascript dependencies for Lambda"
npm install --no-package-lock --production

echo "* Removing test folder and package.json from Lambda source files"
rm -rf test
rm package.json package-lock.json
cd ..

echo "* Cleaning out unnecessary files from Lambda's node_modules"
./node_modules/.bin/modclean --no-progress --run --path lambda-files

echo "* Removing unnecessary underscore fields from package.json files"
./node_modules/.bin/removeNPMAbsolutePaths lambda-files

echo "* Removing and replacing the lambda zip file"
ZIP_FILE_PATH="$PWD/tf_module/cloudwatch-papertrail-lambda.zip"
rm -f "$ZIP_FILE_PATH"
(cd lambda-files; zip -r "$ZIP_FILE_PATH" ./*)
rm -rf lambda-files