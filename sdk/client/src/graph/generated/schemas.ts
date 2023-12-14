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
	environment: Scalars['String']
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
	parent_span_id?: InputMaybe<Scalars['String']>
	session_secure_id: Scalars['String']
	span_id?: InputMaybe<Scalars['String']>
	tags?: InputMaybe<Array<MetricTag>>
	timestamp: Scalars['Timestamp']
	trace_id?: InputMaybe<Scalars['String']>
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
	privacy_setting?: InputMaybe<Scalars['String']>
	serviceName?: InputMaybe<Scalars['String']>
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
