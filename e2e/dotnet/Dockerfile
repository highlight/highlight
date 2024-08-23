ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME} AS dotnet-8

RUN apt update && apt install -y build-essential dotnet-sdk-8.0 aspnetcore-runtime-8.0

WORKDIR /highlight/e2e/dotnet
COPY ./dotnet .

ENV FRONTEND_URI="http://localhost:5249/"
ENV BACKEND_URI="http://localhost:5249/"
CMD ["dotnet", "run"]
