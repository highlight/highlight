# Changelog

## v0.5.6 (2023-08-07)

### Feature

### Fix

- Update uvicorn version requirement

### Tests



## v0.5.5 (2023-08-05)

### Feature

### Fix

- Fixed formatting of serialized loguru logs
- Update fastapi version requirement

### Tests

## v0.5.4 (2023-08-04)

### Feature

- Added config options for `service_name` and `service_version`.

### Fix

### Tests

## v0.6.1 (2023-09-18)

### Fix

- Update queue export settings to reduce possibility of OOM due to large number of traces / logs.

## v0.6.2 (2023-09-20)

### Fix

- Remove `Highlight caught a ...` log messages as error logs are generated server side.

## v0.6.7 (2023-12-12)

### Fix

- Support `environment` when initializing the SDK.

## v0.6.8 (2023-12-13)

### Fix

- Support tracing auto-instrumentation for the requests library.
- Add `tracing_origins` configuration to pass X-Highlight-Request header to outgoing requests.

## v0.6.9 (2023-12-19)

### Fix

- Add support for Python versions 3.9 and lower for sdk v0.6.8.
- Optimization of LRU cache

## v0.6.11 (2024-01-08)

### Fix

- Requires Python version 3.8 or newer.
- Support tracing auto-instrumention for the celery library.
- Optimizations for requests auto-instrumentation tracing.
- Removes `tracing_origins` configuration for requests library and passes by default.

## v0.6.12 (2024-01-09)

### Fix

- Support tracing auto-instrumention for boto, boto3 (sqs), and redis libraries.