import logging
import random

from fastapi import FastAPI, Request

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware

H = highlight_io.H(
    "1",
    record_logs=True,
    otlp_endpoint="http://localhost:4318",
)

app = FastAPI()
app.add_middleware(FastAPIMiddleware)


@app.get("/")
async def root(request: Request):
    logging.info(
        "hello, world", {"customer": request.headers.get("customer") or "unknown"}
    )
    for idx in range(100):
        logging.info(f"hello {idx}")
        if random.randint(0, 100) == 1:
            raise Exception(f"random error! {idx}")
    logging.warning("made it outside the loop!")
    return {"message": "Hello World"}
