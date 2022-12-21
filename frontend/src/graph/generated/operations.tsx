import * as Types from './schemas'

export type MarkSessionAsViewedMutationVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
	viewed: Types.Scalars['Boolean']
}>

export type MarkSessionAsViewedMutation = { __typename?: 'Mutation' } & {
	markSessionAsViewed?: Types.Maybe<
		{ __typename?: 'Session' } & Pick<Types.Session, 'secure_id' | 'viewed'>
	>
}

export type MarkSessionAsStarredMutationVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
	starred: Types.Scalars['Boolean']
}>

export type MarkSessionAsStarredMutation = { __typename?: 'Mutation' } & {
	markSessionAsStarred?: Types.Maybe<
		{ __typename?: 'Session' } & Pick<
			Types.Session,
			'secure_id' | 'starred'
		>
	>
}

export type MuteSessionCommentThreadMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	has_muted?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type MuteSessionCommentThreadMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'muteSessionCommentThread'>

export type CreateOrUpdateStripeSubscriptionMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	plan_type: Types.PlanType
	interval: Types.SubscriptionInterval
}>

export type CreateOrUpdateStripeSubscriptionMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'createOrUpdateStripeSubscription'>

export type UpdateBillingDetailsMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type UpdateBillingDetailsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'updateBillingDetails'
>

export type UpdateErrorGroupStateMutationVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
	state: Types.Scalars['String']
}>

export type UpdateErrorGroupStateMutation = { __typename?: 'Mutation' } & {
	updateErrorGroupState?: Types.Maybe<
		{ __typename?: 'ErrorGroup' } & Pick<
			Types.ErrorGroup,
			'secure_id' | 'state'
		>
	>
}

export type SendEmailSignupMutationVariables = Types.Exact<{
	email: Types.Scalars['String']
}>

export type SendEmailSignupMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'emailSignup'
>

export type AddAdminToWorkspaceMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	invite_id: Types.Scalars['String']
}>

export type AddAdminToWorkspaceMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'addAdminToWorkspace'
>

export type JoinWorkspaceMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type JoinWorkspaceMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'joinWorkspace'
>

export type ChangeAdminRoleMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	admin_id: Types.Scalars['ID']
	new_role: Types.Scalars['String']
}>

export type ChangeAdminRoleMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'changeAdminRole'
>

export type DeleteAdminFromProjectMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	admin_id: Types.Scalars['ID']
}>

export type DeleteAdminFromProjectMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteAdminFromProject'
>

export type DeleteAdminFromWorkspaceMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	admin_id: Types.Scalars['ID']
}>

export type DeleteAdminFromWorkspaceMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'deleteAdminFromWorkspace'>

export type AddIntegrationToProjectMutationVariables = Types.Exact<{
	integration_type?: Types.Maybe<Types.IntegrationType>
	project_id: Types.Scalars['ID']
	code: Types.Scalars['String']
}>

export type AddIntegrationToProjectMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'addIntegrationToProject'>

export type RemoveIntegrationFromProjectMutationVariables = Types.Exact<{
	integration_type?: Types.Maybe<Types.IntegrationType>
	project_id: Types.Scalars['ID']
}>

export type RemoveIntegrationFromProjectMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'removeIntegrationFromProject'>

export type AddIntegrationToWorkspaceMutationVariables = Types.Exact<{
	integration_type?: Types.Maybe<Types.IntegrationType>
	workspace_id: Types.Scalars['ID']
	code: Types.Scalars['String']
}>

export type AddIntegrationToWorkspaceMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'addIntegrationToWorkspace'>

export type RemoveIntegrationFromWorkspaceMutationVariables = Types.Exact<{
	integration_type: Types.IntegrationType
	workspace_id: Types.Scalars['ID']
}>

export type RemoveIntegrationFromWorkspaceMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'removeIntegrationFromWorkspace'>

export type UpdateAllowedEmailOriginsMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	allowed_auto_join_email_origins: Types.Scalars['String']
}>

export type UpdateAllowedEmailOriginsMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'updateAllowedEmailOrigins'>

export type CreateProjectMutationVariables = Types.Exact<{
	name: Types.Scalars['String']
	workspace_id: Types.Scalars['ID']
}>

export type CreateProjectMutation = { __typename?: 'Mutation' } & {
	createProject?: Types.Maybe<
		{ __typename?: 'Project' } & Pick<Types.Project, 'id' | 'name'>
	>
}

export type SubmitRegistrationFormMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	team_size: Types.Scalars['String']
	role: Types.Scalars['String']
	use_case: Types.Scalars['String']
	heard_about: Types.Scalars['String']
	pun?: Types.Maybe<Types.Scalars['String']>
}>

export type SubmitRegistrationFormMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'submitRegistrationForm'
>

export type CreateWorkspaceMutationVariables = Types.Exact<{
	name: Types.Scalars['String']
	promo_code?: Types.Maybe<Types.Scalars['String']>
}>

export type CreateWorkspaceMutation = { __typename?: 'Mutation' } & {
	createWorkspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
	>
}

export type EditProjectMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	name?: Types.Maybe<Types.Scalars['String']>
	billing_email?: Types.Maybe<Types.Scalars['String']>
	excluded_users?: Types.Maybe<Types.Scalars['StringArray']>
	error_json_paths?: Types.Maybe<Types.Scalars['StringArray']>
	rage_click_window_seconds?: Types.Maybe<Types.Scalars['Int']>
	rage_click_radius_pixels?: Types.Maybe<Types.Scalars['Int']>
	rage_click_count?: Types.Maybe<Types.Scalars['Int']>
	backend_domains?: Types.Maybe<Types.Scalars['StringArray']>
}>

export type EditProjectMutation = { __typename?: 'Mutation' } & {
	editProject?: Types.Maybe<
		{ __typename?: 'Project' } & Pick<
			Types.Project,
			| 'id'
			| 'name'
			| 'billing_email'
			| 'excluded_users'
			| 'error_json_paths'
			| 'rage_click_window_seconds'
			| 'rage_click_radius_pixels'
			| 'rage_click_count'
			| 'backend_domains'
		>
	>
}

export type DeleteProjectMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type DeleteProjectMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteProject'
>

export type EditWorkspaceMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	name?: Types.Maybe<Types.Scalars['String']>
}>

export type EditWorkspaceMutation = { __typename?: 'Mutation' } & {
	editWorkspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
	>
}

export type DeleteSegmentMutationVariables = Types.Exact<{
	segment_id: Types.Scalars['ID']
}>

export type DeleteSegmentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteSegment'
>

export type EditSegmentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	id: Types.Scalars['ID']
	params: Types.SearchParamsInput
}>

export type EditSegmentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'editSegment'
>

export type CreateSegmentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	params: Types.SearchParamsInput
}>

export type CreateSegmentMutation = { __typename?: 'Mutation' } & {
	createSegment?: Types.Maybe<
		{ __typename?: 'Segment' } & Pick<Types.Segment, 'name' | 'id'> & {
				params: { __typename?: 'SearchParams' } & Pick<
					Types.SearchParams,
					| 'os'
					| 'browser'
					| 'visited_url'
					| 'referrer'
					| 'identified'
					| 'hide_viewed'
					| 'app_versions'
					| 'environments'
					| 'device_id'
					| 'show_live_sessions'
				> & {
						user_properties?: Types.Maybe<
							Array<
								Types.Maybe<
									{ __typename?: 'UserProperty' } & Pick<
										Types.UserProperty,
										'name' | 'value'
									>
								>
							>
						>
						excluded_properties?: Types.Maybe<
							Array<
								Types.Maybe<
									{ __typename?: 'UserProperty' } & Pick<
										Types.UserProperty,
										'name' | 'value'
									>
								>
							>
						>
						date_range?: Types.Maybe<
							{ __typename?: 'DateRange' } & Pick<
								Types.DateRange,
								'start_date' | 'end_date'
							>
						>
					}
			}
	>
}

export type CreateSessionCommentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	session_secure_id: Types.Scalars['String']
	session_timestamp: Types.Scalars['Int']
	text: Types.Scalars['String']
	text_for_email: Types.Scalars['String']
	x_coordinate: Types.Scalars['Float']
	y_coordinate: Types.Scalars['Float']
	tagged_admins:
		| Array<Types.Maybe<Types.SanitizedAdminInput>>
		| Types.Maybe<Types.SanitizedAdminInput>
	tagged_slack_users:
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
	session_url: Types.Scalars['String']
	time: Types.Scalars['Float']
	author_name: Types.Scalars['String']
	session_image?: Types.Maybe<Types.Scalars['String']>
	tags:
		| Array<Types.Maybe<Types.SessionCommentTagInput>>
		| Types.Maybe<Types.SessionCommentTagInput>
	integrations:
		| Array<Types.Maybe<Types.IntegrationType>>
		| Types.Maybe<Types.IntegrationType>
	issue_title?: Types.Maybe<Types.Scalars['String']>
	issue_team_id?: Types.Maybe<Types.Scalars['String']>
	issue_description?: Types.Maybe<Types.Scalars['String']>
	additional_context?: Types.Maybe<Types.Scalars['String']>
}>

export type CreateSessionCommentMutation = { __typename?: 'Mutation' } & {
	createSessionComment?: Types.Maybe<
		{ __typename?: 'SessionComment' } & Pick<
			Types.SessionComment,
			| 'id'
			| 'timestamp'
			| 'created_at'
			| 'updated_at'
			| 'text'
			| 'x_coordinate'
			| 'y_coordinate'
		> & {
				author?: Types.Maybe<
					{ __typename?: 'SanitizedAdmin' } & Pick<
						Types.SanitizedAdmin,
						'id' | 'name' | 'email'
					>
				>
				attachments: Array<
					Types.Maybe<
						{ __typename?: 'ExternalAttachment' } & Pick<
							Types.ExternalAttachment,
							'id' | 'integration_type' | 'external_id' | 'title'
						>
					>
				>
			}
	>
}

export type CreateIssueForSessionCommentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	session_comment_id: Types.Scalars['Int']
	text_for_attachment: Types.Scalars['String']
	session_url: Types.Scalars['String']
	time: Types.Scalars['Float']
	author_name: Types.Scalars['String']
	integrations:
		| Array<Types.Maybe<Types.IntegrationType>>
		| Types.Maybe<Types.IntegrationType>
	issue_title?: Types.Maybe<Types.Scalars['String']>
	issue_team_id?: Types.Maybe<Types.Scalars['String']>
	issue_description?: Types.Maybe<Types.Scalars['String']>
}>

export type CreateIssueForSessionCommentMutation = {
	__typename?: 'Mutation'
} & {
	createIssueForSessionComment?: Types.Maybe<
		{ __typename?: 'SessionComment' } & Pick<
			Types.SessionComment,
			| 'id'
			| 'timestamp'
			| 'created_at'
			| 'updated_at'
			| 'text'
			| 'x_coordinate'
			| 'y_coordinate'
		> & {
				author?: Types.Maybe<
					{ __typename?: 'SanitizedAdmin' } & Pick<
						Types.SanitizedAdmin,
						'id' | 'name' | 'email'
					>
				>
				attachments: Array<
					Types.Maybe<
						{ __typename?: 'ExternalAttachment' } & Pick<
							Types.ExternalAttachment,
							'id' | 'integration_type' | 'external_id' | 'title'
						>
					>
				>
			}
	>
}

export type DeleteSessionCommentMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type DeleteSessionCommentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteSessionComment'
>

export type ReplyToSessionCommentMutationVariables = Types.Exact<{
	comment_id: Types.Scalars['ID']
	text: Types.Scalars['String']
	text_for_email: Types.Scalars['String']
	sessionURL: Types.Scalars['String']
	tagged_admins:
		| Array<Types.Maybe<Types.SanitizedAdminInput>>
		| Types.Maybe<Types.SanitizedAdminInput>
	tagged_slack_users:
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
}>

export type ReplyToSessionCommentMutation = { __typename?: 'Mutation' } & {
	replyToSessionComment?: Types.Maybe<
		{ __typename?: 'CommentReply' } & Pick<
			Types.CommentReply,
			'id' | 'created_at' | 'updated_at' | 'text'
		> & {
				author: { __typename?: 'SanitizedAdmin' } & Pick<
					Types.SanitizedAdmin,
					'id' | 'name' | 'email' | 'photo_url'
				>
			}
	>
}

export type CreateErrorCommentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	error_group_secure_id: Types.Scalars['String']
	text: Types.Scalars['String']
	text_for_email: Types.Scalars['String']
	tagged_admins:
		| Array<Types.Maybe<Types.SanitizedAdminInput>>
		| Types.Maybe<Types.SanitizedAdminInput>
	tagged_slack_users:
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
	error_url: Types.Scalars['String']
	author_name: Types.Scalars['String']
	integrations:
		| Array<Types.Maybe<Types.IntegrationType>>
		| Types.Maybe<Types.IntegrationType>
	issue_title?: Types.Maybe<Types.Scalars['String']>
	issue_team_id?: Types.Maybe<Types.Scalars['String']>
	issue_description?: Types.Maybe<Types.Scalars['String']>
}>

