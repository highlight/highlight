import * as Types from './schemas';

export type MarkSessionAsViewedMutationVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type MarkSessionAsViewedMutation = { __typename?: 'Mutation' } & Pick<
    Types.Mutation,
    'markSessionAsViewed'
>;

export type GetEventsQueryVariables = Types.Exact<{
    session_id: Types.Scalars['ID'];
}>;

export type GetEventsQuery = { __typename?: 'Query' } & Pick<
    Types.Query,
    'events'
>;
