import {
	configureSourcemapsCI,
	identifySnippet,
	sessionReplayFeaturesLink,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

import { QuickStartContent } from '../QuickstartContent'

export const OtherContext: QuickStartContent = {
	title: 'HTML/JS',
	subtitle:
		'Learn how to set up highlight.io with any browser-based framework.',
	logoKey: 'javascript',
	products: ['Sessions', 'Errors', 'Logs', 'Traces'],
	entries: [
		{
			title: 'Import the script in your index html file.',
			content:
				'Add the following script tag to the head section of your `index.html` file.',
			code: [
				{
					text: `<html>
<head>
    <script src="https://unpkg.com/highlight.run"></script>
</head>
<body>
    <!-- Your Application -->
</body>
</html>
`,
					language: 'html',
				},
			],
		},
		{
			title: 'Initialize the SDK.',
			content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method. Place this method just below the initialize script tag in the \`head\` section of your \`index.html\` file.
                    
To get started, we recommend setting \`environment\`, \`version\`, and \`networkRecording\`. Refer to our docs on [SDK configuration](${sessionReplayFeaturesLink}) to read more about these options. `,
			code: [
				{
					text: `<html>
<head>
    <script src="https://unpkg.com/highlight.run"></script>
    <script>
        H.init('<YOUR_PROJECT_ID>', { // Get your project ID from https://app.highlight.io/setup
            environment: 'production',
            version: 'commit:abcdefg12345',
            networkRecording: {
                enabled: true,
                recordHeadersAndBody: true,
                urlBlocklist: [
					// insert full or partial urls that you don't want to record here
					// Out of the box, Highlight will not record these URLs (they can be safely removed):
					"https://www.googleapis.com/identitytoolkit",
					"https://securetoken.googleapis.com",
                ],
            },
        });
    </script>
</head>
<body>
    <!-- Your Application -->
</body>
</html>
`,
					language: 'html',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
