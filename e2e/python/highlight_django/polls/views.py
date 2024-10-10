import logging
import random

from django.http import HttpResponse, HttpRequest


def index(request: HttpRequest):
    logging.info(
        "hello handler",
        {
            "customer": {
                "first_name": request.headers.get("first_name") or "Din",
                "last_name": request.headers.get("last_name") or "Djarin",
            }
        }
    )
    if random.random() < 0.5:
        return HttpResponse(f"result is {2 / 0}")
    return HttpResponse("Hello, world. You're at the polls index.")
