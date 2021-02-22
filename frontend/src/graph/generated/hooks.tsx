import * as Types from './operations';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

export const MarkSessionAsViewedDocument = gql`
    mutation MarkSessionAsViewed($id: ID!) {
        markSessionAsViewed(id: $id) {
            id
            viewed
        }
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
export const CreateOrUpdateSubscriptionDocument = gql`
    mutation CreateOrUpdateSubscription($organization_id: ID!, $plan: Plan!) {
        createOrUpdateSubscription(
            organization_id: $organization_id
            plan: $plan
        )
    }
`;
export type CreateOrUpdateSubscriptionMutationFn = Apollo.MutationFunction<
    Types.CreateOrUpdateSubscriptionMutation,
    Types.CreateOrUpdateSubscriptionMutationVariables
>;

/**
 * __useCreateOrUpdateSubscriptionMutation__
 *
 * To run a mutation, you first call `useCreateOrUpdateSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrUpdateSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrUpdateSubscriptionMutation, { data, loading, error }] = useCreateOrUpdateSubscriptionMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      plan: // value for 'plan'
 *   },
 * });
 */
export function useCreateOrUpdateSubscriptionMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.CreateOrUpdateSubscriptionMutation,
        Types.CreateOrUpdateSubscriptionMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.CreateOrUpdateSubscriptionMutation,
        Types.CreateOrUpdateSubscriptionMutationVariables
    >(CreateOrUpdateSubscriptionDocument, baseOptions);
}
export type CreateOrUpdateSubscriptionMutationHookResult = ReturnType<
    typeof useCreateOrUpdateSubscriptionMutation
>;
export type CreateOrUpdateSubscriptionMutationResult = Apollo.MutationResult<Types.CreateOrUpdateSubscriptionMutation>;
export type CreateOrUpdateSubscriptionMutationOptions = Apollo.BaseMutationOptions<
    Types.CreateOrUpdateSubscriptionMutation,
    Types.CreateOrUpdateSubscriptionMutationVariables
>;
export const AddAdminToOrganizationDocument = gql`
    mutation AddAdminToOrganization(
        $organization_id: ID!
        $invite_id: String!
    ) {
        addAdminToOrganization(
            organization_id: $organization_id
            invite_id: $invite_id
        )
    }
`;
export type AddAdminToOrganizationMutationFn = Apollo.MutationFunction<
    Types.AddAdminToOrganizationMutation,
    Types.AddAdminToOrganizationMutationVariables
>;

/**
 * __useAddAdminToOrganizationMutation__
 *
 * To run a mutation, you first call `useAddAdminToOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddAdminToOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addAdminToOrganizationMutation, { data, loading, error }] = useAddAdminToOrganizationMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      invite_id: // value for 'invite_id'
 *   },
 * });
 */
export function useAddAdminToOrganizationMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.AddAdminToOrganizationMutation,
        Types.AddAdminToOrganizationMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.AddAdminToOrganizationMutation,
        Types.AddAdminToOrganizationMutationVariables
    >(AddAdminToOrganizationDocument, baseOptions);
}
export type AddAdminToOrganizationMutationHookResult = ReturnType<
    typeof useAddAdminToOrganizationMutation
>;
export type AddAdminToOrganizationMutationResult = Apollo.MutationResult<Types.AddAdminToOrganizationMutation>;
export type AddAdminToOrganizationMutationOptions = Apollo.BaseMutationOptions<
    Types.AddAdminToOrganizationMutation,
    Types.AddAdminToOrganizationMutationVariables
>;
export const CreateOrganizationDocument = gql`
    mutation CreateOrganization($name: String!) {
        createOrganization(name: $name) {
            id
            name
        }
    }
`;
export type CreateOrganizationMutationFn = Apollo.MutationFunction<
    Types.CreateOrganizationMutation,
    Types.CreateOrganizationMutationVariables
>;

