import * as Types from './schemas'

export type MarkErrorGroupAsViewedMutationVariables = Types.Exact<{
	error_secure_id: Types.Scalars['String']
	viewed: Types.Scalars['Boolean']
}>

export type MarkErrorGroupAsViewedMutation = { __typename?: 'Mutation' } & {
	markErrorGroupAsViewed?: Types.Maybe<
		{ __typename?: 'ErrorGroup' } & Pick<
			Types.ErrorGroup,
			'secure_id' | 'viewed'
		>
	>
}

export type MarkSessionAsViewedMutationVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
	viewed: Types.Scalars['Boolean']
}>

export type MarkSessionAsViewedMutation = { __typename?: 'Mutation' } & {
	markSessionAsViewed?: Types.Maybe<
		{ __typename?: 'Session' } & Pick<Types.Session, 'secure_id' | 'viewed'>
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
}>

export type CreateOrUpdateStripeSubscriptionMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'createOrUpdateStripeSubscription'>

export type HandleAwsMarketplaceMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	code: Types.Scalars['String']
}>

export type HandleAwsMarketplaceMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'handleAWSMarketplace'
>

export type SaveBillingPlanMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	sessionsLimitCents?: Types.Maybe<Types.Scalars['Int']>
	sessionsRetention: Types.RetentionPeriod
	errorsLimitCents?: Types.Maybe<Types.Scalars['Int']>
	errorsRetention: Types.RetentionPeriod
	logsLimitCents?: Types.Maybe<Types.Scalars['Int']>
	logsRetention: Types.RetentionPeriod
	tracesLimitCents?: Types.Maybe<Types.Scalars['Int']>
	tracesRetention: Types.RetentionPeriod
}>

export type SaveBillingPlanMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'saveBillingPlan'
>

export type UpdateBillingDetailsMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type UpdateBillingDetailsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'updateBillingDetails'
>

export type UpdateErrorGroupStateMutationVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
	state: Types.ErrorState
	snoozed_until?: Types.Maybe<Types.Scalars['Timestamp']>
}>

export type UpdateErrorGroupStateMutation = { __typename?: 'Mutation' } & {
	updateErrorGroupState?: Types.Maybe<
		{ __typename?: 'ErrorGroup' } & Pick<
			Types.ErrorGroup,
			'secure_id' | 'state' | 'snoozed_until'
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

export type ChangeAdminRoleMutation = { __typename?: 'Mutation' } & {
	changeAdminRole: { __typename?: 'WorkspaceAdminRole' } & Pick<
		Types.WorkspaceAdminRole,
		'workspaceId' | 'role' | 'projectIds'
	> & { admin: { __typename?: 'Admin' } & Pick<Types.Admin, 'id'> }
}

export type ChangeProjectMembershipMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	admin_id: Types.Scalars['ID']
	project_ids: Array<Types.Scalars['ID']> | Types.Scalars['ID']
}>

export type ChangeProjectMembershipMutation = { __typename?: 'Mutation' } & {
	changeProjectMembership: { __typename?: 'WorkspaceAdminRole' } & Pick<
		Types.WorkspaceAdminRole,
		'workspaceId' | 'role' | 'projectIds'
	> & { admin: { __typename?: 'Admin' } & Pick<Types.Admin, 'id'> }
}

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

export type CreateAdminMutationVariables = Types.Exact<{ [key: string]: never }>

export type CreateAdminMutation = { __typename?: 'Mutation' } & {
	createAdmin: { __typename?: 'Admin' } & Pick<
		Types.Admin,
		'id' | 'name' | 'email' | 'email_verified' | 'about_you_details_filled'
	>
}

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
	error_filters?: Types.Maybe<Types.Scalars['StringArray']>
	error_json_paths?: Types.Maybe<Types.Scalars['StringArray']>
	filter_chrome_extension?: Types.Maybe<Types.Scalars['Boolean']>
	rage_click_window_seconds?: Types.Maybe<Types.Scalars['Int']>
	rage_click_radius_pixels?: Types.Maybe<Types.Scalars['Int']>
	rage_click_count?: Types.Maybe<Types.Scalars['Int']>
}>

export type EditProjectMutation = { __typename?: 'Mutation' } & {
	editProject?: Types.Maybe<
		{ __typename?: 'Project' } & Pick<
			Types.Project,
			| 'id'
			| 'name'
			| 'billing_email'
			| 'excluded_users'
			| 'error_filters'
			| 'error_json_paths'
			| 'filter_chrome_extension'
			| 'rage_click_window_seconds'
			| 'rage_click_radius_pixels'
			| 'rage_click_count'
		>
	>
}

export type EditProjectSettingsMutationVariables = Types.Exact<{
	projectId: Types.Scalars['ID']
	name?: Types.Maybe<Types.Scalars['String']>
	billing_email?: Types.Maybe<Types.Scalars['String']>
	excluded_users?: Types.Maybe<Types.Scalars['StringArray']>
	error_filters?: Types.Maybe<Types.Scalars['StringArray']>
	error_json_paths?: Types.Maybe<Types.Scalars['StringArray']>
	filter_chrome_extension?: Types.Maybe<Types.Scalars['Boolean']>
	rage_click_window_seconds?: Types.Maybe<Types.Scalars['Int']>
	rage_click_radius_pixels?: Types.Maybe<Types.Scalars['Int']>
	rage_click_count?: Types.Maybe<Types.Scalars['Int']>
	filterSessionsWithoutError?: Types.Maybe<Types.Scalars['Boolean']>
	autoResolveStaleErrorsDayInterval?: Types.Maybe<Types.Scalars['Int']>
	sampling?: Types.Maybe<Types.SamplingInput>
}>

export type EditProjectSettingsMutation = { __typename?: 'Mutation' } & {
	editProjectSettings?: Types.Maybe<
		{ __typename?: 'AllProjectSettings' } & Pick<
			Types.AllProjectSettings,
			| 'id'
			| 'name'
			| 'billing_email'
			| 'excluded_users'
			| 'error_filters'
			| 'error_json_paths'
			| 'filter_chrome_extension'
			| 'rage_click_window_seconds'
			| 'rage_click_radius_pixels'
			| 'rage_click_count'
			| 'filterSessionsWithoutError'
			| 'autoResolveStaleErrorsDayInterval'
		> & {
				sampling: { __typename?: 'Sampling' } & Pick<
					Types.Sampling,
					| 'session_sampling_rate'
					| 'error_sampling_rate'
					| 'log_sampling_rate'
					| 'trace_sampling_rate'
					| 'session_minute_rate_limit'
					| 'error_minute_rate_limit'
					| 'log_minute_rate_limit'
					| 'trace_minute_rate_limit'
					| 'session_exclusion_query'
					| 'error_exclusion_query'
					| 'log_exclusion_query'
					| 'trace_exclusion_query'
				>
			}
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

export type EditWorkspaceSettingsMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	ai_application?: Types.Maybe<Types.Scalars['Boolean']>
	ai_insights?: Types.Maybe<Types.Scalars['Boolean']>
	ai_query_builder?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type EditWorkspaceSettingsMutation = { __typename?: 'Mutation' } & {
	editWorkspaceSettings?: Types.Maybe<
		{ __typename?: 'AllWorkspaceSettings' } & Pick<
			Types.AllWorkspaceSettings,
			| 'workspace_id'
			| 'ai_application'
			| 'ai_insights'
			| 'ai_query_builder'
		>
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
	issue_type_id?: Types.Maybe<Types.Scalars['String']>
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

export type CreateSessionCommentWithExistingIssueMutationVariables =
	Types.Exact<{
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
		issue_url: Types.Scalars['String']
		issue_id: Types.Scalars['String']
		additional_context?: Types.Maybe<Types.Scalars['String']>
	}>

export type CreateSessionCommentWithExistingIssueMutation = {
	__typename?: 'Mutation'
} & {
	createSessionCommentWithExistingIssue?: Types.Maybe<
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
	issue_type_id?: Types.Maybe<Types.Scalars['String']>
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

export type LinkIssueForSessionCommentMutationVariables = Types.Exact<{
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
	issue_id: Types.Scalars['String']
	issue_url: Types.Scalars['String']
}>

export type LinkIssueForSessionCommentMutation = { __typename?: 'Mutation' } & {
	linkIssueForSessionComment?: Types.Maybe<
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
	issue_type_id?: Types.Maybe<Types.Scalars['String']>
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

export type CreateErrorCommentForExistingIssueMutationVariables = Types.Exact<{
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
	issue_title: Types.Scalars['String']
	issue_url: Types.Scalars['String']
	issue_id: Types.Scalars['String']
}>

export type CreateErrorCommentForExistingIssueMutation = {
	__typename?: 'Mutation'
} & {
	createErrorCommentForExistingIssue?: Types.Maybe<
		{ __typename: 'ErrorComment' } & Pick<
			Types.ErrorComment,
			'id' | 'created_at' | 'updated_at' | 'text'
		> & {
				author: { __typename: 'SanitizedAdmin' } & Pick<
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
	issue_type_id?: Types.Maybe<Types.Scalars['String']>
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

export type LinkIssueForErrorCommentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	error_comment_id: Types.Scalars['Int']
	text_for_attachment: Types.Scalars['String']
	error_url: Types.Scalars['String']
	author_name: Types.Scalars['String']
	integrations:
		| Array<Types.Maybe<Types.IntegrationType>>
		| Types.Maybe<Types.IntegrationType>
	issue_title?: Types.Maybe<Types.Scalars['String']>
	issue_id: Types.Scalars['String']
	issue_url: Types.Scalars['String']
}>

export type LinkIssueForErrorCommentMutation = { __typename?: 'Mutation' } & {
	linkIssueForErrorComment?: Types.Maybe<
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

export type RemoveErrorIssueMutationVariables = Types.Exact<{
	error_issue_id: Types.Scalars['ID']
}>

export type RemoveErrorIssueMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'removeErrorIssue'
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
	webhook_destinations:
		| Array<Types.WebhookDestinationInput>
		| Types.WebhookDestinationInput
	microsoft_teams_channels:
		| Array<Types.MicrosoftTeamsChannelInput>
		| Types.MicrosoftTeamsChannelInput
	emails:
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	regex_groups:
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	frequency: Types.Scalars['Int']
	default?: Types.Maybe<Types.Scalars['Boolean']>
	query: Types.Scalars['String']
}>

export type CreateErrorAlertMutation = { __typename?: 'Mutation' } & {
	createErrorAlert?: Types.Maybe<
		{ __typename?: 'ErrorAlert' } & Pick<
			Types.ErrorAlert,
			| 'id'
			| 'EmailsToNotify'
			| 'Name'
			| 'CountThreshold'
			| 'ThresholdWindow'
			| 'LastAdminToEditID'
			| 'RegexGroups'
			| 'Frequency'
			| 'disabled'
			| 'Query'
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
	webhook_destinations:
		| Array<Types.WebhookDestinationInput>
		| Types.WebhookDestinationInput
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
	webhook_destinations:
		| Array<Types.WebhookDestinationInput>
		| Types.WebhookDestinationInput
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

export type CreateAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	product_type: Types.ProductType
	function_type: Types.MetricAggregator
	function_column?: Types.Maybe<Types.Scalars['String']>
	query?: Types.Maybe<Types.Scalars['String']>
	group_by_key?: Types.Maybe<Types.Scalars['String']>
	below_threshold?: Types.Maybe<Types.Scalars['Boolean']>
	threshold_value?: Types.Maybe<Types.Scalars['Float']>
	threshold_window?: Types.Maybe<Types.Scalars['Int']>
	threshold_cooldown?: Types.Maybe<Types.Scalars['Int']>
	destinations:
		| Array<Types.AlertDestinationInput>
		| Types.AlertDestinationInput
}>

export type CreateAlertMutation = { __typename?: 'Mutation' } & {
	createAlert?: Types.Maybe<
		{ __typename?: 'Alert' } & Pick<
			Types.Alert,
			'id' | 'name' | 'product_type'
		>
	>
}

export type UpdateAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	alert_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	product_type: Types.ProductType
	function_type: Types.MetricAggregator
	function_column?: Types.Maybe<Types.Scalars['String']>
	query?: Types.Maybe<Types.Scalars['String']>
	group_by_key?: Types.Maybe<Types.Scalars['String']>
	below_threshold?: Types.Maybe<Types.Scalars['Boolean']>
	threshold_value?: Types.Maybe<Types.Scalars['Float']>
	threshold_window?: Types.Maybe<Types.Scalars['Int']>
	threshold_cooldown?: Types.Maybe<Types.Scalars['Int']>
	destinations?: Types.Maybe<
		Array<Types.AlertDestinationInput> | Types.AlertDestinationInput
	>
}>

export type UpdateAlertMutation = { __typename?: 'Mutation' } & {
	updateAlert?: Types.Maybe<
		{ __typename?: 'Alert' } & Pick<
			Types.Alert,
			'id' | 'name' | 'product_type'
		>
	>
}

export type UpdateAlertDisabledMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	alert_id: Types.Scalars['ID']
	disabled: Types.Scalars['Boolean']
}>

export type UpdateAlertDisabledMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'updateAlertDisabled'
>

export type DeleteAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	alert_id: Types.Scalars['ID']
}>

export type DeleteAlertMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteAlert'
>

export type UpdateAdminAndCreateWorkspaceMutationVariables = Types.Exact<{
	admin_and_workspace_details: Types.AdminAndWorkspaceDetails
}>

export type UpdateAdminAndCreateWorkspaceMutation = {
	__typename?: 'Mutation'
} & {
	updateAdminAndCreateWorkspace?: Types.Maybe<
		{ __typename?: 'Project' } & Pick<Types.Project, 'id'>
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
	microsoft_teams_channels:
		| Array<Types.MicrosoftTeamsChannelInput>
		| Types.MicrosoftTeamsChannelInput
	webhook_destinations:
		| Array<Types.WebhookDestinationInput>
		| Types.WebhookDestinationInput
	emails?: Types.Maybe<
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	>
	regex_groups?: Types.Maybe<
		| Array<Types.Maybe<Types.Scalars['String']>>
		| Types.Maybe<Types.Scalars['String']>
	>
	frequency?: Types.Maybe<Types.Scalars['Int']>
	disabled?: Types.Maybe<Types.Scalars['Boolean']>
	query: Types.Scalars['String']
}>

export type UpdateErrorAlertMutation = { __typename?: 'Mutation' } & {
	updateErrorAlert?: Types.Maybe<
		{ __typename?: 'ErrorAlert' } & Pick<
			Types.ErrorAlert,
			| 'Name'
			| 'EmailsToNotify'
			| 'CountThreshold'
			| 'ThresholdWindow'
			| 'LastAdminToEditID'
			| 'Frequency'
			| 'disabled'
			| 'Query'
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
				MicrosoftTeamsChannelsToNotify: Array<
					{ __typename?: 'MicrosoftTeamsChannel' } & Pick<
						Types.MicrosoftTeamsChannel,
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

export type UpdateLogAlertMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	input: Types.LogAlertInput
}>

export type UpdateLogAlertMutation = { __typename?: 'Mutation' } & {
	updateLogAlert?: Types.Maybe<
		{ __typename?: 'LogAlert' } & Pick<Types.LogAlert, 'id'>
	>
}

export type CreateLogAlertMutationVariables = Types.Exact<{
	input: Types.LogAlertInput
}>

export type CreateLogAlertMutation = { __typename?: 'Mutation' } & {
	createLogAlert?: Types.Maybe<
		{ __typename?: 'LogAlert' } & Pick<Types.LogAlert, 'id'>
	>
}

export type DeleteLogAlertMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	id: Types.Scalars['ID']
}>

export type DeleteLogAlertMutation = { __typename?: 'Mutation' } & {
	deleteLogAlert?: Types.Maybe<
		{ __typename?: 'LogAlert' } & Pick<Types.LogAlert, 'id'>
	>
}

export type UpdateLogAlertIsDisabledMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	project_id: Types.Scalars['ID']
	disabled: Types.Scalars['Boolean']
}>

