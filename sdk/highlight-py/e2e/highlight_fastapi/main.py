""" Run with `poetry run uvicorn main:app` """
import logging
import random

from fastapi import FastAPI, Request, HTTPException, APIRouter

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware

H = highlight_io.H(
    "1",
    instrument_logging=True,
    otlp_endpoint="http://localhost:4318",
    service_name="my-fastapi-app",
    service_version="1.0.0",
)

app = FastAPI()
app.add_middleware(FastAPIMiddleware)

router = APIRouter()


@app.get("/")
@app.post("/")
async def root(request: Request):
    logging.info(
        "hello, world", {"customer": request.headers.get("customer") or "unknown"}
    )
    for idx in range(100):
        logging.info(f"hello {idx}")
        if random.randint(0, 100) == 1:
            raise Exception(f"random error! {idx}")
        elif random.randint(0, 100) == 1:
            logging.info(f"oh no {5 / 0}")
    logging.warning("made it outside the loop!")
    return {"message": "Hello World"}


@router.get("/not-found")
def health_check():
    logging.info("oh, no!")
    raise HTTPException(status_code=404, detail="Item not found")


app.include_router(router)