/**
 * __useCreateOrganizationMutation__
 *
 * To run a mutation, you first call `useCreateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrganizationMutation, { data, loading, error }] = useCreateOrganizationMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateOrganizationMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.CreateOrganizationMutation,
        Types.CreateOrganizationMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.CreateOrganizationMutation,
        Types.CreateOrganizationMutationVariables
    >(CreateOrganizationDocument, baseOptions);
}
export type CreateOrganizationMutationHookResult = ReturnType<
    typeof useCreateOrganizationMutation
>;
export type CreateOrganizationMutationResult = Apollo.MutationResult<Types.CreateOrganizationMutation>;
export type CreateOrganizationMutationOptions = Apollo.BaseMutationOptions<
    Types.CreateOrganizationMutation,
    Types.CreateOrganizationMutationVariables
>;
export const EditSegmentDocument = gql`
    mutation EditSegment(
        $organization_id: ID!
        $id: ID!
        $params: SearchParamsInput!
    ) {
        editSegment(organization_id: $organization_id, id: $id, params: $params)
    }
`;
export type EditSegmentMutationFn = Apollo.MutationFunction<
    Types.EditSegmentMutation,
    Types.EditSegmentMutationVariables
>;

/**
 * __useEditSegmentMutation__
 *
 * To run a mutation, you first call `useEditSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editSegmentMutation, { data, loading, error }] = useEditSegmentMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditSegmentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.EditSegmentMutation,
        Types.EditSegmentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.EditSegmentMutation,
        Types.EditSegmentMutationVariables
    >(EditSegmentDocument, baseOptions);
}
export type EditSegmentMutationHookResult = ReturnType<
    typeof useEditSegmentMutation
>;
export type EditSegmentMutationResult = Apollo.MutationResult<Types.EditSegmentMutation>;
export type EditSegmentMutationOptions = Apollo.BaseMutationOptions<
    Types.EditSegmentMutation,
    Types.EditSegmentMutationVariables
>;
export const CreateSegmentDocument = gql`
    mutation CreateSegment(
        $organization_id: ID!
        $name: String!
        $params: SearchParamsInput!
    ) {
        createSegment(
            organization_id: $organization_id
            name: $name
            params: $params
        ) {
            name
            id
            params {
                user_properties {
                    name
                    value
                }
                excluded_properties {
                    name
                    value
                }
                date_range {
                    start_date
                    end_date
                }
                os
                browser
                visited_url
                referrer
                identified
                hide_viewed
            }
        }
    }
`;
export type CreateSegmentMutationFn = Apollo.MutationFunction<
    Types.CreateSegmentMutation,
    Types.CreateSegmentMutationVariables
>;

/**
 * __useCreateSegmentMutation__
 *
 * To run a mutation, you first call `useCreateSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSegmentMutation, { data, loading, error }] = useCreateSegmentMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      name: // value for 'name'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateSegmentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.CreateSegmentMutation,
        Types.CreateSegmentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.CreateSegmentMutation,
        Types.CreateSegmentMutationVariables
    >(CreateSegmentDocument, baseOptions);
}
export type CreateSegmentMutationHookResult = ReturnType<
    typeof useCreateSegmentMutation
>;
export type CreateSegmentMutationResult = Apollo.MutationResult<Types.CreateSegmentMutation>;
export type CreateSegmentMutationOptions = Apollo.BaseMutationOptions<
    Types.CreateSegmentMutation,
    Types.CreateSegmentMutationVariables
>;
export const DeleteOrganizationDocument = gql`
    mutation DeleteOrganization($id: ID!) {
        deleteOrganization(id: $id)
    }
`;
export type DeleteOrganizationMutationFn = Apollo.MutationFunction<
    Types.DeleteOrganizationMutation,
    Types.DeleteOrganizationMutationVariables
>;

/**
 * __useDeleteOrganizationMutation__
 *
 * To run a mutation, you first call `useDeleteOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOrganizationMutation, { data, loading, error }] = useDeleteOrganizationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteOrganizationMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.DeleteOrganizationMutation,
        Types.DeleteOrganizationMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.DeleteOrganizationMutation,
        Types.DeleteOrganizationMutationVariables
    >(DeleteOrganizationDocument, baseOptions);
}
export type DeleteOrganizationMutationHookResult = ReturnType<
    typeof useDeleteOrganizationMutation
>;
export type DeleteOrganizationMutationResult = Apollo.MutationResult<Types.DeleteOrganizationMutation>;
export type DeleteOrganizationMutationOptions = Apollo.BaseMutationOptions<
    Types.DeleteOrganizationMutation,
    Types.DeleteOrganizationMutationVariables
>;
export const EditOrganizationDocument = gql`
    mutation EditOrganization($id: ID!, $name: String, $billing_email: String) {
        editOrganization(id: $id, name: $name, billing_email: $billing_email) {
            name
            billing_email
        }
    }
`;
export type EditOrganizationMutationFn = Apollo.MutationFunction<
    Types.EditOrganizationMutation,
    Types.EditOrganizationMutationVariables
>;

/**
 * __useEditOrganizationMutation__
 *
 * To run a mutation, you first call `useEditOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editOrganizationMutation, { data, loading, error }] = useEditOrganizationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      billing_email: // value for 'billing_email'
 *   },
 * });
 */
