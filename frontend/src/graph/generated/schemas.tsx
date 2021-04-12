export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
    { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
    { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    Any: any;
    Time: any;
};

export type Field = {
    __typename?: 'Field';
    name: Scalars['String'];
    value: Scalars['String'];
    type?: Maybe<Scalars['String']>;
};

export type Session = {
    __typename?: 'Session';
    id: Scalars['ID'];
    user_id: Scalars['ID'];
    os_name: Scalars['String'];
    os_version: Scalars['String'];
    browser_name: Scalars['String'];
    browser_version: Scalars['String'];
    city: Scalars['String'];
    state: Scalars['String'];
    postal: Scalars['String'];
    identifier: Scalars['String'];
    created_at?: Maybe<Scalars['Time']>;
    length?: Maybe<Scalars['Int']>;
    user_object?: Maybe<Scalars['Any']>;
    fields?: Maybe<Array<Maybe<Field>>>;
    viewed?: Maybe<Scalars['Boolean']>;
    starred?: Maybe<Scalars['Boolean']>;
    processed?: Maybe<Scalars['Boolean']>;
    first_time?: Maybe<Scalars['Boolean']>;
    field_group?: Maybe<Scalars['String']>;
    enable_strict_privacy?: Maybe<Scalars['Boolean']>;
};

export type BillingDetails = {
    __typename?: 'BillingDetails';
    plan: Plan;
    meter: Scalars['Int'];
};

export type Plan = {
    __typename?: 'Plan';
    type: PlanType;
    quota: Scalars['Int'];
};

export enum PlanType {
    None = 'None',
    Basic = 'Basic',
    Startup = 'Startup',
    Enterprise = 'Enterprise',
}

export type RecordingSettings = {
    __typename?: 'RecordingSettings';
    id: Scalars['ID'];
    organization_id: Scalars['ID'];
    details: Scalars['String'];
};

export type Organization = {
    __typename?: 'Organization';
    id: Scalars['ID'];
    verbose_id: Scalars['String'];
    name: Scalars['String'];
    plan?: Maybe<Scalars['String']>;
    billing_email?: Maybe<Scalars['String']>;
    trial_end_date?: Maybe<Scalars['Time']>;
    slack_webhook_channel?: Maybe<Scalars['String']>;
};

export type Segment = {
    __typename?: 'Segment';
    id: Scalars['ID'];
    name: Scalars['String'];
    params: SearchParams;
    organization_id: Scalars['ID'];
};

export type ErrorSegment = {
    __typename?: 'ErrorSegment';
    id: Scalars['ID'];
    name: Scalars['String'];
    params: ErrorSearchParams;
    organization_id: Scalars['ID'];
};

export type ErrorObject = {
    __typename?: 'ErrorObject';
    id: Scalars['ID'];
    organization_id: Scalars['Int'];
    session_id: Scalars['Int'];
    error_group_id: Scalars['Int'];
    event: Array<Maybe<Scalars['String']>>;
    type: Scalars['String'];
    url: Scalars['String'];
    source?: Maybe<Scalars['String']>;
    line_number?: Maybe<Scalars['Int']>;
    column_number?: Maybe<Scalars['Int']>;
    trace?: Maybe<Array<Maybe<Scalars['Any']>>>;
    timestamp?: Maybe<Scalars['Time']>;
};

export type ErrorField = {
    __typename?: 'ErrorField';
    organization_id?: Maybe<Scalars['Int']>;
    name: Scalars['String'];
    value: Scalars['String'];
};

export type ErrorGroup = {
    __typename?: 'ErrorGroup';
    id: Scalars['ID'];
    organization_id: Scalars['Int'];
    type: Scalars['String'];
    event: Array<Maybe<Scalars['String']>>;
    trace: Array<Maybe<ErrorTrace>>;
    metadata_log: Array<Maybe<ErrorMetadata>>;
    field_group?: Maybe<Array<Maybe<ErrorField>>>;
    resolved?: Maybe<Scalars['Boolean']>;
};

export type ErrorMetadata = {
    __typename?: 'ErrorMetadata';
    error_id: Scalars['Int'];
    session_id: Scalars['Int'];
    timestamp: Scalars['Time'];
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
};

export type ErrorTrace = {
    __typename?: 'ErrorTrace';
    file_name?: Maybe<Scalars['String']>;
    line_number?: Maybe<Scalars['Int']>;
    function_name?: Maybe<Scalars['String']>;
    column_number?: Maybe<Scalars['Int']>;
};

export type SearchParamsInput = {
    user_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    excluded_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    track_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    date_range?: Maybe<DateRangeInput>;
    length_range?: Maybe<LengthRangeInput>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    referrer?: Maybe<Scalars['String']>;
    identified?: Maybe<Scalars['Boolean']>;
    hide_viewed?: Maybe<Scalars['Boolean']>;
    first_time?: Maybe<Scalars['Boolean']>;
};

export type SearchParams = {
    __typename?: 'SearchParams';
    user_properties?: Maybe<Array<Maybe<UserProperty>>>;
    excluded_properties?: Maybe<Array<Maybe<UserProperty>>>;
    track_properties?: Maybe<Array<Maybe<UserProperty>>>;
    date_range?: Maybe<DateRange>;
    length_range?: Maybe<LengthRange>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    referrer?: Maybe<Scalars['String']>;
    identified?: Maybe<Scalars['Boolean']>;
    hide_viewed?: Maybe<Scalars['Boolean']>;
    first_time?: Maybe<Scalars['Boolean']>;
};

export type ErrorSearchParamsInput = {
    date_range?: Maybe<DateRangeInput>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    hide_resolved?: Maybe<Scalars['Boolean']>;
    event?: Maybe<Scalars['String']>;
};

export type ErrorSearchParams = {
    __typename?: 'ErrorSearchParams';
    date_range?: Maybe<DateRange>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    hide_resolved?: Maybe<Scalars['Boolean']>;
    event?: Maybe<Scalars['String']>;
};

export type DateRange = {
    __typename?: 'DateRange';
    start_date?: Maybe<Scalars['Time']>;
    end_date?: Maybe<Scalars['Time']>;
};

export type DateRangeInput = {
    start_date?: Maybe<Scalars['Time']>;
    end_date?: Maybe<Scalars['Time']>;
};

export type LengthRange = {
    __typename?: 'LengthRange';
    min?: Maybe<Scalars['Int']>;
    max?: Maybe<Scalars['Int']>;
};

export type LengthRangeInput = {
    min?: Maybe<Scalars['Int']>;
    max?: Maybe<Scalars['Int']>;
};

export type UserProperty = {
    __typename?: 'UserProperty';
    name: Scalars['String'];
    value: Scalars['String'];
};

export type UserPropertyInput = {
    name: Scalars['String'];
    value: Scalars['String'];
};

export type User = {
    __typename?: 'User';
    id: Scalars['ID'];
};

export type Admin = {
    __typename?: 'Admin';
    id: Scalars['ID'];
    name: Scalars['String'];
    email: Scalars['String'];
};

export type SanitizedAdmin = {
    __typename?: 'SanitizedAdmin';
    id: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
    email: Scalars['String'];
};

export type SessionResults = {
    __typename?: 'SessionResults';
    sessions: Array<Session>;
    totalCount: Scalars['Int'];
};

export type ErrorResults = {
    __typename?: 'ErrorResults';
    error_groups: Array<ErrorGroup>;
    totalCount: Scalars['Int'];
};

export type SessionComment = {
    __typename?: 'SessionComment';
    id: Scalars['ID'];
    timestamp: Scalars['Int'];
    created_at: Scalars['Time'];
    updated_at: Scalars['Time'];
    author: SanitizedAdmin;
    text: Scalars['String'];
};

export enum SessionLifecycle {
    All = 'All',
    Live = 'Live',
    Completed = 'Completed',
}

export type Query = {
    __typename?: 'Query';
    session?: Maybe<Session>;
    events?: Maybe<Array<Maybe<Scalars['Any']>>>;
    error_groups?: Maybe<ErrorResults>;
    error_group?: Maybe<ErrorGroup>;
    messages?: Maybe<Array<Maybe<Scalars['Any']>>>;
    errors?: Maybe<Array<Maybe<ErrorObject>>>;
    resources?: Maybe<Array<Maybe<Scalars['Any']>>>;
    session_comments: Array<Maybe<SessionComment>>;
    admins?: Maybe<Array<Maybe<Admin>>>;
    isIntegrated?: Maybe<Scalars['Boolean']>;
    unprocessedSessionsCount?: Maybe<Scalars['Int']>;
    sessions: SessionResults;
    billingDetails: BillingDetails;
    field_suggestion?: Maybe<Array<Maybe<Field>>>;
    property_suggestion?: Maybe<Array<Maybe<Field>>>;
    error_field_suggestion?: Maybe<Array<Maybe<ErrorField>>>;
    organizations?: Maybe<Array<Maybe<Organization>>>;
    organizationSuggestion?: Maybe<Array<Maybe<Organization>>>;
    organization?: Maybe<Organization>;
    admin?: Maybe<Admin>;
    segments?: Maybe<Array<Maybe<Segment>>>;
    error_segments?: Maybe<Array<Maybe<ErrorSegment>>>;
    recording_settings?: Maybe<RecordingSettings>;
};

export type QuerySessionArgs = {
    id: Scalars['ID'];
};

export type QueryEventsArgs = {
    session_id: Scalars['ID'];
};

export type QueryError_GroupsArgs = {
    organization_id: Scalars['ID'];
    count: Scalars['Int'];
    params?: Maybe<ErrorSearchParamsInput>;
};

export type QueryError_GroupArgs = {
    id: Scalars['ID'];
};

export type QueryMessagesArgs = {
    session_id: Scalars['ID'];
};

export type QueryErrorsArgs = {
    session_id: Scalars['ID'];
};

export type QueryResourcesArgs = {
    session_id: Scalars['ID'];
};

export type QuerySession_CommentsArgs = {
    session_id: Scalars['ID'];
};

export type QueryAdminsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryIsIntegratedArgs = {
    organization_id: Scalars['ID'];
};

export type QueryUnprocessedSessionsCountArgs = {
    organization_id: Scalars['ID'];
};

export type QuerySessionsArgs = {
    organization_id: Scalars['ID'];
    count: Scalars['Int'];
    lifecycle: SessionLifecycle;
    starred: Scalars['Boolean'];
    params?: Maybe<SearchParamsInput>;
};

export type QueryBillingDetailsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryField_SuggestionArgs = {
    organization_id: Scalars['ID'];
    name: Scalars['String'];
    query: Scalars['String'];
};

export type QueryProperty_SuggestionArgs = {
    organization_id: Scalars['ID'];
    query: Scalars['String'];
    type: Scalars['String'];
};

export type QueryError_Field_SuggestionArgs = {
    organization_id: Scalars['ID'];
    name: Scalars['String'];
    query: Scalars['String'];
};

export type QueryOrganizationSuggestionArgs = {
    query: Scalars['String'];
};

export type QueryOrganizationArgs = {
    id: Scalars['ID'];
};

export type QuerySegmentsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryError_SegmentsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryRecording_SettingsArgs = {
    organization_id: Scalars['ID'];
};

export type Mutation = {
    __typename?: 'Mutation';
    createOrganization?: Maybe<Organization>;
    editOrganization?: Maybe<Organization>;
    markSessionAsViewed?: Maybe<Session>;
    markSessionAsStarred?: Maybe<Session>;
    markErrorGroupAsResolved?: Maybe<ErrorGroup>;
    deleteOrganization?: Maybe<Scalars['Boolean']>;
    sendAdminInvite?: Maybe<Scalars['String']>;
    addAdminToOrganization?: Maybe<Scalars['ID']>;
    addSlackIntegrationToWorkspace?: Maybe<Scalars['Boolean']>;
    createSegment?: Maybe<Segment>;
    emailSignup: Scalars['String'];
    editSegment?: Maybe<Scalars['Boolean']>;
    deleteSegment?: Maybe<Scalars['Boolean']>;
    createErrorSegment?: Maybe<ErrorSegment>;
    editErrorSegment?: Maybe<Scalars['Boolean']>;
    deleteErrorSegment?: Maybe<Scalars['Boolean']>;
    editRecordingSettings?: Maybe<RecordingSettings>;
    createOrUpdateSubscription?: Maybe<Scalars['String']>;
    createSessionComment?: Maybe<SessionComment>;
};

export type MutationCreateOrganizationArgs = {
    name: Scalars['String'];
};

export type MutationEditOrganizationArgs = {
    id: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
    billing_email?: Maybe<Scalars['String']>;
};

export type MutationMarkSessionAsViewedArgs = {
    id: Scalars['ID'];
    viewed?: Maybe<Scalars['Boolean']>;
};

export type MutationMarkSessionAsStarredArgs = {
    id: Scalars['ID'];
    starred?: Maybe<Scalars['Boolean']>;
};

export type MutationMarkErrorGroupAsResolvedArgs = {
    id: Scalars['ID'];
    resolved?: Maybe<Scalars['Boolean']>;
};

export type MutationDeleteOrganizationArgs = {
    id: Scalars['ID'];
};

export type MutationSendAdminInviteArgs = {
    organization_id: Scalars['ID'];
    email: Scalars['String'];
};

export type MutationAddAdminToOrganizationArgs = {
    organization_id: Scalars['ID'];
    invite_id: Scalars['String'];
};

export type MutationAddSlackIntegrationToWorkspaceArgs = {
    organization_id: Scalars['ID'];
    code: Scalars['String'];
    redirect_path: Scalars['String'];
};

export type MutationCreateSegmentArgs = {
    organization_id: Scalars['ID'];
    name: Scalars['String'];
    params: SearchParamsInput;
};

export type MutationEmailSignupArgs = {
    email: Scalars['String'];
};

export type MutationEditSegmentArgs = {
    id: Scalars['ID'];
    organization_id: Scalars['ID'];
    params: SearchParamsInput;
};

export type MutationDeleteSegmentArgs = {
    segment_id: Scalars['ID'];
};

export type MutationCreateErrorSegmentArgs = {
    organization_id: Scalars['ID'];
    name: Scalars['String'];
    params: ErrorSearchParamsInput;
};

export type MutationEditErrorSegmentArgs = {
    id: Scalars['ID'];
    organization_id: Scalars['ID'];
    params: ErrorSearchParamsInput;
};

export type MutationDeleteErrorSegmentArgs = {
    segment_id: Scalars['ID'];
};

export type MutationEditRecordingSettingsArgs = {
    organization_id: Scalars['ID'];
    details?: Maybe<Scalars['String']>;
};

export type MutationCreateOrUpdateSubscriptionArgs = {
    organization_id: Scalars['ID'];
    plan_type: PlanType;
};

export type MutationCreateSessionCommentArgs = {
    organization_id: Scalars['ID'];
    admin_id: Scalars['ID'];
    session_id: Scalars['ID'];
    session_timestamp: Scalars['Int'];
    text: Scalars['String'];
};
