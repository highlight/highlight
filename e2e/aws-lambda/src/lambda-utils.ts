import {
	APIGatewayProxyEvent,
	Context,
	SQSEvent,
	APIGatewayProxyResult,
} from 'aws-lambda'
import {
	getHighlightClient,
	stopHighlight,
	recordError,
	log,
} from './highlight-client'
import { Highlight } from '@highlight-run/node'

/**
 * Extracts context information from Lambda events for Highlight tracking
 */
export function extractContextFromEvent(
	event: APIGatewayProxyEvent | SQSEvent,
): { secureSessionId?: string; requestId?: string } {
	// For API Gateway events
	if ('requestContext' in event && event.requestContext) {
		return {
			secureSessionId: event.headers?.['x-session-id'],
			requestId: event.requestContext.requestId,
		}
	}

	// For SQS events
	if ('Records' in event && event.Records && event.Records.length > 0) {
		const firstRecord = event.Records[0]
		return {
			secureSessionId:
				firstRecord.messageAttributes?.['secureSessionId']?.stringValue,
			requestId: firstRecord.messageId,
		}
	}

	return {}
}

/**
 * Creates a standardized API Gateway response
 */
export function createApiResponse(
	statusCode: number,
	body: any,
	headers: Record<string, string> = {},
): APIGatewayProxyResult {
	return {
		statusCode,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: JSON.stringify(body),
	}
}

/**
 * Wrapper function to handle Lambda execution with Highlight integration
 */
export function withHighlight<TEvent, TResult>(
	handler: (
		event: TEvent,
		context: Context,
		highlight: Highlight,
	) => Promise<TResult> | TResult,
) {
	return async (event: TEvent, context: Context): Promise<TResult> => {
		let result: TResult
		const startTime = Date.now()

		try {
			// Initialize Highlight client
			const highlight = getHighlightClient()

			// If it's an API Gateway or SQS event, extract context
			const { secureSessionId, requestId } =
				'requestContext' in (event as any) ||
				'Records' in (event as any)
					? extractContextFromEvent(event as any)
					: {}

			// Log the event
			log(
				`Lambda invocation: ${context.functionName}`,
				'info',
				{
					event: JSON.stringify(event),
					context: JSON.stringify(context),
				},
				secureSessionId,
				requestId || context.awsRequestId,
			)

			// Execute the handler
			result = await handler(event, context, highlight)

			// Record execution time
			const executionTime = Date.now() - startTime
			highlight.recordHistogram({
				name: 'lambda_execution_time',
				value: executionTime,
				tags: [
					{ name: 'function_name', value: context.functionName },
					{ name: 'request_id', value: context.awsRequestId },
				],
			})

			// Log completion
			log(
				`Lambda completed: ${context.functionName}`,
				'info',
				{ executionTime },
				secureSessionId,
				requestId || context.awsRequestId,
			)

			return result
		} catch (error) {
			// Record the error
			const err =
				error instanceof Error ? error : new Error(String(error))

			recordError(
				err,
				(event as any)?.requestContext?.identity?.sessionId,
				context.awsRequestId,
				{
					functionName: context.functionName,
					event: JSON.stringify(event),
				},
			)

			log(
				`Lambda error: ${context.functionName}`,
				'error',
				{
					errorMessage: err.message,
					errorStack: err.stack,
					event: JSON.stringify(event),
				},
				(event as any)?.requestContext?.identity?.sessionId,
				context.awsRequestId,
			)

			throw err
		} finally {
			try {
				// Ensure metrics are flushed before Lambda freezes
				await stopHighlight()
			} catch (e) {
				console.error('Error stopping Highlight client:', e)
			}
		}
	}
}
