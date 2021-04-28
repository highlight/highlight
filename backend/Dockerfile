FROM golang:alpine as builder
RUN apk update && apk add git
RUN mkdir /build
WORKDIR /build
COPY . .
RUN go mod download
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/backend

FROM alpine
WORKDIR /root/
COPY --from=builder /bin/backend /bin/backend
CMD ["backend"]
