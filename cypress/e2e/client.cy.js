import { decompressPushPayload } from './util'

describe('client recording spec', () => {
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
		cy.window().then((win) => {
			// delay can be long because the client test might run first, and waiting for vite to have the dev bundle ready can take a while.
			cy.wait('@PushPayloadCompressed', { timeout: 90 * 1000 })
				.its('request.body.variables')
				.should('have.property', 'data')
				.then((data) => {
					const { resources } = decompressPushPayload(data)
					const parsedResources = JSON.parse(resources).resources
					const firstResourceKeys = Object.keys(
						parsedResources[0],
					).sort()

					expect(firstResourceKeys).to.eql([
						'encodedBodySize',
						'initiatorType',
						'name',
						'responseEnd',
						'responseEndAbs',
						'startTime',
						'startTimeAbs',
						'transferSize',
					])

					win.eval(
						`fetch(new URL('https://localhost:3000/index.html'))`,
					)
					win.eval(
						`fetch(new URL('https://localhost:3000/index.html'), {method: 'POST'})`,
					)
					win.eval(`fetch('https://localhost:3000/index.html')`)
					win.eval(
						`fetch('https://localhost:3000/index.html', {method: 'POST'})`,
					)
					win.eval(`H.track('MyTrackEvent', {'foo': 'bar'})`)
				})

			cy.wait('@PushPayloadCompressed')
				.its('request.body.variables')
				.then(({ data }) => {
					const { resources, events } = decompressPushPayload(data)
					if (!resources) {
						throw new Error('no resources')
					}
					if (!events) {
						throw new Error('no events')
					}
					const customEvent = events.events.find((e) => e.type === 5)
					if (!customEvent) {
						throw new Error(
							'no customEvent: ' + JSON.stringify(events),
						)
					}
					const payload = JSON.parse(customEvent.data.payload)
					if (
						customEvent.data.tag !== 'Track' ||
						payload.foo !== 'bar' ||
						payload.event !== 'MyTrackEvent'
					) {
						throw new Error(
							'invalid customEvent: ' +
								JSON.stringify(customEvent),
						)
					}
				})
		})
	})
})
