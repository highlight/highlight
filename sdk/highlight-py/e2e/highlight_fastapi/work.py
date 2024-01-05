from celery import Celery
import highlight_io
from highlight_io.integrations.celery import CeleryIntegration

H = highlight_io.H(
    "1",
    instrument_logging=True,
    otlp_endpoint="http://localhost:4318",
    service_name="my-celery-worker",
    service_version="1.0.0",
    environment="e2e-test",
)

app = Celery(
    "e2e.highlight_fastapi.work",
    broker="redis://localhost:6379/1",
    backend="redis://localhost:6379/1",
)


@app.task
def add(x, y):
    return x + y


# poetry run celery -A e2e.highlight_fastapi.work worker --loglevel=INFO
if __name__ == "__main__":
    worker = app.Worker(include=["e2e.highlight_fastapi.work"])
    worker.start()
