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
	log_cursor?: InputMaybe<Scalars['String']>
	payload?: InputMaybe<Scalars['String']>
	request_id?: InputMaybe<Scalars['String']>
	service: ServiceInput
	session_secure_id?: InputMaybe<Scalars['String']>
	source: Scalars['String']
	span_id?: InputMaybe<Scalars['String']>
	stackTrace: Scalars['String']
	timestamp: Scalars['Timestamp']
	trace_id?: InputMaybe<Scalars['String']>
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

export type InitializeSessionResponse = {
	__typename?: 'InitializeSessionResponse'
	project_id: Scalars['ID']
	secure_id: Scalars['String']
}

export type MetricInput = {
	category?: InputMaybe<Scalars['String']>
	group?: InputMaybe<Scalars['String']>
	name: Scalars['String']
	session_secure_id: Scalars['String']
	tags?: InputMaybe<Array<MetricTag>>
	timestamp: Scalars['Timestamp']
	value: Scalars['Float']
}

export type MetricTag = {
	name: Scalars['String']
	value: Scalars['String']
}

export type Mutation = {
	__typename?: 'Mutation'
	addSessionFeedback: Scalars['String']
	addSessionProperties: Scalars['String']
	identifySession: Scalars['String']
	initializeSession: InitializeSessionResponse
	markBackendSetup?: Maybe<Scalars['Any']>
	pushBackendPayload?: Maybe<Scalars['Any']>
	pushMetrics: Scalars['Int']
	pushPayload: Scalars['Int']
}

export type MutationAddSessionFeedbackArgs = {
	session_secure_id: Scalars['String']
	timestamp: Scalars['Timestamp']
	user_email?: InputMaybe<Scalars['String']>
	user_name?: InputMaybe<Scalars['String']>
	verbatim: Scalars['String']
}

export type MutationAddSessionPropertiesArgs = {
	properties_object?: InputMaybe<Scalars['Any']>
	session_secure_id: Scalars['String']
}

export type MutationIdentifySessionArgs = {
	session_secure_id: Scalars['String']
	user_identifier: Scalars['String']
	user_object?: InputMaybe<Scalars['Any']>
}

export type MutationInitializeSessionArgs = {
	appVersion?: InputMaybe<Scalars['String']>
	clientConfig: Scalars['String']
	clientVersion: Scalars['String']
	client_id: Scalars['String']
	disable_session_recording?: InputMaybe<Scalars['Boolean']>
	enable_recording_network_contents: Scalars['Boolean']
	enable_strict_privacy: Scalars['Boolean']
	environment: Scalars['String']
	fingerprint: Scalars['String']
	firstloadVersion: Scalars['String']
	network_recording_domains?: InputMaybe<Array<Scalars['String']>>
	organization_verbose_id: Scalars['String']
	session_secure_id: Scalars['String']
}

export type MutationMarkBackendSetupArgs = {
	project_id?: InputMaybe<Scalars['String']>
	session_secure_id?: InputMaybe<Scalars['String']>
	type?: InputMaybe<Scalars['String']>
}

export type MutationPushBackendPayloadArgs = {
	errors: Array<InputMaybe<BackendErrorObjectInput>>
	project_id?: InputMaybe<Scalars['String']>
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
	payload_id?: InputMaybe<Scalars['ID']>
	resources: Scalars['String']
	session_secure_id: Scalars['String']
	web_socket_events?: InputMaybe<Scalars['String']>
}

