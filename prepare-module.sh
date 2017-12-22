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
cp package.json lambda-files
cd lambda-files || exit "Directory 'lambda-files' does not exist"
echo "* Installing Javascript dependencies for Lambda"
npm install --no-package-lock --production
echo "* Removing test folder and package.json from Lambda source files"
rm -rf test
rm package.json
cd ..
echo "* Cleaning out unnecessary files from Lambda's node_modules"
./node_modules/.bin/modclean --no-progress --run --path lambda-files
echo "* Overwriting the lambda-files folder in tf_module"
rm -rf tf_module/lambda-files
mv lambda-files tf_module