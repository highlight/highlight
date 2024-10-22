import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonFlaskContext: QuickStartContent = {
	title: 'Python Flask',
	subtitle:
		'Learn how to set up highlight.io on your Python Flask backend API.',
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
			title: 'Instrument manual error handlers.',
			content:
				'If you have existing error handlers, you need to instrument them manually to capture errors.',
			code: [
				{
					text: `# you may have a custom error handler that formats an error response
# make sure to report the error to highlight to capture it
@app.errorhandler(Exception)
def handle_general_exception(exc: Exception):
	highlight_io.H.get_instance().record_exception(exc)
	return jsonify(error="internal error", message=str(exc), trace=traceback.format_exc()), 503`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add the following code to your Flask app and start the Flask server. ' +
				'Visit http://127.0.0.1:5000/hello in your browser. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random
import time

from flask import Flask

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
)


@app.route("/hello")
def hello():
    return f"<h1>bad idea { 5/0 }</h1>"


if __name__ == "__main__":
    app.run()`,
					language: 'python',
				},
			],
		},
		setupLogging('flask'),
	],
}
