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

export type GetSessionQueryVariables = Types.Exact<{
    id: Types.Scalars['ID'];
}>;

export type GetSessionQuery = { __typename?: 'Query' } & {
    session?: Types.Maybe<
        { __typename?: 'Session' } & Pick<
            Types.Session,
            | 'os_name'
            | 'os_version'
            | 'browser_name'
            | 'browser_version'
            | 'city'
            | 'state'
            | 'postal'
            | 'user_id'
            | 'created_at'
            | 'user_object'
            | 'identifier'
        > & {
                fields?: Types.Maybe<
                    Array<
                        Types.Maybe<
                            { __typename?: 'Field' } & Pick<
                                Types.Field,
                                'name' | 'value' | 'type'
                            >
                        >
                    >
                >;
            }
    >;
};
