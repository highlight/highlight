## 0.1.2

- Add ability to set `service_name` and `service_version`

## 0.1.4

- Tune settings of opentelemetry SDK to reduce memory usage.
- Enable GZIP compression of exported data.

## 0.2.0

- Support setting `environment` attribute to SDK initialization.
- `otlp_endpoint` updated to keyword parameter when initializing.

## 0.2.1

- Ensure `message` on logs is always a string.

## 0.2.2

- Fix duplicate errors recorded on traces.
