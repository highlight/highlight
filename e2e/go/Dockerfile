ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e:latest"
FROM ${IMAGE_BASE_NAME}

WORKDIR /opt/go
RUN wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
RUN rm -rf /usr/local/go && tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
ENV PATH=/usr/local/go/bin:${PATH}

WORKDIR /highlight/e2e/go
COPY ./go.mod .
COPY ./go.sum .
RUN go mod download github.com/highlight/highlight/sdk/highlight-go
RUN go mod download

COPY . .

ARG TARGETARCH
ARG TARGETOS
ENV GOOS=$TARGETOS GOARCH=$TARGETARCH
ENV CGO_ENABLED=1
ENV BACKEND_URI="http://localhost:3456/"

CMD ["go", "run", "echo.go"]
