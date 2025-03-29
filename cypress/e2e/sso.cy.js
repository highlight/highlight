describe('login spec', () => {
	it('allows you to log in using SSO', () => {
		cy.visit('/1/buttons').wait(5000)
		cy.url().should('include', '/sign_in')
		cy.get('[name="email"]').type('vadim@highlight.io').blur().wait(5000)
		cy.get('[name="password"]').should('not.exist')
		cy.get('button[type="submit"]').click()
		// Verify redirect to Google SSO page
		cy.origin('accounts.google.com', () => {
			// We're now in the Google domain context
			cy.url().should('include', 'accounts.google.com')
		})

		// Return to local buttons page after Google SSO
		cy.visit('/sign_in').url().should('include', '/sign_in') // Verify we're redirected to sign_in page

		// Try again with different email domain
		cy.get('[name="email"]')
			.clear()
			.type('vadim@highlight.run')
			.blur()
			.wait(5000)
		cy.get('[name="password"]').should('not.exist')
		cy.get('button[type="submit"]').click()
		// Verify redirect to Google SSO page
		cy.origin('accounts.google.com', () => {
			// We're now in the Google domain context
			cy.url().should('include', 'accounts.google.com')
		})
	})
})
