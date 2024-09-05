import { siteUrl } from '../../../../utils/urls'
import {
	downloadSnippet,
	setupFrontendSnippet,
} from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonFlaskTracesContent: QuickStartContent = {
	title: 'Python Flask',
	subtitle: 'Learn how to set up highlight.io tracing for your Flask app.',
	logoUrl: siteUrl('/images/quickstart/flask.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK to with the Flask integration.',
			code: [
				{
					text: `from flask import Flask

import highlight_io
from highlight_io.integrations.flask import FlaskIntegration

app = Flask(__name__)

# \`instrument_logging=True\` sets up logging instrumentation.
# if you do not want to send logs or are using \`loguru\`, pass \`instrument_logging=False\`
H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	integrations=[FlaskIntegration()],
	instrument_logging=True,
	service_name="my-flask-app",
	service_version="git-sha",
	environment="production",
)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by visiting one your ' +
				'Flask views in your browser.',
			code: [
				{
					text: `@app.route("/hello")
def hello():
    return "<h1>Hello world</h1>"


if __name__ == "__main__":
    app.run()`,
					language: 'python',
				},
			],
		},
		verifyTraces,
	],
}