export type CreateErrorCommentMutation = { __typename?: 'Mutation' } & {
	createErrorComment?: Types.Maybe<
		{ __typename?: 'ErrorComment' } & Pick<
			Types.ErrorComment,
			'id' | 'created_at' | 'updated_at' | 'text'
		> & {
				author: { __typename?: 'SanitizedAdmin' } & Pick<
					Types.SanitizedAdmin,
					'id' | 'name' | 'email'
				>
			}
	>
}

export type CreateIssueForErrorCommentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	error_comment_id: Types.Scalars['Int']
	text_for_attachment: Types.Scalars['String']
	error_url: Types.Scalars['String']
	author_name: Types.Scalars['String']
	integrations:
		| Array<Types.Maybe<Types.IntegrationType>>
		| Types.Maybe<Types.IntegrationType>
	issue_title?: Types.Maybe<Types.Scalars['String']>
	issue_team_id?: Types.Maybe<Types.Scalars['String']>
	issue_description?: Types.Maybe<Types.Scalars['String']>
}>

export type CreateIssueForErrorCommentMutation = { __typename?: 'Mutation' } & {
	createIssueForErrorComment?: Types.Maybe<
		{ __typename?: 'ErrorComment' } & Pick<
			Types.ErrorComment,
			'id' | 'created_at' | 'updated_at' | 'text'
		> & {
				author: { __typename?: 'SanitizedAdmin' } & Pick<
					Types.SanitizedAdmin,
					'id' | 'name' | 'email'
				>
				attachments: Array<
					Types.Maybe<
						{ __typename?: 'ExternalAttachment' } & Pick<
							Types.ExternalAttachment,
							'id' | 'integration_type' | 'external_id' | 'title'
						>
					>
				>
			}
	>
}

export type DeleteErrorCommentMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type DeleteErrorCommentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteErrorComment'
>

export type MuteErrorCommentThreadMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	has_muted?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type MuteErrorCommentThreadMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'muteErrorCommentThread'
>

export type ReplyToErrorCommentMutationVariables = Types.Exact<{
	comment_id: Types.Scalars['ID']
	text: Types.Scalars['String']
	text_for_email: Types.Scalars['String']
	errorURL: Types.Scalars['String']
	tagged_admins:
		| Array<Types.Maybe<Types.SanitizedAdminInput>>
		| Types.Maybe<Types.SanitizedAdminInput>
	tagged_slack_users:
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
}>

export type ReplyToErrorCommentMutation = { __typename?: 'Mutation' } & {
	replyToErrorComment?: Types.Maybe<
		{ __typename?: 'CommentReply' } & Pick<
			Types.CommentReply,
			'id' | 'created_at' | 'updated_at' | 'text'
		> & {
				author: { __typename?: 'SanitizedAdmin' } & Pick<
					Types.SanitizedAdmin,
					'id' | 'name' | 'email' | 'photo_url'
				>
			}
	>
}

export type DeleteErrorSegmentMutationVariables = Types.Exact<{
	segment_id: Types.Scalars['ID']
}>

export type DeleteErrorSegmentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteErrorSegment'
>

export type EditErrorSegmentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	id: Types.Scalars['ID']
	params: Types.ErrorSearchParamsInput
}>

export type EditErrorSegmentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'editErrorSegment'
>

export type CreateErrorSegmentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	params: Types.ErrorSearchParamsInput
}>

export type CreateErrorSegmentMutation = { __typename?: 'Mutation' } & {
	createErrorSegment?: Types.Maybe<
		{ __typename?: 'ErrorSegment' } & Pick<
			Types.ErrorSegment,
			'name' | 'id'
		> & {
				params: { __typename?: 'ErrorSearchParams' } & Pick<
					Types.ErrorSearchParams,
					'os' | 'browser' | 'visited_url' | 'state'
				> & {
						date_range?: Types.Maybe<
							{ __typename?: 'DateRange' } & Pick<
								Types.DateRange,
								'start_date' | 'end_date'
							>
						>
					}
			}
	>
}

export type CreateErrorAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	count_threshold: Types.Scalars['Int']
	threshold_window: Types.Scalars['Int']
	slack_channels:
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
	discord_channels:
		| Array<Types.DiscordChannelInput>
		| Types.DiscordChannelInput
	emails:
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	environments:
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	regex_groups:
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	frequency: Types.Scalars['Int']
}>

export type CreateErrorAlertMutation = { __typename?: 'Mutation' } & {
	createErrorAlert?: Types.Maybe<
		{ __typename?: 'ErrorAlert' } & Pick<
			Types.ErrorAlert,
			| 'id'
			| 'EmailsToNotify'
			| 'Name'
			| 'ExcludedEnvironments'
			| 'CountThreshold'
			| 'ThresholdWindow'
			| 'LastAdminToEditID'
			| 'RegexGroups'
			| 'Frequency'
			| 'disabled'
		> & {
				ChannelsToNotify: Array<
					Types.Maybe<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
				>
			}
	>
}

export type CreateMetricMonitorMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	aggregator: Types.MetricAggregator
	threshold: Types.Scalars['Float']
	filters?: Types.Maybe<
		Array<Types.MetricTagFilterInput> | Types.MetricTagFilterInput
	>
	units?: Types.Maybe<Types.Scalars['String']>
	periodMinutes?: Types.Maybe<Types.Scalars['Int']>
	metric_to_monitor: Types.Scalars['String']
	slack_channels:
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
	discord_channels:
		| Array<Types.DiscordChannelInput>
		| Types.DiscordChannelInput
	emails:
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
}>

export type CreateMetricMonitorMutation = { __typename?: 'Mutation' } & {
	createMetricMonitor?: Types.Maybe<
		{ __typename?: 'MetricMonitor' } & Pick<
			Types.MetricMonitor,
			| 'id'
			| 'updated_at'
			| 'name'
			| 'emails_to_notify'
			| 'aggregator'
			| 'period_minutes'
			| 'metric_to_monitor'
			| 'last_admin_to_edit_id'
			| 'threshold'
			| 'units'
		> & {
				channels_to_notify: Array<
					Types.Maybe<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
				>
			}
	>
}

export type UpdateMetricMonitorMutationVariables = Types.Exact<{
	metric_monitor_id: Types.Scalars['ID']
	project_id: Types.Scalars['ID']
	name?: Types.Maybe<Types.Scalars['String']>
	aggregator?: Types.Maybe<Types.MetricAggregator>
	threshold?: Types.Maybe<Types.Scalars['Float']>
	filters?: Types.Maybe<
		Array<Types.MetricTagFilterInput> | Types.MetricTagFilterInput
	>
	units?: Types.Maybe<Types.Scalars['String']>
	periodMinutes?: Types.Maybe<Types.Scalars['Int']>
	metric_to_monitor?: Types.Maybe<Types.Scalars['String']>
	slack_channels?: Types.Maybe<
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
	>
	discord_channels:
		| Array<Types.DiscordChannelInput>
		| Types.DiscordChannelInput
	emails?: Types.Maybe<
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	>
	disabled?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type UpdateMetricMonitorMutation = { __typename?: 'Mutation' } & {
	updateMetricMonitor?: Types.Maybe<
		{ __typename?: 'MetricMonitor' } & Pick<
			Types.MetricMonitor,
			| 'id'
			| 'updated_at'
			| 'name'
			| 'emails_to_notify'
			| 'aggregator'
			| 'period_minutes'
			| 'metric_to_monitor'
			| 'last_admin_to_edit_id'
			| 'threshold'
			| 'units'
		> & {
				channels_to_notify: Array<
					Types.Maybe<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
				>
			}
	>
}

export type DeleteMetricMonitorMutationVariables = Types.Exact<{
	metric_monitor_id: Types.Scalars['ID']
	project_id: Types.Scalars['ID']
}>

export type DeleteMetricMonitorMutation = { __typename?: 'Mutation' } & {
	deleteMetricMonitor?: Types.Maybe<
		{ __typename?: 'MetricMonitor' } & Pick<
			Types.MetricMonitor,
			| 'id'
			| 'updated_at'
			| 'name'
			| 'emails_to_notify'
			| 'aggregator'
			| 'metric_to_monitor'
			| 'last_admin_to_edit_id'
			| 'threshold'
		> & {
				channels_to_notify: Array<
					Types.Maybe<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
				>
			}
	>
}

export type UpdateAdminAboutYouDetailsMutationVariables = Types.Exact<{
	adminDetails: Types.AdminAboutYouDetails
}>

export type UpdateAdminAboutYouDetailsMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'updateAdminAboutYouDetails'>

export type UpdateErrorAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name?: Types.Maybe<Types.Scalars['String']>
	error_alert_id: Types.Scalars['ID']
	count_threshold?: Types.Maybe<Types.Scalars['Int']>
	threshold_window?: Types.Maybe<Types.Scalars['Int']>
	slack_channels?: Types.Maybe<
		| Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
		| Types.Maybe<Types.SanitizedSlackChannelInput>
	>
	discord_channels:
		| Array<Types.DiscordChannelInput>
		| Types.DiscordChannelInput
	emails?: Types.Maybe<
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	>
	environments?: Types.Maybe<
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	>
	regex_groups?: Types.Maybe<
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	>
	frequency?: Types.Maybe<Types.Scalars['Int']>
	disabled?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type UpdateErrorAlertMutation = { __typename?: 'Mutation' } & {
	updateErrorAlert?: Types.Maybe<
		{ __typename?: 'ErrorAlert' } & Pick<
			Types.ErrorAlert,
			| 'Name'
			| 'EmailsToNotify'
			| 'ExcludedEnvironments'
			| 'CountThreshold'
			| 'ThresholdWindow'
			| 'LastAdminToEditID'
			| 'RegexGroups'
			| 'Frequency'
			| 'disabled'
		> & {
				ChannelsToNotify: Array<
					Types.Maybe<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
				>
				DiscordChannelsToNotify: Array<
					{ __typename?: 'DiscordChannel' } & Pick<
						Types.DiscordChannel,
						'id' | 'name'
					>
				>
			}
	>
}

export type DeleteErrorAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	error_alert_id: Types.Scalars['ID']
}>

export type DeleteErrorAlertMutation = { __typename?: 'Mutation' } & {
	deleteErrorAlert?: Types.Maybe<
		{ __typename?: 'ErrorAlert' } & Pick<Types.ErrorAlert, 'id'>
	>
}

export type DeleteSessionAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	session_alert_id: Types.Scalars['ID']
}>

export type DeleteSessionAlertMutation = { __typename?: 'Mutation' } & {
	deleteSessionAlert?: Types.Maybe<
		{ __typename?: 'SessionAlert' } & Pick<Types.SessionAlert, 'id'>
	>
}

export type UpdateSessionAlertIsDisabledMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	project_id: Types.Scalars['ID']
	disabled: Types.Scalars['Boolean']
}>

export type UpdateSessionAlertIsDisabledMutation = {
	__typename?: 'Mutation'
} & {
	updateSessionAlertIsDisabled?: Types.Maybe<
		{ __typename?: 'SessionAlert' } & Pick<Types.SessionAlert, 'id'>
	>
}

export type UpdateMetricMonitorIsDisabledMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	project_id: Types.Scalars['ID']
	disabled: Types.Scalars['Boolean']
}>

export type UpdateMetricMonitorIsDisabledMutation = {
	__typename?: 'Mutation'
} & {
	updateMetricMonitorIsDisabled?: Types.Maybe<
		{ __typename?: 'MetricMonitor' } & Pick<Types.MetricMonitor, 'id'>
	>
}

export type UpdateErrorAlertIsDisabledMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	project_id: Types.Scalars['ID']
	disabled: Types.Scalars['Boolean']
}>

export type UpdateErrorAlertIsDisabledMutation = { __typename?: 'Mutation' } & {
	updateErrorAlertIsDisabled?: Types.Maybe<
		{ __typename?: 'ErrorAlert' } & Pick<Types.ErrorAlert, 'id'>
	>
}

export type CreateDefaultAlertsMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	alert_types: Array<Types.Scalars['String']> | Types.Scalars['String']
	slack_channels:
		| Array<Types.SanitizedSlackChannelInput>
		| Types.SanitizedSlackChannelInput
	emails: Array<Types.Scalars['String']> | Types.Scalars['String']
}>

export type CreateDefaultAlertsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'createDefaultAlerts'
>

export type CreateSessionAlertMutationVariables = Types.Exact<{
	input: Types.SessionAlertInput
}>

