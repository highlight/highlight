import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonOtherContext: QuickStartContent = {
	title: 'Python',
	subtitle: 'Learn how to set up highlight.io in your Python app.',
	logoUrl: siteUrl('/images/quickstart/python.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK.',
			code: [
				{
					text: `import highlight_io

${init}`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Try raising an exception somewhere in your code. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random
import time

import highlight_io

${init}


def main():
    with H.trace():
        logging.info('hello, world!', {'favorite_number': 7})
        return f"<h1>bad idea { 5/0 }</h1>"


if __name__ == "__main__":
    main()`,
					language: 'python',
				},
			],
		},
		setupLogging('other'),
	],
}
