import * as Types from './operations';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export const ErrorFieldsFragmentDoc = gql`
    fragment errorFields on ErrorObject {
        id
        error_group_id
        event
        type
        url
        source
        line_number
        column_number
        trace
        timestamp
    }
`;
export const MarkSessionAsViewedDocument = gql`
    mutation MarkSessionAsViewed($id: ID!, $viewed: Boolean!) {
        markSessionAsViewed(id: $id, viewed: $viewed) {
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
 *      viewed: // value for 'viewed'
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
    mutation CreateOrUpdateSubscription(
        $organization_id: ID!
        $plan_type: PlanType!
    ) {
        createOrUpdateSubscription(
            organization_id: $organization_id
            plan_type: $plan_type
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
 *      plan_type: // value for 'plan_type'
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
export const MarkErrorGroupAsResolvedDocument = gql`
    mutation markErrorGroupAsResolved($id: ID!, $resolved: Boolean!) {
        markErrorGroupAsResolved(id: $id, resolved: $resolved) {
            id
            resolved
        }
    }
`;
export type MarkErrorGroupAsResolvedMutationFn = Apollo.MutationFunction<
    Types.MarkErrorGroupAsResolvedMutation,
    Types.MarkErrorGroupAsResolvedMutationVariables
>;

/**
 * __useMarkErrorGroupAsResolvedMutation__
 *
 * To run a mutation, you first call `useMarkErrorGroupAsResolvedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkErrorGroupAsResolvedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markErrorGroupAsResolvedMutation, { data, loading, error }] = useMarkErrorGroupAsResolvedMutation({
 *   variables: {
 *      id: // value for 'id'
 *      resolved: // value for 'resolved'
 *   },
 * });
 */
export function useMarkErrorGroupAsResolvedMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.MarkErrorGroupAsResolvedMutation,
        Types.MarkErrorGroupAsResolvedMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.MarkErrorGroupAsResolvedMutation,
        Types.MarkErrorGroupAsResolvedMutationVariables
    >(MarkErrorGroupAsResolvedDocument, baseOptions);
}
export type MarkErrorGroupAsResolvedMutationHookResult = ReturnType<
    typeof useMarkErrorGroupAsResolvedMutation
>;
export type MarkErrorGroupAsResolvedMutationResult = Apollo.MutationResult<Types.MarkErrorGroupAsResolvedMutation>;
export type MarkErrorGroupAsResolvedMutationOptions = Apollo.BaseMutationOptions<
    Types.MarkErrorGroupAsResolvedMutation,
    Types.MarkErrorGroupAsResolvedMutationVariables
>;
export const SendEmailSignupDocument = gql`
    mutation SendEmailSignup($email: String!) {
        emailSignup(email: $email)
    }
`;
export type SendEmailSignupMutationFn = Apollo.MutationFunction<
    Types.SendEmailSignupMutation,
    Types.SendEmailSignupMutationVariables
>;

/**
 * __useSendEmailSignupMutation__
 *
 * To run a mutation, you first call `useSendEmailSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendEmailSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendEmailSignupMutation, { data, loading, error }] = useSendEmailSignupMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSendEmailSignupMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.SendEmailSignupMutation,
        Types.SendEmailSignupMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.SendEmailSignupMutation,
        Types.SendEmailSignupMutationVariables
    >(SendEmailSignupDocument, baseOptions);
}
export type SendEmailSignupMutationHookResult = ReturnType<
    typeof useSendEmailSignupMutation
>;
export type SendEmailSignupMutationResult = Apollo.MutationResult<Types.SendEmailSignupMutation>;
export type SendEmailSignupMutationOptions = Apollo.BaseMutationOptions<
    Types.SendEmailSignupMutation,
    Types.SendEmailSignupMutationVariables
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
export const AddSlackIntegrationToWorkspaceDocument = gql`
    mutation AddSlackIntegrationToWorkspace(
        $organization_id: ID!
        $code: String!
        $redirect_path: String!
    ) {
        addSlackIntegrationToWorkspace(
            organization_id: $organization_id
            code: $code
            redirect_path: $redirect_path
        )
    }
`;
export type AddSlackIntegrationToWorkspaceMutationFn = Apollo.MutationFunction<
    Types.AddSlackIntegrationToWorkspaceMutation,
    Types.AddSlackIntegrationToWorkspaceMutationVariables
>;

/**
 * __useAddSlackIntegrationToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddSlackIntegrationToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSlackIntegrationToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSlackIntegrationToWorkspaceMutation, { data, loading, error }] = useAddSlackIntegrationToWorkspaceMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      code: // value for 'code'
 *      redirect_path: // value for 'redirect_path'
 *   },
 * });
 */
export function useAddSlackIntegrationToWorkspaceMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.AddSlackIntegrationToWorkspaceMutation,
        Types.AddSlackIntegrationToWorkspaceMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.AddSlackIntegrationToWorkspaceMutation,
        Types.AddSlackIntegrationToWorkspaceMutationVariables
    >(AddSlackIntegrationToWorkspaceDocument, baseOptions);
}
export type AddSlackIntegrationToWorkspaceMutationHookResult = ReturnType<
    typeof useAddSlackIntegrationToWorkspaceMutation
>;
export type AddSlackIntegrationToWorkspaceMutationResult = Apollo.MutationResult<Types.AddSlackIntegrationToWorkspaceMutation>;
export type AddSlackIntegrationToWorkspaceMutationOptions = Apollo.BaseMutationOptions<
    Types.AddSlackIntegrationToWorkspaceMutation,
    Types.AddSlackIntegrationToWorkspaceMutationVariables
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
export const DeleteSegmentDocument = gql`
    mutation DeleteSegment($segment_id: ID!) {
        deleteSegment(segment_id: $segment_id)
    }
`;
export type DeleteSegmentMutationFn = Apollo.MutationFunction<
    Types.DeleteSegmentMutation,
    Types.DeleteSegmentMutationVariables
>;

/**
 * __useDeleteSegmentMutation__
 *
 * To run a mutation, you first call `useDeleteSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSegmentMutation, { data, loading, error }] = useDeleteSegmentMutation({
 *   variables: {
 *      segment_id: // value for 'segment_id'
 *   },
 * });
 */
export function useDeleteSegmentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.DeleteSegmentMutation,
        Types.DeleteSegmentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.DeleteSegmentMutation,
        Types.DeleteSegmentMutationVariables
    >(DeleteSegmentDocument, baseOptions);
}
export type DeleteSegmentMutationHookResult = ReturnType<
    typeof useDeleteSegmentMutation
>;
export type DeleteSegmentMutationResult = Apollo.MutationResult<Types.DeleteSegmentMutation>;
export type DeleteSegmentMutationOptions = Apollo.BaseMutationOptions<
    Types.DeleteSegmentMutation,
    Types.DeleteSegmentMutationVariables
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
export const DeleteErrorSegmentDocument = gql`
    mutation DeleteErrorSegment($segment_id: ID!) {
        deleteErrorSegment(segment_id: $segment_id)
    }
`;
export type DeleteErrorSegmentMutationFn = Apollo.MutationFunction<
    Types.DeleteErrorSegmentMutation,
    Types.DeleteErrorSegmentMutationVariables
>;

/**
 * __useDeleteErrorSegmentMutation__
 *
 * To run a mutation, you first call `useDeleteErrorSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteErrorSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteErrorSegmentMutation, { data, loading, error }] = useDeleteErrorSegmentMutation({
 *   variables: {
 *      segment_id: // value for 'segment_id'
 *   },
 * });
 */
export function useDeleteErrorSegmentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.DeleteErrorSegmentMutation,
        Types.DeleteErrorSegmentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.DeleteErrorSegmentMutation,
        Types.DeleteErrorSegmentMutationVariables
    >(DeleteErrorSegmentDocument, baseOptions);
}
export type DeleteErrorSegmentMutationHookResult = ReturnType<
    typeof useDeleteErrorSegmentMutation
>;
export type DeleteErrorSegmentMutationResult = Apollo.MutationResult<Types.DeleteErrorSegmentMutation>;
export type DeleteErrorSegmentMutationOptions = Apollo.BaseMutationOptions<
    Types.DeleteErrorSegmentMutation,
    Types.DeleteErrorSegmentMutationVariables