export type CreateSessionAlertMutation = { __typename?: 'Mutation' } & {
	createSessionAlert?: Types.Maybe<
		{ __typename?: 'SessionAlert' } & Pick<
			Types.SessionAlert,
			| 'id'
			| 'EmailsToNotify'
			| 'Name'
			| 'ExcludedEnvironments'
			| 'CountThreshold'
			| 'ThresholdWindow'
			| 'LastAdminToEditID'
			| 'disabled'
		> & {
				ChannelsToNotify: Array<
					Types.Maybe<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
				>
			}
	>
}

export type UpdateSessionAlertMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	input: Types.SessionAlertInput
}>

export type UpdateSessionAlertMutation = { __typename?: 'Mutation' } & {
	updateSessionAlert?: Types.Maybe<
		{ __typename?: 'SessionAlert' } & Pick<
			Types.SessionAlert,
			| 'id'
			| 'EmailsToNotify'
			| 'ExcludedEnvironments'
			| 'CountThreshold'
			| 'ThresholdWindow'
			| 'Name'
			| 'LastAdminToEditID'
			| 'disabled'
		> & {
				ChannelsToNotify: Array<
					Types.Maybe<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
				>
				DiscordChannelsToNotify: Array<
					{ __typename?: 'DiscordChannel' } & Pick<
						Types.DiscordChannel,
						'id' | 'name'
					>
				>
			}
	>
}

export type UpdateSessionIsPublicMutationVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
	is_public: Types.Scalars['Boolean']
}>

export type UpdateSessionIsPublicMutation = { __typename?: 'Mutation' } & {
	updateSessionIsPublic?: Types.Maybe<
		{ __typename?: 'Session' } & Pick<
			Types.Session,
			'secure_id' | 'is_public'
		>
	>
}

export type UpdateErrorGroupIsPublicMutationVariables = Types.Exact<{
	error_group_secure_id: Types.Scalars['String']
	is_public: Types.Scalars['Boolean']
}>

export type UpdateErrorGroupIsPublicMutation = { __typename?: 'Mutation' } & {
	updateErrorGroupIsPublic?: Types.Maybe<
		{ __typename?: 'ErrorGroup' } & Pick<
			Types.ErrorGroup,
			'secure_id' | 'is_public'
		>
	>
}

export type UpdateAllowMeterOverageMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	allow_meter_overage: Types.Scalars['Boolean']
}>

export type UpdateAllowMeterOverageMutation = { __typename?: 'Mutation' } & {
	updateAllowMeterOverage?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			'id' | 'allow_meter_overage'
		>
	>
}

export type SyncSlackIntegrationMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type SyncSlackIntegrationMutation = { __typename?: 'Mutation' } & {
	syncSlackIntegration: { __typename?: 'SlackSyncResponse' } & Pick<
		Types.SlackSyncResponse,
		'success' | 'newChannelsAddedCount'
	>
}

export type RequestAccessMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type RequestAccessMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'requestAccess'
>

export type ModifyClearbitIntegrationMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	enabled: Types.Scalars['Boolean']
}>

export type ModifyClearbitIntegrationMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'modifyClearbitIntegration'>

export type UpsertDashboardMutationVariables = Types.Exact<{
	id?: Types.Maybe<Types.Scalars['ID']>
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	metrics:
		| Array<Types.DashboardMetricConfigInput>
		| Types.DashboardMetricConfigInput
	layout?: Types.Maybe<Types.Scalars['String']>
	is_default?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type UpsertDashboardMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'upsertDashboard'
>

export type DeleteDashboardMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type DeleteDashboardMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteDashboard'
>

export type DeleteSessionsMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
	sessionCount: Types.Scalars['Int']
}>

export type DeleteSessionsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteSessions'
>

export type UpdateVercelSettingsMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	project_mappings:
		| Array<Types.VercelProjectMappingInput>
		| Types.VercelProjectMappingInput
}>

export type UpdateVercelSettingsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'updateVercelProjectMappings'
>

export type UpdateClickUpSettingsMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	project_mappings:
		| Array<Types.ClickUpProjectMappingInput>
		| Types.ClickUpProjectMappingInput
}>

export type UpdateClickUpSettingsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'updateClickUpProjectMappings'
>

export type UpdateIntegrationProjectSettingsMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	integration_type: Types.IntegrationType
	project_mappings:
		| Array<Types.IntegrationProjectMappingInput>
		| Types.IntegrationProjectMappingInput
}>

export type UpdateIntegrationProjectSettingsMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'updateIntegrationProjectMappings'>

export type UpdateEmailOptOutMutationVariables = Types.Exact<{
	token?: Types.Maybe<Types.Scalars['String']>
	admin_id?: Types.Maybe<Types.Scalars['ID']>
	category: Types.EmailOptOutCategory
	is_opt_out: Types.Scalars['Boolean']
}>

export type UpdateEmailOptOutMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'updateEmailOptOut'
>

export type SessionPayloadFragmentFragment = {
	__typename?: 'SessionPayload'
} & Pick<Types.SessionPayload, 'events' | 'last_user_interaction_time'> & {
		errors: Array<
			Types.Maybe<
				{ __typename?: 'ErrorObject' } & Pick<
					Types.ErrorObject,
					| 'id'
					| 'error_group_secure_id'
					| 'event'
					| 'type'
					| 'url'
					| 'source'
					| 'stack_trace'
					| 'timestamp'
					| 'payload'
					| 'request_id'
				> & {
						structured_stack_trace: Array<
							Types.Maybe<
								{ __typename?: 'ErrorTrace' } & Pick<
									Types.ErrorTrace,
									| 'fileName'
									| 'lineNumber'
									| 'functionName'
									| 'columnNumber'
								>
							>
						>
					}
			>
		>
		rage_clicks: Array<
			{ __typename?: 'RageClickEvent' } & Pick<
				Types.RageClickEvent,
				'start_timestamp' | 'end_timestamp' | 'total_clicks'
			>
		>
		session_comments: Array<
			Types.Maybe<
				{ __typename?: 'SessionComment' } & Pick<
					Types.SessionComment,
					| 'id'
					| 'timestamp'
					| 'session_id'
					| 'session_secure_id'
					| 'created_at'
					| 'updated_at'
					| 'project_id'
					| 'text'
					| 'x_coordinate'
					| 'y_coordinate'
					| 'type'
					| 'metadata'
				> & {
						author?: Types.Maybe<
							{ __typename?: 'SanitizedAdmin' } & Pick<
								Types.SanitizedAdmin,
								'id' | 'name' | 'email' | 'photo_url'
							>
						>
						attachments: Array<
							Types.Maybe<
								{ __typename?: 'ExternalAttachment' } & Pick<
									Types.ExternalAttachment,
									'integration_type' | 'external_id' | 'title'
								>
							>
						>
					}
			>
		>
	}

export type SessionAlertFragmentFragment = {
	__typename?: 'SessionAlert'
} & Pick<
	Types.SessionAlert,
	| 'CountThreshold'
	| 'DailyFrequency'
	| 'disabled'
	| 'EmailsToNotify'
	| 'ExcludedEnvironments'
	| 'ExcludeRules'
	| 'id'
	| 'LastAdminToEditID'
	| 'Name'
	| 'updated_at'
	| 'ThresholdWindow'
	| 'Type'
> & {
		ChannelsToNotify: Array<
			Types.Maybe<
				{ __typename?: 'SanitizedSlackChannel' } & Pick<
					Types.SanitizedSlackChannel,
					'webhook_channel' | 'webhook_channel_id'
				>
			>
		>
		DiscordChannelsToNotify: Array<
			{ __typename?: 'DiscordChannel' } & DiscordChannelFragmentFragment
		>
		TrackProperties: Array<
			Types.Maybe<
				{ __typename?: 'TrackProperty' } & Pick<
					Types.TrackProperty,
					'id' | 'name' | 'value'
				>
			>
		>
	}

export type DiscordChannelFragmentFragment = {
	__typename?: 'DiscordChannel'
} & Pick<Types.DiscordChannel, 'name' | 'id'>

export type GetMetricsTimelineQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	metric_name: Types.Scalars['String']
	params: Types.DashboardParamsInput
}>

export type GetMetricsTimelineQuery = { __typename?: 'Query' } & {
	metrics_timeline: Array<
		Types.Maybe<
			{ __typename?: 'DashboardPayload' } & Pick<
				Types.DashboardPayload,
				'date' | 'value' | 'aggregator' | 'group'
			>
		>
	>
}

export type GetMetricsHistogramQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	metric_name: Types.Scalars['String']
	params: Types.HistogramParamsInput
}>

export type GetMetricsHistogramQuery = { __typename?: 'Query' } & {
	metrics_histogram?: Types.Maybe<
		{ __typename?: 'HistogramPayload' } & Pick<
			Types.HistogramPayload,
			'min' | 'max'
		> & {
				buckets: Array<
					{ __typename?: 'HistogramBucket' } & Pick<
						Types.HistogramBucket,
						'bucket' | 'range_start' | 'range_end' | 'count'
					>
				>
			}
	>
}

export type GetNetworkHistogramQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.NetworkHistogramParamsInput
}>

export type GetNetworkHistogramQuery = { __typename?: 'Query' } & {
	network_histogram?: Types.Maybe<
		{ __typename?: 'CategoryHistogramPayload' } & {
			buckets: Array<
				{ __typename?: 'CategoryHistogramBucket' } & Pick<
					Types.CategoryHistogramBucket,
					'category' | 'count'
				>
			>
		}
	>
}

export type GetSessionPayloadQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
	skip_events: Types.Scalars['Boolean']
}>

export type GetSessionPayloadQuery = {
	__typename?: 'Query'
} & Types.MakeOptional<Pick<Types.Query, 'events'>, 'events'> & {
		errors?: Types.Maybe<
			Array<
				Types.Maybe<
					{ __typename?: 'ErrorObject' } & Pick<
						Types.ErrorObject,
						| 'id'
						| 'error_group_secure_id'
						| 'event'
						| 'type'
						| 'url'
						| 'source'
						| 'stack_trace'
						| 'timestamp'
						| 'payload'
						| 'request_id'
					> & {
							structured_stack_trace: Array<
								Types.Maybe<
									{ __typename?: 'ErrorTrace' } & Pick<
										Types.ErrorTrace,
										| 'fileName'
										| 'lineNumber'
										| 'functionName'
										| 'columnNumber'
									>
								>
							>
						}
				>
			>
		>
		rage_clicks: Array<
			{ __typename?: 'RageClickEvent' } & Pick<
				Types.RageClickEvent,
				'start_timestamp' | 'end_timestamp' | 'total_clicks'
			>
		>
		session_comments: Array<
			Types.Maybe<
				{ __typename?: 'SessionComment' } & Pick<
					Types.SessionComment,
					| 'id'
					| 'timestamp'
					| 'session_id'
					| 'session_secure_id'
					| 'created_at'
					| 'updated_at'
					| 'project_id'
					| 'text'
					| 'x_coordinate'
					| 'y_coordinate'
					| 'type'
					| 'metadata'
					| 'tags'
				> & {
						author?: Types.Maybe<
							{ __typename?: 'SanitizedAdmin' } & Pick<
								Types.SanitizedAdmin,
								'id' | 'name' | 'email' | 'photo_url'
							>
						>
						attachments: Array<
							Types.Maybe<
								{ __typename?: 'ExternalAttachment' } & Pick<
									Types.ExternalAttachment,
									| 'id'
									| 'integration_type'
									| 'external_id'
									| 'title'
								>
							>
						>
					}
			>
		>
	}

export type GetCommentTagsForProjectQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetCommentTagsForProjectQuery = { __typename?: 'Query' } & {
	session_comment_tags_for_project: Array<
		{ __typename?: 'SessionCommentTag' } & Pick<
			Types.SessionCommentTag,
			'id' | 'name'
		>
	>
}

export type GetEventChunkUrlQueryVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
	index: Types.Scalars['Int']
}>

export type GetEventChunkUrlQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'event_chunk_url'
>

export type GetEventChunksQueryVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
}>

export type GetEventChunksQuery = { __typename?: 'Query' } & {
	event_chunks: Array<
		{ __typename?: 'EventChunk' } & Pick<
			Types.EventChunk,
			'session_id' | 'chunk_index' | 'timestamp'
		>
	>
}

export type GetSessionQueryVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
}>

