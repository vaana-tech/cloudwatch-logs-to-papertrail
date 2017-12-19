#!/usr/bin/env bash

# This script builds the TypeScript code into the default lambda-files directory
# as specified in tsconfig.json. Next, it installs the production dependencies.
# This code should be checked in to version control to make it available to users
# through the Terraform module

mkdir -p lambda-files
npm run-script build
cp package.json lambda-files
cd lambda-files || exit "Directory 'lambda-files' does not exist"
npm install --no-package-lock --production
rm package.json