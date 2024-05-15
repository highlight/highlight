from openai import OpenAI

import highlight_io
from highlight_io.integrations.flask import FlaskIntegration

H = highlight_io.H(
    "1",
    integrations=[FlaskIntegration()],
    instrument_logging=True,
    otlp_endpoint="http://localhost:4318",
    service_name="openai-app",
    service_version="1.0.0",
    environment="e2e-test",
)

client = OpenAI()

chat_history = [
    {"role": "system", "content": "You are a helpful assistant."},
]


@highlight_io.trace
def complete(message: str) -> str:
    chat_history.append({"role": "user", "content": message})
    completion = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=chat_history,
    )
    chat_history.append(
        {"role": "assistant", "content": completion.choices[0].message.content}
    )
    return completion.choices[0].message.content


def main():
    print(complete("What is the capital of the United States?"))


if __name__ == "__main__":
    main()
    H.flush()
