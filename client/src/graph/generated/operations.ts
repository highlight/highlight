import * as Types from './schemas';

import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
    {
        [SubKey in K]?: Maybe<T[SubKey]>;
    };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
    {
        [SubKey in K]: Maybe<T[SubKey]>;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    Any: any;
    Int64: any;
    Timestamp: any;
};

export type BackendErrorObjectInput = {
    event: Scalars['String'];
    payload?: InputMaybe<Scalars['String']>;
    request_id: Scalars['String'];
    session_secure_id: Scalars['String'];
    source: Scalars['String'];
    stackTrace: Scalars['String'];
    timestamp: Scalars['Timestamp'];
    type: Scalars['String'];
    url: Scalars['String'];
};

export type ErrorObjectInput = {
    columnNumber: Scalars['Int'];
    event: Scalars['String'];
    lineNumber: Scalars['Int'];
    payload?: InputMaybe<Scalars['String']>;
    source: Scalars['String'];
    stackTrace: Array<InputMaybe<StackFrameInput>>;
    timestamp: Scalars['Timestamp'];
    type: Scalars['String'];
    url: Scalars['String'];
};

export type MetricInput = {
    category?: InputMaybe<Scalars['String']>;
    group?: InputMaybe<Scalars['String']>;
    name: Scalars['String'];
    session_secure_id: Scalars['String'];
    timestamp: Scalars['Timestamp'];
    type?: InputMaybe<Scalars['Any']>;
    url?: InputMaybe<Scalars['String']>;
    value: Scalars['Float'];
};

export type Mutation = {
    __typename?: 'Mutation';
    addSessionFeedback: Scalars['ID'];
    addSessionProperties?: Maybe<Scalars['ID']>;
    addTrackProperties?: Maybe<Scalars['ID']>;
    identifySession?: Maybe<Scalars['ID']>;
    initializeSession?: Maybe<Session>;
    markBackendSetup: Scalars['ID'];
    pushBackendPayload?: Maybe<Scalars['Any']>;
    pushMetrics: Scalars['ID'];
    pushPayload: Scalars['Int'];
};

export type MutationAddSessionFeedbackArgs = {
    session_id: Scalars['ID'];
    timestamp: Scalars['Timestamp'];
    user_email?: InputMaybe<Scalars['String']>;
    user_name?: InputMaybe<Scalars['String']>;
    verbatim: Scalars['String'];
};

export type MutationAddSessionPropertiesArgs = {
    properties_object?: InputMaybe<Scalars['Any']>;
    session_id: Scalars['ID'];
};

export type MutationAddTrackPropertiesArgs = {
    properties_object?: InputMaybe<Scalars['Any']>;
    session_id: Scalars['ID'];
};

export type MutationIdentifySessionArgs = {
    session_id: Scalars['ID'];
    user_identifier: Scalars['String'];
    user_object?: InputMaybe<Scalars['Any']>;
};

export type MutationInitializeSessionArgs = {
    appVersion?: InputMaybe<Scalars['String']>;
    clientConfig: Scalars['String'];
    clientVersion: Scalars['String'];
    client_id?: InputMaybe<Scalars['String']>;
    enable_recording_network_contents: Scalars['Boolean'];
    enable_strict_privacy: Scalars['Boolean'];
    environment: Scalars['String'];
    fingerprint: Scalars['String'];
    firstloadVersion: Scalars['String'];
    organization_verbose_id: Scalars['String'];
    session_secure_id?: InputMaybe<Scalars['String']>;
};

export type MutationMarkBackendSetupArgs = {
    session_secure_id: Scalars['String'];
};

export type MutationPushBackendPayloadArgs = {
    errors: Array<InputMaybe<BackendErrorObjectInput>>;
};

export type MutationPushMetricsArgs = {
    metrics: Array<InputMaybe<MetricInput>>;
};

export type MutationPushPayloadArgs = {
    errors: Array<InputMaybe<ErrorObjectInput>>;
    events: ReplayEventsInput;
    has_session_unloaded?: InputMaybe<Scalars['Boolean']>;
    highlight_logs?: InputMaybe<Scalars['String']>;
    is_beacon?: InputMaybe<Scalars['Boolean']>;
    messages: Scalars['String'];
    resources: Scalars['String'];
    session_id: Scalars['ID'];
};

export type Query = {
    __typename?: 'Query';
    ignore?: Maybe<Scalars['Any']>;
};

export type QueryIgnoreArgs = {
    id: Scalars['ID'];
};

