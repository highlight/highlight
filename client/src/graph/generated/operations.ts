import * as Types from './schemas';

import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type WebVitalMetricInput = {
  name: Scalars['String'];
  value: Scalars['Float'];
};

export type DeviceMetricInput = {
  name: Scalars['String'];
  value: Scalars['Float'];
};

export type ReplayEventsInput = {
  events: Array<Maybe<Scalars['Any']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  initializeSession?: Maybe<Session>;
  identifySession?: Maybe<Scalars['ID']>;
  addTrackProperties?: Maybe<Scalars['ID']>;
  addSessionProperties?: Maybe<Scalars['ID']>;
  pushPayload: Scalars['Int'];
  pushBackendPayload?: Maybe<Scalars['Any']>;
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

export type Query = {
  __typename?: 'Query';
  ignore?: Maybe<Scalars['Any']>;
};


export type QueryIgnoreArgs = {
  id: Scalars['ID'];
};

export type PushPayloadMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  events: Types.ReplayEventsInput;
  messages: Types.Scalars['String'];
  resources: Types.Scalars['String'];
  errors: Array<Types.Maybe<Types.ErrorObjectInput>> | Types.Maybe<Types.ErrorObjectInput>;
  is_beacon?: Types.Maybe<Types.Scalars['Boolean']>;
  has_session_unloaded?: Types.Maybe<Types.Scalars['Boolean']>;
  highlight_logs?: Types.Maybe<Types.Scalars['String']>;
}>;


export type PushPayloadMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'pushPayload'>
);

export type IdentifySessionMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  user_identifier: Types.Scalars['String'];
  user_object?: Types.Maybe<Types.Scalars['Any']>;
}>;


export type IdentifySessionMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'identifySession'>
);

export type AddSessionPropertiesMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  properties_object?: Types.Maybe<Types.Scalars['Any']>;
}>;


export type AddSessionPropertiesMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'addSessionProperties'>
);

export type AddWebVitalsMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  metric: Types.WebVitalMetricInput;
}>;


export type AddWebVitalsMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'addWebVitals'>
);

export type AddDeviceMetricMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  metric: Types.DeviceMetricInput;
}>;


export type AddDeviceMetricMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'addDeviceMetric'>
);

export type AddTrackPropertiesMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  properties_object?: Types.Maybe<Types.Scalars['Any']>;
}>;


export type AddTrackPropertiesMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'addTrackProperties'>
);

export type AddSessionFeedbackMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  user_name?: Types.Maybe<Types.Scalars['String']>;
  user_email?: Types.Maybe<Types.Scalars['String']>;
  verbatim: Types.Scalars['String'];
  timestamp: Types.Scalars['Timestamp'];
}>;


export type AddSessionFeedbackMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'addSessionFeedback'>
);

export type InitializeSessionMutationVariables = Types.Exact<{
  organization_verbose_id: Types.Scalars['String'];
  enable_strict_privacy: Types.Scalars['Boolean'];
  enable_recording_network_contents: Types.Scalars['Boolean'];
  clientVersion: Types.Scalars['String'];
  firstloadVersion: Types.Scalars['String'];
  clientConfig: Types.Scalars['String'];
  environment: Types.Scalars['String'];
  id: Types.Scalars['String'];
  appVersion?: Types.Maybe<Types.Scalars['String']>;
  session_secure_id?: Types.Maybe<Types.Scalars['String']>;
}>;


export type InitializeSessionMutation = (
  { __typename?: 'Mutation' }
  & { initializeSession?: Types.Maybe<(
    { __typename?: 'Session' }
    & Pick<Types.Session, 'id' | 'secure_id' | 'organization_id' | 'project_id'>
  )> }
);

export type IgnoreQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type IgnoreQuery = (
  { __typename?: 'Query' }
  & Pick<Types.Query, 'ignore'>
);


export const PushPayloadDocument = gql`
    mutation PushPayload($session_id: ID!, $events: ReplayEventsInput!, $messages: String!, $resources: String!, $errors: [ErrorObjectInput]!, $is_beacon: Boolean, $has_session_unloaded: Boolean, $highlight_logs: String) {
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
    mutation identifySession($session_id: ID!, $user_identifier: String!, $user_object: Any) {
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
export const AddWebVitalsDocument = gql`
    mutation addWebVitals($session_id: ID!, $metric: WebVitalMetricInput!) {
  addWebVitals(session_id: $session_id, metric: $metric)
}
    `;
export const AddDeviceMetricDocument = gql`
    mutation addDeviceMetric($session_id: ID!, $metric: DeviceMetricInput!) {
  addDeviceMetric(session_id: $session_id, metric: $metric)
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
    mutation addSessionFeedback($session_id: ID!, $user_name: String, $user_email: String, $verbatim: String!, $timestamp: Timestamp!) {
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
    mutation initializeSession($organization_verbose_id: String!, $enable_strict_privacy: Boolean!, $enable_recording_network_contents: Boolean!, $clientVersion: String!, $firstloadVersion: String!, $clientConfig: String!, $environment: String!, $id: String!, $appVersion: String, $session_secure_id: String) {
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

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    PushPayload(variables: PushPayloadMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PushPayloadMutation> {
      return withWrapper(() => client.request<PushPayloadMutation>(print(PushPayloadDocument), variables, requestHeaders));
    },
    identifySession(variables: IdentifySessionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<IdentifySessionMutation> {
      return withWrapper(() => client.request<IdentifySessionMutation>(print(IdentifySessionDocument), variables, requestHeaders));
    },
    addSessionProperties(variables: AddSessionPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSessionPropertiesMutation> {
      return withWrapper(() => client.request<AddSessionPropertiesMutation>(print(AddSessionPropertiesDocument), variables, requestHeaders));
    },
    addWebVitals(variables: AddWebVitalsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddWebVitalsMutation> {
      return withWrapper(() => client.request<AddWebVitalsMutation>(print(AddWebVitalsDocument), variables, requestHeaders));
    },
    addDeviceMetric(variables: AddDeviceMetricMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddDeviceMetricMutation> {
      return withWrapper(() => client.request<AddDeviceMetricMutation>(print(AddDeviceMetricDocument), variables, requestHeaders));
    },
    addTrackProperties(variables: AddTrackPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddTrackPropertiesMutation> {
      return withWrapper(() => client.request<AddTrackPropertiesMutation>(print(AddTrackPropertiesDocument), variables, requestHeaders));
    },
    addSessionFeedback(variables: AddSessionFeedbackMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSessionFeedbackMutation> {
      return withWrapper(() => client.request<AddSessionFeedbackMutation>(print(AddSessionFeedbackDocument), variables, requestHeaders));
    },
    initializeSession(variables: InitializeSessionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<InitializeSessionMutation> {
      return withWrapper(() => client.request<InitializeSessionMutation>(print(InitializeSessionDocument), variables, requestHeaders));
    },
    Ignore(variables: IgnoreQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<IgnoreQuery> {
      return withWrapper(() => client.request<IgnoreQuery>(print(IgnoreDocument), variables, requestHeaders));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;