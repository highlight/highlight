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