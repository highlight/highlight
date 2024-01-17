describe('login spec', () => {
	beforeEach(() => {
		// Assign aliases to GraphQL requests based on operation name.
		cy.intercept('POST', '/public', (req) => {
			req.alias = req.body.operationName
		})
	})

	it('allows you to log in using ADMIN_PASSWORD', () => {
		cy.visit('/1/buttons').wait(5000)
		cy.title().then((title) => {
			console.log('TITLE', title)
			if (title === 'About You') {
			}
		})
		cy.get('[name="email"]').type('demo@user.com')
		cy.get('[name="password"]').type('I_AM_GROOT')
		cy.get('button[type="submit"]').click().wait(5000)

		// Ensure client requests are made
		cy.wait('@pushMetrics')
			.its('request.body.variables')
			.should('have.property', 'metrics')
		cy.wait('@initializeSession')
			.its('request.body.variables')
			.should('have.property', 'session_secure_id')
		cy.wait('@PushPayloadCompressed')
	})
})
