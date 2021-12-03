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
    Timestamp: any;
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
    client_config?: Maybe<Scalars['String']>;
    language: Scalars['String'];
    identifier: Scalars['String'];
    created_at?: Maybe<Scalars['Timestamp']>;
    length?: Maybe<Scalars['Int']>;
    active_length?: Maybe<Scalars['Int']>;
    user_object?: Maybe<Scalars['Any']>;
    user_properties?: Maybe<Scalars['String']>;
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
    event_counts?: Maybe<Scalars['String']>;
    direct_download_url?: Maybe<Scalars['String']>;
    resources_url?: Maybe<Scalars['String']>;
    messages_url?: Maybe<Scalars['String']>;
};

export type RageClickEvent = {
    __typename?: 'RageClickEvent';
    id: Scalars['ID'];
    project_id: Scalars['ID'];
    session_secure_id: Scalars['String'];
    start_timestamp: Scalars['Timestamp'];
    end_timestamp: Scalars['Timestamp'];
    total_clicks: Scalars['Int'];
};

export type RageClickEventForProject = {
    __typename?: 'RageClickEventForProject';
    identifier: Scalars['String'];
    session_secure_id: Scalars['String'];
    total_clicks: Scalars['Int'];
    user_properties: Scalars['String'];
};

export type BillingDetails = {
    __typename?: 'BillingDetails';
    plan: Plan;
    meter: Scalars['Int64'];
    membersMeter: Scalars['Int64'];
    sessionsOutOfQuota: Scalars['Int64'];
};

export type SubscriptionDetails = {
    __typename?: 'SubscriptionDetails';
    baseAmount: Scalars['Int64'];
    discountPercent: Scalars['Float'];
    discountAmount: Scalars['Int64'];
};

export type Plan = {
    __typename?: 'Plan';
    type: PlanType;
    interval: SubscriptionInterval;
    quota: Scalars['Int'];
    membersLimit: Scalars['Int'];
};

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

export type EnhancedUserDetailsResult = {
    __typename?: 'EnhancedUserDetailsResult';
    id?: Maybe<Scalars['ID']>;
    name?: Maybe<Scalars['String']>;
    avatar?: Maybe<Scalars['String']>;
    bio?: Maybe<Scalars['String']>;
    socials?: Maybe<Array<Maybe<SocialLink>>>;
    email?: Maybe<Scalars['String']>;
};

export type SocialLink = {
    __typename?: 'SocialLink';
    type: SocialType;
    link?: Maybe<Scalars['String']>;
};

