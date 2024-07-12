import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const electronInitCodeSnippet = `// hooks.client.ts
...

import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    environment: 'production',
    version: 'commit:abcdefg12345',
    tracingOrigins: true,
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
...
`

export const ElectronContext: QuickStartContent = {
	title: 'Electron',
	subtitle:
		'Learn how to set up highlight.io with your Electron application.',
	logoUrl: siteUrl('/images/quickstart/electron.svg'),
	entries: [
		packageInstallSnippet,
		initializeSnippet,
		{
			title: 'Instrument Electron events',
			content:
				'The function will forward the focus and blur events to you renderer process so that the highlight recording can track them.\n' +
				'This will stop the Highlight recording when the app is not visible and resume the session when the app regains visibility to help minimize performance and battery impact that Highlight may have on Electron users.',
			code: [
				{
					text: `
const mainWindow = new BrowserWindow(...)
configureElectronHighlight(mainWindow)
`,
					language: 'js',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
