---
title: Logging in AWS
slug: aws
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
---

Deploying your application or infrastructure in Amazon Web Services (AWS)? Stream your logs to highlight to see everything in one place.
Most AWS Services support streaming logs via Fluent Forward though the exact configuration will differ.
Read the [AWS documentation here](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html) to learn more.

Check out the following examples of setting up logs streaming in these services:

## AWS ECS Containers

To stream your container logs to highlight from an ECS Fargate container, we recommend running a fluent-bit agent alongside the container
to stream logs to highlight (which accepts AWS FireLens logs via the [Fluent Forward](https://docs.fluentbit.io/manual/pipeline/outputs/forward/ protocol)).

Here's a sample task definition (based on the [AWS docs](https://github.com/aws-samples/amazon-ecs-firelens-examples/tree/mainline/examples/fluent-bit/ecs-log-collection)) containing a dummy app container and a fluent-bit agent configured alongside.

```json
{
  "family": "firelens-example-highlight",
  "taskRoleArn": "arn:aws:iam::XXXXXXXXXXXX:role/ecs_task_iam_role",
  "executionRoleArn": "arn:aws:iam::XXXXXXXXXXXX:role/ecs_task_execution_role",
  "containerDefinitions": [
    {
      "essential": true,
      "image": "906394416424.dkr.ecr.us-east-1.amazonaws.com/aws-for-fluent-bit:stable",
      "name": "log_router",
      "firelensConfiguration":{
        "type":"fluentbit"
      }
    },
    {
      "essential": true,
      "image": "my-app:latest",
      "name": "app",
      "logConfiguration": {
        "logDriver":"awsfirelens",
        "options": {
          "Name": "Forward",
          "Host": "otel.highlight.io",
          "Tag": "highlight.project_id=<YOUR_PROJECT_ID>"
        }
      }
    }
  ]
}

```
