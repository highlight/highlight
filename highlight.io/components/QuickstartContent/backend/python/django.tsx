import { QuickStartContent } from '../../QuickstartContent'
import { downloadSnippet, setupFrontendSnippet, setupLogging } from './shared-snippets'

export const PythonDjangoContext: QuickStartContent = {
  title: 'Python Django',
  subtitle: 'Learn how to set up highlight.io on your Python Django backend API.',
  entries: [
    setupFrontendSnippet,
    downloadSnippet('Django'),
    {
      title: 'Initialize the Highlight SDK.',
      content: 'Add Highlight with the Django integration to your `settings.py` file.',
      code: {
        text: `import highlight_io
from highlight_io.integrations.django import DjangoIntegration

H = highlight_io.H("YOUR_PROJECT_ID", integrations=[DjangoIntegration()], record_logs=True)`,
        language: 'python',
      },
    },
    {
      title: 'Verify your installation.',
      content:
        'Check that your installation is valid by throwing an error. ' +
        'Change one of your Django views to the following code which will throw an exception. ' +
        'Access the Django route in your browser. ' +
        'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
        'within a few moments.',
      code: {
        text: `import logging
import random

from django.http import HttpResponse, HttpRequest


def index(request: HttpRequest):
    return HttpResponse(f"This might not go well. result is {2 / 0}")
`,
        language: 'python',
      },
    },
    setupLogging('django'),
  ],
}
