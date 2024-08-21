ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME} AS dotnet-8

WORKDIR /highlight/e2e/dotnet
COPY ./dotnet .

RUN apk update && apk add --no-cache build-base
RUN apk add dotnet8-sdk aspnetcore8-runtime

ENV FRONTEND_URI="http://localhost:5249/"
ENV BACKEND_URI="http://localhost:5249/"
CMD ["dotnet", "run"]
