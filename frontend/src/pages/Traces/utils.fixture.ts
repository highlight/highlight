import { Trace } from '@/graph/generated/schemas'

export const trace = [
	{
		timestamp: '2023-09-26T21:13:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '80cc00298c9e0d33',
		parentSpanID: '921caa04f7b57dd3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '7901e42470a66c0a',
		parentSpanID: '6959efa205b966e8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9615069bb1c35cae',
		parentSpanID: 'bdeb85d833624c77',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2167,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '35fa757655640d46',
		parentSpanID: 'cecafbdf4aafcd0c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '80480853e5b3edff',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 8250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '64623a16f164133b',
		parentSpanID: 'd8bc941095092be6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 17417,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'created_at',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8dd498d143b94c77',
		parentSpanID: '00f13c360676dee5',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '921caa04f7b57dd3',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 32334,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c1f8aec652893112',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 7792,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e08fb6fd1796fc90',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 8041,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd593908bf204bc75',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_frequency',
		spanKind: 'Internal',
		duration: 8125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_frequency',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '278600d5c2defd97',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 20125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1f8f3411f8dc5b86',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 13875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8cf716d5801bcfe8',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 8458,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6610a3816e9dc512',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 7625,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'aa248b6a9d194df8',
		parentSpanID: '93fb237c54f332c3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 7500,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9f7c51731268f227',
		parentSpanID: 'eaa661d836d8adb3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a269fcdedf7f00f0',
		parentSpanID: 'e2d70cd4225d7ce4',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 7541,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '56553ae9a0108717',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 8625,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '82b5236a5650aaca',
		parentSpanID: 'af3eb0e24b7f3682',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f625ea2063b04b51',
		parentSpanID: '863531dfc6672df7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '282e99d478833609',
		parentSpanID: '97d441f604b24a7e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2458,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0e097eb84cacecae',
		parentSpanID: 'a3dddce930b408b1',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 5583,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ba0280e40f0ed933',
		parentSpanID: 'a22f928cf9b9fe42',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2333,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '3a47ff4d8633028d',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 22291,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6959efa205b966e8',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 8583,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '7b168659eed2eae9',
		parentSpanID: '',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.operation.GetErrorGroup',
		spanKind: 'Internal',
		duration: 594375375,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				operation: {
					name: 'GetErrorGroup',
					variables:
						'{\n"secure_id": "zGl4V2hrmLP7QUrKm7NC91UDZYTf"\n}',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd25e28730d3930b9',
		parentSpanID: '142943fc3c624318',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 12167,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '698ab3b8b8ec1a6f',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 8791,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8675607e467fdaa3',
		parentSpanID: '3f2d6ce86e3349c8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b8ca726462a178db',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.serviceName',
		spanKind: 'Internal',
		duration: 13792,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'serviceName',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8730eded1d058db9',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 19750,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '797937d6d036d095',
		parentSpanID: '347877408babf5d8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '48ba576caa3b0597',
		parentSpanID: 'a93ebb1c1aada7da',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e169bf1eadcdd4ec',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.state',
		spanKind: 'Internal',
		duration: 8334,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'state',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '00f13c360676dee5',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 7542,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '555a6dc5e0c81073',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.mapped_stack_trace',
		spanKind: 'Internal',
		duration: 8625,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'mapped_stack_trace',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0b8fa14a22c47fe6',
		parentSpanID: 'c74dffd4314184e6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '47825940dc8560a8',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 22791,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '23262e75058a91bf',
		parentSpanID: '0b0705f95840474f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '52f14d78c86c45f8',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 380708,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '10f9060f35fe4c8d',
		parentSpanID: '2795d0a038c4912d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2167,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd6d59af95c97bdc4',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 16167,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd7c856276a304c1c',
		parentSpanID: '58bacfe0ea02bd16',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4791,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '23c50c143a58b1d9',
		parentSpanID: 'f668dbe6a3c6919b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '511553a410c9add9',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.type',
		spanKind: 'Internal',
		duration: 8000,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'type',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ffc5273d5abb7bc5',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 8458,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '605779763399f7b1',
		parentSpanID: '41c166725656864b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 6209500,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '25d10d64850e2313',
		parentSpanID: 'af3302ae6a8ba3f8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '5298d5436738f25b',
		parentSpanID: '52b623d349fe71dd',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '509d2e1c8d83967b',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.project_id',
		spanKind: 'Internal',
		duration: 10459,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'project_id',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9dd6a0be9f6dc98a',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 20292,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1a8283e36fd260c8',
		parentSpanID: '295f77e181d1fb78',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a5d6c3f332394171',
		parentSpanID: '7fc0746ab88c6c00',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2833,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a57d73d5e6ecef7e',
		parentSpanID: '019794e2f2994ea6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '25b70f69af113c2b',
		parentSpanID: '698623a0caf6611d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e90457253a1638a4',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 10042,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'dfd08cba797c4290',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 12000,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '131e3b77e0d15d32',
		parentSpanID: 'f5d2d1fbad791e9f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 8083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e9a09cff70fb7668',
		parentSpanID: '789844a72378aee1',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3666,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '789844a72378aee1',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 10375,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '271fe62ca96168f1',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 7750,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '373ba92eaf263afa',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 8125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '93fb237c54f332c3',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 3174125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c5c886dfd070c09c',
		parentSpanID: '9dd6a0be9f6dc98a',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c2fa9eec5359950e',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 12875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '56215f56be18dc6c',
		parentSpanID: '7b168659eed2eae9',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.operation',
		spanKind: 'Internal',
		duration: 594308500,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			backend: 'private-graph',
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'GetErrorGroup',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'fbd151bd5ed78796',
		parentSpanID: 'cca5204cd920983e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3666,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Boolean!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'is_public',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '90783e6a411672d3',
		parentSpanID: '00fa90c5936ad2b9',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6f18007b5744006b',
		parentSpanID: '42b4064b1f1e65dd',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2417,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9ed378f13bd47577',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 10875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '03ca76fc4583b985',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 8791,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ffaefa764f57550b',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.updated_at',
		spanKind: 'Internal',
		duration: 11334,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'updated_at',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a2ee2933cf7f1580',
		parentSpanID: '44139133bf02f286',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3792,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '37254391d1162486',
		parentSpanID: 'e1ad783e46531d45',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2291,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ceeefde5b6359afd',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_metrics',
		spanKind: 'Internal',
		duration: 8666,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_metrics',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9d9b538bd098e90f',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 7541,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '019794e2f2994ea6',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 9750,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ecefecfc27643c2c',
		parentSpanID: '09787223dbdaf81e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c0675f3dd8df8baf',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 19208,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '3ce9ff3d76cc4569',
		parentSpanID: 'e3ab4bed731a0a4b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2041,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '93ce3d74f03d1a03',
		parentSpanID: '373ba92eaf263afa',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '96cbba9907c32352',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fields',
		spanKind: 'Internal',
		duration: 8250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fields',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '62eb02d77d90fa6d',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.secure_id',
		spanKind: 'Internal',
		duration: 12416,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'secure_id',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '09787223dbdaf81e',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 9416,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '41c166725656864b',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 6230042,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f6dad27e5a532c3e',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 8584,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e975223bbc065b4d',
		parentSpanID: '1b7224461671094c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 16750,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '283d26de8db4244f',
		parentSpanID: 'c0675f3dd8df8baf',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2416,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '88190081545e46e3',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 20542,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '7acc4af780667e3f',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.first_occurrence',
		spanKind: 'Internal',
		duration: 8334,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'first_occurrence',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '7c084b17bd37af5f',
		parentSpanID: 'c4c387038e7de24d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '46d5ef135bdb45f4',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 10417,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '863531dfc6672df7',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 10333,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '3f2d6ce86e3349c8',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 8584,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '02817672256cf5bd',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 8334,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '80d60011e916e610',
		parentSpanID: 'cc7aa712480f1f24',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2209,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '5b8469d195e63368',
		parentSpanID: '772f81c76d23c02a',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a2e822bb674c8aa5',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 13417,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '48728b5ff338b90d',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 4963541,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '78b1895bc3a468a8',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'resolver.internal.auth',
		spanKind: 'Internal',
		duration: 28422375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'isAdminInProjectOrDemoProject',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8c3ee1d81cb15fb8',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 9292,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd1c6e89f830b2508',
		parentSpanID: 'aba96332c8085764',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bead20ccae36b33a',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.structured_stack_trace',
		spanKind: 'Internal',
		duration: 173500,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'structured_stack_trace',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '3727aa5e44d6eb0a',
		parentSpanID: 'c0b244c597c6e461',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 11833,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cecafbdf4aafcd0c',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 8417,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0a339681c6e4d0e7',
		parentSpanID: '415a41f604c7c97a',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '415a41f604c7c97a',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 10250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '98ae48feb8b0321e',
		parentSpanID: 'd72caaa3754768ef',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2084,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c2d75a1e1727371f',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 7834,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '08eb14a6f1c04303',
		parentSpanID: '2c846ce02226f0d4',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4583,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f83fb35de462585b',
		parentSpanID: '278600d5c2defd97',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd45020128b4c4d97',
		parentSpanID: '7e9303728789270f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '854795f09a44d71f',
		parentSpanID: '509d2e1c8d83967b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4708,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'project_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '4415b4e75b6aeccb',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 11000,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '733e5af69c9ae8b3',
		parentSpanID: 'c2fa9eec5359950e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2583,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f7a9967e0d29ffff',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 5491708,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '38e9117c5d387b86',
		parentSpanID: 'f6dad27e5a532c3e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2666,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '44111867ed16aabb',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 9375,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '52b623d349fe71dd',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 11042,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '89fa5400ef73c429',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 7917,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c9e331625e07701a',
		parentSpanID: 'c2d75a1e1727371f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '39c8a295223c7bad',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 23875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '82d642d2812f027f',
		parentSpanID: '96cbba9907c32352',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2709,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: '[ErrorField]',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fields',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '212c121e4d59b83b',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 13958,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cf150c81a6445972',
		parentSpanID: '9ed378f13bd47577',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd4fb150dfaf9f55e',
		parentSpanID: '9183a8f13a5d7d5e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 6334,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cca5204cd920983e',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.is_public',
		spanKind: 'Internal',
		duration: 13791,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'is_public',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '552e3caa9de66070',
		parentSpanID: '46d5ef135bdb45f4',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ab0ff806ff74e760',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 24500,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9183a8f13a5d7d5e',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 12208,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c8d7a0571fc284c3',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 22083,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '3e09c3c8f15972d3',
		parentSpanID: 'ceeefde5b6359afd',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: '[ErrorDistributionItem!]!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_metrics',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0f532cbcba3153c9',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 15375,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '493cc3489c8e0b1e',
		parentSpanID: '7acc4af780667e3f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'first_occurrence',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '519367bc6ea90067',
		parentSpanID: '10ab33805bc80407',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2583,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '44139133bf02f286',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 29416,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'aba96332c8085764',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 8333,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8f649282aa319232',
		parentSpanID: 'c95444fb94ed33e7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4500,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6da7490604cd73c8',
		parentSpanID: '1f8f3411f8dc5b86',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 5083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '44994735ae840832',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 8792,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '92b120663514059b',
		parentSpanID: '0f5ca7e9e683dd48',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2584,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd8bc941095092be6',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.created_at',
		spanKind: 'Internal',
		duration: 54833,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'created_at',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9dccf2f6ef85a457',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 9709,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '509b5b7fba5516e4',
		parentSpanID: '80480853e5b3edff',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a6aec16557e353c2',
		parentSpanID: 'ffaefa764f57550b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'updated_at',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e1ad783e46531d45',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 8708,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '48eebe99906e0a38',
		parentSpanID: 'd2ae4f66c4baa0a9',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2458,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f668dbe6a3c6919b',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 9875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c7f08cc80213e98f',
		parentSpanID: '48728b5ff338b90d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4500,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '72e99ccab6acc3f1',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 16667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '698623a0caf6611d',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 8042,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '5b5dd8d5cd612d6d',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 7625,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cff12cb5789d4276',
		parentSpanID: '89fa5400ef73c429',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'eaa661d836d8adb3',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 8667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '97d441f604b24a7e',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 8833,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '001e55d313201d93',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 11000,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2ba81ec8b9ff5734',
		parentSpanID: '15e18b52534dc31f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a125c5eb29408dc7',
		parentSpanID: '486f241948f251ea',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e2d70cd4225d7ce4',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 28042,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '7f5ee5708a777baa',
		parentSpanID: 'd593908bf204bc75',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: '[Int64!]!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_frequency',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '242083b53ba94d08',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 9000,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b4c201ae60d16521',
		parentSpanID: '72e99ccab6acc3f1',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 10792,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a42e38499df5919c',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 8167,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6be8a91d59050ed4',
		parentSpanID: '88190081545e46e3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 11208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c95444fb94ed33e7',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 13500,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '3f1fee2901adea2b',
		parentSpanID: '56215f56be18dc6c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group',
		spanKind: 'Internal',
		duration: 563377542,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments:
						'{\n"secure_id": "zGl4V2hrmLP7QUrKm7NC91UDZYTf",\n"use_clickhouse": null\n}',
					name: 'error_group',
				},
				object: {
					type: 'Query',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8b24423fdbede124',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'highlight-ctx',
		spanKind: 'Internal',
		duration: 33042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '06d454bfee0f9ba3',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 7917,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0b0705f95840474f',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 12209,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd80b7ac46a19dace',
		parentSpanID: 'f88873e8fd882acf',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2084,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c4b38aa11d554a5d',
		parentSpanID: '47825940dc8560a8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 6625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '48b506c1767b2197',
		parentSpanID: '45588ca468c7583b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2041,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9fdc41a74d82609a',
		parentSpanID: '56553ae9a0108717',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8a8da9ae96e0b3b7',
		parentSpanID: '001e55d313201d93',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4834,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '163216c92c568813',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 16125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c4c387038e7de24d',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 7625,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'af3302ae6a8ba3f8',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 13417,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '132533ce483a83b7',
		parentSpanID: 'bead20ccae36b33a',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 159042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: '[ErrorTrace]!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'structured_stack_trace',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0919c3a2141cb689',
		parentSpanID: '73b1da9ec55a2f80',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 6459,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f88873e8fd882acf',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 7583,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '486f241948f251ea',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 7791,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9093b1e8d4b935ce',
		parentSpanID: '8dfa46b21864f9c1',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3291,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'last_occurrence',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bf0968889119beae',
		parentSpanID: '511553a410c9add9',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'type',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'fa98fac43b97190e',
		parentSpanID: '44111867ed16aabb',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2834,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '77d0b2a2f8b5f74e',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 20750,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a37620d3adfea8a5',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 7875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd256e8e0a2c27659',
		parentSpanID: '03ca76fc4583b985',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0c1d31ab89651851',
		parentSpanID: '45fe76de534b3b4e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 5166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8dfa46b21864f9c1',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.last_occurrence',
		spanKind: 'Internal',
		duration: 9458,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'last_occurrence',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd72caaa3754768ef',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 7917,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bd4dbe99ff48031c',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 9708,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '21c6934e03a66295',
		parentSpanID: '9d9b538bd098e90f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9f85e7b54ec48ce8',
		parentSpanID: '698ab3b8b8ec1a6f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2833,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '142943fc3c624318',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 32125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '45fe76de534b3b4e',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 11125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '772f81c76d23c02a',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 9334,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '00fa90c5936ad2b9',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 14250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9b2de433946e810a',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 7625,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '10ab33805bc80407',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 12833,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '135edeaa46ceb87b',
		parentSpanID: '4415b4e75b6aeccb',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4709,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2c846ce02226f0d4',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 13875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b773fbab33ddd049',
		parentSpanID: 'a2e822bb674c8aa5',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a4fc9c9caa00a96c',
		parentSpanID: 'b649eecbc6fc75a2',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2334,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '196a15759c594e46',
		parentSpanID: '89220b74a8e87c43',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c773b5815189b0e3',
		parentSpanID: 'b0feb9cac6143db5',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3333,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e45c9a7cbd8d989d',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 8750,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '4230d865035f20f4',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 9583,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '97eb82c88f53a899',
		parentSpanID: '163216c92c568813',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2834,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1ce24d27033c6e12',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 9250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0a25b91687209372',
		parentSpanID: 'a42e38499df5919c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2417,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '62bbf8de1efb7072',
		parentSpanID: '8730eded1d058db9',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '74a02dccc0175d1b',
		parentSpanID: '32a1062dfff18ce3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2417,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '370fb406d4d760d6',
		parentSpanID: '3f1fee2901adea2b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 563348250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments:
					'{\n"secure_id": "zGl4V2hrmLP7QUrKm7NC91UDZYTf",\n"use_clickhouse": null\n}',
				type: 'ErrorGroup',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '37184b87f269a5e3',
		parentSpanID: '2707ba8dd0334552',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 9459,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: '[String]!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'event',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '99343da5a4ce8382',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 11083,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c43aa51570575892',
		parentSpanID: '9dccf2f6ef85a457',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '73b1da9ec55a2f80',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 13083,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '295f77e181d1fb78',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 14667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b30a621c4f6145d2',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 9584,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'fd2bc51be81bb49b',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 21292,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6e6ef294f24467a4',
		parentSpanID: '3a47ff4d8633028d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 6584,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '5df699930d7f39ff',
		parentSpanID: '8ac6fc64c806bb87',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2795d0a038c4912d',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 7833,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0bb9a5fd4dc1202c',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 10375,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '32a1062dfff18ce3',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 12542,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8ab6da3050f47c24',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 31459,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cbc966e7f2203c23',
		parentSpanID: 'e90457253a1638a4',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3458,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'af3eb0e24b7f3682',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 7833,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cc5bfb7332cab38e',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 7417,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c4f058e3fc40dcec',
		parentSpanID: 'd6d59af95c97bdc4',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '347877408babf5d8',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 7667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'be14c485cd773f44',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'resolver.internal.auth',
		spanKind: 'Internal',
		duration: 37903125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'canAdminViewErrorGroup',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f5d2d1fbad791e9f',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 46000,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0f5ca7e9e683dd48',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 19042,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '45588ca468c7583b',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 7583,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '997f5c382a890089',
		parentSpanID: '1ce24d27033c6e12',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'fffd6ea25b504687',
		parentSpanID: 'bfe21f1994c21f38',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c807a8503f205e9d',
		parentSpanID: 'cc5bfb7332cab38e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '42b4064b1f1e65dd',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 8375,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8a3573bdf16b7870',
		parentSpanID: '4876784c0b6b874c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 8209,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b0feb9cac6143db5',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 9250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '3f48964f186c679f',
		parentSpanID: 'c1f8aec652893112',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '43027a3f71b2709b',
		parentSpanID: 'e169bf1eadcdd4ec',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2541,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ErrorState!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'state',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '5a4c55a0f53298ce',
		parentSpanID: '6bd64db371e61b29',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '081d92a7c200e45d',
		parentSpanID: '212c121e4d59b83b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8ac6fc64c806bb87',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 7667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '0a596f6967766c74',
		parentSpanID: '2cf6cd1e4800ea5f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2709,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd16baaa7ebf9eb85',
		parentSpanID: '6610a3816e9dc512',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '649dadae173abf6c',
		parentSpanID: '5b5dd8d5cd612d6d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cd58f29484d02d59',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'resolver.internal.auth',
		spanKind: 'Internal',
		duration: 20932042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			ProjectID: '1',
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'isAdminInProject',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'eaa5a96738c3b419',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 8208,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a3dddce930b408b1',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 15250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6fe9fb64333cbe9d',
		parentSpanID: '99343da5a4ce8382',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '7e9303728789270f',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 7667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '7fc0746ab88c6c00',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error',
		spanKind: 'Internal',
		duration: 9166,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6bd64db371e61b29',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 9292,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a22f928cf9b9fe42',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 8542,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '139f5c7a070ca67d',
		parentSpanID: '5471da258d859149',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a93ebb1c1aada7da',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.fileName',
		spanKind: 'Internal',
		duration: 11625,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'fileName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c0b244c597c6e461',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 29167,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '54e6e22e44487cde',
		parentSpanID: 'eaa5a96738c3b419',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2709,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '742d6ac456a8db52',
		parentSpanID: 'b8ca726462a178db',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'serviceName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '04ab5c95b29f681e',
		parentSpanID: '06d454bfee0f9ba3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bcfdb5ef9a865b0b',
		parentSpanID: 'a37620d3adfea8a5',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2167,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '32bcd686ea24ff10',
		parentSpanID: 'c8d7a0571fc284c3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 4916,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '669dce5b014f1877',
		parentSpanID: '8cf716d5801bcfe8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1d40c5de15b602b7',
		parentSpanID: '0f532cbcba3153c9',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3334,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2bd226007db6cc2e',
		parentSpanID: '8c3ee1d81cb15fb8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2541,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e3ab4bed731a0a4b',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 7708,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2cf6cd1e4800ea5f',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 8083,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a977d7454fa06b42',
		parentSpanID: '52f14d78c86c45f8',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 243833,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'f24286d628be5d2e',
		parentSpanID: 'b30a621c4f6145d2',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2416,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesAfter',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'c74dffd4314184e6',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 12584,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2707ba8dd0334552',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.event',
		spanKind: 'Internal',
		duration: 15000,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'event',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bbbb3127997208ea',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 10042,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '58bacfe0ea02bd16',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 15208,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bb373bab47894c7c',
		parentSpanID: '4230d865035f20f4',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b30c4a455ce0598d',
		parentSpanID: 'f7a9967e0d29ffff',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 19542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'functionName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '4e92b4be5ce999ea',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 11125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ad880522db465513',
		parentSpanID: 'dfd08cba797c4290',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2291,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2c46c1f645f07c2e',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.stack_trace',
		spanKind: 'Internal',
		duration: 8667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'stack_trace',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'ff82b997652f53f8',
		parentSpanID: '77d0b2a2f8b5f74e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 14667,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '30b110172d0573ec',
		parentSpanID: 'e5531cae0dd1e51c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3333,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'beaf6c65ff857c0e',
		parentSpanID: '06ab746b5c094804',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2542,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '618204fb163af379',
		parentSpanID: 'ffc5273d5abb7bc5',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2334,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd43ed62fdc3f22c2',
		parentSpanID: '02817672256cf5bd',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '4e1fd857bb0de6cc',
		parentSpanID: 'bd4dbe99ff48031c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2750,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b649eecbc6fc75a2',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.name',
		spanKind: 'Internal',
		duration: 8833,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'name',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '32b695d1defe107f',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.snoozed_until',
		spanKind: 'Internal',
		duration: 7958,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'snoozed_until',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1e5a81fc7cca7cf2',
		parentSpanID: '271fe62ca96168f1',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2166,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '267be1af07d19725',
		parentSpanID: '11c086e29ca29918',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'a064cd72bd0861f3',
		parentSpanID: '2c46c1f645f07c2e',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'stack_trace',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'b6d2d09d22d752d0',
		parentSpanID: 'bbbb3127997208ea',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '2536d420f80f0b48',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 15459,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1887d78f398b9762',
		parentSpanID: '62eb02d77d90fa6d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'secure_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '41f6abfe10f30ffe',
		parentSpanID: '32b695d1defe107f',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'snoozed_until',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '89220b74a8e87c43',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesAfter',
		spanKind: 'Internal',
		duration: 8500,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesAfter',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '8aca49d2dfac9d95',
		parentSpanID: '4e92b4be5ce999ea',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 5417,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineContent',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '264f25756909c083',
		parentSpanID: 'e08fb6fd1796fc90',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2292,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bfe21f1994c21f38',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 35583,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '06ab746b5c094804',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 9167,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '42a2e0401a5826ef',
		parentSpanID: 'ab0ff806ff74e760',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 11375,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'fileName',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '4dd1997d38f78b40',
		parentSpanID: 'fd2bc51be81bb49b',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 3041,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '836c61900e66541b',
		parentSpanID: '8ab6da3050f47c24',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 10875,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cc7aa712480f1f24',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 13250,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1d99e5a24f67cda3',
		parentSpanID: 'e45c9a7cbd8d989d',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int64!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'value',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '4876784c0b6b874c',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.functionName',
		spanKind: 'Internal',
		duration: 24875,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'functionName',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'bdeb85d833624c77',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.value',
		spanKind: 'Internal',
		duration: 9125,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'value',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'e5531cae0dd1e51c',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineNumber',
		spanKind: 'Internal',
		duration: 10916,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd6e7f12bebfafca6',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.columnNumber',
		spanKind: 'Internal',
		duration: 8459,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'columnNumber',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'caac8dfc62c6d2a1',
		parentSpanID: '6054f5cc527fd78a',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2084,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '11c086e29ca29918',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.linesBefore',
		spanKind: 'Internal',
		duration: 8667,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'linesBefore',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '5471da258d859149',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.error_group_id',
		spanKind: 'Internal',
		duration: 12417,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'error_group_id',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '9b5016bc3008dd38',
		parentSpanID: '0bb9a5fd4dc1202c',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2583,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Timestamp!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'date',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '39b16960a38b4956',
		parentSpanID: '242083b53ba94d08',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2167,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'name',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '59761de145003549',
		parentSpanID: '44994735ae840832',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2958,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '4dd95a4869401688',
		parentSpanID: 'd6e7f12bebfafca6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'columnNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'd2ae4f66c4baa0a9',
		parentSpanID: '370fb406d4d760d6',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.id',
		spanKind: 'Internal',
		duration: 9084,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'id',
				},
				object: {
					type: 'ErrorGroup',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '50b11732b2a470a1',
		parentSpanID: '9b2de433946e810a',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2042,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'Int',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'lineNumber',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6054f5cc527fd78a',
		parentSpanID: '3e09c3c8f15972d3',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.date',
		spanKind: 'Internal',
		duration: 10417,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'date',
				},
				object: {
					type: 'ErrorDistributionItem',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '15e18b52534dc31f',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 9792,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '1b7224461671094c',
		parentSpanID: '132533ce483a83b7',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'graphql.field.lineContent',
		spanKind: 'Internal',
		duration: 33500,
		serviceName: 'private-graph',
		serviceVersion: 'asdf',
		traceAttributes: {
			graphql: {
				field: {
					arguments: 'null',
					name: 'lineContent',
				},
				object: {
					type: 'ErrorTrace',
				},
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '6ba6d8364c643d6e',
		parentSpanID: '555a6dc5e0c81073',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 2625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'mapped_stack_trace',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: 'cc49fc233683edb4',
		parentSpanID: '2536d420f80f0b48',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 6334,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'ID!',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'error_group_id',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-26T21:12:12Z',
		traceID: 'd0c52e66e8f61433de418f5183eabba0',
		spanID: '678f9cb61f398912',
		parentSpanID: '39c8a295223c7bad',
		projectID: 1,
		secureSessionID: 'L9dsIfEsWlGDaez83rTTnd2uB4Ja',
		traceState: '',
		spanName: 'operation.field',
		spanKind: 'Internal',
		duration: 6875,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			field: {
				arguments: 'null',
				type: 'String',
			},
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
				pid: '64378',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'linesBefore',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
] as Trace[]