>;
export const EditErrorSegmentDocument = gql`
    mutation EditErrorSegment(
        $organization_id: ID!
        $id: ID!
        $params: ErrorSearchParamsInput!
    ) {
        editErrorSegment(
            organization_id: $organization_id
            id: $id
            params: $params
        )
    }
`;
export type EditErrorSegmentMutationFn = Apollo.MutationFunction<
    Types.EditErrorSegmentMutation,
    Types.EditErrorSegmentMutationVariables
>;

/**
 * __useEditErrorSegmentMutation__
 *
 * To run a mutation, you first call `useEditErrorSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditErrorSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editErrorSegmentMutation, { data, loading, error }] = useEditErrorSegmentMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditErrorSegmentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.EditErrorSegmentMutation,
        Types.EditErrorSegmentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.EditErrorSegmentMutation,
        Types.EditErrorSegmentMutationVariables
    >(EditErrorSegmentDocument, baseOptions);
}
export type EditErrorSegmentMutationHookResult = ReturnType<
    typeof useEditErrorSegmentMutation
>;
export type EditErrorSegmentMutationResult = Apollo.MutationResult<Types.EditErrorSegmentMutation>;
export type EditErrorSegmentMutationOptions = Apollo.BaseMutationOptions<
    Types.EditErrorSegmentMutation,
    Types.EditErrorSegmentMutationVariables
>;
export const CreateErrorSegmentDocument = gql`
    mutation CreateErrorSegment(
        $organization_id: ID!
        $name: String!
        $params: ErrorSearchParamsInput!
    ) {
        createErrorSegment(
            organization_id: $organization_id
            name: $name
            params: $params
        ) {
            name
            id
            params {
                date_range {
                    start_date
                    end_date
                }
                os
                browser
                visited_url
                hide_resolved
            }
        }
    }
`;
export type CreateErrorSegmentMutationFn = Apollo.MutationFunction<
    Types.CreateErrorSegmentMutation,
    Types.CreateErrorSegmentMutationVariables
>;

/**
 * __useCreateErrorSegmentMutation__
 *
 * To run a mutation, you first call `useCreateErrorSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateErrorSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createErrorSegmentMutation, { data, loading, error }] = useCreateErrorSegmentMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      name: // value for 'name'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateErrorSegmentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.CreateErrorSegmentMutation,
        Types.CreateErrorSegmentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.CreateErrorSegmentMutation,
        Types.CreateErrorSegmentMutationVariables
    >(CreateErrorSegmentDocument, baseOptions);
}
export type CreateErrorSegmentMutationHookResult = ReturnType<
    typeof useCreateErrorSegmentMutation
>;
export type CreateErrorSegmentMutationResult = Apollo.MutationResult<Types.CreateErrorSegmentMutation>;
export type CreateErrorSegmentMutationOptions = Apollo.BaseMutationOptions<
    Types.CreateErrorSegmentMutation,
    Types.CreateErrorSegmentMutationVariables
>;
export const GetEventsDocument = gql`
    query GetEvents($session_id: ID!) {
        events(session_id: $session_id)
        errors(session_id: $session_id) {
            ...errorFields
        }
    }
    ${ErrorFieldsFragmentDoc}
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
        $processed: Boolean!
        $params: SearchParamsInput
    ) {
        sessionsBETA(
            organization_id: $organization_id
            count: $count
            processed: $processed
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
 *      processed: // value for 'processed'
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
        billingDetails(organization_id: $organization_id) {
            plan {
                type
                quota
            }
            meter
        }
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
export const GetErrorGroupDocument = gql`
    query GetErrorGroup($id: ID!) {
        error_group(id: $id) {
            id
            type
            organization_id
            event
            resolved
            trace {
                file_name
                line_number
                function_name
                column_number
            }
            metadata_log {
                error_id
                session_id
                timestamp
                os
                browser
                visited_url
            }
            field_group {
                name
                value
            }
        }
    }
`;

/**
 * __useGetErrorGroupQuery__
 *
 * To run a query within a React component, call `useGetErrorGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorGroupQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetErrorGroupQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorGroupQuery,
        Types.GetErrorGroupQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetErrorGroupQuery,
        Types.GetErrorGroupQueryVariables
    >(GetErrorGroupDocument, baseOptions);
}
export function useGetErrorGroupLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorGroupQuery,
        Types.GetErrorGroupQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorGroupQuery,
        Types.GetErrorGroupQueryVariables
    >(GetErrorGroupDocument, baseOptions);
}
export type GetErrorGroupQueryHookResult = ReturnType<
    typeof useGetErrorGroupQuery
>;
export type GetErrorGroupLazyQueryHookResult = ReturnType<
    typeof useGetErrorGroupLazyQuery
>;
export type GetErrorGroupQueryResult = Apollo.QueryResult<
    Types.GetErrorGroupQuery,
    Types.GetErrorGroupQueryVariables
>;
export const GetErrorGroupsDocument = gql`
    query GetErrorGroups(
        $organization_id: ID!
        $count: Int!
        $params: ErrorSearchParamsInput
    ) {
        error_groups(
            organization_id: $organization_id
            count: $count
            params: $params
        ) {
            error_groups {
                id
                type
                event
                resolved
                trace {
                    file_name
                    line_number
                    function_name
                    column_number
                }
                metadata_log {
                    error_id
                    session_id
                    timestamp
                }
            }
            totalCount
        }
    }
`;

/**
 * __useGetErrorGroupsQuery__
 *
 * To run a query within a React component, call `useGetErrorGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorGroupsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      count: // value for 'count'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetErrorGroupsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorGroupsQuery,
        Types.GetErrorGroupsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetErrorGroupsQuery,
        Types.GetErrorGroupsQueryVariables
    >(GetErrorGroupsDocument, baseOptions);
}
export function useGetErrorGroupsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorGroupsQuery,
        Types.GetErrorGroupsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorGroupsQuery,
        Types.GetErrorGroupsQueryVariables
    >(GetErrorGroupsDocument, baseOptions);
}
export type GetErrorGroupsQueryHookResult = ReturnType<
    typeof useGetErrorGroupsQuery
>;
export type GetErrorGroupsLazyQueryHookResult = ReturnType<
    typeof useGetErrorGroupsLazyQuery
>;
export type GetErrorGroupsQueryResult = Apollo.QueryResult<
    Types.GetErrorGroupsQuery,
    Types.GetErrorGroupsQueryVariables
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
export const GetOrganizationSuggestionDocument = gql`
    query GetOrganizationSuggestion($query: String!) {
        organizationSuggestion(query: $query) {
            id
            name
        }
    }
`;

/**
 * __useGetOrganizationSuggestionQuery__
 *
 * To run a query within a React component, call `useGetOrganizationSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationSuggestionQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetOrganizationSuggestionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetOrganizationSuggestionQuery,
        Types.GetOrganizationSuggestionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetOrganizationSuggestionQuery,
        Types.GetOrganizationSuggestionQueryVariables
    >(GetOrganizationSuggestionDocument, baseOptions);
}
export function useGetOrganizationSuggestionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetOrganizationSuggestionQuery,
        Types.GetOrganizationSuggestionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetOrganizationSuggestionQuery,
        Types.GetOrganizationSuggestionQueryVariables
    >(GetOrganizationSuggestionDocument, baseOptions);
}
export type GetOrganizationSuggestionQueryHookResult = ReturnType<
    typeof useGetOrganizationSuggestionQuery
>;
export type GetOrganizationSuggestionLazyQueryHookResult = ReturnType<
    typeof useGetOrganizationSuggestionLazyQuery
>;
export type GetOrganizationSuggestionQueryResult = Apollo.QueryResult<
    Types.GetOrganizationSuggestionQuery,
    Types.GetOrganizationSuggestionQueryVariables
>;
export const GetErrorFieldSuggestionDocument = gql`
    query GetErrorFieldSuggestion(
        $organization_id: ID!
        $name: String!
        $query: String!
    ) {
        error_field_suggestion(
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
 * __useGetErrorFieldSuggestionQuery__
 *
 * To run a query within a React component, call `useGetErrorFieldSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorFieldSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorFieldSuggestionQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      name: // value for 'name'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetErrorFieldSuggestionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorFieldSuggestionQuery,
        Types.GetErrorFieldSuggestionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetErrorFieldSuggestionQuery,
        Types.GetErrorFieldSuggestionQueryVariables
    >(GetErrorFieldSuggestionDocument, baseOptions);
}
export function useGetErrorFieldSuggestionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorFieldSuggestionQuery,
        Types.GetErrorFieldSuggestionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorFieldSuggestionQuery,
        Types.GetErrorFieldSuggestionQueryVariables
    >(GetErrorFieldSuggestionDocument, baseOptions);
}
export type GetErrorFieldSuggestionQueryHookResult = ReturnType<
    typeof useGetErrorFieldSuggestionQuery
>;
export type GetErrorFieldSuggestionLazyQueryHookResult = ReturnType<
    typeof useGetErrorFieldSuggestionLazyQuery
>;
export type GetErrorFieldSuggestionQueryResult = Apollo.QueryResult<
    Types.GetErrorFieldSuggestionQuery,
    Types.GetErrorFieldSuggestionQueryVariables
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
                length_range {
                    min
                    max
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
export const GetErrorSegmentsDocument = gql`
    query GetErrorSegments($organization_id: ID!) {
        error_segments(organization_id: $organization_id) {
            id
            name
            params {
                date_range {
                    start_date
                    end_date
                }
                os
                browser
                visited_url
                hide_resolved
                event
            }
        }
    }
`;

/**
 * __useGetErrorSegmentsQuery__
 *
 * To run a query within a React component, call `useGetErrorSegmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorSegmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorSegmentsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetErrorSegmentsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorSegmentsQuery,
        Types.GetErrorSegmentsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetErrorSegmentsQuery,
        Types.GetErrorSegmentsQueryVariables
    >(GetErrorSegmentsDocument, baseOptions);
}
export function useGetErrorSegmentsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorSegmentsQuery,
        Types.GetErrorSegmentsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorSegmentsQuery,
        Types.GetErrorSegmentsQueryVariables
    >(GetErrorSegmentsDocument, baseOptions);
}
export type GetErrorSegmentsQueryHookResult = ReturnType<
    typeof useGetErrorSegmentsQuery
>;
export type GetErrorSegmentsLazyQueryHookResult = ReturnType<
    typeof useGetErrorSegmentsLazyQuery
>;
export type GetErrorSegmentsQueryResult = Apollo.QueryResult<
    Types.GetErrorSegmentsQuery,
    Types.GetErrorSegmentsQueryVariables
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
export const UnprocessedSessionsCountDocument = gql`
    query UnprocessedSessionsCount($organization_id: ID!) {
        unprocessedSessionsCount(organization_id: $organization_id)
    }
`;

/**
 * __useUnprocessedSessionsCountQuery__
 *
 * To run a query within a React component, call `useUnprocessedSessionsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useUnprocessedSessionsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUnprocessedSessionsCountQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useUnprocessedSessionsCountQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.UnprocessedSessionsCountQuery,
        Types.UnprocessedSessionsCountQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.UnprocessedSessionsCountQuery,
        Types.UnprocessedSessionsCountQueryVariables
    >(UnprocessedSessionsCountDocument, baseOptions);
}
export function useUnprocessedSessionsCountLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.UnprocessedSessionsCountQuery,
        Types.UnprocessedSessionsCountQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.UnprocessedSessionsCountQuery,
        Types.UnprocessedSessionsCountQueryVariables
    >(UnprocessedSessionsCountDocument, baseOptions);
}
export type UnprocessedSessionsCountQueryHookResult = ReturnType<
    typeof useUnprocessedSessionsCountQuery
>;
export type UnprocessedSessionsCountLazyQueryHookResult = ReturnType<
    typeof useUnprocessedSessionsCountLazyQuery
>;
export type UnprocessedSessionsCountQueryResult = Apollo.QueryResult<
    Types.UnprocessedSessionsCountQuery,
    Types.UnprocessedSessionsCountQueryVariables
>;
