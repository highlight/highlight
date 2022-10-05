export type Maybe<T> = T | null
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
	Timestamp: string
	Int64: number
	StringArray: string[]
	Upload: any
}

export type Field = {
	__typename?: 'Field'
	id: Scalars['Int64']
	name: Scalars['String']
	value: Scalars['String']
	type?: Maybe<Scalars['String']>
}

export type Session = {
	__typename?: 'Session'
	id: Scalars['ID']
	secure_id: Scalars['String']
	client_id: Scalars['String']
	fingerprint?: Maybe<Scalars['Int']>
	os_name: Scalars['String']
	os_version: Scalars['String']
	browser_name: Scalars['String']
	browser_version: Scalars['String']
	city: Scalars['String']
	state: Scalars['String']
	country: Scalars['String']
	postal: Scalars['String']
	environment?: Maybe<Scalars['String']>
	app_version?: Maybe<Scalars['String']>
	client_version?: Maybe<Scalars['String']>
	firstload_version?: Maybe<Scalars['String']>
	client_config?: Maybe<Scalars['String']>
	language: Scalars['String']
	identifier: Scalars['String']
	identified: Scalars['Boolean']
	created_at?: Maybe<Scalars['Timestamp']>
	length?: Maybe<Scalars['Int']>
	active_length?: Maybe<Scalars['Int']>
	user_object?: Maybe<Scalars['Any']>
	user_properties?: Maybe<Scalars['String']>
	fields?: Maybe<Array<Maybe<Field>>>
	viewed?: Maybe<Scalars['Boolean']>
	starred?: Maybe<Scalars['Boolean']>
	processed?: Maybe<Scalars['Boolean']>
	excluded?: Maybe<Scalars['Boolean']>
	has_rage_clicks?: Maybe<Scalars['Boolean']>
	has_errors?: Maybe<Scalars['Boolean']>
	first_time?: Maybe<Scalars['Boolean']>
	field_group?: Maybe<Scalars['String']>
	enable_strict_privacy?: Maybe<Scalars['Boolean']>
	enable_recording_network_contents?: Maybe<Scalars['Boolean']>
	object_storage_enabled?: Maybe<Scalars['Boolean']>
	payload_size?: Maybe<Scalars['Int64']>
	within_billing_quota?: Maybe<Scalars['Boolean']>
	is_public?: Maybe<Scalars['Boolean']>
	event_counts?: Maybe<Scalars['String']>
	direct_download_url?: Maybe<Scalars['String']>
	resources_url?: Maybe<Scalars['String']>
	messages_url?: Maybe<Scalars['String']>
	deviceMemory?: Maybe<Scalars['Int']>
	last_user_interaction_time: Scalars['Timestamp']
	chunked?: Maybe<Scalars['Boolean']>
}

export type SessionInterval = {
	__typename?: 'SessionInterval'
	session_secure_id: Scalars['String']
	start_time: Scalars['Timestamp']
	end_time: Scalars['Timestamp']
	duration: Scalars['Int']
	active: Scalars['Boolean']
}

export type TimelineIndicatorEvent = {
	__typename?: 'TimelineIndicatorEvent'
	session_secure_id: Scalars['String']
	timestamp: Scalars['Float']
	sid: Scalars['Float']
	data?: Maybe<Scalars['Any']>
	type: Scalars['Int']
}

export type RageClickEvent = {
	__typename?: 'RageClickEvent'
	id: Scalars['ID']
	project_id: Scalars['ID']
	session_secure_id: Scalars['String']
	start_timestamp: Scalars['Timestamp']
	end_timestamp: Scalars['Timestamp']
	total_clicks: Scalars['Int']
}

export type RageClickEventForProject = {
	__typename?: 'RageClickEventForProject'
	identifier: Scalars['String']
	session_secure_id: Scalars['String']
	total_clicks: Scalars['Int']
	user_properties: Scalars['String']
}

export type BillingDetails = {
	__typename?: 'BillingDetails'
	plan: Plan
	meter: Scalars['Int64']
	membersMeter: Scalars['Int64']
	sessionsOutOfQuota: Scalars['Int64']
}

export type Invoice = {
	__typename?: 'Invoice'
	amountDue?: Maybe<Scalars['Int64']>
	amountPaid?: Maybe<Scalars['Int64']>
	attemptCount?: Maybe<Scalars['Int64']>
	date?: Maybe<Scalars['Timestamp']>
	url?: Maybe<Scalars['String']>
	status?: Maybe<Scalars['String']>
}

export type SubscriptionDetails = {
	__typename?: 'SubscriptionDetails'
	baseAmount: Scalars['Int64']
	discountPercent: Scalars['Float']
	discountAmount: Scalars['Int64']
	lastInvoice?: Maybe<Invoice>
}

export type Plan = {
	__typename?: 'Plan'
	type: PlanType
	interval: SubscriptionInterval
	quota: Scalars['Int']
	membersLimit?: Maybe<Scalars['Int']>
}

export enum PlanType {
	Free = 'Free',
	Basic = 'Basic',
	Startup = 'Startup',
	Enterprise = 'Enterprise',
}

export enum SubscriptionInterval {
	Monthly = 'Monthly',
	Annual = 'Annual',
}

export enum OpenSearchCalendarInterval {
	Minute = 'minute',
	Hour = 'hour',
	Day = 'day',
	Week = 'week',
	Month = 'month',
	Quarter = 'quarter',
	Year = 'year',
}

export type EnhancedUserDetailsResult = {
	__typename?: 'EnhancedUserDetailsResult'
	id?: Maybe<Scalars['ID']>
	name?: Maybe<Scalars['String']>
	avatar?: Maybe<Scalars['String']>
	bio?: Maybe<Scalars['String']>
	socials?: Maybe<Array<Maybe<SocialLink>>>
	email?: Maybe<Scalars['String']>
}

export type LinearTeam = {
	__typename?: 'LinearTeam'
	team_id: Scalars['String']
	name: Scalars['String']
	key: Scalars['String']
}

export type VercelEnv = {
	__typename?: 'VercelEnv'
	id: Scalars['String']
	key: Scalars['String']
	configurationId: Scalars['String']
}

export type VercelProject = {
	__typename?: 'VercelProject'
	id: Scalars['String']
	name: Scalars['String']
	env: Array<VercelEnv>
}

export type SocialLink = {
	__typename?: 'SocialLink'
	type: SocialType
	link?: Maybe<Scalars['String']>
}

export enum SocialType {
	Github = 'Github',
	LinkedIn = 'LinkedIn',
	Twitter = 'Twitter',
	Facebook = 'Facebook',
	Site = 'Site',
}

export enum IntegrationType {
	Slack = 'Slack',
	Linear = 'Linear',
	Zapier = 'Zapier',
	Front = 'Front',
	Vercel = 'Vercel',
	Discord = 'Discord',
}

export enum ErrorState {
	Open = 'OPEN',
	Resolved = 'RESOLVED',
	Ignored = 'IGNORED',
}

export enum AdminRole {
	Admin = 'ADMIN',
	Member = 'MEMBER',
}

export enum SessionCommentType {
	Admin = 'Admin',
	Feedback = 'FEEDBACK',
}

export enum SessionAlertType {
	ErrorAlert = 'ERROR_ALERT',
	NewUserAlert = 'NEW_USER_ALERT',
	TrackPropertiesAlert = 'TRACK_PROPERTIES_ALERT',
	UserPropertiesAlert = 'USER_PROPERTIES_ALERT',
	SessionFeedbackAlert = 'SESSION_FEEDBACK_ALERT',
	RageClickAlert = 'RAGE_CLICK_ALERT',
	NewSessionAlert = 'NEW_SESSION_ALERT',
}

export type Project = {
	__typename?: 'Project'
	id: Scalars['ID']
	verbose_id: Scalars['String']
	name: Scalars['String']
	billing_email?: Maybe<Scalars['String']>
	secret?: Maybe<Scalars['String']>
	workspace_id: Scalars['ID']
	excluded_users?: Maybe<Scalars['StringArray']>
	error_json_paths?: Maybe<Scalars['StringArray']>
	rage_click_window_seconds?: Maybe<Scalars['Int']>
	rage_click_radius_pixels?: Maybe<Scalars['Int']>
	rage_click_count?: Maybe<Scalars['Int']>
	backend_domains?: Maybe<Scalars['StringArray']>
}

