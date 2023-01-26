FROM otel/opentelemetry-collector

COPY ./docker/otel-collector.yaml /etc/otel-collector-config.yaml

CMD ["--config=/etc/otel-collector-config.yaml"]
