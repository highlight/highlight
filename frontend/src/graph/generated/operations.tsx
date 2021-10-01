import * as Types from './schemas';

export type MarkSessionAsViewedMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
    viewed: Types.Scalars['Boolean'];
}>;

export type MarkSessionAsViewedMutation = { __typename?: 'Mutation' } & {
    markSessionAsViewed?: Types.Maybe<
        { __typename?: 'Session' } & Pick<Types.Session, 'id' | 'viewed'>
    >;
};

export type MarkSessionAsStarredMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
    starred: Types.Scalars['Boolean'];
}>;

export type MarkSessionAsStarredMutation = { __typename?: 'Mutation' } & {
    markSessionAsStarred?: Types.Maybe<
        { __typename?: 'Session' } & Pick<Types.Session, 'id' | 'starred'>
    >;
};

export type CreateOrUpdateStripeSubscriptionMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    plan_type: Types.PlanType;
}>;

export type CreateOrUpdateStripeSubscriptionMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'createOrUpdateStripeSubscription'>;

export type UpdateBillingDetailsMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type UpdateBillingDetailsMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'updateBillingDetails'
>;

export type UpdateErrorGroupStateMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
    state: Types.Scalars['String'];
}>;

export type UpdateErrorGroupStateMutation = { __typename?: 'Mutation' } & {
    updateErrorGroupState?: Types.Maybe<
        { __typename?: 'ErrorGroup' } & Pick<Types.ErrorGroup, 'id' | 'state'>
    >;
};

export type SendEmailSignupMutationVariables = Types.Exact<{
    email: Types.Scalars['String'];
}>;

export type SendEmailSignupMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'emailSignup'
>;

export type AddAdminToProjectMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    invite_id: Types.Scalars['String'];
}>;

export type AddAdminToProjectMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'addAdminToProject'
>;

export type AddAdminToWorkspaceMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    invite_id: Types.Scalars['String'];
}>;

export type AddAdminToWorkspaceMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'addAdminToWorkspace'
>;

export type DeleteAdminFromProjectMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
}>;

export type DeleteAdminFromProjectMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteAdminFromProject'
>;

export type OpenSlackConversationMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    code: Types.Scalars['String'];
    redirect_path: Types.Scalars['String'];
}>;

export type OpenSlackConversationMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'openSlackConversation'
>;

export type AddSlackBotIntegrationToProjectMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    code: Types.Scalars['String'];
    redirect_path: Types.Scalars['String'];
}>;

export type AddSlackBotIntegrationToProjectMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'addSlackBotIntegrationToProject'>;

export type CreateProjectMutationVariables = Types.Exact<{
    project_name: Types.Scalars['String'];
    workspace_id?: Types.Maybe<Types.Scalars['ID']>;
    workspace_name?: Types.Maybe<Types.Scalars['String']>;
}>;

export type CreateProjectMutation = { __typename?: 'Mutation' } & {
    createProject?: Types.Maybe<
        { __typename?: 'Project' } & Pick<Types.Project, 'id' | 'name'>
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
            'name' | 'billing_email'
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
        { __typename?: 'Workspace' } & Pick<Types.Workspace, 'name'>
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
    session_id: Types.Scalars['ID'];
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
    error_group_id: Types.Scalars['ID'];
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

export type UpdateErrorAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    error_alert_id: Types.Scalars['ID'];
    count_threshold: Types.Scalars['Int'];
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
}>;