export type Account = {
	__typename?: 'Account'
	id: Scalars['ID']
	name: Scalars['String']
	session_count_cur: Scalars['Int']
	view_count_cur: Scalars['Int']
	session_count_prev: Scalars['Int']
	view_count_prev: Scalars['Int']
	session_count_prev_prev: Scalars['Int']
	session_limit: Scalars['Int']
	paid_prev: Scalars['Int']
	paid_prev_prev: Scalars['Int']
	email: Scalars['String']
	subscription_start?: Maybe<Scalars['Timestamp']>
	plan_tier: Scalars['String']
	unlimited_members: Scalars['Boolean']
	stripe_customer_id: Scalars['String']
	member_count: Scalars['Int']
	member_limit?: Maybe<Scalars['Int']>
}

export type AccountDetailsMember = {
	__typename?: 'AccountDetailsMember'
	id: Scalars['ID']
	name: Scalars['String']
	email: Scalars['String']
	last_active?: Maybe<Scalars['Timestamp']>
}

export type AccountDetails = {
	__typename?: 'AccountDetails'
	id: Scalars['ID']
	name: Scalars['String']
	session_count_per_month?: Maybe<Array<Maybe<NamedCount>>>
	session_count_per_day?: Maybe<Array<Maybe<NamedCount>>>
	stripe_customer_id: Scalars['String']
	members: Array<AccountDetailsMember>
}

export type NamedCount = {
	__typename?: 'NamedCount'
	name: Scalars['String']
	count: Scalars['Int']
}

export type Workspace = {
	__typename?: 'Workspace'
	id: Scalars['ID']
	name: Scalars['String']
	slack_webhook_channel?: Maybe<Scalars['String']>
	slack_channels?: Maybe<Scalars['String']>
	secret?: Maybe<Scalars['String']>
	projects: Array<Maybe<Project>>
	plan_tier: Scalars['String']
	unlimited_members: Scalars['Boolean']
	trial_end_date?: Maybe<Scalars['Timestamp']>
	billing_period_end?: Maybe<Scalars['Timestamp']>
	next_invoice_date?: Maybe<Scalars['Timestamp']>
	allow_meter_overage: Scalars['Boolean']
	allowed_auto_join_email_origins?: Maybe<Scalars['String']>
	eligible_for_trial_extension: Scalars['Boolean']
	trial_extension_enabled: Scalars['Boolean']
	clearbit_enabled: Scalars['Boolean']
}

export type Segment = {
	__typename?: 'Segment'
	id: Scalars['ID']
	name: Scalars['String']
	params: SearchParams
	project_id: Scalars['ID']
}

export type ErrorSegment = {
	__typename?: 'ErrorSegment'
	id: Scalars['ID']
	name: Scalars['String']
	params: ErrorSearchParams
	project_id: Scalars['ID']
}

export type ErrorObject = {
	__typename?: 'ErrorObject'
	id: Scalars['ID']
	project_id: Scalars['Int']
	session_id: Scalars['Int']
	error_group_id: Scalars['Int']
	error_group_secure_id: Scalars['String']
	event: Array<Maybe<Scalars['String']>>
	type: Scalars['String']
	url: Scalars['String']
	source?: Maybe<Scalars['String']>
	lineNumber?: Maybe<Scalars['Int']>
	columnNumber?: Maybe<Scalars['Int']>
	stack_trace: Scalars['String']
	structured_stack_trace: Array<Maybe<ErrorTrace>>
	timestamp: Scalars['Timestamp']
	payload?: Maybe<Scalars['String']>
	request_id?: Maybe<Scalars['String']>
}

export type ErrorField = {
	__typename?: 'ErrorField'
	project_id?: Maybe<Scalars['Int']>
	name: Scalars['String']
	value: Scalars['String']
}

export type ErrorGroup = {
	__typename?: 'ErrorGroup'
	created_at: Scalars['Timestamp']
	id: Scalars['ID']
	secure_id: Scalars['String']
	project_id: Scalars['Int']
	type: Scalars['String']
	event: Array<Maybe<Scalars['String']>>
	structured_stack_trace: Array<Maybe<ErrorTrace>>
	metadata_log: Array<Maybe<ErrorMetadata>>
	mapped_stack_trace?: Maybe<Scalars['String']>
	stack_trace?: Maybe<Scalars['String']>
	fields?: Maybe<Array<Maybe<ErrorField>>>
	state: ErrorState
	environments?: Maybe<Scalars['String']>
	error_frequency: Array<Maybe<Scalars['Int64']>>
	is_public: Scalars['Boolean']
}

export type ErrorMetadata = {
	__typename?: 'ErrorMetadata'
	error_id: Scalars['Int']
	session_id: Scalars['Int']
	session_secure_id: Scalars['String']
	environment?: Maybe<Scalars['String']>
	timestamp?: Maybe<Scalars['Timestamp']>
	os?: Maybe<Scalars['String']>
	browser?: Maybe<Scalars['String']>
	visited_url?: Maybe<Scalars['String']>
	fingerprint: Scalars['String']
	identifier?: Maybe<Scalars['String']>
	user_properties?: Maybe<Scalars['String']>
	request_id?: Maybe<Scalars['String']>
	payload?: Maybe<Scalars['String']>
}

export type ErrorTrace = {
	__typename?: 'ErrorTrace'
	fileName?: Maybe<Scalars['String']>
	lineNumber?: Maybe<Scalars['Int']>
	functionName?: Maybe<Scalars['String']>
	columnNumber?: Maybe<Scalars['Int']>
	error?: Maybe<Scalars['String']>
	lineContent?: Maybe<Scalars['String']>
	linesBefore?: Maybe<Scalars['String']>
	linesAfter?: Maybe<Scalars['String']>
}

export type S3File = {
	__typename?: 'S3File'
	key?: Maybe<Scalars['String']>
}

export type ReferrerTablePayload = {
	__typename?: 'ReferrerTablePayload'
	host: Scalars['String']
	count: Scalars['Int']
	percent: Scalars['Float']
}

export type TopUsersPayload = {
	__typename?: 'TopUsersPayload'
	id: Scalars['ID']
	identifier: Scalars['String']
	total_active_time: Scalars['Int']
	active_time_percentage: Scalars['Float']
	user_properties: Scalars['String']
}

export type NewUsersCount = {
	__typename?: 'NewUsersCount'
	count: Scalars['Int64']
}

export type AverageSessionLength = {
	__typename?: 'AverageSessionLength'
	length: Scalars['Float']
}

export type UserFingerprintCount = {
	__typename?: 'UserFingerprintCount'
	count: Scalars['Int64']
}

export type SearchParamsInput = {
	user_properties?: Maybe<Array<Maybe<UserPropertyInput>>>
	excluded_properties?: Maybe<Array<Maybe<UserPropertyInput>>>
	track_properties?: Maybe<Array<Maybe<UserPropertyInput>>>
	excluded_track_properties?: Maybe<Array<Maybe<UserPropertyInput>>>
	environments?: Maybe<Array<Maybe<Scalars['String']>>>
	app_versions?: Maybe<Array<Maybe<Scalars['String']>>>
	date_range?: Maybe<DateRangeInput>
	length_range?: Maybe<LengthRangeInput>
	os?: Maybe<Scalars['String']>
	browser?: Maybe<Scalars['String']>
	device_id?: Maybe<Scalars['String']>
	visited_url?: Maybe<Scalars['String']>
	referrer?: Maybe<Scalars['String']>
	identified?: Maybe<Scalars['Boolean']>
	hide_viewed?: Maybe<Scalars['Boolean']>
	first_time?: Maybe<Scalars['Boolean']>
	show_live_sessions?: Maybe<Scalars['Boolean']>
	query?: Maybe<Scalars['String']>
}

export type DashboardParamsInput = {
	date_range?: Maybe<DateRangeInput>
	resolution_minutes?: Maybe<Scalars['Int']>
	timezone?: Maybe<Scalars['String']>
	units?: Maybe<Scalars['String']>
	aggregator?: Maybe<MetricAggregator>
	filters?: Maybe<Array<MetricTagFilterInput>>
	groups?: Maybe<Array<Scalars['String']>>
}

export type HistogramParamsInput = {
	date_range?: Maybe<DateRangeInput>
	buckets?: Maybe<Scalars['Int']>
	min_value?: Maybe<Scalars['Float']>
	min_percentile?: Maybe<Scalars['Float']>
	max_value?: Maybe<Scalars['Float']>
	max_percentile?: Maybe<Scalars['Float']>
	units?: Maybe<Scalars['String']>
	filters?: Maybe<Array<MetricTagFilterInput>>
}

