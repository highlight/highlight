import * as Types from './schemas';

export type MarkSessionAsViewedMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type MarkSessionAsViewedMutation = { __typename?: 'Mutation' } & {
    markSessionAsViewed?: Types.Maybe<
        { __typename?: 'Session' } & Pick<Types.Session, 'id' | 'viewed'>
    >;
};

export type CreateOrUpdateSubscriptionMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    plan_type: Types.PlanType;
}>;

export type CreateOrUpdateSubscriptionMutation = {
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'createOrUpdateSubscription'>;

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
                    'os' | 'browser' | 'visited_url' | 'hide_viewed'
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
                    'id' | 'name' | 'email'
                >
            >
        >
    >;
};

export type SendAdminInviteMutationVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    email: Types.Scalars['String'];
}>;

export type SendAdminInviteMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'sendAdminInvite'
>;

export type GetSessionsBetaQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    count: Types.Scalars['Int'];
    params?: Types.Maybe<Types.SearchParamsInput>;
}>;

export type GetSessionsBetaQuery = { __typename?: 'Query' } & {
    sessionsBETA?: Types.Maybe<
        { __typename?: 'SessionResults' } & Pick<
            Types.SessionResults,
            'totalCount'
        > & {
                sessions: Array<
                    Types.Maybe<
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
                            | 'viewed'
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
                    >
                >;
            }
    >;
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
        { __typename?: 'Admin' } & Pick<Types.Admin, 'id' | 'name' | 'email'>
    >;
};

export type GetOrganizationQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetOrganizationQuery = { __typename?: 'Query' } & {
    organization?: Types.Maybe<
        { __typename?: 'Organization' } & Pick<
            Types.Organization,
            'id' | 'name' | 'trial_end_date' | 'verbose_id' | 'billing_email'
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
};

export type GetErrorGroupQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetErrorGroupQuery = { __typename?: 'Query' } & {
    error_group?: Types.Maybe<
        { __typename?: 'ErrorGroup' } & Pick<
            Types.ErrorGroup,
            'id' | 'type' | 'organization_id' | 'event'
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
                    Types.Maybe<
                        { __typename?: 'ErrorGroup' } & Pick<
                            Types.ErrorGroup,
                            'id' | 'type' | 'event'
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
                                        >
                                    >
                                >;
                            }
                    >
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

export type GetFieldSuggestionQueryVariables = Types.Exact<{
    organization_id: Types.Scalars['ID'];
    name: Types.Scalars['String'];
    query: Types.Scalars['String'];
}>;

export type GetFieldSuggestionQuery = { __typename?: 'Query' } & {
    field_suggestionBETA?: Types.Maybe<
        Array<
            Types.Maybe<
                { __typename?: 'Field' } & Pick<Types.Field, 'name' | 'value'>
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
                            | 'hide_viewed'
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