export type GetSessionQuery = { __typename?: 'Query' } & {
	session?: Types.Maybe<
		{ __typename?: 'Session' } & Pick<
			Types.Session,
			| 'secure_id'
			| 'os_name'
			| 'os_version'
			| 'browser_name'
			| 'browser_version'
			| 'environment'
			| 'app_version'
			| 'city'
			| 'state'
			| 'country'
			| 'postal'
			| 'fingerprint'
			| 'created_at'
			| 'payload_updated_at'
			| 'language'
			| 'user_object'
			| 'user_properties'
			| 'identifier'
			| 'identified'
			| 'client_id'
			| 'starred'
			| 'enable_strict_privacy'
			| 'enable_recording_network_contents'
			| 'field_group'
			| 'object_storage_enabled'
			| 'payload_size'
			| 'processed'
			| 'excluded'
			| 'has_rage_clicks'
			| 'has_errors'
			| 'within_billing_quota'
			| 'client_version'
			| 'firstload_version'
			| 'client_config'
			| 'is_public'
			| 'event_counts'
			| 'direct_download_url'
			| 'resources_url'
			| 'messages_url'
			| 'deviceMemory'
			| 'last_user_interaction_time'
			| 'length'
			| 'active_length'
			| 'chunked'
		> & {
				fields?: Types.Maybe<
					Array<
						Types.Maybe<
							{ __typename?: 'Field' } & Pick<
								Types.Field,
								'name' | 'value' | 'type'
							>
						>
					>
				>
			}
	>
}

export type GetWorkspaceAdminsByProjectIdQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceAdminsByProjectIdQuery = { __typename?: 'Query' } & {
	admins: Array<
		{ __typename?: 'WorkspaceAdminRole' } & Pick<
			Types.WorkspaceAdminRole,
			'role'
		> & {
				admin: { __typename?: 'Admin' } & Pick<
					Types.Admin,
					'id' | 'name' | 'email' | 'photo_url'
				>
			}
	>
}

export type GetWorkspaceAdminsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetWorkspaceAdminsQuery = { __typename?: 'Query' } & {
	admins: Array<
		{ __typename?: 'WorkspaceAdminRole' } & Pick<
			Types.WorkspaceAdminRole,
			'role'
		> & {
				admin: { __typename?: 'Admin' } & Pick<
					Types.Admin,
					'id' | 'name' | 'email' | 'photo_url'
				>
			}
	>
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			'id' | 'name' | 'secret' | 'allowed_auto_join_email_origins'
		>
	>
	workspace_invite_links: { __typename?: 'WorkspaceInviteLink' } & Pick<
		Types.WorkspaceInviteLink,
		'id' | 'invitee_email' | 'invitee_role' | 'expiration_date' | 'secret'
	>
}

export type GetSessionCommentsQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetSessionCommentsQuery = { __typename?: 'Query' } & {
	session_comments: Array<
		Types.Maybe<
			{ __typename?: 'SessionComment' } & Pick<
				Types.SessionComment,
				| 'id'
				| 'timestamp'
				| 'session_id'
				| 'session_secure_id'
				| 'created_at'
				| 'updated_at'
				| 'project_id'
				| 'text'
				| 'x_coordinate'
				| 'y_coordinate'
				| 'type'
				| 'metadata'
				| 'tags'
			> & {
					author?: Types.Maybe<
						{ __typename?: 'SanitizedAdmin' } & Pick<
							Types.SanitizedAdmin,
							'id' | 'name' | 'email' | 'photo_url'
						>
					>
					attachments: Array<
						Types.Maybe<
							{ __typename?: 'ExternalAttachment' } & Pick<
								Types.ExternalAttachment,
								| 'id'
								| 'integration_type'
								| 'external_id'
								| 'title'
							>
						>
					>
					replies: Array<
						Types.Maybe<
							{ __typename?: 'CommentReply' } & Pick<
								Types.CommentReply,
								'id' | 'created_at' | 'updated_at' | 'text'
							> & {
									author: {
										__typename?: 'SanitizedAdmin'
									} & Pick<
										Types.SanitizedAdmin,
										'id' | 'name' | 'email' | 'photo_url'
									>
								}
						>
					>
				}
		>
	>
}

export type GetNotificationsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetNotificationsQuery = { __typename?: 'Query' } & {
	session_comments_for_project: Array<
		Types.Maybe<
			{ __typename?: 'SessionComment' } & Pick<
				Types.SessionComment,
				| 'id'
				| 'timestamp'
				| 'updated_at'
				| 'session_id'
				| 'session_secure_id'
				| 'text'
				| 'type'
				| 'metadata'
				| 'tags'
			> & {
					author?: Types.Maybe<
						{ __typename?: 'SanitizedAdmin' } & Pick<
							Types.SanitizedAdmin,
							'id' | 'name' | 'email' | 'photo_url'
						>
					>
				}
		>
	>
	error_comments_for_project: Array<
		Types.Maybe<
			{ __typename?: 'ErrorComment' } & Pick<
				Types.ErrorComment,
				| 'id'
				| 'updated_at'
				| 'project_id'
				| 'text'
				| 'error_id'
				| 'error_secure_id'
			> & {
					author: { __typename?: 'SanitizedAdmin' } & Pick<
						Types.SanitizedAdmin,
						'id' | 'name' | 'email' | 'photo_url'
					>
				}
		>
	>
}

export type GetSessionCommentsForAdminQueryVariables = Types.Exact<{
	[key: string]: never
}>

export type GetSessionCommentsForAdminQuery = { __typename?: 'Query' } & {
	session_comments_for_admin: Array<
		Types.Maybe<
			{ __typename?: 'SessionComment' } & Pick<
				Types.SessionComment,
				| 'id'
				| 'timestamp'
				| 'created_at'
				| 'project_id'
				| 'updated_at'
				| 'text'
			> & {
					author?: Types.Maybe<
						{ __typename?: 'SanitizedAdmin' } & Pick<
							Types.SanitizedAdmin,
							'id' | 'name' | 'email' | 'photo_url'
						>
					>
				}
		>
	>
}

export type IsSessionPendingQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type IsSessionPendingQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'isSessionPending'
>

export type GetAccountsQueryVariables = Types.Exact<{ [key: string]: never }>

export type GetAccountsQuery = { __typename?: 'Query' } & {
	accounts?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Account' } & Pick<
					Types.Account,
					| 'id'
					| 'name'
					| 'session_count_cur'
					| 'view_count_cur'
					| 'session_count_prev'
					| 'view_count_prev'
					| 'session_count_prev_prev'
					| 'session_limit'
					| 'paid_prev'
					| 'paid_prev_prev'
					| 'email'
					| 'subscription_start'
					| 'plan_tier'
					| 'stripe_customer_id'
					| 'member_count'
					| 'member_limit'
				>
			>
		>
	>
}

export type GetAccountDetailsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetAccountDetailsQuery = { __typename?: 'Query' } & {
	account_details: { __typename?: 'AccountDetails' } & Pick<
		Types.AccountDetails,
		'id' | 'name' | 'stripe_customer_id'
	> & {
			session_count_per_month?: Types.Maybe<
				Array<
					Types.Maybe<
						{ __typename?: 'NamedCount' } & Pick<
							Types.NamedCount,
							'name' | 'count'
						>
					>
				>
			>
			session_count_per_day?: Types.Maybe<
				Array<
					Types.Maybe<
						{ __typename?: 'NamedCount' } & Pick<
							Types.NamedCount,
							'name' | 'count'
						>
					>
				>
			>
			members: Array<
				{ __typename?: 'AccountDetailsMember' } & Pick<
					Types.AccountDetailsMember,
					'id' | 'name' | 'email' | 'last_active'
				>
			>
		}
}

export type GetErrorCommentsQueryVariables = Types.Exact<{
	error_group_secure_id: Types.Scalars['String']
}>

export type GetErrorCommentsQuery = { __typename?: 'Query' } & {
	error_comments: Array<
		Types.Maybe<
			{ __typename?: 'ErrorComment' } & Pick<
				Types.ErrorComment,
				'id' | 'created_at' | 'updated_at' | 'text' | 'project_id'
			> & {
					author: { __typename?: 'SanitizedAdmin' } & Pick<
						Types.SanitizedAdmin,
						'id' | 'name' | 'email' | 'photo_url'
					>
					attachments: Array<
						Types.Maybe<
							{ __typename?: 'ExternalAttachment' } & Pick<
								Types.ExternalAttachment,
								'integration_type' | 'external_id' | 'title'
							>
						>
					>
					replies: Array<
						Types.Maybe<
							{ __typename?: 'CommentReply' } & Pick<
								Types.CommentReply,
								'id' | 'created_at' | 'updated_at' | 'text'
							> & {
									author: {
										__typename?: 'SanitizedAdmin'
									} & Pick<
										Types.SanitizedAdmin,
										'id' | 'name' | 'email' | 'photo_url'
									>
								}
						>
					>
				}
		>
	>
}

export type GetEnhancedUserDetailsQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetEnhancedUserDetailsQuery = { __typename?: 'Query' } & {
	enhanced_user_details?: Types.Maybe<
		{ __typename?: 'EnhancedUserDetailsResult' } & Pick<
			Types.EnhancedUserDetailsResult,
			'id' | 'name' | 'bio' | 'avatar' | 'email'
		> & {
				socials?: Types.Maybe<
					Array<
						Types.Maybe<
							{ __typename?: 'SocialLink' } & Pick<
								Types.SocialLink,
								'type' | 'link'
							>
						>
					>
				>
			}
	>
}

export type GetOnboardingStepsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	admin_id: Types.Scalars['ID']
}>

export type GetOnboardingStepsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'isIntegrated' | 'adminHasCreatedComment'
> & {
		workspace?: Types.Maybe<
			{ __typename?: 'Workspace' } & Pick<
				Types.Workspace,
				'id' | 'slack_channels'
			>
		>
		admins: Array<
			{ __typename?: 'WorkspaceAdminRole' } & {
				admin: { __typename?: 'Admin' } & Pick<Types.Admin, 'id'>
			}
		>
		projectHasViewedASession?: Types.Maybe<
			{ __typename?: 'Session' } & Pick<Types.Session, 'secure_id'>
		>
		admin?: Types.Maybe<
			{ __typename?: 'Admin' } & Pick<Types.Admin, 'slack_im_channel_id'>
		>
	}

export type SendAdminWorkspaceInviteMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	email: Types.Scalars['String']
	base_url: Types.Scalars['String']
	role: Types.Scalars['String']
}>

export type SendAdminWorkspaceInviteMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'sendAdminWorkspaceInvite'>

export type GetSessionIntervalsQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetSessionIntervalsQuery = { __typename?: 'Query' } & {
	session_intervals: Array<
		{ __typename?: 'SessionInterval' } & Pick<
			Types.SessionInterval,
			'start_time' | 'end_time' | 'active' | 'duration'
		>
	>
}

export type GetTimelineIndicatorEventsQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetTimelineIndicatorEventsQuery = { __typename?: 'Query' } & {
	timeline_indicator_events: Array<
		{ __typename?: 'TimelineIndicatorEvent' } & Pick<
			Types.TimelineIndicatorEvent,
			'timestamp' | 'data' | 'type' | 'sid'
		>
	>
}

export type GetFieldTypesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetFieldTypesQuery = { __typename?: 'Query' } & {
	field_types: Array<
		{ __typename?: 'Field' } & Pick<Types.Field, 'type' | 'name'>
	>
}

export type GetFieldsOpensearchQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	count: Types.Scalars['Int']
	field_type: Types.Scalars['String']
	field_name: Types.Scalars['String']
	query: Types.Scalars['String']
}>

export type GetFieldsOpensearchQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'fields_opensearch'
>

export type GetQuickFieldsOpensearchQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	count: Types.Scalars['Int']
	query: Types.Scalars['String']
}>

export type GetQuickFieldsOpensearchQuery = { __typename?: 'Query' } & {
	quickFields_opensearch: Array<
		Types.Maybe<
			{ __typename?: 'Field' } & Pick<
				Types.Field,
				'type' | 'name' | 'value'
			>
		>
	>
}

export type GetErrorFieldsOpensearchQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	count: Types.Scalars['Int']
	field_type: Types.Scalars['String']
	field_name: Types.Scalars['String']
	query: Types.Scalars['String']
}>

export type GetErrorFieldsOpensearchQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'error_fields_opensearch'
>

export type GetSessionsOpenSearchQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	count: Types.Scalars['Int']
	query: Types.Scalars['String']
	sort_desc: Types.Scalars['Boolean']
	page?: Types.Maybe<Types.Scalars['Int']>
}>

export type GetSessionsOpenSearchQuery = { __typename?: 'Query' } & {
	sessions_opensearch: { __typename?: 'SessionResults' } & Pick<
		Types.SessionResults,
		'totalCount'
	> & {
			sessions: Array<
				{ __typename?: 'Session' } & Pick<
					Types.Session,
					| 'id'
					| 'secure_id'
					| 'client_id'
					| 'fingerprint'
					| 'identifier'
					| 'identified'
					| 'os_name'
					| 'os_version'
					| 'browser_name'
					| 'browser_version'
					| 'city'
					| 'state'
					| 'country'
					| 'postal'
					| 'created_at'
					| 'language'
					| 'length'
					| 'active_length'
					| 'enable_recording_network_contents'
					| 'viewed'
					| 'starred'
					| 'processed'
					| 'has_rage_clicks'
					| 'has_errors'
					| 'first_time'
					| 'user_properties'
					| 'event_counts'
					| 'last_user_interaction_time'
				> & {
						fields?: Types.Maybe<
							Array<
								Types.Maybe<
									{ __typename?: 'Field' } & Pick<
										Types.Field,
										'name' | 'value' | 'type' | 'id'
									>
								>
							>
						>
					}
			>
		}
}