export type UpdateLogAlertIsDisabledMutation = { __typename?: 'Mutation' } & {
	updateLogAlertIsDisabled?: Types.Maybe<
		{ __typename?: 'LogAlert' } & Pick<Types.LogAlert, 'id'>
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
	params: Types.QueryInput
	sessionCount: Types.Scalars['Int']
}>

export type DeleteSessionsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteSessions'
>

export type ExportSessionMutationVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type ExportSessionMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'exportSession'
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

export type DeleteInviteLinkFromWorkspaceMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	workspace_invite_link_id: Types.Scalars['ID']
}>

export type DeleteInviteLinkFromWorkspaceMutation = {
	__typename?: 'Mutation'
} & Pick<Types.Mutation, 'deleteInviteLinkFromWorkspace'>

export type EditServiceGithubSettingsMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
	project_id: Types.Scalars['ID']
	github_repo_path?: Types.Maybe<Types.Scalars['String']>
	build_prefix?: Types.Maybe<Types.Scalars['String']>
	github_prefix?: Types.Maybe<Types.Scalars['String']>
}>

export type EditServiceGithubSettingsMutation = { __typename?: 'Mutation' } & {
	editServiceGithubSettings?: Types.Maybe<
		{ __typename?: 'Service' } & Pick<
			Types.Service,
			| 'id'
			| 'projectID'
			| 'name'
			| 'status'
			| 'githubRepoPath'
			| 'buildPrefix'
			| 'githubPrefix'
			| 'errorDetails'
		>
	>
}

export type CreateErrorTagMutationVariables = Types.Exact<{
	title: Types.Scalars['String']
	description: Types.Scalars['String']
}>

export type CreateErrorTagMutation = { __typename?: 'Mutation' } & {
	createErrorTag: { __typename?: 'ErrorTag' } & Pick<
		Types.ErrorTag,
		'id' | 'created_at' | 'title' | 'description'
	>
}

export type UpdateErrorTagsMutationVariables = Types.Exact<{
	[key: string]: never
}>

export type UpdateErrorTagsMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'updateErrorTags'
>

export type UpsertSlackChannelMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
}>

export type UpsertSlackChannelMutation = { __typename?: 'Mutation' } & {
	upsertSlackChannel: { __typename?: 'SanitizedSlackChannel' } & Pick<
		Types.SanitizedSlackChannel,
		'webhook_channel' | 'webhook_channel_id'
	>
}

export type UpsertDiscordChannelMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
}>

export type UpsertDiscordChannelMutation = { __typename?: 'Mutation' } & {
	upsertDiscordChannel: { __typename?: 'DiscordChannel' } & Pick<
		Types.DiscordChannel,
		'id' | 'name'
	>
}

export type TestErrorEnhancementMutationVariables = Types.Exact<{
	error_object_id: Types.Scalars['ID']
	github_repo_path: Types.Scalars['String']
	github_prefix?: Types.Maybe<Types.Scalars['String']>
	build_prefix?: Types.Maybe<Types.Scalars['String']>
	save_error?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type TestErrorEnhancementMutation = { __typename?: 'Mutation' } & {
	testErrorEnhancement?: Types.Maybe<
		{ __typename?: 'ErrorObject' } & Pick<
			Types.ErrorObject,
			'id' | 'type' | 'serviceName' | 'serviceVersion' | 'stack_trace'
		> & {
				structured_stack_trace: Array<
					Types.Maybe<
						{ __typename?: 'ErrorTrace' } & Pick<
							Types.ErrorTrace,
							| 'columnNumber'
							| 'enhancementSource'
							| 'enhancementVersion'
							| 'error'
							| 'externalLink'
							| 'fileName'
							| 'functionName'
							| 'lineContent'
							| 'lineNumber'
							| 'linesAfter'
							| 'linesBefore'
						>
					>
				>
			}
	>
}

export type DeleteSavedSegmentMutationVariables = Types.Exact<{
	segment_id: Types.Scalars['ID']
}>

export type DeleteSavedSegmentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteSavedSegment'
>

export type EditSavedSegmentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	id: Types.Scalars['ID']
	query: Types.Scalars['String']
	name: Types.Scalars['String']
	entity_type: Types.SavedSegmentEntityType
}>

export type EditSavedSegmentMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'editSavedSegment'
>

export type CreateSavedSegmentMutationVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
	query: Types.Scalars['String']
	entity_type: Types.SavedSegmentEntityType
}>

export type CreateSavedSegmentMutation = { __typename?: 'Mutation' } & {
	createSavedSegment?: Types.Maybe<
		{ __typename?: 'SavedSegment' } & Pick<
			Types.SavedSegment,
			'name' | 'id'
		>
	>
}

export type UpsertVisualizationMutationVariables = Types.Exact<{
	visualization: Types.VisualizationInput
}>

export type UpsertVisualizationMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'upsertVisualization'
>

export type DeleteVisualizationMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type DeleteVisualizationMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteVisualization'
>

export type UpsertGraphMutationVariables = Types.Exact<{
	graph: Types.GraphInput
}>

export type UpsertGraphMutation = { __typename?: 'Mutation' } & {
	upsertGraph: { __typename?: 'Graph' } & Pick<
		Types.Graph,
		| 'id'
		| 'type'
		| 'title'
		| 'productType'
		| 'query'
		| 'metric'
		| 'functionType'
		| 'groupByKey'
		| 'bucketByKey'
		| 'bucketCount'
		| 'limit'
		| 'limitFunctionType'
		| 'limitMetric'
		| 'display'
		| 'nullHandling'
	>
}

export type DeleteGraphMutationVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type DeleteGraphMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'deleteGraph'
>

export type CreateCloudflareProxyMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	proxy_subdomain: Types.Scalars['String']
}>

