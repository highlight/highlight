FROM golang:alpine as backend-builder
RUN apk update && apk add git
RUN mkdir /build-backend
WORKDIR /build-backend
COPY ./backend .
RUN go mod download
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/backend

FROM node:14-alpine as frontend-builder
RUN mkdir /build-frontend
WORKDIR /build-frontend
COPY ./frontend/package.json ./frontend/yarn.lock ./
RUN yarn install
COPY ./frontend ./
COPY ./.prettierrc ./
RUN CI=false yarn build

FROM alpine
WORKDIR /root/
COPY --from=backend-builder /bin/backend /bin/backend
COPY --from=frontend-builder /build-frontend/build ./
CMD ["backend"]
