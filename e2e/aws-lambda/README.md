# Highlight SDK AWS Lambda Example

This example demonstrates how to use the Highlight SDK with AWS Lambda functions in a serverless application. It showcases various features of the Highlight SDK including:

- Distributed tracing
- Error monitoring and tracking
- Metric collection
- Logging

## Architecture

This example contains several Lambda functions that demonstrate different aspects of the Highlight SDK:

1. **API Function** (`src/api.ts`) - Demonstrates basic API tracing with HTTP endpoints
2. **Error Function** (`src/error.ts`) - Shows how to properly handle and report errors
3. **Metrics Function** (`src/metrics.ts`) - Demonstrates the different types of metrics you can collect
4. **Processor Function** (`src/processor.ts`) - Shows how to handle SQS events with Highlight integration

## Prerequisites

- Node.js 18 or higher
- AWS CLI
- AWS SAM CLI
- An AWS account
- A Highlight account and project ID

## Setup

1. Clone this repository
2. Install dependencies:

```bash
cd e2e/aws-lambda
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

4. Update the `template.yaml` file with your Highlight project ID or set it when deploying.

## Deployment

You can deploy this example to your AWS account using the SAM CLI:

```bash
# Package the application
npm run package

# Deploy the application
npm run deploy -- --parameter-overrides HighlightProjectID=your-project-id
```

## Local Testing

You can test the Lambda functions locally using the SAM CLI:

```bash
# Start the local API
npm run start-api
```

Then you can access the endpoints at:

- API: http://localhost:3000/api
- Error Demo: http://localhost:3000/error?type=validation
- Metrics Demo: http://localhost:3000/metrics?type=all

## Testing the SQS Integration

To test the SQS functionality, you can send a message to the SQS queue after deployment:

```bash
aws sqs send-message \
  --queue-url YOUR_QUEUE_URL \
  --message-body '{"type":"notification","content":"Test message"}' \
  --message-attributes '{
    "secureSessionId": {
      "DataType": "String",
      "StringValue": "test-session-id"
    }
  }'
```

## Highlight SDK Features Demonstrated

### Tracing

- API request/response tracking
- End-to-end tracing across services
- Custom span attributes

### Error Handling

- Different error types (validation, business logic, etc.)
- Error metadata
- Error reporting and tracking

### Metrics

- Gauge metrics (values that go up and down)
- Counter metrics (cumulative counts)
- Histogram metrics (distributions of values)
- Custom metric attributes/tags

### Logging

- Structured logging integration
- Log correlation with traces

## Key Files

- `src/highlight-client.ts` - Initializes and manages the Highlight client
- `src/lambda-utils.ts` - Contains utilities for AWS Lambda integration with Highlight
- `template.yaml` - AWS SAM template defining the serverless architecture

## Best Practices Implemented

1. **Singleton Client**: The Highlight client is initialized once and reused across invocations
2. **Proper Cleanup**: The client is properly flushed and stopped at the end of each Lambda invocation
3. **Error Tracking**: All errors are captured and reported with appropriate context
4. **Correlation IDs**: Request IDs and session IDs are properly tracked across the application
5. **Structured Metadata**: All logs and spans include structured metadata for better filtering
6. **Custom Metrics**: Application-specific metrics are recorded for performance monitoring

## License

This example is provided under the Apache-2.0 license.
