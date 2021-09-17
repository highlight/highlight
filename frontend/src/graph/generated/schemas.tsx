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
    Int64: any;
    Upload: any;
};

export type Field = {
    __typename?: 'Field';
    id: Scalars['ID'];
    name: Scalars['String'];
    value: Scalars['String'];
    type?: Maybe<Scalars['String']>;
};

export type Session = {
    __typename?: 'Session';
    id: Scalars['ID'];
    secure_id: Scalars['String'];
    fingerprint?: Maybe<Scalars['Int']>;
    os_name: Scalars['String'];
    os_version: Scalars['String'];
    browser_name: Scalars['String'];
    browser_version: Scalars['String'];
    city: Scalars['String'];
    state: Scalars['String'];
    postal: Scalars['String'];
    environment?: Maybe<Scalars['String']>;
    app_version?: Maybe<Scalars['String']>;
    client_version?: Maybe<Scalars['String']>;
    language: Scalars['String'];
    identifier: Scalars['String'];
    created_at?: Maybe<Scalars['Time']>;
    length?: Maybe<Scalars['Int']>;
    active_length?: Maybe<Scalars['Int']>;
    user_object?: Maybe<Scalars['Any']>;
    fields?: Maybe<Array<Maybe<Field>>>;
    viewed?: Maybe<Scalars['Boolean']>;
    starred?: Maybe<Scalars['Boolean']>;
    processed?: Maybe<Scalars['Boolean']>;
    first_time?: Maybe<Scalars['Boolean']>;
    field_group?: Maybe<Scalars['String']>;
    enable_strict_privacy?: Maybe<Scalars['Boolean']>;
    enable_recording_network_contents?: Maybe<Scalars['Boolean']>;
    object_storage_enabled?: Maybe<Scalars['Boolean']>;
    payload_size?: Maybe<Scalars['Int64']>;
    within_billing_quota?: Maybe<Scalars['Boolean']>;
    is_public?: Maybe<Scalars['Boolean']>;
};

export type BillingDetails = {
    __typename?: 'BillingDetails';
    plan: Plan;
    meter: Scalars['Int64'];
    sessionsOutOfQuota: Scalars['Int64'];
};

export type Plan = {
    __typename?: 'Plan';
    type: PlanType;
    quota: Scalars['Int'];
};

export enum PlanType {
    Free = 'Free',
    Basic = 'Basic',
    Startup = 'Startup',
    Enterprise = 'Enterprise',
}

export enum ErrorState {
    Open = 'OPEN',
    Resolved = 'RESOLVED',
    Ignored = 'IGNORED',
}

export enum SessionCommentType {
    Admin = 'Admin',
    Feedback = 'FEEDBACK',
}

export type Organization = {
    __typename?: 'Organization';
    id: Scalars['ID'];
    verbose_id: Scalars['String'];
    name: Scalars['String'];
    billing_email?: Maybe<Scalars['String']>;
    trial_end_date?: Maybe<Scalars['Time']>;
    slack_webhook_channel?: Maybe<Scalars['String']>;
    slack_channels?: Maybe<Scalars['String']>;
    secret?: Maybe<Scalars['String']>;
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
    lineNumber?: Maybe<Scalars['Int']>;
    columnNumber?: Maybe<Scalars['Int']>;
    stack_trace?: Maybe<Array<Maybe<Scalars['Any']>>>;
    timestamp?: Maybe<Scalars['Time']>;
    payload?: Maybe<Scalars['String']>;
};

export type ErrorField = {
    __typename?: 'ErrorField';
    organization_id?: Maybe<Scalars['Int']>;
    name: Scalars['String'];
    value: Scalars['String'];
};

export type ErrorGroup = {
    __typename?: 'ErrorGroup';
    created_at: Scalars['Time'];
    id: Scalars['ID'];
    secure_id: Scalars['String'];
    organization_id: Scalars['Int'];
    type: Scalars['String'];
    event: Array<Maybe<Scalars['String']>>;
    stack_trace: Array<Maybe<ErrorTrace>>;
    metadata_log: Array<Maybe<ErrorMetadata>>;
    mapped_stack_trace?: Maybe<Scalars['String']>;
    field_group?: Maybe<Array<Maybe<ErrorField>>>;
    state: ErrorState;
    environments?: Maybe<Scalars['String']>;
    error_frequency: Array<Maybe<Scalars['Int64']>>;
};