export enum MetricTagFilterOp {
	Equals = 'equals',
	Contains = 'contains',
}

export type MetricTagFilter = {
	__typename?: 'MetricTagFilter'
	tag: Scalars['String']
	op: MetricTagFilterOp
	value: Scalars['String']
}

export type MetricTagFilterInput = {
	tag: Scalars['String']
	op: MetricTagFilterOp
	value: Scalars['String']
}

export type DateHistogramBucketSize = {
	calendar_interval: OpenSearchCalendarInterval
	multiple: Scalars['Int']
}

export type DateHistogramOptions = {
	bucket_size: DateHistogramBucketSize
	time_zone: Scalars['String']
	bounds: DateRangeInput
}

export enum NetworkRequestAttribute {
	Method = 'method',
	InitiatorType = 'initiator_type',
	Url = 'url',
	BodySize = 'body_size',
	ResponseSize = 'response_size',
	Status = 'status',
	Latency = 'latency',
	RequestId = 'request_id',
	GraphqlOperation = 'graphql_operation',
}

export type NetworkHistogramParamsInput = {
	lookback_days?: Maybe<Scalars['Int']>
	attribute?: Maybe<NetworkRequestAttribute>
}

export type SearchParams = {
	__typename?: 'SearchParams'
	user_properties?: Maybe<Array<Maybe<UserProperty>>>
	excluded_properties?: Maybe<Array<Maybe<UserProperty>>>
	track_properties?: Maybe<Array<Maybe<UserProperty>>>
	excluded_track_properties?: Maybe<Array<Maybe<UserProperty>>>
	environments?: Maybe<Array<Maybe<Scalars['String']>>>
	app_versions?: Maybe<Array<Maybe<Scalars['String']>>>
	date_range?: Maybe<DateRange>
	length_range?: Maybe<LengthRange>
	os?: Maybe<Scalars['String']>
	browser?: Maybe<Scalars['String']>
	visited_url?: Maybe<Scalars['String']>
	device_id?: Maybe<Scalars['String']>
	referrer?: Maybe<Scalars['String']>
	identified?: Maybe<Scalars['Boolean']>
	hide_viewed?: Maybe<Scalars['Boolean']>
	first_time?: Maybe<Scalars['Boolean']>
	show_live_sessions?: Maybe<Scalars['Boolean']>
	query?: Maybe<Scalars['String']>
}

export type AdminAboutYouDetails = {
	first_name: Scalars['String']
	last_name: Scalars['String']
	user_defined_role: Scalars['String']
	user_defined_persona: Scalars['String']
	referral: Scalars['String']
	phone?: Maybe<Scalars['String']>
}

export type ErrorSearchParamsInput = {
	date_range?: Maybe<DateRangeInput>
	os?: Maybe<Scalars['String']>
	browser?: Maybe<Scalars['String']>
	visited_url?: Maybe<Scalars['String']>
	state?: Maybe<ErrorState>
	event?: Maybe<Scalars['String']>
	type?: Maybe<Scalars['String']>
	query?: Maybe<Scalars['String']>
}

export type SessionAlertInput = {
	project_id: Scalars['ID']
	name: Scalars['String']
	count_threshold: Scalars['Int']
	threshold_window: Scalars['Int']
	slack_channels: Array<SanitizedSlackChannelInput>
	emails: Array<Scalars['String']>
	environments: Array<Scalars['String']>
	disabled: Scalars['Boolean']
	type: SessionAlertType
	user_properties: Array<UserPropertyInput>
	exclude_rules: Array<Scalars['String']>
	track_properties: Array<TrackPropertyInput>
}

export type ErrorSearchParams = {
	__typename?: 'ErrorSearchParams'
	date_range?: Maybe<DateRange>
	os?: Maybe<Scalars['String']>
	browser?: Maybe<Scalars['String']>
	visited_url?: Maybe<Scalars['String']>
	state?: Maybe<ErrorState>
	event?: Maybe<Scalars['String']>
	query?: Maybe<Scalars['String']>
}

export type DateRange = {
	__typename?: 'DateRange'
	start_date?: Maybe<Scalars['Timestamp']>
	end_date?: Maybe<Scalars['Timestamp']>
}

export type DateRangeInput = {
	start_date?: Maybe<Scalars['Timestamp']>
	end_date?: Maybe<Scalars['Timestamp']>
}

export type LengthRange = {
	__typename?: 'LengthRange'
	min?: Maybe<Scalars['Float']>
	max?: Maybe<Scalars['Float']>
}

export type LengthRangeInput = {
	min?: Maybe<Scalars['Float']>
	max?: Maybe<Scalars['Float']>
}

export type UserProperty = {
	__typename?: 'UserProperty'
	id: Scalars['ID']
	name: Scalars['String']
	value: Scalars['String']
}

export type UserPropertyInput = {
	id?: Maybe<Scalars['ID']>
	name: Scalars['String']
	value: Scalars['String']
}

export type User = {
	__typename?: 'User'
	id: Scalars['ID']
}

export type Admin = {
	__typename?: 'Admin'
	id: Scalars['ID']
	name: Scalars['String']
	uid: Scalars['String']
	email: Scalars['String']
	phone?: Maybe<Scalars['String']>
	photo_url?: Maybe<Scalars['String']>
	slack_im_channel_id?: Maybe<Scalars['String']>
	email_verified?: Maybe<Scalars['Boolean']>
	referral?: Maybe<Scalars['String']>
	user_defined_role?: Maybe<Scalars['String']>
	about_you_details_filled?: Maybe<Scalars['Boolean']>
	user_defined_persona?: Maybe<Scalars['String']>
}

export type WorkspaceAdminRole = {
	__typename?: 'WorkspaceAdminRole'
	admin: Admin
	role: Scalars['String']
}

export type SanitizedAdmin = {
	__typename?: 'SanitizedAdmin'
	id: Scalars['ID']
	name?: Maybe<Scalars['String']>
	email: Scalars['String']
	photo_url?: Maybe<Scalars['String']>
}

export type SanitizedAdminInput = {
	id: Scalars['ID']
	name?: Maybe<Scalars['String']>
	email: Scalars['String']
}

export type SessionsHistogram = {
	__typename?: 'SessionsHistogram'
	bucket_times: Array<Scalars['Timestamp']>
	sessions_without_errors: Array<Scalars['Int64']>
	sessions_with_errors: Array<Scalars['Int64']>
	total_sessions: Array<Scalars['Int64']>
}

export type ErrorsHistogram = {
	__typename?: 'ErrorsHistogram'
	bucket_times: Array<Scalars['Timestamp']>
	error_objects: Array<Scalars['Int64']>
}

export type SessionResults = {
	__typename?: 'SessionResults'
	sessions: Array<Session>
	totalCount: Scalars['Int64']
}

export type ErrorResults = {
	__typename?: 'ErrorResults'
	error_groups: Array<ErrorGroup>
	totalCount: Scalars['Int64']
}

export type ExternalAttachment = {
	__typename?: 'ExternalAttachment'
	id: Scalars['ID']
	integration_type: IntegrationType
	external_id: Scalars['String']
	title?: Maybe<Scalars['String']>
	session_comment_id?: Maybe<Scalars['Int']>
	error_comment_id?: Maybe<Scalars['Int']>
}

export type SessionComment = {
	__typename?: 'SessionComment'
	id: Scalars['ID']
	project_id: Scalars['ID']
	timestamp?: Maybe<Scalars['Int']>
	created_at: Scalars['Timestamp']
	updated_at: Scalars['Timestamp']
	session_id: Scalars['Int']
	session_secure_id: Scalars['String']
	author?: Maybe<SanitizedAdmin>
	text: Scalars['String']
	x_coordinate?: Maybe<Scalars['Float']>
	y_coordinate?: Maybe<Scalars['Float']>
	type: SessionCommentType
	metadata?: Maybe<Scalars['Any']>
	tags: Array<Maybe<Scalars['String']>>
	attachments: Array<Maybe<ExternalAttachment>>
	replies: Array<Maybe<CommentReply>>
}

export type SlackSyncResponse = {
	__typename?: 'SlackSyncResponse'
	success: Scalars['Boolean']
	newChannelsAddedCount: Scalars['Int']
}

export type SessionCommentTag = {
	__typename?: 'SessionCommentTag'
	id: Scalars['ID']
	name: Scalars['String']
}

