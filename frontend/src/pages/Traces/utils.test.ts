import { Trace } from '@/graph/generated/schemas'

import { getTraceDuration } from './utils'

describe('getTraceDuration', () => {
	it('should return the duration between the start and end times', () => {
		const totalDuration = getTraceDuration(trace)
		expect(totalDuration).toEqual(2018840)
	})
})

const trace = [
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '2861d2f0cda633bc',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 386958,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.unmarshal.web_socket_events',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '9fbb7bb5bef2b417',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 17416,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.unmarshal.messages',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '7255eec66d1b65a3',
		parentSpanID: '69f18c2988fdcc4e',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 530125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.parseEvents.remarshalEvents',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '7888f44a27357f54',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'worker.kafka.commitMessage',
		spanKind: 'Internal',
		duration: 8416,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
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
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '00d81759ff2c33c8',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.SaveSessionData',
		spanKind: 'Internal',
		duration: 368416,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			payload_type: 'raw-web-socket-events',
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.parseEvents.processWithRedis',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: 'e38c83af66a9c36a',
		parentSpanID: '6fcc8f1cd16cf204',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 643667,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'opensearch.update',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '69f18c2988fdcc4e',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 19432209,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.parseEvents',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '4684f3d82bf8fd56',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 720834,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			messagesLength: '15',
			numberOfErrors: '0',
			numberOfEvents: '210',
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'db.querySession',
			resourcesLength: '16',
			secure_id: 'lZLyhEnKuKXgopKCWKPSEuf4tQpH',
			sessionSecureID: 'lZLyhEnKuKXgopKCWKPSEuf4tQpH',
			webSocketEventsLength: '22',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '8588c46ef7adc26f',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 190125,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'db.errors',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '5dda1a9e2e231c5e',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.SaveSessionData',
		spanKind: 'Internal',
		duration: 407291,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			payload_type: 'raw-resources',
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.parseEvents.processWithRedis',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '6fcc8f1cd16cf204',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 1501083,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'doSessionFieldsUpdate',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '74847796d6a4959e',
		parentSpanID: '69f18c2988fdcc4e',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.SaveSessionData',
		spanKind: 'Internal',
		duration: 456250,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			payload_type: 'raw-events',
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.parseEvents.processWithRedis',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: 'e4c861afaf359b88',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'worker.kafka.processMessage',
		spanKind: 'Internal',
		duration: 22103208,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
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
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '882b8996e2aeb2f4',
		parentSpanID: '69f18c2988fdcc4e',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.AddTrackProperties',
		spanKind: 'Internal',
		duration: 9625,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'go.sessions.AddTrackProperties',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: 'f87b98f708153f1f',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 426875,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			project_id: '1',
			resource_name: 'go.unmarshal.resources',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:21Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '987c92a8313182a6',
		parentSpanID: '8588c46ef7adc26f',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'public-graph.pushPayload',
		spanKind: 'Internal',
		duration: 1333,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'influx.errors',
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:19Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '7a4595d0efc397a1',
		parentSpanID: '',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'processPublicWorkerMessage',
		spanKind: 'Internal',
		duration: 2018840417,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			partition: '4',
			partitionKey: 'lZLyhEnKuKXgopKCWKPSEuf4tQpH',
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
				runtime: {
					description: 'go version go1.20.4 darwin/arm64',
					name: 'go',
					version: 'go1.20.4',
				},
			},
			resource_name: 'worker.kafka.process',
			taskFailures: '0',
			taskType: '0',
			worker: {
				goroutine: '63',
			},
		},
		statusCode: 'Unset',
		statusMessage: '',
		__typename: 'Trace',
	},
	{
		timestamp: '2023-09-25T18:27:19Z',
		traceID: '0ef8e686eeebaa7dfc41824560ab756e',
		spanID: '6097baf40c03c4c6',
		parentSpanID: '7a4595d0efc397a1',
		projectID: 1,
		secureSessionID: '',
		traceState: '',
		spanName: 'worker.kafka.receiveMessage',
		spanKind: 'Internal',
		duration: 1996705417,
		serviceName: 'all',
		serviceVersion: 'asdf',
		traceAttributes: {
			host: {
				name: 'Chriss-MacBook-Pro-2.local',
			},
			os: {
				description:
					'macOS 13.1 (22C65) (Darwin Chriss-MacBook-Pro-2.local 22.2.0 Darwin Kernel Version 22.2.0: Fri Nov 11 02:03:51 PST 2022; root:xnu-8792.61.2~4/RELEASE_ARM64_T6000 arm64)',
				type: 'darwin',
			},
			process: {
				executable: {
					name: 'main',
					path: '/Users/chris/code/highlight/backend/tmp/main',
				},
				owner: 'chris',
				pid: '68760',
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
] as Trace[]
