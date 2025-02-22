import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

import { QuickStartContent } from '../QuickstartContent'

const angularInitCodeSnippet = `// app.module.ts
    import { NgModule } from '@angular/core';
...

import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
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

@NgModule({
    ...
})
export class AppModule { }
`

export const AngularContent: QuickStartContent = {
	title: 'Angular',
	subtitle: 'Learn how to set up highlight.io with your Angular application.',
	logoKey: 'angular',
	products: ['Sessions', 'Errors', 'Logs', 'Traces'],
	entries: [
		packageInstallSnippet,
		{
			...initializeSnippet,
			code: [
				{
					...initializeSnippet.code,
					text: angularInitCodeSnippet,
					language: initializeSnippet.code?.[0]?.language ?? 'js',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
