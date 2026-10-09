FROM elixir:1.15-alpine
RUN mix local.hex --force && mix local.rebar --force
WORKDIR /app
COPY . .
