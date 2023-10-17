import { siteUrl } from '../../../utils/urls'
import { QuickStartStep } from '../QuickstartContent'

export const previousInstallSnippet: (slug: string) => QuickStartStep = (
	slug,
) => ({
	title: 'Set up your frontend highlight.io integration.',
	content: `First, make sure you've followed the [frontend getting started](${siteUrl(
		'/docs/getting-started/overview',
	)}) guide.`,
})

export const verifyLogs: QuickStartStep = {
	title: 'Verify your backend logs are being recorded.',
	content:
		'Visit the [highlight logs portal](http://app.highlight.io/logs) and check that backend logs are coming in.',
}

export const curlExample: QuickStartStep = {
	title: 'Send structured logs from curl via the OTLP HTTPS protocol.',
	content:
		'Get started quickly with logs transmitted over the OTLP HTTPS protocol.',
	code: [
		{
			text: `curl -X POST https://otel.highlight.io:4318/v1/logs \\
-H 'Content-Type: application/json' \\
-d '{
      "resourceLogs": [
        {
          "resource": {
            "attributes": [
              {
                  "key": "service.name",
                  "value": {
                      "stringValue": "my-service"
                  }
              }
          ]
          },
          "scopeLogs": [
            {
              "scope": {},
              "logRecords": [
                {
                  "timeUnixNano": "'$(date +%s000000000)'",
                  "severityNumber": 9,
                  "severityText": "Info",
                  "name": "logA",
                  "body": {
                    "stringValue": "Hello, world! This is sent from a curl command."
                  },
                  "attributes": [
                    {
                      "key": "highlight.project_id",
                      "value": {
                        "stringValue": "<YOUR_PROJECT_ID>"
                      }
                    },
                    {
                      "key": "foo",
                      "value": {
                        "stringValue": "bar"
                      }
                    }
                  ],
                  "traceId": "08040201000000000000000000000000",
                  "spanId": "0102040800000000"
                }
              ]
            }
          ]
        }
      ]
    }'`,
			language: 'bash',
		},
	],
}

export const curlExampleRaw: QuickStartStep = {
	title: 'Send raw logs over HTTPS via curl.',
	content: 'Get started quickly with logs transmitted over HTTPS.',
	code: [
		{
			text: `curl -X POST https://pub.highlight.io/v1/logs/raw?project=YOUR_PROJECT_ID&service=my-backend \\
-d 'hello, world! this is the log message'`,
			language: 'bash',
		},
	],
}
