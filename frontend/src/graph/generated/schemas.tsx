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
	Int64: number
	Map: any
	StringArray: string[]
	Timestamp: string
	UInt64: any
	Upload: any
}

export type Account = {
	__typename?: 'Account'
	email: Scalars['String']
	id: Scalars['ID']
	member_count: Scalars['Int']
	member_limit?: Maybe<Scalars['Int']>
	name: Scalars['String']
	paid_prev: Scalars['Int']
	paid_prev_prev: Scalars['Int']
	plan_tier: Scalars['String']
	session_count_cur: Scalars['Int']
	session_count_prev: Scalars['Int']
	session_count_prev_prev: Scalars['Int']
	session_limit: Scalars['Int']
	stripe_customer_id: Scalars['String']
	subscription_start?: Maybe<Scalars['Timestamp']>
	unlimited_members: Scalars['Boolean']
	view_count_cur: Scalars['Int']
	view_count_prev: Scalars['Int']
}

export type AccountDetails = {
	__typename?: 'AccountDetails'
	id: Scalars['ID']
	members: Array<AccountDetailsMember>
	name: Scalars['String']
	session_count_per_day?: Maybe<Array<Maybe<NamedCount>>>
	session_count_per_month?: Maybe<Array<Maybe<NamedCount>>>
	stripe_customer_id: Scalars['String']
}

export type AccountDetailsMember = {
	__typename?: 'AccountDetailsMember'
	email: Scalars['String']
	id: Scalars['ID']
	last_active?: Maybe<Scalars['Timestamp']>
	name: Scalars['String']
}

export type Admin = {
	__typename?: 'Admin'
	about_you_details_filled?: Maybe<Scalars['Boolean']>
	email: Scalars['String']
	email_verified?: Maybe<Scalars['Boolean']>
	id: Scalars['ID']
	name: Scalars['String']
	phone?: Maybe<Scalars['String']>
	photo_url?: Maybe<Scalars['String']>
	referral?: Maybe<Scalars['String']>
	slack_im_channel_id?: Maybe<Scalars['String']>
	uid: Scalars['String']
	user_defined_persona?: Maybe<Scalars['String']>
	user_defined_role?: Maybe<Scalars['String']>
}

export type AdminAboutYouDetails = {
	first_name: Scalars['String']
	last_name: Scalars['String']
	phone?: InputMaybe<Scalars['String']>
	referral: Scalars['String']
	user_defined_persona: Scalars['String']
	user_defined_role: Scalars['String']
}

export type AdminAndWorkspaceDetails = {
	allowed_auto_join_email_origins?: InputMaybe<Scalars['String']>
	first_name: Scalars['String']
	last_name: Scalars['String']
	promo_code?: InputMaybe<Scalars['String']>
	referral: Scalars['String']
	user_defined_role: Scalars['String']
	workspace_name: Scalars['String']
}

export enum AdminRole {
	Admin = 'ADMIN',
	Member = 'MEMBER',
}

export type AverageSessionLength = {
	__typename?: 'AverageSessionLength'
	length: Scalars['Float']
}

export type BillingDetails = {
	__typename?: 'BillingDetails'
	errorsMeter: Scalars['Int64']
	membersMeter: Scalars['Int64']
	meter: Scalars['Int64']
	plan: Plan
	sessionsOutOfQuota: Scalars['Int64']
}

export type CategoryHistogramBucket = {
	__typename?: 'CategoryHistogramBucket'
	category: Scalars['String']
	count: Scalars['Int']
}

export type CategoryHistogramPayload = {
	__typename?: 'CategoryHistogramPayload'
	buckets: Array<CategoryHistogramBucket>
}

export type ClickUpFolder = {
	__typename?: 'ClickUpFolder'
	id: Scalars['String']
	lists: Array<ClickUpList>
	name: Scalars['String']
}

export type ClickUpList = {
	__typename?: 'ClickUpList'
	id: Scalars['String']
	name: Scalars['String']
}

export type ClickUpProjectMapping = {
	__typename?: 'ClickUpProjectMapping'
	clickup_space_id: Scalars['String']
	project_id: Scalars['ID']
}

export type ClickUpProjectMappingInput = {
	clickup_space_id: Scalars['String']
	project_id: Scalars['ID']
}

export type ClickUpSpace = {
	__typename?: 'ClickUpSpace'
	id: Scalars['String']
	name: Scalars['String']
}

export type ClickUpTask = {
	__typename?: 'ClickUpTask'
	id: Scalars['String']
	name: Scalars['String']
}

export type ClickUpTeam = {
	__typename?: 'ClickUpTeam'
	id: Scalars['String']
	name: Scalars['String']
	spaces: Array<ClickUpSpace>
}

export type CommentReply = {
	__typename?: 'CommentReply'
	author: SanitizedAdmin
	created_at: Scalars['Timestamp']
	id: Scalars['ID']
	text: Scalars['String']
	updated_at: Scalars['Timestamp']
}

export type DailyErrorCount = {
	__typename?: 'DailyErrorCount'
	count: Scalars['Int64']
	date: Scalars['Timestamp']
	project_id: Scalars['ID']
}

export type DailySessionCount = {
	__typename?: 'DailySessionCount'
	count: Scalars['Int64']
	date: Scalars['Timestamp']
	project_id: Scalars['ID']
}

export type Dashboard = {
	__typename?: 'Dashboard'
	id: Scalars['ID']
	last_admin_to_edit_id: Scalars['ID']
	layout: Scalars['String']
	name: Scalars['String']
	project_id: Scalars['ID']
}

export enum DashboardChartType {
	Histogram = 'Histogram',
	Timeline = 'Timeline',
	TimelineBar = 'TimelineBar',
}

export type DashboardDefinition = {
	__typename?: 'DashboardDefinition'
	id: Scalars['ID']
	is_default?: Maybe<Scalars['Boolean']>
	last_admin_to_edit_id?: Maybe<Scalars['Int']>
	layout?: Maybe<Scalars['String']>
	metrics: Array<DashboardMetricConfig>
	name: Scalars['String']
	project_id: Scalars['ID']
	updated_at: Scalars['Timestamp']
}

export type DashboardMetricConfig = {
	__typename?: 'DashboardMetricConfig'
	aggregator?: Maybe<MetricAggregator>
	chart_type?: Maybe<DashboardChartType>
	component_type?: Maybe<MetricViewComponentType>
	description: Scalars['String']
	filters?: Maybe<Array<MetricTagFilter>>
	groups?: Maybe<Array<Scalars['String']>>
	help_article?: Maybe<Scalars['String']>
	max_good_value?: Maybe<Scalars['Float']>
	max_needs_improvement_value?: Maybe<Scalars['Float']>
	max_percentile?: Maybe<Scalars['Float']>
	max_value?: Maybe<Scalars['Float']>
	min_percentile?: Maybe<Scalars['Float']>
	min_value?: Maybe<Scalars['Float']>
	name: Scalars['String']
	poor_value?: Maybe<Scalars['Float']>
	units?: Maybe<Scalars['String']>
}

export type DashboardMetricConfigInput = {
	aggregator?: InputMaybe<MetricAggregator>
	chart_type?: InputMaybe<DashboardChartType>
	component_type?: InputMaybe<MetricViewComponentType>
	description: Scalars['String']
	filters?: InputMaybe<Array<MetricTagFilterInput>>
	groups?: InputMaybe<Array<Scalars['String']>>
	help_article?: InputMaybe<Scalars['String']>
	max_good_value?: InputMaybe<Scalars['Float']>
	max_needs_improvement_value?: InputMaybe<Scalars['Float']>
	max_percentile?: InputMaybe<Scalars['Float']>
	max_value?: InputMaybe<Scalars['Float']>
	min_percentile?: InputMaybe<Scalars['Float']>
	min_value?: InputMaybe<Scalars['Float']>
	name: Scalars['String']
	poor_value?: InputMaybe<Scalars['Float']>
	units?: InputMaybe<Scalars['String']>
}

export type DashboardParamsInput = {
	aggregator?: InputMaybe<MetricAggregator>
	date_range?: InputMaybe<DateRangeInput>
	filters?: InputMaybe<Array<MetricTagFilterInput>>
	groups?: InputMaybe<Array<Scalars['String']>>
	resolution_minutes?: InputMaybe<Scalars['Int']>
	timezone?: InputMaybe<Scalars['String']>
	units?: InputMaybe<Scalars['String']>
}

export type DashboardPayload = {
	__typename?: 'DashboardPayload'
	aggregator?: Maybe<MetricAggregator>
	date: Scalars['String']
	group?: Maybe<Scalars['String']>
	value: Scalars['Float']
}

export type DateHistogramBucketSize = {
	calendar_interval: OpenSearchCalendarInterval
	multiple: Scalars['Int']
}

export type DateHistogramOptions = {
	bounds: DateRangeInput
	bucket_size: DateHistogramBucketSize
	time_zone: Scalars['String']
}

export type DateRange = {
	__typename?: 'DateRange'
	end_date?: Maybe<Scalars['Timestamp']>
	start_date?: Maybe<Scalars['Timestamp']>
}

export type DateRangeInput = {
	end_date?: InputMaybe<Scalars['Timestamp']>
	start_date?: InputMaybe<Scalars['Timestamp']>
}

export type DateRangeRequiredInput = {
	end_date: Scalars['Timestamp']
	start_date: Scalars['Timestamp']
}

export type DiscordChannel = {
	__typename?: 'DiscordChannel'
	id: Scalars['String']
	name: Scalars['String']
}

export type DiscordChannelInput = {
	id: Scalars['String']
	name: Scalars['String']
}

export enum EmailOptOutCategory {
	All = 'All',
	Billing = 'Billing',
	Digests = 'Digests',
}

export type EnhancedUserDetailsResult = {
	__typename?: 'EnhancedUserDetailsResult'
	avatar?: Maybe<Scalars['String']>
	bio?: Maybe<Scalars['String']>
	email?: Maybe<Scalars['String']>
	id?: Maybe<Scalars['ID']>
	name?: Maybe<Scalars['String']>
	socials?: Maybe<Array<Maybe<SocialLink>>>
}

export type ErrorAlert = {
	__typename?: 'ErrorAlert'
	ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>
	CountThreshold: Scalars['Int']
	DailyFrequency: Array<Maybe<Scalars['Int64']>>
	DiscordChannelsToNotify: Array<DiscordChannel>
	EmailsToNotify: Array<Maybe<Scalars['String']>>
	ExcludedEnvironments: Array<Maybe<Scalars['String']>>
	Frequency: Scalars['Int']
	LastAdminToEditID?: Maybe<Scalars['ID']>
	Name?: Maybe<Scalars['String']>
	RegexGroups: Array<Maybe<Scalars['String']>>
	ThresholdWindow?: Maybe<Scalars['Int']>
	Type: Scalars['String']
	WebhookDestinations: Array<WebhookDestination>
	disabled: Scalars['Boolean']
	id: Scalars['ID']
	updated_at: Scalars['Timestamp']
}

