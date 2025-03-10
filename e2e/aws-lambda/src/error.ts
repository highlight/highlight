import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from 'aws-lambda'
import { withHighlight } from './lambda-utils'
import { createApiResponse } from './lambda-utils'
import { recordError, log } from './highlight-client'

// Custom error class for demonstration
class ValidationError extends Error {
	constructor(
		message: string,
		public readonly field: string,
	) {
		super(message)
		this.name = 'ValidationError'
	}
}

// Custom error class for business logic errors
class BusinessLogicError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message)
		this.name = 'BusinessLogicError'
	}
}

/**
 * Lambda handler that demonstrates different error scenarios
 * and how they're tracked with Highlight
 */
export const handler = withHighlight<
	APIGatewayProxyEvent,
	APIGatewayProxyResult
>(async (event, context, highlight) => {
	const { queryStringParameters } = event
	const errorType = queryStringParameters?.type || 'default'

	// Extract request details for tracing context
	const { secureSessionId, requestId } = event.requestContext
		? {
				secureSessionId: event.headers?.['x-session-id'],
				requestId: event.requestContext.requestId,
			}
		: {}

	// Log error demonstration request
	log(
		`Error demonstration request for type: ${errorType}`,
		'info',
		{ errorType },
		secureSessionId,
		requestId,
	)

	try {
		switch (errorType) {
			case 'validation':
				// Demonstrate a validation error
				throw new ValidationError('Invalid input value', 'userId')

			case 'business':
				// Demonstrate a business logic error
				throw new BusinessLogicError(
					'Account limit exceeded',
					'LIMIT_EXCEEDED',
				)

			case 'async':
				// Demonstrate an error in async code
				await simulateAsyncError()
				break

			case 'unhandled':
				// Demonstrate an unhandled error
				// This will be caught by our wrapper, but shows how unexpected errors are handled
				const obj: any = null
				obj.nonExistentProperty.access() // Will throw null reference error
				break

			case 'complex':
				// Demonstrate complex error with additional metadata
				// Create a flat metadata structure compatible with the Highlight API
				const displayMetadata = {
					userId: '12345',
					accountType: 'premium',
					attemptedOperation: 'data_export',
					limits: {
						daily: 5,
						current: 6,
					},
				}

				// Flatten metadata for Highlight to avoid nested objects
				const highlightMetadata = {
					userId: '12345',
					accountType: 'premium',
					attemptedOperation: 'data_export',
					'limits.daily': 5,
					'limits.current': 6,
				}

				// Create and record a custom error with metadata
				const complexError = new BusinessLogicError(
					'Operation failed due to rate limiting',
					'RATE_LIMITED',
				)

				// Report the error with flattened metadata
				highlight.consumeCustomError(
					complexError,
					secureSessionId,
					requestId,
					highlightMetadata,
				)

				return createApiResponse(429, {
					error: 'Too Many Requests',
					message: complexError.message,
					code: complexError.code,
					details: displayMetadata,
				})

			default:
				// Return success for default case
				return createApiResponse(200, {
					message:
						'No error triggered. Use query parameter ?type=X to trigger errors.',
					availableTypes: [
						'validation',
						'business',
						'async',
						'unhandled',
						'complex',
					],
				})
		}

		// This point should never be reached for error cases
		return createApiResponse(200, { message: 'Operation completed' })
	} catch (error) {
		// Convert to Error object if needed
		const err = error instanceof Error ? error : new Error(String(error))

		// Prepare error metadata based on error type
		let metadata: Record<string, any> = {
			errorType,
			path: event.path,
		}

		let statusCode = 500
		let responseBody: Record<string, any> = {
			error: 'Internal Server Error',
		}

		// Handle different error types
		if (err instanceof ValidationError) {
			statusCode = 400
			responseBody = {
				error: 'Validation Error',
				message: err.message,
				field: err.field,
			}
			metadata.field = err.field
		} else if (err instanceof BusinessLogicError) {
			statusCode = 422
			responseBody = {
				error: 'Business Logic Error',
				message: err.message,
				code: err.code,
			}
			metadata.code = err.code
		} else {
			// Generic error
			responseBody = {
				error: 'Internal Server Error',
				message: err.message,
			}
		}

		// Record the error with Highlight
		recordError(err, secureSessionId, requestId, metadata)

		// Log the error
		log(
			`Error occurred: ${err.message}`,
			'error',
			{
				errorType: err.name,
				errorMessage: err.message,
				errorStack: err.stack,
				...metadata,
			},
			secureSessionId,
			requestId,
		)

		// Return appropriate error response
		return createApiResponse(statusCode, responseBody)
	}
})

/**
 * Helper function that simulates an async error
 */
async function simulateAsyncError(): Promise<void> {
	return new Promise((_, reject) => {
		setTimeout(() => {
			reject(new Error('Async operation failed'))
		}, 500)
	})
}
