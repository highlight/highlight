ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME} AS dotnet-8

RUN apt update && apt install build-essential dotnet8-sdk aspnetcore8-runtime

WORKDIR /highlight/e2e/dotnet
COPY ./dotnet .

ENV FRONTEND_URI="http://localhost:5249/"
ENV BACKEND_URI="http://localhost:5249/"
EXPOSE 5249
CMD ["dotnet", "run"]
