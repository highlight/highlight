import { GraphQLClient } from 'graphql-request'
import * as Dom from 'graphql-request/dist/types.dom'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string
	String: string
	Boolean: boolean
	Int: number
	Float: number
	Any: any
	Int64: any
	Timestamp: any
}

export type BackendErrorObjectInput = {
	event: Scalars['String']
	payload?: InputMaybe<Scalars['String']>
	request_id: Scalars['String']
	session_secure_id: Scalars['String']
	source: Scalars['String']
	stackTrace: Scalars['String']
	timestamp: Scalars['Timestamp']
	type: Scalars['String']
	url: Scalars['String']
}

export type ErrorObjectInput = {
	columnNumber: Scalars['Int']
	event: Scalars['String']
	lineNumber: Scalars['Int']
	payload?: InputMaybe<Scalars['String']>
	source: Scalars['String']
	stackTrace: Array<InputMaybe<StackFrameInput>>
	timestamp: Scalars['Timestamp']
	type: Scalars['String']
	url: Scalars['String']
}

export type MetricTag = {
	name: Scalars['String']
	value: Scalars['String']
}

export type MetricInput = {
	session_secure_id: Scalars['String']
	group?: InputMaybe<Scalars['String']>
	name: Scalars['String']
	value: Scalars['Float']
	category?: InputMaybe<Scalars['String']>
	timestamp: Scalars['Timestamp']
	tags?: InputMaybe<Array<MetricTag>>
}

export type Mutation = {
	__typename?: 'Mutation'
	addSessionFeedback: Scalars['ID']
	addSessionProperties?: Maybe<Scalars['ID']>
	addTrackProperties?: Maybe<Scalars['ID']>
	identifySession?: Maybe<Scalars['ID']>
	initializeSession?: Maybe<Session>
	markBackendSetup: Scalars['ID']
	pushBackendPayload?: Maybe<Scalars['Any']>
	pushMetrics: Scalars['ID']
	pushPayload: Scalars['Int']
}

export type MutationAddSessionFeedbackArgs = {
	session_id: Scalars['ID']
	timestamp: Scalars['Timestamp']
	user_email?: InputMaybe<Scalars['String']>
	user_name?: InputMaybe<Scalars['String']>
	verbatim: Scalars['String']
}

export type MutationAddSessionPropertiesArgs = {
	properties_object?: InputMaybe<Scalars['Any']>
	session_id: Scalars['ID']
}

export type MutationAddTrackPropertiesArgs = {
	properties_object?: InputMaybe<Scalars['Any']>
	session_id: Scalars['ID']
}

export type MutationIdentifySessionArgs = {
	session_id: Scalars['ID']
	user_identifier: Scalars['String']
	user_object?: InputMaybe<Scalars['Any']>
}

export type MutationInitializeSessionArgs = {
	appVersion?: InputMaybe<Scalars['String']>
	clientConfig: Scalars['String']
	clientVersion: Scalars['String']
	client_id?: InputMaybe<Scalars['String']>
	enable_recording_network_contents: Scalars['Boolean']
	enable_strict_privacy: Scalars['Boolean']
	environment: Scalars['String']
	fingerprint: Scalars['String']
	firstloadVersion: Scalars['String']
	organization_verbose_id: Scalars['String']
	session_secure_id?: InputMaybe<Scalars['String']>
}

export type MutationMarkBackendSetupArgs = {
	session_secure_id: Scalars['String']
}

export type MutationPushBackendPayloadArgs = {
	errors: Array<InputMaybe<BackendErrorObjectInput>>
}

export type MutationPushMetricsArgs = {
	metrics: Array<InputMaybe<MetricInput>>
}

export type MutationPushPayloadArgs = {
	errors: Array<InputMaybe<ErrorObjectInput>>
	events: ReplayEventsInput
	has_session_unloaded?: InputMaybe<Scalars['Boolean']>
	highlight_logs?: InputMaybe<Scalars['String']>
	is_beacon?: InputMaybe<Scalars['Boolean']>
	messages: Scalars['String']
	resources: Scalars['String']
	session_id: Scalars['ID']
}

export type Query = {
	__typename?: 'Query'
	ignore?: Maybe<Scalars['Any']>
}

export type QueryIgnoreArgs = {
	id: Scalars['ID']
}

export type ReplayEventInput = {
	_sid: Scalars['Float']
	data: Scalars['Any']
	timestamp: Scalars['Float']
	type: Scalars['Int']
}

export type ReplayEventsInput = {
	events: Array<InputMaybe<ReplayEventInput>>
}

export type Session = {
	__typename?: 'Session'
	id: Scalars['ID']
	organization_id: Scalars['ID']
	project_id: Scalars['ID']
	secure_id: Scalars['String']
}

export type StackFrameInput = {
	args?: InputMaybe<Array<InputMaybe<Scalars['Any']>>>
	columnNumber?: InputMaybe<Scalars['Int']>
	fileName?: InputMaybe<Scalars['String']>
	functionName?: InputMaybe<Scalars['String']>
	isEval?: InputMaybe<Scalars['Boolean']>
	isNative?: InputMaybe<Scalars['Boolean']>
	lineNumber?: InputMaybe<Scalars['Int']>
	source?: InputMaybe<Scalars['String']>
}

export type PushBackendPayloadMutationVariables = Exact<{
	errors:
		| Array<InputMaybe<BackendErrorObjectInput>>
		| InputMaybe<BackendErrorObjectInput>
}>

export type PushBackendPayloadMutation = {
	__typename?: 'Mutation'
	pushBackendPayload?: any | null
}

export type MarkBackendSetupMutationVariables = Exact<{
	session_secure_id: Scalars['String']
}>

export type MarkBackendSetupMutation = {
	__typename?: 'Mutation'
	markBackendSetup: string
}

export type PushMetricsMutationVariables = Exact<{
	metrics: Array<InputMaybe<MetricInput>> | InputMaybe<MetricInput>
}>

export type PushMetricsMutation = {
	__typename?: 'Mutation'
	pushMetrics: string
}

export const PushBackendPayloadDocument = gql`
	mutation PushBackendPayload($errors: [BackendErrorObjectInput]!) {
		pushBackendPayload(errors: $errors)
	}
`
export const MarkBackendSetupDocument = gql`
	mutation MarkBackendSetup($session_secure_id: String!) {
		markBackendSetup(session_secure_id: $session_secure_id)
	}
`
export const PushMetricsDocument = gql`
	mutation PushMetrics($metrics: [MetricInput]!) {
		pushMetrics(metrics: $metrics)
	}
`

export type SdkFunctionWrapper = <T>(
	action: (requestHeaders?: Record<string, string>) => Promise<T>,
	operationName: string,
	operationType?: string,
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (
	action,
	_operationName,
	_operationType,
) => action()

export function getSdk(
	client: GraphQLClient,
	withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
	return {
		PushBackendPayload(
			variables: PushBackendPayloadMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<PushBackendPayloadMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<PushBackendPayloadMutation>(
						PushBackendPayloadDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'PushBackendPayload',
				'mutation',
			)
		},
		MarkBackendSetup(
			variables: MarkBackendSetupMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<MarkBackendSetupMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<MarkBackendSetupMutation>(
						MarkBackendSetupDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'MarkBackendSetup',
				'mutation',
			)
		},
		PushMetrics(
			variables: PushMetricsMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<PushMetricsMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<PushMetricsMutation>(
						PushMetricsDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'PushMetrics',
				'mutation',
			)
		},
	}
}
export type Sdk = ReturnType<typeof getSdk>