export type ErrorComment = {
	__typename?: 'ErrorComment'
	attachments: Array<Maybe<ExternalAttachment>>
	author: SanitizedAdmin
	created_at: Scalars['Timestamp']
	error_id: Scalars['Int']
	error_secure_id: Scalars['String']
	id: Scalars['ID']
	project_id: Scalars['ID']
	replies: Array<Maybe<CommentReply>>
	text: Scalars['String']
	updated_at: Scalars['Timestamp']
}

export type ErrorDistributionItem = {
	__typename?: 'ErrorDistributionItem'
	date: Scalars['Timestamp']
	error_group_id: Scalars['ID']
	name: Scalars['String']
	value: Scalars['Int64']
}

export type ErrorField = {
	__typename?: 'ErrorField'
	name: Scalars['String']
	project_id?: Maybe<Scalars['Int']>
	value: Scalars['String']
}

export type ErrorGroup = {
	__typename?: 'ErrorGroup'
	created_at: Scalars['Timestamp']
	environments?: Maybe<Scalars['String']>
	error_frequency: Array<Scalars['Int64']>
	error_metrics: Array<ErrorDistributionItem>
	event: Array<Maybe<Scalars['String']>>
	fields?: Maybe<Array<Maybe<ErrorField>>>
	first_occurrence?: Maybe<Scalars['Timestamp']>
	id: Scalars['ID']
	is_public: Scalars['Boolean']
	last_occurrence?: Maybe<Scalars['Timestamp']>
	mapped_stack_trace?: Maybe<Scalars['String']>
	metadata_log: Array<Maybe<ErrorMetadata>>
	project_id: Scalars['Int']
	secure_id: Scalars['String']
	snoozed_until?: Maybe<Scalars['Timestamp']>
	stack_trace?: Maybe<Scalars['String']>
	state: ErrorState
	structured_stack_trace: Array<Maybe<ErrorTrace>>
	type: Scalars['String']
	updated_at: Scalars['Timestamp']
	viewed?: Maybe<Scalars['Boolean']>
}

export type ErrorGroupFrequenciesParamsInput = {
	date_range: DateRangeRequiredInput
	resolution_minutes: Scalars['Int']
}

export type ErrorGroupTagAggregation = {
	__typename?: 'ErrorGroupTagAggregation'
	buckets: Array<ErrorGroupTagAggregationBucket>
	key: Scalars['String']
}

export type ErrorGroupTagAggregationBucket = {
	__typename?: 'ErrorGroupTagAggregationBucket'
	doc_count: Scalars['Int64']
	key: Scalars['String']
	percent: Scalars['Float']
}

export type ErrorInstance = {
	__typename?: 'ErrorInstance'
	error_object: ErrorObject
	next_id?: Maybe<Scalars['ID']>
	previous_id?: Maybe<Scalars['ID']>
}

export type ErrorMetadata = {
	__typename?: 'ErrorMetadata'
	browser?: Maybe<Scalars['String']>
	environment?: Maybe<Scalars['String']>
	error_id: Scalars['Int']
	fingerprint: Scalars['String']
	identifier?: Maybe<Scalars['String']>
	os?: Maybe<Scalars['String']>
	payload?: Maybe<Scalars['String']>
	request_id?: Maybe<Scalars['String']>
	session_id: Scalars['Int']
	session_secure_id: Scalars['String']
	timestamp?: Maybe<Scalars['Timestamp']>
	user_properties?: Maybe<Scalars['String']>
	visited_url?: Maybe<Scalars['String']>
}

export type ErrorObject = {
	__typename?: 'ErrorObject'
	browser?: Maybe<Scalars['String']>
	columnNumber?: Maybe<Scalars['Int']>
	created_at: Scalars['Timestamp']
	environment?: Maybe<Scalars['String']>
	error_group_id: Scalars['Int']
	error_group_secure_id: Scalars['String']
	event: Array<Maybe<Scalars['String']>>
	id: Scalars['ID']
	lineNumber?: Maybe<Scalars['Int']>
	log_cursor?: Maybe<Scalars['String']>
	os?: Maybe<Scalars['String']>
	payload?: Maybe<Scalars['String']>
	project_id: Scalars['Int']
	request_id?: Maybe<Scalars['String']>
	session?: Maybe<Session>
	session_id?: Maybe<Scalars['Int']>
	source?: Maybe<Scalars['String']>
	span_id?: Maybe<Scalars['String']>
	stack_trace: Scalars['String']
	structured_stack_trace: Array<Maybe<ErrorTrace>>
	timestamp: Scalars['Timestamp']
	trace_id?: Maybe<Scalars['String']>
	type: Scalars['String']
	url: Scalars['String']
}

export type ErrorResults = {
	__typename?: 'ErrorResults'
	error_groups: Array<ErrorGroup>
	totalCount: Scalars['Int64']
}

export type ErrorSearchParams = {
	__typename?: 'ErrorSearchParams'
	browser?: Maybe<Scalars['String']>
	date_range?: Maybe<DateRange>
	event?: Maybe<Scalars['String']>
	os?: Maybe<Scalars['String']>
	query?: Maybe<Scalars['String']>
	state?: Maybe<ErrorState>
	visited_url?: Maybe<Scalars['String']>
}

export type ErrorSearchParamsInput = {
	browser?: InputMaybe<Scalars['String']>
	date_range?: InputMaybe<DateRangeInput>
	event?: InputMaybe<Scalars['String']>
	os?: InputMaybe<Scalars['String']>
	query?: InputMaybe<Scalars['String']>
	state?: InputMaybe<ErrorState>
	type?: InputMaybe<Scalars['String']>
	visited_url?: InputMaybe<Scalars['String']>
}

export type ErrorSegment = {
	__typename?: 'ErrorSegment'
	id: Scalars['ID']
	name: Scalars['String']
	params: ErrorSearchParams
	project_id: Scalars['ID']
}

export enum ErrorState {
	Ignored = 'IGNORED',
	Open = 'OPEN',
	Resolved = 'RESOLVED',
}

export type ErrorTrace = {
	__typename?: 'ErrorTrace'
	columnNumber?: Maybe<Scalars['Int']>
	error?: Maybe<Scalars['String']>
	fileName?: Maybe<Scalars['String']>
	functionName?: Maybe<Scalars['String']>
	lineContent?: Maybe<Scalars['String']>
	lineNumber?: Maybe<Scalars['Int']>
	linesAfter?: Maybe<Scalars['String']>
	linesBefore?: Maybe<Scalars['String']>
	sourceMappingErrorMetadata?: Maybe<SourceMappingError>
}

export type ErrorsHistogram = {
	__typename?: 'ErrorsHistogram'
	bucket_times: Array<Scalars['Timestamp']>
	error_objects: Array<Scalars['Int64']>
}

export type EventChunk = {
	__typename?: 'EventChunk'
	chunk_index: Scalars['Int']
	session_id: Scalars['Int']
	timestamp: Scalars['Int64']
}

export type ExternalAttachment = {
	__typename?: 'ExternalAttachment'
	error_comment_id?: Maybe<Scalars['Int']>
	external_id: Scalars['String']
	id: Scalars['ID']
	integration_type: IntegrationType
	session_comment_id?: Maybe<Scalars['Int']>
	title?: Maybe<Scalars['String']>
}

export type Field = {
	__typename?: 'Field'
	id: Scalars['Int64']
	name: Scalars['String']
	type?: Maybe<Scalars['String']>
	value: Scalars['String']
}

export type HeightList = {
	__typename?: 'HeightList'
	id: Scalars['String']
	name: Scalars['String']
	type: Scalars['String']
}

export type HeightTask = {
	__typename?: 'HeightTask'
	id: Scalars['String']
	name: Scalars['String']
}

export type HeightWorkspace = {
	__typename?: 'HeightWorkspace'
	id: Scalars['String']
	model: Scalars['String']
	name: Scalars['String']
	url: Scalars['String']
}

export type HistogramBucket = {
	__typename?: 'HistogramBucket'
	bucket: Scalars['Float']
	count: Scalars['Int']
	range_end: Scalars['Float']
	range_start: Scalars['Float']
}

export type HistogramParamsInput = {
	buckets?: InputMaybe<Scalars['Int']>
	date_range?: InputMaybe<DateRangeInput>
	filters?: InputMaybe<Array<MetricTagFilterInput>>
	max_percentile?: InputMaybe<Scalars['Float']>
	max_value?: InputMaybe<Scalars['Float']>
	min_percentile?: InputMaybe<Scalars['Float']>
	min_value?: InputMaybe<Scalars['Float']>
	units?: InputMaybe<Scalars['String']>
}

export type HistogramPayload = {
	__typename?: 'HistogramPayload'
	buckets: Array<HistogramBucket>
	max: Scalars['Float']
	min: Scalars['Float']
}

export type IntegrationProjectMapping = {
	__typename?: 'IntegrationProjectMapping'
	external_id: Scalars['String']
	project_id: Scalars['ID']
}

export type IntegrationProjectMappingInput = {
	external_id: Scalars['String']
	project_id: Scalars['ID']
}

export type IntegrationStatus = {
	__typename?: 'IntegrationStatus'
	createdAt?: Maybe<Scalars['Timestamp']>
	integrated: Scalars['Boolean']
	resourceSecureId?: Maybe<Scalars['String']>
	resourceType: Scalars['String']
}

export enum IntegrationType {
	ClickUp = 'ClickUp',
	Discord = 'Discord',
	Front = 'Front',
	Height = 'Height',
	Linear = 'Linear',
	Slack = 'Slack',
	Vercel = 'Vercel',
	Zapier = 'Zapier',
}

export type Invoice = {
	__typename?: 'Invoice'
	amountDue?: Maybe<Scalars['Int64']>
	amountPaid?: Maybe<Scalars['Int64']>
	attemptCount?: Maybe<Scalars['Int64']>
	date?: Maybe<Scalars['Timestamp']>
	status?: Maybe<Scalars['String']>
	url?: Maybe<Scalars['String']>
}

export type LengthRange = {
	__typename?: 'LengthRange'
	max?: Maybe<Scalars['Float']>
	min?: Maybe<Scalars['Float']>
}

export type LengthRangeInput = {
	max?: InputMaybe<Scalars['Float']>
	min?: InputMaybe<Scalars['Float']>
}

export type LinearTeam = {
	__typename?: 'LinearTeam'
	key: Scalars['String']
	name: Scalars['String']
	team_id: Scalars['String']
}

