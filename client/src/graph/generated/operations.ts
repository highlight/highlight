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
  Time: any;
};



export type Session = {
  __typename?: 'Session';
  id: Scalars['ID'];
  user_id: Scalars['ID'];
  organization_id: Scalars['ID'];
};

export type ErrorObjectInput = {
  event: Scalars['String'];
  type: Scalars['String'];
  url: Scalars['String'];
  source: Scalars['String'];
  lineNumber: Scalars['Int'];
  columnNumber: Scalars['Int'];
  trace: Array<Maybe<Scalars['Any']>>;
  timestamp: Scalars['Time'];
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
  pushPayload?: Maybe<Scalars['ID']>;
};


export type MutationInitializeSessionArgs = {
  organization_verbose_id: Scalars['String'];
  enable_strict_privacy: Scalars['Boolean'];
  clientVersion: Scalars['String'];
  firstloadVersion: Scalars['String'];
  clientConfig: Scalars['String'];
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

export type AddTrackPropertiesMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  properties_object?: Types.Maybe<Types.Scalars['Any']>;
}>;


export type AddTrackPropertiesMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'addTrackProperties'>
);

export type InitializeSessionMutationVariables = Types.Exact<{
  organization_verbose_id: Types.Scalars['String'];
  enable_strict_privacy: Types.Scalars['Boolean'];
  clientVersion: Types.Scalars['String'];
  firstloadVersion: Types.Scalars['String'];
  clientConfig: Types.Scalars['String'];
}>;


export type InitializeSessionMutation = (
  { __typename?: 'Mutation' }
  & { initializeSession?: Types.Maybe<(
    { __typename?: 'Session' }
    & Pick<Types.Session, 'id' | 'user_id' | 'organization_id'>
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
    mutation PushPayload($session_id: ID!, $events: ReplayEventsInput!, $messages: String!, $resources: String!, $errors: [ErrorObjectInput]!) {
  pushPayload(
    session_id: $session_id
    events: $events
    messages: $messages
    resources: $resources
    errors: $errors
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
export const AddTrackPropertiesDocument = gql`
    mutation addTrackProperties($session_id: ID!, $properties_object: Any) {
  addTrackProperties(
    session_id: $session_id
    properties_object: $properties_object
  )
}
    `;
export const InitializeSessionDocument = gql`
    mutation initializeSession($organization_verbose_id: String!, $enable_strict_privacy: Boolean!, $clientVersion: String!, $firstloadVersion: String!, $clientConfig: String!) {
  initializeSession(
    organization_verbose_id: $organization_verbose_id
    enable_strict_privacy: $enable_strict_privacy
    clientVersion: $clientVersion
    firstloadVersion: $firstloadVersion
    clientConfig: $clientConfig
  ) {
    id
    user_id
    organization_id
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
    addTrackProperties(variables: AddTrackPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddTrackPropertiesMutation> {
      return withWrapper(() => client.request<AddTrackPropertiesMutation>(print(AddTrackPropertiesDocument), variables, requestHeaders));
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