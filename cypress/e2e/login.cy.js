describe('login spec', () => {
	beforeEach(() => {
		// Assign aliases to GraphQL requests based on operation name.
		cy.intercept('POST', '/public', (req) => {
			req.alias = req.body.operationName
		})
		cy.intercept('POST', '/v1/traces', (req) => {
			req.alias = 'oteltraces'
		})
		cy.intercept('POST', '/v1/metrics', (req) => {
			req.alias = 'otelmetrics'
		})
	})

	it('allows you to log in using ADMIN_PASSWORD', () => {
		cy.visit('/1/buttons').wait(1000)
		cy.title().then((title) => {
			console.log('TITLE', title)
			if (title === 'About You') {
			}
		})
		cy.get('[name="email"]').type('demo@user.com').blur()
		cy.get('[name="password"]').type('password')
		cy.get('button[type="submit"]').click().wait(1000)

		// Ensure client requests are made
		cy.wait('@otelmetrics')
			.its('request.body.resourceMetrics.0.scopeMetrics.0.metrics.0')
			.should('have.property', 'name')
		cy.wait('@oteltraces')
			.its('request.body.resourceSpans.0.scopeSpans.0.spans.0')
			.should('have.property', 'name')
		cy.wait('@initializeSession')
			.its('request.body.variables')
			.should('have.property', 'session_secure_id')
		cy.wait('@PushPayloadCompressed')
	})
})
