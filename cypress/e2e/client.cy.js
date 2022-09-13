describe('client spec', () => {
	it('does not error', () => {
		// Assign aliases to GraphQL requests based on operation name.
		cy.intercept('POST', '/public', (req) => {
			console.log(req)
			req.alias = req.body.operationName
		}).as('public')

		// TODO: Think about hitting a different app. Maybe a static HTML file.
		cy.visit('https://localhost:3000')

		// Ensure requests are called
		cy.wait('@initializeSession')
		cy.wait('@addSessionProperties')
		cy.wait('@PushPayload')

		// TODO: Add some clicks and ensure properties are sent as expected
		// console.error('Testing')
	})
})
