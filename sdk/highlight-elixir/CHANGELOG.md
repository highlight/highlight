# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-01

### Added

- Initial release of the Elixir SDK for Highlight.io
- Error monitoring via `Highlight.record_exception/2`
- Logging support via `Highlight.log/2` and `Highlight.log/3`
- Phoenix framework integration with Plug and LiveView hooks
- OpenTelemetry-based instrumentation
- Configuration via options or environment variables
- Auto-instrumentation of Elixir Logger