export type SessionCommentTagInput = {
	id?: Maybe<Scalars['ID']>
	name: Scalars['String']
}

export type ErrorComment = {
	__typename?: 'ErrorComment'
	id: Scalars['ID']
	project_id: Scalars['ID']
	created_at: Scalars['Timestamp']
	error_id: Scalars['Int']
	error_secure_id: Scalars['String']
	updated_at: Scalars['Timestamp']
	author: SanitizedAdmin
	text: Scalars['String']
	attachments: Array<Maybe<ExternalAttachment>>
	replies: Array<Maybe<CommentReply>>
}

export type CommentReply = {
	__typename?: 'CommentReply'
	id: Scalars['ID']
	created_at: Scalars['Timestamp']
	updated_at: Scalars['Timestamp']
	author: SanitizedAdmin
	text: Scalars['String']
}

export enum SessionLifecycle {
	All = 'All',
	Live = 'Live',
	Completed = 'Completed',
}

export type DailySessionCount = {
	__typename?: 'DailySessionCount'
	project_id: Scalars['ID']
	date: Scalars['Timestamp']
	count: Scalars['Int64']
}

export type DailyErrorCount = {
	__typename?: 'DailyErrorCount'
	project_id: Scalars['ID']
	date: Scalars['Timestamp']
	count: Scalars['Int64']
}

export type ErrorDistributionItem = {
	__typename?: 'ErrorDistributionItem'
	name: Scalars['String']
	value: Scalars['Int64']
}

export type Dashboard = {
	__typename?: 'Dashboard'
	id: Scalars['ID']
	project_id: Scalars['ID']
	layout: Scalars['String']
	name: Scalars['String']
	last_admin_to_edit_id: Scalars['ID']
}

export type SanitizedSlackChannel = {
	__typename?: 'SanitizedSlackChannel'
	webhook_channel?: Maybe<Scalars['String']>
	webhook_channel_id?: Maybe<Scalars['String']>
}

export type SanitizedSlackChannelInput = {
	webhook_channel_name?: Maybe<Scalars['String']>
	webhook_channel_id?: Maybe<Scalars['String']>
}

export type ErrorAlert = {
	__typename?: 'ErrorAlert'
	id: Scalars['ID']
	updated_at: Scalars['Timestamp']
	Name?: Maybe<Scalars['String']>
	ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>
	EmailsToNotify: Array<Maybe<Scalars['String']>>
	ExcludedEnvironments: Array<Maybe<Scalars['String']>>
	CountThreshold: Scalars['Int']
	ThresholdWindow?: Maybe<Scalars['Int']>
	LastAdminToEditID?: Maybe<Scalars['ID']>
	Type: Scalars['String']
	RegexGroups: Array<Maybe<Scalars['String']>>
	Frequency: Scalars['Int']
	DailyFrequency: Array<Maybe<Scalars['Int64']>>
	disabled: Scalars['Boolean']
}

export type TrackProperty = {
	__typename?: 'TrackProperty'
	id: Scalars['ID']
	name: Scalars['String']
	value: Scalars['String']
}

export type TrackPropertyInput = {
	id?: Maybe<Scalars['ID']>
	name: Scalars['String']
	value: Scalars['String']
}

export type SessionAlert = {
	__typename?: 'SessionAlert'
	id: Scalars['ID']
	updated_at: Scalars['Timestamp']
	Name?: Maybe<Scalars['String']>
	ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>
	EmailsToNotify: Array<Maybe<Scalars['String']>>
	ExcludedEnvironments: Array<Maybe<Scalars['String']>>
	CountThreshold: Scalars['Int']
	TrackProperties: Array<Maybe<TrackProperty>>
	UserProperties: Array<Maybe<UserProperty>>
	ThresholdWindow?: Maybe<Scalars['Int']>
	LastAdminToEditID?: Maybe<Scalars['ID']>
	Type: Scalars['String']
	ExcludeRules: Array<Maybe<Scalars['String']>>
	DailyFrequency: Array<Maybe<Scalars['Int64']>>
	disabled: Scalars['Boolean']
}

export type WorkspaceInviteLink = {
	__typename?: 'WorkspaceInviteLink'
	id: Scalars['ID']
	invitee_email?: Maybe<Scalars['String']>
	invitee_role: Scalars['String']
	expiration_date: Scalars['Timestamp']
	secret: Scalars['String']
}

export type SessionPayload = {
	__typename?: 'SessionPayload'
	events: Array<Maybe<Scalars['Any']>>
	errors: Array<Maybe<ErrorObject>>
	rage_clicks: Array<RageClickEvent>
	session_comments: Array<Maybe<SessionComment>>
	last_user_interaction_time: Scalars['Timestamp']
}

export type Metric = {
	__typename?: 'Metric'
	name: Scalars['String']
	value: Scalars['Float']
}

export type DashboardPayload = {
	__typename?: 'DashboardPayload'
	date: Scalars['String']
	value: Scalars['Float']
	aggregator?: Maybe<MetricAggregator>
	group?: Maybe<Scalars['String']>
}

export type HistogramBucket = {
	__typename?: 'HistogramBucket'
	bucket: Scalars['Float']
	range_start: Scalars['Float']
	range_end: Scalars['Float']
	count: Scalars['Int']
}

