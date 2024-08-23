ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e:latest"
FROM ${IMAGE_BASE_NAME}

RUN apt update && apt install curl
RUN curl -sSL https://get.rvm.io | bash -s stable --rails

WORKDIR /highlight/e2e/ruby
COPY ./ruby .
WORKDIR /highlight/e2e/ruby/rails/demo

CMD ["./bin/rails", "server"]
