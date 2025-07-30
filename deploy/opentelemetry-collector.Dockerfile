FROM otel/opentelemetry-collector-contrib:0.130.1

COPY ./otel-collector.yaml /etc/otel-collector-config.yaml

CMD ["--config=/etc/otel-collector-config.yaml"]
