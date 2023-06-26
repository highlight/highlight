# ai

This package contains the code used in the lambda for the session insights feature

## Development
Install all dependencies
```
yarn
```
Run server
```
yarn dev
```
The backend will be running on http://localhost:8765

## Deploying to Lambda
First, make sure you have access to the lambda organization and you have installed the AWS CLI tool
```
yarn build
yarn publish
```
