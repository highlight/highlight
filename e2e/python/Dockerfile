ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e:latest"
FROM ${IMAGE_BASE_NAME}

WORKDIR /highlight/e2e/python
COPY ./python/pyproject.toml .
COPY ./python/poetry.lock .
RUN poetry install --all-extras
COPY ./python .
WORKDIR /highlight/e2e/python/highlight_fastapi

ENV BACKEND_URI="http://localhost:8000/"
CMD ["poetry", "run", "python", "main.py"]
