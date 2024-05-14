import json
import os.path


def load_kafka_message():
    with open("/home/vkorolik/Downloads/topic-message", "r") as f:
        data = json.load(f)
        key = data["Key"]
        value = json.loads(data["Value"])
        pp = value["PushPayload"]
        events = pp["events"]
        messages = json.loads(pp["messages"])
        resources = json.loads(pp["resources"])
        return events["events"], messages["messages"], resources["resources"]


def main():
    events, messages, resources = load_kafka_message()
    print(len(events), len(messages), len(resources))


if __name__ == "__main__":
    main()