export type ErrorMetadata = {
    __typename?: 'ErrorMetadata';
    error_id: Scalars['Int'];
    session_id: Scalars['Int'];
    environment?: Maybe<Scalars['String']>;
    timestamp: Scalars['Time'];
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    fingerprint: Scalars['String'];
    identifier?: Maybe<Scalars['String']>;
};

export type ErrorTrace = {
    __typename?: 'ErrorTrace';
    fileName?: Maybe<Scalars['String']>;
    lineNumber?: Maybe<Scalars['Int']>;
    functionName?: Maybe<Scalars['String']>;
    columnNumber?: Maybe<Scalars['Int']>;
    error?: Maybe<Scalars['String']>;
};

export type ReferrerTablePayload = {
    __typename?: 'ReferrerTablePayload';
    host: Scalars['String'];
    count: Scalars['Int'];
    percent: Scalars['Float'];
};

export type TopUsersPayload = {
    __typename?: 'TopUsersPayload';
    id: Scalars['ID'];
    identifier: Scalars['String'];
    total_active_time: Scalars['Int'];
    active_time_percentage: Scalars['Float'];
};

export type NewUsersCount = {
    __typename?: 'NewUsersCount';
    count: Scalars['Int64'];
};

export type AverageSessionLength = {
    __typename?: 'AverageSessionLength';
    length: Scalars['Float'];
};

export type UserFingerprintCount = {
    __typename?: 'UserFingerprintCount';
    count: Scalars['Int64'];
};

export type SearchParamsInput = {
    user_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    excluded_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    track_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    excluded_track_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    date_range?: Maybe<DateRangeInput>;
    length_range?: Maybe<LengthRangeInput>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    device_id?: Maybe<Scalars['String']>;
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
    state?: Maybe<ErrorState>;
    event?: Maybe<Scalars['String']>;
};

export type ErrorSearchParams = {
    __typename?: 'ErrorSearchParams';
    date_range?: Maybe<DateRange>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    state?: Maybe<ErrorState>;
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
    min?: Maybe<Scalars['Float']>;
    max?: Maybe<Scalars['Float']>;
};

export type LengthRangeInput = {
    min?: Maybe<Scalars['Float']>;
    max?: Maybe<Scalars['Float']>;
};

export type UserProperty = {
    __typename?: 'UserProperty';
    id: Scalars['ID'];
    name: Scalars['String'];
    value: Scalars['String'];
};

export type UserPropertyInput = {
    id?: Maybe<Scalars['ID']>;
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
    photo_url?: Maybe<Scalars['String']>;
    slack_im_channel_id?: Maybe<Scalars['String']>;
};

export type SanitizedAdmin = {
    __typename?: 'SanitizedAdmin';
    id: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
    email: Scalars['String'];
    photo_url?: Maybe<Scalars['String']>;
};

export type SanitizedAdminInput = {
    id: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
    email: Scalars['String'];
};

export type SessionResults = {
    __typename?: 'SessionResults';
    sessions: Array<Session>;
    totalCount: Scalars['Int64'];
};

export type ErrorResults = {
    __typename?: 'ErrorResults';
    error_groups: Array<ErrorGroup>;
    totalCount: Scalars['Int64'];
};

export type SessionComment = {
    __typename?: 'SessionComment';
    id: Scalars['ID'];
    organization_id: Scalars['ID'];
    timestamp?: Maybe<Scalars['Int']>;
    created_at: Scalars['Time'];
    updated_at: Scalars['Time'];
    session_id: Scalars['Int'];
    author?: Maybe<SanitizedAdmin>;
    text: Scalars['String'];
    x_coordinate?: Maybe<Scalars['Float']>;
    y_coordinate?: Maybe<Scalars['Float']>;
    type: SessionCommentType;
    metadata?: Maybe<Scalars['Any']>;
};

export type ErrorComment = {
    __typename?: 'ErrorComment';
    id: Scalars['ID'];
    organization_id: Scalars['ID'];
    created_at: Scalars['Time'];
    error_id: Scalars['Int'];
    updated_at: Scalars['Time'];
    author: SanitizedAdmin;
    text: Scalars['String'];
};

export enum SessionLifecycle {
    All = 'All',
    Live = 'Live',
    Completed = 'Completed',
}

export type DailySessionCount = {
    __typename?: 'DailySessionCount';
    organization_id: Scalars['ID'];
    date: Scalars['Time'];
    count: Scalars['Int64'];
};

export type DailyErrorCount = {
    __typename?: 'DailyErrorCount';
    organization_id: Scalars['ID'];
    date: Scalars['Time'];
    count: Scalars['Int64'];
};

