import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import { downloadSnippet, init } from './shared-snippets-monitoring'

export const PythonOtherReorganizedContext: QuickStartContent = {
	title: 'Python',
	subtitle: 'Learn how to set up highlight.io in your Python app.',
	logoKey: 'python',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
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
    with H.trace(span_name="my_span"):
        logging.info('hello, world!', {'favorite_number': 7})
        return f"<h1>bad idea { 5/0 }</h1>"


if __name__ == "__main__":
    main()`,
					language: 'python',
				},
			],
		},
		{
			title: 'Call the built-in Python logging library.',
			content:
				'Logs are reported automatically from the builtin logging methods (as long as `instrument_logging=True` is provided to the `highlight_io.H` constructor). ' +
				'Visit the [highlight logs portal](https://app.highlight.io/logs) and check that backend logs are coming in. ' +
				'Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `import logging
		
		def main():
				logging.info('hello, world!')
				logging.warn('whoa there', {'key': 'value'})
		`,
					language: 'python',
				},
			],
		},
		verifyLogs,
		{
			title: 'Run your code with the H.trace() wrapper.',
			content: 'Wrap your code with H.trace(), and run your code.',
			code: [
				{
					text: `import logging
		
		def main():
				with H.trace(span_name="my_span"):
						logging.info('hello, world!', {'favorite_number': 7})
						return f"<h1>Hello world</h1>"
		
		if __name__ == "__main__":
				main()`,
					language: 'python',
				},
			],
		},
		{
			title: 'Use a decorator to trace your functions.',
			content:
				'Use the `highlight_io.trace()` decorator to create spans for your functions.',
			code: [
				{
					text: `import logging
		
		@highlight_io.trace
		def my_cool_method():
				logging.info("hello my_cool_method", {"customer": "unknown", "trace": "inside"})
				time.sleep(random.randint(0, 10) / 1000)
				logging.info("goodbye my_cool_method", {"customer": "unknown", "trace": "inside"})
		
		def main():
				with H.trace(span_name="my_span"):
						logging.info('hello, world!', {'favorite_number': 7})
						my_cool_method()
						return f"<h1>Hello world</h1>"
		
		if __name__ == "__main__":
				main()`,
					language: 'python',
				},
			],
		},
		verifyTraces,
	],
}