export type UpdateErrorAlertMutation = { __typename?: 'Mutation' } & {
    updateErrorAlert?: Types.Maybe<
        { __typename?: 'ErrorAlert' } & Pick<
            Types.ErrorAlert,
            'ExcludedEnvironments' | 'CountThreshold' | 'ThresholdWindow'
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
    threshold_window: Types.Scalars['Int'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
}>;

export type UpdateSessionFeedbackAlertMutation = { __typename?: 'Mutation' } & {
    updateSessionFeedbackAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            'ExcludedEnvironments' | 'CountThreshold' | 'ThresholdWindow'
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
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
}>;

export type UpdateNewUserAlertMutation = { __typename?: 'Mutation' } & {
    updateNewUserAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            'ExcludedEnvironments' | 'CountThreshold'
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

export type UpdateTrackPropertiesAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_alert_id: Types.Scalars['ID'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    track_properties:
        | Array<Types.Maybe<Types.TrackPropertyInput>>
        | Types.Maybe<Types.TrackPropertyInput>;
}>;

export type UpdateTrackPropertiesAlertMutation = { __typename?: 'Mutation' } & {
    updateTrackPropertiesAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            'ExcludedEnvironments' | 'CountThreshold'
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

export type UpdateUserPropertiesAlertMutationVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    session_alert_id: Types.Scalars['ID'];
    slack_channels:
        | Array<Types.Maybe<Types.SanitizedSlackChannelInput>>
        | Types.Maybe<Types.SanitizedSlackChannelInput>;
    environments:
        | Array<Types.Maybe<Types.Scalars['String']>>
        | Types.Maybe<Types.Scalars['String']>;
    user_properties:
        | Array<Types.Maybe<Types.UserPropertyInput>>
        | Types.Maybe<Types.UserPropertyInput>;
}>;

export type UpdateUserPropertiesAlertMutation = { __typename?: 'Mutation' } & {
    updateUserPropertiesAlert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            'ExcludedEnvironments' | 'CountThreshold'
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

export type UpdateSessionIsPublicMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    is_public: Types.Scalars['Boolean'];
}>;

export type UpdateSessionIsPublicMutation = { __typename?: 'Mutation' } & {
    updateSessionIsPublic?: Types.Maybe<
        { __typename?: 'Session' } & Pick<Types.Session, 'id' | 'is_public'>
    >;
};

export type UpdateErrorGroupIsPublicMutationVariables = Types.Exact<{
    error_group_id: Types.Scalars['ID'];
    is_public: Types.Scalars['Boolean'];
}>;

export type UpdateErrorGroupIsPublicMutation = { __typename?: 'Mutation' } & {
    updateErrorGroupIsPublic?: Types.Maybe<
        { __typename?: 'ErrorGroup' } & Pick<
            Types.ErrorGroup,
            'id' | 'is_public'
        >
    >;
};

export type GetSessionPayloadQueryVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
}>;

export type GetSessionPayloadQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'events'
> & {
        errors?: Types.Maybe<
            Array<
                Types.Maybe<
                    { __typename?: 'ErrorObject' } & ErrorFieldsFragment
                >
            >
        >;
    };

export type GetSessionQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetSessionQuery = { __typename?: 'Query' } & {
    session?: Types.Maybe<
        { __typename?: 'Session' } & Pick<
            Types.Session,
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
            | 'identifier'
            | 'starred'
            | 'enable_strict_privacy'
            | 'enable_recording_network_contents'
            | 'field_group'
            | 'object_storage_enabled'
            | 'payload_size'
            | 'within_billing_quota'
            | 'client_version'
            | 'is_public'
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

export type GetProjectAdminsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetProjectAdminsQuery = { __typename?: 'Query' } & {
    admins: Array<
        Types.Maybe<
            { __typename?: 'Admin' } & Pick<
                Types.Admin,
                'id' | 'name' | 'email' | 'photo_url' | 'role'
            >
        >
    >;
};

export type GetSessionCommentsQueryVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
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
                | 'text'
                | 'type'
                | 'metadata'
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
                'id' | 'updated_at' | 'project_id' | 'text' | 'error_id'
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
    error_group_id: Types.Scalars['ID'];
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
                }
        >
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
                'slack_channels'
            >
        >;
        admins: Array<
            Types.Maybe<{ __typename?: 'Admin' } & Pick<Types.Admin, 'id'>>
        >;
        projectHasViewedASession?: Types.Maybe<
            { __typename?: 'Session' } & Pick<Types.Session, 'id'>
        >;
        admin?: Types.Maybe<
            { __typename?: 'Admin' } & Pick<Types.Admin, 'slack_im_channel_id'>
        >;
    };

export type SendAdminWorkspaceInviteMutationVariables = Types.Exact<{
    workspace_id: Types.Scalars['ID'];
    email: Types.Scalars['String'];
    base_url: Types.Scalars['String'];
}>;

export type SendAdminWorkspaceInviteMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'sendAdminWorkspaceInvite'>;

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
                    | 'field_group'
                    | 'first_time'
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
};

export type GetVisibleProjectsAndWorkspacesQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetVisibleProjectsAndWorkspacesQuery = { __typename?: 'Query' } & {
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
    projects?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Project' } & Pick<Types.Project, 'id' | 'name'>
            >
        >
    >;
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
        { __typename?: 'Workspace' } & Pick<
            Types.Workspace,
            'slack_webhook_channel' | 'secret'
        >
    >;
};

export type GetAdminQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetAdminQuery = { __typename?: 'Query' } & {
    admin?: Types.Maybe<
        { __typename?: 'Admin' } & Pick<
            Types.Admin,
            | 'id'
            | 'name'
            | 'email'
            | 'photo_url'
            | 'slack_im_channel_id'
            | 'role'
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
            'id' | 'name' | 'verbose_id' | 'billing_email' | 'secret'
        >
    >;
    workspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<
            Types.Workspace,
            'id' | 'slack_webhook_channel' | 'secret'
        >
    >;
};

export type GetWorkspaceForProjectQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetWorkspaceForProjectQuery = { __typename?: 'Query' } & {
    workspace?: Types.Maybe<
        { __typename?: 'Workspace' } & Pick<Types.Workspace, 'id' | 'name'>
    >;
};