export type Log = {
	__typename?: 'Log'
	level: LogLevel
	logAttributes: Scalars['Map']
	message: Scalars['String']
	secureSessionID?: Maybe<Scalars['String']>
	serviceName?: Maybe<Scalars['String']>
	source?: Maybe<Scalars['String']>
	spanID?: Maybe<Scalars['String']>
	timestamp: Scalars['Timestamp']
	traceID?: Maybe<Scalars['String']>
}

export type LogAlert = {
	__typename?: 'LogAlert'
	BelowThreshold: Scalars['Boolean']
	ChannelsToNotify: Array<SanitizedSlackChannel>
	CountThreshold: Scalars['Int']
	DailyFrequency: Array<Maybe<Scalars['Int64']>>
	DiscordChannelsToNotify: Array<DiscordChannel>
	EmailsToNotify: Array<Scalars['String']>
	ExcludedEnvironments: Array<Scalars['String']>
	LastAdminToEditID?: Maybe<Scalars['ID']>
	Name: Scalars['String']
	ThresholdWindow: Scalars['Int']
	Type: Scalars['String']
	WebhookDestinations: Array<WebhookDestination>
	disabled: Scalars['Boolean']
	id: Scalars['ID']
	query: Scalars['String']
	updated_at: Scalars['Timestamp']
}

export type LogAlertInput = {
	below_threshold: Scalars['Boolean']
	count_threshold: Scalars['Int']
	disabled: Scalars['Boolean']
	discord_channels: Array<DiscordChannelInput>
	emails: Array<Scalars['String']>
	environments: Array<Scalars['String']>
	name: Scalars['String']
	project_id: Scalars['ID']
	query: Scalars['String']
	slack_channels: Array<SanitizedSlackChannelInput>
	threshold_window: Scalars['Int']
	webhook_destinations: Array<WebhookDestinationInput>
}

export enum LogDirection {
	Asc = 'ASC',
	Desc = 'DESC',
}

export type LogEdge = {
	__typename?: 'LogEdge'
	cursor: Scalars['String']
	node: Log
}

export type LogKey = {
	__typename?: 'LogKey'
	name: Scalars['String']
	type: LogKeyType
}

export enum LogKeyType {
	String = 'String',
}

export enum LogLevel {
	Debug = 'debug',
	Error = 'error',
	Fatal = 'fatal',
	Info = 'info',
	Trace = 'trace',
	Warn = 'warn',
}

export enum LogSource {
	Backend = 'backend',
	Frontend = 'frontend',
}

export type LogsConnection = {
	__typename?: 'LogsConnection'
	edges: Array<LogEdge>
	pageInfo: PageInfo
}

export type LogsHistogram = {
	__typename?: 'LogsHistogram'
	buckets: Array<LogsHistogramBucket>
	totalCount: Scalars['UInt64']
}

export type LogsHistogramBucket = {
	__typename?: 'LogsHistogramBucket'
	bucketId: Scalars['UInt64']
	counts: Array<LogsHistogramBucketCount>
}

export type LogsHistogramBucketCount = {
	__typename?: 'LogsHistogramBucketCount'
	count: Scalars['UInt64']
	level: LogLevel
}

export type LogsParamsInput = {
	date_range: DateRangeRequiredInput
	query: Scalars['String']
}

export type Metric = {
	__typename?: 'Metric'
	name: Scalars['String']
	value: Scalars['Float']
}

export enum MetricAggregator {
	Avg = 'Avg',
	Count = 'Count',
	Max = 'Max',
	P50 = 'P50',
	P75 = 'P75',
	P90 = 'P90',
	P95 = 'P95',
	P99 = 'P99',
	Sum = 'Sum',
}

export type MetricMonitor = {
	__typename?: 'MetricMonitor'
	aggregator: MetricAggregator
	channels_to_notify: Array<Maybe<SanitizedSlackChannel>>
	disabled: Scalars['Boolean']
	discord_channels_to_notify: Array<DiscordChannel>
	emails_to_notify: Array<Maybe<Scalars['String']>>
	filters?: Maybe<Array<MetricTagFilter>>
	id: Scalars['ID']
	last_admin_to_edit_id: Scalars['ID']
	metric_to_monitor: Scalars['String']
	name: Scalars['String']
	period_minutes?: Maybe<Scalars['Int']>
	threshold: Scalars['Float']
	units?: Maybe<Scalars['String']>
	updated_at: Scalars['Timestamp']
	webhook_destinations: Array<WebhookDestination>
}

export type MetricPreview = {
	__typename?: 'MetricPreview'
	date: Scalars['Timestamp']
	value: Scalars['Float']
}

export type MetricTagFilter = {
	__typename?: 'MetricTagFilter'
	op: MetricTagFilterOp
	tag: Scalars['String']
	value: Scalars['String']
}

export type MetricTagFilterInput = {
	op: MetricTagFilterOp
	tag: Scalars['String']
	value: Scalars['String']
}

export enum MetricTagFilterOp {
	Contains = 'contains',
	Equals = 'equals',
}

export enum MetricViewComponentType {
	ActiveUsersTable = 'ActiveUsersTable',
	ErrorCountChart = 'ErrorCountChart',
	KeyPerformanceGauge = 'KeyPerformanceGauge',
	RageClicksTable = 'RageClicksTable',
	ReferrersTable = 'ReferrersTable',
	SessionCountChart = 'SessionCountChart',
	TopRoutesTable = 'TopRoutesTable',
}

export type Mutation = {
	__typename?: 'Mutation'
	addAdminToWorkspace?: Maybe<Scalars['ID']>
	addIntegrationToProject: Scalars['Boolean']
	addIntegrationToWorkspace: Scalars['Boolean']
	changeAdminRole: Scalars['Boolean']
	createAdmin: Admin
	createErrorAlert?: Maybe<ErrorAlert>
	createErrorComment?: Maybe<ErrorComment>
	createErrorSegment?: Maybe<ErrorSegment>
	createIssueForErrorComment?: Maybe<ErrorComment>
	createIssueForSessionComment?: Maybe<SessionComment>
	createLogAlert?: Maybe<LogAlert>
	createMetricMonitor?: Maybe<MetricMonitor>
	createOrUpdateStripeSubscription?: Maybe<Scalars['String']>
	createProject?: Maybe<Project>
	createSegment?: Maybe<Segment>
	createSessionAlert?: Maybe<SessionAlert>
	createSessionComment?: Maybe<SessionComment>
	createWorkspace?: Maybe<Workspace>
	deleteAdminFromProject?: Maybe<Scalars['ID']>
	deleteAdminFromWorkspace?: Maybe<Scalars['ID']>
	deleteDashboard: Scalars['Boolean']
	deleteErrorAlert?: Maybe<ErrorAlert>
	deleteErrorComment?: Maybe<Scalars['Boolean']>
	deleteErrorSegment?: Maybe<Scalars['Boolean']>
	deleteLogAlert?: Maybe<LogAlert>
	deleteMetricMonitor?: Maybe<MetricMonitor>
	deleteProject?: Maybe<Scalars['Boolean']>
	deleteSegment?: Maybe<Scalars['Boolean']>
	deleteSessionAlert?: Maybe<SessionAlert>
	deleteSessionComment?: Maybe<Scalars['Boolean']>
	deleteSessions: Scalars['Boolean']
	editErrorSegment?: Maybe<Scalars['Boolean']>
	editProject?: Maybe<Project>
	editSegment?: Maybe<Scalars['Boolean']>
	editWorkspace?: Maybe<Workspace>
	emailSignup: Scalars['String']
	joinWorkspace?: Maybe<Scalars['ID']>
	markErrorGroupAsViewed?: Maybe<ErrorGroup>
	markSessionAsStarred?: Maybe<Session>
	markSessionAsViewed?: Maybe<Session>
	modifyClearbitIntegration?: Maybe<Scalars['Boolean']>
	muteErrorCommentThread?: Maybe<Scalars['Boolean']>
	muteSessionCommentThread?: Maybe<Scalars['Boolean']>
	removeErrorIssue?: Maybe<Scalars['Boolean']>
	removeIntegrationFromProject: Scalars['Boolean']
	removeIntegrationFromWorkspace: Scalars['Boolean']
	replyToErrorComment?: Maybe<CommentReply>
	replyToSessionComment?: Maybe<CommentReply>
	requestAccess?: Maybe<Scalars['Boolean']>
	sendAdminWorkspaceInvite?: Maybe<Scalars['String']>
	submitRegistrationForm?: Maybe<Scalars['Boolean']>
	syncSlackIntegration: SlackSyncResponse
	updateAdminAboutYouDetails: Scalars['Boolean']
	updateAdminAndCreateWorkspace?: Maybe<Project>
	updateAllowMeterOverage?: Maybe<Workspace>
	updateAllowedEmailOrigins?: Maybe<Scalars['ID']>
	updateBillingDetails?: Maybe<Scalars['Boolean']>
	updateClickUpProjectMappings: Scalars['Boolean']
	updateEmailOptOut: Scalars['Boolean']
	updateErrorAlert?: Maybe<ErrorAlert>
	updateErrorAlertIsDisabled?: Maybe<ErrorAlert>
	updateErrorGroupIsPublic?: Maybe<ErrorGroup>
	updateErrorGroupState?: Maybe<ErrorGroup>
	updateIntegrationProjectMappings: Scalars['Boolean']
	updateLogAlert?: Maybe<LogAlert>
	updateLogAlertIsDisabled?: Maybe<LogAlert>
	updateMetricMonitor?: Maybe<MetricMonitor>
	updateMetricMonitorIsDisabled?: Maybe<MetricMonitor>
	updateSessionAlert?: Maybe<SessionAlert>
	updateSessionAlertIsDisabled?: Maybe<SessionAlert>
	updateSessionIsPublic?: Maybe<Session>
	updateVercelProjectMappings: Scalars['Boolean']
	upsertDashboard: Scalars['ID']
}

export type MutationAddAdminToWorkspaceArgs = {
	invite_id: Scalars['String']
	workspace_id: Scalars['ID']
}

export type MutationAddIntegrationToProjectArgs = {
	code: Scalars['String']
	integration_type?: InputMaybe<IntegrationType>
	project_id: Scalars['ID']
}

export type MutationAddIntegrationToWorkspaceArgs = {
	code: Scalars['String']
	integration_type?: InputMaybe<IntegrationType>
	workspace_id: Scalars['ID']
}

export type MutationChangeAdminRoleArgs = {
	admin_id: Scalars['ID']
	new_role: Scalars['String']
	workspace_id: Scalars['ID']
}

