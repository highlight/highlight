""" Run with `poetry run uvicorn main:app` """
import logging
import random

from fastapi import FastAPI, Request, HTTPException, APIRouter
from e2e.highlight_fastapi.work import add

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware
from highlight_io.integrations.celery import CeleryIntegration

H = highlight_io.H(
    "1",
    instrument_logging=True,
    otlp_endpoint="http://localhost:4318",
    service_name="my-fastapi-app",
    service_version="1.0.0",
    environment="e2e-test",
)

app = FastAPI()
app.add_middleware(FastAPIMiddleware)

router = APIRouter()


@app.get("/")
@app.post("/")
async def root(request: Request):
    logging.info(
        "hello, world",
        {
            "customer": request.headers.get("customer") or "unknown",
            "data": await request.json(),
        },
    )
    for idx in range(100):
        logging.info(f"hello {idx}")
        if random.randint(0, 100) == 1:
            raise Exception(f"random error! {idx}")
        elif random.randint(0, 100) == 1:
            logging.info(f"oh no {5 / 0}")
    logging.warning("made it outside the loop!")
    return {"message": "Hello World"}


@app.get("/celery")
@app.post("/celery")
async def celery(request: Request):
    task = add.delay(1, 2)
    value = task.get()
    return {"message": f"Celery job - {value}"}


@router.get("/not-found")
def health_check():
    logging.info("oh, no!")
    raise HTTPException(status_code=404, detail="Item not found")


app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
