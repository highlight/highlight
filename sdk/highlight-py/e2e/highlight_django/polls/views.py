import logging
import random

from django.http import HttpResponse, HttpRequest


def index(request: HttpRequest):
    logging.info(
        "hello handler", {"customer": request.headers.get("customer") or "unknown"}
    )
    if random.random() < 0.5:
        return HttpResponse(f"result is {2 / 0}")
    return HttpResponse("Hello, world. You're at the polls index.")
