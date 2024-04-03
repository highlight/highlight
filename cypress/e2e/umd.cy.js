const cdns = ['unpkg', 'unpkg-remote', 'jsdelivr', 'local']
describe('web client recording spec', () => {
	cdns.map((source) => {
		it(
			`public graph requests are recorded when highlight set up from ${source}`,
			{ baseUrl: null },
			() => {
				cy.intercept('POST', '/public', (req) => {
					req.alias = req.body.operationName
				})
				cy.visit(`./cypress/pages/${source}.html`, {})
				cy.window().then((win) => {
					// delay can be long because the client test might run first, and waiting for vite to have the dev bundle ready can take a while.
					cy.wait('@PushPayloadCompressed', { timeout: 90 * 1000 })
						.its('request.body.variables')
						.should('have.property', 'data')

					cy.wait('@PushPayloadCompressed')
						.its('request.body.variables')
						.should('have.property', 'data')
				})
			},
		)
	})
})
