import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from 'aws-lambda'
import { withHighlight } from './lambda-utils'
import { createApiResponse } from './lambda-utils'
import { recordMetric, incrementCounter, log } from './highlight-client'

/**
 * API Lambda handler that showcases Highlight's tracing capabilities
 */
export const handler = withHighlight<
	APIGatewayProxyEvent,
	APIGatewayProxyResult
>(async (event, context, highlight) => {
	const { httpMethod, path, queryStringParameters, body } = event

	// Extract request details for tracing context
	const { secureSessionId, requestId } = event.requestContext
		? {
				secureSessionId: event.headers?.['x-session-id'],
				requestId: event.requestContext.requestId,
			}
		: {}

	// Convert queryStringParameters to safe format for Highlight
	const safeQueryParams = queryStringParameters
		? JSON.parse(JSON.stringify(queryStringParameters))
		: undefined

	// Log API request
	log(
		`API Request: ${httpMethod} ${path}`,
		'info',
		{
			method: httpMethod,
			path,
			query: safeQueryParams,
			body: body ? JSON.parse(body) : undefined,
		},
		secureSessionId,
		requestId,
	)

	// Record API request count
	incrementCounter('api_request_count', [
		{ name: 'method', value: httpMethod },
		{ name: 'path', value: path },
	])

	// Process request based on method
	try {
		switch (httpMethod) {
			case 'GET':
				// Simulate processing time for GET requests
				const startTime = Date.now()
				await simulateProcessing(100, 500)
				const processingTime = Date.now() - startTime

				// Record processing time as a metric
				recordMetric('api_processing_time', processingTime, [
					{ name: 'method', value: 'GET' },
					{ name: 'path', value: path },
				])

				// Return success response
				return createApiResponse(200, {
					message: 'GET request processed successfully',
					requestId,
					processingTime,
					query: safeQueryParams,
				})

			case 'POST':
				// Parse the request body
				const requestBody = body ? JSON.parse(body) : {}

				// Validate the request body
				if (!requestBody.data) {
					// Record validation error
					highlight.consumeCustomError(
						new Error('Missing required field: data'),
						secureSessionId,
						requestId,
						{ method: httpMethod, path },
					)

					return createApiResponse(400, {
						error: 'Bad Request',
						message: 'Missing required field: data',
					})
				}

				// Simulate processing for POST requests
				const postStartTime = Date.now()
				await simulateProcessing(200, 800)
				const postProcessingTime = Date.now() - postStartTime

				// Record processing time as a metric
				recordMetric('api_processing_time', postProcessingTime, [
					{ name: 'method', value: 'POST' },
					{ name: 'path', value: path },
				])

				// Return success response with data
				return createApiResponse(201, {
					message: 'POST request processed successfully',
					requestId,
					processingTime: postProcessingTime,
					data: requestBody.data,
				})

			default:
				// Handle unsupported methods
				highlight.consumeCustomError(
					new Error(`Unsupported method: ${httpMethod}`),
					secureSessionId,
					requestId,
					{ method: httpMethod, path },
				)

				return createApiResponse(405, {
					error: 'Method Not Allowed',
					message: `Unsupported method: ${httpMethod}`,
				})
		}
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error))

		// Record the error with Highlight
		highlight.consumeCustomError(err, secureSessionId, requestId, {
			method: httpMethod,
			path,
			query: safeQueryParams,
		})

		// Return error response
		return createApiResponse(500, {
			error: 'Internal Server Error',
			message: err.message,
		})
	}
})

/**
 * Helper function to simulate processing time
 */
async function simulateProcessing(minMs: number, maxMs: number): Promise<void> {
	const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
	return new Promise((resolve) => setTimeout(resolve, delay))
}
