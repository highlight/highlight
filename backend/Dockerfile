FROM golang:alpine as builder
RUN apk update && apk add git
RUN mkdir /build
WORKDIR /build
COPY . .
RUN GOOS=linux GOARCH=amd64 go build -tags netgo -ldflags '-s -w' -o /bin/app

FROM alpine
WORKDIR /root/
COPY --from=builder /bin/app app
EXPOSE 50051
CMD ["./app"]