export type HistogramPayload = {
	__typename?: 'HistogramPayload'
	buckets: Array<HistogramBucket>
	min: Scalars['Float']
	max: Scalars['Float']
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

export enum DashboardChartType {
	Timeline = 'Timeline',
	TimelineBar = 'TimelineBar',
	Histogram = 'Histogram',
}

export enum MetricAggregator {
	Avg = 'Avg',
	P50 = 'P50',
	P75 = 'P75',
	P90 = 'P90',
	P95 = 'P95',
	P99 = 'P99',
	Max = 'Max',
	Count = 'Count',
	Sum = 'Sum',
}

export type DashboardMetricConfigInput = {
	name: Scalars['String']
	description: Scalars['String']
	component_type?: Maybe<MetricViewComponentType>
	max_good_value?: Maybe<Scalars['Float']>
	max_needs_improvement_value?: Maybe<Scalars['Float']>
	poor_value?: Maybe<Scalars['Float']>
	units?: Maybe<Scalars['String']>
	help_article?: Maybe<Scalars['String']>
	chart_type?: Maybe<DashboardChartType>
	aggregator?: Maybe<MetricAggregator>
	min_value?: Maybe<Scalars['Float']>
	min_percentile?: Maybe<Scalars['Float']>
	max_value?: Maybe<Scalars['Float']>
	max_percentile?: Maybe<Scalars['Float']>
	filters?: Maybe<Array<MetricTagFilterInput>>
	groups?: Maybe<Array<Scalars['String']>>
}

export enum MetricViewComponentType {
	KeyPerformanceGauge = 'KeyPerformanceGauge',
	SessionCountChart = 'SessionCountChart',
	ErrorCountChart = 'ErrorCountChart',
	ReferrersTable = 'ReferrersTable',
	ActiveUsersTable = 'ActiveUsersTable',
	RageClicksTable = 'RageClicksTable',
	TopRoutesTable = 'TopRoutesTable',
}

export type DashboardMetricConfig = {
	__typename?: 'DashboardMetricConfig'
	name: Scalars['String']
	description: Scalars['String']
	component_type?: Maybe<MetricViewComponentType>
	max_good_value?: Maybe<Scalars['Float']>
	max_needs_improvement_value?: Maybe<Scalars['Float']>
	poor_value?: Maybe<Scalars['Float']>
	units?: Maybe<Scalars['String']>
	help_article?: Maybe<Scalars['String']>
	chart_type?: Maybe<DashboardChartType>
	aggregator?: Maybe<MetricAggregator>
	min_value?: Maybe<Scalars['Float']>
	min_percentile?: Maybe<Scalars['Float']>
	max_value?: Maybe<Scalars['Float']>
	max_percentile?: Maybe<Scalars['Float']>
	filters?: Maybe<Array<MetricTagFilter>>
	groups?: Maybe<Array<Scalars['String']>>
}

export type DashboardDefinition = {
	__typename?: 'DashboardDefinition'
	id: Scalars['ID']
	updated_at: Scalars['Timestamp']
	project_id: Scalars['ID']
	name: Scalars['String']
	metrics: Array<DashboardMetricConfig>
	last_admin_to_edit_id?: Maybe<Scalars['Int']>
	layout?: Maybe<Scalars['String']>
	is_default?: Maybe<Scalars['Boolean']>
}

export type MetricPreview = {
	__typename?: 'MetricPreview'
	date: Scalars['Timestamp']
	value: Scalars['Float']
}

export type MetricMonitor = {
	__typename?: 'MetricMonitor'
	id: Scalars['ID']
	updated_at: Scalars['Timestamp']
	name: Scalars['String']
	channels_to_notify: Array<Maybe<SanitizedSlackChannel>>
	emails_to_notify: Array<Maybe<Scalars['String']>>
	aggregator: MetricAggregator
	period_minutes?: Maybe<Scalars['Int']>
	metric_to_monitor: Scalars['String']
	last_admin_to_edit_id: Scalars['ID']
	threshold: Scalars['Float']
	units?: Maybe<Scalars['String']>
	disabled: Scalars['Boolean']
	filters?: Maybe<Array<MetricTagFilter>>
}

export type EventChunk = {
	__typename?: 'EventChunk'
	session_id: Scalars['Int']
	chunk_index: Scalars['Int']
	timestamp: Scalars['Int64']
}

export type VercelProjectMappingInput = {
	vercel_project_id: Scalars['String']
	project_id: Scalars['ID']
}

export type VercelProjectMapping = {
	__typename?: 'VercelProjectMapping'
	vercel_project_id: Scalars['String']
	project_id: Scalars['ID']
}

export type OAuthClient = {
	__typename?: 'OAuthClient'
	id: Scalars['String']
	created_at: Scalars['Timestamp']
	app_name: Scalars['String']
}

export type Query = {
	__typename?: 'Query'
	accounts?: Maybe<Array<Maybe<Account>>>
	account_details: AccountDetails
	session?: Maybe<Session>
	events?: Maybe<Array<Maybe<Scalars['Any']>>>
	session_intervals: Array<SessionInterval>
	timeline_indicator_events: Array<TimelineIndicatorEvent>
	rage_clicks: Array<RageClickEvent>
	rageClicksForProject: Array<RageClickEventForProject>
	error_groups_opensearch: ErrorResults
	errors_histogram: ErrorsHistogram
	error_group?: Maybe<ErrorGroup>
	messages?: Maybe<Array<Maybe<Scalars['Any']>>>
	enhanced_user_details?: Maybe<EnhancedUserDetailsResult>
	errors?: Maybe<Array<Maybe<ErrorObject>>>
	resources?: Maybe<Array<Maybe<Scalars['Any']>>>
	web_vitals: Array<Metric>
	session_comments: Array<Maybe<SessionComment>>
	session_comment_tags_for_project: Array<SessionCommentTag>
	session_comments_for_admin: Array<Maybe<SessionComment>>
	session_comments_for_project: Array<Maybe<SessionComment>>
	isSessionPending?: Maybe<Scalars['Boolean']>
	error_comments: Array<Maybe<ErrorComment>>
	error_comments_for_admin: Array<Maybe<ErrorComment>>
	error_comments_for_project: Array<Maybe<ErrorComment>>
	workspace_admins: Array<WorkspaceAdminRole>
	workspace_admins_by_project_id: Array<WorkspaceAdminRole>
	isIntegrated?: Maybe<Scalars['Boolean']>
	isBackendIntegrated?: Maybe<Scalars['Boolean']>
	unprocessedSessionsCount?: Maybe<Scalars['Int64']>
	liveUsersCount?: Maybe<Scalars['Int64']>
	adminHasCreatedComment?: Maybe<Scalars['Boolean']>
	projectHasViewedASession?: Maybe<Session>
	dailySessionsCount: Array<Maybe<DailySessionCount>>
	dailyErrorsCount: Array<Maybe<DailyErrorCount>>
	dailyErrorFrequency: Array<Scalars['Int64']>
	errorDistribution: Array<Maybe<ErrorDistributionItem>>
	referrers: Array<Maybe<ReferrerTablePayload>>
	newUsersCount?: Maybe<NewUsersCount>
	topUsers: Array<Maybe<TopUsersPayload>>
	averageSessionLength?: Maybe<AverageSessionLength>
	userFingerprintCount?: Maybe<UserFingerprintCount>
	sessions_opensearch: SessionResults
	sessions_histogram: SessionsHistogram
	field_types: Array<Field>
	fields_opensearch: Array<Scalars['String']>
	error_fields_opensearch: Array<Scalars['String']>
	quickFields_opensearch: Array<Maybe<Field>>
	billingDetailsForProject?: Maybe<BillingDetails>
	billingDetails: BillingDetails
	field_suggestion?: Maybe<Array<Maybe<Field>>>
	property_suggestion?: Maybe<Array<Maybe<Field>>>
	error_field_suggestion?: Maybe<Array<Maybe<ErrorField>>>
	projects?: Maybe<Array<Maybe<Project>>>
	workspaces?: Maybe<Array<Maybe<Workspace>>>
	workspaces_count: Scalars['Int64']
	joinable_workspaces?: Maybe<Array<Maybe<Workspace>>>
	error_alerts: Array<Maybe<ErrorAlert>>
	session_feedback_alerts: Array<Maybe<SessionAlert>>
	new_user_alerts?: Maybe<Array<Maybe<SessionAlert>>>
	track_properties_alerts: Array<Maybe<SessionAlert>>
	user_properties_alerts: Array<Maybe<SessionAlert>>
	new_session_alerts: Array<Maybe<SessionAlert>>
	rage_click_alerts: Array<Maybe<SessionAlert>>
	projectSuggestion: Array<Maybe<Project>>
	workspaceSuggestion: Array<Maybe<Workspace>>
	environment_suggestion?: Maybe<Array<Maybe<Field>>>
	app_version_suggestion: Array<Maybe<Scalars['String']>>
	identifier_suggestion: Array<Scalars['String']>
	slack_channel_suggestion?: Maybe<Array<Maybe<SanitizedSlackChannel>>>
	slack_members: Array<Maybe<SanitizedSlackChannel>>
	generate_zapier_access_token: Scalars['String']
	is_integrated_with: Scalars['Boolean']
	vercel_projects: Array<VercelProject>
	vercel_project_mappings: Array<VercelProjectMapping>
	linear_teams?: Maybe<Array<LinearTeam>>
	project?: Maybe<Project>
	workspace?: Maybe<Workspace>
	workspace_invite_links: WorkspaceInviteLink
	workspace_for_project?: Maybe<Workspace>
	admin?: Maybe<Admin>
	admin_role?: Maybe<WorkspaceAdminRole>
	admin_role_by_project?: Maybe<WorkspaceAdminRole>
	segments?: Maybe<Array<Maybe<Segment>>>
	error_segments?: Maybe<Array<Maybe<ErrorSegment>>>
	api_key_to_org_id?: Maybe<Scalars['ID']>
	customer_portal_url: Scalars['String']
	subscription_details: SubscriptionDetails
	dashboard_definitions: Array<Maybe<DashboardDefinition>>
	suggested_metrics: Array<Scalars['String']>
	metric_tags: Array<Scalars['String']>
	metric_tag_values: Array<Scalars['String']>
	metrics_timeline: Array<Maybe<DashboardPayload>>
	metrics_histogram?: Maybe<HistogramPayload>
	network_histogram?: Maybe<CategoryHistogramPayload>
	metric_monitors: Array<Maybe<MetricMonitor>>
	event_chunk_url: Scalars['String']
	event_chunks: Array<EventChunk>
	sourcemap_files: Array<S3File>
	sourcemap_versions: Array<Scalars['String']>
	oauth_client_metadata?: Maybe<OAuthClient>
}

export type QueryAccount_DetailsArgs = {
	workspace_id: Scalars['ID']
}

export type QuerySessionArgs = {
	secure_id: Scalars['String']
}

export type QueryEventsArgs = {
	session_secure_id: Scalars['String']
}

export type QuerySession_IntervalsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryTimeline_Indicator_EventsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryRage_ClicksArgs = {
	session_secure_id: Scalars['String']
}

export type QueryRageClicksForProjectArgs = {
	project_id: Scalars['ID']
	lookBackPeriod: Scalars['Int']
}

export type QueryError_Groups_OpensearchArgs = {
	project_id: Scalars['ID']
	count: Scalars['Int']
	query: Scalars['String']
	page?: Maybe<Scalars['Int']>
}

export type QueryErrors_HistogramArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
	histogram_options: DateHistogramOptions
}

export type QueryError_GroupArgs = {
	secure_id: Scalars['String']
}

