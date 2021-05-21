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

export type CreateOrUpdateSubscriptionMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    plan_type: Types.PlanType;
}>;

export type CreateOrUpdateSubscriptionMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'createOrUpdateSubscription'>;

export type MarkErrorGroupAsResolvedMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
    resolved: Types.Scalars['Boolean'];
}>;

export type MarkErrorGroupAsResolvedMutation = { __typename?: 'Mutation' } & {
    markErrorGroupAsResolved?: Types.Maybe<
        { __typename?: 'ErrorGroup' } & Pick<
            Types.ErrorGroup,
            'id' | 'resolved'
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

export type AddAdminToOrganizationMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    invite_id: Types.Scalars['String'];
}>;

export type AddAdminToOrganizationMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'addAdminToOrganization'
>;

export type AddSlackIntegrationToWorkspaceMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    code: Types.Scalars['String'];
    redirect_path: Types.Scalars['String'];
}>;

export type AddSlackIntegrationToWorkspaceMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'addSlackIntegrationToWorkspace'>;

export type CreateOrganizationMutationVariables = Types.Exact<{
    name: Types.Scalars['String'];
}>;

export type CreateOrganizationMutation = { __typename?: 'Mutation' } & {
    createOrganization?: Types.Maybe<
        { __typename?: 'Organization' } & Pick<
            Types.Organization,
            'id' | 'name'
        >
    >;
};

export type EditOrganizationMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
    name?: Types.Maybe<Types.Scalars['String']>;
    billing_email?: Types.Maybe<Types.Scalars['String']>;
}>;

export type EditOrganizationMutation = { __typename?: 'Mutation' } & {
    editOrganization?: Types.Maybe<
        { __typename?: 'Organization' } & Pick<
            Types.Organization,
            'name' | 'billing_email'
        >
    >;
};

export type DeleteOrganizationMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type DeleteOrganizationMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteOrganization'
>;

export type DeleteSegmentMutationVariables = Types.Exact<{
    segment_id: Types.Scalars['ID'];
}>;

export type DeleteSegmentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'deleteSegment'
>;

export type EditSegmentMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    id: Types.Scalars['ID'];
    params: Types.SearchParamsInput;
}>;

export type EditSegmentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'editSegment'
>;

export type CreateSegmentMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
    organization_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
    session_id: Types.Scalars['ID'];
    session_timestamp: Types.Scalars['Int'];
    text: Types.Scalars['String'];
    text_for_email: Types.Scalars['String'];
    x_coordinate: Types.Scalars['Float'];
    y_coordinate: Types.Scalars['Float'];
    tagged_admins:
        | Array<Types.Maybe<Types.SanitizedAdminInput>>
        | Types.Maybe<Types.SanitizedAdminInput>;
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
                author: { __typename?: 'SanitizedAdmin' } & Pick<
                    Types.SanitizedAdmin,
                    'id' | 'name' | 'email'
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
    organization_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
    error_group_id: Types.Scalars['ID'];
    text: Types.Scalars['String'];
    text_for_email: Types.Scalars['String'];
    tagged_admins:
        | Array<Types.Maybe<Types.SanitizedAdminInput>>
        | Types.Maybe<Types.SanitizedAdminInput>;
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
    organization_id: Types.Scalars['ID'];
    id: Types.Scalars['ID'];
    params: Types.ErrorSearchParamsInput;
}>;

export type EditErrorSegmentMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'editErrorSegment'
>;

export type CreateErrorSegmentMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
                    'os' | 'browser' | 'visited_url' | 'hide_resolved'
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

export type GetEventsQueryVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
}>;

export type GetEventsQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'events'
>;

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
            | 'city'
            | 'state'
            | 'postal'
            | 'user_id'
            | 'created_at'
            | 'user_object'
            | 'identifier'
            | 'starred'
            | 'enable_strict_privacy'
            | 'object_storage_enabled'
            | 'payload_size'
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

export type GetAdminsQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
}>;

export type GetAdminsQuery = { __typename?: 'Query' } & {
    admins?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Admin' } & Pick<
                    Types.Admin,
                    'id' | 'name' | 'email' | 'photo_url'
                >
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
                | 'created_at'
                | 'updated_at'
                | 'text'
                | 'x_coordinate'
                | 'y_coordinate'
            > & {
                    author: { __typename?: 'SanitizedAdmin' } & Pick<
                        Types.SanitizedAdmin,
                        'id' | 'name' | 'email' | 'photo_url'
                    >;
                }
        >
    >;
};

export type GetNotificationsQueryVariables = Types.Exact<{
    [key: string]: never;
}>;

export type GetNotificationsQuery = { __typename?: 'Query' } & {
    session_comments_for_admin: Array<
        Types.Maybe<
            { __typename?: 'SessionComment' } & Pick<
                Types.SessionComment,
                'id' | 'timestamp' | 'updated_at' | 'session_id' | 'text'
            > & {
                    author: { __typename?: 'SanitizedAdmin' } & Pick<
                        Types.SanitizedAdmin,
                        'id' | 'name' | 'email' | 'photo_url'
                    >;
                }
        >
    >;
    error_comments_for_admin: Array<
        Types.Maybe<
            { __typename?: 'ErrorComment' } & Pick<
                Types.ErrorComment,
                'id' | 'updated_at' | 'text' | 'error_id'
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
                'id' | 'timestamp' | 'created_at' | 'updated_at' | 'text'
            > & {
                    author: { __typename?: 'SanitizedAdmin' } & Pick<
                        Types.SanitizedAdmin,
                        'id' | 'name' | 'email' | 'photo_url'
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
                'id' | 'created_at' | 'updated_at' | 'text'
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
    organization_id: Types.Scalars['ID'];
    admin_id: Types.Scalars['ID'];
}>;

export type GetOnboardingStepsQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'isIntegrated' | 'adminHasCreatedComment'
> & {
        organization?: Types.Maybe<
            { __typename?: 'Organization' } & Pick<
                Types.Organization,
                'slack_webhook_channel'
            >
        >;
        admins?: Types.Maybe<
            Array<
                Types.Maybe<{ __typename?: 'Admin' } & Pick<Types.Admin, 'id'>>
            >
        >;
        organizationHasViewedASession?: Types.Maybe<
            { __typename?: 'Session' } & Pick<Types.Session, 'id'>
        >;
    };

export type SendAdminInviteMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    email: Types.Scalars['String'];
    base_url: Types.Scalars['String'];
}>;

