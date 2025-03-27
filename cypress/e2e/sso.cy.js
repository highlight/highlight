describe('login spec', () => {
	it('allows you to log in using SSO', () => {
		cy.visit('/1/buttons').wait(1000).url().should('include', '/sign_in')
		cy.get('[name="email"]').type('vadim@highlight.io').blur()
		cy.get('[name="password"]').should('not.exist')
		cy.get('button[type="submit"]')
			.click()
			.wait(1000)
			.url()
			.should('include', 'accounts.google.com') // Verify redirect to Google SSO page

		// Return to local buttons page after Google SSO
		cy.go('back').wait(1000).url().should('include', '/sign_in') // Verify we're redirected to sign_in page

		// Try again with different email domain
		cy.get('[name="email"]').clear().type('vadim@highlight.run').blur()
		cy.get('[name="password"]').should('not.exist')
		cy.get('button[type="submit"]')
			.click()
			.wait(1000)
			.url()
			.should('include', 'accounts.google.com') // Verify redirect to Google SSO page
	})
})
