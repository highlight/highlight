ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e:latest"
FROM ${IMAGE_BASE_NAME}

RUN gpg --keyserver keyserver.ubuntu.com --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
RUN apt update && apt install -y curl
RUN curl -sSL https://get.rvm.io | bash
ENV PATH="/usr/local/rvm/bin:${PATH}"
RUN rvm install ruby-3.3.4
ENV PATH="/usr/local/rvm/rubies/ruby-3.3.4/bin:${PATH}"
RUN gem install bundle

WORKDIR /highlight/e2e/ruby/rails/demo
COPY ./rails/demo/Gemfile .
COPY ./rails/demo/Gemfile.lock .
RUN bundle install
COPY ./rails/demo .
RUN ./bin/rails db:migrate

ENV FRONTEND_URI="http://localhost:3000/"
ENV BACKEND_URI="http://localhost:3000/"
CMD ["./bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
