import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const AWSLambdaContent: QuickStartContent = {
	title: 'AWS Lambda',
	subtitle: 'Learn how to set up highlight.io tracing for on AWS Lambda.',
	logoUrl: siteUrl('/images/quickstart/aws-lambda.svg'),
	entries: [
		{
			title: 'Add the ARN layer.',
			content: `Add the ARN layer to your Lambda function. Click on the "Layers" tab in the Lambda console and click "Add layer". You can find the most recent instrumentation release URLs in [their releases](https://github.com/open-telemetry/opentelemetry-lambda/releases).

![AWS Lambda ARN](/images/docs/serverless/aws-lambda-arn-config.png)`,
			code: [
				{
					text: `arn:aws:lambda:<region>:184161586896:layer:opentelemetry-<language>-<version>`,
					language: 'shell',
				},
			],
		},
		{
			title: 'Set the ENV vars.',
			content: `Set the ENV vars to connect your Lambda to Highlight. For more details on setting up the OTeL Lambda autoinstrumentation and some language-specific details, see [their documentation](https://opentelemetry.io/docs/faas/lambda-auto-instrument/).

![AWS Lambda ENV vars](/images/docs/serverless/aws-lambda-env-config.png)`,
			code: [
				{
					text: `AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.highlight.io:4318
OTEL_RESOURCE_ATTRIBUTES=highlight.project_id=<project_id>,service.name=<service_name>`,
					language: 'shell',
				},
			],
		},
		{
			title: 'Test your Lambda function.',
			content:
				'Hit your Lambda function by testing it from the AWS console or sending an HTTP request to it.',
		},
		{
			...verifyTraces,
			content:
				verifyTraces.content +
				` ![AWS Lambda traces in Highlight](/images/docs/serverless/aws-lambda-python-trace-in-highlight.png)`,
		},
	],
}
