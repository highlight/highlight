import { siteUrl } from '../../../../utils/urls'
import { downloadSnippet, init } from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonLibrariesTracesContent: QuickStartContent = {
	title: 'Python Libraries',
	subtitle:
		'Learn how to set up highlight.io tracing for common Python Libraries.',
	logoUrl: siteUrl('/images/quickstart/python.svg'),
	entries: [
		{
			title: 'Supported Python libraries',
			content: `highlight.io supports tracing for the following Python libraries:
\n[Boto](https://boto.cloudhackers.com/en/latest/ref/)
\n[Boto3 (sqs only)](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
\n[Celery](https://docs.celeryq.dev/en/stable/getting-started/introduction.html)
\n[Redis](https://redis.io/docs/connect/clients/python/)
\n[Requests](https://requests.readthedocs.io/en/latest/)
\n[SQLAlchemy](https://www.sqlalchemy.org/)
\n[Common AI / LLM Libraries](../python/python-ai)
`,
			code: [
				{
					text: `# install and use your library in your code
pip install Boto Boto3SQS Celery Redis requests SQLAlchemy`,
					language: 'bash',
				},
			],
		},
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK for your respective framework.',
			content:
				'Setup the SDK. Supported libraries will be instrumented automatically.',
			code: [
				{
					text: `import highlight_io

${init}
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Setup a test.',
			content:
				'Setup a endpoint or function with HTTP trigger that utilizes the library you are trying to test. ' +
				'For example, if you are testing the requests library, you can setup a function that makes a request to a public API.',
			code: [
				{
					text: `import requests
  
# from a flask app
@app.route("/external")
def external():
    r = requests.get(url="http://app.highlight.io/health_check")
    logging.info(f"received {r.status_code} response")

    return "<h1>External Request</h1>"
  `,
					language: 'python',
				},
			],
		},
		verifyTraces,
	],
}
