import * as Types from './schemas';

export type MarkSessionAsViewedMutationVariables = Types.Exact<{
    secure_id: Types.Scalars['String'];
    viewed: Types.Scalars['Boolean'];
}>;

export type MarkSessionAsViewedMutation = { __typename?: 'Mutation' } & {
    markSessionAsViewed?: Types.Maybe<
        { __typename?: 'Session' } & Pick<Types.Session, 'secure_id' | 'viewed'>
    >;
};

export type MarkSessionAsStarredMutationVariables = Types.Exact<{
    secure_id: Types.Scalars['String'];
    starred: Types.Scalars['Boolean'];
}>;

export type MarkSessionAsStarredMutation = { __typename?: 'Mutation' } & {
    markSessionAsStarred?: Types.Maybe<
        { __typename?: 'Session' } & Pick<
            Types.Session,
            'secure_id' | 'starred'
        >
    >;
};

export type CreateOrUpdateStripeSubscriptionMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    plan_type: Types.PlanType;
    interval: Types.SubscriptionInterval;
}>;

export type CreateOrUpdateStripeSubscriptionMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'createOrUpdateStripeSubscription'>;

export type UpdateBillingDetailsMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
}>;

export type UpdateBillingDetailsMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'updateBillingDetails'
>;

export type UpdateErrorGroupStateMutationVariables = Types.Exact<{
    secure_id: Types.Scalars['String'];
    state: Types.Scalars['String'];
}>;

export type UpdateErrorGroupStateMutation = { __typename?: 'Mutation' } & {
    updateErrorGroupState?: Types.Maybe<
        { __typename?: 'ErrorGroup' } & Pick<
            Types.ErrorGroup,
            'secure_id' | 'state'
        >
    >;
};

export type SendEmailSignupMutationVariables = Types.Exact<{
    email: Types.Scalars['String'];
}>;

export type SendEmailSignupMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'emailSignup'
>;

export type AddAdminToWorkspaceMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    invite_id: Types.Scalars['String'];
}>;

export type AddAdminToWorkspaceMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'addAdminToWorkspace'
>;

export type JoinWorkspaceMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
}>;

export type JoinWorkspaceMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'joinWorkspace'
>;

export type ChangeAdminRoleMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
    new_role: Types.Scalars['String'];
}>;

export type ChangeAdminRoleMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'changeAdminRole'
>;

export type DeleteAdminFromProjectMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
}>;

export type DeleteAdminFromProjectMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteAdminFromProject'
>;

export type DeleteAdminFromWorkspaceMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
}>;

export type DeleteAdminFromWorkspaceMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'deleteAdminFromWorkspace'>;

export type OpenSlackConversationMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    code: Types.Scalars['String'];
    redirect_path: Types.Scalars['String'];
}>;

export type OpenSlackConversationMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'openSlackConversation'
>;

export type AddIntegrationToProjectMutationVariables = Types.Exact<{
    integration_type?: Types.Maybe<Types.IntegrationType>;
    project_id: Types.Scalars['ID'];
    code: Types.Scalars['String'];
}>;

export type AddIntegrationToProjectMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'addIntegrationToProject'>;

export type RemoveIntegrationFromProjectMutationVariables = Types.Exact<{
    integration_type?: Types.Maybe<Types.IntegrationType>;
    project_id: Types.Scalars['ID'];
}>;

export type RemoveIntegrationFromProjectMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'removeIntegrationFromProject'>;

export type UpdateAllowedEmailOriginsMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    allowed_auto_join_email_origins: Types.Scalars['String'];
}>;

export type UpdateAllowedEmailOriginsMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'updateAllowedEmailOrigins'>;

export type CreateProjectMutationVariables = Types.Exact<{
    name: Types.Scalars['String'];
    workspace_id: Types.Scalars['ID'];
}>;

export type CreateProjectMutation = { __typename?: 'Mutation' } & {
    createProject?: Types.Maybe<
        { __typename?: 'Project' } & Pick<Types.Project, 'id' | 'name'>
    >;
};

export type SubmitRegistrationFormMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    team_size: Types.Scalars['String'];
    role: Types.Scalars['String'];
    use_case: Types.Scalars['String'];
    heard_about: Types.Scalars['String'];
    pun?: Types.Maybe<Types.Scalars['String']>;
}>;

export type SubmitRegistrationFormMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'submitRegistrationForm'
>;

export type CreateWorkspaceMutationVariables = Types.Exact<{
    name: Types.Scalars['String'];
}>;

export type CreateWorkspaceMutation = { __typename?: 'Mutation' } & {
    createWorkspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
    >;
};

export type EditProjectMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
    name?: Types.Maybe<Types.Scalars['String']>;
    billing_email?: Types.Maybe<Types.Scalars['String']>;
}>;

export type EditProjectMutation = { __typename?: 'Mutation' } & {
    editProject?: Types.Maybe<
        { __typename?: 'Project' } & Pick<
            Types.Project,
            'id' | 'name' | 'billing_email'
        >
    >;
};

export type DeleteProjectMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type DeleteProjectMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteProject'
>;

export type EditWorkspaceMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
    name?: Types.Maybe<Types.Scalars['String']>;
}>;

export type EditWorkspaceMutation = { __typename?: 'Mutation' } & {
    editWorkspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
    >;
};

export type DeleteSegmentMutationVariables = Types.Exact<{
    segment_id: Types.Scalars['ID'];
}>;

export type DeleteSegmentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteSegment'
>;

export type EditSegmentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    id: Types.Scalars['ID'];
    params: Types.SearchParamsInput;
}>;

export type EditSegmentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'editSegment'
>;

export type CreateSegmentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    params: Types.SearchParamsInput;
}>;

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
                        >;
                        excluded_properties?: Types.Maybe<
                            Array<
                                Types.Maybe<
                                    { __typename?: 'UserProperty' } & Pick<
                                        Types.UserProperty,
                                        'name' | 'value'
                                    >
                                >
                            >
                        >;
                        date_range?: Types.Maybe<
                            { __typename?: 'DateRange' } & Pick<
                                Types.DateRange,
                                'start_date' | 'end_date'
                            >
                        >;
                    };
            }
    >;
};

export type CreateSessionCommentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_secure_id: Types.Scalars['String'];
    session_timestamp: Types.Scalars['Int'];
    text: Types.Scalars['String'];
    text_for_email: Types.Scalars['String'];
    x_coordinate: Types.Scalars['Float'];
    y_coordinate: Types.Scalars['Float'];
    tagged_admins:
        | Array<Types.Maybe<Types.SanitizedAdminInput>>
        | Types.Maybe<Types.SanitizedAdminInput>;
    tagged_slack_users:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    session_url: Types.Scalars['String'];
    time: Types.Scalars['Float'];
    author_name: Types.Scalars['String'];
    session_image?: Types.Maybe<Types.Scalars['String']>;
    tags:
        | Array<Types.Maybe<Types.SessionCommentTagInput>>
        | Types.Maybe<Types.SessionCommentTagInput>;
    integrations:
        | Array<Types.Maybe<Types.IntegrationType>>
        | Types.Maybe<Types.IntegrationType>;
    issue_title?: Types.Maybe<Types.Scalars['String']>;
    issue_description?: Types.Maybe<Types.Scalars['String']>;
}>;

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
                >;
                attachments: Array<
                    Types.Maybe<
                        { __typename?: 'ExternalAttachment' } & Pick<
                            Types.ExternalAttachment,
                            'id' | 'integration_type' | 'external_id' | 'title'
                        >
                    >
                >;
            }
    >;
};

export type CreateIssueForSessionCommentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_comment_id: Types.Scalars['Int'];
    text_for_attachment: Types.Scalars['String'];
    session_url: Types.Scalars['String'];
    time: Types.Scalars['Float'];
    author_name: Types.Scalars['String'];
    integrations:
        | Array<Types.Maybe<Types.IntegrationType>>
        | Types.Maybe<Types.IntegrationType>;
    issue_title?: Types.Maybe<Types.Scalars['String']>;
    issue_description?: Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateIssueForSessionCommentMutation = {
    __typename?: 'Mutation';
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
                >;
                attachments: Array<
                    Types.Maybe<
                        { __typename?: 'ExternalAttachment' } & Pick<
                            Types.ExternalAttachment,
                            'id' | 'integration_type' | 'external_id' | 'title'
                        >
                    >
                >;
            }
    >;
};

export type DeleteSessionCommentMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type DeleteSessionCommentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteSessionComment'
>;

export type CreateErrorCommentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    error_group_secure_id: Types.Scalars['String'];
    text: Types.Scalars['String'];
    text_for_email: Types.Scalars['String'];
    tagged_admins:
        | Array<Types.Maybe<Types.SanitizedAdminInput>>
        | Types.Maybe<Types.SanitizedAdminInput>;
    tagged_slack_users:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    error_url: Types.Scalars['String'];
    author_name: Types.Scalars['String'];
    integrations:
        | Array<Types.Maybe<Types.IntegrationType>>
        | Types.Maybe<Types.IntegrationType>;
    issue_title?: Types.Maybe<Types.Scalars['String']>;
    issue_description?: Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateErrorCommentMutation = { __typename?: 'Mutation' } & {
    createErrorComment?: Types.Maybe<
        { __typename?: 'ErrorComment' } & Pick<
            Types.ErrorComment,
            'id' | 'created_at' | 'updated_at' | 'text'
        > & {
                author: { __typename?: 'SanitizedAdmin' } & Pick<
                    Types.SanitizedAdmin,
                    'id' | 'name' | 'email'
                >;
            }
    >;
};

export type CreateIssueForErrorCommentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    error_comment_id: Types.Scalars['Int'];
    text_for_attachment: Types.Scalars['String'];
    error_url: Types.Scalars['String'];
    author_name: Types.Scalars['String'];
    integrations:
        | Array<Types.Maybe<Types.IntegrationType>>
        | Types.Maybe<Types.IntegrationType>;
    issue_title?: Types.Maybe<Types.Scalars['String']>;
    issue_description?: Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateIssueForErrorCommentMutation = { __typename?: 'Mutation' } & {
    createIssueForErrorComment?: Types.Maybe<
        { __typename?: 'ErrorComment' } & Pick<
            Types.ErrorComment,
            'id' | 'created_at' | 'updated_at' | 'text'
        > & {
                author: { __typename?: 'SanitizedAdmin' } & Pick<
                    Types.SanitizedAdmin,
                    'id' | 'name' | 'email'
                >;
                attachments: Array<
                    Types.Maybe<
                        { __typename?: 'ExternalAttachment' } & Pick<
                            Types.ExternalAttachment,
                            'id' | 'integration_type' | 'external_id' | 'title'
                        >
                    >
                >;
            }
    >;
};

export type DeleteErrorCommentMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type DeleteErrorCommentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteErrorComment'
>;

export type DeleteErrorSegmentMutationVariables = Types.Exact<{
    segment_id: Types.Scalars['ID'];
}>;

export type DeleteErrorSegmentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteErrorSegment'
>;

export type EditErrorSegmentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    id: Types.Scalars['ID'];
    params: Types.ErrorSearchParamsInput;
}>;

export type EditErrorSegmentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'editErrorSegment'
>;

export type CreateErrorSegmentMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    params: Types.ErrorSearchParamsInput;
}>;

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
                        >;
                    };
            }
    >;
};

export type CreateErrorAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    count_threshold: Types.Scalars['Int'];
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    regex_groups:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    frequency: Types.Scalars['Int'];
}>;

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
                >;
            }
    >;
};

export type CreateMetricMonitorMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    function: Types.Scalars['String'];
    threshold: Types.Scalars['Float'];
    metric_to_monitor: Types.Scalars['String'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateMetricMonitorMutation = { __typename?: 'Mutation' } & {
    createMetricMonitor?: Types.Maybe<
        { __typename?: 'MetricMonitor' } & Pick<
            Types.MetricMonitor,
            | 'id'
            | 'updated_at'
            | 'name'
            | 'emails_to_notify'
            | 'function'
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
                >;
            }
    >;
};

export type UpdateMetricMonitorMutationVariables = Types.Exact<{
    metric_monitor_id: Types.Scalars['ID'];
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    function: Types.Scalars['String'];
    threshold: Types.Scalars['Float'];
    metric_to_monitor: Types.Scalars['String'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    disabled: Types.Scalars['Boolean'];
}>;

export type UpdateMetricMonitorMutation = { __typename?: 'Mutation' } & {
    updateMetricMonitor?: Types.Maybe<
        { __typename?: 'MetricMonitor' } & Pick<
            Types.MetricMonitor,
            | 'id'
            | 'updated_at'
            | 'name'
            | 'emails_to_notify'
            | 'function'
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
                >;
            }
    >;
};

export type DeleteMetricMonitorMutationVariables = Types.Exact<{
    metric_monitor_id: Types.Scalars['ID'];
    project_id: Types.Scalars['ID'];
}>;

export type DeleteMetricMonitorMutation = { __typename?: 'Mutation' } & {
    deleteMetricMonitor?: Types.Maybe<
        { __typename?: 'MetricMonitor' } & Pick<
            Types.MetricMonitor,
            | 'id'
            | 'updated_at'
            | 'name'
            | 'emails_to_notify'
            | 'function'
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
                >;
            }
    >;
};

export type UpdateAdminAboutYouDetailsMutationVariables = Types.Exact<{
    adminDetails: Types.AdminAboutYouDetails;
}>;

export type UpdateAdminAboutYouDetailsMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'updateAdminAboutYouDetails'>;

export type CreateRageClickAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    count_threshold: Types.Scalars['Int'];
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateRageClickAlertMutation = { __typename?: 'Mutation' } & {
    createRageClickAlert?: Types.Maybe<
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
                >;
            }
    >;
};

export type UpdateErrorAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    error_alert_id: Types.Scalars['ID'];
    count_threshold: Types.Scalars['Int'];
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    regex_groups:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    frequency: Types.Scalars['Int'];
    disabled: Types.Scalars['Boolean'];
}>;

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
                >;
            }
    >;
};

export type DeleteErrorAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    error_alert_id: Types.Scalars['ID'];
}>;

export type DeleteErrorAlertMutation = { __typename?: 'Mutation' } & {
    deleteErrorAlert?: Types.Maybe<
        { __typename?: 'ErrorAlert' } & Pick<Types.ErrorAlert, 'id'>
    >;
};

export type DeleteSessionAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_alert_id: Types.Scalars['ID'];
}>;

export type DeleteSessionAlertMutation = { __typename?: 'Mutation' } & {
    deleteSessionAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<Types.SessionAlert, 'id'>
    >;
};

export type CreateDefaultAlertsMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    alert_types: Array<Types.Scalars['String']> | Types.Scalars['String'];
    slack_channels:
        | Array<Types.SanitizedSlackChannelInput>
        | Types.SanitizedSlackChannelInput;
    emails: Array<Types.Scalars['String']> | Types.Scalars['String'];
}>;

export type CreateDefaultAlertsMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'createDefaultAlerts'
>;

export type CreateSessionFeedbackAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    count_threshold: Types.Scalars['Int'];
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateSessionFeedbackAlertMutation = { __typename?: 'Mutation' } & {
    createSessionFeedbackAlert?: Types.Maybe<
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
                >;
            }
    >;
};

export type UpdateSessionFeedbackAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_feedback_alert_id: Types.Scalars['ID'];
    count_threshold: Types.Scalars['Int'];
    name: Types.Scalars['String'];
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    disabled: Types.Scalars['Boolean'];
}>;

export type UpdateSessionFeedbackAlertMutation = { __typename?: 'Mutation' } & {
    updateSessionFeedbackAlert?: Types.Maybe<
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
                >;
            }
    >;
};

export type CreateNewUserAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    count_threshold: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    threshold_window: Types.Scalars['Int'];
}>;

export type CreateNewUserAlertMutation = { __typename?: 'Mutation' } & {
    createNewUserAlert?: Types.Maybe<
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
                >;
            }
    >;
};

export type CreateNewSessionAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    count_threshold: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    threshold_window: Types.Scalars['Int'];
    exclude_rules:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateNewSessionAlertMutation = { __typename?: 'Mutation' } & {
    createNewSessionAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            | 'id'
            | 'EmailsToNotify'
            | 'Name'
            | 'ExcludedEnvironments'
            | 'CountThreshold'
            | 'ThresholdWindow'
            | 'LastAdminToEditID'
            | 'ExcludeRules'
            | 'disabled'
        > & {
                ChannelsToNotify: Array<
                    Types.Maybe<
                        { __typename?: 'SanitizedSlackChannel' } & Pick<
                            Types.SanitizedSlackChannel,
                            'webhook_channel' | 'webhook_channel_id'
                        >
                    >
                >;
            }
    >;
};

export type UpdateNewSessionAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_alert_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    count_threshold: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    threshold_window: Types.Scalars['Int'];
    exclude_rules:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    disabled: Types.Scalars['Boolean'];
}>;

export type UpdateNewSessionAlertMutation = { __typename?: 'Mutation' } & {
    updateNewSessionAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            | 'id'
            | 'EmailsToNotify'
            | 'Name'
            | 'ExcludedEnvironments'
            | 'CountThreshold'
            | 'ThresholdWindow'
            | 'LastAdminToEditID'
            | 'ExcludeRules'
            | 'disabled'
        > & {
                ChannelsToNotify: Array<
                    Types.Maybe<
                        { __typename?: 'SanitizedSlackChannel' } & Pick<
                            Types.SanitizedSlackChannel,
                            'webhook_channel' | 'webhook_channel_id'
                        >
                    >
                >;
            }
    >;
};

export type UpdateRageClickAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    rage_click_alert_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    count_threshold: Types.Scalars['Int'];
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    disabled: Types.Scalars['Boolean'];
}>;

export type UpdateRageClickAlertMutation = { __typename?: 'Mutation' } & {
    updateRageClickAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            | 'EmailsToNotify'
            | 'ExcludedEnvironments'
            | 'CountThreshold'
            | 'ThresholdWindow'
            | 'disabled'
        > & {
                ChannelsToNotify: Array<
                    Types.Maybe<
                        { __typename?: 'SanitizedSlackChannel' } & Pick<
                            Types.SanitizedSlackChannel,
                            'webhook_channel' | 'webhook_channel_id'
                        >
                    >
                >;
            }
    >;
};

export type UpdateNewUserAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_alert_id: Types.Scalars['ID'];
    count_threshold: Types.Scalars['Int'];
    name: Types.Scalars['String'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    threshold_window: Types.Scalars['Int'];
    disabled: Types.Scalars['Boolean'];
}>;

export type UpdateNewUserAlertMutation = { __typename?: 'Mutation' } & {
    updateNewUserAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            | 'id'
            | 'EmailsToNotify'
            | 'ExcludedEnvironments'
            | 'CountThreshold'
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
                >;
            }
    >;
};

export type CreateTrackPropertiesAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    track_properties:
        | Array<Types.Maybe<Types.TrackPropertyInput>>
        | Types.Maybe<Types.TrackPropertyInput>;
    threshold_window: Types.Scalars['Int'];
}>;

export type CreateTrackPropertiesAlertMutation = { __typename?: 'Mutation' } & {
    createTrackPropertiesAlert?: Types.Maybe<
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
                >;
                TrackProperties: Array<
                    Types.Maybe<
                        { __typename?: 'TrackProperty' } & Pick<
                            Types.TrackProperty,
                            'id' | 'name' | 'value'
                        >
                    >
                >;
            }
    >;
};

export type UpdateTrackPropertiesAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_alert_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    track_properties:
        | Array<Types.Maybe<Types.TrackPropertyInput>>
        | Types.Maybe<Types.TrackPropertyInput>;
    threshold_window: Types.Scalars['Int'];
    disabled: Types.Scalars['Boolean'];
}>;

export type UpdateTrackPropertiesAlertMutation = { __typename?: 'Mutation' } & {
    updateTrackPropertiesAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            | 'id'
            | 'EmailsToNotify'
            | 'ExcludedEnvironments'
            | 'CountThreshold'
            | 'LastAdminToEditID'
            | 'Name'
            | 'disabled'
        > & {
                ChannelsToNotify: Array<
                    Types.Maybe<
                        { __typename?: 'SanitizedSlackChannel' } & Pick<
                            Types.SanitizedSlackChannel,
                            'webhook_channel' | 'webhook_channel_id'
                        >
                    >
                >;
                TrackProperties: Array<
                    Types.Maybe<
                        { __typename?: 'TrackProperty' } & Pick<
                            Types.TrackProperty,
                            'id' | 'name' | 'value'
                        >
                    >
                >;
            }
    >;
};

export type CreateUserPropertiesAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    user_properties:
        | Array<Types.Maybe<Types.UserPropertyInput>>
        | Types.Maybe<Types.UserPropertyInput>;
    threshold_window: Types.Scalars['Int'];
}>;

export type CreateUserPropertiesAlertMutation = { __typename?: 'Mutation' } & {
    createUserPropertiesAlert?: Types.Maybe<
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
                >;
                UserProperties: Array<
                    Types.Maybe<
                        { __typename?: 'UserProperty' } & Pick<
                            Types.UserProperty,
                            'id' | 'name' | 'value'
                        >
                    >
                >;
            }
    >;
};

export type UpdateUserPropertiesAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_alert_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    emails:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    user_properties:
        | Array<Types.Maybe<Types.UserPropertyInput>>
        | Types.Maybe<Types.UserPropertyInput>;
    threshold_window: Types.Scalars['Int'];
    disabled: Types.Scalars['Boolean'];
}>;

export type UpdateUserPropertiesAlertMutation = { __typename?: 'Mutation' } & {
    updateUserPropertiesAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            | 'id'
            | 'EmailsToNotify'
            | 'ExcludedEnvironments'
            | 'CountThreshold'
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
                >;
                UserProperties: Array<
                    Types.Maybe<
                        { __typename?: 'UserProperty' } & Pick<
                            Types.UserProperty,
                            'id' | 'name' | 'value'
                        >
                    >
                >;
            }
    >;
};

export type UpdateSessionIsPublicMutationVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
    is_public: Types.Scalars['Boolean'];
}>;

export type UpdateSessionIsPublicMutation = { __typename?: 'Mutation' } & {
    updateSessionIsPublic?: Types.Maybe<
        { __typename?: 'Session' } & Pick<
            Types.Session,
            'secure_id' | 'is_public'
        >
    >;
};

export type UpdateErrorGroupIsPublicMutationVariables = Types.Exact<{
    error_group_secure_id: Types.Scalars['String'];
    is_public: Types.Scalars['Boolean'];
}>;

