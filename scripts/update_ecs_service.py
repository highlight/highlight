import boto3


def main():
    ecs = boto3.Session().client("ecs")
    ecs.update_service(cluster='highlight-production-cluster', service='opentelemetry-collector-service', loadBalancers=[
        {
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-grpc/df4aad67f5efdd7a",
            "containerName": "highlight-collector",
            "containerPort": 4317
        },
        {
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-http/ab4e710c0fdc140d",
            "containerName": "highlight-collector",
            "containerPort": 4318
        },
        {
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-fluentd/3be463a4f9874cf2",
            "containerName": "highlight-collector",
            "containerPort": 24224
        },
        {
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-syslog/e610cdefccf1ec24",
            "containerName": "highlight-collector",
            "containerPort": 34302
        }
    ])


if __name__ == "__main__":
    main()
