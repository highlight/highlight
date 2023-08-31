import { Highlight } from './client.js'

describe('client', () => {
	it('returns session id and request id from the headers', () => {
		const client = new Highlight({
			projectID: 'abc123',
		})

		const sdk = client.otel
		const resource = sdk['_resource']

		expect(resource.attributes['process.runtime.name']).toEqual('nodejs')
		expect(resource.attributes['process.runtime.description']).toEqual(
			'Node.js',
		)
	})
})
