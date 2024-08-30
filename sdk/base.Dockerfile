FROM --platform=$BUILDPLATFORM python:bookworm

WORKDIR /highlight/sdk
COPY . .
