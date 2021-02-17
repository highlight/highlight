import * as Types from './schemas';

export type PushPayloadMutationVariables = Types.Exact<{
  session_id: Types.Scalars['ID'];
  events: Types.Scalars['String'];
  messages: Types.Scalars['String'];
  resources: Types.Scalars['String'];
  errors: Types.Scalars['String'];
}>;


export type PushPayloadMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'pushPayload'>
);

export type HelloQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type HelloQuery = (
  { __typename?: 'Query' }
  & Pick<Types.Query, 'hello'>
);
