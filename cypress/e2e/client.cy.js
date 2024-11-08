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
			cy.wait('@initializeSession', { timeout: 90 * 1000 })

			cy.wait('@PushPayloadCompressed')
				.its('request.body.variables')
				.should('have.property', 'data')
				.then(async (data) => {
					const { resources } = decompressPushPayload(data)
					const parsedResources = JSON.parse(resources).resources
					const firstResourceKeys = Object.keys(
						parsedResources[0],
					).sort()

					expect(firstResourceKeys).to.eql([
						'connectEndAbs',
						'connectStartAbs',
						'decodedBodySize',
						'domainLookupEndAbs',
						'domainLookupStartAbs',
						'encodedBodySize',
						'fetchStartAbs',
						'initiatorType',
						'name',
						'nextHopProtocol',
						'redirectEndAbs',
						'redirectStartAbs',
						'requestStartAbs',
						'responseEndAbs',
						'responseStartAbs',
						'secureConnectionStartAbs',
						'startTimeAbs',
						'transferSize',
						'workerStartAbs',
					])

					const baseUrl = Cypress.config('baseUrl')
					win.eval(`fetch(new URL('${baseUrl}/index.html'))`)
					win.eval(
						`fetch(new URL('${baseUrl}/index.html'), {method: 'POST'})`,
					)
					win.eval(`fetch('${baseUrl}/index.html')`)
					win.eval(`fetch('${baseUrl}/index.html', {method: 'POST'})`)
					win.eval(`H.track('MyTrackEvent', {'foo': 'bar'})`)

					const result = await win.eval(`H.getSessionURL()`)
					console.log('getSessionURL', result)

					const prefix = result.substring(
						0,
						result.lastIndexOf('/') + 1,
					)
					const session = result.substring(
						result.lastIndexOf('/') + 1,
						result.length,
					)

					expect(prefix).to.eq('https://app.highlight.io/1/sessions/')
					expect(session).to.not.eq(
						'https://app.highlight.io/1/sessions/',
					)
					expect(session.length).to.eq(28)

					const { url, urlWithTimestamp } = await win.eval(
						`H.getSessionDetails()`,
					)
					const ts = Number(urlWithTimestamp.split('ts=').pop())
					console.log('getSessionDetails ts', ts)
					expect(url).to.eq(result)
					expect(ts).to.greaterThan(0)
					expect(ts).to.lessThan(5)
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
