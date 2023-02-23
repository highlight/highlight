import logging
import random
import time

from fastapi import FastAPI

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
async def root():
    for idx in range(100):
        logging.info(f"hello {idx}")
        if random.randint(0, 100) == 1:
            raise Exception(f"random error! {idx}")
    logging.warning("made it outside the loop!")
    return {"message": "Hello World"}
