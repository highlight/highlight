FROM golang:bullseye as backend-builder
RUN apt update && apt install -y git build-essential && apt clean
RUN mkdir /build
WORKDIR /build
COPY ../backend .
RUN go mod download
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/backend

CMD ["/bin/backend"]
