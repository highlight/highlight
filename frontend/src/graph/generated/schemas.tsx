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
};

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
    billing_email?: Maybe<Scalars['String']>;
    trial_end_date?: Maybe<Scalars['Time']>;
};

export type Segment = {
    __typename?: 'Segment';
    id: Scalars['ID'];
    name: Scalars['String'];
    params: SearchParams;
    organization_id: Scalars['ID'];
};

export type ErrorObject = {
    __typename?: 'ErrorObject';
    id: Scalars['ID'];
    organization_id: Scalars['Int'];
    session_id: Scalars['Int'];
    event: Scalars['String'];
    type: Scalars['String'];
    source?: Maybe<Scalars['String']>;
    line_no?: Maybe<Scalars['Int']>;
    column_no?: Maybe<Scalars['Int']>;
    trace?: Maybe<Scalars['String']>;
};

export type SearchParamsInput = {
    user_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    excluded_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    track_properties?: Maybe<Array<Maybe<UserPropertyInput>>>;
    date_range?: Maybe<DateRangeInput>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    referrer?: Maybe<Scalars['String']>;
    identified?: Maybe<Scalars['Boolean']>;
    hide_viewed?: Maybe<Scalars['Boolean']>;
};

export type SearchParams = {
    __typename?: 'SearchParams';
    user_properties?: Maybe<Array<Maybe<UserProperty>>>;
    excluded_properties?: Maybe<Array<Maybe<UserProperty>>>;
    track_properties?: Maybe<Array<Maybe<UserProperty>>>;
    date_range?: Maybe<DateRange>;
    os?: Maybe<Scalars['String']>;
    browser?: Maybe<Scalars['String']>;
    visited_url?: Maybe<Scalars['String']>;
    referrer?: Maybe<Scalars['String']>;
    identified?: Maybe<Scalars['Boolean']>;
    hide_viewed?: Maybe<Scalars['Boolean']>;
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

export type SessionResults = {
    __typename?: 'SessionResults';
    sessions: Array<Maybe<Session>>;
    totalCount: Scalars['Int'];
};

export type Query = {
    __typename?: 'Query';
    session?: Maybe<Session>;
    events?: Maybe<Array<Maybe<Scalars['Any']>>>;
    errors?: Maybe<Array<Maybe<ErrorObject>>>;
    messages?: Maybe<Array<Maybe<Scalars['Any']>>>;
    resources?: Maybe<Array<Maybe<Scalars['Any']>>>;
    admins?: Maybe<Array<Maybe<Admin>>>;
    isIntegrated?: Maybe<Scalars['Boolean']>;
    sessionsBETA?: Maybe<SessionResults>;
    billingDetails: Plan;
    field_suggestionBETA?: Maybe<Array<Maybe<Field>>>;
    property_suggestion?: Maybe<Array<Maybe<Field>>>;
    organizations?: Maybe<Array<Maybe<Organization>>>;
    organization?: Maybe<Organization>;
    admin?: Maybe<Admin>;
    segments?: Maybe<Array<Maybe<Segment>>>;
    recording_settings?: Maybe<RecordingSettings>;
};

export type QuerySessionArgs = {
    id: Scalars['ID'];
};

export type QueryEventsArgs = {
    session_id: Scalars['ID'];
};

export type QueryErrorsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryMessagesArgs = {
    session_id: Scalars['ID'];
};

export type QueryResourcesArgs = {
    session_id: Scalars['ID'];
};

export type QueryAdminsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryIsIntegratedArgs = {
    organization_id: Scalars['ID'];
};

export type QuerySessionsBetaArgs = {
    organization_id: Scalars['ID'];
    count: Scalars['Int'];
    params?: Maybe<SearchParamsInput>;
};

export type QueryBillingDetailsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryField_SuggestionBetaArgs = {
    organization_id: Scalars['ID'];
    name: Scalars['String'];
    query: Scalars['String'];
};

export type QueryProperty_SuggestionArgs = {
    organization_id: Scalars['ID'];
    query: Scalars['String'];
    type: Scalars['String'];
};

export type QueryOrganizationArgs = {
    id: Scalars['ID'];
};

export type QuerySegmentsArgs = {
    organization_id: Scalars['ID'];
};

export type QueryRecording_SettingsArgs = {
    organization_id: Scalars['ID'];
};

export enum Plan {
    None = 'None',
    Basic = 'Basic',
    Startup = 'Startup',
    Enterprise = 'Enterprise',
}

export type Mutation = {
    __typename?: 'Mutation';
    createOrganization?: Maybe<Organization>;
    editOrganization?: Maybe<Organization>;
    markSessionAsViewed?: Maybe<Session>;
    deleteOrganization?: Maybe<Scalars['Boolean']>;
    sendAdminInvite?: Maybe<Scalars['String']>;
    addAdminToOrganization?: Maybe<Scalars['ID']>;
    createSegment?: Maybe<Segment>;
    editSegment?: Maybe<Scalars['Boolean']>;
    deleteSegment?: Maybe<Scalars['Boolean']>;
    editRecordingSettings?: Maybe<RecordingSettings>;
    createOrUpdateSubscription?: Maybe<Scalars['String']>;
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

export type MutationCreateSegmentArgs = {
    organization_id: Scalars['ID'];
    name: Scalars['String'];
    params: SearchParamsInput;
};

export type MutationEditSegmentArgs = {
    id: Scalars['ID'];
    organization_id: Scalars['ID'];
    params: SearchParamsInput;
};

export type MutationDeleteSegmentArgs = {
    segment_id: Scalars['ID'];
};

export type MutationEditRecordingSettingsArgs = {
    organization_id: Scalars['ID'];
    details?: Maybe<Scalars['String']>;
};

export type MutationCreateOrUpdateSubscriptionArgs = {
    organization_id: Scalars['ID'];
    plan: Plan;
};
