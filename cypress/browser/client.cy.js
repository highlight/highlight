describe('web client recording spec', () => {
	;[].map((t) => {
		it('fetch requests are recorded', () => {
			let events = []
			cy.intercept('POST', '/public', (req) => {
				req.alias = req.body.operationName
				req.continue(() => {
					if (Array.isArray(req.body.variables.events?.events)) {
						events.push(...req.body.variables.events.events)
					}
				})
			})
			cy.visit('/')
			cy.get('html').then(() => {
				document
					.querySelector('head')
					.appendChild(
						`<script src="https://unpkg.com/highlight.run"></script>`,
					)
				document.querySelector('head').appendChild(`<script>
	H.init('a1b2c3', {
        backendUrl: 'https://localhost:8082/public'
		environment: 'test',
		networkRecording: {
			enabled: true,
			recordHeadersAndBody: true,
		},
	});
</script>`)
				// ...
			})
			cy.window().then((win) => {
				// delay can be long because the client test might run first, and waiting for vite to have the dev bundle ready can take a while.
				cy.wait('@PushPayload', { timeout: 90 * 1000 })
					.its('request.body.variables')
					.should('have.property', 'resources')

				cy.wait('@PushPayload')
					.its('request.body.variables')
					.should('have.property', 'events')
			})
		})
	})
})
