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
  eventsObject: ReplayEventsInput;
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
