FROM alpine:3.20.2 AS collector-build

COPY ./docker/collector.yml /collector.yml
COPY ./docker/configure-collector.sh /configure-collector.sh

ARG IN_DOCKER_GO
ARG SSL
RUN /configure-collector.sh

FROM otel/opentelemetry-collector-contrib:0.107.0 AS collector

COPY ./backend/localhostssl/server.crt /server.crt
COPY ./backend/localhostssl/server.key /server.key
COPY ./backend/localhostssl/server.pem /server.pem

COPY --from=collector-build /collector.yml /etc/otel-collector-config.yaml
CMD ["--config=/etc/otel-collector-config.yaml"]