export type CreateCloudflareProxyMutation = { __typename?: 'Mutation' } & Pick<
	Types.Mutation,
	'createCloudflareProxy'
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
	| 'default'
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
		MicrosoftTeamsChannelsToNotify: Array<
			{
				__typename?: 'MicrosoftTeamsChannel'
			} & MicrosoftTeamsChannelFragmentFragment
		>
		WebhookDestinations: Array<
			{ __typename?: 'WebhookDestination' } & Pick<
				Types.WebhookDestination,
				'url' | 'authorization'
			>
		>
		TrackProperties: Array<
			Types.Maybe<
				{ __typename?: 'TrackProperty' } & Pick<
					Types.TrackProperty,
					'id' | 'name' | 'value'
				>
			>
		>
		UserProperties: Array<
			Types.Maybe<
				{ __typename?: 'UserProperty' } & Pick<
					Types.UserProperty,
					'id' | 'name' | 'value'
				>
			>
		>
	}

export type DiscordChannelFragmentFragment = {
	__typename?: 'DiscordChannel'
} & Pick<Types.DiscordChannel, 'name' | 'id'>

export type MicrosoftTeamsChannelFragmentFragment = {
	__typename?: 'MicrosoftTeamsChannel'
} & Pick<Types.MicrosoftTeamsChannel, 'name' | 'id'>

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
			| 'ip'
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
			| 'privacy_setting'
			| 'enable_recording_network_contents'
			| 'field_group'
			| 'object_storage_enabled'
			| 'payload_size'
			| 'processed'
			| 'excluded'
			| 'excluded_reason'
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
			| 'web_socket_events_url'
			| 'timeline_indicators_url'
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
			'workspaceId' | 'role' | 'projectIds'
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
			'workspaceId' | 'role' | 'projectIds'
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
			'id' | 'name' | 'allowed_auto_join_email_origins'
		>
	>
	workspace_invite_links: { __typename?: 'WorkspaceInviteLink' } & Pick<
		Types.WorkspaceInviteLink,
		'id' | 'invitee_email' | 'invitee_role' | 'expiration_date' | 'secret'
	>
}

export type GetSessionInsightQueryVariables = Types.Exact<{
	secure_id: Types.Scalars['String']
}>

export type GetSessionInsightQuery = { __typename?: 'Query' } & {
	session_insight?: Types.Maybe<
		{ __typename?: 'SessionInsight' } & Pick<
			Types.SessionInsight,
			'id' | 'insight'
		>
	>
}

export type GetSessionExportsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetSessionExportsQuery = { __typename?: 'Query' } & {
	session_exports: Array<
		{ __typename?: 'SessionExportWithSession' } & Pick<
			Types.SessionExportWithSession,
			| 'created_at'
			| 'type'
			| 'url'
			| 'error'
			| 'secure_id'
			| 'identifier'
			| 'active_length'
		>
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

export type GetErrorIssuesQueryVariables = Types.Exact<{
	error_group_secure_id: Types.Scalars['String']
}>

export type GetErrorIssuesQuery = { __typename?: 'Query' } & {
	error_issue: Array<
		Types.Maybe<
			{ __typename?: 'ExternalAttachment' } & Pick<
				Types.ExternalAttachment,
				'id' | 'integration_type' | 'external_id' | 'title'
			>
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

export type SendAdminWorkspaceInviteMutationVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	email: Types.Scalars['String']
	role: Types.Scalars['String']
	projectIds: Array<Types.Scalars['ID']> | Types.Scalars['ID']
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

export type GetWebSocketEventsQueryVariables = Types.Exact<{
	session_secure_id: Types.Scalars['String']
}>

export type GetWebSocketEventsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'websocket_events'
>

export type GetSessionsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	count: Types.Scalars['Int']
	params: Types.QueryInput
	sort_desc: Types.Scalars['Boolean']
	sort_field?: Types.Maybe<Types.Scalars['String']>
	page?: Types.Maybe<Types.Scalars['Int']>
}>

export type GetSessionsQuery = { __typename?: 'Query' } & {
	sessions: { __typename?: 'SessionResults' } & Pick<
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
					| 'ip'
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
					| 'is_public'
					| 'excluded'
					| 'email'
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
	params: Types.QueryInput
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

export type GetSessionUsersReportsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
}>

export type GetSessionUsersReportsQuery = { __typename?: 'Query' } & {
	session_users_report: Array<
		{ __typename?: 'SessionsReportRow' } & Pick<
			Types.SessionsReportRow,
			| 'key'
			| 'num_sessions'
			| 'num_days_visited'
			| 'num_months_visited'
			| 'avg_active_length_mins'
			| 'max_active_length_mins'
			| 'total_active_length_mins'
			| 'avg_length_mins'
			| 'max_length_mins'
			| 'total_length_mins'
			| 'location'
		>
	>
}

export type GetErrorGroupsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	count: Types.Scalars['Int']
	params: Types.QueryInput
	page?: Types.Maybe<Types.Scalars['Int']>
}>

export type GetErrorGroupsQuery = { __typename?: 'Query' } & {
	error_groups: { __typename?: 'ErrorResults' } & Pick<
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
					| 'first_occurrence'
					| 'last_occurrence'
					| 'snoozed_until'
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
						error_tag?: Types.Maybe<
							{ __typename?: 'ErrorTag' } & Pick<
								Types.ErrorTag,
								'id' | 'created_at' | 'title' | 'description'
							>
						>
					}
			>
		}
}

export type GetErrorsHistogramQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
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
		Array<Types.Maybe<{ __typename?: 'Project' } & ProjectFragment>>
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
			| 'plan_tier'
			| 'unlimited_members'
			| 'clearbit_enabled'
		> & {
				projects: Array<
					Types.Maybe<{ __typename?: 'Project' } & ProjectFragment>
				>
			}
	>
}

export type GetWorkspaceForInviteLinkQueryVariables = Types.Exact<{
	secret: Types.Scalars['String']
}>

export type GetWorkspaceForInviteLinkQuery = { __typename?: 'Query' } & {
	workspace_for_invite_link: { __typename?: 'WorkspaceForInviteLink' } & Pick<
		Types.WorkspaceForInviteLink,
		| 'expiration_date'
		| 'existing_account'
		| 'invitee_email'
		| 'secret'
		| 'workspace_id'
		| 'workspace_name'
		| 'project_id'
	>
}

export type GetWorkspacesQueryVariables = Types.Exact<{ [key: string]: never }>

export type GetWorkspacesQuery = { __typename?: 'Query' } & {
	workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					| 'id'
					| 'name'
					| 'retention_period'
					| 'errors_retention_period'
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
								{ __typename?: 'Project' } & ProjectFragment
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
		Array<Types.Maybe<{ __typename?: 'Project' } & ProjectFragment>>
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
		{ __typename?: 'Project' } & {
			workspace?: Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					| 'id'
					| 'name'
					| 'retention_period'
					| 'errors_retention_period'
				> & {
						projects: Array<
							Types.Maybe<
								{ __typename?: 'Project' } & ProjectFragment
							>
						>
					}
			>
		} & ProjectFragment
	>
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			| 'id'
			| 'name'
			| 'cloudflare_proxy'
			| 'retention_period'
			| 'errors_retention_period'
		> & {
				projects: Array<
					Types.Maybe<{ __typename?: 'Project' } & ProjectFragment>
				>
			}
	>
}

export type GetDropdownOptionsQueryVariables = Types.Exact<{
	[key: string]: never
}>

