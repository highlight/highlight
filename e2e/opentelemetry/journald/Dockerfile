FROM ubuntu:latest

RUN apt update
RUN apt -y install curl systemd rsyslog
RUN apt clean

RUN curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.86.0/otelcol-contrib_0.86.0_linux_arm64.tar.gz
RUN tar -xvf otelcol-contrib_0.86.0_linux_arm64.tar.gz
RUN systemd-tmpfiles --create --prefix /var/log/journal

COPY ./otel-collector.yaml /etc/otel-collector-config.yaml

#CMD ["/otelcol-contrib", "--config=/etc/otel-collector-config.yaml"]
