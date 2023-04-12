describe('client recording spec', () => {
	beforeEach(() => {
		// Assign aliases to GraphQL requests based on operation name.
		cy.intercept('POST', '/public', (req) => {
			req.alias = req.body.operationName
		})
	})

	it('fetch requests are recorded', () => {
		cy.visit('/')
		cy.window().then((win) => {
			// delay can be long because the client test might run first, and waiting for vite to have the dev bundle ready can take a while.
			cy.wait('@PushPayload', { timeout: 90 * 1000 })
				.its('request.body.variables')
				.should('have.property', 'resources')
				.then((resources) => {
					const parsedResources = JSON.parse(resources).resources
					const firstResourceKeys = Object.keys(
						parsedResources[0],
					).sort()

					expect(firstResourceKeys).to.eql([
						'encodedBodySize',
						'initiatorType',
						'name',
						'responseEnd',
						'startTime',
						'transferSize',
					])
				})

			win.eval(`fetch(new URL('https://localhost:3000/index.html'))`)
			win.eval(
				`fetch(new URL('https://localhost:3000/index.html'), {method: 'POST'})`,
			)
			win.eval(`fetch('https://localhost:3000/index.html')`)
			win.eval(
				`fetch('https://localhost:3000/index.html', {method: 'POST'})`,
			)
			win.eval(`H.track('MyTrackEvent', {'foo': 'bar'})`)

			cy.wait('@PushPayload')
				.its('request.body.variables')
				.then(({ resources, events }) => {
					if (!resources) {
						throw new Error('no resources')
					}
					if (!events) {
						throw new Error('no events')
					}
					const customEvent = new Array(events).find(
						(e) => e.type === 5,
					)
					if (!customEvent) {
						throw new Error(
							'no customEvent: ' + JSON.stringify(events),
						)
					}
				})
		})
	})
})
