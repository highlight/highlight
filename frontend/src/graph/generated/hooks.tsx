import * as Types from './operations';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

export const MarkSessionAsViewedDocument = gql`
    mutation MarkSessionAsViewed($id: ID!) {
        markSessionAsViewed(id: $id)
    }
`;
export type MarkSessionAsViewedMutationFn = Apollo.MutationFunction<
    Types.MarkSessionAsViewedMutation,
    Types.MarkSessionAsViewedMutationVariables
>;

/**
 * __useMarkSessionAsViewedMutation__
 *
 * To run a mutation, you first call `useMarkSessionAsViewedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkSessionAsViewedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markSessionAsViewedMutation, { data, loading, error }] = useMarkSessionAsViewedMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMarkSessionAsViewedMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.MarkSessionAsViewedMutation,
        Types.MarkSessionAsViewedMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.MarkSessionAsViewedMutation,
        Types.MarkSessionAsViewedMutationVariables
    >(MarkSessionAsViewedDocument, baseOptions);
}
export type MarkSessionAsViewedMutationHookResult = ReturnType<
    typeof useMarkSessionAsViewedMutation
>;
export type MarkSessionAsViewedMutationResult = Apollo.MutationResult<Types.MarkSessionAsViewedMutation>;
export type MarkSessionAsViewedMutationOptions = Apollo.BaseMutationOptions<
    Types.MarkSessionAsViewedMutation,
    Types.MarkSessionAsViewedMutationVariables
>;
export const GetEventsDocument = gql`
    query GetEvents($session_id: ID!) {
        events(session_id: $session_id)
    }
`;

/**
 * __useGetEventsQuery__
 *
 * To run a query within a React component, call `useGetEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventsQuery({
 *   variables: {
 *      session_id: // value for 'session_id'
 *   },
 * });
 */
export function useGetEventsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetEventsQuery,
        Types.GetEventsQueryVariables
    >
) {
    return Apollo.useQuery<Types.GetEventsQuery, Types.GetEventsQueryVariables>(
        GetEventsDocument,
        baseOptions
    );
}
export function useGetEventsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetEventsQuery,
        Types.GetEventsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetEventsQuery,
        Types.GetEventsQueryVariables
    >(GetEventsDocument, baseOptions);
}
export type GetEventsQueryHookResult = ReturnType<typeof useGetEventsQuery>;
export type GetEventsLazyQueryHookResult = ReturnType<
    typeof useGetEventsLazyQuery
>;
export type GetEventsQueryResult = Apollo.QueryResult<
    Types.GetEventsQuery,
    Types.GetEventsQueryVariables
>;
export const GetSessionDocument = gql`
    query GetSession($id: ID!) {
        session(id: $id) {
            os_name
            os_version
            browser_name
            browser_version
            city
            state
            postal
            user_id
            created_at
            user_object
            identifier
            fields {
                name
                value
                type
            }
        }
    }
`;

/**
 * __useGetSessionQuery__
 *
 * To run a query within a React component, call `useGetSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSessionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSessionQuery,
        Types.GetSessionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSessionQuery,
        Types.GetSessionQueryVariables
    >(GetSessionDocument, baseOptions);
}
export function useGetSessionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSessionQuery,
        Types.GetSessionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSessionQuery,
        Types.GetSessionQueryVariables
    >(GetSessionDocument, baseOptions);
}
export type GetSessionQueryHookResult = ReturnType<typeof useGetSessionQuery>;
export type GetSessionLazyQueryHookResult = ReturnType<
    typeof useGetSessionLazyQuery
>;
export type GetSessionQueryResult = Apollo.QueryResult<
    Types.GetSessionQuery,
    Types.GetSessionQueryVariables
>;
