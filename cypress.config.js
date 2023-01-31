const { defineConfig } = require('cypress')

module.exports = defineConfig({
	e2e: {
		baseUrl: process.env.REACT_APP_FRONTEND_URI,
		pageLoadTimeout: 1200000,
		video: false,
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
	},
})