export type QueryMessagesArgs = {
	session_secure_id: Scalars['String']
}

export type QueryEnhanced_User_DetailsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryErrorsArgs = {
	session_secure_id: Scalars['String']
}

export type QueryResourcesArgs = {
	session_secure_id: Scalars['String']
}

export type QueryWeb_VitalsArgs = {
	session_secure_id: Scalars['String']
}

export type QuerySession_CommentsArgs = {
	session_secure_id: Scalars['String']
}

export type QuerySession_Comment_Tags_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QuerySession_Comments_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryIsSessionPendingArgs = {
	session_secure_id: Scalars['String']
}

export type QueryError_CommentsArgs = {
	error_group_secure_id: Scalars['String']
}

export type QueryError_Comments_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryWorkspace_AdminsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryWorkspace_Admins_By_Project_IdArgs = {
	project_id: Scalars['ID']
}

export type QueryIsIntegratedArgs = {
	project_id: Scalars['ID']
}

export type QueryIsBackendIntegratedArgs = {
	project_id: Scalars['ID']
}

export type QueryUnprocessedSessionsCountArgs = {
	project_id: Scalars['ID']
}

export type QueryLiveUsersCountArgs = {
	project_id: Scalars['ID']
}

export type QueryAdminHasCreatedCommentArgs = {
	admin_id: Scalars['ID']
}

export type QueryProjectHasViewedASessionArgs = {
	project_id: Scalars['ID']
}

export type QueryDailySessionsCountArgs = {
	project_id: Scalars['ID']
	date_range: DateRangeInput
}

export type QueryDailyErrorsCountArgs = {
	project_id: Scalars['ID']
	date_range: DateRangeInput
}

export type QueryDailyErrorFrequencyArgs = {
	project_id: Scalars['ID']
	error_group_secure_id: Scalars['String']
	date_offset: Scalars['Int']
}

export type QueryErrorDistributionArgs = {
	project_id: Scalars['ID']
	error_group_secure_id: Scalars['String']
	property: Scalars['String']
}

export type QueryReferrersArgs = {
	project_id: Scalars['ID']
	lookBackPeriod: Scalars['Int']
}

export type QueryNewUsersCountArgs = {
	project_id: Scalars['ID']
	lookBackPeriod: Scalars['Int']
}

export type QueryTopUsersArgs = {
	project_id: Scalars['ID']
	lookBackPeriod: Scalars['Int']
}

export type QueryAverageSessionLengthArgs = {
	project_id: Scalars['ID']
	lookBackPeriod: Scalars['Int']
}

export type QueryUserFingerprintCountArgs = {
	project_id: Scalars['ID']
	lookBackPeriod: Scalars['Int']
}

export type QuerySessions_OpensearchArgs = {
	project_id: Scalars['ID']
	count: Scalars['Int']
	query: Scalars['String']
	sort_desc: Scalars['Boolean']
	page?: Maybe<Scalars['Int']>
}

export type QuerySessions_HistogramArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
	histogram_options: DateHistogramOptions
}

export type QueryField_TypesArgs = {
	project_id: Scalars['ID']
}

export type QueryFields_OpensearchArgs = {
	project_id: Scalars['ID']
	count: Scalars['Int']
	field_type: Scalars['String']
	field_name: Scalars['String']
	query: Scalars['String']
}

export type QueryError_Fields_OpensearchArgs = {
	project_id: Scalars['ID']
	count: Scalars['Int']
	field_type: Scalars['String']
	field_name: Scalars['String']
	query: Scalars['String']
}

export type QueryQuickFields_OpensearchArgs = {
	project_id: Scalars['ID']
	count: Scalars['Int']
	query: Scalars['String']
}

export type QueryBillingDetailsForProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryBillingDetailsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryField_SuggestionArgs = {
	project_id: Scalars['ID']
	name: Scalars['String']
	query: Scalars['String']
}

export type QueryProperty_SuggestionArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
	type: Scalars['String']
}

export type QueryError_Field_SuggestionArgs = {
	project_id: Scalars['ID']
	name: Scalars['String']
	query: Scalars['String']
}

export type QueryError_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QuerySession_Feedback_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryNew_User_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryTrack_Properties_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryUser_Properties_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryNew_Session_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryRage_Click_AlertsArgs = {
	project_id: Scalars['ID']
}

export type QueryProjectSuggestionArgs = {
	query: Scalars['String']
}

export type QueryWorkspaceSuggestionArgs = {
	query: Scalars['String']
}

export type QueryEnvironment_SuggestionArgs = {
	project_id: Scalars['ID']
}

export type QueryApp_Version_SuggestionArgs = {
	project_id: Scalars['ID']
}

export type QueryIdentifier_SuggestionArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
}

export type QuerySlack_Channel_SuggestionArgs = {
	project_id: Scalars['ID']
}

export type QuerySlack_MembersArgs = {
	project_id: Scalars['ID']
}

export type QueryGenerate_Zapier_Access_TokenArgs = {
	project_id: Scalars['ID']
}

export type QueryIs_Integrated_WithArgs = {
	integration_type: IntegrationType
	project_id: Scalars['ID']
}

export type QueryVercel_ProjectsArgs = {
	project_id: Scalars['ID']
}

export type QueryVercel_Project_MappingsArgs = {
	project_id: Scalars['ID']
}

export type QueryLinear_TeamsArgs = {
	project_id: Scalars['ID']
}

export type QueryProjectArgs = {
	id: Scalars['ID']
}

export type QueryWorkspaceArgs = {
	id: Scalars['ID']
}

export type QueryWorkspace_Invite_LinksArgs = {
	workspace_id: Scalars['ID']
}

export type QueryWorkspace_For_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QueryAdmin_RoleArgs = {
	workspace_id: Scalars['ID']
}

export type QueryAdmin_Role_By_ProjectArgs = {
	project_id: Scalars['ID']
}

export type QuerySegmentsArgs = {
	project_id: Scalars['ID']
}

export type QueryError_SegmentsArgs = {
	project_id: Scalars['ID']
}

export type QueryApi_Key_To_Org_IdArgs = {
	api_key: Scalars['String']
}

export type QueryCustomer_Portal_UrlArgs = {
	workspace_id: Scalars['ID']
}

export type QuerySubscription_DetailsArgs = {
	workspace_id: Scalars['ID']
}

export type QueryDashboard_DefinitionsArgs = {
	project_id: Scalars['ID']
}

export type QuerySuggested_MetricsArgs = {
	project_id: Scalars['ID']
	prefix: Scalars['String']
}

export type QueryMetric_TagsArgs = {
	project_id: Scalars['ID']
	metric_name: Scalars['String']
}

export type QueryMetric_Tag_ValuesArgs = {
	project_id: Scalars['ID']
	metric_name: Scalars['String']
	tag_name: Scalars['String']
}

export type QueryMetrics_TimelineArgs = {
	project_id: Scalars['ID']
	metric_name: Scalars['String']
	params: DashboardParamsInput
}

export type QueryMetrics_HistogramArgs = {
	project_id: Scalars['ID']
	metric_name: Scalars['String']
	params: HistogramParamsInput
}

export type QueryNetwork_HistogramArgs = {
	project_id: Scalars['ID']
	params: NetworkHistogramParamsInput
}

export type QueryMetric_MonitorsArgs = {
	project_id: Scalars['ID']
	metric_name?: Maybe<Scalars['String']>
}

export type QueryEvent_Chunk_UrlArgs = {
	secure_id: Scalars['String']
	index: Scalars['Int']
}

export type QueryEvent_ChunksArgs = {
	secure_id: Scalars['String']
}

export type QuerySourcemap_FilesArgs = {
	project_id: Scalars['ID']
	version?: Maybe<Scalars['String']>
}

export type QuerySourcemap_VersionsArgs = {
	project_id: Scalars['ID']
}

export type QueryOauth_Client_MetadataArgs = {
	client_id: Scalars['String']
}

