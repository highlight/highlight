import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonDjangoContext: QuickStartContent = {
	title: 'Python Django',
	subtitle:
		'Learn how to set up highlight.io on your Python Django backend API.',
	logoUrl: siteUrl('/images/quickstart/django.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Add Highlight with the Django integration to your `settings.py` file.',
			code: [
				{
					text: `import highlight_io
from highlight_io.integrations.django import DjangoIntegration

# \`instrument_logging=True\` sets up logging instrumentation.
# if you do not want to send logs or are using \`loguru\`, pass \`instrument_logging=False\`
H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	integrations=[DjangoIntegration()],
	instrument_logging=True,
	service_name="my-django-app",
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
				'Check that your installation is valid by throwing an error. ' +
				'Change one of your Django views to the following code which will throw an exception. ' +
				'Access the Django route in your browser. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random

from django.http import HttpResponse, HttpRequest


def index(request: HttpRequest):
    return HttpResponse(f"This might not go well. result is {2 / 0}")
`,
					language: 'python',
				},
			],
		},
		setupLogging('django'),
	],
}
