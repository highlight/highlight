FROM alpine AS collector-build

COPY ./collector.yml /collector.yml
COPY ./configure-collector.sh /configure-collector.sh

ARG IN_DOCKER_GO
ARG SSL
RUN /configure-collector.sh

FROM otel/opentelemetry-collector-contrib AS collector

COPY --from=collector-build /collector.yml /etc/otel-collector-config.yaml
CMD ["--config=/etc/otel-collector-config.yaml"]
