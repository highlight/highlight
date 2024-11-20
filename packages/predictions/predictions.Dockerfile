ARG IMAGE_BASE_NAME="python:3.12"
FROM ${IMAGE_BASE_NAME}

WORKDIR /highlight/packages/predictions

RUN python -m pip install -U pip setuptools
RUN python -m pip install -U poetry

COPY ./packages/predictions/pyproject.toml .
COPY ./packages/predictions/poetry.lock .
RUN poetry install --all-extras
COPY ./packages/predictions/src ./src

CMD ["poetry", "run", "flask", "--app", "src/main.py", "run", "-h", "0.0.0.0", "-p", "5001"]