export type GetDropdownOptionsQuery = { __typename?: 'Query' } & {
	projects?: Types.Maybe<
		Array<Types.Maybe<{ __typename?: 'Project' } & ProjectFragment>>
	>
	workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					| 'id'
					| 'name'
					| 'cloudflare_proxy'
					| 'retention_period'
					| 'errors_retention_period'
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
	joinable_workspaces?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					'id' | 'name'
				> & {
						projects: Array<
							Types.Maybe<
								{ __typename?: 'Project' } & ProjectFragment
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
			'workspaceId' | 'role' | 'projectIds'
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
			'workspaceId' | 'role' | 'projectIds'
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
		{ __typename?: 'Project' } & {
			workspace?: Types.Maybe<
				{ __typename?: 'Workspace' } & Pick<
					Types.Workspace,
					| 'id'
					| 'slack_webhook_channel'
					| 'retention_period'
					| 'errors_retention_period'
				>
			>
		} & ProjectFragment
	>
}

export type GetBillingDetailsForProjectQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetBillingDetailsForProjectQuery = { __typename?: 'Query' } & {
	billingDetailsForProject?: Types.Maybe<
		{ __typename?: 'BillingDetails' } & Pick<
			Types.BillingDetails,
			| 'meter'
			| 'membersMeter'
			| 'errorsMeter'
			| 'logsMeter'
			| 'tracesMeter'
			| 'sessionsBillingLimit'
			| 'errorsBillingLimit'
			| 'logsBillingLimit'
			| 'tracesBillingLimit'
		> & {
				plan: { __typename?: 'Plan' } & Pick<
					Types.Plan,
					| 'type'
					| 'interval'
					| 'membersLimit'
					| 'sessionsLimit'
					| 'errorsLimit'
					| 'logsLimit'
					| 'tracesLimit'
					| 'sessionsRate'
					| 'errorsRate'
					| 'logsRate'
					| 'tracesRate'
				> & {
						aws_mp_subscription?: Types.Maybe<
							{
								__typename?: 'AWSMarketplaceSubscription'
							} & Pick<
								Types.AwsMarketplaceSubscription,
								| 'customer_identifier'
								| 'customer_aws_account_id'
								| 'product_code'
							>
						>
					}
			}
	>
	project?: Types.Maybe<
		{ __typename?: 'Project' } & {
			workspace?: Types.Maybe<
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
	>
}

export type GetWorkspaceUsageHistoryQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	product_type: Types.ProductType
	date_range?: Types.Maybe<Types.DateRangeRequiredInput>
}>

export type GetWorkspaceUsageHistoryQuery = { __typename?: 'Query' } & {
	usageHistory: { __typename?: 'UsageHistory' } & {
		usage: { __typename?: 'MetricsBuckets' } & Pick<
			Types.MetricsBuckets,
			'bucket_count' | 'sample_factor'
		> & {
				buckets: Array<
					{ __typename?: 'MetricBucket' } & Pick<
						Types.MetricBucket,
						| 'bucket_id'
						| 'bucket_min'
						| 'bucket_max'
						| 'column'
						| 'group'
						| 'metric_type'
						| 'metric_value'
					>
				>
			}
	}
}

export type GetBillingDetailsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetBillingDetailsQuery = { __typename?: 'Query' } & {
	billingDetails: { __typename?: 'BillingDetails' } & Pick<
		Types.BillingDetails,
		| 'meter'
		| 'membersMeter'
		| 'errorsMeter'
		| 'logsMeter'
		| 'tracesMeter'
		| 'sessionsBillingLimit'
		| 'errorsBillingLimit'
		| 'logsBillingLimit'
		| 'tracesBillingLimit'
		| 'sessionsDailyAverage'
		| 'errorsDailyAverage'
		| 'logsDailyAverage'
		| 'tracesDailyAverage'
	> & {
			plan: { __typename?: 'Plan' } & Pick<
				Types.Plan,
				| 'type'
				| 'interval'
				| 'membersLimit'
				| 'sessionsLimit'
				| 'errorsLimit'
				| 'logsLimit'
				| 'tracesLimit'
				| 'sessionsRate'
				| 'errorsRate'
				| 'logsRate'
				| 'tracesRate'
				| 'enableBillingLimits'
			> & {
					aws_mp_subscription?: Types.Maybe<
						{ __typename?: 'AWSMarketplaceSubscription' } & Pick<
							Types.AwsMarketplaceSubscription,
							| 'customer_identifier'
							| 'customer_aws_account_id'
							| 'product_code'
						>
					>
				}
		}
	subscription_details: { __typename?: 'SubscriptionDetails' } & Pick<
		Types.SubscriptionDetails,
		'baseAmount' | 'billingIssue' | 'billingIngestBlocked'
	> & {
			discount?: Types.Maybe<
				{ __typename?: 'SubscriptionDiscount' } & Pick<
					Types.SubscriptionDiscount,
					'name' | 'amount' | 'percent' | 'until'
				>
			>
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
	workspace?: Types.Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Types.Workspace,
			| 'id'
			| 'trial_end_date'
			| 'billing_period_end'
			| 'next_invoice_date'
			| 'allow_meter_overage'
			| 'eligible_for_trial_extension'
			| 'retention_period'
			| 'errors_retention_period'
			| 'sessions_max_cents'
			| 'errors_max_cents'
			| 'logs_max_cents'
			| 'traces_max_cents'
		>
	>
}

export type GetSubscriptionDetailsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetSubscriptionDetailsQuery = { __typename?: 'Query' } & {
	subscription_details: { __typename?: 'SubscriptionDetails' } & Pick<
		Types.SubscriptionDetails,
		'baseAmount' | 'billingIssue' | 'billingIngestBlocked'
	> & {
			discount?: Types.Maybe<
				{ __typename?: 'SubscriptionDiscount' } & Pick<
					Types.SubscriptionDiscount,
					'name' | 'amount' | 'percent' | 'until'
				>
			>
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
	use_clickhouse?: Types.Maybe<Types.Scalars['Boolean']>
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
			| 'snoozed_until'
			| 'mapped_stack_trace'
			| 'stack_trace'
			| 'error_frequency'
			| 'is_public'
			| 'last_occurrence'
			| 'first_occurrence'
			| 'serviceName'
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
				error_tag?: Types.Maybe<
					{ __typename?: 'ErrorTag' } & Pick<
						Types.ErrorTag,
						'id' | 'created_at' | 'title' | 'description'
					>
				>
			}
	>
}

export type GetErrorObjectForLogQueryVariables = Types.Exact<{
	log_cursor: Types.Scalars['String']
}>

export type GetErrorObjectForLogQuery = { __typename?: 'Query' } & {
	error_object_for_log?: Types.Maybe<
		{ __typename?: 'ErrorObject' } & Pick<
			Types.ErrorObject,
			'id' | 'error_group_secure_id' | 'project_id'
		>
	>
}

export type ErrorObjectFragment = { __typename?: 'ErrorObject' } & Pick<
	Types.ErrorObject,
	| 'id'
	| 'created_at'
	| 'project_id'
	| 'session_id'
	| 'trace_id'
	| 'span_id'
	| 'log_cursor'
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
	| 'serviceVersion'
	| 'serviceName'
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
				| 'processed'
				| 'excluded'
				| 'excluded_reason'
			> & {
					session_feedback?: Types.Maybe<
						Array<
							{ __typename?: 'SessionComment' } & Pick<
								Types.SessionComment,
								| 'id'
								| 'timestamp'
								| 'created_at'
								| 'updated_at'
								| 'project_id'
								| 'text'
							>
						>
					>
				}
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
					| 'enhancementSource'
					| 'enhancementVersion'
					| 'externalLink'
				> & {
						sourceMappingErrorMetadata?: Types.Maybe<
							{ __typename?: 'SourceMappingError' } & Pick<
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

export type ProjectFragment = { __typename?: 'Project' } & Pick<
	Types.Project,
	| 'id'
	| 'name'
	| 'verbose_id'
	| 'billing_email'
	| 'secret'
	| 'workspace_id'
	| 'error_filters'
	| 'excluded_users'
	| 'error_json_paths'
	| 'filter_chrome_extension'
	| 'rage_click_window_seconds'
	| 'rage_click_radius_pixels'
	| 'rage_click_count'
> & {
		workspace?: Types.Maybe<
			{ __typename?: 'Workspace' } & Pick<Types.Workspace, 'id'>
		>
	}

export type GetErrorObjectQueryVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type GetErrorObjectQuery = { __typename?: 'Query' } & {
	error_object?: Types.Maybe<
		{ __typename?: 'ErrorObject' } & ErrorObjectFragment
	>
}

export type GetErrorInstanceQueryVariables = Types.Exact<{
	error_group_secure_id: Types.Scalars['String']
	error_object_id?: Types.Maybe<Types.Scalars['ID']>
	params?: Types.Maybe<Types.QueryInput>
}>

export type GetErrorInstanceQuery = { __typename?: 'Query' } & {
	error_instance?: Types.Maybe<
		{ __typename?: 'ErrorInstance' } & Pick<
			Types.ErrorInstance,
			'next_id' | 'previous_id'
		> & {
				error_object: {
					__typename?: 'ErrorObject'
				} & ErrorObjectFragment
			}
	>
}

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

export type GetSavedSegmentsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	entity_type: Types.SavedSegmentEntityType
}>

export type GetSavedSegmentsQuery = { __typename?: 'Query' } & {
	saved_segments?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'SavedSegment' } & Pick<
					Types.SavedSegment,
					'id' | 'name'
				> & {
						params: { __typename?: 'SearchParams' } & Pick<
							Types.SearchParams,
							'query'
						>
					}
			>
		>
	>
}

export type GetClientIntegrationQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetClientIntegrationQuery = { __typename?: 'Query' } & {
	clientIntegration: { __typename?: 'IntegrationStatus' } & Pick<
		Types.IntegrationStatus,
		'integrated' | 'resourceType' | 'createdAt'
	>
}

export type GetServerIntegrationQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetServerIntegrationQuery = { __typename?: 'Query' } & {
	serverIntegration: { __typename?: 'IntegrationStatus' } & Pick<
		Types.IntegrationStatus,
		'integrated' | 'resourceType' | 'createdAt'
	>
}

export type GetLogsIntegrationQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetLogsIntegrationQuery = { __typename?: 'Query' } & {
	logsIntegration: { __typename?: 'IntegrationStatus' } & Pick<
		Types.IntegrationStatus,
		'integrated' | 'resourceType' | 'createdAt'
	>
}

export type GetTracesIntegrationQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetTracesIntegrationQuery = { __typename?: 'Query' } & {
	tracesIntegration: { __typename?: 'IntegrationStatus' } & Pick<
		Types.IntegrationStatus,
		'integrated' | 'resourceType' | 'createdAt'
	>
}

export type GetKeyPerformanceIndicatorsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookback_days: Types.Scalars['Float']
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
	lookback_days: Types.Scalars['Float']
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
	lookback_days: Types.Scalars['Float']
}>

export type GetNewUsersCountQuery = { __typename?: 'Query' } & {
	newUsersCount?: Types.Maybe<
		{ __typename?: 'NewUsersCount' } & Pick<Types.NewUsersCount, 'count'>
	>
}

export type GetAverageSessionLengthQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	lookback_days: Types.Scalars['Float']
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
	lookback_days: Types.Scalars['Float']
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
	lookback_days: Types.Scalars['Float']
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

export type GetMicrosoftTeamsChannelSuggestionQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetMicrosoftTeamsChannelSuggestionQuery = {
	__typename?: 'Query'
} & {
	microsoft_teams_channel_suggestions: Array<
		{
			__typename?: 'MicrosoftTeamsChannel'
		} & MicrosoftTeamsChannelFragmentFragment
	>
}

export type GetWorkspaceIsIntegratedWithSlackQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithSlackQuery = {
	__typename?: 'Query'
} & { is_integrated_with_slack: Types.Query['is_integrated_with'] }

export type GetWorkspaceIsIntegratedWithMicrosoftTeamsQueryVariables =
	Types.Exact<{
		project_id: Types.Scalars['ID']
	}>

export type GetWorkspaceIsIntegratedWithMicrosoftTeamsQuery = {
	__typename?: 'Query'
} & { is_integrated_with_microsoft_teams: Types.Query['is_integrated_with'] }

export type GetWorkspaceIsIntegratedWithHerokuQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithHerokuQuery = {
	__typename?: 'Query'
} & { is_integrated_with_heroku: Types.Query['is_integrated_with'] }

export type GetWorkspaceIsIntegratedWithCloudflareQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetWorkspaceIsIntegratedWithCloudflareQuery = {
	__typename?: 'Query'
} & {
	is_integrated_with_cloudflare: Types.Query['is_workspace_integrated_with']
}

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

export type GetJiraIntegrationSettingsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetJiraIntegrationSettingsQuery = { __typename?: 'Query' } & {
	is_integrated: Types.Query['is_workspace_integrated_with']
} & {
	jira_projects?: Types.Maybe<
		Array<
			{ __typename?: 'JiraProject' } & Pick<
				Types.JiraProject,
				'id' | 'name' | 'key'
			> & {
					issueTypes?: Types.Maybe<
						Array<
							Types.Maybe<
								{ __typename?: 'JiraIssueType' } & Pick<
									Types.JiraIssueType,
									'id' | 'name' | 'description'
								>
							>
						>
					>
				}
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

export type GetGitHubIntegrationSettingsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetGitHubIntegrationSettingsQuery = { __typename?: 'Query' } & {
	is_integrated: Types.Query['is_workspace_integrated_with']
} & {
	github_repos?: Types.Maybe<
		Array<
			{ __typename?: 'GitHubRepo' } & Pick<
				Types.GitHubRepo,
				'repo_id' | 'name' | 'key'
			>
		>
	>
}

export type GetGitlabIntegrationSettingsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetGitlabIntegrationSettingsQuery = { __typename?: 'Query' } & {
	is_integrated: Types.Query['is_workspace_integrated_with']
} & {
	gitlab_projects?: Types.Maybe<
		Array<
			{ __typename?: 'GitlabProject' } & Pick<
				Types.GitlabProject,
				'name' | 'id' | 'nameWithNameSpace'
			>
		>
	>
}

export type GetGitHubIssueLabelsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
	repository: Types.Scalars['String']
}>

export type GetGitHubIssueLabelsQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'github_issue_labels'
>

export type GetProjectIntegratedWithQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	integration_type: Types.IntegrationType
}>

export type GetProjectIntegratedWithQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'is_project_integrated_with'
>

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

export type GetHeightListsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetHeightListsQuery = { __typename?: 'Query' } & {
	height_lists: Array<
		{ __typename?: 'HeightList' } & Pick<Types.HeightList, 'id' | 'name'>
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

export type GetLogAlertQueryVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type GetLogAlertQuery = { __typename?: 'Query' } & {
	log_alert: { __typename?: 'LogAlert' } & Pick<
		Types.LogAlert,
		| 'CountThreshold'
		| 'DailyFrequency'
		| 'disabled'
		| 'EmailsToNotify'
		| 'id'
		| 'LastAdminToEditID'
		| 'Name'
		| 'updated_at'
		| 'BelowThreshold'
		| 'ThresholdWindow'
		| 'Type'
		| 'query'
	> & {
			ChannelsToNotify: Array<
				{ __typename?: 'SanitizedSlackChannel' } & Pick<
					Types.SanitizedSlackChannel,
					'webhook_channel' | 'webhook_channel_id'
				>
			>
			DiscordChannelsToNotify: Array<
				{
					__typename?: 'DiscordChannel'
				} & DiscordChannelFragmentFragment
			>
			MicrosoftTeamsChannelsToNotify: Array<
				{
					__typename?: 'MicrosoftTeamsChannel'
				} & MicrosoftTeamsChannelFragmentFragment
			>
			WebhookDestinations: Array<
				{ __typename?: 'WebhookDestination' } & Pick<
					Types.WebhookDestination,
					'url' | 'authorization'
				>
			>
		}
}

export type GetLogAlertsPagePayloadQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetLogAlertsPagePayloadQuery = { __typename?: 'Query' } & {
	is_integrated_with_slack: Types.Query['is_integrated_with']
	is_integrated_with_discord: Types.Query['is_integrated_with']
	is_integrated_with_microsoft_teams: Types.Query['is_integrated_with']
} & {
	slack_channel_suggestion: Array<
		{ __typename?: 'SanitizedSlackChannel' } & Pick<
			Types.SanitizedSlackChannel,
			'webhook_channel' | 'webhook_channel_id'
		>
	>
	microsoft_teams_channel_suggestions: Array<
		{
			__typename?: 'MicrosoftTeamsChannel'
		} & MicrosoftTeamsChannelFragmentFragment
	>
	discord_channel_suggestions: Array<
		{ __typename?: 'DiscordChannel' } & DiscordChannelFragmentFragment
	>
	admins: Array<
		{ __typename?: 'WorkspaceAdminRole' } & Pick<
			Types.WorkspaceAdminRole,
			'workspaceId'
		> & {
				admin: { __typename?: 'Admin' } & Pick<
					Types.Admin,
					'id' | 'name' | 'email' | 'photo_url'
				>
			}
	>
}

export type GetAlertsPagePayloadQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
}>

export type GetAlertsPagePayloadQuery = { __typename?: 'Query' } & {
	is_integrated_with_slack: Types.Query['is_integrated_with']
	is_integrated_with_discord: Types.Query['is_integrated_with']
	is_integrated_with_microsoft_teams: Types.Query['is_integrated_with']
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
	microsoft_teams_channel_suggestions: Array<
		{
			__typename?: 'MicrosoftTeamsChannel'
		} & MicrosoftTeamsChannelFragmentFragment
	>
	admins: Array<
		{ __typename?: 'WorkspaceAdminRole' } & Pick<
			Types.WorkspaceAdminRole,
			'workspaceId'
		> & {
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
				| 'default'
				| 'Query'
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
					MicrosoftTeamsChannelsToNotify: Array<
						{
							__typename?: 'MicrosoftTeamsChannel'
						} & MicrosoftTeamsChannelFragmentFragment
					>
					WebhookDestinations: Array<
						{ __typename?: 'WebhookDestination' } & Pick<
							Types.WebhookDestination,
							'url' | 'authorization'
						>
					>
				}
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
					webhook_destinations: Array<
						{ __typename?: 'WebhookDestination' } & Pick<
							Types.WebhookDestination,
							'url' | 'authorization'
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
	log_alerts: Array<
		Types.Maybe<
			{ __typename?: 'LogAlert' } & Pick<
				Types.LogAlert,
				| 'CountThreshold'
				| 'DailyFrequency'
				| 'disabled'
				| 'default'
				| 'EmailsToNotify'
				| 'id'
				| 'LastAdminToEditID'
				| 'Name'
				| 'updated_at'
				| 'ThresholdWindow'
				| 'Type'
				| 'query'
			> & {
					ChannelsToNotify: Array<
						{ __typename?: 'SanitizedSlackChannel' } & Pick<
							Types.SanitizedSlackChannel,
							'webhook_channel' | 'webhook_channel_id'
						>
					>
					DiscordChannelsToNotify: Array<
						{
							__typename?: 'DiscordChannel'
						} & DiscordChannelFragmentFragment
					>
					MicrosoftTeamsChannelsToNotify: Array<
						{
							__typename?: 'MicrosoftTeamsChannel'
						} & MicrosoftTeamsChannelFragmentFragment
					>
				}
		>
	>
	alerts: Array<
		Types.Maybe<
			{ __typename?: 'Alert' } & Pick<
				Types.Alert,
				'id' | 'updated_at' | 'name' | 'product_type' | 'disabled'
			> & {
					destinations: Array<
						Types.Maybe<
							{ __typename?: 'AlertDestination' } & Pick<
								Types.AlertDestination,
								| 'id'
								| 'destination_type'
								| 'type_id'
								| 'type_name'
							>
						>
					>
				}
		>
	>
}

export type GetAlertQueryVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type GetAlertQuery = { __typename?: 'Query' } & {
	alert: { __typename?: 'Alert' } & Pick<
		Types.Alert,
		| 'id'
		| 'updated_at'
		| 'name'
		| 'product_type'
		| 'function_type'
		| 'function_column'
		| 'query'
		| 'group_by_key'
		| 'disabled'
		| 'last_admin_to_edit_id'
		| 'below_threshold'
		| 'threshold_value'
		| 'threshold_window'
		| 'threshold_cooldown'
	> & {
			destinations: Array<
				Types.Maybe<
					{ __typename?: 'AlertDestination' } & Pick<
						Types.AlertDestination,
						'id' | 'destination_type' | 'type_id' | 'type_name'
					>
				>
			>
		}
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

export type GetMetricTagsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	metric_name: Types.Scalars['String']
	query?: Types.Maybe<Types.Scalars['String']>
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

export type SearchIssuesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query: Types.Scalars['String']
	integration_type: Types.IntegrationType
}>

export type SearchIssuesQuery = { __typename?: 'Query' } & {
	search_issues: Array<
		{ __typename?: 'IssuesSearchResult' } & Pick<
			Types.IssuesSearchResult,
			'id' | 'title' | 'issue_url'
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
	use_clickhouse?: Types.Maybe<Types.Scalars['Boolean']>
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

export type GetErrorGroupTagsQueryVariables = Types.Exact<{
	error_group_secure_id: Types.Scalars['String']
	use_clickhouse?: Types.Maybe<Types.Scalars['Boolean']>
}>

export type GetErrorGroupTagsQuery = { __typename?: 'Query' } & {
	errorGroupTags: Array<
		{ __typename?: 'ErrorGroupTagAggregation' } & Pick<
			Types.ErrorGroupTagAggregation,
			'key'
		> & {
				buckets: Array<
					{ __typename?: 'ErrorGroupTagAggregationBucket' } & Pick<
						Types.ErrorGroupTagAggregationBucket,
						'key' | 'doc_count' | 'percent'
					>
				>
			}
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

export type GetLogsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
	after?: Types.Maybe<Types.Scalars['String']>
	before?: Types.Maybe<Types.Scalars['String']>
	at?: Types.Maybe<Types.Scalars['String']>
	direction: Types.SortDirection
}>

export type GetLogsQuery = { __typename?: 'Query' } & {
	logs: { __typename?: 'LogConnection' } & {
		edges: Array<
			{ __typename?: 'LogEdge' } & Pick<Types.LogEdge, 'cursor'> & {
					node: { __typename?: 'Log' } & Pick<
						Types.Log,
						| 'timestamp'
						| 'level'
						| 'message'
						| 'logAttributes'
						| 'traceID'
						| 'spanID'
						| 'secureSessionID'
						| 'source'
						| 'serviceName'
						| 'serviceVersion'
						| 'environment'
						| 'projectID'
					>
				}
		>
		pageInfo: { __typename?: 'PageInfo' } & Pick<
			Types.PageInfo,
			'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
		>
	}
}

export type GetSessionLogsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
}>

export type GetSessionLogsQuery = { __typename?: 'Query' } & {
	sessionLogs: Array<
		{ __typename?: 'LogEdge' } & Pick<Types.LogEdge, 'cursor'> & {
				node: { __typename?: 'Log' } & Pick<
					Types.Log,
					'timestamp' | 'level' | 'message'
				>
			}
	>
}

export type GetLogsTotalCountQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
}>

export type GetLogsTotalCountQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'logs_total_count'
>

export type GetLogsHistogramQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
}>

export type GetLogsHistogramQuery = { __typename?: 'Query' } & {
	logs_histogram: { __typename?: 'LogsHistogram' } & Pick<
		Types.LogsHistogram,
		'totalCount' | 'objectCount' | 'sampleFactor'
	> & {
			buckets: Array<
				{ __typename?: 'LogsHistogramBucket' } & Pick<
					Types.LogsHistogramBucket,
					'bucketId'
				> & {
						counts: Array<
							{ __typename?: 'LogsHistogramBucketCount' } & Pick<
								Types.LogsHistogramBucketCount,
								'count' | 'level'
							>
						>
					}
			>
		}
}

export type GetLogsRelatedResourcesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	log_cursors: Array<Types.Scalars['String']> | Types.Scalars['String']
	trace_ids: Array<Types.Scalars['String']> | Types.Scalars['String']
	date_range: Types.DateRangeRequiredInput
}>

export type GetLogsRelatedResourcesQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'existing_logs_traces'
> & {
		logs_error_objects: Array<
			{ __typename?: 'ErrorObject' } & Pick<
				Types.ErrorObject,
				'log_cursor' | 'error_group_secure_id' | 'id'
			>
		>
	}

export type GetProjectSettingsQueryVariables = Types.Exact<{
	projectId: Types.Scalars['ID']
}>

