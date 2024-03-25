import { findMatchingAttributes } from './utils'

describe('findMatchingLogAttributes', () => {
	const logAttributes = {
		'highlight-doppler-config': 'docker',
		'highlight-is-onprem': '',
		'highlight-mem-total': '68719476736',
		'highlight-mem-used-percent': '64.78147506713867',
		'highlight-num-cpu': '10',
		'highlight-phone-home-deployment-id':
			'K9Gq5Ne3qCYGl7b1YxNXS15dy953UuuT',
		'highlight-version': '',
		host: {
			name: 'Chriss-MBP-2',
		},
		os: {
			description:
				'macOS 13.1 (22C65) (Darwin Chriss-MBP-2 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
			type: 'darwin',
		},
		process: {
			executable: {
				name: 'main',
				path: '/Users/chris/code/highlight/backend/tmp/main',
			},
			owner: 'chris',
			pid: '45338',
			runtime: {
				description: 'go version go1.20.4 darwin/arm64',
				name: 'go',
				version: 'go1.20.4',
			},
		},
		level: 'trace',
		message: 'highlight-heartbeat',
		secure_session_id: '',
		service_name: 'all',
		service_version: '',
		source: 'backend',
		span_id: 'ec174c313a67d3f5',
		trace_id: '',
	}

	it('returns an empty object if there are no query terms', () => {
		const queryParts = [
			{
				key: 'os.type',
				value: 'darwin',
				operator: '=',
				text: 'os.type:darwin',
				start: 0,
				stop: 11,
			},
			{
				key: 'level',
				value: 'trace',
				operator: '=',
				text: 'level:trace',
				start: 15,
				stop: 24,
			},
			{
				key: 'message',
				value: '*light',
				operator: '=',
				text: 'message:*light',
				start: 27,
				stop: 39,
			},
		]
		const matchingAttributes = findMatchingAttributes(
			queryParts,
			logAttributes,
		)

		expect(matchingAttributes['os.type']).toEqual({
			match: 'darwin',
			value: 'darwin',
		})
		expect(matchingAttributes['level']).toEqual({
			match: 'trace',
			value: 'trace',
		})
		expect(matchingAttributes['message']).toEqual({
			match: '*light',
			value: 'highlight-heartbeat',
		})
	})

	it('returns an empty object if there are no log attributes', () => {
		const matchingAttributes = findMatchingAttributes([], logAttributes)
		expect(matchingAttributes).toEqual({})
	})
})
