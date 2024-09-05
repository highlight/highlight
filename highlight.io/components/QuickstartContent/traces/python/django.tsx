import { siteUrl } from '../../../../utils/urls'
import {
	downloadSnippet,
	setupFrontendSnippet,
} from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const PythonDjangoTracesContent: QuickStartContent = {
	title: 'Python Django',
	subtitle: 'Learn how to set up highlight.io tracing for your Django app.',
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
			title: 'Hit your Django app.',
			content: 'Visit one your Django views in your browser.',
			code: [
				{
					text: `from django.http import HttpResponse, HttpRequest

def index(request: HttpRequest):
	return HttpResponse("Hello world!")
`,
					language: 'python',
				},
			],
		},
		verifyTraces,
	],
}