export type UpdateErrorGroupIsPublicMutation = { __typename?: 'Mutation' } & {
    updateErrorGroupIsPublic?: Types.Maybe<
        { __typename?: 'ErrorGroup' } & Pick<
            Types.ErrorGroup,
            'secure_id' | 'is_public'
        >
    >;
};

export type UpdateAllowMeterOverageMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    allow_meter_overage: Types.Scalars['Boolean'];
}>;

export type UpdateAllowMeterOverageMutation = { __typename?: 'Mutation' } & {
    updateAllowMeterOverage?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<
            Types.Workspace,
            'id' | 'allow_meter_overage'
        >
    >;
};

export type SyncSlackIntegrationMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type SyncSlackIntegrationMutation = { __typename?: 'Mutation' } & {
    syncSlackIntegration: { __typename?: 'SlackSyncResponse' } & Pick<
        Types.SlackSyncResponse,
        'success' | 'newChannelsAddedCount'
    >;
};

export type SessionPayloadFragmentFragment = {
    __typename?: 'SessionPayload';
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
                        >;
                    }
            >
        >;
        rage_clicks: Array<
            { __typename?: 'RageClickEvent' } & Pick<
                Types.RageClickEvent,
                'start_timestamp' | 'end_timestamp' | 'total_clicks'
            >
        >;
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
                        >;
                        attachments: Array<
                            Types.Maybe<
                                { __typename?: 'ExternalAttachment' } & Pick<
                                    Types.ExternalAttachment,
                                    'integration_type' | 'external_id' | 'title'
                                >
                            >
                        >;
                    }
            >
        >;
    };

export type GetWebVitalDashboardQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    web_vital_name: Types.Scalars['String'];
    params: Types.WebVitalDashboardParamsInput;
}>;

export type GetWebVitalDashboardQuery = { __typename?: 'Query' } & {
    web_vital_dashboard: Array<
        Types.Maybe<
            { __typename?: 'WebVitalDashboardPayload' } & Pick<
                Types.WebVitalDashboardPayload,
                'date' | 'avg' | 'p50' | 'p75' | 'p90' | 'p99'
            >
        >
    >;
};

export type GetMetricPreviewQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    type: Types.MetricType;
    name: Types.Scalars['String'];
    aggregateFunction: Types.Scalars['String'];
}>;

export type GetMetricPreviewQuery = { __typename?: 'Query' } & {
    metric_preview: Array<
        Types.Maybe<
            { __typename?: 'MetricPreview' } & Pick<
                Types.MetricPreview,
                'value' | 'date'
            >
        >
    >;
};

export type GetSessionPayloadQueryVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
    skip_events: Types.Scalars['Boolean'];
}>;

export type GetSessionPayloadQuery = {
    __typename?: 'Query';
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
                            >;
                        }
                >
            >
        >;
        rage_clicks: Array<
            { __typename?: 'RageClickEvent' } & Pick<
                Types.RageClickEvent,
                'start_timestamp' | 'end_timestamp' | 'total_clicks'
            >
        >;
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
                        >;
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
                        >;
                    }
            >
        >;
    };

export type GetCommentTagsForProjectQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetCommentTagsForProjectQuery = { __typename?: 'Query' } & {
    session_comment_tags_for_project: Array<
        { __typename?: 'SessionCommentTag' } & Pick<
            Types.SessionCommentTag,
            'id' | 'name'
        >
    >;
};

export type GetSessionQueryVariables = Types.Exact<{
    secure_id: Types.Scalars['String'];
}>;

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
            | 'postal'
            | 'fingerprint'
            | 'created_at'
            | 'language'
            | 'user_object'
            | 'user_properties'
            | 'identifier'
            | 'starred'
            | 'enable_strict_privacy'
            | 'enable_recording_network_contents'
            | 'field_group'
            | 'object_storage_enabled'
            | 'payload_size'
            | 'processed'
            | 'has_rage_clicks'
            | 'has_errors'
            | 'within_billing_quota'
            | 'client_version'
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
                >;
            }
    >;
};

export type GetWorkspaceAdminsByProjectIdQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetWorkspaceAdminsByProjectIdQuery = { __typename?: 'Query' } & {
    admins: Array<
        Types.Maybe<
            { __typename?: 'Admin' } & Pick<
                Types.Admin,
                'id' | 'name' | 'email' | 'photo_url' | 'role'
            >
        >
    >;
};

export type GetWorkspaceAdminsQueryVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
}>;

export type GetWorkspaceAdminsQuery = { __typename?: 'Query' } & {
    admins: Array<
        Types.Maybe<
            { __typename?: 'Admin' } & Pick<
                Types.Admin,
                'id' | 'name' | 'email' | 'photo_url' | 'role'
            >
        >
    >;
    workspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<
            Types.Workspace,
            'id' | 'name' | 'secret' | 'allowed_auto_join_email_origins'
        >
    >;
    workspace_invite_links: { __typename?: 'WorkspaceInviteLink' } & Pick<
        Types.WorkspaceInviteLink,
        'id' | 'invitee_email' | 'invitee_role' | 'expiration_date' | 'secret'
    >;
};

export type GetSessionCommentsQueryVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
}>;

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
                    >;
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
                    >;
                }
        >
    >;
};

export type GetNotificationsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

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
                    >;
                }
        >
    >;
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
                    >;
                }
        >
    >;
};

export type GetSessionCommentsForAdminQueryVariables = Types.Exact<{
    [key: string]: never;
}>;

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
                    >;
                }
        >
    >;
};

export type GetErrorCommentsQueryVariables = Types.Exact<{
    error_group_secure_id: Types.Scalars['String'];
}>;

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
                    >;
                    attachments: Array<
                        Types.Maybe<
                            { __typename?: 'ExternalAttachment' } & Pick<
                                Types.ExternalAttachment,
                                'integration_type' | 'external_id' | 'title'
                            >
                        >
                    >;
                }
        >
    >;
};

export type GetEnhancedUserDetailsQueryVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
}>;

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
                >;
            }
    >;
};

export type GetOnboardingStepsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
}>;

export type GetOnboardingStepsQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'isIntegrated' | 'adminHasCreatedComment'
> & {
        workspace?: Types.Maybe<
            { __typename?: 'Workspace' } & Pick<
                Types.Workspace,
                'id' | 'slack_channels'
            >
        >;
        admins: Array<
            Types.Maybe<{ __typename?: 'Admin' } & Pick<Types.Admin, 'id'>>
        >;
        projectHasViewedASession?: Types.Maybe<
            { __typename?: 'Session' } & Pick<Types.Session, 'secure_id'>
        >;
        admin?: Types.Maybe<
            { __typename?: 'Admin' } & Pick<Types.Admin, 'slack_im_channel_id'>
        >;
    };

export type SendAdminWorkspaceInviteMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    email: Types.Scalars['String'];
    base_url: Types.Scalars['String'];
    role: Types.Scalars['String'];
}>;

export type SendAdminWorkspaceInviteMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'sendAdminWorkspaceInvite'>;

export type GetFieldTypesQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetFieldTypesQuery = { __typename?: 'Query' } & {
    field_types: Array<
        { __typename?: 'Field' } & Pick<Types.Field, 'type' | 'name'>
    >;
};

export type GetFieldsOpensearchQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    field_type: Types.Scalars['String'];
    field_name: Types.Scalars['String'];
    query: Types.Scalars['String'];
}>;

export type GetFieldsOpensearchQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'fields_opensearch'
>;

export type GetQuickFieldsOpensearchQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    query: Types.Scalars['String'];
}>;

export type GetQuickFieldsOpensearchQuery = { __typename?: 'Query' } & {
    quickFields_opensearch: Array<
        Types.Maybe<
            { __typename?: 'Field' } & Pick<
                Types.Field,
                'type' | 'name' | 'value'
            >
        >
    >;
};

export type GetErrorFieldsOpensearchQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    field_type: Types.Scalars['String'];
    field_name: Types.Scalars['String'];
    query: Types.Scalars['String'];
}>;

export type GetErrorFieldsOpensearchQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'error_fields_opensearch'
>;

export type GetSessionsOpenSearchQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    query: Types.Scalars['String'];
    sort_desc: Types.Scalars['Boolean'];
}>;

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
                    | 'fingerprint'
                    | 'identifier'
                    | 'os_name'
                    | 'os_version'
                    | 'browser_name'
                    | 'browser_version'
                    | 'city'
                    | 'state'
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
                        >;
                    }
            >;
        };
};

export type GetErrorGroupsOpenSearchQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    query: Types.Scalars['String'];
}>;

export type GetErrorGroupsOpenSearchQuery = { __typename?: 'Query' } & {
    error_groups_opensearch: { __typename?: 'ErrorResults' } & Pick<
        Types.ErrorResults,
        'totalCount'
    > & {
            error_groups: Array<
                { __typename?: 'ErrorGroup' } & Pick<
                    Types.ErrorGroup,
                    | 'created_at'
                    | 'id'
                    | 'secure_id'
                    | 'type'
                    | 'event'
                    | 'state'
                    | 'environments'
                    | 'stack_trace'
                    | 'error_frequency'
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
                        >;
                        metadata_log: Array<
                            Types.Maybe<
                                { __typename?: 'ErrorMetadata' } & Pick<
                                    Types.ErrorMetadata,
                                    | 'error_id'
                                    | 'session_secure_id'
                                    | 'timestamp'
                                >
                            >
                        >;
                    }
            >;
        };
};

export type GetSessionsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    lifecycle: Types.SessionLifecycle;
    starred: Types.Scalars['Boolean'];
    params?: Types.Maybe<Types.SearchParamsInput>;
}>;

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
                    | 'fingerprint'
                    | 'identifier'
                    | 'os_name'
                    | 'os_version'
                    | 'browser_name'
                    | 'browser_version'
                    | 'city'
                    | 'state'
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
                    | 'field_group'
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
                        >;
                    }
            >;
        };
};

export type GetProjectsQueryVariables = Types.Exact<{ [key: string]: never }>;

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
    >;
};

export type GetWorkspaceQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetWorkspaceQuery = { __typename?: 'Query' } & {
    workspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<
            Types.Workspace,
            'id' | 'name' | 'secret'
        > & {
                projects: Array<
                    Types.Maybe<
                        { __typename?: 'Project' } & Pick<
                            Types.Project,
                            'id' | 'name'
                        >
                    >
                >;
            }
    >;
};

export type GetWorkspacesQueryVariables = Types.Exact<{ [key: string]: never }>;

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
    >;
    joinable_workspaces?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Workspace' } & Pick<
                    Types.Workspace,
                    'id' | 'name'
                >
            >
        >
    >;
};

export type GetWorkspacesCountQueryVariables = Types.Exact<{
    [key: string]: never;
}>;

export type GetWorkspacesCountQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'workspaces_count'
>;

export type GetProjectsAndWorkspacesQueryVariables = Types.Exact<{
    [key: string]: never;
}>;

export type GetProjectsAndWorkspacesQuery = { __typename?: 'Query' } & {
    projects?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Project' } & Pick<Types.Project, 'id' | 'name'>
            >
        >
    >;
    workspaces?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Workspace' } & Pick<
                    Types.Workspace,
                    'id' | 'name'
                >
            >
        >
    >;
};

export type GetProjectOrWorkspaceQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    workspace_id: Types.Scalars['ID'];
    is_workspace: Types.Scalars['Boolean'];
}>;

export type GetProjectOrWorkspaceQuery = { __typename?: 'Query' } & {
    project?: Types.Maybe<
        { __typename?: 'Project' } & Pick<
            Types.Project,
            'id' | 'name' | 'billing_email'
        >
    >;
    workspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
    >;
};

export type GetProjectDropdownOptionsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

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
    >;
    workspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'> & {
                projects: Array<
                    Types.Maybe<
                        { __typename?: 'Project' } & Pick<
                            Types.Project,
                            'id' | 'name'
                        >
                    >
                >;
            }
    >;
    workspaces?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Workspace' } & Pick<
                    Types.Workspace,
                    'id' | 'name'
                >
            >
        >
    >;
};

export type GetWorkspaceDropdownOptionsQueryVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
}>;

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
                >;
            }
    >;
    workspaces?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Workspace' } & Pick<
                    Types.Workspace,
                    'id' | 'name'
                >
            >
        >
    >;
};

export type GetAdminQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetAdminQuery = { __typename?: 'Query' } & {
    admin?: Types.Maybe<
        { __typename?: 'Admin' } & Pick<
            Types.Admin,
            | 'id'
            | 'uid'
            | 'name'
            | 'email'
            | 'photo_url'
            | 'slack_im_channel_id'
            | 'role'
            | 'email_verified'
            | 'user_defined_role'
        >
    >;
};

export type GetAdminAboutYouQueryVariables = Types.Exact<{
    [key: string]: never;
}>;

export type GetAdminAboutYouQuery = { __typename?: 'Query' } & {
    admin?: Types.Maybe<
        { __typename?: 'Admin' } & Pick<
            Types.Admin,
            'id' | 'name' | 'user_defined_role' | 'referral'
        >
    >;
};

export type GetProjectQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetProjectQuery = { __typename?: 'Query' } & {
    project?: Types.Maybe<
        { __typename?: 'Project' } & Pick<
            Types.Project,
            'id' | 'name' | 'verbose_id' | 'billing_email'
        >
    >;
    workspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<
            Types.Workspace,
            'id' | 'slack_webhook_channel'
        >
    >;
};

export type GetBillingDetailsForProjectQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetBillingDetailsForProjectQuery = { __typename?: 'Query' } & {
    billingDetailsForProject?: Types.Maybe<
        { __typename?: 'BillingDetails' } & Pick<
            Types.BillingDetails,
            'meter' | 'membersMeter' | 'sessionsOutOfQuota'
        > & {
                plan: { __typename?: 'Plan' } & Pick<
                    Types.Plan,
                    'type' | 'quota' | 'interval' | 'membersLimit'
                >;
            }
    >;
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
    >;
};

export type GetBillingDetailsQueryVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
}>;

export type GetBillingDetailsQuery = { __typename?: 'Query' } & {
    billingDetails: { __typename?: 'BillingDetails' } & Pick<
        Types.BillingDetails,
        'meter' | 'membersMeter'
    > & {
            plan: { __typename?: 'Plan' } & Pick<
                Types.Plan,
                'type' | 'quota' | 'interval' | 'membersLimit'
            >;
        };
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
    >;
};

export type GetSubscriptionDetailsQueryVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
}>;

export type GetSubscriptionDetailsQuery = { __typename?: 'Query' } & {
    subscription_details: { __typename?: 'SubscriptionDetails' } & Pick<
        Types.SubscriptionDetails,
        'baseAmount' | 'discountAmount' | 'discountPercent'
    >;
};

export type GetErrorGroupQueryVariables = Types.Exact<{
    secure_id: Types.Scalars['String'];
}>;

export type GetErrorGroupQuery = { __typename?: 'Query' } & {
    error_group?: Types.Maybe<
        { __typename?: 'ErrorGroup' } & Pick<
            Types.ErrorGroup,
            | 'created_at'
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
                >;
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
                        >
                    >
                >;
                fields?: Types.Maybe<
                    Array<
                        Types.Maybe<
                            { __typename?: 'ErrorField' } & Pick<
                                Types.ErrorField,
                                'name' | 'value'
                            >
                        >
                    >
                >;
            }
    >;
};

