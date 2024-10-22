FROM --platform=$BUILDPLATFORM python:3.12-bookworm

WORKDIR /highlight/sdk
COPY . .
