import { Kafka } from 'kafkajs'
import { trace, context, propagation } from '@opentelemetry/api'
import { H } from '@highlight-run/node'

// Set up OpenTelemetry using Highlight SDK
H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'kafka-consumer',
	serviceVersion: 'git-sha',
	environment: 'e2e-test',
})

const tracer = trace.getTracer('kafka-consumer')

// Kafka consumer configuration
const kafka = new Kafka({
	clientId: 'highlight-kafka-consumer',
	brokers: ['localhost:9092'],
})

const consumer = kafka.consumer({ groupId: 'highlight-consumer-group' })

async function run() {
	// Connect to the Kafka broker
	await consumer.connect()

	// Subscribe to the topic
	await consumer.subscribe({ topic: 'dev', fromBeginning: true })

	// Start consuming messages
	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			// Extract the trace context from message headers
			const carrier = {}
			if (message.headers) {
				Object.entries(message.headers).forEach(([key, value]) => {
					if (value) {
						carrier[key] = value.toString()
					}
				})
			}

			console.log('message', carrier)
			await H.runWithHeaders('kafka.consume', carrier, async (span) => {
				span.setAttribute('kafka.topic', topic)
				span.setAttribute('kafka.partition', partition)
				span.setAttribute(
					'kafka.key',
					message.key ? message.key.toString() : '',
				)

				console.log({
					topic,
					partition,
					key: message.key ? message.key.toString() : null,
					value: message.value ? message.value.toString() : null,
					headers: message.headers,
				})

				// Simulate some processing time
				await new Promise((resolve) => setTimeout(resolve, 100))
			})
		},
	})
}

run().catch(console.error)

// Handle graceful shutdown
const shutdown = async () => {
	await consumer.disconnect()
	await provider.shutdown()
	process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
