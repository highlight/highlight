const { defineConfig } = require('cypress')

module.exports = defineConfig({
	e2e: {
		baseUrl: 'https://127.0.0.1:3000',
		pageLoadTimeout: 1200000,
		video: false,
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
	},
})
