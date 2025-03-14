import boto3


def main():
    ecs = boto3.Session().client("ecs")
    ecs.update_service(
        cluster="highlight-production-cluster",
        service="opentelemetry-collector-service",
        loadBalancers=[
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-grpc/d9b04e72d123c96f",
                "containerName": "highlight-collector",
                "containerPort": 4317,
            },
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-http/3e2e5ec0eae313c3",
                "containerName": "highlight-collector",
                "containerPort": 4318,
            },
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-fluentd/91ac09cac436f7e8",
                "containerName": "highlight-collector",
                "containerPort": 24224,
            },
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-tcp/db08f3ec0182ce0b",
                "containerName": "highlight-collector",
                "containerPort": 34302,
            },
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-metrics/24fccd3c297da2a0",
                "containerName": "highlight-collector",
                "containerPort": 8888,
            },
        ],
    )
    ecs.update_service(
        cluster="highlight-production-cluster",
        service="opentelemetry-collector-firehose-service",
        loadBalancers=[
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-fh-cwmetrics/b10cd5d8c5e9986a",
                "containerName": "highlight-collector",
                "containerPort": 4433,
            },
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-fh-cwlogs/1a4cadd2e92fb0dc",
                "containerName": "highlight-collector",
                "containerPort": 4434,
            },
            {
                "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-fh-otlpv1/4d911398de61a568",
                "containerName": "highlight-collector",
                "containerPort": 4435,
            },
        ],
    )


if __name__ == "__main__":
    main()