export type GetErrorGroupsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    params?: Types.Maybe<Types.ErrorSearchParamsInput>;
}>;

export type GetErrorGroupsQuery = { __typename?: 'Query' } & {
    error_groups?: Types.Maybe<
        { __typename?: 'ErrorResults' } & Pick<
            Types.ErrorResults,
            'totalCount'
        > & {
                error_groups: Array<
                    { __typename?: 'ErrorGroup' } & Pick<
                        Types.ErrorGroup,
                        | 'created_at'
                        | 'id'
                        | 'secure_id'
                        | 'type'
                        | 'event'
                        | 'state'
                        | 'environments'
                        | 'stack_trace'
                        | 'error_frequency'
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
                            >;
                            metadata_log: Array<
                                Types.Maybe<
                                    { __typename?: 'ErrorMetadata' } & Pick<
                                        Types.ErrorMetadata,
                                        | 'error_id'
                                        | 'session_secure_id'
                                        | 'timestamp'
                                    >
                                >
                            >;
                        }
                >;
            }
    >;
};

export type GetMessagesQueryVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
}>;

export type GetMessagesQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'messages'
>;

export type GetResourcesQueryVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
}>;

export type GetResourcesQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'resources'
>;

export type GetFieldSuggestionQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    query: Types.Scalars['String'];
}>;

export type GetFieldSuggestionQuery = { __typename?: 'Query' } & {
    field_suggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
            >
        >
    >;
};

export type GetEnvironmentsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetEnvironmentsQuery = { __typename?: 'Query' } & {
    environment_suggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
            >
        >
    >;
};

export type GetAppVersionsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetAppVersionsQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'app_version_suggestion'
>;

export type GetProjectSuggestionQueryVariables = Types.Exact<{
    query: Types.Scalars['String'];
}>;

export type GetProjectSuggestionQuery = { __typename?: 'Query' } & {
    projectSuggestion: Array<
        Types.Maybe<
            { __typename?: 'Project' } & Pick<
                Types.Project,
                'id' | 'name' | 'workspace_id'
            >
        >
    >;
    workspaceSuggestion: Array<
        Types.Maybe<
            { __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
        >
    >;
};

export type GetErrorFieldSuggestionQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    query: Types.Scalars['String'];
}>;

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
    >;
};

export type GetErrorSearchSuggestionsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    query: Types.Scalars['String'];
}>;

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
    >;
    fields?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'ErrorField' } & Pick<
                    Types.ErrorField,
                    'name' | 'value'
                >
            >
        >
    >;
};

export type GetSessionSearchResultsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    query: Types.Scalars['String'];
}>;

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
    >;
    userProperties?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<
                    Types.Field,
                    'id' | 'name' | 'value'
                >
            >
        >
    >;
    visitedUrls?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<
                    Types.Field,
                    'id' | 'name' | 'value'
                >
            >
        >
    >;
    referrers?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<
                    Types.Field,
                    'id' | 'name' | 'value'
                >
            >
        >
    >;
};

export type GetTrackSuggestionQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    query: Types.Scalars['String'];
}>;

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
    >;
};

export type GetUserSuggestionQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    query: Types.Scalars['String'];
}>;

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
    >;
};

export type GetSegmentsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

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
                                                __typename?: 'UserProperty';
                                            } & Pick<
                                                Types.UserProperty,
                                                'name' | 'value'
                                            >
                                        >
                                    >
                                >;
                                excluded_properties?: Types.Maybe<
                                    Array<
                                        Types.Maybe<
                                            {
                                                __typename?: 'UserProperty';
                                            } & Pick<
                                                Types.UserProperty,
                                                'name' | 'value'
                                            >
                                        >
                                    >
                                >;
                                track_properties?: Types.Maybe<
                                    Array<
                                        Types.Maybe<
                                            {
                                                __typename?: 'UserProperty';
                                            } & Pick<
                                                Types.UserProperty,
                                                'name' | 'value'
                                            >
                                        >
                                    >
                                >;
                                date_range?: Types.Maybe<
                                    { __typename?: 'DateRange' } & Pick<
                                        Types.DateRange,
                                        'start_date' | 'end_date'
                                    >
                                >;
                                length_range?: Types.Maybe<
                                    { __typename?: 'LengthRange' } & Pick<
                                        Types.LengthRange,
                                        'min' | 'max'
                                    >
                                >;
                            };
                    }
            >
        >
    >;
};

export type GetErrorSegmentsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

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
                                >;
                            };
                    }
            >
        >
    >;
};

export type IsIntegratedQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type IsIntegratedQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'isIntegrated'
>;

export type UnprocessedSessionsCountQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type UnprocessedSessionsCountQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'unprocessedSessionsCount'
>;

export type GetKeyPerformanceIndicatorsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

export type GetKeyPerformanceIndicatorsQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'unprocessedSessionsCount' | 'liveUsersCount'
> & {
        newUsersCount?: Types.Maybe<
            { __typename?: 'NewUsersCount' } & Pick<
                Types.NewUsersCount,
                'count'
            >
        >;
        averageSessionLength?: Types.Maybe<
            { __typename?: 'AverageSessionLength' } & Pick<
                Types.AverageSessionLength,
                'length'
            >
        >;
        userFingerprintCount?: Types.Maybe<
            { __typename?: 'UserFingerprintCount' } & Pick<
                Types.UserFingerprintCount,
                'count'
            >
        >;
    };

export type GetReferrersCountQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

export type GetReferrersCountQuery = { __typename?: 'Query' } & {
    referrers: Array<
        Types.Maybe<
            { __typename?: 'ReferrerTablePayload' } & Pick<
                Types.ReferrerTablePayload,
                'host' | 'count' | 'percent'
            >
        >
    >;
};

export type GetNewUsersCountQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

export type GetNewUsersCountQuery = { __typename?: 'Query' } & {
    newUsersCount?: Types.Maybe<
        { __typename?: 'NewUsersCount' } & Pick<Types.NewUsersCount, 'count'>
    >;
};

export type GetAverageSessionLengthQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

export type GetAverageSessionLengthQuery = { __typename?: 'Query' } & {
    averageSessionLength?: Types.Maybe<
        { __typename?: 'AverageSessionLength' } & Pick<
            Types.AverageSessionLength,
            'length'
        >
    >;
};

export type GetTopUsersQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

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
    >;
};

export type GetDailySessionsCountQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    date_range: Types.DateRangeInput;
}>;

export type GetDailySessionsCountQuery = { __typename?: 'Query' } & {
    dailySessionsCount: Array<
        Types.Maybe<
            { __typename?: 'DailySessionCount' } & Pick<
                Types.DailySessionCount,
                'date' | 'count'
            >
        >
    >;
};

export type GetDailyErrorsCountQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    date_range: Types.DateRangeInput;
}>;

export type GetDailyErrorsCountQuery = { __typename?: 'Query' } & {
    dailyErrorsCount: Array<
        Types.Maybe<
            { __typename?: 'DailyErrorCount' } & Pick<
                Types.DailyErrorCount,
                'date' | 'count'
            >
        >
    >;
};

export type GetRageClicksForProjectQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

export type GetRageClicksForProjectQuery = { __typename?: 'Query' } & {
    rageClicksForProject: Array<
        { __typename?: 'RageClickEventForProject' } & Pick<
            Types.RageClickEventForProject,
            | 'identifier'
            | 'session_secure_id'
            | 'total_clicks'
            | 'user_properties'
        >
    >;
};

export type GetDailyErrorFrequencyQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    error_group_secure_id: Types.Scalars['String'];
    date_offset: Types.Scalars['Int'];
}>;

export type GetDailyErrorFrequencyQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'dailyErrorFrequency'
>;

export type GetErrorDistributionQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    error_group_secure_id: Types.Scalars['String'];
    property: Types.Scalars['String'];
}>;

export type GetErrorDistributionQuery = { __typename?: 'Query' } & {
    errorDistribution: Array<
        Types.Maybe<
            { __typename?: 'ErrorDistributionItem' } & Pick<
                Types.ErrorDistributionItem,
                'name' | 'value'
            >
        >
    >;
};

export type GetSlackChannelSuggestionQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetSlackChannelSuggestionQuery = { __typename?: 'Query' } & {
    slack_channel_suggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'SanitizedSlackChannel' } & Pick<
                    Types.SanitizedSlackChannel,
                    'webhook_channel' | 'webhook_channel_id'
                >
            >
        >
    >;
};

export type GetWorkspaceIsIntegratedWithSlackQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetWorkspaceIsIntegratedWithSlackQuery = {
    __typename?: 'Query';
} & { is_integrated_with_slack: Types.Query['is_integrated_with'] };

export type GetWorkspaceIsIntegratedWithLinearQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetWorkspaceIsIntegratedWithLinearQuery = {
    __typename?: 'Query';
} & { is_integrated_with_linear: Types.Query['is_integrated_with'] };

export type GetAlertsPagePayloadQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetAlertsPagePayloadQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'identifier_suggestion'
> & { is_integrated_with_slack: Types.Query['is_integrated_with'] } & {
        slack_channel_suggestion?: Types.Maybe<
            Array<
                Types.Maybe<
                    { __typename?: 'SanitizedSlackChannel' } & Pick<
                        Types.SanitizedSlackChannel,
                        'webhook_channel' | 'webhook_channel_id'
                    >
                >
            >
        >;
        admins: Array<
            Types.Maybe<
                { __typename?: 'Admin' } & Pick<
                    Types.Admin,
                    'id' | 'name' | 'email' | 'photo_url'
                >
            >
        >;
        environment_suggestion?: Types.Maybe<
            Array<
                Types.Maybe<
                    { __typename?: 'Field' } & Pick<
                        Types.Field,
                        'name' | 'value'
                    >
                >
            >
        >;
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
                        >;
                    }
            >
        >;
        session_feedback_alerts: Array<
            Types.Maybe<
                { __typename?: 'SessionAlert' } & Pick<
                    Types.SessionAlert,
                    | 'EmailsToNotify'
                    | 'updated_at'
                    | 'ExcludedEnvironments'
                    | 'CountThreshold'
                    | 'ThresholdWindow'
                    | 'LastAdminToEditID'
                    | 'id'
                    | 'Name'
                    | 'Type'
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
                        >;
                    }
            >
        >;
        new_session_alerts: Array<
            Types.Maybe<
                { __typename?: 'SessionAlert' } & Pick<
                    Types.SessionAlert,
                    | 'EmailsToNotify'
                    | 'ExcludedEnvironments'
                    | 'CountThreshold'
                    | 'ThresholdWindow'
                    | 'updated_at'
                    | 'LastAdminToEditID'
                    | 'Name'
                    | 'id'
                    | 'Type'
                    | 'ExcludeRules'
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
                        >;
                    }
            >
        >;
        rage_click_alerts: Array<
            Types.Maybe<
                { __typename?: 'SessionAlert' } & Pick<
                    Types.SessionAlert,
                    | 'id'
                    | 'EmailsToNotify'
                    | 'ExcludedEnvironments'
                    | 'CountThreshold'
                    | 'ThresholdWindow'
                    | 'updated_at'
                    | 'LastAdminToEditID'
                    | 'Name'
                    | 'Type'
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
                        >;
                    }
            >
        >;
        new_user_alerts?: Types.Maybe<
            Array<
                Types.Maybe<
                    { __typename?: 'SessionAlert' } & Pick<
                        Types.SessionAlert,
                        | 'id'
                        | 'EmailsToNotify'
                        | 'ExcludedEnvironments'
                        | 'CountThreshold'
                        | 'updated_at'
                        | 'LastAdminToEditID'
                        | 'Name'
                        | 'Type'
                        | 'DailyFrequency'
                        | 'disabled'
                    > & {
                            ChannelsToNotify: Array<
                                Types.Maybe<
                                    {
                                        __typename?: 'SanitizedSlackChannel';
                                    } & Pick<
                                        Types.SanitizedSlackChannel,
                                        'webhook_channel' | 'webhook_channel_id'
                                    >
                                >
                            >;
                        }
                >
            >
        >;
        track_properties_alerts: Array<
            Types.Maybe<
                { __typename?: 'SessionAlert' } & Pick<
                    Types.SessionAlert,
                    | 'id'
                    | 'EmailsToNotify'
                    | 'ExcludedEnvironments'
                    | 'updated_at'
                    | 'LastAdminToEditID'
                    | 'CountThreshold'
                    | 'Name'
                    | 'Type'
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
                        >;
                        TrackProperties: Array<
                            Types.Maybe<
                                { __typename?: 'TrackProperty' } & Pick<
                                    Types.TrackProperty,
                                    'id' | 'name' | 'value'
                                >
                            >
                        >;
                    }
            >
        >;
        user_properties_alerts: Array<
            Types.Maybe<
                { __typename?: 'SessionAlert' } & Pick<
                    Types.SessionAlert,
                    | 'id'
                    | 'EmailsToNotify'
                    | 'ExcludedEnvironments'
                    | 'updated_at'
                    | 'LastAdminToEditID'
                    | 'CountThreshold'
                    | 'Name'
                    | 'Type'
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
                        >;
                        UserProperties: Array<
                            Types.Maybe<
                                { __typename?: 'UserProperty' } & Pick<
                                    Types.UserProperty,
                                    'id' | 'name' | 'value'
                                >
                            >
                        >;
                    }
            >
        >;
        metric_monitors: Array<
            Types.Maybe<
                { __typename?: 'MetricMonitor' } & Pick<
                    Types.MetricMonitor,
                    | 'id'
                    | 'updated_at'
                    | 'name'
                    | 'emails_to_notify'
                    | 'function'
                    | 'metric_to_monitor'
                    | 'last_admin_to_edit_id'
                    | 'threshold'
                    | 'disabled'
                > & {
                        channels_to_notify: Array<
                            Types.Maybe<
                                { __typename?: 'SanitizedSlackChannel' } & Pick<
                                    Types.SanitizedSlackChannel,
                                    'webhook_channel' | 'webhook_channel_id'
                                >
                            >
                        >;
                    }
            >
        >;
    };

export type GetCommentMentionSuggestionsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetCommentMentionSuggestionsQuery = { __typename?: 'Query' } & {
    admins: Array<
        Types.Maybe<
            { __typename?: 'Admin' } & Pick<
                Types.Admin,
                'id' | 'name' | 'email' | 'photo_url'
            >
        >
    >;
    slack_members: Array<
        Types.Maybe<
            { __typename?: 'SanitizedSlackChannel' } & Pick<
                Types.SanitizedSlackChannel,
                'webhook_channel' | 'webhook_channel_id'
            >
        >
    >;
};

export type GetCustomerPortalUrlQueryVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
}>;

export type GetCustomerPortalUrlQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'customer_portal_url'
>;

export type OnSessionPayloadAppendedSubscriptionVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
    initial_events_count: Types.Scalars['Int'];
}>;