export type Mutation = {
	__typename?: 'Mutation'
	updateAdminAboutYouDetails: Scalars['Boolean']
	createProject?: Maybe<Project>
	createWorkspace?: Maybe<Workspace>
	editProject?: Maybe<Project>
	editWorkspace?: Maybe<Workspace>
	markSessionAsViewed?: Maybe<Session>
	markSessionAsStarred?: Maybe<Session>
	updateErrorGroupState?: Maybe<ErrorGroup>
	deleteProject?: Maybe<Scalars['Boolean']>
	sendAdminProjectInvite?: Maybe<Scalars['String']>
	sendAdminWorkspaceInvite?: Maybe<Scalars['String']>
	addAdminToWorkspace?: Maybe<Scalars['ID']>
	joinWorkspace?: Maybe<Scalars['ID']>
	updateAllowedEmailOrigins?: Maybe<Scalars['ID']>
	changeAdminRole: Scalars['Boolean']
	deleteAdminFromProject?: Maybe<Scalars['ID']>
	deleteAdminFromWorkspace?: Maybe<Scalars['ID']>
	createSegment?: Maybe<Segment>
	emailSignup: Scalars['String']
	editSegment?: Maybe<Scalars['Boolean']>
	deleteSegment?: Maybe<Scalars['Boolean']>
	createErrorSegment?: Maybe<ErrorSegment>
	editErrorSegment?: Maybe<Scalars['Boolean']>
	deleteErrorSegment?: Maybe<Scalars['Boolean']>
	createOrUpdateStripeSubscription?: Maybe<Scalars['String']>
	updateBillingDetails?: Maybe<Scalars['Boolean']>
	createSessionComment?: Maybe<SessionComment>
	createIssueForSessionComment?: Maybe<SessionComment>
	deleteSessionComment?: Maybe<Scalars['Boolean']>
	muteSessionCommentThread?: Maybe<Scalars['Boolean']>
	replyToSessionComment?: Maybe<CommentReply>
	createErrorComment?: Maybe<ErrorComment>
	muteErrorCommentThread?: Maybe<Scalars['Boolean']>
	createIssueForErrorComment?: Maybe<ErrorComment>
	deleteErrorComment?: Maybe<Scalars['Boolean']>
	replyToErrorComment?: Maybe<CommentReply>
	openSlackConversation?: Maybe<Scalars['Boolean']>
	addIntegrationToProject: Scalars['Boolean']
	removeIntegrationFromProject: Scalars['Boolean']
	syncSlackIntegration: SlackSyncResponse
	createDefaultAlerts?: Maybe<Scalars['Boolean']>
	createMetricMonitor?: Maybe<MetricMonitor>
	updateMetricMonitor?: Maybe<MetricMonitor>
	createErrorAlert?: Maybe<ErrorAlert>
	updateErrorAlert?: Maybe<ErrorAlert>
	deleteErrorAlert?: Maybe<ErrorAlert>
	deleteMetricMonitor?: Maybe<MetricMonitor>
	updateSessionAlertIsDisabled?: Maybe<SessionAlert>
	updateSessionAlert?: Maybe<SessionAlert>
	createSessionAlert?: Maybe<SessionAlert>
	deleteSessionAlert?: Maybe<SessionAlert>
	updateSessionIsPublic?: Maybe<Session>
	updateErrorGroupIsPublic?: Maybe<ErrorGroup>
	updateAllowMeterOverage?: Maybe<Workspace>
	submitRegistrationForm?: Maybe<Scalars['Boolean']>
	requestAccess?: Maybe<Scalars['Boolean']>
	modifyClearbitIntegration?: Maybe<Scalars['Boolean']>
	upsertDashboard: Scalars['ID']
	deleteDashboard: Scalars['Boolean']
	deleteSessions: Scalars['Boolean']
	updateVercelProjectMappings: Scalars['Boolean']
}

export type MutationUpdateAdminAboutYouDetailsArgs = {
	adminDetails: AdminAboutYouDetails
}

export type MutationCreateProjectArgs = {
	name: Scalars['String']
	workspace_id: Scalars['ID']
}

export type MutationCreateWorkspaceArgs = {
	name: Scalars['String']
}

export type MutationEditProjectArgs = {
	id: Scalars['ID']
	name?: Maybe<Scalars['String']>
	billing_email?: Maybe<Scalars['String']>
	excluded_users?: Maybe<Scalars['StringArray']>
	error_json_paths?: Maybe<Scalars['StringArray']>
	rage_click_window_seconds?: Maybe<Scalars['Int']>
	rage_click_radius_pixels?: Maybe<Scalars['Int']>
	rage_click_count?: Maybe<Scalars['Int']>
	backend_domains?: Maybe<Scalars['StringArray']>
}

export type MutationEditWorkspaceArgs = {
	id: Scalars['ID']
	name?: Maybe<Scalars['String']>
}

export type MutationMarkSessionAsViewedArgs = {
	secure_id: Scalars['String']
	viewed?: Maybe<Scalars['Boolean']>
}

export type MutationMarkSessionAsStarredArgs = {
	secure_id: Scalars['String']
	starred?: Maybe<Scalars['Boolean']>
}

export type MutationUpdateErrorGroupStateArgs = {
	secure_id: Scalars['String']
	state: Scalars['String']
}

export type MutationDeleteProjectArgs = {
	id: Scalars['ID']
}

export type MutationSendAdminProjectInviteArgs = {
	project_id: Scalars['ID']
	email: Scalars['String']
	base_url: Scalars['String']
}

export type MutationSendAdminWorkspaceInviteArgs = {
	workspace_id: Scalars['ID']
	email: Scalars['String']
	base_url: Scalars['String']
	role: Scalars['String']
}

export type MutationAddAdminToWorkspaceArgs = {
	workspace_id: Scalars['ID']
	invite_id: Scalars['String']
}

export type MutationJoinWorkspaceArgs = {
	workspace_id: Scalars['ID']
}

export type MutationUpdateAllowedEmailOriginsArgs = {
	workspace_id: Scalars['ID']
	allowed_auto_join_email_origins: Scalars['String']
}

export type MutationChangeAdminRoleArgs = {
	workspace_id: Scalars['ID']
	admin_id: Scalars['ID']
	new_role: Scalars['String']
}

export type MutationDeleteAdminFromProjectArgs = {
	project_id: Scalars['ID']
	admin_id: Scalars['ID']
}

export type MutationDeleteAdminFromWorkspaceArgs = {
	workspace_id: Scalars['ID']
	admin_id: Scalars['ID']
}

export type MutationCreateSegmentArgs = {
	project_id: Scalars['ID']
	name: Scalars['String']
	params: SearchParamsInput
}

export type MutationEmailSignupArgs = {
	email: Scalars['String']
}

export type MutationEditSegmentArgs = {
	id: Scalars['ID']
	project_id: Scalars['ID']
	params: SearchParamsInput
}

export type MutationDeleteSegmentArgs = {
	segment_id: Scalars['ID']
}

export type MutationCreateErrorSegmentArgs = {
	project_id: Scalars['ID']
	name: Scalars['String']
	params: ErrorSearchParamsInput
}

export type MutationEditErrorSegmentArgs = {
	id: Scalars['ID']
	project_id: Scalars['ID']
	params: ErrorSearchParamsInput
}

export type MutationDeleteErrorSegmentArgs = {
	segment_id: Scalars['ID']
}

export type MutationCreateOrUpdateStripeSubscriptionArgs = {
	workspace_id: Scalars['ID']
	plan_type: PlanType
	interval: SubscriptionInterval
}

export type MutationUpdateBillingDetailsArgs = {
	workspace_id: Scalars['ID']
}

export type MutationCreateSessionCommentArgs = {
	project_id: Scalars['ID']
	session_secure_id: Scalars['String']
	session_timestamp: Scalars['Int']
	text: Scalars['String']
	text_for_email: Scalars['String']
	x_coordinate: Scalars['Float']
	y_coordinate: Scalars['Float']
	tagged_admins: Array<Maybe<SanitizedAdminInput>>
	tagged_slack_users: Array<Maybe<SanitizedSlackChannelInput>>
	session_url: Scalars['String']
	time: Scalars['Float']
	author_name: Scalars['String']
	session_image?: Maybe<Scalars['String']>
	issue_title?: Maybe<Scalars['String']>
	issue_description?: Maybe<Scalars['String']>
	issue_team_id?: Maybe<Scalars['String']>
	integrations: Array<Maybe<IntegrationType>>
	tags: Array<Maybe<SessionCommentTagInput>>
	additional_context?: Maybe<Scalars['String']>
}

export type MutationCreateIssueForSessionCommentArgs = {
	project_id: Scalars['ID']
	session_url: Scalars['String']
	session_comment_id: Scalars['Int']
	author_name: Scalars['String']
	text_for_attachment: Scalars['String']
	time: Scalars['Float']
	issue_title?: Maybe<Scalars['String']>
	issue_description?: Maybe<Scalars['String']>
	issue_team_id?: Maybe<Scalars['String']>
	integrations: Array<Maybe<IntegrationType>>
}

