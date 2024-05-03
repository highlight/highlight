import highlight_io
from flask import (
    Flask,
    request,
)
from highlight_io.integrations.flask import FlaskIntegration
from openai import OpenAI
from opentelemetry.instrumentation.openai import OpenAIInstrumentor

H = highlight_io.H(
    "1",
    integrations=[FlaskIntegration()],
    instrument_logging=True,
    otlp_endpoint="http://localhost:4318",
    service_name="openai-app",
    service_version="1.0.0",
    environment="e2e-test",
)
OpenAIInstrumentor().instrument()

client = OpenAI()

app = Flask(__name__)
chat_history = [
    {"role": "system", "content": "You are a helpful assistant."},
]


@app.route("/chat", methods=["POST"])
def basic():
    chat_history.append({"role": "user", "content": request.json["message"]})
    completion = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=chat_history,
    )
    chat_history.append(
        {"role": "assistant", "content": completion.choices[0].message.content}
    )
    return completion.choices[0].message.content


if __name__ == "__main__":
    app.run()
