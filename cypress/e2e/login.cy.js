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
		cy.get('[name="email"]').should('be.visible').type('demo@example.com')
		cy.get('[name="password"]').type('hello,world!')
		cy.get('button[type="submit"]').click().wait(5000)
		cy.visit('/1/buttons').wait(5000)
		cy.title().then((title) => {
			if (title === 'About You') {
				cy.get('[name="First Name"]').type('Swag')
				cy.get('[name="Last Name"]').type('Master')
				cy.get('[name="Role"]').type('Boba')
				cy.get('button[type="button"]').click({ multiple: true })
				cy.get('button[type="submit"]').click().wait(5000)
			}
		})
		cy.get('#draw').click().wait(5000)

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
