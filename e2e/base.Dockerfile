FROM --platform=$BUILDPLATFORM python:alpine

RUN apk update && apk add --no-cache build-base

WORKDIR /highlight
RUN python -m pip install -U pip setuptools
RUN python -m pip install -U poetry

WORKDIR /highlight/e2e/tests
COPY ./tests/pyproject.toml ./pyproject.toml
COPY ./tests/poetry.lock ./poetry.lock
RUN poetry install --all-extras

CMD ["pytest"]
