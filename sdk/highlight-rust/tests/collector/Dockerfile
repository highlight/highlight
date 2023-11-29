FROM ubuntu:latest

RUN apt update
RUN apt -y install curl
RUN apt clean

RUN curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.88.0/otelcol-contrib_0.88.0_linux_amd64.tar.gz
RUN tar -xvf otelcol-contrib_0.88.0_linux_amd64.tar.gz

COPY ./otel-collector.yaml /etc/otel-collector-config.yaml

HEALTHCHECK --interval=2s \
    CMD curl -s --fail http://localhost:13133 || exit 1

CMD ["/otelcol-contrib", "--config=/etc/otel-collector-config.yaml"]
