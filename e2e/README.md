---
title: End to End SDK Example Apps
slug: end-to-end-sdk-examples
createdAt: 2024-08-27T20:28:14.000Z
updatedAt: 2024-08-27T02:07:22.000Z
---

# End-to-end SDK Tests

The [highlight repository E2E directory](https://github.com/highlight/highlight/tree/main/e2e) contains 
supported frameworks integrated with our SDKs for local development and testing.
They are meant as examples configured for local development and will need to be updated before use in production.

## Running E2E Apps via docker compose

The E2E example apps are meant for highlight development and to validate
the SDKs are correctly capturing and reporting data to highlight. By default, the apps
point data to a local highlight instance running on `localhost`. This can be configured
by setting the `XXX` environment variable.

The recommended way to run example apps manually is via the `compose.yml` file. The
`app_runner.py` provides an interface to automating the build and startup for automation (CI).

### Using the `compose.yml` file

```bash
# from the root of the highlight repository
cd e2e
docker compose build sdk
docker compose build base
docker compose build <example>
docker compose up <example>
# to run all examples
docker compose up
```

### Using the automated `app_runner.py`

Using the `app_runner.py` requires installing Python LTS and Poetry.

```bash
# from the root of the highlight repository
cd e2e/tests
poetry install
# view the help menu
poetry run python src/app_runner.py --help
# run the example app, making requests to the app to validate that it is healthy
poetry run python src/app_runner.py <example>

```