export type MutationDeleteSessionCommentArgs = {
	id: Scalars['ID']
}

export type MutationMuteSessionCommentThreadArgs = {
	id: Scalars['ID']
	has_muted?: Maybe<Scalars['Boolean']>
}

export type MutationReplyToSessionCommentArgs = {
	comment_id: Scalars['ID']
	text: Scalars['String']
	text_for_email: Scalars['String']
	sessionURL: Scalars['String']
	tagged_admins: Array<Maybe<SanitizedAdminInput>>
	tagged_slack_users: Array<Maybe<SanitizedSlackChannelInput>>
}

export type MutationCreateErrorCommentArgs = {
	project_id: Scalars['ID']
	error_group_secure_id: Scalars['String']
	text: Scalars['String']
	text_for_email: Scalars['String']
	tagged_admins: Array<Maybe<SanitizedAdminInput>>
	tagged_slack_users: Array<Maybe<SanitizedSlackChannelInput>>
	error_url: Scalars['String']
	author_name: Scalars['String']
	issue_title?: Maybe<Scalars['String']>
	issue_description?: Maybe<Scalars['String']>
	issue_team_id?: Maybe<Scalars['String']>
	integrations: Array<Maybe<IntegrationType>>
}

export type MutationMuteErrorCommentThreadArgs = {
	id: Scalars['ID']
	has_muted?: Maybe<Scalars['Boolean']>
}

export type MutationCreateIssueForErrorCommentArgs = {
	project_id: Scalars['ID']
	error_url: Scalars['String']
	error_comment_id: Scalars['Int']
	author_name: Scalars['String']
	text_for_attachment: Scalars['String']
	issue_title?: Maybe<Scalars['String']>
	issue_description?: Maybe<Scalars['String']>
	issue_team_id?: Maybe<Scalars['String']>
	integrations: Array<Maybe<IntegrationType>>
}

export type MutationDeleteErrorCommentArgs = {
	id: Scalars['ID']
}

export type MutationReplyToErrorCommentArgs = {
	comment_id: Scalars['ID']
	text: Scalars['String']
	text_for_email: Scalars['String']
	errorURL: Scalars['String']
	tagged_admins: Array<Maybe<SanitizedAdminInput>>
	tagged_slack_users: Array<Maybe<SanitizedSlackChannelInput>>
}

export type MutationOpenSlackConversationArgs = {
	project_id: Scalars['ID']
	code: Scalars['String']
	redirect_path: Scalars['String']
}

export type MutationAddIntegrationToProjectArgs = {
	integration_type?: Maybe<IntegrationType>
	project_id: Scalars['ID']
	code: Scalars['String']
}

export type MutationRemoveIntegrationFromProjectArgs = {
	integration_type?: Maybe<IntegrationType>
	project_id: Scalars['ID']
}

export type MutationSyncSlackIntegrationArgs = {
	project_id: Scalars['ID']
}

export type MutationCreateDefaultAlertsArgs = {
	project_id: Scalars['ID']
	alert_types: Array<Scalars['String']>
	slack_channels: Array<SanitizedSlackChannelInput>
	emails: Array<Maybe<Scalars['String']>>
}

export type MutationCreateMetricMonitorArgs = {
	project_id: Scalars['ID']
	name: Scalars['String']
	aggregator: MetricAggregator
	periodMinutes?: Maybe<Scalars['Int']>
	threshold: Scalars['Float']
	units?: Maybe<Scalars['String']>
	metric_to_monitor: Scalars['String']
	slack_channels: Array<Maybe<SanitizedSlackChannelInput>>
	emails: Array<Maybe<Scalars['String']>>
	filters?: Maybe<Array<MetricTagFilterInput>>
}

export type MutationUpdateMetricMonitorArgs = {
	metric_monitor_id: Scalars['ID']
	project_id: Scalars['ID']
	name?: Maybe<Scalars['String']>
	aggregator?: Maybe<MetricAggregator>
	periodMinutes?: Maybe<Scalars['Int']>
	threshold?: Maybe<Scalars['Float']>
	units?: Maybe<Scalars['String']>
	metric_to_monitor?: Maybe<Scalars['String']>
	slack_channels?: Maybe<Array<Maybe<SanitizedSlackChannelInput>>>
	emails?: Maybe<Array<Maybe<Scalars['String']>>>
	disabled?: Maybe<Scalars['Boolean']>
	filters?: Maybe<Array<MetricTagFilterInput>>
}

export type MutationCreateErrorAlertArgs = {
	project_id: Scalars['ID']
	name: Scalars['String']
	count_threshold: Scalars['Int']
	threshold_window: Scalars['Int']
	slack_channels: Array<Maybe<SanitizedSlackChannelInput>>
	emails: Array<Maybe<Scalars['String']>>
	environments: Array<Maybe<Scalars['String']>>
	regex_groups: Array<Maybe<Scalars['String']>>
	frequency: Scalars['Int']
}

export type MutationUpdateErrorAlertArgs = {
	project_id: Scalars['ID']
	name?: Maybe<Scalars['String']>
	error_alert_id: Scalars['ID']
	count_threshold?: Maybe<Scalars['Int']>
	threshold_window?: Maybe<Scalars['Int']>
	slack_channels?: Maybe<Array<Maybe<SanitizedSlackChannelInput>>>
	emails?: Maybe<Array<Maybe<Scalars['String']>>>
	environments?: Maybe<Array<Maybe<Scalars['String']>>>
	regex_groups?: Maybe<Array<Maybe<Scalars['String']>>>
	frequency?: Maybe<Scalars['Int']>
	disabled?: Maybe<Scalars['Boolean']>
}

export type MutationDeleteErrorAlertArgs = {
	project_id: Scalars['ID']
	error_alert_id: Scalars['ID']
}

export type MutationDeleteMetricMonitorArgs = {
	project_id: Scalars['ID']
	metric_monitor_id: Scalars['ID']
}

export type MutationUpdateSessionAlertIsDisabledArgs = {
	id: Scalars['ID']
	project_id: Scalars['ID']
	disabled: Scalars['Boolean']
}

export type MutationUpdateSessionAlertArgs = {
	id: Scalars['ID']
	input: SessionAlertInput
}

export type MutationCreateSessionAlertArgs = {
	input: SessionAlertInput
}

export type MutationDeleteSessionAlertArgs = {
	project_id: Scalars['ID']
	session_alert_id: Scalars['ID']
}

export type MutationUpdateSessionIsPublicArgs = {
	session_secure_id: Scalars['String']
	is_public: Scalars['Boolean']
}

export type MutationUpdateErrorGroupIsPublicArgs = {
	error_group_secure_id: Scalars['String']
	is_public: Scalars['Boolean']
}

export type MutationUpdateAllowMeterOverageArgs = {
	workspace_id: Scalars['ID']
	allow_meter_overage: Scalars['Boolean']
}

export type MutationSubmitRegistrationFormArgs = {
	workspace_id: Scalars['ID']
	team_size: Scalars['String']
	role: Scalars['String']
	use_case: Scalars['String']
	heard_about: Scalars['String']
	pun?: Maybe<Scalars['String']>
}

export type MutationRequestAccessArgs = {
	project_id: Scalars['ID']
}

export type MutationModifyClearbitIntegrationArgs = {
	workspace_id: Scalars['ID']
	enabled: Scalars['Boolean']
}

export type MutationUpsertDashboardArgs = {
	id?: Maybe<Scalars['ID']>
	project_id: Scalars['ID']
	name: Scalars['String']
	metrics: Array<DashboardMetricConfigInput>
	layout?: Maybe<Scalars['String']>
	is_default?: Maybe<Scalars['Boolean']>
}

export type MutationDeleteDashboardArgs = {
	id: Scalars['ID']
}

export type MutationDeleteSessionsArgs = {
	project_id: Scalars['ID']
	query: Scalars['String']
	sessionCount: Scalars['Int']
}

export type MutationUpdateVercelProjectMappingsArgs = {
	project_id: Scalars['ID']
	project_mappings: Array<VercelProjectMappingInput>
}

export type Subscription = {
	__typename?: 'Subscription'
	session_payload_appended?: Maybe<SessionPayload>
}

export type SubscriptionSession_Payload_AppendedArgs = {
	session_secure_id: Scalars['String']
	initial_events_count: Scalars['Int']
}
