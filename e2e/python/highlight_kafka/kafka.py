from confluent_kafka import Producer
from opentelemetry.propagate import inject
import highlight_io

H = highlight_io.H(
    "<YOUR_PROJECT_ID>",
    instrument_logging=True,
    service_name="kafka-producer",
)

# Define configuration for the Kafka producer
conf = {
    "bootstrap.servers": "localhost:9092",  # Kafka broker address
}
topic = "dev"


def delivery_callback(*args, **kwargs):
    print("delivery callback", args, kwargs)


def main():
    # Create the Producer instance
    producer = Producer(conf)

    for k, v in {"key": "value"}.items():
        with H.trace("kafka.produce"):
            headers = {"x-example-header": "value"}
            inject(headers)
            print("headers", headers)
            producer.produce(
                topic, key=k, value=v, headers=headers, on_delivery=delivery_callback
            )
            producer.poll(5000)
            producer.flush()

    producer.flush()


if __name__ == "__main__":
    main()
    H.flush()
