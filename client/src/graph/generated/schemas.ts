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
};

export type Session = {
    __typename?: 'Session';
    id: Scalars['ID'];
    secure_id: Scalars['String'];
    organization_id: Scalars['ID'];
    project_id: Scalars['ID'];
};

export type StackFrameInput = {
    functionName?: Maybe<Scalars['String']>;
    args?: Maybe<Array<Maybe<Scalars['Any']>>>;
    fileName?: Maybe<Scalars['String']>;
    lineNumber?: Maybe<Scalars['Int']>;
    columnNumber?: Maybe<Scalars['Int']>;
    isEval?: Maybe<Scalars['Boolean']>;
    isNative?: Maybe<Scalars['Boolean']>;
    source?: Maybe<Scalars['String']>;
};

export type ErrorObjectInput = {
    event: Scalars['String'];
    type: Scalars['String'];
    url: Scalars['String'];
    source: Scalars['String'];
    lineNumber: Scalars['Int'];
    columnNumber: Scalars['Int'];
    stackTrace: Array<Maybe<StackFrameInput>>;
    timestamp: Scalars['Timestamp'];
    payload?: Maybe<Scalars['String']>;
};

export type BackendErrorObjectInput = {
    session_secure_id: Scalars['String'];
    request_id: Scalars['String'];
    event: Scalars['String'];
    type: Scalars['String'];
    url: Scalars['String'];
    source: Scalars['String'];
    stackTrace: Scalars['String'];
    timestamp: Scalars['Timestamp'];
    payload?: Maybe<Scalars['String']>;
};

export enum MetricType {
    WebVital = 'WebVital',
    Device = 'Device',
    Backend = 'Backend',
    Frontend = 'Frontend',
}

export type MetricInput = {
    session_secure_id: Scalars['String'];
    name: Scalars['String'];
    value: Scalars['Float'];
    type: MetricType;
    url: Scalars['String'];
    timestamp: Scalars['Timestamp'];
    request_id?: Maybe<Scalars['String']>;
};

export type DeviceMetricInput = {
    name: Scalars['String'];
    value: Scalars['Float'];
};

export type ReplayEventInput = {
    type: Scalars['Int'];
    timestamp: Scalars['Float'];
    _sid: Scalars['Float'];
    data: Scalars['Any'];
};

export type ReplayEventsInput = {
    events: Array<Maybe<ReplayEventInput>>;
};

export type Mutation = {
    __typename?: 'Mutation';
    initializeSession?: Maybe<Session>;
    identifySession?: Maybe<Scalars['ID']>;
    addTrackProperties?: Maybe<Scalars['ID']>;
    addSessionProperties?: Maybe<Scalars['ID']>;
    pushPayload: Scalars['Int'];
    pushBackendPayload?: Maybe<Scalars['Any']>;
    pushMetrics: Scalars['ID'];
    markBackendSetup: Scalars['ID'];
    addSessionFeedback: Scalars['ID'];
    addWebVitals: Scalars['ID'];
    addDeviceMetric: Scalars['ID'];
};

export type MutationInitializeSessionArgs = {
    organization_verbose_id: Scalars['String'];
    enable_strict_privacy: Scalars['Boolean'];
    enable_recording_network_contents: Scalars['Boolean'];
    clientVersion: Scalars['String'];
    firstloadVersion: Scalars['String'];
    clientConfig: Scalars['String'];
    environment: Scalars['String'];
    appVersion?: Maybe<Scalars['String']>;
    fingerprint: Scalars['String'];
    session_secure_id?: Maybe<Scalars['String']>;
};

export type MutationIdentifySessionArgs = {
    session_id: Scalars['ID'];
    user_identifier: Scalars['String'];
    user_object?: Maybe<Scalars['Any']>;
};

export type MutationAddTrackPropertiesArgs = {
    session_id: Scalars['ID'];
    properties_object?: Maybe<Scalars['Any']>;
};

export type MutationAddSessionPropertiesArgs = {
    session_id: Scalars['ID'];
    properties_object?: Maybe<Scalars['Any']>;
};

export type MutationPushPayloadArgs = {
    session_id: Scalars['ID'];
    events: ReplayEventsInput;
    messages: Scalars['String'];
    resources: Scalars['String'];
    errors: Array<Maybe<ErrorObjectInput>>;
    is_beacon?: Maybe<Scalars['Boolean']>;
    has_session_unloaded?: Maybe<Scalars['Boolean']>;
    highlight_logs?: Maybe<Scalars['String']>;
};

export type MutationPushBackendPayloadArgs = {
    errors: Array<Maybe<BackendErrorObjectInput>>;
};

export type MutationPushMetricsArgs = {
    metrics: Array<Maybe<MetricInput>>;
};

export type MutationMarkBackendSetupArgs = {
    session_secure_id: Scalars['String'];
};

export type MutationAddSessionFeedbackArgs = {
    session_id: Scalars['ID'];
    user_name?: Maybe<Scalars['String']>;
    user_email?: Maybe<Scalars['String']>;
    verbatim: Scalars['String'];
    timestamp: Scalars['Timestamp'];
};

export type MutationAddWebVitalsArgs = {
    session_id: Scalars['ID'];
    metric: WebVitalMetricInput;
};

export type MutationAddDeviceMetricArgs = {
    session_id: Scalars['ID'];
    metric: DeviceMetricInput;
};

export type WebVitalMetricInput = {
    name: Scalars['String'];
    value: Scalars['Float'];
};

export type Query = {
    __typename?: 'Query';
    ignore?: Maybe<Scalars['Any']>;
};

export type QueryIgnoreArgs = {
    id: Scalars['ID'];
};
