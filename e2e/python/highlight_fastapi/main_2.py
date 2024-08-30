import asyncio
import sys
import highlight_io
import uvicorn
from fastapi import FastAPI, Request, BackgroundTasks
from highlight_io.integrations.fastapi import FastAPIMiddleware
import logging


# `instrument_logging=True` sets up logging instrumentation.
# if you do not want to send logs or are using `loguru`, pass `instrument_logging=False`
H = highlight_io.H(
    11983,
    instrument_logging=True,
    service_name="my-app",
    service_version="git-sha",
)
# logger.add(H.logging_handler, level="INFO", serialize=False)

app = FastAPI()
app.add_middleware(FastAPIMiddleware)


@app.get("/")
async def read_root(request: Request):
    result = 1 / 0
    return {"Hello": "World"}


def log_in_background():
    logging.info("logging in background task")
    return


@app.get("/background")
async def read_background(request: Request, background_tasks: BackgroundTasks):
    logging.info("starting a background task")
    background_tasks.add_task(log_in_background)
    logging.info("started a background task")
    return {"Hello": "World"}


async def main():
    "Run scheduler and the API"
    server = uvicorn.Server(config=uvicorn.Config(app, workers=1, loop="asyncio"))

    api = asyncio.create_task(server.serve())

    await asyncio.wait([api])


if __name__ == "__main__":
    asyncio.run(main())