export type SendAdminInviteMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'sendAdminInvite'
>;

export type GetSessionsQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
                    | 'user_id'
                    | 'identifier'
                    | 'os_name'
                    | 'os_version'
                    | 'browser_name'
                    | 'browser_version'
                    | 'city'
                    | 'state'
                    | 'postal'
                    | 'created_at'
                    | 'length'
                    | 'active_length'
                    | 'viewed'
                    | 'starred'
                    | 'processed'
                    | 'first_time'
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
};

export type GetOrganizationsQueryVariables = Types.Exact<{
    [key: string]: never;
}>;

export type GetOrganizationsQuery = { __typename?: 'Query' } & {
    organizations?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Organization' } & Pick<
                    Types.Organization,
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
            'id' | 'name' | 'email' | 'photo_url'
        >
    >;
};

export type GetOrganizationQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetOrganizationQuery = { __typename?: 'Query' } & {
    organization?: Types.Maybe<
        { __typename?: 'Organization' } & Pick<
            Types.Organization,
            | 'id'
            | 'name'
            | 'verbose_id'
            | 'billing_email'
            | 'slack_webhook_channel'
        >
    >;
};

export type GetBillingDetailsQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
}>;

export type GetBillingDetailsQuery = { __typename?: 'Query' } & {
    billingDetails: { __typename?: 'BillingDetails' } & Pick<
        Types.BillingDetails,
        'meter'
    > & { plan: { __typename?: 'Plan' } & Pick<Types.Plan, 'type' | 'quota'> };
    organization?: Types.Maybe<
        { __typename?: 'Organization' } & Pick<
            Types.Organization,
            'trial_end_date'
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
            'id' | 'type' | 'organization_id' | 'event' | 'resolved'
        > & {
                trace: Array<
                    Types.Maybe<
                        { __typename?: 'ErrorTrace' } & Pick<
                            Types.ErrorTrace,
                            | 'file_name'
                            | 'line_number'
                            | 'function_name'
                            | 'column_number'
                        >
                    >
                >;
                metadata_log: Array<
                    Types.Maybe<
                        { __typename?: 'ErrorMetadata' } & Pick<
                            Types.ErrorMetadata,
                            | 'error_id'
                            | 'session_id'
                            | 'timestamp'
                            | 'os'
                            | 'browser'
                            | 'visited_url'
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
    organization_id: Types.Scalars['ID'];
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
                        'id' | 'type' | 'event' | 'resolved'
                    > & {
                            trace: Array<
                                Types.Maybe<
                                    { __typename?: 'ErrorTrace' } & Pick<
                                        Types.ErrorTrace,
                                        | 'file_name'
                                        | 'line_number'
                                        | 'function_name'
                                        | 'column_number'
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
    | 'line_number'
    | 'column_number'
    | 'trace'
    | 'timestamp'
    | 'payload'
>;

export type GetFieldSuggestionQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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

export type GetOrganizationSuggestionQueryVariables = Types.Exact<{
    query: Types.Scalars['String'];
}>;

export type GetOrganizationSuggestionQuery = { __typename?: 'Query' } & {
    organizationSuggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Organization' } & Pick<
                    Types.Organization,
                    'id' | 'name'
                >
            >
        >
    >;
};

export type GetErrorFieldSuggestionQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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

export type GetTrackSuggestionQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    query: Types.Scalars['String'];
}>;

export type GetTrackSuggestionQuery = { __typename?: 'Query' } & {
    property_suggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
            >
        >
    >;
};

export type GetUserSuggestionQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    query: Types.Scalars['String'];
}>;

export type GetUserSuggestionQuery = { __typename?: 'Query' } & {
    property_suggestion?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
            >
        >
    >;
};

export type GetSegmentsQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
    organization_id: Types.Scalars['ID'];
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
                            | 'hide_resolved'
                            | 'event'
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
    organization_id: Types.Scalars['ID'];
}>;

export type IsIntegratedQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'isIntegrated'
>;

export type UnprocessedSessionsCountQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
}>;

export type UnprocessedSessionsCountQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'unprocessedSessionsCount'
>;

export type GetKeyPerformanceIndicatorsQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
    };

export type GetReferrersCountQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
    organization_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

export type GetNewUsersCountQuery = { __typename?: 'Query' } & {
    newUsersCount?: Types.Maybe<
        { __typename?: 'NewUsersCount' } & Pick<Types.NewUsersCount, 'count'>
    >;
};

export type GetAverageSessionLengthQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
    organization_id: Types.Scalars['ID'];
    lookBackPeriod: Types.Scalars['Int'];
}>;

export type GetTopUsersQuery = { __typename?: 'Query' } & {
    topUsers: Array<
        Types.Maybe<
            { __typename?: 'TopUsersPayload' } & Pick<
                Types.TopUsersPayload,
                'identifier' | 'total_active_time' | 'active_time_percentage'
            >
        >
    >;
};

export type GetDailySessionsCountQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
    organization_id: Types.Scalars['ID'];
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

export type GetErrorAlertQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
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