export type GetSessionsHistogramQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
	histogram_options: Types.DateHistogramOptions
}>

export type GetSessionsHistogramQuery = { __typename?: 'Query' } & {
	sessions_histogram: { __typename?: 'SessionsHistogram' } & Pick<
		Types.SessionsHistogram,
		| 'bucket_times'
		| 'sessions_without_errors'
		| 'sessions_with_errors'
		| 'total_sessions'
	>
}

export type GetErrorGroupsOpenSearchQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	count: Types.Scalars['Int']
	query: Types.Scalars['String']
	page?: Types.Maybe<Types.Scalars['Int']>
}>

export type GetErrorGroupsOpenSearchQuery = { __typename?: 'Query' } & {
	error_groups_opensearch: { __typename?: 'ErrorResults' } & Pick<
		Types.ErrorResults,
		'totalCount'
	> & {
			error_groups: Array<
				{ __typename?: 'ErrorGroup' } & Pick<
					Types.ErrorGroup,
					| 'created_at'
					| 'updated_at'
					| 'id'
					| 'secure_id'
					| 'type'
					| 'event'
					| 'state'
					| 'environments'
					| 'stack_trace'
					| 'error_frequency'
					| 'is_public'
					| 'project_id'
				> & {
						structured_stack_trace: Array<
							Types.Maybe<
								{ __typename?: 'ErrorTrace' } & Pick<
									Types.ErrorTrace,
									| 'fileName'
									| 'lineNumber'
									| 'functionName'
									| 'columnNumber'
								>
							>
						>
						error_metrics: Array<
							{ __typename?: 'ErrorDistributionItem' } & Pick<
								Types.ErrorDistributionItem,
								'error_group_id' | 'date' | 'name' | 'value'
							>
						>
					}
			>
		}
}

export type GetErrorsHistogramQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
	histogram_options: Types.DateHistogramOptions
}>

export type GetErrorsHistogramQuery = { __typename?: 'Query' } & {
	errors_histogram: { __typename?: 'ErrorsHistogram' } & Pick<
		Types.ErrorsHistogram,
		'bucket_times' | 'error_objects'
	>
}

export type GetProjectsQueryVariables = Types.Exact<{ [key: string]: never }>

export type GetProjectsQuery = { __typename?: 'Query' } & {
	projects?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Project' } & Pick<
					Types.Project,
					'id' | 'name' | 'workspace_id'
				>
			>
		>
	>
}

export type GetWorkspaceQueryVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type GetWorkspaceQuery = { __typename?: 'Query' } & {
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			| 'id'
			| 'name'
			| 'secret'
			| 'plan_tier'
			| 'unlimited_members'
			| 'clearbit_enabled'
		> & {
				projects: Array<
					Types.Maybe<
						{ __typename?: 'Project' } & Pick<
							Types.Project,
							'id' | 'name'
						>
					>
				>
			}
	>
}

export type GetWorkspacesQueryVariables = Types.Exact<{ [key: string]: never }>

export type GetWorkspacesQuery = { __typename?: 'Query' } & {
	workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				>
			>
		>
	>
	joinable_workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				> & {
						projects: Array<
							Types.Maybe<
								{ __typename?: 'Project' } & Pick<
									Types.Project,
									'id'
								>
							>
						>
					}
			>
		>
	>
}

export type GetWorkspacesCountQueryVariables = Types.Exact<{
	[key: string]: never
}>

export type GetWorkspacesCountQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'workspaces_count'
>

export type GetProjectsAndWorkspacesQueryVariables = Types.Exact<{
	[key: string]: never
}>

export type GetProjectsAndWorkspacesQuery = { __typename?: 'Query' } & {
	projects?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Project' } & Pick<Types.Project, 'id' | 'name'>
			>
		>
	>
	workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				>
			>
		>
	>
}

export type GetProjectOrWorkspaceQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	workspace_id: Types.Scalars['ID']
	is_workspace: Types.Scalars['Boolean']
}>

export type GetProjectOrWorkspaceQuery = { __typename?: 'Query' } & {
	project?: Types.Maybe<
		{ __typename?: 'Project' } & Pick<
			Types.Project,
			'id' | 'name' | 'billing_email'
		>
	>
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
	>
}

export type GetProjectDropdownOptionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetProjectDropdownOptionsQuery = { __typename?: 'Query' } & {
	project?: Types.Maybe<
		{ __typename?: 'Project' } & Pick<
			Types.Project,
			| 'id'
			| 'name'
			| 'verbose_id'
			| 'billing_email'
			| 'secret'
			| 'workspace_id'
		>
	>
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'> & {
				projects: Array<
					Types.Maybe<
						{ __typename?: 'Project' } & Pick<
							Types.Project,
							'id' | 'name'
						>
					>
				>
			}
	>
	workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				>
			>
		>
	>
	joinable_workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				> & {
						projects: Array<
							Types.Maybe<
								{ __typename?: 'Project' } & Pick<
									Types.Project,
									'id'
								>
							>
						>
					}
			>
		>
	>
}

export type GetWorkspaceDropdownOptionsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetWorkspaceDropdownOptionsQuery = { __typename?: 'Query' } & {
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'> & {
				projects: Array<
					Types.Maybe<
						{ __typename?: 'Project' } & Pick<
							Types.Project,
							'id' | 'name'
						>
					>
				>
			}
	>
	workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				>
			>
		>
	>
	joinable_workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				> & {
						projects: Array<
							Types.Maybe<
								{ __typename?: 'Project' } & Pick<
									Types.Project,
									'id'
								>
							>
						>
					}
			>
		>
	>
}

export type GetAdminQueryVariables = Types.Exact<{ [key: string]: never }>

export type GetAdminQuery = { __typename?: 'Query' } & {
	admin?: Types.Maybe<
		{ __typename?: 'Admin' } & Pick<
			Types.Admin,
			| 'id'
			| 'uid'
			| 'name'
			| 'email'
			| 'phone'
			| 'photo_url'
			| 'slack_im_channel_id'
			| 'email_verified'
			| 'user_defined_role'
			| 'about_you_details_filled'
		>
	>
}

export type GetAdminRoleQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetAdminRoleQuery = { __typename?: 'Query' } & {
	admin_role?: Types.Maybe<
		{ __typename?: 'WorkspaceAdminRole' } & Pick<
			Types.WorkspaceAdminRole,
			'role'
		> & {
				admin: { __typename?: 'Admin' } & Pick<
					Types.Admin,
					| 'id'
					| 'uid'
					| 'name'
					| 'email'
					| 'phone'
					| 'photo_url'
					| 'slack_im_channel_id'
					| 'email_verified'
					| 'user_defined_role'
					| 'about_you_details_filled'
				>
			}
	>
}

export type GetAdminRoleByProjectQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetAdminRoleByProjectQuery = { __typename?: 'Query' } & {
	admin_role_by_project?: Types.Maybe<
		{ __typename?: 'WorkspaceAdminRole' } & Pick<
			Types.WorkspaceAdminRole,
			'role'
		> & {
				admin: { __typename?: 'Admin' } & Pick<
					Types.Admin,
					| 'id'
					| 'uid'
					| 'name'
					| 'email'
					| 'phone'
					| 'photo_url'
					| 'slack_im_channel_id'
					| 'email_verified'
					| 'user_defined_role'
					| 'about_you_details_filled'
				>
			}
	>
}

export type GetAdminAboutYouQueryVariables = Types.Exact<{
	[key: string]: never
}>

export type GetAdminAboutYouQuery = { __typename?: 'Query' } & {
	admin?: Types.Maybe<
		{ __typename?: 'Admin' } & Pick<
			Types.Admin,
			'id' | 'name' | 'user_defined_role' | 'referral'
		>
	>
}

export type GetProjectQueryVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type GetProjectQuery = { __typename?: 'Query' } & {
	project?: Types.Maybe<
		{ __typename?: 'Project' } & Pick<
			Types.Project,
			| 'id'
			| 'name'
			| 'verbose_id'
			| 'billing_email'
			| 'excluded_users'
			| 'error_json_paths'
			| 'rage_click_window_seconds'
			| 'rage_click_radius_pixels'
			| 'rage_click_count'
			| 'backend_domains'
			| 'secret'
		>
	>
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			'id' | 'slack_webhook_channel'
		>
	>
}

export type GetBillingDetailsForProjectQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetBillingDetailsForProjectQuery = { __typename?: 'Query' } & {
	billingDetailsForProject?: Types.Maybe<
		{ __typename?: 'BillingDetails' } & Pick<
			Types.BillingDetails,
			'meter' | 'membersMeter' | 'sessionsOutOfQuota'
		> & {
				plan: { __typename?: 'Plan' } & Pick<
					Types.Plan,
					'type' | 'quota' | 'interval' | 'membersLimit'
				>
			}
	>
	workspace_for_project?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			| 'id'
			| 'trial_end_date'
			| 'billing_period_end'
			| 'next_invoice_date'
			| 'allow_meter_overage'
			| 'eligible_for_trial_extension'
			| 'trial_extension_enabled'
		>
	>
}

export type GetBillingDetailsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetBillingDetailsQuery = { __typename?: 'Query' } & {
	billingDetails: { __typename?: 'BillingDetails' } & Pick<
		Types.BillingDetails,
		'meter' | 'membersMeter'
	> & {
			plan: { __typename?: 'Plan' } & Pick<
				Types.Plan,
				'type' | 'quota' | 'interval' | 'membersLimit'
			>
		}
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			| 'id'
			| 'trial_end_date'
			| 'billing_period_end'
			| 'next_invoice_date'
			| 'allow_meter_overage'
			| 'eligible_for_trial_extension'
		>
	>
}

export type GetSubscriptionDetailsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetSubscriptionDetailsQuery = { __typename?: 'Query' } & {
	subscription_details: { __typename?: 'SubscriptionDetails' } & Pick<
		Types.SubscriptionDetails,
		'baseAmount' | 'discountAmount' | 'discountPercent'
	> & {
			lastInvoice?: Types.Maybe<
				{ __typename?: 'Invoice' } & Pick<
					Types.Invoice,
					| 'amountDue'
					| 'amountPaid'
					| 'attemptCount'
					| 'date'
					| 'url'
					| 'status'
				>
			>
		}
}

export type GetErrorGroupQueryVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
}>

export type GetErrorGroupQuery = { __typename?: 'Query' } & {
	error_group?: Types.Maybe<
		{ __typename?: 'ErrorGroup' } & Pick<
			Types.ErrorGroup,
			| 'created_at'
			| 'updated_at'
			| 'id'
			| 'secure_id'
			| 'type'
			| 'project_id'
			| 'event'
			| 'state'
			| 'mapped_stack_trace'
			| 'stack_trace'
			| 'error_frequency'
			| 'is_public'
			| 'last_occurrence'
			| 'first_occurrence'
		> & {
				structured_stack_trace: Array<
					Types.Maybe<
						{ __typename?: 'ErrorTrace' } & Pick<
							Types.ErrorTrace,
							| 'fileName'
							| 'lineNumber'
							| 'functionName'
							| 'columnNumber'
							| 'lineContent'
							| 'linesBefore'
							| 'linesAfter'
							| 'error'
						>
					>
				>
				fields?: Types.Maybe<
					Array<
						Types.Maybe<
							{ __typename?: 'ErrorField' } & Pick<
								Types.ErrorField,
								'name' | 'value'
							>
						>
					>
				>
				error_metrics: Array<
					{ __typename?: 'ErrorDistributionItem' } & Pick<
						Types.ErrorDistributionItem,
						'error_group_id' | 'date' | 'name' | 'value'
					>
				>
			}
	>
}

export type GetErrorObjectQueryVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type GetErrorObjectQuery = { __typename?: 'Query' } & {
	error_object?: Types.Maybe<
		{ __typename?: 'ErrorObject' } & Pick<
			Types.ErrorObject,
			| 'id'
			| 'created_at'
			| 'project_id'
			| 'error_group_id'
			| 'error_group_secure_id'
			| 'event'
			| 'type'
			| 'url'
			| 'source'
			| 'lineNumber'
			| 'columnNumber'
			| 'stack_trace'
			| 'timestamp'
			| 'payload'
			| 'request_id'
			| 'os'
			| 'browser'
			| 'environment'
		> & {
				session?: Types.Maybe<
					{ __typename?: 'Session' } & Pick<
						Types.Session,
						| 'identifier'
						| 'fingerprint'
						| 'secure_id'
						| 'city'
						| 'state'
						| 'country'
						| 'user_properties'
					>
				>
				structured_stack_trace: Array<
					Types.Maybe<
						{ __typename?: 'ErrorTrace' } & Pick<
							Types.ErrorTrace,
							| 'fileName'
							| 'lineNumber'
							| 'functionName'
							| 'columnNumber'
							| 'lineContent'
							| 'linesBefore'
							| 'linesAfter'
							| 'error'
						>
					>
				>
			}
	>
}

