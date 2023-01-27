FROM otel/opentelemetry-collector

COPY ./otel-collector.yaml /etc/otel-collector-config.yaml

CMD ["--config=/etc/otel-collector-config.yaml"]
