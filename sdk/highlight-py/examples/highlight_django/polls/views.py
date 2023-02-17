import random

from django.http import HttpResponse


def index(request):
    if random.random() < 0.5:
        return HttpResponse(f"result is {2 / 0}")
    return HttpResponse("Hello, world. You're at the polls index.")