export type GetErrorInstanceQueryVariables = Types.Exact<{
	error_group_secure_id: Types.Scalars['String']
	error_object_id?: Types.Maybe<Types.Scalars['ID']>
}>

export type GetErrorInstanceQuery = { __typename?: 'Query' } & {
	error_instance?: Types.Maybe<
		{ __typename?: 'ErrorInstance' } & Pick<
			Types.ErrorInstance,
			'next_id' | 'previous_id'
		> & {
				error_object: { __typename?: 'ErrorObject' } & Pick<
					Types.ErrorObject,
					| 'id'
					| 'created_at'
					| 'project_id'
					| 'error_group_id'
					| 'error_group_secure_id'
					| 'event'
					| 'type'
					| 'url'
					| 'source'
					| 'lineNumber'
					| 'columnNumber'
					| 'stack_trace'
					| 'timestamp'
					| 'payload'
					| 'request_id'
					| 'os'
					| 'browser'
					| 'environment'
				> & {
						session?: Types.Maybe<
							{ __typename?: 'Session' } & Pick<
								Types.Session,
								| 'identifier'
								| 'fingerprint'
								| 'secure_id'
								| 'city'
								| 'state'
								| 'country'
								| 'user_properties'
							>
						>
						structured_stack_trace: Array<
							Types.Maybe<
								{ __typename?: 'ErrorTrace' } & Pick<
									Types.ErrorTrace,
									| 'fileName'
									| 'lineNumber'
									| 'functionName'
									| 'columnNumber'
									| 'lineContent'
									| 'linesBefore'
									| 'linesAfter'
									| 'error'
								> & {
										sourceMappingErrorMetadata?: Types.Maybe<
											{
												__typename?: 'SourceMappingError'
											} & Pick<
												Types.SourceMappingError,
												| 'errorCode'
												| 'stackTraceFileURL'
												| 'sourcemapFetchStrategy'
												| 'sourceMapURL'
												| 'minifiedFetchStrategy'
												| 'actualMinifiedFetchedPath'
												| 'minifiedLineNumber'
												| 'minifiedColumnNumber'
												| 'actualSourcemapFetchedPath'
												| 'sourcemapFileSize'
												| 'minifiedFileSize'
												| 'mappedLineNumber'
												| 'mappedColumnNumber'
											>
										>
									}
							>
						>
					}
			}
	>
}

export type GetRecentErrorsQueryVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
}>

export type GetRecentErrorsQuery = { __typename?: 'Query' } & {
	error_group?: Types.Maybe<
		{ __typename?: 'ErrorGroup' } & Pick<Types.ErrorGroup, 'secure_id'> & {
				metadata_log: Array<
					Types.Maybe<
						{ __typename?: 'ErrorMetadata' } & Pick<
							Types.ErrorMetadata,
							| 'error_id'
							| 'session_secure_id'
							| 'environment'
							| 'timestamp'
							| 'os'
							| 'browser'
							| 'visited_url'
							| 'fingerprint'
							| 'identifier'
							| 'user_properties'
							| 'request_id'
							| 'payload'
						>
					>
				>
			}
	>
}

export type GetMessagesQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetMessagesQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'messages'
>

export type GetResourcesQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetResourcesQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'resources'
>

export type GetFieldSuggestionQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	query: Types.Scalars['String']
}>

export type GetFieldSuggestionQuery = { __typename?: 'Query' } & {
	field_suggestion?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
			>
		>
	>
}

export type GetEnvironmentsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetEnvironmentsQuery = { __typename?: 'Query' } & {
	environment_suggestion?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
			>
		>
	>
}

export type GetAppVersionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetAppVersionsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'app_version_suggestion'
>

export type GetProjectSuggestionQueryVariables = Types.Exact<{
	query: Types.Scalars['String']
}>

export type GetProjectSuggestionQuery = { __typename?: 'Query' } & {
	projectSuggestion: Array<
		Types.Maybe<
			{ __typename?: 'Project' } & Pick<
				Types.Project,
				'id' | 'name' | 'workspace_id'
			>
		>
	>
	workspaceSuggestion: Array<
		Types.Maybe<
			{ __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
		>
	>
}

export type GetErrorFieldSuggestionQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	query: Types.Scalars['String']
}>

export type GetErrorFieldSuggestionQuery = { __typename?: 'Query' } & {
	error_field_suggestion?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'ErrorField' } & Pick<
					Types.ErrorField,
					'name' | 'value'
				>
			>
		>
	>
}

export type GetErrorSearchSuggestionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
}>

export type GetErrorSearchSuggestionsQuery = { __typename?: 'Query' } & {
	visitedUrls?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'ErrorField' } & Pick<
					Types.ErrorField,
					'name' | 'value'
				>
			>
		>
	>
	fields?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'ErrorField' } & Pick<
					Types.ErrorField,
					'name' | 'value'
				>
			>
		>
	>
}

export type GetSessionSearchResultsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
}>

export type GetSessionSearchResultsQuery = { __typename?: 'Query' } & {
	trackProperties?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<
					Types.Field,
					'id' | 'name' | 'value'
				>
			>
		>
	>
	userProperties?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<
					Types.Field,
					'id' | 'name' | 'value'
				>
			>
		>
	>
	visitedUrls?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<
					Types.Field,
					'id' | 'name' | 'value'
				>
			>
		>
	>
	referrers?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<
					Types.Field,
					'id' | 'name' | 'value'
				>
			>
		>
	>
}

export type GetTrackSuggestionQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
}>

export type GetTrackSuggestionQuery = { __typename?: 'Query' } & {
	property_suggestion?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<
					Types.Field,
					'id' | 'name' | 'value'
				>
			>
		>
	>
}

export type GetUserSuggestionQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
}>

export type GetUserSuggestionQuery = { __typename?: 'Query' } & {
	property_suggestion?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<
					Types.Field,
					'id' | 'name' | 'value'
				>
			>
		>
	>
}

export type GetSegmentsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetSegmentsQuery = { __typename?: 'Query' } & {
	segments?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Segment' } & Pick<
					Types.Segment,
					'id' | 'name'
				> & {
						params: { __typename?: 'SearchParams' } & Pick<
							Types.SearchParams,
							| 'os'
							| 'browser'
							| 'visited_url'
							| 'referrer'
							| 'identified'
							| 'hide_viewed'
							| 'first_time'
							| 'app_versions'
							| 'environments'
							| 'device_id'
							| 'show_live_sessions'
							| 'query'
						> & {
								user_properties?: Types.Maybe<
									Array<
										Types.Maybe<
											{
												__typename?: 'UserProperty'
											} & Pick<
												Types.UserProperty,
												'name' | 'value'
											>
										>
									>
								>
								excluded_properties?: Types.Maybe<
									Array<
										Types.Maybe<
											{
												__typename?: 'UserProperty'
											} & Pick<
												Types.UserProperty,
												'name' | 'value'
											>
										>
									>
								>
								track_properties?: Types.Maybe<
									Array<
										Types.Maybe<
											{
												__typename?: 'UserProperty'
											} & Pick<
												Types.UserProperty,
												'name' | 'value'
											>
										>
									>
								>
								date_range?: Types.Maybe<
									{ __typename?: 'DateRange' } & Pick<
										Types.DateRange,
										'start_date' | 'end_date'
									>
								>
								length_range?: Types.Maybe<
									{ __typename?: 'LengthRange' } & Pick<
										Types.LengthRange,
										'min' | 'max'
									>
								>
							}
					}
			>
		>
	>
}

export type GetErrorSegmentsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetErrorSegmentsQuery = { __typename?: 'Query' } & {
	error_segments?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'ErrorSegment' } & Pick<
					Types.ErrorSegment,
					'id' | 'name'
				> & {
						params: { __typename?: 'ErrorSearchParams' } & Pick<
							Types.ErrorSearchParams,
							| 'os'
							| 'browser'
							| 'visited_url'
							| 'state'
							| 'event'
							| 'query'
						> & {
								date_range?: Types.Maybe<
									{ __typename?: 'DateRange' } & Pick<
										Types.DateRange,
										'start_date' | 'end_date'
									>
								>
							}
					}
			>
		>
	>
}

export type IsIntegratedQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type IsIntegratedQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'isIntegrated'
>

export type IsBackendIntegratedQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type IsBackendIntegratedQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'isBackendIntegrated'
>

export type GetKeyPerformanceIndicatorsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookBackPeriod: Types.Scalars['Int']
}>

export type GetKeyPerformanceIndicatorsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'unprocessedSessionsCount' | 'liveUsersCount'
> & {
		newUsersCount?: Types.Maybe<
			{ __typename?: 'NewUsersCount' } & Pick<
				Types.NewUsersCount,
				'count'
			>
		>
		averageSessionLength?: Types.Maybe<
			{ __typename?: 'AverageSessionLength' } & Pick<
				Types.AverageSessionLength,
				'length'
			>
		>
		userFingerprintCount?: Types.Maybe<
			{ __typename?: 'UserFingerprintCount' } & Pick<
				Types.UserFingerprintCount,
				'count'
			>
		>
	}

export type GetReferrersCountQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookBackPeriod: Types.Scalars['Int']
}>

export type GetReferrersCountQuery = { __typename?: 'Query' } & {
	referrers: Array<
		Types.Maybe<
			{ __typename?: 'ReferrerTablePayload' } & Pick<
				Types.ReferrerTablePayload,
				'host' | 'count' | 'percent'
			>
		>
	>
}

export type GetNewUsersCountQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookBackPeriod: Types.Scalars['Int']
}>

export type GetNewUsersCountQuery = { __typename?: 'Query' } & {
	newUsersCount?: Types.Maybe<
		{ __typename?: 'NewUsersCount' } & Pick<Types.NewUsersCount, 'count'>
	>
}

export type GetAverageSessionLengthQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookBackPeriod: Types.Scalars['Int']
}>

export type GetAverageSessionLengthQuery = { __typename?: 'Query' } & {
	averageSessionLength?: Types.Maybe<
		{ __typename?: 'AverageSessionLength' } & Pick<
			Types.AverageSessionLength,
			'length'
		>
	>
}

export type GetTopUsersQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookBackPeriod: Types.Scalars['Int']
}>

export type GetTopUsersQuery = { __typename?: 'Query' } & {
	topUsers: Array<
		Types.Maybe<
			{ __typename?: 'TopUsersPayload' } & Pick<
				Types.TopUsersPayload,
				| 'identifier'
				| 'total_active_time'
				| 'active_time_percentage'
				| 'id'
				| 'user_properties'
			>
		>
	>
}

export type GetDailySessionsCountQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	date_range: Types.DateRangeInput
}>

export type GetDailySessionsCountQuery = { __typename?: 'Query' } & {
	dailySessionsCount: Array<
		Types.Maybe<
			{ __typename?: 'DailySessionCount' } & Pick<
				Types.DailySessionCount,
				'date' | 'count'
			>
		>
	>
}

export type GetDailyErrorsCountQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	date_range: Types.DateRangeInput
}>

export type GetDailyErrorsCountQuery = { __typename?: 'Query' } & {
	dailyErrorsCount: Array<
		Types.Maybe<
			{ __typename?: 'DailyErrorCount' } & Pick<
				Types.DailyErrorCount,
				'date' | 'count'
			>
		>
	>
}

export type GetRageClicksForProjectQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookBackPeriod: Types.Scalars['Int']
}>

export type GetRageClicksForProjectQuery = { __typename?: 'Query' } & {
	rageClicksForProject: Array<
		{ __typename?: 'RageClickEventForProject' } & Pick<
			Types.RageClickEventForProject,
			| 'identifier'
			| 'session_secure_id'
			| 'total_clicks'
			| 'user_properties'
		>
	>
}

export type GetDailyErrorFrequencyQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	error_group_secure_id: Types.Scalars['String']
	date_offset: Types.Scalars['Int']
}>

export type GetDailyErrorFrequencyQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'dailyErrorFrequency'
>

export type GetErrorDistributionQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	error_group_secure_id: Types.Scalars['String']
	property: Types.Scalars['String']
}>

export type GetErrorDistributionQuery = { __typename?: 'Query' } & {
	errorDistribution: Array<
		Types.Maybe<
			{ __typename?: 'ErrorDistributionItem' } & Pick<
				Types.ErrorDistributionItem,
				'name' | 'value'
			>
		>
	>
}

export type GetSlackChannelSuggestionQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetSlackChannelSuggestionQuery = { __typename?: 'Query' } & {
	slack_channel_suggestion: Array<
		{ __typename?: 'SanitizedSlackChannel' } & Pick<
			Types.SanitizedSlackChannel,
			'webhook_channel' | 'webhook_channel_id'
		>
	>
}

export type GetWorkspaceIsIntegratedWithSlackQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithSlackQuery = {
	__typename?: 'Query'
} & { is_integrated_with_slack: Types.Query['is_integrated_with'] }

export type GetWorkspaceIsIntegratedWithLinearQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithLinearQuery = {
	__typename?: 'Query'
} & { is_integrated_with_linear: Types.Query['is_integrated_with'] } & {
	linear_teams?: Types.Maybe<
		Array<
			{ __typename?: 'LinearTeam' } & Pick<
				Types.LinearTeam,
				'team_id' | 'name' | 'key'
			>
		>
	>
}

export type GetWorkspaceIsIntegratedWithZapierQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithZapierQuery = {
	__typename?: 'Query'
} & { is_integrated_with_linear: Types.Query['is_integrated_with'] }

export type GetWorkspaceIsIntegratedWithFrontQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithFrontQuery = {
	__typename?: 'Query'
} & { is_integrated_with_front: Types.Query['is_integrated_with'] }

export type GetWorkspaceIsIntegratedWithDiscordQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithDiscordQuery = {
	__typename?: 'Query'
} & { is_integrated_with_discord: Types.Query['is_integrated_with'] }

export type GetWorkspaceIsIntegratedWithVercelQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithVercelQuery = {
	__typename?: 'Query'
} & { is_integrated_with_vercel: Types.Query['is_integrated_with'] } & {
	vercel_projects: Array<
		{ __typename?: 'VercelProject' } & Pick<
			Types.VercelProject,
			'id' | 'name'
		>
	>
	vercel_project_mappings: Array<
		{ __typename?: 'VercelProjectMapping' } & Pick<
			Types.VercelProjectMapping,
			'vercel_project_id' | 'project_id'
		>
	>
}

export type GetClickUpIntegrationSettingsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetClickUpIntegrationSettingsQuery = { __typename?: 'Query' } & {
	is_integrated: Types.Query['is_workspace_integrated_with']
} & {
	clickup_teams: Array<
		{ __typename?: 'ClickUpTeam' } & Pick<
			Types.ClickUpTeam,
			'id' | 'name'
		> & {
				spaces: Array<
					{ __typename?: 'ClickUpSpace' } & Pick<
						Types.ClickUpSpace,
						'id' | 'name'
					>
				>
			}
	>
	project_mappings: Array<
		{ __typename?: 'ClickUpProjectMapping' } & Pick<
			Types.ClickUpProjectMapping,
			'project_id' | 'clickup_space_id'
		>
	>
}

export type GetHeightIntegrationSettingsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetHeightIntegrationSettingsQuery = { __typename?: 'Query' } & {
	is_integrated: Types.Query['is_workspace_integrated_with']
} & {
	height_workspaces: Array<
		{ __typename?: 'HeightWorkspace' } & Pick<
			Types.HeightWorkspace,
			'id' | 'model' | 'name' | 'url'
		>
	>
	integration_project_mappings: Array<
		{ __typename?: 'IntegrationProjectMapping' } & Pick<
			Types.IntegrationProjectMapping,
			'project_id' | 'external_id'
		>
	>
}

export type GetClickUpFoldersQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetClickUpFoldersQuery = { __typename?: 'Query' } & {
	clickup_folders: Array<
		{ __typename?: 'ClickUpFolder' } & Pick<
			Types.ClickUpFolder,
			'id' | 'name'
		> & {
				lists: Array<
					{ __typename?: 'ClickUpList' } & Pick<
						Types.ClickUpList,
						'id' | 'name'
					>
				>
			}
	>
	clickup_folderless_lists: Array<
		{ __typename?: 'ClickUpList' } & Pick<Types.ClickUpList, 'id' | 'name'>
	>
}

export type GenerateNewZapierAccessTokenJwtQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GenerateNewZapierAccessTokenJwtQuery = {
	__typename?: 'Query'
} & Pick<Types.Query, 'generate_zapier_access_token'>

export type GetIdentifierSuggestionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
}>

export type GetIdentifierSuggestionsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'identifier_suggestion'
>

export type GetAlertsPagePayloadQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetAlertsPagePayloadQuery = { __typename?: 'Query' } & {
	is_integrated_with_slack: Types.Query['is_integrated_with']
	is_integrated_with_discord: Types.Query['is_integrated_with']
} & {
	slack_channel_suggestion: Array<
		{ __typename?: 'SanitizedSlackChannel' } & Pick<
			Types.SanitizedSlackChannel,
			'webhook_channel' | 'webhook_channel_id'
		>
	>
	discord_channel_suggestions: Array<
		{ __typename?: 'DiscordChannel' } & DiscordChannelFragmentFragment
	>
	admins: Array<
		{ __typename?: 'WorkspaceAdminRole' } & {
			admin: { __typename?: 'Admin' } & Pick<
				Types.Admin,
				'id' | 'name' | 'email' | 'photo_url'
			>
		}
	>
	environment_suggestion?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
			>
		>
	>
	error_alerts: Array<
		Types.Maybe<
			{ __typename?: 'ErrorAlert' } & Pick<
				Types.ErrorAlert,
				| 'EmailsToNotify'
				| 'ExcludedEnvironments'
				| 'updated_at'
				| 'CountThreshold'
				| 'LastAdminToEditID'
				| 'ThresholdWindow'
				| 'RegexGroups'
				| 'Frequency'
				| 'id'
				| 'Type'
				| 'Name'
				| 'DailyFrequency'
				| 'disabled'
			> & {
					ChannelsToNotify: Array<
						Types.Maybe<
							{ __typename?: 'SanitizedSlackChannel' } & Pick<
								Types.SanitizedSlackChannel,
								'webhook_channel' | 'webhook_channel_id'
							>
						>
					>
					DiscordChannelsToNotify: Array<
						{
							__typename?: 'DiscordChannel'
						} & DiscordChannelFragmentFragment
					>
				}
		>
	>
	session_feedback_alerts: Array<
		Types.Maybe<
			{ __typename?: 'SessionAlert' } & SessionAlertFragmentFragment
		>
	>
	new_session_alerts: Array<
		Types.Maybe<
			{ __typename?: 'SessionAlert' } & SessionAlertFragmentFragment
		>
	>
	rage_click_alerts: Array<
		Types.Maybe<
			{ __typename?: 'SessionAlert' } & SessionAlertFragmentFragment
		>
	>
	new_user_alerts?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'SessionAlert' } & SessionAlertFragmentFragment
			>
		>
	>
	track_properties_alerts: Array<
		Types.Maybe<
			{ __typename?: 'SessionAlert' } & SessionAlertFragmentFragment
		>
	>
	user_properties_alerts: Array<
		Types.Maybe<
			{ __typename?: 'SessionAlert' } & SessionAlertFragmentFragment
		>
	>
	metric_monitors: Array<
		Types.Maybe<
			{ __typename?: 'MetricMonitor' } & Pick<
				Types.MetricMonitor,
				| 'id'
				| 'updated_at'
				| 'name'
				| 'emails_to_notify'
				| 'aggregator'
				| 'period_minutes'
				| 'metric_to_monitor'
				| 'last_admin_to_edit_id'
				| 'threshold'
				| 'units'
				| 'disabled'
			> & {
					channels_to_notify: Array<
						Types.Maybe<
							{ __typename?: 'SanitizedSlackChannel' } & Pick<
								Types.SanitizedSlackChannel,
								'webhook_channel' | 'webhook_channel_id'
							>
						>
					>
					discord_channels_to_notify: Array<
						{ __typename?: 'DiscordChannel' } & Pick<
							Types.DiscordChannel,
							'id' | 'name'
						>
					>
					filters?: Types.Maybe<
						Array<
							{ __typename?: 'MetricTagFilter' } & Pick<
								Types.MetricTagFilter,
								'tag' | 'op' | 'value'
							>
						>
					>
				}
		>
	>
}

export type GetMetricMonitorsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	metric_name: Types.Scalars['String']
}>

export type GetMetricMonitorsQuery = { __typename?: 'Query' } & {
	metric_monitors: Array<
		Types.Maybe<
			{ __typename?: 'MetricMonitor' } & Pick<
				Types.MetricMonitor,
				'id' | 'updated_at' | 'name' | 'metric_to_monitor'
			>
		>
	>
}

export type GetCommentMentionSuggestionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetCommentMentionSuggestionsQuery = { __typename?: 'Query' } & {
	admins: Array<
		{ __typename?: 'WorkspaceAdminRole' } & {
			admin: { __typename?: 'Admin' } & Pick<
				Types.Admin,
				'id' | 'name' | 'email' | 'photo_url'
			>
		}
	>
	slack_channel_suggestion: Array<
		{ __typename?: 'SanitizedSlackChannel' } & Pick<
			Types.SanitizedSlackChannel,
			'webhook_channel' | 'webhook_channel_id'
		>
	>
}

export type GetCustomerPortalUrlQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetCustomerPortalUrlQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'customer_portal_url'
>

export type OnSessionPayloadAppendedSubscriptionVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
	initial_events_count: Types.Scalars['Int']
}>

export type OnSessionPayloadAppendedSubscription = {
	__typename?: 'Subscription'
} & {
	session_payload_appended?: Types.Maybe<
		{ __typename?: 'SessionPayload' } & SessionPayloadFragmentFragment
	>
}

export type GetWebVitalsQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetWebVitalsQuery = { __typename?: 'Query' } & {
	web_vitals: Array<
		{ __typename?: 'Metric' } & Pick<Types.Metric, 'name' | 'value'>
	>
}

export type GetDashboardDefinitionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetDashboardDefinitionsQuery = { __typename?: 'Query' } & {
	dashboard_definitions: Array<
		Types.Maybe<
			{ __typename?: 'DashboardDefinition' } & Pick<
				Types.DashboardDefinition,
				| 'id'
				| 'updated_at'
				| 'project_id'
				| 'name'
				| 'is_default'
				| 'last_admin_to_edit_id'
				| 'layout'
			> & {
					metrics: Array<
						{ __typename?: 'DashboardMetricConfig' } & Pick<
							Types.DashboardMetricConfig,
							| 'component_type'
							| 'name'
							| 'description'
							| 'max_good_value'
							| 'max_needs_improvement_value'
							| 'poor_value'
							| 'units'
							| 'help_article'
							| 'chart_type'
							| 'aggregator'
							| 'min_value'
							| 'min_percentile'
							| 'max_value'
							| 'max_percentile'
							| 'groups'
						> & {
								filters?: Types.Maybe<
									Array<
										{
											__typename?: 'MetricTagFilter'
										} & Pick<
											Types.MetricTagFilter,
											'value' | 'op' | 'tag'
										>
									>
								>
							}
					>
				}
		>
	>
}

export type GetSuggestedMetricsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	prefix: Types.Scalars['String']
}>

export type GetSuggestedMetricsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'suggested_metrics'
>

export type GetMetricTagsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	metric_name: Types.Scalars['String']
}>

export type GetMetricTagsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'metric_tags'
>

export type GetMetricTagValuesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	metric_name: Types.Scalars['String']
	tag_name: Types.Scalars['String']
}>

export type GetMetricTagValuesQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'metric_tag_values'
>

export type GetSourcemapFilesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	version?: Types.Maybe<Types.Scalars['String']>
}>

export type GetSourcemapFilesQuery = { __typename?: 'Query' } & {
	sourcemap_files: Array<
		{ __typename?: 'S3File' } & Pick<Types.S3File, 'key'>
	>
}

export type GetSourcemapVersionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetSourcemapVersionsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'sourcemap_versions'
>

export type GetOAuthClientMetadataQueryVariables = Types.Exact<{
	client_id: Types.Scalars['String']
}>

export type GetOAuthClientMetadataQuery = { __typename?: 'Query' } & {
	oauth_client_metadata?: Types.Maybe<
		{ __typename?: 'OAuthClient' } & Pick<
			Types.OAuthClient,
			'id' | 'created_at' | 'app_name'
		>
	>
}

export type GetErrorGroupFrequenciesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	error_group_secure_ids:
		| Array<Types.Scalars['String']>
		| Types.Scalars['String']
	params: Types.ErrorGroupFrequenciesParamsInput
	metric: Types.Scalars['String']
}>

export type GetErrorGroupFrequenciesQuery = { __typename?: 'Query' } & {
	errorGroupFrequencies: Array<
		Types.Maybe<
			{ __typename?: 'ErrorDistributionItem' } & Pick<
				Types.ErrorDistributionItem,
				'error_group_id' | 'date' | 'name' | 'value'
			>
		>
	>
}

