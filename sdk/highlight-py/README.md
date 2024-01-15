# highlight-io Python SDK

This directory contains the source code for the Highlight Python SDK.

### E2E

The `e2e` directory contains supported Python frameworks integrated with our SDK for local development and testing.
Do not use the snippets verbatim as they are configured for local development and will not work in production without changes.


## Install

* Install [poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)
* `poetry install --all-extras`

## Run e2e apps

### Django

* `cd e2e/highlight_django`
* `poetry run python manage.py runserver`

### Flask

* `cd e2e/highlight_flask`
* `poetry run flask run`

### Fastapi

Start Redis:
* `cd docker`
* `./start_infra` (in order to start Redis)

Using Boto/Boto3 endpoints:
* Update the have the following environment variables (edit Run Confirguration in PyCharm)
* `E2E_AWS_ACCESS_KEY` (from IAM account)
* `E2E_AWS_SECRET_KEY` (from IAM account)
* `SQS_QUEUE_URL` (from SQS queue information)

Running the main app:
* `cd e2e/highlight_fastapi`
* `poetry run uvicorn main:app`

Running Celery worker:
* `cd e2e/highlight_fastapi`
* `poetry run celery -A e2e.highlight_fastapi.work worker --loglevel=INFO`

### Loguru

* `cd e2e/highlight_loguru`
* `poetry run python main.py`

## Run tests

* `poetry run pytest`

## Lint

* `poetry run black  .`