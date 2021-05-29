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