export type GetProjectSettingsQuery = { __typename?: 'Query' } & {
	projectSettings?: Types.Maybe<
		{ __typename?: 'AllProjectSettings' } & Pick<
			Types.AllProjectSettings,
			| 'id'
			| 'name'
			| 'verbose_id'
			| 'billing_email'
			| 'excluded_users'
			| 'error_filters'
			| 'error_json_paths'
			| 'filter_chrome_extension'
			| 'rage_click_window_seconds'
			| 'rage_click_radius_pixels'
			| 'rage_click_count'
			| 'filterSessionsWithoutError'
			| 'autoResolveStaleErrorsDayInterval'
		> & {
				sampling: { __typename?: 'Sampling' } & Pick<
					Types.Sampling,
					| 'session_sampling_rate'
					| 'error_sampling_rate'
					| 'log_sampling_rate'
					| 'trace_sampling_rate'
					| 'session_exclusion_query'
					| 'error_exclusion_query'
					| 'log_exclusion_query'
					| 'trace_exclusion_query'
					| 'session_minute_rate_limit'
					| 'error_minute_rate_limit'
					| 'log_minute_rate_limit'
					| 'trace_minute_rate_limit'
				>
			}
	>
}

export type GetWorkspacePendingInvitesQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetWorkspacePendingInvitesQuery = { __typename?: 'Query' } & {
	workspacePendingInvites: Array<
		Types.Maybe<
			{ __typename?: 'WorkspaceInviteLink' } & Pick<
				Types.WorkspaceInviteLink,
				'id' | 'invitee_email' | 'invitee_role' | 'created_at'
			>
		>
	>
}

export type GetErrorResolutionSuggestionQueryVariables = Types.Exact<{
	error_object_id: Types.Scalars['ID']
}>

export type GetErrorResolutionSuggestionQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'error_resolution_suggestion'
>

export type GetWorkspaceSettingsQueryVariables = Types.Exact<{
	workspace_id: Types.Scalars['ID']
}>

export type GetWorkspaceSettingsQuery = { __typename?: 'Query' } & {
	workspaceSettings?: Types.Maybe<
		{ __typename?: 'AllWorkspaceSettings' } & Pick<
			Types.AllWorkspaceSettings,
			| 'workspace_id'
			| 'ai_application'
			| 'ai_query_builder'
			| 'ai_insights'
			| 'enable_billing_limits'
			| 'enable_business_dashboards'
			| 'enable_business_projects'
			| 'enable_business_retention'
			| 'enable_business_seats'
			| 'enable_data_deletion'
			| 'enable_grafana_dashboard'
			| 'enable_ingest_filtering'
			| 'enable_ingest_sampling'
			| 'enable_network_traces'
			| 'enable_project_level_access'
			| 'enable_session_export'
			| 'enable_unlisted_sharing'
		>
	>
}

export type GetSystemConfigurationQueryVariables = Types.Exact<{
	[key: string]: never
}>

export type GetSystemConfigurationQuery = { __typename?: 'Query' } & {
	system_configuration: { __typename?: 'SystemConfiguration' } & Pick<
		Types.SystemConfiguration,
		'maintenance_start' | 'maintenance_end'
	>
}

export type GetErrorGroupInstancesQueryVariables = Types.Exact<{
	errorGroupSecureID: Types.Scalars['String']
	count: Types.Scalars['Int']
	params: Types.QueryInput
	page?: Types.Maybe<Types.Scalars['Int']>
}>

export type GetErrorGroupInstancesQuery = { __typename?: 'Query' } & {
	error_objects: { __typename?: 'ErrorObjectResults' } & Pick<
		Types.ErrorObjectResults,
		'totalCount'
	> & {
			error_objects: Array<
				{ __typename?: 'ErrorObjectNode' } & Pick<
					Types.ErrorObjectNode,
					| 'id'
					| 'createdAt'
					| 'event'
					| 'timestamp'
					| 'serviceVersion'
					| 'serviceName'
					| 'errorGroupSecureID'
				> & {
						session?: Types.Maybe<
							{ __typename?: 'ErrorObjectNodeSession' } & Pick<
								Types.ErrorObjectNodeSession,
								| 'secureID'
								| 'email'
								| 'fingerprint'
								| 'excluded'
							>
						>
					}
			>
		}
}

export type GetErrorObjectsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['String']
	count: Types.Scalars['Int']
	params: Types.QueryInput
	page?: Types.Maybe<Types.Scalars['Int']>
}>

export type GetErrorObjectsQuery = { __typename?: 'Query' } & {
	error_objects: { __typename?: 'ErrorObjectResults' } & Pick<
		Types.ErrorObjectResults,
		'totalCount'
	> & {
			error_objects: Array<
				{ __typename?: 'ErrorObjectNode' } & Pick<
					Types.ErrorObjectNode,
					| 'id'
					| 'createdAt'
					| 'event'
					| 'timestamp'
					| 'serviceVersion'
					| 'serviceName'
					| 'errorGroupSecureID'
				> & {
						session?: Types.Maybe<
							{ __typename?: 'ErrorObjectNodeSession' } & Pick<
								Types.ErrorObjectNodeSession,
								| 'secureID'
								| 'email'
								| 'fingerprint'
								| 'excluded'
							>
						>
					}
			>
		}
}

export type GetServicesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	query?: Types.Maybe<Types.Scalars['String']>
	after?: Types.Maybe<Types.Scalars['String']>
	before?: Types.Maybe<Types.Scalars['String']>
}>

export type GetServicesQuery = { __typename?: 'Query' } & {
	services?: Types.Maybe<
		{ __typename?: 'ServiceConnection' } & {
			edges: Array<
				Types.Maybe<
					{ __typename?: 'ServiceEdge' } & Pick<
						Types.ServiceEdge,
						'cursor'
					> & {
							node: { __typename?: 'ServiceNode' } & Pick<
								Types.ServiceNode,
								| 'id'
								| 'projectID'
								| 'name'
								| 'status'
								| 'githubRepoPath'
								| 'buildPrefix'
								| 'githubPrefix'
								| 'errorDetails'
							>
						}
				>
			>
			pageInfo: { __typename?: 'PageInfo' } & Pick<
				Types.PageInfo,
				'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
			>
		}
	>
}

export type GetServiceByNameQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	name: Types.Scalars['String']
}>

export type GetServiceByNameQuery = { __typename?: 'Query' } & {
	serviceByName?: Types.Maybe<
		{ __typename?: 'Service' } & Pick<
			Types.Service,
			| 'id'
			| 'projectID'
			| 'name'
			| 'status'
			| 'githubRepoPath'
			| 'buildPrefix'
			| 'githubPrefix'
			| 'errorDetails'
		>
	>
}

export type ErrorTagFragment = { __typename?: 'ErrorTag' } & Pick<
	Types.ErrorTag,
	'id' | 'created_at' | 'title' | 'description'
>

export type GetErrorTagsQueryVariables = Types.Exact<{ [key: string]: never }>

export type GetErrorTagsQuery = { __typename?: 'Query' } & {
	error_tags?: Types.Maybe<
		Array<Types.Maybe<{ __typename?: 'ErrorTag' } & ErrorTagFragment>>
	>
}

export type MatchErrorTagQueryVariables = Types.Exact<{
	query: Types.Scalars['String']
}>

export type MatchErrorTagQuery = { __typename?: 'Query' } & {
	match_error_tag?: Types.Maybe<
		Array<
			Types.Maybe<
				{ __typename?: 'MatchedErrorTag' } & Pick<
					Types.MatchedErrorTag,
					'id' | 'title' | 'description' | 'score'
				>
			>
		>
	>
}

export type GetTraceQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	trace_id: Types.Scalars['String']
	session_secure_id?: Types.Maybe<Types.Scalars['String']>
}>

export type GetTraceQuery = { __typename?: 'Query' } & {
	trace?: Types.Maybe<
		{ __typename?: 'TracePayload' } & {
			trace: Array<
				{ __typename?: 'Trace' } & Pick<
					Types.Trace,
					| 'timestamp'
					| 'traceID'
					| 'spanID'
					| 'parentSpanID'
					| 'projectID'
					| 'secureSessionID'
					| 'traceState'
					| 'spanName'
					| 'spanKind'
					| 'duration'
					| 'serviceName'
					| 'serviceVersion'
					| 'environment'
					| 'hasErrors'
					| 'traceAttributes'
					| 'startTime'
					| 'statusCode'
					| 'statusMessage'
				> & {
						events?: Types.Maybe<
							Array<
								Types.Maybe<
									{ __typename?: 'TraceEvent' } & Pick<
										Types.TraceEvent,
										'timestamp' | 'name' | 'attributes'
									>
								>
							>
						>
					}
			>
			errors: Array<
				{ __typename?: 'TraceError' } & Pick<
					Types.TraceError,
					| 'created_at'
					| 'id'
					| 'trace_id'
					| 'span_id'
					| 'log_cursor'
					| 'event'
					| 'type'
					| 'source'
					| 'timestamp'
					| 'error_group_secure_id'
				>
			>
		}
	>
}

export type GetTracesQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
	after?: Types.Maybe<Types.Scalars['String']>
	before?: Types.Maybe<Types.Scalars['String']>
	at?: Types.Maybe<Types.Scalars['String']>
	direction: Types.SortDirection
}>

export type GetTracesQuery = { __typename?: 'Query' } & {
	traces: { __typename?: 'TraceConnection' } & Pick<
		Types.TraceConnection,
		'sampled'
	> & {
			edges: Array<
				{ __typename?: 'TraceEdge' } & Pick<
					Types.TraceEdge,
					'cursor'
				> & {
						node: { __typename?: 'Trace' } & Pick<
							Types.Trace,
							| 'timestamp'
							| 'traceID'
							| 'spanID'
							| 'parentSpanID'
							| 'projectID'
							| 'secureSessionID'
							| 'traceState'
							| 'spanName'
							| 'spanKind'
							| 'duration'
							| 'serviceName'
							| 'serviceVersion'
							| 'environment'
							| 'hasErrors'
							| 'traceAttributes'
							| 'statusCode'
							| 'statusMessage'
						> & {
								events?: Types.Maybe<
									Array<
										Types.Maybe<
											{
												__typename?: 'TraceEvent'
											} & Pick<
												Types.TraceEvent,
												| 'timestamp'
												| 'name'
												| 'attributes'
											>
										>
									>
								>
							}
					}
			>
			pageInfo: { __typename?: 'PageInfo' } & Pick<
				Types.PageInfo,
				'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
			>
		}
}

export type GetTracesMetricsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
	column: Types.Scalars['String']
	metric_types: Array<Types.MetricAggregator> | Types.MetricAggregator
	group_by: Array<Types.Scalars['String']> | Types.Scalars['String']
	bucket_by?: Types.Maybe<Types.Scalars['String']>
	limit?: Types.Maybe<Types.Scalars['Int']>
	limit_aggregator?: Types.Maybe<Types.MetricAggregator>
	limit_column?: Types.Maybe<Types.Scalars['String']>
}>