export type GetBillingDetailsQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetBillingDetailsQuery = { __typename?: 'Query' } & {
    billingDetails: { __typename?: 'BillingDetails' } & Pick<
        Types.BillingDetails,
        'meter' | 'sessionsOutOfQuota'
    > & { plan: { __typename?: 'Plan' } & Pick<Types.Plan, 'type' | 'quota'> };
    project?: Types.Maybe<
        { __typename?: 'Project' } & Pick<
            Types.Project,
            'id' | 'trial_end_date'
        >
    >;
};

export type GetErrorGroupQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
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
            | 'error_frequency'
            | 'is_public'
        > & {
                stack_trace: Array<
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
                            | 'session_id'
                            | 'environment'
                            | 'timestamp'
                            | 'os'
                            | 'browser'
                            | 'visited_url'
                            | 'fingerprint'
                            | 'identifier'
                        >
                    >
                >;
                field_group?: Types.Maybe<
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
                        | 'type'
                        | 'event'
                        | 'state'
                        | 'environments'
                        | 'error_frequency'
                    > & {
                            stack_trace: Array<
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
                                        'error_id' | 'session_id' | 'timestamp'
                                    >
                                >
                            >;
                        }
                >;
            }
    >;
};

export type GetMessagesQueryVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
}>;

export type GetMessagesQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'messages'
>;

export type GetResourcesQueryVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
}>;

export type GetResourcesQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'resources'
>;

export type ErrorFieldsFragment = { __typename?: 'ErrorObject' } & Pick<
    Types.ErrorObject,
    | 'id'
    | 'error_group_id'
    | 'event'
    | 'type'
    | 'url'
    | 'source'
    | 'stack_trace'
    | 'timestamp'
    | 'payload'
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

export type GetProjectSuggestionQueryVariables = Types.Exact<{
    query: Types.Scalars['String'];
}>;

export type GetProjectSuggestionQuery = { __typename?: 'Query' } & {
    projectSuggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Project' } & Pick<Types.Project, 'id' | 'name'>
            >
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
                            'os' | 'browser' | 'visited_url' | 'state' | 'event'
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
    'unprocessedSessionsCount'
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

export type GetDailyErrorFrequencyQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
    error_group_id: Types.Scalars['ID'];
    date_offset: Types.Scalars['Int'];
}>;

export type GetDailyErrorFrequencyQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'dailyErrorFrequency'
>;

