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
		cy.wait(4000)
		cy.wait('@PushPayload')
		// ensure pushPayload buffer is cleared

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
			cy.wait(1000)
			cy.wait(60000)

			// Ensure client network resources are recorded
			const pp = cy
				.wait('@PushPayload')
				.its('request.body.variables.resources')
			for (let i = 0; i < 4; i++) {
				pp.should(
					'have.deep.property',
					`resources[${i * 4}].initiatorType`,
					'fetch',
				)
				pp.should(
					'have.deep.property',
					`resources[${i * 4}].name`,
					'https://localhost:3000/index.html',
				)
			}
		})
	})
})