export type OnSessionPayloadAppendedSubscription = {
    __typename?: 'Subscription';
} & {
    session_payload_appended?: Types.Maybe<
        { __typename?: 'SessionPayload' } & SessionPayloadFragmentFragment
    >;
};

export type GetWebVitalsQueryVariables = Types.Exact<{
    session_secure_id: Types.Scalars['String'];
}>;

export type GetWebVitalsQuery = { __typename?: 'Query' } & {
    web_vitals: Array<
        { __typename?: 'Metric' } & Pick<Types.Metric, 'name' | 'value'>
    >;
};

export const namedOperations = {
    Query: {
        GetWebVitalDashboard: 'GetWebVitalDashboard' as const,
        GetMetricPreview: 'GetMetricPreview' as const,
        GetSessionPayload: 'GetSessionPayload' as const,
        GetCommentTagsForProject: 'GetCommentTagsForProject' as const,
        GetSession: 'GetSession' as const,
        GetWorkspaceAdminsByProjectId: 'GetWorkspaceAdminsByProjectId' as const,
        GetWorkspaceAdmins: 'GetWorkspaceAdmins' as const,
        GetSessionComments: 'GetSessionComments' as const,
        GetNotifications: 'GetNotifications' as const,
        GetSessionCommentsForAdmin: 'GetSessionCommentsForAdmin' as const,
        GetErrorComments: 'GetErrorComments' as const,
        GetEnhancedUserDetails: 'GetEnhancedUserDetails' as const,
        GetOnboardingSteps: 'GetOnboardingSteps' as const,
        GetFieldTypes: 'GetFieldTypes' as const,
        GetFieldsOpensearch: 'GetFieldsOpensearch' as const,
        GetQuickFieldsOpensearch: 'GetQuickFieldsOpensearch' as const,
        GetErrorFieldsOpensearch: 'GetErrorFieldsOpensearch' as const,
        GetSessionsOpenSearch: 'GetSessionsOpenSearch' as const,
        GetErrorGroupsOpenSearch: 'GetErrorGroupsOpenSearch' as const,
        GetSessions: 'GetSessions' as const,
        GetProjects: 'GetProjects' as const,
        GetWorkspace: 'GetWorkspace' as const,
        GetWorkspaces: 'GetWorkspaces' as const,
        GetWorkspacesCount: 'GetWorkspacesCount' as const,
        GetProjectsAndWorkspaces: 'GetProjectsAndWorkspaces' as const,
        GetProjectOrWorkspace: 'GetProjectOrWorkspace' as const,
        GetProjectDropdownOptions: 'GetProjectDropdownOptions' as const,
        GetWorkspaceDropdownOptions: 'GetWorkspaceDropdownOptions' as const,
        GetAdmin: 'GetAdmin' as const,
        GetAdminAboutYou: 'GetAdminAboutYou' as const,
        GetProject: 'GetProject' as const,
        GetBillingDetailsForProject: 'GetBillingDetailsForProject' as const,
        GetBillingDetails: 'GetBillingDetails' as const,
        GetSubscriptionDetails: 'GetSubscriptionDetails' as const,
        GetErrorGroup: 'GetErrorGroup' as const,
        GetErrorGroups: 'GetErrorGroups' as const,
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
        UnprocessedSessionsCount: 'UnprocessedSessionsCount' as const,
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
        GetWorkspaceIsIntegratedWithSlack: 'GetWorkspaceIsIntegratedWithSlack' as const,
        GetWorkspaceIsIntegratedWithLinear: 'GetWorkspaceIsIntegratedWithLinear' as const,
        GetAlertsPagePayload: 'GetAlertsPagePayload' as const,
        GetCommentMentionSuggestions: 'GetCommentMentionSuggestions' as const,
        GetCustomerPortalURL: 'GetCustomerPortalURL' as const,
        GetWebVitals: 'GetWebVitals' as const,
    },
    Mutation: {
        MarkSessionAsViewed: 'MarkSessionAsViewed' as const,
        MarkSessionAsStarred: 'MarkSessionAsStarred' as const,
        CreateOrUpdateStripeSubscription: 'CreateOrUpdateStripeSubscription' as const,
        UpdateBillingDetails: 'UpdateBillingDetails' as const,
        updateErrorGroupState: 'updateErrorGroupState' as const,
        SendEmailSignup: 'SendEmailSignup' as const,
        AddAdminToWorkspace: 'AddAdminToWorkspace' as const,
        JoinWorkspace: 'JoinWorkspace' as const,
        ChangeAdminRole: 'ChangeAdminRole' as const,
        DeleteAdminFromProject: 'DeleteAdminFromProject' as const,
        DeleteAdminFromWorkspace: 'DeleteAdminFromWorkspace' as const,
        OpenSlackConversation: 'OpenSlackConversation' as const,
        AddIntegrationToProject: 'AddIntegrationToProject' as const,
        RemoveIntegrationFromProject: 'RemoveIntegrationFromProject' as const,
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
        CreateErrorComment: 'CreateErrorComment' as const,
        CreateIssueForErrorComment: 'CreateIssueForErrorComment' as const,
        DeleteErrorComment: 'DeleteErrorComment' as const,
        DeleteErrorSegment: 'DeleteErrorSegment' as const,
        EditErrorSegment: 'EditErrorSegment' as const,
        CreateErrorSegment: 'CreateErrorSegment' as const,
        CreateErrorAlert: 'CreateErrorAlert' as const,
        CreateMetricMonitor: 'CreateMetricMonitor' as const,
        UpdateMetricMonitor: 'UpdateMetricMonitor' as const,
        DeleteMetricMonitor: 'DeleteMetricMonitor' as const,
        UpdateAdminAboutYouDetails: 'UpdateAdminAboutYouDetails' as const,
        CreateRageClickAlert: 'CreateRageClickAlert' as const,
        UpdateErrorAlert: 'UpdateErrorAlert' as const,
        DeleteErrorAlert: 'DeleteErrorAlert' as const,
        DeleteSessionAlert: 'DeleteSessionAlert' as const,
        CreateDefaultAlerts: 'CreateDefaultAlerts' as const,
        CreateSessionFeedbackAlert: 'CreateSessionFeedbackAlert' as const,
        UpdateSessionFeedbackAlert: 'UpdateSessionFeedbackAlert' as const,
        CreateNewUserAlert: 'CreateNewUserAlert' as const,
        CreateNewSessionAlert: 'CreateNewSessionAlert' as const,
        UpdateNewSessionAlert: 'UpdateNewSessionAlert' as const,
        UpdateRageClickAlert: 'UpdateRageClickAlert' as const,
        UpdateNewUserAlert: 'UpdateNewUserAlert' as const,
        CreateTrackPropertiesAlert: 'CreateTrackPropertiesAlert' as const,
        UpdateTrackPropertiesAlert: 'UpdateTrackPropertiesAlert' as const,
        CreateUserPropertiesAlert: 'CreateUserPropertiesAlert' as const,
        UpdateUserPropertiesAlert: 'UpdateUserPropertiesAlert' as const,
        UpdateSessionIsPublic: 'UpdateSessionIsPublic' as const,
        UpdateErrorGroupIsPublic: 'UpdateErrorGroupIsPublic' as const,
        UpdateAllowMeterOverage: 'UpdateAllowMeterOverage' as const,
        SyncSlackIntegration: 'SyncSlackIntegration' as const,
        SendAdminWorkspaceInvite: 'SendAdminWorkspaceInvite' as const,
    },
    Subscription: {
        OnSessionPayloadAppended: 'OnSessionPayloadAppended' as const,
    },
    Fragment: {
        SessionPayloadFragment: 'SessionPayloadFragment' as const,
    },
};