export type SanitizedSlackChannel = {
    __typename?: 'SanitizedSlackChannel';
    webhook_channel?: Maybe<Scalars['String']>;
    webhook_channel_id?: Maybe<Scalars['String']>;
};

export type SanitizedSlackChannelInput = {
    webhook_channel_name?: Maybe<Scalars['String']>;
    webhook_channel_id?: Maybe<Scalars['String']>;
};

export type ErrorAlert = {
    __typename?: 'ErrorAlert';
    id: Scalars['ID'];
    ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>;
    ExcludedEnvironments: Array<Maybe<Scalars['String']>>;
    CountThreshold: Scalars['Int'];
    ThresholdWindow?: Maybe<Scalars['Int']>;
};

export type TrackProperty = {
    __typename?: 'TrackProperty';
    id: Scalars['ID'];
    name: Scalars['String'];
    value: Scalars['String'];
};

export type TrackPropertyInput = {
    id?: Maybe<Scalars['ID']>;
    name: Scalars['String'];
    value: Scalars['String'];
};

export type SessionAlert = {
    __typename?: 'SessionAlert';
    id: Scalars['ID'];
    ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>;
    ExcludedEnvironments: Array<Maybe<Scalars['String']>>;
    CountThreshold: Scalars['Int'];
    TrackProperties: Array<Maybe<TrackProperty>>;
    UserProperties: Array<Maybe<UserProperty>>;
    ThresholdWindow: Scalars['Int'];
};

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
    session_comments_for_admin: Array<Maybe<SessionComment>>;
    session_comments_for_organization: Array<Maybe<SessionComment>>;
    error_comments: Array<Maybe<ErrorComment>>;
    error_comments_for_admin: Array<Maybe<ErrorComment>>;
    error_comments_for_organization: Array<Maybe<ErrorComment>>;
    admins: Array<Maybe<Admin>>;
    isIntegrated?: Maybe<Scalars['Boolean']>;
    unprocessedSessionsCount?: Maybe<Scalars['Int64']>;
    adminHasCreatedComment?: Maybe<Scalars['Boolean']>;
    organizationHasViewedASession?: Maybe<Session>;
    dailySessionsCount: Array<Maybe<DailySessionCount>>;
    dailyErrorsCount: Array<Maybe<DailyErrorCount>>;
    dailyErrorFrequency: Array<Maybe<Scalars['Int64']>>;
    referrers: Array<Maybe<ReferrerTablePayload>>;
    newUsersCount?: Maybe<NewUsersCount>;
    topUsers: Array<Maybe<TopUsersPayload>>;
    averageSessionLength?: Maybe<AverageSessionLength>;
    userFingerprintCount?: Maybe<UserFingerprintCount>;
    sessions: SessionResults;
    billingDetails: BillingDetails;
    field_suggestion?: Maybe<Array<Maybe<Field>>>;
    property_suggestion?: Maybe<Array<Maybe<Field>>>;
    error_field_suggestion?: Maybe<Array<Maybe<ErrorField>>>;
    organizations?: Maybe<Array<Maybe<Organization>>>;
    error_alert?: Maybe<ErrorAlert>;
    session_feedback_alert?: Maybe<SessionAlert>;
    new_user_alert?: Maybe<SessionAlert>;
    track_properties_alert?: Maybe<SessionAlert>;
    user_properties_alert?: Maybe<SessionAlert>;
    organizationSuggestion?: Maybe<Array<Maybe<Organization>>>;
    environment_suggestion?: Maybe<Array<Maybe<Field>>>;
    slack_channel_suggestion?: Maybe<Array<Maybe<SanitizedSlackChannel>>>;
    slack_members: Array<Maybe<SanitizedSlackChannel>>;
    is_integrated_with_slack: Scalars['Boolean'];
    organization?: Maybe<Organization>;
    admin?: Maybe<Admin>;
    segments?: Maybe<Array<Maybe<Segment>>>;
    error_segments?: Maybe<Array<Maybe<ErrorSegment>>>;
    api_key_to_org_id?: Maybe<Scalars['ID']>;
};

export type QuerySessionArgs = {
    id?: Maybe<Scalars['ID']>;
    secure_id?: Maybe<Scalars['String']>;
};

export type QueryEventsArgs = {
    session_id?: Maybe<Scalars['ID']>;
    session_secure_id?: Maybe<Scalars['String']>;
};

export type QueryError_GroupsArgs = {
    organization_id: Scalars['ID'];
    count: Scalars['Int'];
    params?: Maybe<ErrorSearchParamsInput>;
};