export function useEditOrganizationMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.EditOrganizationMutation,
        Types.EditOrganizationMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.EditOrganizationMutation,
        Types.EditOrganizationMutationVariables
    >(EditOrganizationDocument, baseOptions);
}
export type EditOrganizationMutationHookResult = ReturnType<
    typeof useEditOrganizationMutation
>;
export type EditOrganizationMutationResult = Apollo.MutationResult<Types.EditOrganizationMutation>;
export type EditOrganizationMutationOptions = Apollo.BaseMutationOptions<
    Types.EditOrganizationMutation,
    Types.EditOrganizationMutationVariables
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
export const GetAdminsDocument = gql`
    query GetAdmins($organization_id: ID!) {
        admins(organization_id: $organization_id) {
            id
            name
            email
        }
    }
`;

/**
 * __useGetAdminsQuery__
 *
 * To run a query within a React component, call `useGetAdminsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetAdminsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetAdminsQuery,
        Types.GetAdminsQueryVariables
    >
) {
    return Apollo.useQuery<Types.GetAdminsQuery, Types.GetAdminsQueryVariables>(
        GetAdminsDocument,
        baseOptions
    );
}
export function useGetAdminsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetAdminsQuery,
        Types.GetAdminsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetAdminsQuery,
        Types.GetAdminsQueryVariables
    >(GetAdminsDocument, baseOptions);
}
export type GetAdminsQueryHookResult = ReturnType<typeof useGetAdminsQuery>;
export type GetAdminsLazyQueryHookResult = ReturnType<
    typeof useGetAdminsLazyQuery
>;
export type GetAdminsQueryResult = Apollo.QueryResult<
    Types.GetAdminsQuery,
    Types.GetAdminsQueryVariables
>;
export const SendAdminInviteDocument = gql`
    mutation SendAdminInvite($organization_id: ID!, $email: String!) {
        sendAdminInvite(organization_id: $organization_id, email: $email)
    }
`;
export type SendAdminInviteMutationFn = Apollo.MutationFunction<
    Types.SendAdminInviteMutation,
    Types.SendAdminInviteMutationVariables
>;

/**
 * __useSendAdminInviteMutation__
 *
 * To run a mutation, you first call `useSendAdminInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendAdminInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendAdminInviteMutation, { data, loading, error }] = useSendAdminInviteMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSendAdminInviteMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.SendAdminInviteMutation,
        Types.SendAdminInviteMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.SendAdminInviteMutation,
        Types.SendAdminInviteMutationVariables
    >(SendAdminInviteDocument, baseOptions);
}
export type SendAdminInviteMutationHookResult = ReturnType<
    typeof useSendAdminInviteMutation
>;
export type SendAdminInviteMutationResult = Apollo.MutationResult<Types.SendAdminInviteMutation>;
export type SendAdminInviteMutationOptions = Apollo.BaseMutationOptions<
    Types.SendAdminInviteMutation,
    Types.SendAdminInviteMutationVariables
>;
export const GetSessionsBetaDocument = gql`
    query GetSessionsBETA(
        $organization_id: ID!
        $count: Int!
        $params: SearchParamsInput
    ) {
        sessionsBETA(
            organization_id: $organization_id
            count: $count
            params: $params
        ) {
            sessions {
                id
                user_id
                identifier
                os_name
                os_version
                browser_name
                browser_version
                city
                state
                postal
                created_at
                length
                viewed
                fields {
                    name
                    value
                    type
                }
            }
            totalCount
        }
    }
`;

/**
 * __useGetSessionsBetaQuery__
 *
 * To run a query within a React component, call `useGetSessionsBetaQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsBetaQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsBetaQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      count: // value for 'count'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetSessionsBetaQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSessionsBetaQuery,
        Types.GetSessionsBetaQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSessionsBetaQuery,
        Types.GetSessionsBetaQueryVariables
    >(GetSessionsBetaDocument, baseOptions);
}
export function useGetSessionsBetaLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSessionsBetaQuery,
        Types.GetSessionsBetaQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSessionsBetaQuery,
        Types.GetSessionsBetaQueryVariables
    >(GetSessionsBetaDocument, baseOptions);
}
export type GetSessionsBetaQueryHookResult = ReturnType<
    typeof useGetSessionsBetaQuery
>;
export type GetSessionsBetaLazyQueryHookResult = ReturnType<
    typeof useGetSessionsBetaLazyQuery
>;
export type GetSessionsBetaQueryResult = Apollo.QueryResult<
    Types.GetSessionsBetaQuery,
    Types.GetSessionsBetaQueryVariables
>;
export const GetOrganizationsDocument = gql`
    query GetOrganizations {
        organizations {
            id
            name
        }
    }
`;

/**
 * __useGetOrganizationsQuery__
 *
 * To run a query within a React component, call `useGetOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOrganizationsQuery(
    baseOptions?: Apollo.QueryHookOptions<
        Types.GetOrganizationsQuery,
        Types.GetOrganizationsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetOrganizationsQuery,
        Types.GetOrganizationsQueryVariables
    >(GetOrganizationsDocument, baseOptions);
}
export function useGetOrganizationsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetOrganizationsQuery,
        Types.GetOrganizationsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetOrganizationsQuery,
        Types.GetOrganizationsQueryVariables
    >(GetOrganizationsDocument, baseOptions);
}
export type GetOrganizationsQueryHookResult = ReturnType<
    typeof useGetOrganizationsQuery
>;
export type GetOrganizationsLazyQueryHookResult = ReturnType<
    typeof useGetOrganizationsLazyQuery
>;
export type GetOrganizationsQueryResult = Apollo.QueryResult<
    Types.GetOrganizationsQuery,
    Types.GetOrganizationsQueryVariables
>;
export const GetAdminDocument = gql`
    query GetAdmin {
        admin {
            id
            name
            email
        }
    }
`;

/**
 * __useGetAdminQuery__
 *
 * To run a query within a React component, call `useGetAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAdminQuery(
    baseOptions?: Apollo.QueryHookOptions<
        Types.GetAdminQuery,
        Types.GetAdminQueryVariables
    >
) {
    return Apollo.useQuery<Types.GetAdminQuery, Types.GetAdminQueryVariables>(
        GetAdminDocument,
        baseOptions
    );
}
export function useGetAdminLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetAdminQuery,
        Types.GetAdminQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetAdminQuery,
        Types.GetAdminQueryVariables
    >(GetAdminDocument, baseOptions);
}
export type GetAdminQueryHookResult = ReturnType<typeof useGetAdminQuery>;
export type GetAdminLazyQueryHookResult = ReturnType<
    typeof useGetAdminLazyQuery
>;
export type GetAdminQueryResult = Apollo.QueryResult<
    Types.GetAdminQuery,
    Types.GetAdminQueryVariables
>;
export const GetOrganizationDocument = gql`
    query GetOrganization($id: ID!) {
        organization(id: $id) {
            id
            name
            trial_end_date
            verbose_id
            billing_email
        }
    }
`;

/**
 * __useGetOrganizationQuery__
 *
 * To run a query within a React component, call `useGetOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrganizationQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetOrganizationQuery,
        Types.GetOrganizationQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetOrganizationQuery,
        Types.GetOrganizationQueryVariables
    >(GetOrganizationDocument, baseOptions);
}
export function useGetOrganizationLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetOrganizationQuery,
        Types.GetOrganizationQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetOrganizationQuery,
        Types.GetOrganizationQueryVariables
    >(GetOrganizationDocument, baseOptions);
}
export type GetOrganizationQueryHookResult = ReturnType<
    typeof useGetOrganizationQuery
>;
export type GetOrganizationLazyQueryHookResult = ReturnType<
    typeof useGetOrganizationLazyQuery
>;
export type GetOrganizationQueryResult = Apollo.QueryResult<
    Types.GetOrganizationQuery,
    Types.GetOrganizationQueryVariables
>;
export const GetBillingDetailsDocument = gql`
    query GetBillingDetails($organization_id: ID!) {
        billingDetails(organization_id: $organization_id)
    }
`;

/**
 * __useGetBillingDetailsQuery__
 *
 * To run a query within a React component, call `useGetBillingDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBillingDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBillingDetailsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetBillingDetailsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetBillingDetailsQuery,
        Types.GetBillingDetailsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetBillingDetailsQuery,
        Types.GetBillingDetailsQueryVariables
    >(GetBillingDetailsDocument, baseOptions);
}
export function useGetBillingDetailsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetBillingDetailsQuery,
        Types.GetBillingDetailsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetBillingDetailsQuery,
        Types.GetBillingDetailsQueryVariables
    >(GetBillingDetailsDocument, baseOptions);
}
export type GetBillingDetailsQueryHookResult = ReturnType<
    typeof useGetBillingDetailsQuery
>;
export type GetBillingDetailsLazyQueryHookResult = ReturnType<
    typeof useGetBillingDetailsLazyQuery
>;
export type GetBillingDetailsQueryResult = Apollo.QueryResult<
    Types.GetBillingDetailsQuery,
    Types.GetBillingDetailsQueryVariables
>;
export const GetErrorsDocument = gql`
    query GetErrors($organization_id: ID!) {
        errors(organization_id: $organization_id) {
            event
            type
            source
            line_number
            column_number
            trace
        }
    }
`;

/**
 * __useGetErrorsQuery__
 *
 * To run a query within a React component, call `useGetErrorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetErrorsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorsQuery,
        Types.GetErrorsQueryVariables
    >
) {
    return Apollo.useQuery<Types.GetErrorsQuery, Types.GetErrorsQueryVariables>(
        GetErrorsDocument,
        baseOptions
    );
}
export function useGetErrorsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorsQuery,
        Types.GetErrorsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorsQuery,
        Types.GetErrorsQueryVariables
    >(GetErrorsDocument, baseOptions);
}
export type GetErrorsQueryHookResult = ReturnType<typeof useGetErrorsQuery>;
export type GetErrorsLazyQueryHookResult = ReturnType<
    typeof useGetErrorsLazyQuery
>;
export type GetErrorsQueryResult = Apollo.QueryResult<
    Types.GetErrorsQuery,
    Types.GetErrorsQueryVariables
>;
export const GetMessagesDocument = gql`
    query GetMessages($session_id: ID!) {
        messages(session_id: $session_id)
    }
`;

/**
 * __useGetMessagesQuery__
 *
 * To run a query within a React component, call `useGetMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMessagesQuery({
 *   variables: {
 *      session_id: // value for 'session_id'
 *   },
 * });
 */
