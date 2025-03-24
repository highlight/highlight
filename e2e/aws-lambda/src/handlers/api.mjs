import { H, Handlers } from '@highlight-run/node'

/**
 * API Lambda handler that showcases Highlight's tracing capabilities
 */
export const handler = Handlers.serverlessFunction(
	async (event) => {
		const { httpMethod, path, queryStringParameters, body } = event
		// Log API request
		H.log(`API Request: ${httpMethod} ${path}`, 'info', {
			method: httpMethod,
			path,
			query: queryStringParameters,
			body: body ? JSON.parse(body) : undefined,
		})

		// Record API request count
		H.recordIncr({
			name: 'api_request_count',
			tags: [
				{ name: 'method', value: httpMethod },
				{ name: 'path', value: path },
			],
		})

		// Process request based on method
		try {
			switch (httpMethod) {
				case 'GET':
					// Simulate processing time for GET requests
					const startTime = Date.now()
					await simulateProcessing(100, 500)
					const processingTime = Date.now() - startTime

					// Record processing time as a metric
					H.recordMetric({
						name: 'api_processing_time',
						value: processingTime,
						tags: [
							{ name: 'method', value: 'GET' },
							{ name: 'path', value: path },
						],
					})

					// Return success response
					return {
						statusCode: 200,
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							message: 'GET request processed successfully',
							processingTime,
							query: queryStringParameters,
						}),
					}

				case 'POST':
					// Parse the request body
					const requestBody = body ? JSON.parse(body) : {}

					// Validate the request body
					if (!requestBody.data) {
						// Record validation error
						H.consumeError(
							new Error('Missing required field: data'),
							undefined,
							undefined,
							{ method: httpMethod, path },
						)

						return {
							statusCode: 400,
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								error: 'Bad Request',
								message: 'Missing required field: data',
							}),
						}
					}

					// Simulate processing for POST requests
					const postStartTime = Date.now()
					await simulateProcessing(200, 800)
					const postProcessingTime = Date.now() - postStartTime

					// Record processing time as a metric
					H.recordMetric({
						name: 'api_processing_time',
						value: postProcessingTime,
						tags: [
							{ name: 'method', value: httpMethod },
							{ name: 'path', value: path },
						],
					})

					// Return success response with data
					return {
						statusCode: 201,
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							message: 'POST request processed successfully',
							processingTime: postProcessingTime,
							data: requestBody.data,
						}),
					}

				default:
					// Handle unsupported methods
					H.consumeError(
						new Error(`Unsupported method: ${httpMethod}`),
						undefined,
						undefined,
						{ method: httpMethod, path },
					)

					return {
						statusCode: 405,
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							error: 'Method Not Allowed',
							message: `Unsupported method: ${httpMethod}`,
						}),
					}
			}
		} catch (error) {
			const err =
				error instanceof Error ? error : new Error(String(error))

			// Record the error with Highlight
			H.consumeError(err, undefined, undefined, {
				method: httpMethod,
				path,
				query: queryStringParameters,
			})

			// Return error response
			return {
				statusCode: 500,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					error: 'Internal Server Error',
					message: err.message,
				}),
			}
		}
	},
	{
		projectID: process.env.HIGHLIGHT_PROJECT_ID,
		serviceName: 'aws-lambda-example',
		serviceVersion: '1.0.0',
		environment: process.env.NODE_ENV || 'development',
		debug: false,
	},
)

/**
 * Helper function to simulate processing time
 */
async function simulateProcessing(minMs, maxMs) {
	const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
	return new Promise((resolve) => setTimeout(resolve, delay))
}
