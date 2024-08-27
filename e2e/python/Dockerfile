ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e:latest"
FROM ${IMAGE_BASE_NAME}

WORKDIR /highlight/e2e/python
COPY ./pyproject.toml .
COPY ./poetry.lock .
RUN poetry install --all-extras
COPY . .
WORKDIR /highlight/e2e/python/highlight_flask

ENV PYTHONPATH=/highlight/e2e/python/highlight_flask
ENV BACKEND_URI="http://localhost:5000/"
CMD ["poetry", "run", "flask", "run", "-h", "0.0.0.0"]
