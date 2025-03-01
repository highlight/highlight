import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { withHighlight } from './lambda-utils'
import { createApiResponse } from './lambda-utils'
import {
	recordMetric,
	recordHistogram,
	recordCount,
	incrementCounter,
	log,
} from './highlight-client'

/**
 * Lambda handler that demonstrates various metric recording capabilities
 * from the Highlight SDK
 */
export const handler = withHighlight<
	APIGatewayProxyEvent,
	APIGatewayProxyResult
>(async (event, context, highlight) => {
	const { queryStringParameters } = event
	const metricType = queryStringParameters?.type || 'all'

	// Extract request details for tracing context
	const { secureSessionId, requestId } = event.requestContext
		? {
				secureSessionId: event.headers?.['x-session-id'],
				requestId: event.requestContext.requestId,
			}
		: {}

	// Log metrics demonstration request
	log(
		`Metrics demonstration request for type: ${metricType}`,
		'info',
		{ metricType },
		secureSessionId,
		requestId,
	)

	// Track the metrics that were generated
	const generatedMetrics: string[] = []

	try {
		switch (metricType) {
			case 'gauge':
				// Demonstrate gauge metrics
				await demoGaugeMetrics()
				generatedMetrics.push(
					...[
						'system_memory_usage',
						'system_cpu_usage',
						'app_connection_pool_size',
					],
				)
				break

			case 'counter':
				// Demonstrate counter metrics
				await demoCounterMetrics()
				generatedMetrics.push(
					...[
						'api_requests_total',
						'db_operations_total',
						'cache_hits',
						'cache_misses',
					],
				)
				break

			case 'histogram':
				// Demonstrate histogram metrics
				await demoHistogramMetrics()
				generatedMetrics.push(
					...[
						'api_response_time_ms',
						'db_query_duration_ms',
						'task_processing_time_ms',
					],
				)
				break

			case 'all':
			default:
				// Demonstrate all metric types
				await demoGaugeMetrics()
				await demoCounterMetrics()
				await demoHistogramMetrics()
				generatedMetrics.push(
					...[
						'system_memory_usage',
						'system_cpu_usage',
						'app_connection_pool_size',
						'api_requests_total',
						'db_operations_total',
						'cache_hits',
						'cache_misses',
						'api_response_time_ms',
						'db_query_duration_ms',
						'task_processing_time_ms',
					],
				)
				break
		}

		// Record that we successfully generated metrics
		incrementCounter('metrics_demo_executions', [
			{ name: 'type', value: metricType },
		])

		// Return success with information about generated metrics
		return createApiResponse(200, {
			message: `Successfully generated ${metricType} metrics`,
			generatedMetrics,
			requestId,
		})
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error))

		// Record the error
		highlight.consumeCustomError(err, secureSessionId, requestId, {
			metricType,
		})

		// Return error response
		return createApiResponse(500, {
			error: 'Failed to generate metrics',
			message: err.message,
		})
	}
})

/**
 * Demonstrates various gauge metrics
 */
async function demoGaugeMetrics(): Promise<void> {
	// Simulate system memory usage (0-100%)
	const memoryUsage = Math.random() * 85 + 15 // 15-100%
	recordMetric('system_memory_usage', memoryUsage, [
		{ name: 'unit', value: 'percent' },
		{ name: 'host', value: 'lambda-container' },
	])

	// Simulate CPU usage (0-100%)
	const cpuUsage = Math.random() * 75 + 5 // 5-80%
	recordMetric('system_cpu_usage', cpuUsage, [
		{ name: 'unit', value: 'percent' },
		{ name: 'host', value: 'lambda-container' },
	])

	// Simulate connection pool size
	const connectionPoolSize = Math.floor(Math.random() * 25) + 5 // 5-30
	recordMetric('app_connection_pool_size', connectionPoolSize, [
		{ name: 'pool', value: 'database' },
		{ name: 'type', value: 'active' },
	])
}

/**
 * Demonstrates various counter metrics
 */
async function demoCounterMetrics(): Promise<void> {
	// Simulate API request counts
	const apiRequestCount = Math.floor(Math.random() * 50) + 10 // 10-60
	recordCount('api_requests_total', apiRequestCount, [
		{ name: 'method', value: 'GET' },
		{ name: 'status', value: '200' },
	])

	// Simulate DB operation counts
	const dbOperations = Math.floor(Math.random() * 30) + 5 // 5-35
	recordCount('db_operations_total', dbOperations, [
		{ name: 'operation', value: 'query' },
		{ name: 'table', value: 'users' },
	])

	// Simulate cache hit/miss rates
	const cacheHits = Math.floor(Math.random() * 40) + 10 // 10-50
	recordCount('cache_hits', cacheHits, [
		{ name: 'cache', value: 'user_data' },
	])

	const cacheMisses = Math.floor(Math.random() * 15) + 5 // 5-20
	recordCount('cache_misses', cacheMisses, [
		{ name: 'cache', value: 'user_data' },
	])

	// Increment a counter a few times
	for (let i = 0; i < 5; i++) {
		incrementCounter('lambda_demo_iterations', [
			{ name: 'function', value: 'demoCounterMetrics' },
		])
	}
}

/**
 * Demonstrates various histogram metrics
 */
async function demoHistogramMetrics(): Promise<void> {
	// Simulate API response times (10-500ms)
	for (let i = 0; i < 10; i++) {
		const responseTime = Math.random() * 490 + 10 // 10-500ms
		recordHistogram('api_response_time_ms', responseTime, [
			{ name: 'endpoint', value: '/api/data' },
			{ name: 'method', value: 'GET' },
		])
	}

	// Simulate database query durations (5-200ms)
	for (let i = 0; i < 5; i++) {
		const queryDuration = Math.random() * 195 + 5 // 5-200ms
		recordHistogram('db_query_duration_ms', queryDuration, [
			{ name: 'query_type', value: 'select' },
			{ name: 'table', value: 'orders' },
		])
	}

	// Simulate task processing times (50-2000ms)
	for (let i = 0; i < 3; i++) {
		const processingTime = Math.random() * 1950 + 50 // 50-2000ms
		recordHistogram('task_processing_time_ms', processingTime, [
			{ name: 'task', value: 'data_aggregation' },
			{ name: 'priority', value: 'high' },
		])
	}
}
