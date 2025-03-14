import { Highlight } from '@highlight-run/node'

// Initialize a singleton instance of the Highlight client
let highlightClient: Highlight | null = null

/**
 * Returns a singleton instance of the Highlight client
 */
export function getHighlightClient(): Highlight {
	if (!highlightClient) {
		if (!process.env.HIGHLIGHT_PROJECT_ID) {
			throw new Error(
				'HIGHLIGHT_PROJECT_ID environment variable is required',
			)
		}

		highlightClient = new Highlight({
			projectID: process.env.HIGHLIGHT_PROJECT_ID,
			serviceName: 'aws-lambda-example',
			serviceVersion: '1.0.0',
			environment: process.env.NODE_ENV || 'development',
			debug: process.env.DEBUG === 'true',
		})

		console.log('Highlight client initialized')
	}

	return highlightClient
}

/**
 * Safely stops the Highlight client and ensures data is flushed
 */
export async function stopHighlight(): Promise<void> {
	if (highlightClient) {
		try {
			await highlightClient.flush()
			await highlightClient.stop()
			console.log('Highlight client stopped')
		} catch (error) {
			console.error('Error stopping Highlight client:', error)
		}
	}
}

/**
 * Records a custom error with optional metadata
 */
export function recordError(
	error: Error,
	secureSessionId?: string,
	requestId?: string,
	metadata?: Record<string, any>,
): void {
	try {
		const client = getHighlightClient()
		client.consumeCustomError(error, secureSessionId, requestId, metadata)
	} catch (err) {
		console.error('Failed to record error in Highlight:', err)
	}
}

/**
 * Records a custom metric
 */
export function recordMetric(
	name: string,
	value: number,
	tags?: { name: string; value: string }[],
): void {
	try {
		const client = getHighlightClient()
		client.recordMetric({
			name,
			value,
			tags,
		})
	} catch (err) {
		console.error('Failed to record metric in Highlight:', err)
	}
}

/**
 * Records a histogram metric
 */
export function recordHistogram(
	name: string,
	value: number,
	tags?: { name: string; value: string }[],
): void {
	try {
		const client = getHighlightClient()
		client.recordHistogram({
			name,
			value,
			tags,
		})
	} catch (err) {
		console.error('Failed to record histogram in Highlight:', err)
	}
}

/**
 * Records a counter metric
 */
export function recordCount(
	name: string,
	value: number = 1,
	tags?: { name: string; value: string }[],
): void {
	try {
		const client = getHighlightClient()
		client.recordCount({
			name,
			value,
			tags,
		})
	} catch (err) {
		console.error('Failed to record count in Highlight:', err)
	}
}

/**
 * Increments a counter by 1
 */
export function incrementCounter(
	name: string,
	tags?: { name: string; value: string }[],
): void {
	try {
		const client = getHighlightClient()
		client.recordIncr({
			name,
			tags,
		})
	} catch (err) {
		console.error('Failed to increment counter in Highlight:', err)
	}
}

/**
 * Logs a message with Highlight
 */
export function log(
	message: string,
	level: string = 'info',
	metadata?: Record<string, any>,
	secureSessionId?: string,
	requestId?: string,
): void {
	try {
		const client = getHighlightClient()
		client.log(
			new Date(),
			message,
			level,
			{},
			secureSessionId,
			requestId,
			metadata,
		)
	} catch (err) {
		console.error('Failed to log message in Highlight:', err)
	}
}