export type GetEmailOptOutsQueryVariables = Types.Exact<{
	token?: Types.Maybe<Types.Scalars['String']>
	admin_id?: Types.Maybe<Types.Scalars['ID']>
}>

export type GetEmailOptOutsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'email_opt_outs'
>

export const namedOperations = {
	Query: {
		GetMetricsTimeline: 'GetMetricsTimeline' as const,
		GetMetricsHistogram: 'GetMetricsHistogram' as const,
		GetNetworkHistogram: 'GetNetworkHistogram' as const,
		GetSessionPayload: 'GetSessionPayload' as const,
		GetCommentTagsForProject: 'GetCommentTagsForProject' as const,
		GetEventChunkURL: 'GetEventChunkURL' as const,
		GetEventChunks: 'GetEventChunks' as const,
		GetSession: 'GetSession' as const,
		GetWorkspaceAdminsByProjectId: 'GetWorkspaceAdminsByProjectId' as const,
		GetWorkspaceAdmins: 'GetWorkspaceAdmins' as const,
		GetSessionComments: 'GetSessionComments' as const,
		GetNotifications: 'GetNotifications' as const,
		GetSessionCommentsForAdmin: 'GetSessionCommentsForAdmin' as const,
		isSessionPending: 'isSessionPending' as const,
		GetAccounts: 'GetAccounts' as const,
		GetAccountDetails: 'GetAccountDetails' as const,
		GetErrorComments: 'GetErrorComments' as const,
		GetEnhancedUserDetails: 'GetEnhancedUserDetails' as const,
		GetOnboardingSteps: 'GetOnboardingSteps' as const,
		GetSessionIntervals: 'GetSessionIntervals' as const,
		GetTimelineIndicatorEvents: 'GetTimelineIndicatorEvents' as const,
		GetFieldTypes: 'GetFieldTypes' as const,
		GetFieldsOpensearch: 'GetFieldsOpensearch' as const,
		GetQuickFieldsOpensearch: 'GetQuickFieldsOpensearch' as const,
		GetErrorFieldsOpensearch: 'GetErrorFieldsOpensearch' as const,
		GetSessionsOpenSearch: 'GetSessionsOpenSearch' as const,
		GetSessionsHistogram: 'GetSessionsHistogram' as const,
		GetErrorGroupsOpenSearch: 'GetErrorGroupsOpenSearch' as const,
		GetErrorsHistogram: 'GetErrorsHistogram' as const,
		GetProjects: 'GetProjects' as const,
		GetWorkspace: 'GetWorkspace' as const,
		GetWorkspaces: 'GetWorkspaces' as const,
		GetWorkspacesCount: 'GetWorkspacesCount' as const,
		GetProjectsAndWorkspaces: 'GetProjectsAndWorkspaces' as const,
		GetProjectOrWorkspace: 'GetProjectOrWorkspace' as const,
		GetProjectDropdownOptions: 'GetProjectDropdownOptions' as const,
		GetWorkspaceDropdownOptions: 'GetWorkspaceDropdownOptions' as const,
		GetAdmin: 'GetAdmin' as const,
		GetAdminRole: 'GetAdminRole' as const,
		GetAdminRoleByProject: 'GetAdminRoleByProject' as const,
		GetAdminAboutYou: 'GetAdminAboutYou' as const,
		GetProject: 'GetProject' as const,
		GetBillingDetailsForProject: 'GetBillingDetailsForProject' as const,
		GetBillingDetails: 'GetBillingDetails' as const,
		GetSubscriptionDetails: 'GetSubscriptionDetails' as const,
		GetErrorGroup: 'GetErrorGroup' as const,
		GetErrorObject: 'GetErrorObject' as const,
		GetErrorInstance: 'GetErrorInstance' as const,
		GetRecentErrors: 'GetRecentErrors' as const,
		GetMessages: 'GetMessages' as const,
		GetResources: 'GetResources' as const,
		GetFieldSuggestion: 'GetFieldSuggestion' as const,
		GetEnvironments: 'GetEnvironments' as const,
		GetAppVersions: 'GetAppVersions' as const,
		GetProjectSuggestion: 'GetProjectSuggestion' as const,
		GetErrorFieldSuggestion: 'GetErrorFieldSuggestion' as const,
		GetErrorSearchSuggestions: 'GetErrorSearchSuggestions' as const,
		GetSessionSearchResults: 'GetSessionSearchResults' as const,
		GetTrackSuggestion: 'GetTrackSuggestion' as const,
		GetUserSuggestion: 'GetUserSuggestion' as const,
		GetSegments: 'GetSegments' as const,
		GetErrorSegments: 'GetErrorSegments' as const,
		IsIntegrated: 'IsIntegrated' as const,
		IsBackendIntegrated: 'IsBackendIntegrated' as const,
		GetKeyPerformanceIndicators: 'GetKeyPerformanceIndicators' as const,
		GetReferrersCount: 'GetReferrersCount' as const,
		GetNewUsersCount: 'GetNewUsersCount' as const,
		GetAverageSessionLength: 'GetAverageSessionLength' as const,
		GetTopUsers: 'GetTopUsers' as const,
		GetDailySessionsCount: 'GetDailySessionsCount' as const,
		GetDailyErrorsCount: 'GetDailyErrorsCount' as const,
		GetRageClicksForProject: 'GetRageClicksForProject' as const,
		GetDailyErrorFrequency: 'GetDailyErrorFrequency' as const,
		GetErrorDistribution: 'GetErrorDistribution' as const,
		GetSlackChannelSuggestion: 'GetSlackChannelSuggestion' as const,
		GetWorkspaceIsIntegratedWithSlack:
			'GetWorkspaceIsIntegratedWithSlack' as const,
		GetWorkspaceIsIntegratedWithLinear:
			'GetWorkspaceIsIntegratedWithLinear' as const,
		GetWorkspaceIsIntegratedWithZapier:
			'GetWorkspaceIsIntegratedWithZapier' as const,
		GetWorkspaceIsIntegratedWithFront:
			'GetWorkspaceIsIntegratedWithFront' as const,
		GetWorkspaceIsIntegratedWithDiscord:
			'GetWorkspaceIsIntegratedWithDiscord' as const,
		GetWorkspaceIsIntegratedWithVercel:
			'GetWorkspaceIsIntegratedWithVercel' as const,
		GetClickUpIntegrationSettings: 'GetClickUpIntegrationSettings' as const,
		GetHeightIntegrationSettings: 'GetHeightIntegrationSettings' as const,
		GetClickUpFolders: 'GetClickUpFolders' as const,
		GenerateNewZapierAccessTokenJwt:
			'GenerateNewZapierAccessTokenJwt' as const,
		GetIdentifierSuggestions: 'GetIdentifierSuggestions' as const,
		GetAlertsPagePayload: 'GetAlertsPagePayload' as const,
		GetMetricMonitors: 'GetMetricMonitors' as const,
		GetCommentMentionSuggestions: 'GetCommentMentionSuggestions' as const,
		GetCustomerPortalURL: 'GetCustomerPortalURL' as const,
		GetWebVitals: 'GetWebVitals' as const,
		GetDashboardDefinitions: 'GetDashboardDefinitions' as const,
		GetSuggestedMetrics: 'GetSuggestedMetrics' as const,
		GetMetricTags: 'GetMetricTags' as const,
		GetMetricTagValues: 'GetMetricTagValues' as const,
		GetSourcemapFiles: 'GetSourcemapFiles' as const,
		GetSourcemapVersions: 'GetSourcemapVersions' as const,
		GetOAuthClientMetadata: 'GetOAuthClientMetadata' as const,
		GetErrorGroupFrequencies: 'GetErrorGroupFrequencies' as const,
		GetEmailOptOuts: 'GetEmailOptOuts' as const,
	},
	Mutation: {
		MarkSessionAsViewed: 'MarkSessionAsViewed' as const,
		MarkSessionAsStarred: 'MarkSessionAsStarred' as const,
		MuteSessionCommentThread: 'MuteSessionCommentThread' as const,
		CreateOrUpdateStripeSubscription:
			'CreateOrUpdateStripeSubscription' as const,
		UpdateBillingDetails: 'UpdateBillingDetails' as const,
		updateErrorGroupState: 'updateErrorGroupState' as const,
		SendEmailSignup: 'SendEmailSignup' as const,
		AddAdminToWorkspace: 'AddAdminToWorkspace' as const,
		JoinWorkspace: 'JoinWorkspace' as const,
		ChangeAdminRole: 'ChangeAdminRole' as const,
		DeleteAdminFromProject: 'DeleteAdminFromProject' as const,
		DeleteAdminFromWorkspace: 'DeleteAdminFromWorkspace' as const,
		AddIntegrationToProject: 'AddIntegrationToProject' as const,
		RemoveIntegrationFromProject: 'RemoveIntegrationFromProject' as const,
		AddIntegrationToWorkspace: 'AddIntegrationToWorkspace' as const,
		RemoveIntegrationFromWorkspace:
			'RemoveIntegrationFromWorkspace' as const,
		UpdateAllowedEmailOrigins: 'UpdateAllowedEmailOrigins' as const,
		CreateProject: 'CreateProject' as const,
		SubmitRegistrationForm: 'SubmitRegistrationForm' as const,
		CreateWorkspace: 'CreateWorkspace' as const,
		EditProject: 'EditProject' as const,
		DeleteProject: 'DeleteProject' as const,
		EditWorkspace: 'EditWorkspace' as const,
		DeleteSegment: 'DeleteSegment' as const,
		EditSegment: 'EditSegment' as const,
		CreateSegment: 'CreateSegment' as const,
		CreateSessionComment: 'CreateSessionComment' as const,
		CreateIssueForSessionComment: 'CreateIssueForSessionComment' as const,
		DeleteSessionComment: 'DeleteSessionComment' as const,
		ReplyToSessionComment: 'ReplyToSessionComment' as const,
		CreateErrorComment: 'CreateErrorComment' as const,
		CreateIssueForErrorComment: 'CreateIssueForErrorComment' as const,
		DeleteErrorComment: 'DeleteErrorComment' as const,
		MuteErrorCommentThread: 'MuteErrorCommentThread' as const,
		ReplyToErrorComment: 'ReplyToErrorComment' as const,
		DeleteErrorSegment: 'DeleteErrorSegment' as const,
		EditErrorSegment: 'EditErrorSegment' as const,
		CreateErrorSegment: 'CreateErrorSegment' as const,
		CreateErrorAlert: 'CreateErrorAlert' as const,
		CreateMetricMonitor: 'CreateMetricMonitor' as const,
		UpdateMetricMonitor: 'UpdateMetricMonitor' as const,
		DeleteMetricMonitor: 'DeleteMetricMonitor' as const,
		UpdateAdminAboutYouDetails: 'UpdateAdminAboutYouDetails' as const,
		UpdateErrorAlert: 'UpdateErrorAlert' as const,
		DeleteErrorAlert: 'DeleteErrorAlert' as const,
		DeleteSessionAlert: 'DeleteSessionAlert' as const,
		UpdateSessionAlertIsDisabled: 'UpdateSessionAlertIsDisabled' as const,
		UpdateMetricMonitorIsDisabled: 'UpdateMetricMonitorIsDisabled' as const,
		UpdateErrorAlertIsDisabled: 'UpdateErrorAlertIsDisabled' as const,
		CreateDefaultAlerts: 'CreateDefaultAlerts' as const,
		CreateSessionAlert: 'CreateSessionAlert' as const,
		UpdateSessionAlert: 'UpdateSessionAlert' as const,
		UpdateSessionIsPublic: 'UpdateSessionIsPublic' as const,
		UpdateErrorGroupIsPublic: 'UpdateErrorGroupIsPublic' as const,
		UpdateAllowMeterOverage: 'UpdateAllowMeterOverage' as const,
		SyncSlackIntegration: 'SyncSlackIntegration' as const,
		RequestAccess: 'RequestAccess' as const,
		ModifyClearbitIntegration: 'ModifyClearbitIntegration' as const,
		UpsertDashboard: 'UpsertDashboard' as const,
		DeleteDashboard: 'DeleteDashboard' as const,
		DeleteSessions: 'DeleteSessions' as const,
		UpdateVercelSettings: 'UpdateVercelSettings' as const,
		UpdateClickUpSettings: 'UpdateClickUpSettings' as const,
		UpdateIntegrationProjectSettings:
			'UpdateIntegrationProjectSettings' as const,
		UpdateEmailOptOut: 'UpdateEmailOptOut' as const,
		SendAdminWorkspaceInvite: 'SendAdminWorkspaceInvite' as const,
	},
	Subscription: {
		OnSessionPayloadAppended: 'OnSessionPayloadAppended' as const,
	},
	Fragment: {
		SessionPayloadFragment: 'SessionPayloadFragment' as const,
		SessionAlertFragment: 'SessionAlertFragment' as const,
		DiscordChannelFragment: 'DiscordChannelFragment' as const,
	},
}
