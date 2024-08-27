ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e:latest"
FROM ${IMAGE_BASE_NAME}

WORKDIR /opt/dotnet
RUN apt update && apt install -y build-essential wget libc6 libgcc1 libgssapi-krb5-2 libstdc++6 zlib1g
RUN wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
RUN chmod +x ./dotnet-install.sh
RUN ./dotnet-install.sh --version latest --channel 8.0
ENV PATH=/root/.dotnet:${PATH}

WORKDIR /highlight/e2e/dotnet
COPY . .

ENV FRONTEND_URI="http://localhost:5249/"
ENV BACKEND_URI="http://localhost:5249/"
CMD ["dotnet", "run"]
