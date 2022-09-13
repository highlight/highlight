describe('login spec', () => {
	it('passes', () => {
		cy.visit('https://localhost:3000')

		cy.get('[name="email"]').should('be.visible').type('swag@highlight.run')

		cy.get('[name="password"]')
			.should('be.visible')
			.type('9nsUj7eNoh#qeVPB!LaYCPFLBs!wwPG2')

		cy.get('button[type="submit"]').should('be.visible').click()
	})
})