export function useGetMessagesQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetMessagesQuery,
        Types.GetMessagesQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetMessagesQuery,
        Types.GetMessagesQueryVariables
    >(GetMessagesDocument, baseOptions);
}
export function useGetMessagesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetMessagesQuery,
        Types.GetMessagesQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetMessagesQuery,
        Types.GetMessagesQueryVariables
    >(GetMessagesDocument, baseOptions);
}
export type GetMessagesQueryHookResult = ReturnType<typeof useGetMessagesQuery>;
export type GetMessagesLazyQueryHookResult = ReturnType<
    typeof useGetMessagesLazyQuery
>;
export type GetMessagesQueryResult = Apollo.QueryResult<
    Types.GetMessagesQuery,
    Types.GetMessagesQueryVariables
>;
export const GetResourcesDocument = gql`
    query GetResources($session_id: ID!) {
        resources(session_id: $session_id)
    }
`;

/**
 * __useGetResourcesQuery__
 *
 * To run a query within a React component, call `useGetResourcesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetResourcesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetResourcesQuery({
 *   variables: {
 *      session_id: // value for 'session_id'
 *   },
 * });
 */
export function useGetResourcesQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetResourcesQuery,
        Types.GetResourcesQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetResourcesQuery,
        Types.GetResourcesQueryVariables
    >(GetResourcesDocument, baseOptions);
}
export function useGetResourcesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetResourcesQuery,
        Types.GetResourcesQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetResourcesQuery,
        Types.GetResourcesQueryVariables
    >(GetResourcesDocument, baseOptions);
}
export type GetResourcesQueryHookResult = ReturnType<
    typeof useGetResourcesQuery