export type GetTracesMetricsQuery = { __typename?: 'Query' } & {
	traces_metrics: { __typename?: 'MetricsBuckets' } & Pick<
		Types.MetricsBuckets,
		'bucket_count' | 'sample_factor'
	> & {
			buckets: Array<
				{ __typename?: 'MetricBucket' } & Pick<
					Types.MetricBucket,
					'bucket_id' | 'group' | 'metric_type' | 'metric_value'
				>
			>
		}
}

export type GetKeysQueryVariables = Types.Exact<{
	product_type: Types.ProductType
	project_id: Types.Scalars['ID']
	date_range: Types.DateRangeRequiredInput
	query?: Types.Maybe<Types.Scalars['String']>
	type?: Types.Maybe<Types.KeyType>
}>

export type GetKeysQuery = { __typename?: 'Query' } & {
	keys: Array<
		{ __typename?: 'QueryKey' } & Pick<Types.QueryKey, 'name' | 'type'>
	>
}

export type GetKeyValuesQueryVariables = Types.Exact<{
	product_type: Types.ProductType
	project_id: Types.Scalars['ID']
	key_name: Types.Scalars['String']
	date_range: Types.DateRangeRequiredInput
}>

export type GetKeyValuesQuery = { __typename?: 'Query' } & Pick<
	Types.Query,
	'key_values'
>

export type GetMetricsQueryVariables = Types.Exact<{
	product_type: Types.ProductType
	project_id: Types.Scalars['ID']
	params: Types.QueryInput
	column: Types.Scalars['String']
	metric_types: Array<Types.MetricAggregator> | Types.MetricAggregator
	group_by: Array<Types.Scalars['String']> | Types.Scalars['String']
	bucket_by: Types.Scalars['String']
	bucket_count?: Types.Maybe<Types.Scalars['Int']>
	bucket_window?: Types.Maybe<Types.Scalars['Int']>
	limit?: Types.Maybe<Types.Scalars['Int']>
	limit_aggregator?: Types.Maybe<Types.MetricAggregator>
	limit_column?: Types.Maybe<Types.Scalars['String']>
}>

export type GetMetricsQuery = { __typename?: 'Query' } & {
	metrics: { __typename?: 'MetricsBuckets' } & Pick<
		Types.MetricsBuckets,
		'bucket_count' | 'sample_factor'
	> & {
			buckets: Array<
				{ __typename?: 'MetricBucket' } & Pick<
					Types.MetricBucket,
					| 'bucket_id'
					| 'bucket_min'
					| 'bucket_max'
					| 'group'
					| 'metric_type'
					| 'metric_value'
				>
			>
		}
}

export type GetVisualizationQueryVariables = Types.Exact<{
	id: Types.Scalars['ID']
}>

export type GetVisualizationQuery = { __typename?: 'Query' } & {
	visualization: { __typename?: 'Visualization' } & Pick<
		Types.Visualization,
		'id' | 'updatedAt' | 'projectId' | 'name'
	> & {
			graphs: Array<
				{ __typename?: 'Graph' } & Pick<
					Types.Graph,
					| 'id'
					| 'type'
					| 'title'
					| 'productType'
					| 'query'
					| 'metric'
					| 'functionType'
					| 'groupByKey'
					| 'bucketByKey'
					| 'bucketCount'
					| 'limit'
					| 'limitFunctionType'
					| 'limitMetric'
					| 'display'
					| 'nullHandling'
				>
			>
			updatedByAdmin?: Types.Maybe<
				{ __typename?: 'SanitizedAdmin' } & Pick<
					Types.SanitizedAdmin,
					'id' | 'name' | 'email' | 'photo_url'
				>
			>
		}
}

export type GetVisualizationsQueryVariables = Types.Exact<{
	project_id: Types.Scalars['ID']
	input: Types.Scalars['String']
	count: Types.Scalars['Int']
	offset: Types.Scalars['Int']
}>

export type GetVisualizationsQuery = { __typename?: 'Query' } & {
	visualizations: { __typename?: 'VisualizationsResponse' } & Pick<
		Types.VisualizationsResponse,
		'count'
	> & {
			results: Array<
				{ __typename?: 'Visualization' } & Pick<
					Types.Visualization,
					'id' | 'updatedAt' | 'projectId' | 'name'
				> & {
						graphs: Array<
							{ __typename?: 'Graph' } & Pick<
								Types.Graph,
								| 'id'
								| 'type'
								| 'title'
								| 'productType'
								| 'query'
								| 'metric'
								| 'functionType'
								| 'groupByKey'
								| 'bucketByKey'
								| 'bucketCount'
								| 'limit'
								| 'limitFunctionType'
								| 'limitMetric'
								| 'display'
								| 'nullHandling'
							>
						>
						updatedByAdmin?: Types.Maybe<
							{ __typename?: 'SanitizedAdmin' } & Pick<
								Types.SanitizedAdmin,
								'id' | 'name' | 'email' | 'photo_url'
							>
						>
					}
			>
		}
}

export type GetAiQuerySuggestionQueryVariables = Types.Exact<{
	time_zone: Types.Scalars['String']
	project_id: Types.Scalars['ID']
	product_type: Types.ProductType
	query: Types.Scalars['String']
}>

export type GetAiQuerySuggestionQuery = { __typename?: 'Query' } & {
	ai_query_suggestion: { __typename?: 'QueryOutput' } & Pick<
		Types.QueryOutput,
		'query'
	> & {
			date_range: { __typename?: 'DateRangeRequiredOutput' } & Pick<
				Types.DateRangeRequiredOutput,
				'start_date' | 'end_date'
			>
		}
}