export type ReplayEventInput = {
    _sid: Scalars['Float'];
    data: Scalars['Any'];
    timestamp: Scalars['Float'];
    type: Scalars['Int'];
};

export type ReplayEventsInput = {
    events: Array<InputMaybe<ReplayEventInput>>;
};

export type Session = {
    __typename?: 'Session';
    id: Scalars['ID'];
    organization_id: Scalars['ID'];
    project_id: Scalars['ID'];
    secure_id: Scalars['String'];
};

export type StackFrameInput = {
    args?: InputMaybe<Array<InputMaybe<Scalars['Any']>>>;
    columnNumber?: InputMaybe<Scalars['Int']>;
    fileName?: InputMaybe<Scalars['String']>;
    functionName?: InputMaybe<Scalars['String']>;
    isEval?: InputMaybe<Scalars['Boolean']>;
    isNative?: InputMaybe<Scalars['Boolean']>;
    lineNumber?: InputMaybe<Scalars['Int']>;
    source?: InputMaybe<Scalars['String']>;
};

export type PushPayloadMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    events: Types.ReplayEventsInput;
    messages: Types.Scalars['String'];
    resources: Types.Scalars['String'];
    errors:
        | Array<Types.InputMaybe<Types.ErrorObjectInput>>
        | Types.InputMaybe<Types.ErrorObjectInput>;
    is_beacon?: Types.InputMaybe<Types.Scalars['Boolean']>;
    has_session_unloaded?: Types.InputMaybe<Types.Scalars['Boolean']>;
    highlight_logs?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type PushPayloadMutation = {
    __typename?: 'Mutation';
    pushPayload: number;
};

export type IdentifySessionMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    user_identifier: Types.Scalars['String'];
    user_object?: Types.InputMaybe<Types.Scalars['Any']>;
}>;

export type IdentifySessionMutation = {
    __typename?: 'Mutation';
    identifySession?: string | null;
};

export type AddSessionPropertiesMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    properties_object?: Types.InputMaybe<Types.Scalars['Any']>;
}>;

export type AddSessionPropertiesMutation = {
    __typename?: 'Mutation';
    addSessionProperties?: string | null;
};

export type PushMetricsMutationVariables = Types.Exact<{
    metrics:
        | Array<Types.InputMaybe<Types.MetricInput>>
        | Types.InputMaybe<Types.MetricInput>;
}>;

export type PushMetricsMutation = {
    __typename?: 'Mutation';
    pushMetrics: string;
};

export type AddTrackPropertiesMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    properties_object?: Types.InputMaybe<Types.Scalars['Any']>;
}>;

export type AddTrackPropertiesMutation = {
    __typename?: 'Mutation';
    addTrackProperties?: string | null;
};

export type AddSessionFeedbackMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    user_name?: Types.InputMaybe<Types.Scalars['String']>;
    user_email?: Types.InputMaybe<Types.Scalars['String']>;
    verbatim: Types.Scalars['String'];
    timestamp: Types.Scalars['Timestamp'];
}>;

export type AddSessionFeedbackMutation = {
    __typename?: 'Mutation';
    addSessionFeedback: string;
};