>;
export type GetResourcesLazyQueryHookResult = ReturnType<
    typeof useGetResourcesLazyQuery
>;
export type GetResourcesQueryResult = Apollo.QueryResult<
    Types.GetResourcesQuery,
    Types.GetResourcesQueryVariables
>;
export const GetFieldSuggestionDocument = gql`
    query GetFieldSuggestion(
        $organization_id: ID!
        $name: String!
        $query: String!
    ) {
        field_suggestionBETA(
            organization_id: $organization_id
            name: $name
            query: $query
        ) {
            name
            value
        }
    }
`;

/**
 * __useGetFieldSuggestionQuery__
 *
 * To run a query within a React component, call `useGetFieldSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFieldSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFieldSuggestionQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      name: // value for 'name'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetFieldSuggestionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetFieldSuggestionQuery,
        Types.GetFieldSuggestionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetFieldSuggestionQuery,
        Types.GetFieldSuggestionQueryVariables
    >(GetFieldSuggestionDocument, baseOptions);
}
export function useGetFieldSuggestionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetFieldSuggestionQuery,
        Types.GetFieldSuggestionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetFieldSuggestionQuery,
        Types.GetFieldSuggestionQueryVariables
    >(GetFieldSuggestionDocument, baseOptions);
}
export type GetFieldSuggestionQueryHookResult = ReturnType<
    typeof useGetFieldSuggestionQuery
>;
export type GetFieldSuggestionLazyQueryHookResult = ReturnType<
    typeof useGetFieldSuggestionLazyQuery
>;
export type GetFieldSuggestionQueryResult = Apollo.QueryResult<
    Types.GetFieldSuggestionQuery,
    Types.GetFieldSuggestionQueryVariables
>;
export const GetTrackSuggestionDocument = gql`
    query GetTrackSuggestion($organization_id: ID!, $query: String!) {
        property_suggestion(
            organization_id: $organization_id
            query: $query
            type: "track"
        ) {
            name
            value
        }
    }
`;

/**
 * __useGetTrackSuggestionQuery__
 *
 * To run a query within a React component, call `useGetTrackSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrackSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrackSuggestionQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetTrackSuggestionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetTrackSuggestionQuery,
        Types.GetTrackSuggestionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetTrackSuggestionQuery,
        Types.GetTrackSuggestionQueryVariables
    >(GetTrackSuggestionDocument, baseOptions);
}
export function useGetTrackSuggestionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetTrackSuggestionQuery,
        Types.GetTrackSuggestionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetTrackSuggestionQuery,
        Types.GetTrackSuggestionQueryVariables
    >(GetTrackSuggestionDocument, baseOptions);
}
export type GetTrackSuggestionQueryHookResult = ReturnType<
    typeof useGetTrackSuggestionQuery
>;
export type GetTrackSuggestionLazyQueryHookResult = ReturnType<
    typeof useGetTrackSuggestionLazyQuery
>;
export type GetTrackSuggestionQueryResult = Apollo.QueryResult<
    Types.GetTrackSuggestionQuery,
    Types.GetTrackSuggestionQueryVariables
>;
export const GetUserSuggestionDocument = gql`
    query GetUserSuggestion($organization_id: ID!, $query: String!) {
        property_suggestion(
            organization_id: $organization_id
            query: $query
            type: "user"
        ) {
            name
            value
        }
    }
`;

/**
 * __useGetUserSuggestionQuery__
 *
 * To run a query within a React component, call `useGetUserSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSuggestionQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetUserSuggestionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetUserSuggestionQuery,
        Types.GetUserSuggestionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetUserSuggestionQuery,
        Types.GetUserSuggestionQueryVariables
    >(GetUserSuggestionDocument, baseOptions);
}
export function useGetUserSuggestionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetUserSuggestionQuery,
        Types.GetUserSuggestionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetUserSuggestionQuery,
        Types.GetUserSuggestionQueryVariables
    >(GetUserSuggestionDocument, baseOptions);
}
export type GetUserSuggestionQueryHookResult = ReturnType<
    typeof useGetUserSuggestionQuery
>;
export type GetUserSuggestionLazyQueryHookResult = ReturnType<
    typeof useGetUserSuggestionLazyQuery
>;
export type GetUserSuggestionQueryResult = Apollo.QueryResult<
    Types.GetUserSuggestionQuery,
    Types.GetUserSuggestionQueryVariables
>;
export const GetSegmentsDocument = gql`
    query GetSegments($organization_id: ID!) {
        segments(organization_id: $organization_id) {
            id
            name
            params {
                user_properties {
                    name
                    value
                }
                excluded_properties {
                    name
                    value
                }
                track_properties {
                    name
                    value
                }
                date_range {
                    start_date
                    end_date
                }
                os
                browser
                visited_url
                referrer
                identified
                hide_viewed
            }
        }
    }
`;

/**
 * __useGetSegmentsQuery__
 *
 * To run a query within a React component, call `useGetSegmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSegmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSegmentsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetSegmentsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSegmentsQuery,
        Types.GetSegmentsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSegmentsQuery,
        Types.GetSegmentsQueryVariables
    >(GetSegmentsDocument, baseOptions);
}
export function useGetSegmentsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSegmentsQuery,
        Types.GetSegmentsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSegmentsQuery,
        Types.GetSegmentsQueryVariables
    >(GetSegmentsDocument, baseOptions);
}
export type GetSegmentsQueryHookResult = ReturnType<typeof useGetSegmentsQuery>;
export type GetSegmentsLazyQueryHookResult = ReturnType<
    typeof useGetSegmentsLazyQuery
>;
export type GetSegmentsQueryResult = Apollo.QueryResult<
    Types.GetSegmentsQuery,
    Types.GetSegmentsQueryVariables
>;
export const IsIntegratedDocument = gql`
    query IsIntegrated($organization_id: ID!) {
        isIntegrated(organization_id: $organization_id)
    }
`;

/**
 * __useIsIntegratedQuery__
 *
 * To run a query within a React component, call `useIsIntegratedQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsIntegratedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsIntegratedQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useIsIntegratedQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.IsIntegratedQuery,
        Types.IsIntegratedQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.IsIntegratedQuery,
        Types.IsIntegratedQueryVariables
    >(IsIntegratedDocument, baseOptions);
}
export function useIsIntegratedLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.IsIntegratedQuery,
        Types.IsIntegratedQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.IsIntegratedQuery,
        Types.IsIntegratedQueryVariables
    >(IsIntegratedDocument, baseOptions);
}
export type IsIntegratedQueryHookResult = ReturnType<
    typeof useIsIntegratedQuery
>;
export type IsIntegratedLazyQueryHookResult = ReturnType<
    typeof useIsIntegratedLazyQuery
>;
export type IsIntegratedQueryResult = Apollo.QueryResult<
    Types.IsIntegratedQuery,
    Types.IsIntegratedQueryVariables
>;
