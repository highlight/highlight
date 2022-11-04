describe('login spec', () => {
	beforeEach(() => {
		// Assign aliases to GraphQL requests based on operation name.
		cy.intercept('POST', '/public', (req) => {
			req.alias = req.body.operationName
		})
	})

	it('allows you to log in', () => {
		cy.visit('/')

		// Fill out login form
		cy.get('[name="email"]').should('be.visible').type('swag@highlight.run')
		cy.get('[name="password"]').type('9nsUj7eNoh#qeVPB!LaYCPFLBs!wwPG2')
		cy.get('button[type="submit"]').click().wait(1000)
		cy.visit('/1/buttons')

		// Ensure client requests are made
		cy.wait('@pushMetrics')
			.its('request.body.variables')
			.should('have.property', 'metrics')
		cy.wait('@initializeSession')
			.its('request.body.variables')
			.should('have.property', 'session_secure_id')
		cy.wait('@addSessionProperties')
			.its('request.body.variables.properties_object')
			.should('have.property', 'visited-url')
		cy.wait('@PushPayload')
	})
})
