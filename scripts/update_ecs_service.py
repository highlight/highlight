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
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-tcp/6eeee22ac85df260",
            "containerName": "highlight-collector",
            "containerPort": 34302
        },
        {
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-metrics/a8eb9f015df49734",
            "containerName": "highlight-collector",
            "containerPort": 8888
        }
    ])


if __name__ == "__main__":
    main()
