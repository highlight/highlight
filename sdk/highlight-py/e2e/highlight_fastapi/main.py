""" Run with `poetry run uvicorn main:app` """
import logging
import random

from fastapi import FastAPI, Request, HTTPException, APIRouter
from e2e.highlight_fastapi.work import add
import redis
import boto
import boto3
import os

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware

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
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

try:
    aws_key = os.getenv("E2E_AWS_ACCESS_KEY")
    aws_secret = os.getenv("E2E_AWS_SECRET_KEY")
    aws_region = os.getenv("E2E_AWS_REGION", "us-east-2")
    sqs_queue_url = os.getenv("SQS_QUEUE_URL")

    s3 = boto.connect_s3(aws_key, aws_secret)
    sqs = boto3.client(
        "sqs",
        aws_access_key_id=aws_key,
        aws_secret_access_key=aws_secret,
        region_name=aws_region,
    )
except:
    logging.warning("Not able to connect to AWS. Check credentials")


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


@app.get("/redis")
@app.post("/redis")
async def redis(request: Request):
    redis_key = "fastapi-e2e-test"
    redis_value = r.get(redis_key)
    redis_hit = bool(redis_value)

    if not redis_hit:
        redis_value = random.randint(0, 100)
        r.set(redis_key, redis_value, 60)

    return {"value": redis_value, "hit-cache": redis_hit}


@app.get("/boto")
@app.post("/boto")
async def boto(request: Request):
    bucket = s3.get_bucket("source-maps-test")
    return {"message": f"Found bucket: {bucket.name}"}


@app.get("/boto3sqs_send")
@app.post("/boto3sqs_send")
async def boto3sqs(request: Request):
    message_value = random.randint(0, 100)
    sqs.send_message(
        QueueUrl=sqs_queue_url, MessageBody=f"Success from e2e app - {message_value}"
    )
    return {"message": f"Sent message: {message_value}"}


@app.get("/boto3sqs_receive")
@app.post("/boto3sqs_receive")
async def boto3sqs(request: Request):
    response = sqs.receive_message(QueueUrl=sqs_queue_url, MaxNumberOfMessages=10)
    return response


@router.get("/not-found")
def health_check():
    logging.info("oh, no!")
    raise HTTPException(status_code=404, detail="Item not found")


app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
