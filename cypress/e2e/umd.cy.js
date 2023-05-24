describe('web client recording spec', () => {
	;['unpkg', 'jsdelivr'].map((source) => {
		it('public graph requests are recorded', { baseUrl: null }, () => {
			cy.intercept('POST', '/public', (req) => {
				req.alias = req.body.operationName
			})
			cy.visit(`./cypress/pages/${source}.html`)
			cy.window().then((win) => {
				// delay can be long because the client test might run first, and waiting for vite to have the dev bundle ready can take a while.
				cy.wait('@PushPayload', { timeout: 90 * 1000 })
					.its('request.body.variables')
					.should('have.property', 'resources')

				cy.wait('@PushPayload')
					.its('request.body.variables')
					.should('have.property', 'events')
			})
		})
	})
})