export type MutationCreateErrorAlertArgs = {
	count_threshold: Scalars['Int']
	discord_channels: Array<DiscordChannelInput>
	emails: Array<InputMaybe<Scalars['String']>>
	environments: Array<InputMaybe<Scalars['String']>>
	frequency: Scalars['Int']
	name: Scalars['String']
	project_id: Scalars['ID']
	regex_groups: Array<InputMaybe<Scalars['String']>>
	slack_channels: Array<InputMaybe<SanitizedSlackChannelInput>>
	threshold_window: Scalars['Int']
	webhook_destinations: Array<WebhookDestinationInput>
}

export type MutationCreateErrorCommentArgs = {
	author_name: Scalars['String']
	error_group_secure_id: Scalars['String']
	error_url: Scalars['String']
	integrations: Array<InputMaybe<IntegrationType>>
	issue_description?: InputMaybe<Scalars['String']>
	issue_team_id?: InputMaybe<Scalars['String']>
	issue_title?: InputMaybe<Scalars['String']>
	project_id: Scalars['ID']
	tagged_admins: Array<InputMaybe<SanitizedAdminInput>>
	tagged_slack_users: Array<InputMaybe<SanitizedSlackChannelInput>>
	text: Scalars['String']
	text_for_email: Scalars['String']
}

export type MutationCreateErrorSegmentArgs = {
	name: Scalars['String']
	params: ErrorSearchParamsInput
	project_id: Scalars['ID']
}

export type MutationCreateIssueForErrorCommentArgs = {
	author_name: Scalars['String']
	error_comment_id: Scalars['Int']
	error_url: Scalars['String']
	integrations: Array<InputMaybe<IntegrationType>>
	issue_description?: InputMaybe<Scalars['String']>
	issue_team_id?: InputMaybe<Scalars['String']>
	issue_title?: InputMaybe<Scalars['String']>
	project_id: Scalars['ID']
	text_for_attachment: Scalars['String']
}

export type MutationCreateIssueForSessionCommentArgs = {
	author_name: Scalars['String']
	integrations: Array<InputMaybe<IntegrationType>>
	issue_description?: InputMaybe<Scalars['String']>
	issue_team_id?: InputMaybe<Scalars['String']>
	issue_title?: InputMaybe<Scalars['String']>
	project_id: Scalars['ID']
	session_comment_id: Scalars['Int']
	session_url: Scalars['String']
	text_for_attachment: Scalars['String']
	time: Scalars['Float']
}

export type MutationCreateLogAlertArgs = {
	input: LogAlertInput
}

export type MutationCreateMetricMonitorArgs = {
	aggregator: MetricAggregator
	discord_channels: Array<DiscordChannelInput>
	emails: Array<InputMaybe<Scalars['String']>>
	filters?: InputMaybe<Array<MetricTagFilterInput>>
	metric_to_monitor: Scalars['String']
	name: Scalars['String']
	periodMinutes?: InputMaybe<Scalars['Int']>
	project_id: Scalars['ID']
	slack_channels: Array<InputMaybe<SanitizedSlackChannelInput>>
	threshold: Scalars['Float']
	units?: InputMaybe<Scalars['String']>
	webhook_destinations: Array<WebhookDestinationInput>
}

export type MutationCreateOrUpdateStripeSubscriptionArgs = {
	interval: SubscriptionInterval
	plan_type: PlanType
	retention_period: RetentionPeriod
	workspace_id: Scalars['ID']
}

export type MutationCreateProjectArgs = {
	name: Scalars['String']
	workspace_id: Scalars['ID']
}

export type MutationCreateSegmentArgs = {
	name: Scalars['String']
	params: SearchParamsInput
	project_id: Scalars['ID']
}

export type MutationCreateSessionAlertArgs = {
	input: SessionAlertInput
}

export type MutationCreateSessionCommentArgs = {
	additional_context?: InputMaybe<Scalars['String']>
	author_name: Scalars['String']
	integrations: Array<InputMaybe<IntegrationType>>
	issue_description?: InputMaybe<Scalars['String']>
	issue_team_id?: InputMaybe<Scalars['String']>
	issue_title?: InputMaybe<Scalars['String']>
	project_id: Scalars['ID']
	session_image?: InputMaybe<Scalars['String']>
	session_secure_id: Scalars['String']
	session_timestamp: Scalars['Int']
	session_url: Scalars['String']
	tagged_admins: Array<InputMaybe<SanitizedAdminInput>>
	tagged_slack_users: Array<InputMaybe<SanitizedSlackChannelInput>>
	tags: Array<InputMaybe<SessionCommentTagInput>>
	text: Scalars['String']
	text_for_email: Scalars['String']
	time: Scalars['Float']
	x_coordinate: Scalars['Float']
	y_coordinate: Scalars['Float']
}

export type MutationCreateWorkspaceArgs = {
	name: Scalars['String']
	promo_code?: InputMaybe<Scalars['String']>
}

