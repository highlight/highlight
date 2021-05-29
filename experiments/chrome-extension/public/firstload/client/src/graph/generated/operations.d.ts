import * as Types from './schemas';
import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
export declare type Maybe<T> = T | null;
export declare type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export declare type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export declare type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export declare type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    Any: any;
    Time: any;
    Int64: any;
};
export declare type Session = {
    __typename?: 'Session';
    id: Scalars['ID'];
    user_id: Scalars['ID'];
    organization_id: Scalars['ID'];
};
export declare type ErrorObjectInput = {
    event: Scalars['String'];
    type: Scalars['String'];
    url: Scalars['String'];
    source: Scalars['String'];
    lineNumber: Scalars['Int'];
    columnNumber: Scalars['Int'];
    trace: Array<Maybe<Scalars['Any']>>;
    timestamp: Scalars['Time'];
    payload?: Maybe<Scalars['String']>;
};
export declare type ReplayEventsInput = {
    events: Array<Maybe<Scalars['Any']>>;
};
export declare type Mutation = {
    __typename?: 'Mutation';
    initializeSession?: Maybe<Session>;
    identifySession?: Maybe<Scalars['ID']>;
    addTrackProperties?: Maybe<Scalars['ID']>;
    addSessionProperties?: Maybe<Scalars['ID']>;
    pushPayload?: Maybe<Scalars['ID']>;
};
export declare type MutationInitializeSessionArgs = {
    organization_verbose_id: Scalars['String'];
    enable_strict_privacy: Scalars['Boolean'];
    clientVersion: Scalars['String'];
    firstloadVersion: Scalars['String'];
    clientConfig: Scalars['String'];
    environment: Scalars['String'];
    fingerprint: Scalars['String'];
};
export declare type MutationIdentifySessionArgs = {
    session_id: Scalars['ID'];
    user_identifier: Scalars['String'];
    user_object?: Maybe<Scalars['Any']>;
};
export declare type MutationAddTrackPropertiesArgs = {
    session_id: Scalars['ID'];
    properties_object?: Maybe<Scalars['Any']>;
};
export declare type MutationAddSessionPropertiesArgs = {
    session_id: Scalars['ID'];
    properties_object?: Maybe<Scalars['Any']>;
};
export declare type MutationPushPayloadArgs = {
    session_id: Scalars['ID'];
    events: ReplayEventsInput;
    messages: Scalars['String'];
    resources: Scalars['String'];
    errors: Array<Maybe<ErrorObjectInput>>;
};
export declare type Query = {
    __typename?: 'Query';
    ignore?: Maybe<Scalars['Any']>;
};
export declare type QueryIgnoreArgs = {
    id: Scalars['ID'];
};
export declare type PushPayloadMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    events: Types.ReplayEventsInput;
    messages: Types.Scalars['String'];
    resources: Types.Scalars['String'];
    errors: Array<Types.Maybe<Types.ErrorObjectInput>> | Types.Maybe<Types.ErrorObjectInput>;
}>;
export declare type PushPayloadMutation = ({
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'pushPayload'>);
export declare type IdentifySessionMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    user_identifier: Types.Scalars['String'];
    user_object?: Types.Maybe<Types.Scalars['Any']>;
}>;
export declare type IdentifySessionMutation = ({
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'identifySession'>);
export declare type AddSessionPropertiesMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    properties_object?: Types.Maybe<Types.Scalars['Any']>;
}>;
export declare type AddSessionPropertiesMutation = ({
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'addSessionProperties'>);
export declare type AddTrackPropertiesMutationVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
    properties_object?: Types.Maybe<Types.Scalars['Any']>;
}>;
export declare type AddTrackPropertiesMutation = ({
    __typename?: 'Mutation';
} & Pick<Types.Mutation, 'addTrackProperties'>);
export declare type InitializeSessionMutationVariables = Types.Exact<{
    organization_verbose_id: Types.Scalars['String'];
    enable_strict_privacy: Types.Scalars['Boolean'];
    clientVersion: Types.Scalars['String'];
    firstloadVersion: Types.Scalars['String'];
    clientConfig: Types.Scalars['String'];
    environment: Types.Scalars['String'];
    id: Types.Scalars['String'];
}>;
export declare type InitializeSessionMutation = ({
    __typename?: 'Mutation';
} & {
    initializeSession?: Types.Maybe<({
        __typename?: 'Session';
    } & Pick<Types.Session, 'id' | 'user_id' | 'organization_id'>)>;
});
export declare type IgnoreQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;
export declare type IgnoreQuery = ({
    __typename?: 'Query';
} & Pick<Types.Query, 'ignore'>);
export declare const PushPayloadDocument: import("graphql").DocumentNode;
export declare const IdentifySessionDocument: import("graphql").DocumentNode;
export declare const AddSessionPropertiesDocument: import("graphql").DocumentNode;
export declare const AddTrackPropertiesDocument: import("graphql").DocumentNode;
export declare const InitializeSessionDocument: import("graphql").DocumentNode;
export declare const IgnoreDocument: import("graphql").DocumentNode;
export declare type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;
export declare function getSdk(client: GraphQLClient, withWrapper?: SdkFunctionWrapper): {
    PushPayload(variables: PushPayloadMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PushPayloadMutation>;
    identifySession(variables: IdentifySessionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<IdentifySessionMutation>;
    addSessionProperties(variables: AddSessionPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSessionPropertiesMutation>;
    addTrackProperties(variables: AddTrackPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddTrackPropertiesMutation>;
    initializeSession(variables: InitializeSessionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<InitializeSessionMutation>;
    Ignore(variables: IgnoreQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<IgnoreQuery>;
};
export declare type Sdk = ReturnType<typeof getSdk>;