export enum PublicGraphError {
	BillingQuotaExceeded = 'BillingQuotaExceeded',
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

export type ServiceInput = {
	name: Scalars['String']
	version: Scalars['String']
}

export type Session = {
	__typename?: 'Session'
	id?: Maybe<Scalars['ID']>
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

export type PushPayloadMutationVariables = Exact<{
	session_secure_id: Scalars['String']
	events: ReplayEventsInput
	messages: Scalars['String']
	resources: Scalars['String']
	web_socket_events: Scalars['String']
	errors: Array<InputMaybe<ErrorObjectInput>> | InputMaybe<ErrorObjectInput>
	is_beacon?: InputMaybe<Scalars['Boolean']>
	has_session_unloaded?: InputMaybe<Scalars['Boolean']>
	highlight_logs?: InputMaybe<Scalars['String']>
	payload_id?: InputMaybe<Scalars['ID']>
}>

export type PushPayloadMutation = {
	__typename?: 'Mutation'
	pushPayload: number
}

export type IdentifySessionMutationVariables = Exact<{
	session_secure_id: Scalars['String']
	user_identifier: Scalars['String']
	user_object?: InputMaybe<Scalars['Any']>
}>

export type IdentifySessionMutation = {
	__typename?: 'Mutation'
	identifySession: string
}

export type AddSessionPropertiesMutationVariables = Exact<{
	session_secure_id: Scalars['String']
	properties_object?: InputMaybe<Scalars['Any']>
}>

export type AddSessionPropertiesMutation = {
	__typename?: 'Mutation'
	addSessionProperties: string
}

export type PushMetricsMutationVariables = Exact<{
	metrics: Array<InputMaybe<MetricInput>> | InputMaybe<MetricInput>
}>

export type PushMetricsMutation = {
	__typename?: 'Mutation'
	pushMetrics: number
}

export type AddSessionFeedbackMutationVariables = Exact<{
	session_secure_id: Scalars['String']
	user_name?: InputMaybe<Scalars['String']>
	user_email?: InputMaybe<Scalars['String']>
	verbatim: Scalars['String']
	timestamp: Scalars['Timestamp']
}>

export type AddSessionFeedbackMutation = {
	__typename?: 'Mutation'
	addSessionFeedback: string
}

export type InitializeSessionMutationVariables = Exact<{
	session_secure_id: Scalars['String']
	organization_verbose_id: Scalars['String']
	enable_strict_privacy: Scalars['Boolean']
	enable_recording_network_contents: Scalars['Boolean']
	clientVersion: Scalars['String']
	firstloadVersion: Scalars['String']
	clientConfig: Scalars['String']
	environment: Scalars['String']
	id: Scalars['String']
	appVersion?: InputMaybe<Scalars['String']>
	client_id: Scalars['String']
	network_recording_domains?: InputMaybe<
		Array<Scalars['String']> | Scalars['String']
	>
	disable_session_recording?: InputMaybe<Scalars['Boolean']>
}>

export type InitializeSessionMutation = {
	__typename?: 'Mutation'
	initializeSession: {
		__typename?: 'InitializeSessionResponse'
		secure_id: string
		project_id: string
	}
}

export type IgnoreQueryVariables = Exact<{
	id: Scalars['ID']
}>

export type IgnoreQuery = { __typename?: 'Query'; ignore?: any | null }

export const PushPayloadDocument = gql`
	mutation PushPayload(
		$session_secure_id: String!
		$events: ReplayEventsInput!
		$messages: String!
		$resources: String!
		$web_socket_events: String!
		$errors: [ErrorObjectInput]!
		$is_beacon: Boolean
		$has_session_unloaded: Boolean
		$highlight_logs: String
		$payload_id: ID
	) {
		pushPayload(
			session_secure_id: $session_secure_id
			events: $events
			messages: $messages
			resources: $resources
			web_socket_events: $web_socket_events
			errors: $errors
			is_beacon: $is_beacon
			has_session_unloaded: $has_session_unloaded
			highlight_logs: $highlight_logs
			payload_id: $payload_id
		)
	}
`
export const IdentifySessionDocument = gql`
	mutation identifySession(
		$session_secure_id: String!
		$user_identifier: String!
		$user_object: Any
	) {
		identifySession(
			session_secure_id: $session_secure_id
			user_identifier: $user_identifier
			user_object: $user_object
		)
	}
`
export const AddSessionPropertiesDocument = gql`
	mutation addSessionProperties(
		$session_secure_id: String!
		$properties_object: Any
	) {
		addSessionProperties(
			session_secure_id: $session_secure_id
			properties_object: $properties_object
		)
	}
`
export const PushMetricsDocument = gql`
	mutation pushMetrics($metrics: [MetricInput]!) {
		pushMetrics(metrics: $metrics)
	}
`
export const AddSessionFeedbackDocument = gql`
	mutation addSessionFeedback(
		$session_secure_id: String!
		$user_name: String
		$user_email: String
		$verbatim: String!
		$timestamp: Timestamp!
	) {
		addSessionFeedback(
			session_secure_id: $session_secure_id
			user_name: $user_name
			user_email: $user_email
			verbatim: $verbatim
			timestamp: $timestamp
		)
	}
`
export const InitializeSessionDocument = gql`
	mutation initializeSession(
		$session_secure_id: String!
		$organization_verbose_id: String!
		$enable_strict_privacy: Boolean!
		$enable_recording_network_contents: Boolean!
		$clientVersion: String!
		$firstloadVersion: String!
		$clientConfig: String!
		$environment: String!
		$id: String!
		$appVersion: String
		$client_id: String!
		$network_recording_domains: [String!]
		$disable_session_recording: Boolean
	) {
		initializeSession(
			session_secure_id: $session_secure_id
			organization_verbose_id: $organization_verbose_id
			enable_strict_privacy: $enable_strict_privacy
			enable_recording_network_contents: $enable_recording_network_contents
			clientVersion: $clientVersion
			firstloadVersion: $firstloadVersion
			clientConfig: $clientConfig
			environment: $environment
			appVersion: $appVersion
			fingerprint: $id
			client_id: $client_id
			network_recording_domains: $network_recording_domains
			disable_session_recording: $disable_session_recording
		) {
			secure_id
			project_id
		}
	}
`
export const IgnoreDocument = gql`
	query Ignore($id: ID!) {
		ignore(id: $id)
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
		PushPayload(
			variables: PushPayloadMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<PushPayloadMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<PushPayloadMutation>(
						PushPayloadDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'PushPayload',
				'mutation',
			)
		},
		identifySession(
			variables: IdentifySessionMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<IdentifySessionMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<IdentifySessionMutation>(
						IdentifySessionDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'identifySession',
				'mutation',
			)
		},
		addSessionProperties(
			variables: AddSessionPropertiesMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<AddSessionPropertiesMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<AddSessionPropertiesMutation>(
						AddSessionPropertiesDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'addSessionProperties',
				'mutation',
			)
		},
		pushMetrics(
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
				'pushMetrics',
				'mutation',
			)
		},
		addSessionFeedback(
			variables: AddSessionFeedbackMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<AddSessionFeedbackMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<AddSessionFeedbackMutation>(
						AddSessionFeedbackDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'addSessionFeedback',
				'mutation',
			)
		},
		initializeSession(
			variables: InitializeSessionMutationVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<InitializeSessionMutation> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<InitializeSessionMutation>(
						InitializeSessionDocument,
						variables,
						{ ...requestHeaders, ...wrappedRequestHeaders },
					),
				'initializeSession',
				'mutation',
			)
		},
		Ignore(
			variables: IgnoreQueryVariables,
			requestHeaders?: Dom.RequestInit['headers'],
		): Promise<IgnoreQuery> {
			return withWrapper(
				(wrappedRequestHeaders) =>
					client.request<IgnoreQuery>(IgnoreDocument, variables, {
						...requestHeaders,
						...wrappedRequestHeaders,
					}),
				'Ignore',
				'query',
			)
		},
	}
}
export type Sdk = ReturnType<typeof getSdk>
