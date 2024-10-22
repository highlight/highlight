ARG OTEL_COLLECTOR_BUILD_IMAGE_NAME="alpine:latest"
ARG OTEL_COLLECTOR_IMAGE_NAME="otel/opentelemetry-collector-contrib:latest"

FROM ${OTEL_COLLECTOR_BUILD_IMAGE_NAME} AS collector-build

COPY ./docker/collector.yml /collector.yml
COPY ./docker/configure-collector.sh /configure-collector.sh

ARG IN_DOCKER_GO
ARG SSL
RUN /configure-collector.sh

FROM ${OTEL_COLLECTOR_IMAGE_NAME} AS collector

COPY ./backend/localhostssl/server.crt /server.crt
COPY ./backend/localhostssl/server.key /server.key
COPY ./backend/localhostssl/server.pem /server.pem

COPY --from=collector-build /collector.yml /etc/otel-collector-config.yaml
CMD ["--config=/etc/otel-collector-config.yaml"]