export enum SocialType {
    Github = 'Github',
    LinkedIn = 'LinkedIn',
    Twitter = 'Twitter',
    Facebook = 'Facebook',
    Site = 'Site',
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

export type Project = {
    __typename?: 'Project';
    id: Scalars['ID'];
    verbose_id: Scalars['String'];
    name: Scalars['String'];
    billing_email?: Maybe<Scalars['String']>;
    secret?: Maybe<Scalars['String']>;
    workspace_id: Scalars['ID'];
};

export type Workspace = {
    __typename?: 'Workspace';
    id: Scalars['ID'];
    name: Scalars['String'];
    slack_webhook_channel?: Maybe<Scalars['String']>;
    slack_channels?: Maybe<Scalars['String']>;
    secret?: Maybe<Scalars['String']>;
    projects: Array<Maybe<Project>>;
    trial_end_date?: Maybe<Scalars['Timestamp']>;
    billing_period_end?: Maybe<Scalars['Timestamp']>;
    next_invoice_date?: Maybe<Scalars['Timestamp']>;
    allow_meter_overage: Scalars['Boolean'];
    allowed_auto_join_email_origins?: Maybe<Scalars['String']>;
    eligible_for_trial_extension: Scalars['Boolean'];
    trial_extension_enabled: Scalars['Boolean'];
};

export type Segment = {
    __typename?: 'Segment';
    id: Scalars['ID'];
    name: Scalars['String'];
    params: SearchParams;
    project_id: Scalars['ID'];
};

export type ErrorSegment = {
    __typename?: 'ErrorSegment';
    id: Scalars['ID'];
    name: Scalars['String'];
    params: ErrorSearchParams;
    project_id: Scalars['ID'];
};

export type ErrorObject = {
    __typename?: 'ErrorObject';
    id: Scalars['ID'];
    project_id: Scalars['Int'];
    session_id: Scalars['Int'];
    error_group_id: Scalars['Int'];
    error_group_secure_id: Scalars['String'];
    event: Array<Maybe<Scalars['String']>>;
    type: Scalars['String'];
    url: Scalars['String'];
    source?: Maybe<Scalars['String']>;
    lineNumber?: Maybe<Scalars['Int']>;
    columnNumber?: Maybe<Scalars['Int']>;
    stack_trace: Scalars['String'];
    structured_stack_trace: Array<Maybe<ErrorTrace>>;
    timestamp?: Maybe<Scalars['Timestamp']>;
    payload?: Maybe<Scalars['String']>;
    request_id?: Maybe<Scalars['String']>;
};

export type ErrorField = {
    __typename?: 'ErrorField';
    project_id?: Maybe<Scalars['Int']>;
    name: Scalars['String'];
    value: Scalars['String'];
};

export type ErrorGroup = {
    __typename?: 'ErrorGroup';
    created_at: Scalars['Timestamp'];
    id: Scalars['ID'];
    secure_id: Scalars['String'];
    project_id: Scalars['Int'];
    type: Scalars['String'];
    event: Array<Maybe<Scalars['String']>>;
    structured_stack_trace: Array<Maybe<ErrorTrace>>;
    metadata_log: Array<Maybe<ErrorMetadata>>;
    mapped_stack_trace?: Maybe<Scalars['String']>;
    stack_trace?: Maybe<Scalars['String']>;
    field_group?: Maybe<Array<Maybe<ErrorField>>>;
    state: ErrorState;
    environments?: Maybe<Scalars['String']>;
    error_frequency: Array<Maybe<Scalars['Int64']>>;
    is_public: Scalars['Boolean'];
};

export type ErrorMetadata = {
    __typename?: 'ErrorMetadata';
    error_id: Scalars['Int'];
    session_id: Scalars['Int'];
    session_secure_id: Scalars['String'];
    environment?: Maybe<Scalars['String']>;
    timestamp?: Maybe<Scalars['Timestamp']>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    fingerprint: Scalars['String'];
    identifier?: Maybe<Scalars['String']>;
    user_properties?: Maybe<Scalars['String']>;
    request_id?: Maybe<Scalars['String']>;
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
    user_properties: Scalars['String'];
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
    environments?: Maybe<Array<Maybe<Scalars['String']>>>;
    app_versions?: Maybe<Array<Maybe<Scalars['String']>>>;
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
    show_live_sessions?: Maybe<Scalars['Boolean']>;
};

export type SearchParams = {
    __typename?: 'SearchParams';
    user_properties?: Maybe<Array<Maybe<UserProperty>>>;
    excluded_properties?: Maybe<Array<Maybe<UserProperty>>>;
    track_properties?: Maybe<Array<Maybe<UserProperty>>>;
    excluded_track_properties?: Maybe<Array<Maybe<UserProperty>>>;
    environments?: Maybe<Array<Maybe<Scalars['String']>>>;
    app_versions?: Maybe<Array<Maybe<Scalars['String']>>>;
    date_range?: Maybe<DateRange>;
    length_range?: Maybe<LengthRange>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    device_id?: Maybe<Scalars['String']>;
    referrer?: Maybe<Scalars['String']>;
    identified?: Maybe<Scalars['Boolean']>;
    hide_viewed?: Maybe<Scalars['Boolean']>;
    first_time?: Maybe<Scalars['Boolean']>;
    show_live_sessions?: Maybe<Scalars['Boolean']>;
};

export type ErrorSearchParamsInput = {
    date_range?: Maybe<DateRangeInput>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    state?: Maybe<ErrorState>;
    event?: Maybe<Scalars['String']>;
    type?: Maybe<Scalars['String']>;
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
    start_date?: Maybe<Scalars['Timestamp']>;
    end_date?: Maybe<Scalars['Timestamp']>;
};

export type DateRangeInput = {
    start_date?: Maybe<Scalars['Timestamp']>;
    end_date?: Maybe<Scalars['Timestamp']>;
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
    uid: Scalars['String'];
    email: Scalars['String'];
    photo_url?: Maybe<Scalars['String']>;
    role: Scalars['String'];
    slack_im_channel_id?: Maybe<Scalars['String']>;
    email_verified?: Maybe<Scalars['Boolean']>;
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
    project_id: Scalars['ID'];
    timestamp?: Maybe<Scalars['Int']>;
    created_at: Scalars['Timestamp'];
    updated_at: Scalars['Timestamp'];
    session_id: Scalars['Int'];
    session_secure_id: Scalars['String'];
    author?: Maybe<SanitizedAdmin>;
    text: Scalars['String'];
    x_coordinate?: Maybe<Scalars['Float']>;
    y_coordinate?: Maybe<Scalars['Float']>;
    type: SessionCommentType;
    metadata?: Maybe<Scalars['Any']>;
    tags: Array<Maybe<Scalars['String']>>;
};

export type SessionCommentTag = {
    __typename?: 'SessionCommentTag';
    id: Scalars['ID'];
    name: Scalars['String'];
};

export type SessionCommentTagInput = {
    id?: Maybe<Scalars['ID']>;
    name: Scalars['String'];
};

export type ErrorComment = {
    __typename?: 'ErrorComment';
    id: Scalars['ID'];
    project_id: Scalars['ID'];
    created_at: Scalars['Timestamp'];
    error_id: Scalars['Int'];
    error_secure_id: Scalars['String'];
    updated_at: Scalars['Timestamp'];
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
    project_id: Scalars['ID'];
    date: Scalars['Timestamp'];
    count: Scalars['Int64'];
};

export type DailyErrorCount = {
    __typename?: 'DailyErrorCount';
    project_id: Scalars['ID'];
    date: Scalars['Timestamp'];
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
    updated_at: Scalars['Timestamp'];
    Name?: Maybe<Scalars['String']>;
    ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>;
    ExcludedEnvironments: Array<Maybe<Scalars['String']>>;
    CountThreshold: Scalars['Int'];
    ThresholdWindow?: Maybe<Scalars['Int']>;
    LastAdminToEditID?: Maybe<Scalars['ID']>;
    Type: Scalars['String'];
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
    updated_at: Scalars['Timestamp'];
    Name?: Maybe<Scalars['String']>;
    ChannelsToNotify: Array<Maybe<SanitizedSlackChannel>>;
    ExcludedEnvironments: Array<Maybe<Scalars['String']>>;
    CountThreshold: Scalars['Int'];
    TrackProperties: Array<Maybe<TrackProperty>>;
    UserProperties: Array<Maybe<UserProperty>>;
    ThresholdWindow: Scalars['Int'];
    LastAdminToEditID?: Maybe<Scalars['ID']>;
    Type: Scalars['String'];
    ExcludeRules: Array<Maybe<Scalars['String']>>;
};

export type WorkspaceInviteLink = {
    __typename?: 'WorkspaceInviteLink';
    id: Scalars['ID'];
    invitee_email?: Maybe<Scalars['String']>;
    invitee_role: Scalars['String'];
    expiration_date: Scalars['Timestamp'];
    secret: Scalars['String'];
};

export type SessionPayload = {
    __typename?: 'SessionPayload';
    events: Array<Maybe<Scalars['Any']>>;
    errors: Array<Maybe<ErrorObject>>;
    rage_clicks: Array<RageClickEvent>;
    session_comments: Array<Maybe<SessionComment>>;
};

export type Query = {
    __typename?: 'Query';
    session?: Maybe<Session>;
    events?: Maybe<Array<Maybe<Scalars['Any']>>>;
    rage_clicks: Array<RageClickEvent>;
    rageClicksForProject: Array<RageClickEventForProject>;
    error_groups?: Maybe<ErrorResults>;
    error_group?: Maybe<ErrorGroup>;
    messages?: Maybe<Array<Maybe<Scalars['Any']>>>;
    enhanced_user_details?: Maybe<EnhancedUserDetailsResult>;
    errors?: Maybe<Array<Maybe<ErrorObject>>>;
    resources?: Maybe<Array<Maybe<Scalars['Any']>>>;
    session_comments: Array<Maybe<SessionComment>>;
    session_comment_tags_for_project: Array<SessionCommentTag>;
    session_comments_for_admin: Array<Maybe<SessionComment>>;
    session_comments_for_project: Array<Maybe<SessionComment>>;
    error_comments: Array<Maybe<ErrorComment>>;
    error_comments_for_admin: Array<Maybe<ErrorComment>>;
    error_comments_for_project: Array<Maybe<ErrorComment>>;
    project_admins: Array<Maybe<Admin>>;
    workspace_admins: Array<Maybe<Admin>>;
    isIntegrated?: Maybe<Scalars['Boolean']>;
    unprocessedSessionsCount?: Maybe<Scalars['Int64']>;
    adminHasCreatedComment?: Maybe<Scalars['Boolean']>;
    projectHasViewedASession?: Maybe<Session>;
    dailySessionsCount: Array<Maybe<DailySessionCount>>;
    dailyErrorsCount: Array<Maybe<DailyErrorCount>>;
    dailyErrorFrequency: Array<Maybe<Scalars['Int64']>>;
    referrers: Array<Maybe<ReferrerTablePayload>>;
    newUsersCount?: Maybe<NewUsersCount>;
    topUsers: Array<Maybe<TopUsersPayload>>;
    averageSessionLength?: Maybe<AverageSessionLength>;
    userFingerprintCount?: Maybe<UserFingerprintCount>;
    sessions: SessionResults;
    billingDetailsForProject: BillingDetails;
    billingDetails: BillingDetails;
    field_suggestion?: Maybe<Array<Maybe<Field>>>;
    property_suggestion?: Maybe<Array<Maybe<Field>>>;
    error_field_suggestion?: Maybe<Array<Maybe<ErrorField>>>;
    projects?: Maybe<Array<Maybe<Project>>>;
    workspaces?: Maybe<Array<Maybe<Workspace>>>;
    workspaces_count: Scalars['Int64'];
    joinable_workspaces?: Maybe<Array<Maybe<Workspace>>>;
    error_alerts: Array<Maybe<ErrorAlert>>;
    session_feedback_alerts: Array<Maybe<SessionAlert>>;
    new_user_alerts?: Maybe<Array<Maybe<SessionAlert>>>;
    track_properties_alerts: Array<Maybe<SessionAlert>>;
    user_properties_alerts: Array<Maybe<SessionAlert>>;
    new_session_alerts: Array<Maybe<SessionAlert>>;
    rage_click_alerts: Array<Maybe<SessionAlert>>;
    projectSuggestion: Array<Maybe<Project>>;
    workspaceSuggestion: Array<Maybe<Workspace>>;
    environment_suggestion?: Maybe<Array<Maybe<Field>>>;
    identifier_suggestion: Array<Maybe<Scalars['String']>>;
    app_version_suggestion: Array<Maybe<Scalars['String']>>;
    slack_channel_suggestion?: Maybe<Array<Maybe<SanitizedSlackChannel>>>;
    slack_members: Array<Maybe<SanitizedSlackChannel>>;
    is_integrated_with_slack: Scalars['Boolean'];
    project?: Maybe<Project>;
    workspace?: Maybe<Workspace>;
    workspace_invite_links: WorkspaceInviteLink;
    workspace_for_project?: Maybe<Workspace>;
    admin?: Maybe<Admin>;
    segments?: Maybe<Array<Maybe<Segment>>>;
    error_segments?: Maybe<Array<Maybe<ErrorSegment>>>;
    api_key_to_org_id?: Maybe<Scalars['ID']>;
    customer_portal_url: Scalars['String'];
    subscription_details: SubscriptionDetails;
};

export type QuerySessionArgs = {
    secure_id: Scalars['String'];
};

export type QueryEventsArgs = {
    session_secure_id: Scalars['String'];
};

export type QueryRage_ClicksArgs = {
    session_secure_id: Scalars['String'];
};

export type QueryRageClicksForProjectArgs = {
    project_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryError_GroupsArgs = {
    project_id: Scalars['ID'];
    count: Scalars['Int'];
    params?: Maybe<ErrorSearchParamsInput>;
};

export type QueryError_GroupArgs = {
    secure_id: Scalars['String'];
};

export type QueryMessagesArgs = {
    session_secure_id: Scalars['String'];
};

export type QueryEnhanced_User_DetailsArgs = {
    session_secure_id: Scalars['String'];
};

export type QueryErrorsArgs = {
    session_secure_id: Scalars['String'];
};

export type QueryResourcesArgs = {
    session_secure_id: Scalars['String'];
};

export type QuerySession_CommentsArgs = {
    session_secure_id: Scalars['String'];
};

export type QuerySession_Comment_Tags_For_ProjectArgs = {
    project_id: Scalars['ID'];
};

export type QuerySession_Comments_For_ProjectArgs = {
    project_id: Scalars['ID'];
};

export type QueryError_CommentsArgs = {
    error_group_secure_id: Scalars['String'];
};

export type QueryError_Comments_For_ProjectArgs = {
    project_id: Scalars['ID'];
};

export type QueryProject_AdminsArgs = {
    project_id: Scalars['ID'];
};

export type QueryWorkspace_AdminsArgs = {
    workspace_id: Scalars['ID'];
};

export type QueryIsIntegratedArgs = {
    project_id: Scalars['ID'];
};

export type QueryUnprocessedSessionsCountArgs = {
    project_id: Scalars['ID'];
};

export type QueryAdminHasCreatedCommentArgs = {
    admin_id: Scalars['ID'];
};

export type QueryProjectHasViewedASessionArgs = {
    project_id: Scalars['ID'];
};

export type QueryDailySessionsCountArgs = {
    project_id: Scalars['ID'];
    date_range: DateRangeInput;
};

export type QueryDailyErrorsCountArgs = {
    project_id: Scalars['ID'];
    date_range: DateRangeInput;
};

export type QueryDailyErrorFrequencyArgs = {
    project_id: Scalars['ID'];
    error_group_secure_id: Scalars['String'];
    date_offset: Scalars['Int'];
};

export type QueryReferrersArgs = {
    project_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryNewUsersCountArgs = {
    project_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryTopUsersArgs = {
    project_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryAverageSessionLengthArgs = {
    project_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QueryUserFingerprintCountArgs = {
    project_id: Scalars['ID'];
    lookBackPeriod: Scalars['Int'];
};

export type QuerySessionsArgs = {
    project_id: Scalars['ID'];
    count: Scalars['Int'];
    lifecycle: SessionLifecycle;
    starred: Scalars['Boolean'];
    params?: Maybe<SearchParamsInput>;
};

export type QueryBillingDetailsForProjectArgs = {
    project_id: Scalars['ID'];
};

export type QueryBillingDetailsArgs = {
    workspace_id: Scalars['ID'];
};

export type QueryField_SuggestionArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    query: Scalars['String'];
};

export type QueryProperty_SuggestionArgs = {
    project_id: Scalars['ID'];
    query: Scalars['String'];
    type: Scalars['String'];
};

export type QueryError_Field_SuggestionArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    query: Scalars['String'];
};

export type QueryError_AlertsArgs = {
    project_id: Scalars['ID'];
};

export type QuerySession_Feedback_AlertsArgs = {
    project_id: Scalars['ID'];
};

export type QueryNew_User_AlertsArgs = {
    project_id: Scalars['ID'];
};

export type QueryTrack_Properties_AlertsArgs = {
    project_id: Scalars['ID'];
};

export type QueryUser_Properties_AlertsArgs = {
    project_id: Scalars['ID'];
};

export type QueryNew_Session_AlertsArgs = {
    project_id: Scalars['ID'];
};

export type QueryRage_Click_AlertsArgs = {
    project_id: Scalars['ID'];
};

export type QueryProjectSuggestionArgs = {
    query: Scalars['String'];
};

export type QueryWorkspaceSuggestionArgs = {
    query: Scalars['String'];
};

export type QueryEnvironment_SuggestionArgs = {
    project_id: Scalars['ID'];
};

export type QueryIdentifier_SuggestionArgs = {
    project_id: Scalars['ID'];
};

export type QueryApp_Version_SuggestionArgs = {
    project_id: Scalars['ID'];
};

export type QuerySlack_Channel_SuggestionArgs = {
    project_id: Scalars['ID'];
};

export type QuerySlack_MembersArgs = {
    project_id: Scalars['ID'];
};

export type QueryIs_Integrated_With_SlackArgs = {
    project_id: Scalars['ID'];
};

export type QueryProjectArgs = {
    id: Scalars['ID'];
};

export type QueryWorkspaceArgs = {
    id: Scalars['ID'];
};

export type QueryWorkspace_Invite_LinksArgs = {
    workspace_id: Scalars['ID'];
};

export type QueryWorkspace_For_ProjectArgs = {
    project_id: Scalars['ID'];
};

export type QuerySegmentsArgs = {
    project_id: Scalars['ID'];
};

export type QueryError_SegmentsArgs = {
    project_id: Scalars['ID'];
};

export type QueryApi_Key_To_Org_IdArgs = {
    api_key: Scalars['String'];
};

export type QueryCustomer_Portal_UrlArgs = {
    workspace_id: Scalars['ID'];
};

export type QuerySubscription_DetailsArgs = {
    workspace_id: Scalars['ID'];
};

export type Mutation = {
    __typename?: 'Mutation';
    createProject?: Maybe<Project>;
    createWorkspace?: Maybe<Workspace>;
    editProject?: Maybe<Project>;
    editWorkspace?: Maybe<Workspace>;
    markSessionAsViewed?: Maybe<Session>;
    markSessionAsStarred?: Maybe<Session>;
    updateErrorGroupState?: Maybe<ErrorGroup>;
    deleteProject?: Maybe<Scalars['Boolean']>;
    sendAdminProjectInvite?: Maybe<Scalars['String']>;
    sendAdminWorkspaceInvite?: Maybe<Scalars['String']>;
    addAdminToWorkspace?: Maybe<Scalars['ID']>;
    joinWorkspace?: Maybe<Scalars['ID']>;
    updateAllowedEmailOrigins?: Maybe<Scalars['ID']>;
    changeAdminRole: Scalars['Boolean'];
    deleteAdminFromProject?: Maybe<Scalars['ID']>;
    deleteAdminFromWorkspace?: Maybe<Scalars['ID']>;
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
    addSlackBotIntegrationToProject: Scalars['Boolean'];
    createDefaultAlerts?: Maybe<Scalars['Boolean']>;
    createRageClickAlert?: Maybe<SessionAlert>;
    createErrorAlert?: Maybe<ErrorAlert>;
    updateErrorAlert?: Maybe<ErrorAlert>;
    deleteErrorAlert?: Maybe<ErrorAlert>;
    updateSessionFeedbackAlert?: Maybe<SessionAlert>;
    createSessionFeedbackAlert?: Maybe<SessionAlert>;
    updateRageClickAlert?: Maybe<SessionAlert>;
    updateNewUserAlert?: Maybe<SessionAlert>;
    createNewUserAlert?: Maybe<SessionAlert>;
    updateTrackPropertiesAlert?: Maybe<SessionAlert>;
    createTrackPropertiesAlert?: Maybe<SessionAlert>;
    createUserPropertiesAlert?: Maybe<SessionAlert>;
    deleteSessionAlert?: Maybe<SessionAlert>;
    updateUserPropertiesAlert?: Maybe<SessionAlert>;
    updateNewSessionAlert?: Maybe<SessionAlert>;
    createNewSessionAlert?: Maybe<SessionAlert>;
    updateSessionIsPublic?: Maybe<Session>;
    updateErrorGroupIsPublic?: Maybe<ErrorGroup>;
    updateAllowMeterOverage?: Maybe<Workspace>;
    submitRegistrationForm?: Maybe<Scalars['Boolean']>;
};

export type MutationCreateProjectArgs = {
    name: Scalars['String'];
    workspace_id: Scalars['ID'];
};

export type MutationCreateWorkspaceArgs = {
    name: Scalars['String'];
};

export type MutationEditProjectArgs = {
    id: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
    billing_email?: Maybe<Scalars['String']>;
};

export type MutationEditWorkspaceArgs = {
    id: Scalars['ID'];
    name?: Maybe<Scalars['String']>;
};

export type MutationMarkSessionAsViewedArgs = {
    secure_id: Scalars['String'];
    viewed?: Maybe<Scalars['Boolean']>;
};

export type MutationMarkSessionAsStarredArgs = {
    secure_id: Scalars['String'];
    starred?: Maybe<Scalars['Boolean']>;
};

export type MutationUpdateErrorGroupStateArgs = {
    secure_id: Scalars['String'];
    state: Scalars['String'];
};

export type MutationDeleteProjectArgs = {
    id: Scalars['ID'];
};

export type MutationSendAdminProjectInviteArgs = {
    project_id: Scalars['ID'];
    email: Scalars['String'];
    base_url: Scalars['String'];
};

export type MutationSendAdminWorkspaceInviteArgs = {
    workspace_id: Scalars['ID'];
    email: Scalars['String'];
    base_url: Scalars['String'];
    role: Scalars['String'];
};

export type MutationAddAdminToWorkspaceArgs = {
    workspace_id: Scalars['ID'];
    invite_id: Scalars['String'];
};

export type MutationJoinWorkspaceArgs = {
    workspace_id: Scalars['ID'];
};

export type MutationUpdateAllowedEmailOriginsArgs = {
    workspace_id: Scalars['ID'];
    allowed_auto_join_email_origins: Scalars['String'];
};

export type MutationChangeAdminRoleArgs = {
    workspace_id: Scalars['ID'];
    admin_id: Scalars['ID'];
    new_role: Scalars['String'];
};

export type MutationDeleteAdminFromProjectArgs = {
    project_id: Scalars['ID'];
    admin_id: Scalars['ID'];
};

export type MutationDeleteAdminFromWorkspaceArgs = {
    workspace_id: Scalars['ID'];
    admin_id: Scalars['ID'];
};

export type MutationCreateSegmentArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    params: SearchParamsInput;
};

export type MutationEmailSignupArgs = {
    email: Scalars['String'];
};

export type MutationEditSegmentArgs = {
    id: Scalars['ID'];
    project_id: Scalars['ID'];
    params: SearchParamsInput;
};

export type MutationDeleteSegmentArgs = {
    segment_id: Scalars['ID'];
};

export type MutationCreateErrorSegmentArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    params: ErrorSearchParamsInput;
};

export type MutationEditErrorSegmentArgs = {
    id: Scalars['ID'];
    project_id: Scalars['ID'];
    params: ErrorSearchParamsInput;
};

export type MutationDeleteErrorSegmentArgs = {
    segment_id: Scalars['ID'];
};

export type MutationCreateOrUpdateStripeSubscriptionArgs = {
    workspace_id: Scalars['ID'];
    plan_type: PlanType;
    interval: SubscriptionInterval;
};

export type MutationUpdateBillingDetailsArgs = {
    workspace_id: Scalars['ID'];
};

export type MutationCreateSessionCommentArgs = {
    project_id: Scalars['ID'];
    session_secure_id: Scalars['String'];
    session_timestamp: Scalars['Int'];
    text: Scalars['String'];
    text_for_email: Scalars['String'];
    x_coordinate: Scalars['Float'];
    y_coordinate: Scalars['Float'];
    tagged_admins: Array<Maybe<SanitizedAdminInput>>;
    tagged_slack_users: Array<Maybe<SanitizedSlackChannelInput>>;
    session_url: Scalars['String'];
    time: Scalars['Float'];
    author_name: Scalars['String'];
    session_image?: Maybe<Scalars['String']>;
    tags: Array<Maybe<SessionCommentTagInput>>;
};

export type MutationDeleteSessionCommentArgs = {
    id: Scalars['ID'];
};

export type MutationCreateErrorCommentArgs = {
    project_id: Scalars['ID'];
    error_group_secure_id: Scalars['String'];
    text: Scalars['String'];
    text_for_email: Scalars['String'];
    tagged_admins: Array<Maybe<SanitizedAdminInput>>;
    tagged_slack_users: Array<Maybe<SanitizedSlackChannelInput>>;
    error_url: Scalars['String'];
    author_name: Scalars['String'];
};

export type MutationDeleteErrorCommentArgs = {
    id: Scalars['ID'];
};

export type MutationOpenSlackConversationArgs = {
    project_id: Scalars['ID'];
    code: Scalars['String'];
    redirect_path: Scalars['String'];
};

export type MutationAddSlackBotIntegrationToProjectArgs = {
    project_id: Scalars['ID'];
    code: Scalars['String'];
    redirect_path: Scalars['String'];
};

export type MutationCreateDefaultAlertsArgs = {
    project_id: Scalars['ID'];
    alert_types: Array<Scalars['String']>;
    slack_channels: Array<SanitizedSlackChannelInput>;
};

export type MutationCreateRageClickAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationCreateErrorAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateErrorAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    error_alert_id: Scalars['ID'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationDeleteErrorAlertArgs = {
    project_id: Scalars['ID'];
    error_alert_id: Scalars['ID'];
};

export type MutationUpdateSessionFeedbackAlertArgs = {
    project_id: Scalars['ID'];
    session_feedback_alert_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationCreateSessionFeedbackAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateRageClickAlertArgs = {
    project_id: Scalars['ID'];
    rage_click_alert_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateNewUserAlertArgs = {
    project_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    threshold_window: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
};

export type MutationCreateNewUserAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    threshold_window: Scalars['Int'];
};

export type MutationUpdateTrackPropertiesAlertArgs = {
    project_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
    name: Scalars['String'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    track_properties: Array<Maybe<TrackPropertyInput>>;
    threshold_window: Scalars['Int'];
};

export type MutationCreateTrackPropertiesAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    track_properties: Array<Maybe<TrackPropertyInput>>;
    threshold_window: Scalars['Int'];
};

export type MutationCreateUserPropertiesAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    user_properties: Array<Maybe<UserPropertyInput>>;
    threshold_window: Scalars['Int'];
};

export type MutationDeleteSessionAlertArgs = {
    project_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
};

export type MutationUpdateUserPropertiesAlertArgs = {
    project_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
    name: Scalars['String'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    user_properties: Array<Maybe<UserPropertyInput>>;
    threshold_window: Scalars['Int'];
};

export type MutationUpdateNewSessionAlertArgs = {
    project_id: Scalars['ID'];
    session_alert_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    threshold_window: Scalars['Int'];
    exclude_rules: Array<Maybe<Scalars['String']>>;
};

export type MutationCreateNewSessionAlertArgs = {
    project_id: Scalars['ID'];
    name: Scalars['String'];
    count_threshold: Scalars['Int'];
    slack_channels: Array<Maybe<SanitizedSlackChannelInput>>;
    environments: Array<Maybe<Scalars['String']>>;
    threshold_window: Scalars['Int'];
    exclude_rules: Array<Maybe<Scalars['String']>>;
};

export type MutationUpdateSessionIsPublicArgs = {
    session_secure_id: Scalars['String'];
    is_public: Scalars['Boolean'];
};

export type MutationUpdateErrorGroupIsPublicArgs = {
    error_group_secure_id: Scalars['String'];
    is_public: Scalars['Boolean'];
};

export type MutationUpdateAllowMeterOverageArgs = {
    workspace_id: Scalars['ID'];
    allow_meter_overage: Scalars['Boolean'];
};

export type MutationSubmitRegistrationFormArgs = {
    workspace_id: Scalars['ID'];
    team_size: Scalars['String'];
    role: Scalars['String'];
    use_case: Scalars['String'];
    heard_about: Scalars['String'];
    pun?: Maybe<Scalars['String']>;
};

export type Subscription = {
    __typename?: 'Subscription';
    session_payload_appended?: Maybe<SessionPayload>;
};

export type SubscriptionSession_Payload_AppendedArgs = {
    session_secure_id: Scalars['String'];
    initial_events_count: Scalars['Int'];
};
