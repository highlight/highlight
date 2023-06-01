export const tsconfig = {
	title: 'Having TypeScript issues?',
	content:
		'Using our library requires setting skipLibCheck because of one of our dependencies that references node types. ' +
		'At runtime, this does not cause issues because of dynamic imports and other polyfilling done to ensure the sdk works in the cloud flare worker runtime, but the types are still referenced.\n',
	code: {
		text: `{
  /* ... your other options ... */
  "compilerOptions": {
    /* required due to our sdk's usage of 'opentelemetry-sdk-workers'
       which works around node syntax in its dependencies by dynamically replacing
       the imported javascript bundle, but does not replace the '@types/node' dependency */
    "skipLibCheck": true,
    "types": ["@cloudflare/workers-types"]
  },
}
`,
		language: `json`,
	},
}
