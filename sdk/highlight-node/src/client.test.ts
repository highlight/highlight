import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { Highlight } from './client.js'

describe('client', () => {
	it('returns session id and request id from the headers', () => {
		const client = new Highlight({
			projectID: 'abc123',
		})

		const sdk = client.otel
		const resource = sdk['_resource']

		expect(
			resource.attributes[
				SemanticResourceAttributes.PROCESS_RUNTIME_NAME
			],
		).toEqual('nodejs')
		expect(
			resource.attributes[
				SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION
			],
		).toEqual('Node.js')
		expect(
			resource.attributes[
				SemanticResourceAttributes.PROCESS_RUNTIME_VERSION
			],
		).toBeDefined()
	})
})
