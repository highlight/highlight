describe('client recording spec', () => {
	beforeEach(() => {
		// Assign aliases to GraphQL requests based on operation name.
		cy.intercept('POST', '/public', (req) => {
			req.alias = req.body.operationName
		})
	})

	it('fetch requests are recorded', () => {
		cy.visit('/')
		cy.wait('@PushPayload')
		// make fetch requests
		cy.window().then((win) => {
			win.eval(`fetch(new URL('https://localhost:3000/index.html'))`)
			win.eval(
				`fetch(new URL('https://localhost:3000/index.html'), {method: 'POST'})`,
			)
			win.eval(`fetch('https://localhost:3000/index.html')`)
			win.eval(
				`fetch('https://localhost:3000/index.html', {method: 'POST'})`,
			)
		})

		// Ensure client network resources are recorded
		cy.wait('@PushPayload')
			.its('request.body.variables.resources')
			.should('have.deep.property', '.[0].initiatorType', 'fetch')
	})
})
