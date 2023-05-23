const { defineConfig } = require('cypress')

module.exports = defineConfig({
	e2e: {
		baseUrl: 'https://localhost:3000',
		pageLoadTimeout: 1200000,
		video: true,
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
	},
	browser: {
		baseUrl: 'https://example.com/',
		pageLoadTimeout: 60000,
		video: true,
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
	},
})
