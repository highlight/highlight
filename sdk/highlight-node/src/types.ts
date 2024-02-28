import { Attributes } from '@opentelemetry/api'
import { HighlightOptions } from 'highlight.run'

export interface NodeOptions extends HighlightOptions {
	/**
	 * ID used to associate payloads with a Highlight project.
	 */
	projectID: string

	/**
	 * The endpoint string to send opentelemetry data to.
	 * @default https://otel.highlight.io:4318
	 */
	otlpEndpoint?: string

	/**
	 * This app's service name.
	 */
	serviceName?: string

	/**
	 * This app's version ideally set to the latest deployed git SHA.
	 */
	serviceVersion?: string

	/**
	 * Specifies the environment your application is running in.
	 * This is useful to distinguish whether your session was recorded on localhost or in production.
	 */
	environment?: 'development' | 'staging' | 'production' | string

	/**
	 * Enables node fs instrumentation @default false
	 * see .
	 * {@link https://opentelemetry.io/docs/instrumentation/js/libraries/#registration}
	 */
	enableFsInstrumentation?: boolean

	/**
	 * Attributes to be added to the OpenTelemetry Resource.
	 */
	attributes?: Attributes

	/**
	 * Set to try to serialize console object arguments into the message body.
	 */
	serializeConsoleAttributes?: boolean
}

export interface HighlightContext {
	secureSessionId: string | undefined
	requestId: string | undefined
}
