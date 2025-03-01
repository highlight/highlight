import { SQSEvent, SQSRecord, Context } from 'aws-lambda'
import { withHighlight } from './lambda-utils'
import { recordMetric, incrementCounter, log } from './highlight-client'

/**
 * Processes SQS events with Highlight tracing
 */
export const handler = withHighlight<SQSEvent, void>(
	async (event, context, highlight) => {
		const { Records } = event

		// Log event processing start
		log(
			`Processing ${Records.length} SQS messages`,
			'info',
			{ batchSize: Records.length },
			undefined,
			context.awsRequestId,
		)

		// Record batch size metric
		recordMetric('sqs_batch_size', Records.length, [
			{ name: 'function', value: context.functionName },
		])

		// Process each record
		const processPromises = Records.map(async (record) => {
			await processRecord(record, highlight, context.awsRequestId)
		})

		// Wait for all records to be processed
		await Promise.all(processPromises)

		// Log completion
		log(
			`Completed processing ${Records.length} SQS messages`,
			'info',
			{ batchSize: Records.length },
			undefined,
			context.awsRequestId,
		)

		// Record successful processing
		incrementCounter('sqs_batches_processed', [
			{ name: 'function', value: context.functionName },
		])
	},
)

/**
 * Process an individual SQS record with Highlight tracing
 */
async function processRecord(
	record: SQSRecord,
	highlight: any,
	requestId: string,
): Promise<void> {
	const startTime = Date.now()
	const messageId = record.messageId

	try {
		// Extract content from the message
		const body = JSON.parse(record.body)
		const messageType = body.type || 'unknown'

		// Extract any session tracking from message attributes
		const secureSessionId =
			record.messageAttributes?.secureSessionId?.stringValue

		// Log processing of this record
		log(
			`Processing SQS message: ${messageId}`,
			'info',
			{
				messageId,
				messageType,
				body: JSON.stringify(body),
			},
			secureSessionId,
			requestId,
		)

		// Record message processing count
		incrementCounter('sqs_messages_processed', [
			{ name: 'type', value: messageType },
		])

		// Simulate different processing based on message type
		switch (messageType) {
			case 'notification':
				// Simulate notification processing time
				await simulateProcessing(50, 200)
				break

			case 'order':
				// Simulate order processing time
				await simulateProcessing(100, 400)
				break

			case 'data_sync':
				// Simulate data sync processing time
				await simulateProcessing(200, 800)
				break

			default:
				// Default processing time
				await simulateProcessing(50, 150)
				break
		}

		// Log success
		log(
			`Successfully processed SQS message: ${messageId}`,
			'info',
			{ messageId, messageType },
			secureSessionId,
			requestId,
		)
	} catch (error) {
		// Handle and record error
		const err = error instanceof Error ? error : new Error(String(error))

		// Record the error with Highlight
		highlight.consumeCustomError(
			err,
			record.messageAttributes?.secureSessionId?.stringValue,
			requestId,
			{
				messageId,
				source: 'sqs_processor',
			},
		)

		// Log error
		log(
			`Error processing SQS message: ${messageId}`,
			'error',
			{
				messageId,
				errorMessage: err.message,
				errorStack: err.stack,
			},
			record.messageAttributes?.secureSessionId?.stringValue,
			requestId,
		)

		// Re-throw to let Lambda handle the failure
		throw err
	} finally {
		// Record processing time regardless of success/failure
		const processingTime = Date.now() - startTime

		// Log the processing time as a metric
		recordMetric('sqs_message_processing_time', processingTime, [
			{ name: 'messageId', value: messageId },
		])
	}
}

/**
 * Helper function to simulate processing time
 */
async function simulateProcessing(minMs: number, maxMs: number): Promise<void> {
	const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
	return new Promise((resolve) => setTimeout(resolve, delay))
}
