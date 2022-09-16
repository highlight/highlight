describe('login spec', () => {
	it('allows you to log in', () => {
		// Assign aliases to GraphQL requests based on operation name.
		cy.intercept('POST', '/public', (req) => {
			req.alias = req.body.operationName
		})

		cy.visit('https://localhost:3000')

		// Ensure client requests are made
		cy.wait('@initializeSession')
		cy.wait('@addSessionProperties')
		cy.wait('@PushPayload')

		// Fill out login form
		cy.get('[name="email"]').should('be.visible').type('swag@highlight.run')

		cy.get('[name="password"]')
			.should('be.visible')
			.type('9nsUj7eNoh#qeVPB!LaYCPFLBs!wwPG2')

		cy.get('button[type="submit"]').should('be.visible').click()
	})
})