export type MutationDeleteAdminFromProjectArgs = {
	admin_id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationDeleteAdminFromWorkspaceArgs = {
	admin_id: Scalars['ID']
	workspace_id: Scalars['ID']
}

export type MutationDeleteDashboardArgs = {
	id: Scalars['ID']
}

export type MutationDeleteErrorAlertArgs = {
	error_alert_id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationDeleteErrorCommentArgs = {
	id: Scalars['ID']
}

export type MutationDeleteErrorSegmentArgs = {
	segment_id: Scalars['ID']
}

export type MutationDeleteLogAlertArgs = {
	id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationDeleteMetricMonitorArgs = {
	metric_monitor_id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationDeleteProjectArgs = {
	id: Scalars['ID']
}

export type MutationDeleteSegmentArgs = {
	segment_id: Scalars['ID']
}

export type MutationDeleteSessionAlertArgs = {
	project_id: Scalars['ID']
	session_alert_id: Scalars['ID']
}

export type MutationDeleteSessionCommentArgs = {
	id: Scalars['ID']
}

export type MutationDeleteSessionsArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
	sessionCount: Scalars['Int']
}

export type MutationEditErrorSegmentArgs = {
	id: Scalars['ID']
	name: Scalars['String']
	params: ErrorSearchParamsInput
	project_id: Scalars['ID']
}

export type MutationEditProjectArgs = {
	backend_domains?: InputMaybe<Scalars['StringArray']>
	billing_email?: InputMaybe<Scalars['String']>
	error_json_paths?: InputMaybe<Scalars['StringArray']>
	excluded_users?: InputMaybe<Scalars['StringArray']>
	id: Scalars['ID']
	name?: InputMaybe<Scalars['String']>
	rage_click_count?: InputMaybe<Scalars['Int']>
	rage_click_radius_pixels?: InputMaybe<Scalars['Int']>
	rage_click_window_seconds?: InputMaybe<Scalars['Int']>
}

export type MutationEditSegmentArgs = {
	id: Scalars['ID']
	name: Scalars['String']
	params: SearchParamsInput
	project_id: Scalars['ID']
}

export type MutationEditWorkspaceArgs = {
	id: Scalars['ID']
	name?: InputMaybe<Scalars['String']>
}

export type MutationEmailSignupArgs = {
	email: Scalars['String']
}

export type MutationJoinWorkspaceArgs = {
	workspace_id: Scalars['ID']
}

export type MutationMarkErrorGroupAsViewedArgs = {
	error_secure_id: Scalars['String']
	viewed?: InputMaybe<Scalars['Boolean']>
}

export type MutationMarkSessionAsStarredArgs = {
	secure_id: Scalars['String']
	starred?: InputMaybe<Scalars['Boolean']>
}

export type MutationMarkSessionAsViewedArgs = {
	secure_id: Scalars['String']
	viewed?: InputMaybe<Scalars['Boolean']>
}

export type MutationModifyClearbitIntegrationArgs = {
	enabled: Scalars['Boolean']
	workspace_id: Scalars['ID']
}

export type MutationMuteErrorCommentThreadArgs = {
	has_muted?: InputMaybe<Scalars['Boolean']>
	id: Scalars['ID']
}

export type MutationMuteSessionCommentThreadArgs = {
	has_muted?: InputMaybe<Scalars['Boolean']>
	id: Scalars['ID']
}

export type MutationRemoveErrorIssueArgs = {
	error_issue_id: Scalars['ID']
}

export type MutationRemoveIntegrationFromProjectArgs = {
	integration_type?: InputMaybe<IntegrationType>
	project_id: Scalars['ID']
}

export type MutationRemoveIntegrationFromWorkspaceArgs = {
	integration_type: IntegrationType
	workspace_id: Scalars['ID']
}

export type MutationReplyToErrorCommentArgs = {
	comment_id: Scalars['ID']
	errorURL: Scalars['String']
	tagged_admins: Array<InputMaybe<SanitizedAdminInput>>
	tagged_slack_users: Array<InputMaybe<SanitizedSlackChannelInput>>
	text: Scalars['String']
	text_for_email: Scalars['String']
}

export type MutationReplyToSessionCommentArgs = {
	comment_id: Scalars['ID']
	sessionURL: Scalars['String']
	tagged_admins: Array<InputMaybe<SanitizedAdminInput>>
	tagged_slack_users: Array<InputMaybe<SanitizedSlackChannelInput>>
	text: Scalars['String']
	text_for_email: Scalars['String']
}

export type MutationRequestAccessArgs = {
	project_id: Scalars['ID']
}

export type MutationSendAdminWorkspaceInviteArgs = {
	base_url: Scalars['String']
	email: Scalars['String']
	role: Scalars['String']
	workspace_id: Scalars['ID']
}

export type MutationSubmitRegistrationFormArgs = {
	heard_about: Scalars['String']
	pun?: InputMaybe<Scalars['String']>
	role: Scalars['String']
	team_size: Scalars['String']
	use_case: Scalars['String']
	workspace_id: Scalars['ID']
}

export type MutationSyncSlackIntegrationArgs = {
	project_id: Scalars['ID']
}

export type MutationUpdateAdminAboutYouDetailsArgs = {
	adminDetails: AdminAboutYouDetails
}

export type MutationUpdateAdminAndCreateWorkspaceArgs = {
	admin_and_workspace_details: AdminAndWorkspaceDetails
}

export type MutationUpdateAllowMeterOverageArgs = {
	allow_meter_overage: Scalars['Boolean']
	workspace_id: Scalars['ID']
}

export type MutationUpdateAllowedEmailOriginsArgs = {
	allowed_auto_join_email_origins: Scalars['String']
	workspace_id: Scalars['ID']
}

export type MutationUpdateBillingDetailsArgs = {
	workspace_id: Scalars['ID']
}

export type MutationUpdateClickUpProjectMappingsArgs = {
	project_mappings: Array<ClickUpProjectMappingInput>
	workspace_id: Scalars['ID']
}

export type MutationUpdateEmailOptOutArgs = {
	admin_id?: InputMaybe<Scalars['ID']>
	category: EmailOptOutCategory
	is_opt_out: Scalars['Boolean']
	token?: InputMaybe<Scalars['String']>
}

export type MutationUpdateErrorAlertArgs = {
	count_threshold?: InputMaybe<Scalars['Int']>
	disabled?: InputMaybe<Scalars['Boolean']>
	discord_channels: Array<DiscordChannelInput>
	emails?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
	environments?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
	error_alert_id: Scalars['ID']
	frequency?: InputMaybe<Scalars['Int']>
	name?: InputMaybe<Scalars['String']>
	project_id: Scalars['ID']
	regex_groups?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
	slack_channels?: InputMaybe<Array<InputMaybe<SanitizedSlackChannelInput>>>
	threshold_window?: InputMaybe<Scalars['Int']>
	webhook_destinations: Array<WebhookDestinationInput>
}

export type MutationUpdateErrorAlertIsDisabledArgs = {
	disabled: Scalars['Boolean']
	id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationUpdateErrorGroupIsPublicArgs = {
	error_group_secure_id: Scalars['String']
	is_public: Scalars['Boolean']
}

export type MutationUpdateErrorGroupStateArgs = {
	secure_id: Scalars['String']
	snoozed_until?: InputMaybe<Scalars['Timestamp']>
	state: Scalars['String']
}

export type MutationUpdateIntegrationProjectMappingsArgs = {
	integration_type: IntegrationType
	project_mappings: Array<IntegrationProjectMappingInput>
	workspace_id: Scalars['ID']
}

export type MutationUpdateLogAlertArgs = {
	id: Scalars['ID']
	input: LogAlertInput
}

export type MutationUpdateLogAlertIsDisabledArgs = {
	disabled: Scalars['Boolean']
	id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationUpdateMetricMonitorArgs = {
	aggregator?: InputMaybe<MetricAggregator>
	disabled?: InputMaybe<Scalars['Boolean']>
	discord_channels: Array<DiscordChannelInput>
	emails?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
	filters?: InputMaybe<Array<MetricTagFilterInput>>
	metric_monitor_id: Scalars['ID']
	metric_to_monitor?: InputMaybe<Scalars['String']>
	name?: InputMaybe<Scalars['String']>
	periodMinutes?: InputMaybe<Scalars['Int']>
	project_id: Scalars['ID']
	slack_channels?: InputMaybe<Array<InputMaybe<SanitizedSlackChannelInput>>>
	threshold?: InputMaybe<Scalars['Float']>
	units?: InputMaybe<Scalars['String']>
	webhook_destinations: Array<WebhookDestinationInput>
}

export type MutationUpdateMetricMonitorIsDisabledArgs = {
	disabled: Scalars['Boolean']
	id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationUpdateSessionAlertArgs = {
	id: Scalars['ID']
	input: SessionAlertInput
}

export type MutationUpdateSessionAlertIsDisabledArgs = {
	disabled: Scalars['Boolean']
	id: Scalars['ID']
	project_id: Scalars['ID']
}

export type MutationUpdateSessionIsPublicArgs = {
	is_public: Scalars['Boolean']
	session_secure_id: Scalars['String']
}

export type MutationUpdateVercelProjectMappingsArgs = {
	project_id: Scalars['ID']
	project_mappings: Array<VercelProjectMappingInput>
}

export type MutationUpsertDashboardArgs = {
	id?: InputMaybe<Scalars['ID']>
	is_default?: InputMaybe<Scalars['Boolean']>
	layout?: InputMaybe<Scalars['String']>
	metrics: Array<DashboardMetricConfigInput>
	name: Scalars['String']
	project_id: Scalars['ID']
}

export type NamedCount = {
	__typename?: 'NamedCount'
	count: Scalars['Int']
	name: Scalars['String']
}

export type NetworkHistogramParamsInput = {
	attribute?: InputMaybe<NetworkRequestAttribute>
	lookback_days?: InputMaybe<Scalars['Int']>
}

export enum NetworkRequestAttribute {
	BodySize = 'body_size',
	GraphqlOperation = 'graphql_operation',
	InitiatorType = 'initiator_type',
	Latency = 'latency',
	Method = 'method',
	RequestId = 'request_id',
	ResponseSize = 'response_size',
	Status = 'status',
	Url = 'url',
}

export type NewUsersCount = {
	__typename?: 'NewUsersCount'
	count: Scalars['Int64']
}

export type OAuthClient = {
	__typename?: 'OAuthClient'
	app_name: Scalars['String']
	created_at: Scalars['Timestamp']
	id: Scalars['String']
}

export enum OpenSearchCalendarInterval {
	Day = 'day',
	Hour = 'hour',
	Minute = 'minute',
	Month = 'month',
	Quarter = 'quarter',
	Week = 'week',
	Year = 'year',
}

export type PageInfo = {
	__typename?: 'PageInfo'
	endCursor: Scalars['String']
	hasNextPage: Scalars['Boolean']
	hasPreviousPage: Scalars['Boolean']
	startCursor: Scalars['String']
}

export type Plan = {
	__typename?: 'Plan'
	errorsLimit: Scalars['Int']
	interval: SubscriptionInterval
	membersLimit?: Maybe<Scalars['Int']>
	quota: Scalars['Int']
	type: PlanType
}

export enum PlanType {
	Basic = 'Basic',
	Enterprise = 'Enterprise',
	Free = 'Free',
	Lite = 'Lite',
	Startup = 'Startup',
}

export type Project = {
	__typename?: 'Project'
	backend_domains?: Maybe<Scalars['StringArray']>
	billing_email?: Maybe<Scalars['String']>
	error_json_paths?: Maybe<Scalars['StringArray']>
	excluded_users?: Maybe<Scalars['StringArray']>
	id: Scalars['ID']
	name: Scalars['String']
	rage_click_count?: Maybe<Scalars['Int']>
	rage_click_radius_pixels?: Maybe<Scalars['Int']>
	rage_click_window_seconds?: Maybe<Scalars['Int']>
	secret?: Maybe<Scalars['String']>
	verbose_id: Scalars['String']
	workspace_id: Scalars['ID']
}

export type Query = {
	__typename?: 'Query'
	account_details: AccountDetails
	accounts?: Maybe<Array<Maybe<Account>>>
	admin?: Maybe<Admin>
	adminHasCreatedComment?: Maybe<Scalars['Boolean']>
	admin_role?: Maybe<WorkspaceAdminRole>
	admin_role_by_project?: Maybe<WorkspaceAdminRole>
	api_key_to_org_id?: Maybe<Scalars['ID']>
	app_version_suggestion: Array<Maybe<Scalars['String']>>
	averageSessionLength?: Maybe<AverageSessionLength>
	billingDetails: BillingDetails
	billingDetailsForProject?: Maybe<BillingDetails>
	clickup_folderless_lists: Array<ClickUpList>
	clickup_folders: Array<ClickUpFolder>
	clickup_project_mappings: Array<ClickUpProjectMapping>
	clickup_teams: Array<ClickUpTeam>
	clientIntegration: IntegrationStatus
	customer_portal_url: Scalars['String']
	dailyErrorFrequency: Array<Scalars['Int64']>
	dailyErrorsCount: Array<Maybe<DailyErrorCount>>
	dailySessionsCount: Array<Maybe<DailySessionCount>>
	dashboard_definitions: Array<Maybe<DashboardDefinition>>
	discord_channel_suggestions: Array<DiscordChannel>
	email_opt_outs: Array<EmailOptOutCategory>
	enhanced_user_details?: Maybe<EnhancedUserDetailsResult>
	environment_suggestion?: Maybe<Array<Maybe<Field>>>
	errorDistribution: Array<Maybe<ErrorDistributionItem>>
	errorGroupFrequencies: Array<Maybe<ErrorDistributionItem>>
	errorGroupTags: Array<ErrorGroupTagAggregation>
	error_alerts: Array<Maybe<ErrorAlert>>
	error_comments: Array<Maybe<ErrorComment>>
	error_comments_for_admin: Array<Maybe<ErrorComment>>
	error_comments_for_project: Array<Maybe<ErrorComment>>
	error_field_suggestion?: Maybe<Array<Maybe<ErrorField>>>
	error_fields_opensearch: Array<Scalars['String']>
	error_group?: Maybe<ErrorGroup>
	error_groups_opensearch: ErrorResults
	error_instance?: Maybe<ErrorInstance>
	error_issue: Array<Maybe<ExternalAttachment>>
	error_object?: Maybe<ErrorObject>
	error_object_for_log?: Maybe<ErrorObject>
	error_segments?: Maybe<Array<Maybe<ErrorSegment>>>
	errors?: Maybe<Array<Maybe<ErrorObject>>>
	errors_histogram: ErrorsHistogram
	event_chunk_url: Scalars['String']
	event_chunks: Array<EventChunk>
	events?: Maybe<Array<Maybe<Scalars['Any']>>>
	field_suggestion?: Maybe<Array<Maybe<Field>>>
	field_types: Array<Field>
	fields_opensearch: Array<Scalars['String']>
	generate_zapier_access_token: Scalars['String']
	get_source_map_upload_urls: Array<Scalars['String']>
	height_lists: Array<HeightList>
	height_workspaces: Array<HeightWorkspace>
	identifier_suggestion: Array<Scalars['String']>
	integration_project_mappings: Array<IntegrationProjectMapping>
	isBackendIntegrated?: Maybe<Scalars['Boolean']>
	isIntegrated?: Maybe<Scalars['Boolean']>
	isSessionPending?: Maybe<Scalars['Boolean']>
	is_integrated_with: Scalars['Boolean']
	is_project_integrated_with: Scalars['Boolean']
	is_workspace_integrated_with: Scalars['Boolean']
	joinable_workspaces?: Maybe<Array<Maybe<Workspace>>>
	linear_teams?: Maybe<Array<LinearTeam>>
	liveUsersCount?: Maybe<Scalars['Int64']>
	log_alert: LogAlert
	log_alerts: Array<Maybe<LogAlert>>
	logs: LogsConnection
	logsIntegration: IntegrationStatus
	logs_error_objects: Array<ErrorObject>
	logs_histogram: LogsHistogram
	logs_key_values: Array<Scalars['String']>
	logs_keys: Array<LogKey>
	logs_total_count: Scalars['UInt64']
	messages?: Maybe<Array<Maybe<Scalars['Any']>>>
	metric_monitors: Array<Maybe<MetricMonitor>>
	metric_tag_values: Array<Scalars['String']>
	metric_tags: Array<Scalars['String']>
	metrics_histogram?: Maybe<HistogramPayload>
	metrics_timeline: Array<Maybe<DashboardPayload>>
	network_histogram?: Maybe<CategoryHistogramPayload>
	newUsersCount?: Maybe<NewUsersCount>
	new_session_alerts: Array<Maybe<SessionAlert>>
	new_user_alerts?: Maybe<Array<Maybe<SessionAlert>>>
	oauth_client_metadata?: Maybe<OAuthClient>
	project?: Maybe<Project>
	projectHasViewedASession?: Maybe<Session>
	projectSuggestion: Array<Maybe<Project>>
	projects?: Maybe<Array<Maybe<Project>>>
	property_suggestion?: Maybe<Array<Maybe<Field>>>
	quickFields_opensearch: Array<Maybe<Field>>
	rageClicksForProject: Array<RageClickEventForProject>
	rage_click_alerts: Array<Maybe<SessionAlert>>
	rage_clicks: Array<RageClickEvent>
	referrers: Array<Maybe<ReferrerTablePayload>>
	resources?: Maybe<Array<Maybe<Scalars['Any']>>>
	segments?: Maybe<Array<Maybe<Segment>>>
	serverIntegration: IntegrationStatus
	session?: Maybe<Session>
	session_comment_tags_for_project: Array<SessionCommentTag>
	session_comments: Array<Maybe<SessionComment>>
	session_comments_for_admin: Array<Maybe<SessionComment>>
	session_comments_for_project: Array<Maybe<SessionComment>>
	session_feedback_alerts: Array<Maybe<SessionAlert>>
	session_intervals: Array<SessionInterval>
	sessions_histogram: SessionsHistogram
	sessions_opensearch: SessionResults
	slack_channel_suggestion: Array<SanitizedSlackChannel>
	sourcemap_files: Array<S3File>
	sourcemap_versions: Array<Scalars['String']>
	subscription_details: SubscriptionDetails
	suggested_metrics: Array<Scalars['String']>
	timeline_indicator_events: Array<TimelineIndicatorEvent>
	topUsers: Array<Maybe<TopUsersPayload>>
	track_properties_alerts: Array<Maybe<SessionAlert>>
	unprocessedSessionsCount?: Maybe<Scalars['Int64']>
	userFingerprintCount?: Maybe<UserFingerprintCount>
	user_properties_alerts: Array<Maybe<SessionAlert>>
	vercel_project_mappings: Array<VercelProjectMapping>
	vercel_projects: Array<VercelProject>
	web_vitals: Array<Metric>
	workspace?: Maybe<Workspace>
	workspaceSuggestion: Array<Maybe<Workspace>>
	workspace_admins: Array<WorkspaceAdminRole>
	workspace_admins_by_project_id: Array<WorkspaceAdminRole>
	workspace_for_invite_link: WorkspaceForInviteLink
	workspace_for_project?: Maybe<Workspace>
	workspace_invite_links: WorkspaceInviteLink
	workspaces?: Maybe<Array<Maybe<Workspace>>>
	workspaces_count: Scalars['Int64']
}

export type QueryAccount_DetailsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryAdminHasCreatedCommentArgs = {
	admin_id: Scalars['ID']
}

export type QueryAdmin_RoleArgs = {
	workspace_id: Scalars['ID']
}

export type QueryAdmin_Role_By_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryApi_Key_To_Org_IdArgs = {
	api_key: Scalars['String']
}

export type QueryApp_Version_SuggestionArgs = {
	project_id: Scalars['ID']
}

export type QueryAverageSessionLengthArgs = {
	lookBackPeriod: Scalars['Int']
	project_id: Scalars['ID']
}

export type QueryBillingDetailsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryBillingDetailsForProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryClickup_Folderless_ListsArgs = {
	project_id: Scalars['ID']
}

export type QueryClickup_FoldersArgs = {
	project_id: Scalars['ID']
}

export type QueryClickup_Project_MappingsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryClickup_TeamsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryClientIntegrationArgs = {
	project_id: Scalars['ID']
}

export type QueryCustomer_Portal_UrlArgs = {
	workspace_id: Scalars['ID']
}

export type QueryDailyErrorFrequencyArgs = {
	date_offset: Scalars['Int']
	error_group_secure_id: Scalars['String']
	project_id: Scalars['ID']
}

export type QueryDailyErrorsCountArgs = {
	date_range: DateRangeInput
	project_id: Scalars['ID']
}

export type QueryDailySessionsCountArgs = {
	date_range: DateRangeInput
	project_id: Scalars['ID']
}

export type QueryDashboard_DefinitionsArgs = {
	project_id: Scalars['ID']
}

export type QueryDiscord_Channel_SuggestionsArgs = {
	project_id: Scalars['ID']
}

export type QueryEmail_Opt_OutsArgs = {
	admin_id?: InputMaybe<Scalars['ID']>
	token?: InputMaybe<Scalars['String']>
}

export type QueryEnhanced_User_DetailsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryEnvironment_SuggestionArgs = {
	project_id: Scalars['ID']
}

export type QueryErrorDistributionArgs = {
	error_group_secure_id: Scalars['String']
	project_id: Scalars['ID']
	property: Scalars['String']
}

export type QueryErrorGroupFrequenciesArgs = {
	error_group_secure_ids?: InputMaybe<Array<Scalars['String']>>
	metric?: InputMaybe<Scalars['String']>
	params: ErrorGroupFrequenciesParamsInput
	project_id: Scalars['ID']
}

export type QueryErrorGroupTagsArgs = {
	error_group_secure_id: Scalars['String']
}

export type QueryError_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryError_CommentsArgs = {
	error_group_secure_id: Scalars['String']
}

export type QueryError_Comments_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryError_Field_SuggestionArgs = {
	name: Scalars['String']
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryError_Fields_OpensearchArgs = {
	count: Scalars['Int']
	field_name: Scalars['String']
	field_type: Scalars['String']
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryError_GroupArgs = {
	secure_id: Scalars['String']
}

export type QueryError_Groups_OpensearchArgs = {
	count: Scalars['Int']
	page?: InputMaybe<Scalars['Int']>
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryError_InstanceArgs = {
	error_group_secure_id: Scalars['String']
	error_object_id?: InputMaybe<Scalars['ID']>
}

export type QueryError_IssueArgs = {
	error_group_secure_id: Scalars['String']
}

export type QueryError_ObjectArgs = {
	id: Scalars['ID']
}

export type QueryError_Object_For_LogArgs = {
	log_cursor: Scalars['String']
}

export type QueryError_SegmentsArgs = {
	project_id: Scalars['ID']
}

export type QueryErrorsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryErrors_HistogramArgs = {
	histogram_options: DateHistogramOptions
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryEvent_Chunk_UrlArgs = {
	index: Scalars['Int']
	secure_id: Scalars['String']
}

export type QueryEvent_ChunksArgs = {
	secure_id: Scalars['String']
}

export type QueryEventsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryField_SuggestionArgs = {
	name: Scalars['String']
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryField_TypesArgs = {
	project_id: Scalars['ID']
}

export type QueryFields_OpensearchArgs = {
	count: Scalars['Int']
	field_name: Scalars['String']
	field_type: Scalars['String']
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryGenerate_Zapier_Access_TokenArgs = {
	project_id: Scalars['ID']
}

export type QueryGet_Source_Map_Upload_UrlsArgs = {
	api_key: Scalars['String']
	paths: Array<Scalars['String']>
}

export type QueryHeight_ListsArgs = {
	project_id: Scalars['ID']
}

export type QueryHeight_WorkspacesArgs = {
	workspace_id: Scalars['ID']
}

export type QueryIdentifier_SuggestionArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryIntegration_Project_MappingsArgs = {
	integration_type?: InputMaybe<IntegrationType>
	workspace_id: Scalars['ID']
}

export type QueryIsBackendIntegratedArgs = {
	project_id: Scalars['ID']
}

export type QueryIsIntegratedArgs = {
	project_id: Scalars['ID']
}

export type QueryIsSessionPendingArgs = {
	session_secure_id: Scalars['String']
}

export type QueryIs_Integrated_WithArgs = {
	integration_type: IntegrationType
	project_id: Scalars['ID']
}

export type QueryIs_Project_Integrated_WithArgs = {
	integration_type: IntegrationType
	project_id: Scalars['ID']
}

export type QueryIs_Workspace_Integrated_WithArgs = {
	integration_type: IntegrationType
	workspace_id: Scalars['ID']
}

export type QueryLinear_TeamsArgs = {
	project_id: Scalars['ID']
}

export type QueryLiveUsersCountArgs = {
	project_id: Scalars['ID']
}

export type QueryLog_AlertArgs = {
	id: Scalars['ID']
}

export type QueryLog_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryLogsArgs = {
	after?: InputMaybe<Scalars['String']>
	at?: InputMaybe<Scalars['String']>
	before?: InputMaybe<Scalars['String']>
	direction: LogDirection
	params: LogsParamsInput
	project_id: Scalars['ID']
}

export type QueryLogsIntegrationArgs = {
	project_id: Scalars['ID']
}

export type QueryLogs_Error_ObjectsArgs = {
	log_cursors: Array<Scalars['String']>
}

export type QueryLogs_HistogramArgs = {
	params: LogsParamsInput
	project_id: Scalars['ID']
}

export type QueryLogs_Key_ValuesArgs = {
	date_range: DateRangeRequiredInput
	key_name: Scalars['String']
	project_id: Scalars['ID']
}

export type QueryLogs_KeysArgs = {
	date_range: DateRangeRequiredInput
	project_id: Scalars['ID']
}

export type QueryLogs_Total_CountArgs = {
	params: LogsParamsInput
	project_id: Scalars['ID']
}

export type QueryMessagesArgs = {
	session_secure_id: Scalars['String']
}

export type QueryMetric_MonitorsArgs = {
	metric_name?: InputMaybe<Scalars['String']>
	project_id: Scalars['ID']
}

export type QueryMetric_Tag_ValuesArgs = {
	metric_name: Scalars['String']
	project_id: Scalars['ID']
	tag_name: Scalars['String']
}

export type QueryMetric_TagsArgs = {
	metric_name: Scalars['String']
	project_id: Scalars['ID']
}

export type QueryMetrics_HistogramArgs = {
	metric_name: Scalars['String']
	params: HistogramParamsInput
	project_id: Scalars['ID']
}

export type QueryMetrics_TimelineArgs = {
	metric_name: Scalars['String']
	params: DashboardParamsInput
	project_id: Scalars['ID']
}

export type QueryNetwork_HistogramArgs = {
	params: NetworkHistogramParamsInput
	project_id: Scalars['ID']
}

export type QueryNewUsersCountArgs = {
	lookBackPeriod: Scalars['Int']
	project_id: Scalars['ID']
}

export type QueryNew_Session_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryNew_User_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryOauth_Client_MetadataArgs = {
	client_id: Scalars['String']
}

export type QueryProjectArgs = {
	id: Scalars['ID']
}

export type QueryProjectHasViewedASessionArgs = {
	project_id: Scalars['ID']
}

export type QueryProjectSuggestionArgs = {
	query: Scalars['String']
}

export type QueryProperty_SuggestionArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
	type: Scalars['String']
}

export type QueryQuickFields_OpensearchArgs = {
	count: Scalars['Int']
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QueryRageClicksForProjectArgs = {
	lookBackPeriod: Scalars['Int']
	project_id: Scalars['ID']
}

export type QueryRage_Click_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryRage_ClicksArgs = {
	session_secure_id: Scalars['String']
}

export type QueryReferrersArgs = {
	lookBackPeriod: Scalars['Int']
	project_id: Scalars['ID']
}

export type QueryResourcesArgs = {
	session_secure_id: Scalars['String']
}

export type QuerySegmentsArgs = {
	project_id: Scalars['ID']
}

export type QueryServerIntegrationArgs = {
	project_id: Scalars['ID']
}

export type QuerySessionArgs = {
	secure_id: Scalars['String']
}

export type QuerySession_Comment_Tags_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QuerySession_CommentsArgs = {
	session_secure_id: Scalars['String']
}

export type QuerySession_Comments_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QuerySession_Feedback_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QuerySession_IntervalsArgs = {
	session_secure_id: Scalars['String']
}

export type QuerySessions_HistogramArgs = {
	histogram_options: DateHistogramOptions
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QuerySessions_OpensearchArgs = {
	count: Scalars['Int']
	page?: InputMaybe<Scalars['Int']>
	project_id: Scalars['ID']
	query: Scalars['String']
	sort_desc: Scalars['Boolean']
}

export type QuerySlack_Channel_SuggestionArgs = {
	project_id: Scalars['ID']
}

export type QuerySourcemap_FilesArgs = {
	project_id: Scalars['ID']
	version?: InputMaybe<Scalars['String']>
}

export type QuerySourcemap_VersionsArgs = {
	project_id: Scalars['ID']
}

export type QuerySubscription_DetailsArgs = {
	workspace_id: Scalars['ID']
}

export type QuerySuggested_MetricsArgs = {
	prefix: Scalars['String']
	project_id: Scalars['ID']
}

export type QueryTimeline_Indicator_EventsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryTopUsersArgs = {
	lookBackPeriod: Scalars['Int']
	project_id: Scalars['ID']
}

export type QueryTrack_Properties_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryUnprocessedSessionsCountArgs = {
	project_id: Scalars['ID']
}

export type QueryUserFingerprintCountArgs = {
	lookBackPeriod: Scalars['Int']
	project_id: Scalars['ID']
}

export type QueryUser_Properties_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryVercel_Project_MappingsArgs = {
	project_id: Scalars['ID']
}

export type QueryVercel_ProjectsArgs = {
	project_id: Scalars['ID']
}

export type QueryWeb_VitalsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryWorkspaceArgs = {
	id: Scalars['ID']
}

export type QueryWorkspaceSuggestionArgs = {
	query: Scalars['String']
}

export type QueryWorkspace_AdminsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryWorkspace_Admins_By_Project_IdArgs = {
	project_id: Scalars['ID']
}

export type QueryWorkspace_For_Invite_LinkArgs = {
	secret: Scalars['String']
}

export type QueryWorkspace_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryWorkspace_Invite_LinksArgs = {
	workspace_id: Scalars['ID']
}

export type RageClickEvent = {
	__typename?: 'RageClickEvent'
	end_timestamp: Scalars['Timestamp']
	id: Scalars['ID']
	project_id: Scalars['ID']
	session_secure_id: Scalars['String']
	start_timestamp: Scalars['Timestamp']
	total_clicks: Scalars['Int']
}

export type RageClickEventForProject = {
	__typename?: 'RageClickEventForProject'
	identifier: Scalars['String']
	session_secure_id: Scalars['String']
	total_clicks: Scalars['Int']
	user_properties: Scalars['String']
}

export type ReferrerTablePayload = {
	__typename?: 'ReferrerTablePayload'
	count: Scalars['Int']
	host: Scalars['String']
	percent: Scalars['Float']
}

export enum ReservedLogKey {
	/** Keep this in alpha order */
	Level = 'level',
	Message = 'message',
	SecureSessionId = 'secure_session_id',
	ServiceName = 'service_name',
	Source = 'source',
	SpanId = 'span_id',
	TraceId = 'trace_id',
}

export enum RetentionPeriod {
	SixMonths = 'SixMonths',
	ThreeMonths = 'ThreeMonths',
	TwelveMonths = 'TwelveMonths',
	TwoYears = 'TwoYears',
}

export type S3File = {
	__typename?: 'S3File'
	key?: Maybe<Scalars['String']>
}

export type SanitizedAdmin = {
	__typename?: 'SanitizedAdmin'
	email: Scalars['String']
	id: Scalars['ID']
	name?: Maybe<Scalars['String']>
	photo_url?: Maybe<Scalars['String']>
}

export type SanitizedAdminInput = {
	email: Scalars['String']
	id: Scalars['ID']
	name?: InputMaybe<Scalars['String']>
}

export type SanitizedSlackChannel = {
	__typename?: 'SanitizedSlackChannel'
	webhook_channel?: Maybe<Scalars['String']>
	webhook_channel_id?: Maybe<Scalars['String']>
}

export type SanitizedSlackChannelInput = {
	webhook_channel_id?: InputMaybe<Scalars['String']>
	webhook_channel_name?: InputMaybe<Scalars['String']>
}

export type SearchParams = {
	__typename?: 'SearchParams'
	app_versions?: Maybe<Array<Maybe<Scalars['String']>>>
	browser?: Maybe<Scalars['String']>
	date_range?: Maybe<DateRange>
	device_id?: Maybe<Scalars['String']>
	environments?: Maybe<Array<Maybe<Scalars['String']>>>
	excluded_properties?: Maybe<Array<Maybe<UserProperty>>>
	excluded_track_properties?: Maybe<Array<Maybe<UserProperty>>>
	first_time?: Maybe<Scalars['Boolean']>
	hide_viewed?: Maybe<Scalars['Boolean']>
	identified?: Maybe<Scalars['Boolean']>
	length_range?: Maybe<LengthRange>
	os?: Maybe<Scalars['String']>
	query?: Maybe<Scalars['String']>
	referrer?: Maybe<Scalars['String']>
	show_live_sessions?: Maybe<Scalars['Boolean']>
	track_properties?: Maybe<Array<Maybe<UserProperty>>>
	user_properties?: Maybe<Array<Maybe<UserProperty>>>
	visited_url?: Maybe<Scalars['String']>
}

export type SearchParamsInput = {
	app_versions?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
	browser?: InputMaybe<Scalars['String']>
	date_range?: InputMaybe<DateRangeInput>
	device_id?: InputMaybe<Scalars['String']>
	environments?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
	excluded_properties?: InputMaybe<Array<UserPropertyInput>>
	excluded_track_properties?: InputMaybe<Array<UserPropertyInput>>
	first_time?: InputMaybe<Scalars['Boolean']>
	hide_viewed?: InputMaybe<Scalars['Boolean']>
	identified?: InputMaybe<Scalars['Boolean']>
	length_range?: InputMaybe<LengthRangeInput>
	os?: InputMaybe<Scalars['String']>
	query?: InputMaybe<Scalars['String']>
	referrer?: InputMaybe<Scalars['String']>
	show_live_sessions?: InputMaybe<Scalars['Boolean']>
	track_properties?: InputMaybe<Array<UserPropertyInput>>
	user_properties?: InputMaybe<Array<UserPropertyInput>>
	visited_url?: InputMaybe<Scalars['String']>
}

export type Segment = {
	__typename?: 'Segment'
	id: Scalars['ID']
	name: Scalars['String']
	params: SearchParams
	project_id: Scalars['ID']
}

export type Session = {
	__typename?: 'Session'
	active_length?: Maybe<Scalars['Int']>
	app_version?: Maybe<Scalars['String']>
	browser_name: Scalars['String']
	browser_version: Scalars['String']
	chunked?: Maybe<Scalars['Boolean']>
	city: Scalars['String']
	client_config?: Maybe<Scalars['String']>
	client_id: Scalars['String']
	client_version?: Maybe<Scalars['String']>
	country: Scalars['String']
	created_at: Scalars['Timestamp']
	deviceMemory?: Maybe<Scalars['Int']>
	direct_download_url?: Maybe<Scalars['String']>
	enable_recording_network_contents?: Maybe<Scalars['Boolean']>
	enable_strict_privacy?: Maybe<Scalars['Boolean']>
	environment?: Maybe<Scalars['String']>
	event_counts?: Maybe<Scalars['String']>
	excluded?: Maybe<Scalars['Boolean']>
	field_group?: Maybe<Scalars['String']>
	fields?: Maybe<Array<Maybe<Field>>>
	fingerprint?: Maybe<Scalars['Int']>
	first_time?: Maybe<Scalars['Boolean']>
	firstload_version?: Maybe<Scalars['String']>
	has_errors?: Maybe<Scalars['Boolean']>
	has_rage_clicks?: Maybe<Scalars['Boolean']>
	id: Scalars['ID']
	identified: Scalars['Boolean']
	identifier: Scalars['String']
	is_public?: Maybe<Scalars['Boolean']>
	language: Scalars['String']
	last_user_interaction_time: Scalars['Timestamp']
	length?: Maybe<Scalars['Int']>
	messages_url?: Maybe<Scalars['String']>
	object_storage_enabled?: Maybe<Scalars['Boolean']>
	os_name: Scalars['String']
	os_version: Scalars['String']
	payload_size?: Maybe<Scalars['Int64']>
	payload_updated_at: Scalars['Timestamp']
	postal: Scalars['String']
	processed?: Maybe<Scalars['Boolean']>
	resources_url?: Maybe<Scalars['String']>
	secure_id: Scalars['String']
	starred?: Maybe<Scalars['Boolean']>
	state: Scalars['String']
	user_object?: Maybe<Scalars['Any']>
	user_properties?: Maybe<Scalars['String']>
	viewed?: Maybe<Scalars['Boolean']>
	within_billing_quota?: Maybe<Scalars['Boolean']>
}

export type SessionAlert = {
	__typename?: 'SessionAlert'
	ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>
	CountThreshold: Scalars['Int']
	DailyFrequency: Array<Maybe<Scalars['Int64']>>
	DiscordChannelsToNotify: Array<DiscordChannel>
	EmailsToNotify: Array<Maybe<Scalars['String']>>
	ExcludeRules: Array<Maybe<Scalars['String']>>
	ExcludedEnvironments: Array<Maybe<Scalars['String']>>
	LastAdminToEditID?: Maybe<Scalars['ID']>
	Name?: Maybe<Scalars['String']>
	ThresholdWindow?: Maybe<Scalars['Int']>
	TrackProperties: Array<Maybe<TrackProperty>>
	Type: Scalars['String']
	UserProperties: Array<Maybe<UserProperty>>
	disabled: Scalars['Boolean']
	id: Scalars['ID']
	updated_at: Scalars['Timestamp']
}

export type SessionAlertInput = {
	count_threshold: Scalars['Int']
	disabled: Scalars['Boolean']
	discord_channels: Array<DiscordChannelInput>
	emails: Array<Scalars['String']>
	environments: Array<Scalars['String']>
	exclude_rules: Array<Scalars['String']>
	name: Scalars['String']
	project_id: Scalars['ID']
	slack_channels: Array<SanitizedSlackChannelInput>
	threshold_window: Scalars['Int']
	track_properties: Array<TrackPropertyInput>
	type: SessionAlertType
	user_properties: Array<UserPropertyInput>
	webhook_destinations: Array<WebhookDestinationInput>
}

export enum SessionAlertType {
	ErrorAlert = 'ERROR_ALERT',
	NewSessionAlert = 'NEW_SESSION_ALERT',
	NewUserAlert = 'NEW_USER_ALERT',
	RageClickAlert = 'RAGE_CLICK_ALERT',
	SessionFeedbackAlert = 'SESSION_FEEDBACK_ALERT',
	TrackPropertiesAlert = 'TRACK_PROPERTIES_ALERT',
	UserPropertiesAlert = 'USER_PROPERTIES_ALERT',
}

export type SessionComment = {
	__typename?: 'SessionComment'
	attachments: Array<Maybe<ExternalAttachment>>
	author?: Maybe<SanitizedAdmin>
	created_at: Scalars['Timestamp']
	id: Scalars['ID']
	metadata?: Maybe<Scalars['Any']>
	project_id: Scalars['ID']
	replies: Array<Maybe<CommentReply>>
	session_id: Scalars['Int']
	session_secure_id: Scalars['String']
	tags: Array<Maybe<Scalars['String']>>
	text: Scalars['String']
	timestamp?: Maybe<Scalars['Int']>
	type: SessionCommentType
	updated_at: Scalars['Timestamp']
	x_coordinate?: Maybe<Scalars['Float']>
	y_coordinate?: Maybe<Scalars['Float']>
}

export type SessionCommentTag = {
	__typename?: 'SessionCommentTag'
	id: Scalars['ID']
	name: Scalars['String']
}

export type SessionCommentTagInput = {
	id?: InputMaybe<Scalars['ID']>
	name: Scalars['String']
}

export enum SessionCommentType {
	Admin = 'Admin',
	Feedback = 'FEEDBACK',
}

export type SessionInterval = {
	__typename?: 'SessionInterval'
	active: Scalars['Boolean']
	duration: Scalars['Int']
	end_time: Scalars['Timestamp']
	session_secure_id: Scalars['String']
	start_time: Scalars['Timestamp']
}

export enum SessionLifecycle {
	All = 'All',
	Completed = 'Completed',
	Live = 'Live',
}

export type SessionPayload = {
	__typename?: 'SessionPayload'
	errors: Array<Maybe<ErrorObject>>
	events: Array<Maybe<Scalars['Any']>>
	last_user_interaction_time: Scalars['Timestamp']
	rage_clicks: Array<RageClickEvent>
	session_comments: Array<Maybe<SessionComment>>
}

export type SessionResults = {
	__typename?: 'SessionResults'
	sessions: Array<Session>
	totalCount: Scalars['Int64']
}

export type SessionsHistogram = {
	__typename?: 'SessionsHistogram'
	bucket_times: Array<Scalars['Timestamp']>
	sessions_with_errors: Array<Scalars['Int64']>
	sessions_without_errors: Array<Scalars['Int64']>
	total_sessions: Array<Scalars['Int64']>
}

export type SlackSyncResponse = {
	__typename?: 'SlackSyncResponse'
	newChannelsAddedCount: Scalars['Int']
	success: Scalars['Boolean']
}

export type SocialLink = {
	__typename?: 'SocialLink'
	link?: Maybe<Scalars['String']>
	type: SocialType
}

export enum SocialType {
	Facebook = 'Facebook',
	Github = 'Github',
	LinkedIn = 'LinkedIn',
	Site = 'Site',
	Twitter = 'Twitter',
}

export type SourceMappingError = {
	__typename?: 'SourceMappingError'
	actualMinifiedFetchedPath?: Maybe<Scalars['String']>
	actualSourcemapFetchedPath?: Maybe<Scalars['String']>
	errorCode?: Maybe<SourceMappingErrorCode>
	mappedColumnNumber?: Maybe<Scalars['Int']>
	mappedLineNumber?: Maybe<Scalars['Int']>
	minifiedColumnNumber?: Maybe<Scalars['Int']>
	minifiedFetchStrategy?: Maybe<Scalars['String']>
	minifiedFileSize?: Maybe<Scalars['Int']>
	minifiedLineNumber?: Maybe<Scalars['Int']>
	sourceMapURL?: Maybe<Scalars['String']>
	sourcemapFetchStrategy?: Maybe<Scalars['String']>
	sourcemapFileSize?: Maybe<Scalars['Int']>
	stackTraceFileURL?: Maybe<Scalars['String']>
}

export enum SourceMappingErrorCode {
	ErrorParsingStackTraceFileUrl = 'Error_Parsing_Stack_Trace_File_Url',
	FileNameMissingFromSourcePath = 'File_Name_Missing_From_Source_Path',
	InvalidSourceMapUrl = 'Invalid_SourceMapURL',
	MinifiedFileLarger = 'Minified_File_Larger',
	MinifiedFileMissingInS3AndUrl = 'Minified_File_Missing_In_S3_And_URL',
	MissingSourceMapFileInS3 = 'Missing_Source_Map_File_In_S3',
	SourceMapFileLarger = 'Source_Map_File_Larger',
	SourcemapFileMissingInS3AndUrl = 'Sourcemap_File_Missing_In_S3_And_URL',
	SourcemapLibraryCouldntParse = 'Sourcemap_Library_Couldnt_Parse',
	SourcemapLibraryCouldntRetrieveSource = 'Sourcemap_Library_Couldnt_Retrieve_Source',
}

export type Subscription = {
	__typename?: 'Subscription'
	session_payload_appended?: Maybe<SessionPayload>
}

export type SubscriptionSession_Payload_AppendedArgs = {
	initial_events_count: Scalars['Int']
	session_secure_id: Scalars['String']
}

export type SubscriptionDetails = {
	__typename?: 'SubscriptionDetails'
	baseAmount: Scalars['Int64']
	discountAmount: Scalars['Int64']
	discountPercent: Scalars['Float']
	lastInvoice?: Maybe<Invoice>
}

export enum SubscriptionInterval {
	Annual = 'Annual',
	Monthly = 'Monthly',
}

export type TimelineIndicatorEvent = {
	__typename?: 'TimelineIndicatorEvent'
	data?: Maybe<Scalars['Any']>
	session_secure_id: Scalars['String']
	sid: Scalars['Float']
	timestamp: Scalars['Float']
	type: Scalars['Int']
}

export type TopUsersPayload = {
	__typename?: 'TopUsersPayload'
	active_time_percentage: Scalars['Float']
	id: Scalars['ID']
	identifier: Scalars['String']
	total_active_time: Scalars['Int']
	user_properties: Scalars['String']
}

export type TrackProperty = {
	__typename?: 'TrackProperty'
	id: Scalars['ID']
	name: Scalars['String']
	value: Scalars['String']
}

export type TrackPropertyInput = {
	id?: InputMaybe<Scalars['ID']>
	name: Scalars['String']
	value: Scalars['String']
}

export type User = {
	__typename?: 'User'
	id: Scalars['ID']
}

export type UserFingerprintCount = {
	__typename?: 'UserFingerprintCount'
	count: Scalars['Int64']
}

export type UserProperty = {
	__typename?: 'UserProperty'
	id: Scalars['ID']
	name: Scalars['String']
	value: Scalars['String']
}

export type UserPropertyInput = {
	id: Scalars['ID']
	name: Scalars['String']
	value: Scalars['String']
}

export type VercelEnv = {
	__typename?: 'VercelEnv'
	configurationId: Scalars['String']
	id: Scalars['String']
	key: Scalars['String']
}

export type VercelProject = {
	__typename?: 'VercelProject'
	env: Array<VercelEnv>
	id: Scalars['String']
	name: Scalars['String']
}

export type VercelProjectMapping = {
	__typename?: 'VercelProjectMapping'
	project_id: Scalars['ID']
	vercel_project_id: Scalars['String']
}

export type VercelProjectMappingInput = {
	new_project_name?: InputMaybe<Scalars['String']>
	project_id?: InputMaybe<Scalars['ID']>
	vercel_project_id: Scalars['String']
}

export type WebhookDestination = {
	__typename?: 'WebhookDestination'
	authorization?: Maybe<Scalars['String']>
	url: Scalars['String']
}

export type WebhookDestinationInput = {
	authorization?: InputMaybe<Scalars['String']>
	url: Scalars['String']
}

export type Workspace = {
	__typename?: 'Workspace'
	allow_meter_overage: Scalars['Boolean']
	allowed_auto_join_email_origins?: Maybe<Scalars['String']>
	billing_period_end?: Maybe<Scalars['Timestamp']>
	clearbit_enabled: Scalars['Boolean']
	eligible_for_trial_extension: Scalars['Boolean']
	id: Scalars['ID']
	name: Scalars['String']
	next_invoice_date?: Maybe<Scalars['Timestamp']>
	plan_tier: Scalars['String']
	projects: Array<Maybe<Project>>
	retention_period?: Maybe<RetentionPeriod>
	secret?: Maybe<Scalars['String']>
	slack_channels?: Maybe<Scalars['String']>
	slack_webhook_channel?: Maybe<Scalars['String']>
	trial_end_date?: Maybe<Scalars['Timestamp']>
	trial_extension_enabled: Scalars['Boolean']
	unlimited_members: Scalars['Boolean']
}

export type WorkspaceAdminRole = {
	__typename?: 'WorkspaceAdminRole'
	admin: Admin
	role: Scalars['String']
}

export type WorkspaceForInviteLink = {
	__typename?: 'WorkspaceForInviteLink'
	existing_account: Scalars['Boolean']
	expiration_date?: Maybe<Scalars['Timestamp']>
	invitee_email?: Maybe<Scalars['String']>
	secret: Scalars['String']
	workspace_id: Scalars['ID']
	workspace_name: Scalars['String']
}

export type WorkspaceInviteLink = {
	__typename?: 'WorkspaceInviteLink'
	expiration_date: Scalars['Timestamp']
	id: Scalars['ID']
	invitee_email?: Maybe<Scalars['String']>
	invitee_role: Scalars['String']
	secret: Scalars['String']
}