export type QueryError_GroupArgs = {
    id?: Maybe<Scalars['ID']>;
    secure_id?: Maybe<Scalars['String']>;
};

export type QueryMessagesArgs = {
    session_id?: Maybe<Scalars['ID']>;
    session_secure_id?: Maybe<Scalars['String']>;
};

export type QueryErrorsArgs = {
    session_id?: Maybe<Scalars['ID']>;
    session_secure_id?: Maybe<Scalars['String']>;
};

export type QueryResourcesArgs = {
    session_id?: Maybe<Scalars['ID']>;
    session_secure_id?: Maybe<Scalars['String']>;
};

export type QuerySession_CommentsArgs = {
    session_id?: Maybe<Scalars['ID']>;
    session_secure_id?: Maybe<Scalars['String']>;
};

export type QuerySession_Comments_For_OrganizationArgs = {
    organization_id: Scalars['ID'];
};

export type QueryError_CommentsArgs = {
    error_group_id?: Maybe<Scalars['ID']>;
    error_group_secure_id?: Maybe<Scalars['String']>;
};

export type QueryError_Comments_For_OrganizationArgs = {
    organization_id: Scalars['ID'];
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

export type QueryAdminHasCreatedCommentArgs = {
    admin_id: Scalars['ID'];
};

export type QueryOrganizationHasViewedASessionArgs = {
    organization_id: Scalars['ID'];
};

export type QueryDailySessionsCountArgs = {
    organization_id: Scalars['ID'];
    date_range: DateRangeInput;
};

export type QueryDailyErrorsCountArgs = {
    organization_id: Scalars['ID'];
    date_range: DateRangeInput;
};

export type QueryDailyErrorFrequencyArgs = {
    organization_id: Scalars['ID'];
    error_group_id?: Maybe<Scalars['ID']>;
    error_group_secure_id?: Maybe<Scalars['String']>;
    date_offset: Scalars['Int'];
};

export type QueryReferrersArgs = {
    organization_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryNewUsersCountArgs = {
    organization_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryTopUsersArgs = {
    organization_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryAverageSessionLengthArgs = {
    organization_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryUserFingerprintCountArgs = {
    organization_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
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

export type QueryError_AlertArgs = {
    organization_id: Scalars['ID'];
};

export type QuerySession_Feedback_AlertArgs = {
    organization_id: Scalars['ID'];
};

export type QueryNew_User_AlertArgs = {
    organization_id: Scalars['ID'];
};

export type QueryTrack_Properties_AlertArgs = {
    organization_id: Scalars['ID'];
};

export type QueryUser_Properties_AlertArgs = {
    organization_id: Scalars['ID'];
};

export type QueryOrganizationSuggestionArgs = {
    query: Scalars['String'];
};

export type QueryEnvironment_SuggestionArgs = {
    query: Scalars['String'];
    organization_id: Scalars['ID'];
};

export type QuerySlack_Channel_SuggestionArgs = {
    organization_id: Scalars['ID'];
};

export type QuerySlack_MembersArgs = {
    organization_id: Scalars['ID'];
};

export type QueryIs_Integrated_With_SlackArgs = {
    organization_id: Scalars['ID'];
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

export type QueryApi_Key_To_Org_IdArgs = {
    api_key: Scalars['String'];
};

export type Mutation = {
    __typename?: 'Mutation';
    createOrganization?: Maybe<Organization>;
    editOrganization?: Maybe<Organization>;
    markSessionAsViewed?: Maybe<Session>;
    markSessionAsStarred?: Maybe<Session>;
    updateErrorGroupState?: Maybe<ErrorGroup>;
    deleteOrganization?: Maybe<Scalars['Boolean']>;
    sendAdminInvite?: Maybe<Scalars['String']>;
    addAdminToOrganization?: Maybe<Scalars['ID']>;
    deleteAdminFromOrganization?: Maybe<Scalars['ID']>;
    createSegment?: Maybe<Segment>;
    emailSignup: Scalars['String'];
    editSegment?: Maybe<Scalars['Boolean']>;
    deleteSegment?: Maybe<Scalars['Boolean']>;
    createErrorSegment?: Maybe<ErrorSegment>;
    editErrorSegment?: Maybe<Scalars['Boolean']>;
    deleteErrorSegment?: Maybe<Scalars['Boolean']>;
    createOrUpdateStripeSubscription?: Maybe<Scalars['String']>;
    updateBillingDetails?: Maybe<Scalars['Boolean']>;
    createSessionComment?: Maybe<SessionComment>;
    deleteSessionComment?: Maybe<Scalars['Boolean']>;
    createErrorComment?: Maybe<ErrorComment>;
    deleteErrorComment?: Maybe<Scalars['Boolean']>;
    openSlackConversation?: Maybe<Scalars['Boolean']>;
    addSlackBotIntegrationToOrganization: Scalars['Boolean'];
    updateErrorAlert?: Maybe<ErrorAlert>;
    updateSessionFeedbackAlert?: Maybe<SessionAlert>;
    updateNewUserAlert?: Maybe<SessionAlert>;
    updateTrackPropertiesAlert?: Maybe<SessionAlert>;
    updateUserPropertiesAlert?: Maybe<SessionAlert>;
    updateSessionIsPublic?: Maybe<Session>;
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
    id?: Maybe<Scalars['ID']>;
    secure_id?: Maybe<Scalars['String']>;
    viewed?: Maybe<Scalars['Boolean']>;
};

export type MutationMarkSessionAsStarredArgs = {
    id?: Maybe<Scalars['ID']>;
    secure_id?: Maybe<Scalars['String']>;
    starred?: Maybe<Scalars['Boolean']>;
};

export type MutationUpdateErrorGroupStateArgs = {
    id?: Maybe<Scalars['ID']>;
    secure_id?: Maybe<Scalars['String']>;
    state: Scalars['String'];
};

export type MutationDeleteOrganizationArgs = {
    id: Scalars['ID'];
};

export type MutationSendAdminInviteArgs = {
    organization_id: Scalars['ID'];
    email: Scalars['String'];
    base_url: Scalars['String'];
};

export type MutationAddAdminToOrganizationArgs = {
    organization_id: Scalars['ID'];
    invite_id: Scalars['String'];
};

export type MutationDeleteAdminFromOrganizationArgs = {
    organization_id: Scalars['ID'];
    admin_id: Scalars['ID'];
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

export type MutationCreateOrUpdateStripeSubscriptionArgs = {
    organization_id: Scalars['ID'];
    plan_type: PlanType;
};

export type MutationUpdateBillingDetailsArgs = {
    organization_id: Scalars['ID'];
};

export type MutationCreateSessionCommentArgs = {
    organization_id: Scalars['ID'];
    session_id?: Maybe<Scalars['ID']>;
    session_secure_id?: Maybe<Scalars['String']>;
    session_timestamp: Scalars['Int'];
    text: Scalars['String'];
    text_for_email: Scalars['String'];
    x_coordinate: Scalars['Float'];
    y_coordinate: Scalars['Float'];
    tagged_admins: Array<Maybe<SanitizedAdminInput>>;
    session_url: Scalars['String'];
    time: Scalars['Float'];
    author_name: Scalars['String'];
    session_image?: Maybe<Scalars['String']>;
};

export type MutationDeleteSessionCommentArgs = {
    id: Scalars['ID'];
};

export type MutationCreateErrorCommentArgs = {
    organization_id: Scalars['ID'];
    error_group_id?: Maybe<Scalars['ID']>;
    error_group_secure_id?: Maybe<Scalars['String']>;
    text: Scalars['String'];
    text_for_email: Scalars['String'];
    tagged_admins: Array<Maybe<SanitizedAdminInput>>;
    error_url: Scalars['String'];
    author_name: Scalars['String'];
};

export type MutationDeleteErrorCommentArgs = {
    id: Scalars['ID'];
};

export type MutationOpenSlackConversationArgs = {
    organization_id: Scalars['ID'];
    code: Scalars['String'];
    redirect_path: Scalars['String'];
};

export type MutationAddSlackBotIntegrationToOrganizationArgs = {
    organization_id: Scalars['ID'];
    code: Scalars['String'];
    redirect_path: Scalars['String'];
};

export type MutationUpdateErrorAlertArgs = {
    organization_id: Scalars['ID'];
    error_alert_id: Scalars['ID'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateSessionFeedbackAlertArgs = {
    organization_id: Scalars['ID'];
    session_feedback_alert_id: Scalars['ID'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateNewUserAlertArgs = {
    organization_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
    count_threshold: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateTrackPropertiesAlertArgs = {
    organization_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    track_properties: Array<Maybe<TrackPropertyInput>>;
};

export type MutationUpdateUserPropertiesAlertArgs = {
    organization_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    user_properties: Array<Maybe<UserPropertyInput>>;
};

export type MutationUpdateSessionIsPublicArgs = {
    session_id?: Maybe<Scalars['ID']>;
    session_secure_id?: Maybe<Scalars['String']>;
    is_public: Scalars['Boolean'];
};