export type InitializeSessionMutationVariables = Types.Exact<{
    organization_verbose_id: Types.Scalars['String'];
    enable_strict_privacy: Types.Scalars['Boolean'];
    enable_recording_network_contents: Types.Scalars['Boolean'];
    clientVersion: Types.Scalars['String'];
    firstloadVersion: Types.Scalars['String'];
    clientConfig: Types.Scalars['String'];
    environment: Types.Scalars['String'];
    id: Types.Scalars['String'];
    appVersion?: Types.InputMaybe<Types.Scalars['String']>;
    session_secure_id?: Types.InputMaybe<Types.Scalars['String']>;
    client_id?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type InitializeSessionMutation = {
    __typename?: 'Mutation';
    initializeSession?: {
        __typename?: 'Session';
        id: string;
        secure_id: string;
        organization_id: string;
        project_id: string;
    } | null;
};

export type IgnoreQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type IgnoreQuery = { __typename?: 'Query'; ignore?: any | null };

export const PushPayloadDocument = gql`
    mutation PushPayload(
        $session_id: ID!
        $events: ReplayEventsInput!
        $messages: String!
        $resources: String!
        $errors: [ErrorObjectInput]!
        $is_beacon: Boolean
        $has_session_unloaded: Boolean
        $highlight_logs: String
    ) {
        pushPayload(
            session_id: $session_id
            events: $events
            messages: $messages
            resources: $resources
            errors: $errors
            is_beacon: $is_beacon
            has_session_unloaded: $has_session_unloaded
            highlight_logs: $highlight_logs
        )
    }
`;
export const IdentifySessionDocument = gql`
    mutation identifySession(
        $session_id: ID!
        $user_identifier: String!
        $user_object: Any
    ) {
        identifySession(
            session_id: $session_id
            user_identifier: $user_identifier
            user_object: $user_object
        )
    }
`;
export const AddSessionPropertiesDocument = gql`
    mutation addSessionProperties($session_id: ID!, $properties_object: Any) {
        addSessionProperties(
            session_id: $session_id
            properties_object: $properties_object
        )
    }
`;
export const PushMetricsDocument = gql`
    mutation pushMetrics($metrics: [MetricInput]!) {
        pushMetrics(metrics: $metrics)
    }
`;
export const AddTrackPropertiesDocument = gql`
    mutation addTrackProperties($session_id: ID!, $properties_object: Any) {
        addTrackProperties(
            session_id: $session_id
            properties_object: $properties_object
        )
    }
`;
export const AddSessionFeedbackDocument = gql`
    mutation addSessionFeedback(
        $session_id: ID!
        $user_name: String
        $user_email: String
        $verbatim: String!
        $timestamp: Timestamp!
    ) {
        addSessionFeedback(
            session_id: $session_id
            user_name: $user_name
            user_email: $user_email
            verbatim: $verbatim
            timestamp: $timestamp
        )
    }
`;
export const InitializeSessionDocument = gql`
    mutation initializeSession(
        $organization_verbose_id: String!
        $enable_strict_privacy: Boolean!
        $enable_recording_network_contents: Boolean!
        $clientVersion: String!
        $firstloadVersion: String!
        $clientConfig: String!
        $environment: String!
        $id: String!
        $appVersion: String
        $session_secure_id: String
        $client_id: String
    ) {
        initializeSession(
            organization_verbose_id: $organization_verbose_id
            enable_strict_privacy: $enable_strict_privacy
            enable_recording_network_contents: $enable_recording_network_contents
            clientVersion: $clientVersion
            firstloadVersion: $firstloadVersion
            clientConfig: $clientConfig
            environment: $environment
            appVersion: $appVersion
            fingerprint: $id
            session_secure_id: $session_secure_id
            client_id: $client_id
        ) {
            id
            secure_id
            organization_id
            project_id
        }
    }
`;
export const IgnoreDocument = gql`
    query Ignore($id: ID!) {
        ignore(id: $id)
    }
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
    action,
    _operationName,
    _operationType
) => action();

export function getSdk(
    client: GraphQLClient,
    withWrapper: SdkFunctionWrapper = defaultWrapper
) {
    return {
        PushPayload(
            variables: PushPayloadMutationVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<PushPayloadMutation> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<PushPayloadMutation>(
                        PushPayloadDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'PushPayload',
                'mutation'
            );
        },
        identifySession(
            variables: IdentifySessionMutationVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<IdentifySessionMutation> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<IdentifySessionMutation>(
                        IdentifySessionDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'identifySession',
                'mutation'
            );
        },
        addSessionProperties(
            variables: AddSessionPropertiesMutationVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<AddSessionPropertiesMutation> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<AddSessionPropertiesMutation>(
                        AddSessionPropertiesDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'addSessionProperties',
                'mutation'
            );
        },
        pushMetrics(
            variables: PushMetricsMutationVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<PushMetricsMutation> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<PushMetricsMutation>(
                        PushMetricsDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'pushMetrics',
                'mutation'
            );
        },
        addTrackProperties(
            variables: AddTrackPropertiesMutationVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<AddTrackPropertiesMutation> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<AddTrackPropertiesMutation>(
                        AddTrackPropertiesDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'addTrackProperties',
                'mutation'
            );
        },
        addSessionFeedback(
            variables: AddSessionFeedbackMutationVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<AddSessionFeedbackMutation> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<AddSessionFeedbackMutation>(
                        AddSessionFeedbackDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'addSessionFeedback',
                'mutation'
            );
        },
        initializeSession(
            variables: InitializeSessionMutationVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<InitializeSessionMutation> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<InitializeSessionMutation>(
                        InitializeSessionDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'initializeSession',
                'mutation'
            );
        },
        Ignore(
            variables: IgnoreQueryVariables,
            requestHeaders?: Dom.RequestInit['headers']
        ): Promise<IgnoreQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<IgnoreQuery>(IgnoreDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Ignore',
                'query'
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
