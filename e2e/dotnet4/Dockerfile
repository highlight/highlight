ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME} AS dotnet-4

WORKDIR /highlight/e2e/dotnet4
COPY ./dotnet4 .

RUN apk update && apk add --no-cache build-base
RUN echo "@testing http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk add --update mono@testing

ENV FRONTEND_URI="http://localhost:5249/"
ENV BACKEND_URI="http://localhost:5249/"
CMD ["mono", "cs"]