export const namedOperations = {
	Query: {
		GetMetricsTimeline: 'GetMetricsTimeline' as const,
		GetNetworkHistogram: 'GetNetworkHistogram' as const,
		GetSessionPayload: 'GetSessionPayload' as const,
		GetCommentTagsForProject: 'GetCommentTagsForProject' as const,
		GetEventChunkURL: 'GetEventChunkURL' as const,
		GetEventChunks: 'GetEventChunks' as const,
		GetSession: 'GetSession' as const,
		GetWorkspaceAdminsByProjectId: 'GetWorkspaceAdminsByProjectId' as const,
		GetWorkspaceAdmins: 'GetWorkspaceAdmins' as const,
		GetSessionInsight: 'GetSessionInsight' as const,
		GetSessionExports: 'GetSessionExports' as const,
		GetSessionComments: 'GetSessionComments' as const,
		GetSessionCommentsForAdmin: 'GetSessionCommentsForAdmin' as const,
		isSessionPending: 'isSessionPending' as const,
		GetAccounts: 'GetAccounts' as const,
		GetAccountDetails: 'GetAccountDetails' as const,
		GetErrorComments: 'GetErrorComments' as const,
		GetErrorIssues: 'GetErrorIssues' as const,
		GetEnhancedUserDetails: 'GetEnhancedUserDetails' as const,
		GetSessionIntervals: 'GetSessionIntervals' as const,
		GetTimelineIndicatorEvents: 'GetTimelineIndicatorEvents' as const,
		GetWebSocketEvents: 'GetWebSocketEvents' as const,
		GetSessions: 'GetSessions' as const,
		GetSessionsHistogram: 'GetSessionsHistogram' as const,
		GetSessionUsersReports: 'GetSessionUsersReports' as const,
		GetErrorGroups: 'GetErrorGroups' as const,
		GetErrorsHistogram: 'GetErrorsHistogram' as const,
		GetProjects: 'GetProjects' as const,
		GetWorkspace: 'GetWorkspace' as const,
		GetWorkspaceForInviteLink: 'GetWorkspaceForInviteLink' as const,
		GetWorkspaces: 'GetWorkspaces' as const,
		GetWorkspacesCount: 'GetWorkspacesCount' as const,
		GetProjectsAndWorkspaces: 'GetProjectsAndWorkspaces' as const,
		GetProjectOrWorkspace: 'GetProjectOrWorkspace' as const,
		GetDropdownOptions: 'GetDropdownOptions' as const,
		GetAdmin: 'GetAdmin' as const,
		GetAdminRole: 'GetAdminRole' as const,
		GetAdminRoleByProject: 'GetAdminRoleByProject' as const,
		GetAdminAboutYou: 'GetAdminAboutYou' as const,
		GetProject: 'GetProject' as const,
		GetBillingDetailsForProject: 'GetBillingDetailsForProject' as const,
		GetWorkspaceUsageHistory: 'GetWorkspaceUsageHistory' as const,
		GetBillingDetails: 'GetBillingDetails' as const,
		GetSubscriptionDetails: 'GetSubscriptionDetails' as const,
		GetErrorGroup: 'GetErrorGroup' as const,
		GetErrorObjectForLog: 'GetErrorObjectForLog' as const,
		GetErrorObject: 'GetErrorObject' as const,
		GetErrorInstance: 'GetErrorInstance' as const,
		GetResources: 'GetResources' as const,
		GetFieldSuggestion: 'GetFieldSuggestion' as const,
		GetEnvironments: 'GetEnvironments' as const,
		GetProjectSuggestion: 'GetProjectSuggestion' as const,
		GetErrorFieldSuggestion: 'GetErrorFieldSuggestion' as const,
		GetErrorSearchSuggestions: 'GetErrorSearchSuggestions' as const,
		GetSessionSearchResults: 'GetSessionSearchResults' as const,
		GetTrackSuggestion: 'GetTrackSuggestion' as const,
		GetUserSuggestion: 'GetUserSuggestion' as const,
		GetSavedSegments: 'GetSavedSegments' as const,
		GetClientIntegration: 'GetClientIntegration' as const,
		GetServerIntegration: 'GetServerIntegration' as const,
		GetLogsIntegration: 'GetLogsIntegration' as const,
		GetTracesIntegration: 'GetTracesIntegration' as const,
		GetKeyPerformanceIndicators: 'GetKeyPerformanceIndicators' as const,
		GetReferrersCount: 'GetReferrersCount' as const,
		GetNewUsersCount: 'GetNewUsersCount' as const,
		GetAverageSessionLength: 'GetAverageSessionLength' as const,
		GetTopUsers: 'GetTopUsers' as const,
		GetDailySessionsCount: 'GetDailySessionsCount' as const,
		GetDailyErrorsCount: 'GetDailyErrorsCount' as const,
		GetRageClicksForProject: 'GetRageClicksForProject' as const,
		GetDailyErrorFrequency: 'GetDailyErrorFrequency' as const,
		GetSlackChannelSuggestion: 'GetSlackChannelSuggestion' as const,
		GetMicrosoftTeamsChannelSuggestion:
			'GetMicrosoftTeamsChannelSuggestion' as const,
		GetWorkspaceIsIntegratedWithSlack:
			'GetWorkspaceIsIntegratedWithSlack' as const,
		GetWorkspaceIsIntegratedWithMicrosoftTeams:
			'GetWorkspaceIsIntegratedWithMicrosoftTeams' as const,
		GetWorkspaceIsIntegratedWithHeroku:
			'GetWorkspaceIsIntegratedWithHeroku' as const,
		GetWorkspaceIsIntegratedWithCloudflare:
			'GetWorkspaceIsIntegratedWithCloudflare' as const,
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
		GetJiraIntegrationSettings: 'GetJiraIntegrationSettings' as const,
		GetClickUpIntegrationSettings: 'GetClickUpIntegrationSettings' as const,
		GetHeightIntegrationSettings: 'GetHeightIntegrationSettings' as const,
		GetGitHubIntegrationSettings: 'GetGitHubIntegrationSettings' as const,
		GetGitlabIntegrationSettings: 'GetGitlabIntegrationSettings' as const,
		GetGitHubIssueLabels: 'GetGitHubIssueLabels' as const,
		GetProjectIntegratedWith: 'GetProjectIntegratedWith' as const,
		GetClickUpFolders: 'GetClickUpFolders' as const,
		GetHeightLists: 'GetHeightLists' as const,
		GenerateNewZapierAccessTokenJwt:
			'GenerateNewZapierAccessTokenJwt' as const,
		GetIdentifierSuggestions: 'GetIdentifierSuggestions' as const,
		GetLogAlert: 'GetLogAlert' as const,
		GetLogAlertsPagePayload: 'GetLogAlertsPagePayload' as const,
		GetAlertsPagePayload: 'GetAlertsPagePayload' as const,
		GetAlert: 'GetAlert' as const,
		GetMetricMonitors: 'GetMetricMonitors' as const,
		GetCommentMentionSuggestions: 'GetCommentMentionSuggestions' as const,
		GetCustomerPortalURL: 'GetCustomerPortalURL' as const,
		GetWebVitals: 'GetWebVitals' as const,
		GetDashboardDefinitions: 'GetDashboardDefinitions' as const,
		GetMetricTags: 'GetMetricTags' as const,
		GetMetricTagValues: 'GetMetricTagValues' as const,
		GetSourcemapFiles: 'GetSourcemapFiles' as const,
		GetSourcemapVersions: 'GetSourcemapVersions' as const,
		GetOAuthClientMetadata: 'GetOAuthClientMetadata' as const,
		SearchIssues: 'SearchIssues' as const,
		GetErrorGroupFrequencies: 'GetErrorGroupFrequencies' as const,
		GetErrorGroupTags: 'GetErrorGroupTags' as const,
		GetEmailOptOuts: 'GetEmailOptOuts' as const,
		GetLogs: 'GetLogs' as const,
		GetSessionLogs: 'GetSessionLogs' as const,
		GetLogsTotalCount: 'GetLogsTotalCount' as const,
		GetLogsHistogram: 'GetLogsHistogram' as const,
		GetLogsRelatedResources: 'GetLogsRelatedResources' as const,
		GetProjectSettings: 'GetProjectSettings' as const,
		GetWorkspacePendingInvites: 'GetWorkspacePendingInvites' as const,
		GetErrorResolutionSuggestion: 'GetErrorResolutionSuggestion' as const,
		GetWorkspaceSettings: 'GetWorkspaceSettings' as const,
		GetSystemConfiguration: 'GetSystemConfiguration' as const,
		GetErrorGroupInstances: 'GetErrorGroupInstances' as const,
		GetErrorObjects: 'GetErrorObjects' as const,
		GetServices: 'GetServices' as const,
		GetServiceByName: 'GetServiceByName' as const,
		GetErrorTags: 'GetErrorTags' as const,
		MatchErrorTag: 'MatchErrorTag' as const,
		GetTrace: 'GetTrace' as const,
		GetTraces: 'GetTraces' as const,
		GetTracesMetrics: 'GetTracesMetrics' as const,
		GetKeys: 'GetKeys' as const,
		GetKeyValues: 'GetKeyValues' as const,
		GetMetrics: 'GetMetrics' as const,
		GetVisualization: 'GetVisualization' as const,
		GetVisualizations: 'GetVisualizations' as const,
		GetAIQuerySuggestion: 'GetAIQuerySuggestion' as const,
	},
	Mutation: {
		MarkErrorGroupAsViewed: 'MarkErrorGroupAsViewed' as const,
		MarkSessionAsViewed: 'MarkSessionAsViewed' as const,
		MuteSessionCommentThread: 'MuteSessionCommentThread' as const,
		CreateOrUpdateStripeSubscription:
			'CreateOrUpdateStripeSubscription' as const,
		HandleAWSMarketplace: 'HandleAWSMarketplace' as const,
		SaveBillingPlan: 'SaveBillingPlan' as const,
		UpdateBillingDetails: 'UpdateBillingDetails' as const,
		updateErrorGroupState: 'updateErrorGroupState' as const,
		SendEmailSignup: 'SendEmailSignup' as const,
		AddAdminToWorkspace: 'AddAdminToWorkspace' as const,
		JoinWorkspace: 'JoinWorkspace' as const,
		ChangeAdminRole: 'ChangeAdminRole' as const,
		ChangeProjectMembership: 'ChangeProjectMembership' as const,
		DeleteAdminFromWorkspace: 'DeleteAdminFromWorkspace' as const,
		AddIntegrationToProject: 'AddIntegrationToProject' as const,
		RemoveIntegrationFromProject: 'RemoveIntegrationFromProject' as const,
		AddIntegrationToWorkspace: 'AddIntegrationToWorkspace' as const,
		RemoveIntegrationFromWorkspace:
			'RemoveIntegrationFromWorkspace' as const,
		UpdateAllowedEmailOrigins: 'UpdateAllowedEmailOrigins' as const,
		CreateProject: 'CreateProject' as const,
		SubmitRegistrationForm: 'SubmitRegistrationForm' as const,
		CreateAdmin: 'CreateAdmin' as const,
		CreateWorkspace: 'CreateWorkspace' as const,
		EditProject: 'EditProject' as const,
		EditProjectSettings: 'EditProjectSettings' as const,
		DeleteProject: 'DeleteProject' as const,
		EditWorkspace: 'EditWorkspace' as const,
		EditWorkspaceSettings: 'EditWorkspaceSettings' as const,
		CreateSessionComment: 'CreateSessionComment' as const,
		CreateSessionCommentWithExistingIssue:
			'CreateSessionCommentWithExistingIssue' as const,
		CreateIssueForSessionComment: 'CreateIssueForSessionComment' as const,
		LinkIssueForSessionComment: 'LinkIssueForSessionComment' as const,
		DeleteSessionComment: 'DeleteSessionComment' as const,
		ReplyToSessionComment: 'ReplyToSessionComment' as const,
		CreateErrorComment: 'CreateErrorComment' as const,
		CreateErrorCommentForExistingIssue:
			'CreateErrorCommentForExistingIssue' as const,
		CreateIssueForErrorComment: 'CreateIssueForErrorComment' as const,
		LinkIssueForErrorComment: 'LinkIssueForErrorComment' as const,
		DeleteErrorComment: 'DeleteErrorComment' as const,
		MuteErrorCommentThread: 'MuteErrorCommentThread' as const,
		RemoveErrorIssue: 'RemoveErrorIssue' as const,
		ReplyToErrorComment: 'ReplyToErrorComment' as const,
		CreateErrorAlert: 'CreateErrorAlert' as const,
		CreateMetricMonitor: 'CreateMetricMonitor' as const,
		UpdateMetricMonitor: 'UpdateMetricMonitor' as const,
		DeleteMetricMonitor: 'DeleteMetricMonitor' as const,
		CreateAlert: 'CreateAlert' as const,
		UpdateAlert: 'UpdateAlert' as const,
		UpdateAlertDisabled: 'UpdateAlertDisabled' as const,
		DeleteAlert: 'DeleteAlert' as const,
		UpdateAdminAndCreateWorkspace: 'UpdateAdminAndCreateWorkspace' as const,
		UpdateAdminAboutYouDetails: 'UpdateAdminAboutYouDetails' as const,
		UpdateErrorAlert: 'UpdateErrorAlert' as const,
		DeleteErrorAlert: 'DeleteErrorAlert' as const,
		DeleteSessionAlert: 'DeleteSessionAlert' as const,
		UpdateLogAlert: 'UpdateLogAlert' as const,
		CreateLogAlert: 'CreateLogAlert' as const,
		DeleteLogAlert: 'DeleteLogAlert' as const,
		UpdateLogAlertIsDisabled: 'UpdateLogAlertIsDisabled' as const,
		UpdateSessionAlertIsDisabled: 'UpdateSessionAlertIsDisabled' as const,
		UpdateMetricMonitorIsDisabled: 'UpdateMetricMonitorIsDisabled' as const,
		UpdateErrorAlertIsDisabled: 'UpdateErrorAlertIsDisabled' as const,
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
		ExportSession: 'ExportSession' as const,
		UpdateVercelSettings: 'UpdateVercelSettings' as const,
		UpdateClickUpSettings: 'UpdateClickUpSettings' as const,
		UpdateIntegrationProjectSettings:
			'UpdateIntegrationProjectSettings' as const,
		UpdateEmailOptOut: 'UpdateEmailOptOut' as const,
		DeleteInviteLinkFromWorkspace: 'DeleteInviteLinkFromWorkspace' as const,
		EditServiceGithubSettings: 'EditServiceGithubSettings' as const,
		CreateErrorTag: 'CreateErrorTag' as const,
		UpdateErrorTags: 'UpdateErrorTags' as const,
		UpsertSlackChannel: 'UpsertSlackChannel' as const,
		UpsertDiscordChannel: 'UpsertDiscordChannel' as const,
		testErrorEnhancement: 'testErrorEnhancement' as const,
		DeleteSavedSegment: 'DeleteSavedSegment' as const,
		EditSavedSegment: 'EditSavedSegment' as const,
		CreateSavedSegment: 'CreateSavedSegment' as const,
		UpsertVisualization: 'UpsertVisualization' as const,
		DeleteVisualization: 'DeleteVisualization' as const,
		UpsertGraph: 'UpsertGraph' as const,
		DeleteGraph: 'DeleteGraph' as const,
		CreateCloudflareProxy: 'CreateCloudflareProxy' as const,
		SendAdminWorkspaceInvite: 'SendAdminWorkspaceInvite' as const,
	},
	Subscription: {
		OnSessionPayloadAppended: 'OnSessionPayloadAppended' as const,
	},
	Fragment: {
		SessionPayloadFragment: 'SessionPayloadFragment' as const,
		SessionAlertFragment: 'SessionAlertFragment' as const,
		DiscordChannelFragment: 'DiscordChannelFragment' as const,
		MicrosoftTeamsChannelFragment: 'MicrosoftTeamsChannelFragment' as const,
		ErrorObject: 'ErrorObject' as const,
		Project: 'Project' as const,
		ErrorTag: 'ErrorTag' as const,
	},
}