export type GetErrorAlertQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetErrorAlertQuery = { __typename?: 'Query' } & {
    error_alert?: Types.Maybe<
        { __typename?: 'ErrorAlert' } & Pick<
            Types.ErrorAlert,
            'ExcludedEnvironments' | 'CountThreshold'
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

export type GetNewUserAlertQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetNewUserAlertQuery = { __typename?: 'Query' } & {
    new_user_alert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            'ExcludedEnvironments' | 'CountThreshold'
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

export type GetTrackPropertiesAlertQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetTrackPropertiesAlertQuery = { __typename?: 'Query' } & {
    track_properties_alert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            'ExcludedEnvironments' | 'CountThreshold'
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

export type GetUserPropertiesAlertQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetUserPropertiesAlertQuery = { __typename?: 'Query' } & {
    user_properties_alert?: Types.Maybe<
        { __typename?: 'SessionAlert' } & Pick<
            Types.SessionAlert,
            'ExcludedEnvironments' | 'CountThreshold'
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

export type GetEnvironmentSuggestionQueryVariables = Types.Exact<{
    query: Types.Scalars['String'];
    project_id: Types.Scalars['ID'];
}>;

export type GetEnvironmentSuggestionQuery = { __typename?: 'Query' } & {
    environment_suggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
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

export type GetAlertsPagePayloadQueryVariables = Types.Exact<{
    project_id: Types.Scalars['ID'];
}>;

export type GetAlertsPagePayloadQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'is_integrated_with_slack'
> & {
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
        error_alert?: Types.Maybe<
            { __typename?: 'ErrorAlert' } & Pick<
                Types.ErrorAlert,
                | 'ExcludedEnvironments'
                | 'CountThreshold'
                | 'ThresholdWindow'
                | 'id'
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
        session_feedback_alert?: Types.Maybe<
            { __typename?: 'SessionAlert' } & Pick<
                Types.SessionAlert,
                | 'ExcludedEnvironments'
                | 'CountThreshold'
                | 'ThresholdWindow'
                | 'id'
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
        new_user_alert?: Types.Maybe<
            { __typename?: 'SessionAlert' } & Pick<
                Types.SessionAlert,
                'id' | 'ExcludedEnvironments' | 'CountThreshold'
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
        track_properties_alert?: Types.Maybe<
            { __typename?: 'SessionAlert' } & Pick<
                Types.SessionAlert,
                'id' | 'ExcludedEnvironments' | 'CountThreshold'
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
        user_properties_alert?: Types.Maybe<
            { __typename?: 'SessionAlert' } & Pick<
                Types.SessionAlert,
                'id' | 'ExcludedEnvironments' | 'CountThreshold'
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

export const namedOperations = {
    Query: {
        GetSessionPayload: 'GetSessionPayload' as const,
        GetSession: 'GetSession' as const,
        GetProjectAdmins: 'GetProjectAdmins' as const,
        GetSessionComments: 'GetSessionComments' as const,
        GetNotifications: 'GetNotifications' as const,
        GetSessionCommentsForAdmin: 'GetSessionCommentsForAdmin' as const,
        GetErrorComments: 'GetErrorComments' as const,
        GetOnboardingSteps: 'GetOnboardingSteps' as const,
        GetSessions: 'GetSessions' as const,
        GetProjects: 'GetProjects' as const,
        GetWorkspace: 'GetWorkspace' as const,
        GetVisibleProjectsAndWorkspaces: 'GetVisibleProjectsAndWorkspaces' as const,
        GetAdmin: 'GetAdmin' as const,
        GetProject: 'GetProject' as const,
        GetWorkspaceForProject: 'GetWorkspaceForProject' as const,
        GetBillingDetails: 'GetBillingDetails' as const,
        GetErrorGroup: 'GetErrorGroup' as const,
        GetErrorGroups: 'GetErrorGroups' as const,
        GetMessages: 'GetMessages' as const,
        GetResources: 'GetResources' as const,
        GetFieldSuggestion: 'GetFieldSuggestion' as const,
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
        GetDailyErrorFrequency: 'GetDailyErrorFrequency' as const,
        GetErrorAlert: 'GetErrorAlert' as const,
        GetNewUserAlert: 'GetNewUserAlert' as const,
        GetTrackPropertiesAlert: 'GetTrackPropertiesAlert' as const,
        GetUserPropertiesAlert: 'GetUserPropertiesAlert' as const,
        GetEnvironmentSuggestion: 'GetEnvironmentSuggestion' as const,
        GetSlackChannelSuggestion: 'GetSlackChannelSuggestion' as const,
        GetAlertsPagePayload: 'GetAlertsPagePayload' as const,
        GetCommentMentionSuggestions: 'GetCommentMentionSuggestions' as const,
    },
    Mutation: {
        MarkSessionAsViewed: 'MarkSessionAsViewed' as const,
        MarkSessionAsStarred: 'MarkSessionAsStarred' as const,
        CreateOrUpdateStripeSubscription: 'CreateOrUpdateStripeSubscription' as const,
        UpdateBillingDetails: 'UpdateBillingDetails' as const,
        updateErrorGroupState: 'updateErrorGroupState' as const,
        SendEmailSignup: 'SendEmailSignup' as const,
        AddAdminToProject: 'AddAdminToProject' as const,
        AddAdminToWorkspace: 'AddAdminToWorkspace' as const,
        DeleteAdminFromProject: 'DeleteAdminFromProject' as const,
        OpenSlackConversation: 'OpenSlackConversation' as const,
        AddSlackBotIntegrationToProject: 'AddSlackBotIntegrationToProject' as const,
        CreateProject: 'CreateProject' as const,
        EditProject: 'EditProject' as const,
        DeleteProject: 'DeleteProject' as const,
        EditWorkspace: 'EditWorkspace' as const,
        DeleteSegment: 'DeleteSegment' as const,
        EditSegment: 'EditSegment' as const,
        CreateSegment: 'CreateSegment' as const,
        CreateSessionComment: 'CreateSessionComment' as const,
        DeleteSessionComment: 'DeleteSessionComment' as const,
        CreateErrorComment: 'CreateErrorComment' as const,
        DeleteErrorComment: 'DeleteErrorComment' as const,
        DeleteErrorSegment: 'DeleteErrorSegment' as const,
        EditErrorSegment: 'EditErrorSegment' as const,
        CreateErrorSegment: 'CreateErrorSegment' as const,
        UpdateErrorAlert: 'UpdateErrorAlert' as const,
        UpdateSessionFeedbackAlert: 'UpdateSessionFeedbackAlert' as const,
        UpdateNewUserAlert: 'UpdateNewUserAlert' as const,
        UpdateTrackPropertiesAlert: 'UpdateTrackPropertiesAlert' as const,
        UpdateUserPropertiesAlert: 'UpdateUserPropertiesAlert' as const,
        UpdateSessionIsPublic: 'UpdateSessionIsPublic' as const,
        UpdateErrorGroupIsPublic: 'UpdateErrorGroupIsPublic' as const,
        SendAdminWorkspaceInvite: 'SendAdminWorkspaceInvite' as const,
    },
    Fragment: {
        errorFields: 'errorFields' as const,
    },
};
