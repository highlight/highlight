ARG IMAGE_BASE_NAME="ghcr.io/highlight/sdk:latest"
FROM ${IMAGE_BASE_NAME}

WORKDIR /highlight
RUN python -m pip install -U pip setuptools
RUN python -m pip install -U poetry

WORKDIR /highlight/e2e/tests
COPY ./tests/pyproject.toml ./pyproject.toml
COPY ./tests/poetry.lock ./poetry.lock
RUN poetry install --all-extras

CMD ["poetry", "run", "pytest"]
