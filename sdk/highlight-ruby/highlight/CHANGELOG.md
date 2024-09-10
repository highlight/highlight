## 0.5.1

- Fix bug with SDK controller instrumentation
- Fix `Highlight::VERSION` error

## 0.5.0

- Fix bug with SDK initialization
- Fix bug with `service.name` and `deployment.environment` not being set
- Adds `telemetry.distro.*` attributes as resource spans
- Add `highlight_traceparent_meta` Rails tag helper
- Fixes up the Rubocop configs and addresses new issues reported

## 0.4.0

- Add `H.init` alias
- Auto instrument Rails requests and eliminate need for `around_action`
- Fix warning about incompatibility with `ActiveSupport::LoggerSilence`

## 0.2.2

- Fix duplicate errors recorded on traces.

## 0.2.1

- Ensure `message` on logs is always a string.

## 0.2.0

- Support setting `environment` attribute to SDK initialization.
- `otlp_endpoint` updated to keyword parameter when initializing.

## 0.1.4

- Tune settings of opentelemetry SDK to reduce memory usage.
- Enable GZIP compression of exported data.

## 0.1.2

- Add ability to set `service_name` and `service_version`
