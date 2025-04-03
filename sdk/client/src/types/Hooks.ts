import { LDContext } from './LDContext'

/**
 * Contextual information provided to evaluation stages.
 */
export interface EvaluationSeriesContext {
	/**
	 * The flag key the evaluation is for.
	 */
	readonly flagKey: string
	/**
	 * Optional in case evaluations are performed before a context is set.
	 */
	readonly context?: LDContext
	/**
	 * The default value that was provided.
	 */
	readonly defaultValue: unknown

	/**
	 * Implementation note: Omitting method name because of the associated size.
	 * If we need this functionality, then we may want to consider adding it and
	 * taking the associated size hit.
	 */
}

/**
 * Implementation specific hook data for evaluation stages.
 *
 * Hook implementations can use this to store data needed between stages.
 */
export interface EvaluationSeriesData {
	readonly [index: string]: unknown
}

/**
 * Meta-data about a hook implementation.
 */
export interface HookMetadata {
	/**
	 * Name of the hook.
	 */
	readonly name: string
}

/**
 * Contextual information provided to identify stages.
 */
export interface IdentifySeriesContext {
	/**
	 * The context associated with the identify operation.
	 */
	readonly context: LDContext
	/**
	 * The timeout, in seconds, associated with the identify operation.
	 */
	readonly timeout?: number
}

/**
 * Implementation specific hook data for identify stages.
 *
 * Hook implementations can use this to store data needed between stages.
 */
export interface IdentifySeriesData {
	readonly [index: string]: unknown
}

/**
 * The status an identify operation completed with.
 *
 * An example in which an error may occur is lack of network connectivity
 * preventing the SDK from functioning.
 */
export type IdentifySeriesStatus = 'completed' | 'error'

/**
 * The result applies to a single identify operation. An operation may complete
 * with an error and then later complete successfully. Only the first completion
 * will be executed in the identify series.
 *
 * For example, a network issue may cause an identify to error since the SDK
 * can't refresh its cached data from the cloud at that moment, but then later
 * the when the network issue is resolved, the SDK will refresh cached data.
 */
export interface IdentifySeriesResult {
	status: IdentifySeriesStatus
}

/**
 * Interface for extending SDK functionality via hooks.
 */
export interface Hook {
	/**
	 * Get metadata about the hook implementation.
	 */
	getMetadata(): HookMetadata

	/**
	 * This method is called during the execution of a variation method
	 * before the flag value has been determined. The method is executed synchronously.
	 *
	 * @param hookContext Contains information about the evaluation being performed. This is not
	 *  mutable.
	 * @param data A record associated with each stage of hook invocations. Each stage is called with
	 * the data of the previous stage for a series. The input record should not be modified.
	 * @returns Data to use when executing the next state of the hook in the evaluation series. It is
	 * recommended to expand the previous input into the return. This helps ensure your stage remains
	 * compatible moving forward as more stages are added.
	 * ```js
	 * return {...data, "my-new-field": /*my data/*}
	 * ```
	 */
	beforeEvaluation?(
		hookContext: EvaluationSeriesContext,
		data: EvaluationSeriesData,
	): EvaluationSeriesData

	/**
	 * This method is called during the execution of the variation method
	 * after the flag value has been determined. The method is executed synchronously.
	 *
	 * @param hookContext Contains read-only information about the evaluation
	 * being performed.
	 * @param data A record associated with each stage of hook invocations. Each
	 *  stage is called with the data of the previous stage for a series.
	 * @param detail The result of the evaluation. This value should not be
	 * modified.
	 * @returns Data to use when executing the next state of the hook in the evaluation series. It is
	 * recommended to expand the previous input into the return. This helps ensure your stage remains
	 * compatible moving forward as more stages are added.
	 * ```js
	 * return {...data, "my-new-field": /*my data/*}
	 * ```
	 */
	afterEvaluation?(
		hookContext: EvaluationSeriesContext,
		data: EvaluationSeriesData,
		detail: {
			value: any
		},
	): EvaluationSeriesData

	/**
	 * This method is called during the execution of the identify process before the operation
	 * completes, but after any context modifications are performed.
	 *
	 * @param hookContext Contains information about the evaluation being performed. This is not
	 *  mutable.
	 * @param data A record associated with each stage of hook invocations. Each stage is called with
	 * the data of the previous stage for a series. The input record should not be modified.
	 * @returns Data to use when executing the next state of the hook in the evaluation series. It is
	 * recommended to expand the previous input into the return. This helps ensure your stage remains
	 * compatible moving forward as more stages are added.
	 * ```js
	 * return {...data, "my-new-field": /*my data/*}
	 * ```
	 */
	beforeIdentify?(
		hookContext: IdentifySeriesContext,
		data: IdentifySeriesData,
	): IdentifySeriesData

	/**
	 * This method is called during the execution of the identify process before the operation
	 * completes, but after any context modifications are performed.
	 *
	 * @param hookContext Contains information about the evaluation being performed. This is not
	 *  mutable.
	 * @param data A record associated with each stage of hook invocations. Each stage is called with
	 * the data of the previous stage for a series. The input record should not be modified.
	 * @returns Data to use when executing the next state of the hook in the evaluation series. It is
	 * recommended to expand the previous input into the return. This helps ensure your stage remains
	 * compatible moving forward as more stages are added.
	 * ```js
	 * return {...data, "my-new-field": /*my data/*}
	 * ```
	 */
	afterIdentify?(
		hookContext: IdentifySeriesContext,
		data: IdentifySeriesData,
		result: IdentifySeriesResult,
	): IdentifySeriesData
}
