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
        stack_trace
        timestamp
        payload
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
export const MarkSessionAsStarredDocument = gql`
    mutation MarkSessionAsStarred($id: ID!, $starred: Boolean!) {
        markSessionAsStarred(id: $id, starred: $starred) {
            id
            starred
        }
    }
`;
export type MarkSessionAsStarredMutationFn = Apollo.MutationFunction<
    Types.MarkSessionAsStarredMutation,
    Types.MarkSessionAsStarredMutationVariables
>;

/**
 * __useMarkSessionAsStarredMutation__
 *
 * To run a mutation, you first call `useMarkSessionAsStarredMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkSessionAsStarredMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markSessionAsStarredMutation, { data, loading, error }] = useMarkSessionAsStarredMutation({
 *   variables: {
 *      id: // value for 'id'
 *      starred: // value for 'starred'
 *   },
 * });
 */
export function useMarkSessionAsStarredMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.MarkSessionAsStarredMutation,
        Types.MarkSessionAsStarredMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.MarkSessionAsStarredMutation,
        Types.MarkSessionAsStarredMutationVariables
    >(MarkSessionAsStarredDocument, baseOptions);
}
export type MarkSessionAsStarredMutationHookResult = ReturnType<
    typeof useMarkSessionAsStarredMutation
>;
export type MarkSessionAsStarredMutationResult = Apollo.MutationResult<Types.MarkSessionAsStarredMutation>;
export type MarkSessionAsStarredMutationOptions = Apollo.BaseMutationOptions<
    Types.MarkSessionAsStarredMutation,
    Types.MarkSessionAsStarredMutationVariables
>;
export const CreateOrUpdateStripeSubscriptionDocument = gql`
    mutation CreateOrUpdateStripeSubscription(
        $organization_id: ID!
        $plan_type: PlanType!
    ) {
        createOrUpdateStripeSubscription(
            organization_id: $organization_id
            plan_type: $plan_type
        )
    }
`;
export type CreateOrUpdateStripeSubscriptionMutationFn = Apollo.MutationFunction<
    Types.CreateOrUpdateStripeSubscriptionMutation,
    Types.CreateOrUpdateStripeSubscriptionMutationVariables
>;

/**
 * __useCreateOrUpdateStripeSubscriptionMutation__
 *
 * To run a mutation, you first call `useCreateOrUpdateStripeSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrUpdateStripeSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrUpdateStripeSubscriptionMutation, { data, loading, error }] = useCreateOrUpdateStripeSubscriptionMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      plan_type: // value for 'plan_type'
 *   },
 * });
 */
export function useCreateOrUpdateStripeSubscriptionMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.CreateOrUpdateStripeSubscriptionMutation,
        Types.CreateOrUpdateStripeSubscriptionMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.CreateOrUpdateStripeSubscriptionMutation,
        Types.CreateOrUpdateStripeSubscriptionMutationVariables
    >(CreateOrUpdateStripeSubscriptionDocument, baseOptions);
}
export type CreateOrUpdateStripeSubscriptionMutationHookResult = ReturnType<
    typeof useCreateOrUpdateStripeSubscriptionMutation
>;
export type CreateOrUpdateStripeSubscriptionMutationResult = Apollo.MutationResult<Types.CreateOrUpdateStripeSubscriptionMutation>;
export type CreateOrUpdateStripeSubscriptionMutationOptions = Apollo.BaseMutationOptions<
    Types.CreateOrUpdateStripeSubscriptionMutation,
    Types.CreateOrUpdateStripeSubscriptionMutationVariables
>;
export const UpdateBillingDetailsDocument = gql`
    mutation UpdateBillingDetails($organization_id: ID!) {
        updateBillingDetails(organization_id: $organization_id)
    }
`;
export type UpdateBillingDetailsMutationFn = Apollo.MutationFunction<
    Types.UpdateBillingDetailsMutation,
    Types.UpdateBillingDetailsMutationVariables
>;

/**
 * __useUpdateBillingDetailsMutation__
 *
 * To run a mutation, you first call `useUpdateBillingDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBillingDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBillingDetailsMutation, { data, loading, error }] = useUpdateBillingDetailsMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useUpdateBillingDetailsMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateBillingDetailsMutation,
        Types.UpdateBillingDetailsMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateBillingDetailsMutation,
        Types.UpdateBillingDetailsMutationVariables
    >(UpdateBillingDetailsDocument, baseOptions);
}
export type UpdateBillingDetailsMutationHookResult = ReturnType<
    typeof useUpdateBillingDetailsMutation
>;
export type UpdateBillingDetailsMutationResult = Apollo.MutationResult<Types.UpdateBillingDetailsMutation>;
export type UpdateBillingDetailsMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateBillingDetailsMutation,
    Types.UpdateBillingDetailsMutationVariables
>;
export const UpdateErrorGroupStateDocument = gql`
    mutation updateErrorGroupState($id: ID!, $state: String!) {
        updateErrorGroupState(id: $id, state: $state) {
            id
            state
        }
    }
`;
export type UpdateErrorGroupStateMutationFn = Apollo.MutationFunction<
    Types.UpdateErrorGroupStateMutation,
    Types.UpdateErrorGroupStateMutationVariables
>;

/**
 * __useUpdateErrorGroupStateMutation__
 *
 * To run a mutation, you first call `useUpdateErrorGroupStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateErrorGroupStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateErrorGroupStateMutation, { data, loading, error }] = useUpdateErrorGroupStateMutation({
 *   variables: {
 *      id: // value for 'id'
 *      state: // value for 'state'
 *   },
 * });
 */
export function useUpdateErrorGroupStateMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateErrorGroupStateMutation,
        Types.UpdateErrorGroupStateMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateErrorGroupStateMutation,
        Types.UpdateErrorGroupStateMutationVariables
    >(UpdateErrorGroupStateDocument, baseOptions);
}
export type UpdateErrorGroupStateMutationHookResult = ReturnType<
    typeof useUpdateErrorGroupStateMutation
>;
export type UpdateErrorGroupStateMutationResult = Apollo.MutationResult<Types.UpdateErrorGroupStateMutation>;
export type UpdateErrorGroupStateMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateErrorGroupStateMutation,
    Types.UpdateErrorGroupStateMutationVariables
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
export const DeleteAdminFromOrganizationDocument = gql`
    mutation DeleteAdminFromOrganization(
        $organization_id: ID!
        $admin_id: ID!
    ) {
        deleteAdminFromOrganization(
            organization_id: $organization_id
            admin_id: $admin_id
        )
    }
`;
export type DeleteAdminFromOrganizationMutationFn = Apollo.MutationFunction<
    Types.DeleteAdminFromOrganizationMutation,
    Types.DeleteAdminFromOrganizationMutationVariables
>;

/**
 * __useDeleteAdminFromOrganizationMutation__
 *
 * To run a mutation, you first call `useDeleteAdminFromOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAdminFromOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAdminFromOrganizationMutation, { data, loading, error }] = useDeleteAdminFromOrganizationMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      admin_id: // value for 'admin_id'
 *   },
 * });
 */
export function useDeleteAdminFromOrganizationMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.DeleteAdminFromOrganizationMutation,
        Types.DeleteAdminFromOrganizationMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.DeleteAdminFromOrganizationMutation,
        Types.DeleteAdminFromOrganizationMutationVariables
    >(DeleteAdminFromOrganizationDocument, baseOptions);
}
export type DeleteAdminFromOrganizationMutationHookResult = ReturnType<
    typeof useDeleteAdminFromOrganizationMutation
>;
export type DeleteAdminFromOrganizationMutationResult = Apollo.MutationResult<Types.DeleteAdminFromOrganizationMutation>;
export type DeleteAdminFromOrganizationMutationOptions = Apollo.BaseMutationOptions<
    Types.DeleteAdminFromOrganizationMutation,
    Types.DeleteAdminFromOrganizationMutationVariables
>;
export const OpenSlackConversationDocument = gql`
    mutation OpenSlackConversation(
        $organization_id: ID!
        $code: String!
        $redirect_path: String!
    ) {
        openSlackConversation(
            organization_id: $organization_id
            code: $code
            redirect_path: $redirect_path
        )
    }
`;
export type OpenSlackConversationMutationFn = Apollo.MutationFunction<
    Types.OpenSlackConversationMutation,
    Types.OpenSlackConversationMutationVariables
>;

/**
 * __useOpenSlackConversationMutation__
 *
 * To run a mutation, you first call `useOpenSlackConversationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOpenSlackConversationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [openSlackConversationMutation, { data, loading, error }] = useOpenSlackConversationMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      code: // value for 'code'
 *      redirect_path: // value for 'redirect_path'
 *   },
 * });
 */
export function useOpenSlackConversationMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.OpenSlackConversationMutation,
        Types.OpenSlackConversationMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.OpenSlackConversationMutation,
        Types.OpenSlackConversationMutationVariables
    >(OpenSlackConversationDocument, baseOptions);
}
export type OpenSlackConversationMutationHookResult = ReturnType<
    typeof useOpenSlackConversationMutation
>;
export type OpenSlackConversationMutationResult = Apollo.MutationResult<Types.OpenSlackConversationMutation>;
export type OpenSlackConversationMutationOptions = Apollo.BaseMutationOptions<
    Types.OpenSlackConversationMutation,
    Types.OpenSlackConversationMutationVariables
>;
export const AddSlackBotIntegrationToOrganizationDocument = gql`
    mutation AddSlackBotIntegrationToOrganization(
        $organization_id: ID!
        $code: String!
        $redirect_path: String!
    ) {
        addSlackBotIntegrationToOrganization(
            organization_id: $organization_id
            code: $code
            redirect_path: $redirect_path
        )
    }
`;
export type AddSlackBotIntegrationToOrganizationMutationFn = Apollo.MutationFunction<
    Types.AddSlackBotIntegrationToOrganizationMutation,
    Types.AddSlackBotIntegrationToOrganizationMutationVariables
>;

/**
 * __useAddSlackBotIntegrationToOrganizationMutation__
 *
 * To run a mutation, you first call `useAddSlackBotIntegrationToOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSlackBotIntegrationToOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSlackBotIntegrationToOrganizationMutation, { data, loading, error }] = useAddSlackBotIntegrationToOrganizationMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      code: // value for 'code'
 *      redirect_path: // value for 'redirect_path'
 *   },
 * });
 */
export function useAddSlackBotIntegrationToOrganizationMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.AddSlackBotIntegrationToOrganizationMutation,
        Types.AddSlackBotIntegrationToOrganizationMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.AddSlackBotIntegrationToOrganizationMutation,
        Types.AddSlackBotIntegrationToOrganizationMutationVariables
    >(AddSlackBotIntegrationToOrganizationDocument, baseOptions);
}
export type AddSlackBotIntegrationToOrganizationMutationHookResult = ReturnType<
    typeof useAddSlackBotIntegrationToOrganizationMutation
>;
export type AddSlackBotIntegrationToOrganizationMutationResult = Apollo.MutationResult<Types.AddSlackBotIntegrationToOrganizationMutation>;
export type AddSlackBotIntegrationToOrganizationMutationOptions = Apollo.BaseMutationOptions<
    Types.AddSlackBotIntegrationToOrganizationMutation,
    Types.AddSlackBotIntegrationToOrganizationMutationVariables
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
export const CreateSessionCommentDocument = gql`
    mutation CreateSessionComment(
        $organization_id: ID!
        $session_id: ID!
        $session_timestamp: Int!
        $text: String!
        $text_for_email: String!
        $x_coordinate: Float!
        $y_coordinate: Float!
        $tagged_admins: [SanitizedAdminInput]!
        $tagged_slack_users: [SanitizedSlackChannelInput]!
        $session_url: String!
        $time: Float!
        $author_name: String!
        $session_image: String
    ) {
        createSessionComment(
            organization_id: $organization_id
            session_id: $session_id
            session_timestamp: $session_timestamp
            text: $text
            text_for_email: $text_for_email
            x_coordinate: $x_coordinate
            y_coordinate: $y_coordinate
            tagged_admins: $tagged_admins
            tagged_slack_users: $tagged_slack_users
            session_url: $session_url
            time: $time
            author_name: $author_name
            session_image: $session_image
        ) {
            id
            timestamp
            created_at
            updated_at
            author {
                id
                name
                email
            }
            text
            x_coordinate
            y_coordinate
        }
    }
`;
export type CreateSessionCommentMutationFn = Apollo.MutationFunction<
    Types.CreateSessionCommentMutation,
    Types.CreateSessionCommentMutationVariables
>;

/**
 * __useCreateSessionCommentMutation__
 *
 * To run a mutation, you first call `useCreateSessionCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSessionCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSessionCommentMutation, { data, loading, error }] = useCreateSessionCommentMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      session_id: // value for 'session_id'
 *      session_timestamp: // value for 'session_timestamp'
 *      text: // value for 'text'
 *      text_for_email: // value for 'text_for_email'
 *      x_coordinate: // value for 'x_coordinate'
 *      y_coordinate: // value for 'y_coordinate'
 *      tagged_admins: // value for 'tagged_admins'
 *      tagged_slack_users: // value for 'tagged_slack_users'
 *      session_url: // value for 'session_url'
 *      time: // value for 'time'
 *      author_name: // value for 'author_name'
 *      session_image: // value for 'session_image'
 *   },
 * });
 */
export function useCreateSessionCommentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.CreateSessionCommentMutation,
        Types.CreateSessionCommentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.CreateSessionCommentMutation,
        Types.CreateSessionCommentMutationVariables
    >(CreateSessionCommentDocument, baseOptions);
}
export type CreateSessionCommentMutationHookResult = ReturnType<
    typeof useCreateSessionCommentMutation
>;
export type CreateSessionCommentMutationResult = Apollo.MutationResult<Types.CreateSessionCommentMutation>;
export type CreateSessionCommentMutationOptions = Apollo.BaseMutationOptions<
    Types.CreateSessionCommentMutation,
    Types.CreateSessionCommentMutationVariables
>;
export const DeleteSessionCommentDocument = gql`
    mutation DeleteSessionComment($id: ID!) {
        deleteSessionComment(id: $id)
    }
`;
export type DeleteSessionCommentMutationFn = Apollo.MutationFunction<
    Types.DeleteSessionCommentMutation,
    Types.DeleteSessionCommentMutationVariables
>;

/**
 * __useDeleteSessionCommentMutation__
 *
 * To run a mutation, you first call `useDeleteSessionCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSessionCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSessionCommentMutation, { data, loading, error }] = useDeleteSessionCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSessionCommentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.DeleteSessionCommentMutation,
        Types.DeleteSessionCommentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.DeleteSessionCommentMutation,
        Types.DeleteSessionCommentMutationVariables
    >(DeleteSessionCommentDocument, baseOptions);
}
export type DeleteSessionCommentMutationHookResult = ReturnType<
    typeof useDeleteSessionCommentMutation
>;
export type DeleteSessionCommentMutationResult = Apollo.MutationResult<Types.DeleteSessionCommentMutation>;
export type DeleteSessionCommentMutationOptions = Apollo.BaseMutationOptions<
    Types.DeleteSessionCommentMutation,
    Types.DeleteSessionCommentMutationVariables
>;
export const CreateErrorCommentDocument = gql`
    mutation CreateErrorComment(
        $organization_id: ID!
        $error_group_id: ID!
        $text: String!
        $text_for_email: String!
        $tagged_admins: [SanitizedAdminInput]!
        $tagged_slack_users: [SanitizedSlackChannelInput]!
        $error_url: String!
        $author_name: String!
    ) {
        createErrorComment(
            organization_id: $organization_id
            error_group_id: $error_group_id
            text: $text
            text_for_email: $text_for_email
            tagged_admins: $tagged_admins
            tagged_slack_users: $tagged_slack_users
            error_url: $error_url
            author_name: $author_name
        ) {
            id
            created_at
            updated_at
            author {
                id
                name
                email
            }
            text
        }
    }
`;
export type CreateErrorCommentMutationFn = Apollo.MutationFunction<
    Types.CreateErrorCommentMutation,
    Types.CreateErrorCommentMutationVariables
>;

/**
 * __useCreateErrorCommentMutation__
 *
 * To run a mutation, you first call `useCreateErrorCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateErrorCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createErrorCommentMutation, { data, loading, error }] = useCreateErrorCommentMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      error_group_id: // value for 'error_group_id'
 *      text: // value for 'text'
 *      text_for_email: // value for 'text_for_email'
 *      tagged_admins: // value for 'tagged_admins'
 *      tagged_slack_users: // value for 'tagged_slack_users'
 *      error_url: // value for 'error_url'
 *      author_name: // value for 'author_name'
 *   },
 * });
 */
export function useCreateErrorCommentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.CreateErrorCommentMutation,
        Types.CreateErrorCommentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.CreateErrorCommentMutation,
        Types.CreateErrorCommentMutationVariables
    >(CreateErrorCommentDocument, baseOptions);
}
export type CreateErrorCommentMutationHookResult = ReturnType<
    typeof useCreateErrorCommentMutation
>;
export type CreateErrorCommentMutationResult = Apollo.MutationResult<Types.CreateErrorCommentMutation>;
export type CreateErrorCommentMutationOptions = Apollo.BaseMutationOptions<
    Types.CreateErrorCommentMutation,
    Types.CreateErrorCommentMutationVariables
>;
export const DeleteErrorCommentDocument = gql`
    mutation DeleteErrorComment($id: ID!) {
        deleteErrorComment(id: $id)
    }
`;
export type DeleteErrorCommentMutationFn = Apollo.MutationFunction<
    Types.DeleteErrorCommentMutation,
    Types.DeleteErrorCommentMutationVariables
>;

/**
 * __useDeleteErrorCommentMutation__
 *
 * To run a mutation, you first call `useDeleteErrorCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteErrorCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteErrorCommentMutation, { data, loading, error }] = useDeleteErrorCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteErrorCommentMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.DeleteErrorCommentMutation,
        Types.DeleteErrorCommentMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.DeleteErrorCommentMutation,
        Types.DeleteErrorCommentMutationVariables
    >(DeleteErrorCommentDocument, baseOptions);
}
export type DeleteErrorCommentMutationHookResult = ReturnType<
    typeof useDeleteErrorCommentMutation
>;
export type DeleteErrorCommentMutationResult = Apollo.MutationResult<Types.DeleteErrorCommentMutation>;
export type DeleteErrorCommentMutationOptions = Apollo.BaseMutationOptions<
    Types.DeleteErrorCommentMutation,
    Types.DeleteErrorCommentMutationVariables
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
                state
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
export const UpdateErrorAlertDocument = gql`
    mutation UpdateErrorAlert(
        $organization_id: ID!
        $error_alert_id: ID!
        $count_threshold: Int!
        $threshold_window: Int!
        $slack_channels: [SanitizedSlackChannelInput]!
        $environments: [String]!
    ) {
        updateErrorAlert(
            organization_id: $organization_id
            error_alert_id: $error_alert_id
            count_threshold: $count_threshold
            slack_channels: $slack_channels
            environments: $environments
            threshold_window: $threshold_window
        ) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
            ThresholdWindow
        }
    }
`;
export type UpdateErrorAlertMutationFn = Apollo.MutationFunction<
    Types.UpdateErrorAlertMutation,
    Types.UpdateErrorAlertMutationVariables
>;

/**
 * __useUpdateErrorAlertMutation__
 *
 * To run a mutation, you first call `useUpdateErrorAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateErrorAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateErrorAlertMutation, { data, loading, error }] = useUpdateErrorAlertMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      error_alert_id: // value for 'error_alert_id'
 *      count_threshold: // value for 'count_threshold'
 *      threshold_window: // value for 'threshold_window'
 *      slack_channels: // value for 'slack_channels'
 *      environments: // value for 'environments'
 *   },
 * });
 */
export function useUpdateErrorAlertMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateErrorAlertMutation,
        Types.UpdateErrorAlertMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateErrorAlertMutation,
        Types.UpdateErrorAlertMutationVariables
    >(UpdateErrorAlertDocument, baseOptions);
}
export type UpdateErrorAlertMutationHookResult = ReturnType<
    typeof useUpdateErrorAlertMutation
>;
export type UpdateErrorAlertMutationResult = Apollo.MutationResult<Types.UpdateErrorAlertMutation>;
export type UpdateErrorAlertMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateErrorAlertMutation,
    Types.UpdateErrorAlertMutationVariables
>;
export const UpdateNewUserAlertDocument = gql`
    mutation UpdateNewUserAlert(
        $organization_id: ID!
        $session_alert_id: ID!
        $count_threshold: Int!
        $slack_channels: [SanitizedSlackChannelInput]!
        $environments: [String]!
    ) {
        updateNewUserAlert(
            organization_id: $organization_id
            session_alert_id: $session_alert_id
            count_threshold: $count_threshold
            slack_channels: $slack_channels
            environments: $environments
        ) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;
export type UpdateNewUserAlertMutationFn = Apollo.MutationFunction<
    Types.UpdateNewUserAlertMutation,
    Types.UpdateNewUserAlertMutationVariables
>;

/**
 * __useUpdateNewUserAlertMutation__
 *
 * To run a mutation, you first call `useUpdateNewUserAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNewUserAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNewUserAlertMutation, { data, loading, error }] = useUpdateNewUserAlertMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      session_alert_id: // value for 'session_alert_id'
 *      count_threshold: // value for 'count_threshold'
 *      slack_channels: // value for 'slack_channels'
 *      environments: // value for 'environments'
 *   },
 * });
 */
export function useUpdateNewUserAlertMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateNewUserAlertMutation,
        Types.UpdateNewUserAlertMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateNewUserAlertMutation,
        Types.UpdateNewUserAlertMutationVariables
    >(UpdateNewUserAlertDocument, baseOptions);
}
export type UpdateNewUserAlertMutationHookResult = ReturnType<
    typeof useUpdateNewUserAlertMutation
>;
export type UpdateNewUserAlertMutationResult = Apollo.MutationResult<Types.UpdateNewUserAlertMutation>;
export type UpdateNewUserAlertMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateNewUserAlertMutation,
    Types.UpdateNewUserAlertMutationVariables
>;
export const UpdateTrackPropertiesAlertDocument = gql`
    mutation UpdateTrackPropertiesAlert(
        $organization_id: ID!
        $session_alert_id: ID!
        $slack_channels: [SanitizedSlackChannelInput]!
        $environments: [String]!
        $track_properties: [TrackPropertyInput]!
    ) {
        updateTrackPropertiesAlert(
            organization_id: $organization_id
            session_alert_id: $session_alert_id
            slack_channels: $slack_channels
            environments: $environments
            track_properties: $track_properties
        ) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;
export type UpdateTrackPropertiesAlertMutationFn = Apollo.MutationFunction<
    Types.UpdateTrackPropertiesAlertMutation,
    Types.UpdateTrackPropertiesAlertMutationVariables
>;

/**
 * __useUpdateTrackPropertiesAlertMutation__
 *
 * To run a mutation, you first call `useUpdateTrackPropertiesAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTrackPropertiesAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTrackPropertiesAlertMutation, { data, loading, error }] = useUpdateTrackPropertiesAlertMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      session_alert_id: // value for 'session_alert_id'
 *      slack_channels: // value for 'slack_channels'
 *      environments: // value for 'environments'
 *      track_properties: // value for 'track_properties'
 *   },
 * });
 */
export function useUpdateTrackPropertiesAlertMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateTrackPropertiesAlertMutation,
        Types.UpdateTrackPropertiesAlertMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateTrackPropertiesAlertMutation,
        Types.UpdateTrackPropertiesAlertMutationVariables
    >(UpdateTrackPropertiesAlertDocument, baseOptions);
}
export type UpdateTrackPropertiesAlertMutationHookResult = ReturnType<
    typeof useUpdateTrackPropertiesAlertMutation
>;
export type UpdateTrackPropertiesAlertMutationResult = Apollo.MutationResult<Types.UpdateTrackPropertiesAlertMutation>;
export type UpdateTrackPropertiesAlertMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateTrackPropertiesAlertMutation,
    Types.UpdateTrackPropertiesAlertMutationVariables
>;
export const UpdateUserPropertiesAlertDocument = gql`
    mutation UpdateUserPropertiesAlert(
        $organization_id: ID!
        $session_alert_id: ID!
        $slack_channels: [SanitizedSlackChannelInput]!
        $environments: [String]!
        $user_properties: [UserPropertyInput]!
    ) {
        updateUserPropertiesAlert(
            organization_id: $organization_id
            session_alert_id: $session_alert_id
            slack_channels: $slack_channels
            environments: $environments
            user_properties: $user_properties
        ) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;
export type UpdateUserPropertiesAlertMutationFn = Apollo.MutationFunction<
    Types.UpdateUserPropertiesAlertMutation,
    Types.UpdateUserPropertiesAlertMutationVariables
>;

/**
 * __useUpdateUserPropertiesAlertMutation__
 *
 * To run a mutation, you first call `useUpdateUserPropertiesAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserPropertiesAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserPropertiesAlertMutation, { data, loading, error }] = useUpdateUserPropertiesAlertMutation({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      session_alert_id: // value for 'session_alert_id'
 *      slack_channels: // value for 'slack_channels'
 *      environments: // value for 'environments'
 *      user_properties: // value for 'user_properties'
 *   },
 * });
 */
export function useUpdateUserPropertiesAlertMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateUserPropertiesAlertMutation,
        Types.UpdateUserPropertiesAlertMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateUserPropertiesAlertMutation,
        Types.UpdateUserPropertiesAlertMutationVariables
    >(UpdateUserPropertiesAlertDocument, baseOptions);
}
export type UpdateUserPropertiesAlertMutationHookResult = ReturnType<
    typeof useUpdateUserPropertiesAlertMutation
>;
export type UpdateUserPropertiesAlertMutationResult = Apollo.MutationResult<Types.UpdateUserPropertiesAlertMutation>;
export type UpdateUserPropertiesAlertMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateUserPropertiesAlertMutation,
    Types.UpdateUserPropertiesAlertMutationVariables
>;
export const UpdateSessionIsPublicDocument = gql`
    mutation UpdateSessionIsPublic($session_id: ID!, $is_public: Boolean!) {
        updateSessionIsPublic(session_id: $session_id, is_public: $is_public) {
            id
            is_public
        }
    }
`;
export type UpdateSessionIsPublicMutationFn = Apollo.MutationFunction<
    Types.UpdateSessionIsPublicMutation,
    Types.UpdateSessionIsPublicMutationVariables
>;

/**
 * __useUpdateSessionIsPublicMutation__
 *
 * To run a mutation, you first call `useUpdateSessionIsPublicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSessionIsPublicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSessionIsPublicMutation, { data, loading, error }] = useUpdateSessionIsPublicMutation({
 *   variables: {
 *      session_id: // value for 'session_id'
 *      is_public: // value for 'is_public'
 *   },
 * });
 */
export function useUpdateSessionIsPublicMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateSessionIsPublicMutation,
        Types.UpdateSessionIsPublicMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateSessionIsPublicMutation,
        Types.UpdateSessionIsPublicMutationVariables
    >(UpdateSessionIsPublicDocument, baseOptions);
}
export type UpdateSessionIsPublicMutationHookResult = ReturnType<
    typeof useUpdateSessionIsPublicMutation
>;
export type UpdateSessionIsPublicMutationResult = Apollo.MutationResult<Types.UpdateSessionIsPublicMutation>;
export type UpdateSessionIsPublicMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateSessionIsPublicMutation,
    Types.UpdateSessionIsPublicMutationVariables
>;
export const UpdateErrorGroupIsPublicDocument = gql`
    mutation UpdateErrorGroupIsPublic(
        $error_group_id: ID!
        $is_public: Boolean!
    ) {
        updateErrorGroupIsPublic(
            error_group_id: $error_group_id
            is_public: $is_public
        ) {
            id
            is_public
        }
    }
`;
export type UpdateErrorGroupIsPublicMutationFn = Apollo.MutationFunction<
    Types.UpdateErrorGroupIsPublicMutation,
    Types.UpdateErrorGroupIsPublicMutationVariables
>;

/**
 * __useUpdateErrorGroupIsPublicMutation__
 *
 * To run a mutation, you first call `useUpdateErrorGroupIsPublicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateErrorGroupIsPublicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateErrorGroupIsPublicMutation, { data, loading, error }] = useUpdateErrorGroupIsPublicMutation({
 *   variables: {
 *      error_group_id: // value for 'error_group_id'
 *      is_public: // value for 'is_public'
 *   },
 * });
 */
export function useUpdateErrorGroupIsPublicMutation(
    baseOptions?: Apollo.MutationHookOptions<
        Types.UpdateErrorGroupIsPublicMutation,
        Types.UpdateErrorGroupIsPublicMutationVariables
    >
) {
    return Apollo.useMutation<
        Types.UpdateErrorGroupIsPublicMutation,
        Types.UpdateErrorGroupIsPublicMutationVariables
    >(UpdateErrorGroupIsPublicDocument, baseOptions);
}
export type UpdateErrorGroupIsPublicMutationHookResult = ReturnType<
    typeof useUpdateErrorGroupIsPublicMutation
>;
export type UpdateErrorGroupIsPublicMutationResult = Apollo.MutationResult<Types.UpdateErrorGroupIsPublicMutation>;
export type UpdateErrorGroupIsPublicMutationOptions = Apollo.BaseMutationOptions<
    Types.UpdateErrorGroupIsPublicMutation,
    Types.UpdateErrorGroupIsPublicMutationVariables
>;
export const GetSessionPayloadDocument = gql`
    query GetSessionPayload($session_id: ID!) {
        events(session_id: $session_id)
        errors(session_id: $session_id) {
            ...errorFields
        }
    }
    ${ErrorFieldsFragmentDoc}
`;

/**
 * __useGetSessionPayloadQuery__
 *
 * To run a query within a React component, call `useGetSessionPayloadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionPayloadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionPayloadQuery({
 *   variables: {
 *      session_id: // value for 'session_id'
 *   },
 * });
 */
export function useGetSessionPayloadQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSessionPayloadQuery,
        Types.GetSessionPayloadQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSessionPayloadQuery,
        Types.GetSessionPayloadQueryVariables
    >(GetSessionPayloadDocument, baseOptions);
}
export function useGetSessionPayloadLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSessionPayloadQuery,
        Types.GetSessionPayloadQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSessionPayloadQuery,
        Types.GetSessionPayloadQueryVariables
    >(GetSessionPayloadDocument, baseOptions);
}
export type GetSessionPayloadQueryHookResult = ReturnType<
    typeof useGetSessionPayloadQuery
>;
export type GetSessionPayloadLazyQueryHookResult = ReturnType<
    typeof useGetSessionPayloadLazyQuery
>;
export type GetSessionPayloadQueryResult = Apollo.QueryResult<
    Types.GetSessionPayloadQuery,
    Types.GetSessionPayloadQueryVariables
>;
export const GetSessionDocument = gql`
    query GetSession($id: ID!) {
        session(id: $id) {
            os_name
            os_version
            browser_name
            browser_version
            environment
            app_version
            city
            state
            postal
            fingerprint
            created_at
            language
            user_object
            identifier
            starred
            enable_strict_privacy
            enable_recording_network_contents
            field_group
            fields {
                name
                value
                type
            }
            object_storage_enabled
            payload_size
            within_billing_quota
            client_version
            is_public
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
            photo_url
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
export const GetSessionCommentsDocument = gql`
    query GetSessionComments($session_id: ID!) {
        session_comments(session_id: $session_id) {
            id
            timestamp
            session_id
            created_at
            updated_at
            organization_id
            text
            author {
                id
                name
                email
                photo_url
            }
            x_coordinate
            y_coordinate
            type
            metadata
        }
    }
`;

/**
 * __useGetSessionCommentsQuery__
 *
 * To run a query within a React component, call `useGetSessionCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionCommentsQuery({
 *   variables: {
 *      session_id: // value for 'session_id'
 *   },
 * });
 */
export function useGetSessionCommentsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSessionCommentsQuery,
        Types.GetSessionCommentsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSessionCommentsQuery,
        Types.GetSessionCommentsQueryVariables
    >(GetSessionCommentsDocument, baseOptions);
}
export function useGetSessionCommentsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSessionCommentsQuery,
        Types.GetSessionCommentsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSessionCommentsQuery,
        Types.GetSessionCommentsQueryVariables
    >(GetSessionCommentsDocument, baseOptions);
}
export type GetSessionCommentsQueryHookResult = ReturnType<
    typeof useGetSessionCommentsQuery
>;
export type GetSessionCommentsLazyQueryHookResult = ReturnType<
    typeof useGetSessionCommentsLazyQuery
>;
export type GetSessionCommentsQueryResult = Apollo.QueryResult<
    Types.GetSessionCommentsQuery,
    Types.GetSessionCommentsQueryVariables
>;
export const GetNotificationsDocument = gql`
    query GetNotifications($organization_id: ID!) {
        session_comments_for_organization(organization_id: $organization_id) {
            id
            timestamp
            updated_at
            session_id
            text
            author {
                id
                name
                email
                photo_url
            }
            type
            metadata
        }
        error_comments_for_organization(organization_id: $organization_id) {
            id
            updated_at
            organization_id
            text
            error_id
            author {
                id
                name
                email
                photo_url
            }
        }
    }
`;

/**
 * __useGetNotificationsQuery__
 *
 * To run a query within a React component, call `useGetNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNotificationsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetNotificationsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetNotificationsQuery,
        Types.GetNotificationsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetNotificationsQuery,
        Types.GetNotificationsQueryVariables
    >(GetNotificationsDocument, baseOptions);
}
export function useGetNotificationsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetNotificationsQuery,
        Types.GetNotificationsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetNotificationsQuery,
        Types.GetNotificationsQueryVariables
    >(GetNotificationsDocument, baseOptions);
}
export type GetNotificationsQueryHookResult = ReturnType<
    typeof useGetNotificationsQuery
>;
export type GetNotificationsLazyQueryHookResult = ReturnType<
    typeof useGetNotificationsLazyQuery
>;
export type GetNotificationsQueryResult = Apollo.QueryResult<
    Types.GetNotificationsQuery,
    Types.GetNotificationsQueryVariables
>;
export const GetSessionCommentsForAdminDocument = gql`
    query GetSessionCommentsForAdmin {
        session_comments_for_admin {
            id
            timestamp
            created_at
            organization_id
            updated_at
            text
            author {
                id
                name
                email
                photo_url
            }
        }
    }
`;

/**
 * __useGetSessionCommentsForAdminQuery__
 *
 * To run a query within a React component, call `useGetSessionCommentsForAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionCommentsForAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionCommentsForAdminQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSessionCommentsForAdminQuery(
    baseOptions?: Apollo.QueryHookOptions<
        Types.GetSessionCommentsForAdminQuery,
        Types.GetSessionCommentsForAdminQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSessionCommentsForAdminQuery,
        Types.GetSessionCommentsForAdminQueryVariables
    >(GetSessionCommentsForAdminDocument, baseOptions);
}
export function useGetSessionCommentsForAdminLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSessionCommentsForAdminQuery,
        Types.GetSessionCommentsForAdminQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSessionCommentsForAdminQuery,
        Types.GetSessionCommentsForAdminQueryVariables
    >(GetSessionCommentsForAdminDocument, baseOptions);
}
export type GetSessionCommentsForAdminQueryHookResult = ReturnType<
    typeof useGetSessionCommentsForAdminQuery
>;
export type GetSessionCommentsForAdminLazyQueryHookResult = ReturnType<
    typeof useGetSessionCommentsForAdminLazyQuery
>;
export type GetSessionCommentsForAdminQueryResult = Apollo.QueryResult<
    Types.GetSessionCommentsForAdminQuery,
    Types.GetSessionCommentsForAdminQueryVariables
>;
export const GetErrorCommentsDocument = gql`
    query GetErrorComments($error_group_id: ID!) {
        error_comments(error_group_id: $error_group_id) {
            id
            created_at
            updated_at
            text
            organization_id
            author {
                id
                name
                email
                photo_url
            }
        }
    }
`;

/**
 * __useGetErrorCommentsQuery__
 *
 * To run a query within a React component, call `useGetErrorCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorCommentsQuery({
 *   variables: {
 *      error_group_id: // value for 'error_group_id'
 *   },
 * });
 */
export function useGetErrorCommentsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorCommentsQuery,
        Types.GetErrorCommentsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetErrorCommentsQuery,
        Types.GetErrorCommentsQueryVariables
    >(GetErrorCommentsDocument, baseOptions);
}
export function useGetErrorCommentsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorCommentsQuery,
        Types.GetErrorCommentsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorCommentsQuery,
        Types.GetErrorCommentsQueryVariables
    >(GetErrorCommentsDocument, baseOptions);
}
export type GetErrorCommentsQueryHookResult = ReturnType<
    typeof useGetErrorCommentsQuery
>;
export type GetErrorCommentsLazyQueryHookResult = ReturnType<
    typeof useGetErrorCommentsLazyQuery
>;
export type GetErrorCommentsQueryResult = Apollo.QueryResult<
    Types.GetErrorCommentsQuery,
    Types.GetErrorCommentsQueryVariables
>;
export const GetOnboardingStepsDocument = gql`
    query GetOnboardingSteps($organization_id: ID!, $admin_id: ID!) {
        organization(id: $organization_id) {
            slack_channels
        }
        admins(organization_id: $organization_id) {
            id
        }
        isIntegrated(organization_id: $organization_id)
        adminHasCreatedComment(admin_id: $admin_id)
        organizationHasViewedASession(organization_id: $organization_id) {
            id
        }
        admin {
            slack_im_channel_id
        }
    }
`;

/**
 * __useGetOnboardingStepsQuery__
 *
 * To run a query within a React component, call `useGetOnboardingStepsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOnboardingStepsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOnboardingStepsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      admin_id: // value for 'admin_id'
 *   },
 * });
 */
export function useGetOnboardingStepsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetOnboardingStepsQuery,
        Types.GetOnboardingStepsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetOnboardingStepsQuery,
        Types.GetOnboardingStepsQueryVariables
    >(GetOnboardingStepsDocument, baseOptions);
}
export function useGetOnboardingStepsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetOnboardingStepsQuery,
        Types.GetOnboardingStepsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetOnboardingStepsQuery,
        Types.GetOnboardingStepsQueryVariables
    >(GetOnboardingStepsDocument, baseOptions);
}
export type GetOnboardingStepsQueryHookResult = ReturnType<
    typeof useGetOnboardingStepsQuery
>;
export type GetOnboardingStepsLazyQueryHookResult = ReturnType<
    typeof useGetOnboardingStepsLazyQuery
>;
export type GetOnboardingStepsQueryResult = Apollo.QueryResult<
    Types.GetOnboardingStepsQuery,
    Types.GetOnboardingStepsQueryVariables
>;
export const SendAdminInviteDocument = gql`
    mutation SendAdminInvite(
        $organization_id: ID!
        $email: String!
        $base_url: String!
    ) {
        sendAdminInvite(
            organization_id: $organization_id
            email: $email
            base_url: $base_url
        )
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
 *      base_url: // value for 'base_url'
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
export const GetSessionsDocument = gql`
    query GetSessions(
        $organization_id: ID!
        $count: Int!
        $lifecycle: SessionLifecycle!
        $starred: Boolean!
        $params: SearchParamsInput
    ) {
        sessions(
            organization_id: $organization_id
            count: $count
            lifecycle: $lifecycle
            starred: $starred
            params: $params
        ) {
            sessions {
                id
                fingerprint
                identifier
                os_name
                os_version
                browser_name
                browser_version
                city
                state
                postal
                created_at
                language
                length
                active_length
                enable_recording_network_contents
                viewed
                starred
                processed
                field_group
                fields {
                    name
                    value
                    type
                    id
                }
                first_time
            }
            totalCount
        }
    }
`;

/**
 * __useGetSessionsQuery__
 *
 * To run a query within a React component, call `useGetSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      count: // value for 'count'
 *      lifecycle: // value for 'lifecycle'
 *      starred: // value for 'starred'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetSessionsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSessionsQuery,
        Types.GetSessionsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSessionsQuery,
        Types.GetSessionsQueryVariables
    >(GetSessionsDocument, baseOptions);
}
export function useGetSessionsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSessionsQuery,
        Types.GetSessionsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSessionsQuery,
        Types.GetSessionsQueryVariables
    >(GetSessionsDocument, baseOptions);
}
export type GetSessionsQueryHookResult = ReturnType<typeof useGetSessionsQuery>;
export type GetSessionsLazyQueryHookResult = ReturnType<
    typeof useGetSessionsLazyQuery
>;
export type GetSessionsQueryResult = Apollo.QueryResult<
    Types.GetSessionsQuery,
    Types.GetSessionsQueryVariables
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
export const GetApplicationsDocument = gql`
    query GetApplications($id: ID!) {
        organizations {
            id
            name
        }
        organization(id: $id) {
            id
            name
            verbose_id
            billing_email
            slack_webhook_channel
            secret
        }
    }
`;

/**
 * __useGetApplicationsQuery__
 *
 * To run a query within a React component, call `useGetApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetApplicationsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetApplicationsQuery,
        Types.GetApplicationsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetApplicationsQuery,
        Types.GetApplicationsQueryVariables
    >(GetApplicationsDocument, baseOptions);
}
export function useGetApplicationsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetApplicationsQuery,
        Types.GetApplicationsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetApplicationsQuery,
        Types.GetApplicationsQueryVariables
    >(GetApplicationsDocument, baseOptions);
}
export type GetApplicationsQueryHookResult = ReturnType<
    typeof useGetApplicationsQuery
>;
export type GetApplicationsLazyQueryHookResult = ReturnType<
    typeof useGetApplicationsLazyQuery
>;
export type GetApplicationsQueryResult = Apollo.QueryResult<
    Types.GetApplicationsQuery,
    Types.GetApplicationsQueryVariables
>;
export const GetAdminDocument = gql`
    query GetAdmin {
        admin {
            id
            name
            email
            photo_url
            slack_im_channel_id
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
            verbose_id
            billing_email
            slack_webhook_channel
            secret
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
            sessionsOutOfQuota
        }
        organization(id: $organization_id) {
            id
            trial_end_date
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
            created_at
            id
            secure_id
            type
            organization_id
            event
            state
            stack_trace {
                fileName
                lineNumber
                functionName
                columnNumber
            }
            mapped_stack_trace
            metadata_log {
                error_id
                session_id
                environment
                timestamp
                os
                browser
                visited_url
                fingerprint
                identifier
            }
            field_group {
                name
                value
            }
            error_frequency
            is_public
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
                created_at
                id
                type
                event
                state
                state
                environments
                stack_trace {
                    fileName
                    lineNumber
                    functionName
                    columnNumber
                }
                metadata_log {
                    error_id
                    session_id
                    timestamp
                }
                error_frequency
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
        field_suggestion(
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
export const GetErrorSearchSuggestionsDocument = gql`
    query GetErrorSearchSuggestions($organization_id: ID!, $query: String!) {
        visitedUrls: error_field_suggestion(
            organization_id: $organization_id
            name: "visited_url"
            query: $query
        ) {
            name
            value
        }
        fields: error_field_suggestion(
            organization_id: $organization_id
            name: "event"
            query: $query
        ) {
            name
            value
        }
    }
`;

/**
 * __useGetErrorSearchSuggestionsQuery__
 *
 * To run a query within a React component, call `useGetErrorSearchSuggestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorSearchSuggestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorSearchSuggestionsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetErrorSearchSuggestionsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorSearchSuggestionsQuery,
        Types.GetErrorSearchSuggestionsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetErrorSearchSuggestionsQuery,
        Types.GetErrorSearchSuggestionsQueryVariables
    >(GetErrorSearchSuggestionsDocument, baseOptions);
}
export function useGetErrorSearchSuggestionsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorSearchSuggestionsQuery,
        Types.GetErrorSearchSuggestionsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorSearchSuggestionsQuery,
        Types.GetErrorSearchSuggestionsQueryVariables
    >(GetErrorSearchSuggestionsDocument, baseOptions);
}
export type GetErrorSearchSuggestionsQueryHookResult = ReturnType<
    typeof useGetErrorSearchSuggestionsQuery
>;
export type GetErrorSearchSuggestionsLazyQueryHookResult = ReturnType<
    typeof useGetErrorSearchSuggestionsLazyQuery
>;
export type GetErrorSearchSuggestionsQueryResult = Apollo.QueryResult<
    Types.GetErrorSearchSuggestionsQuery,
    Types.GetErrorSearchSuggestionsQueryVariables
>;
export const GetSessionSearchResultsDocument = gql`
    query GetSessionSearchResults($organization_id: ID!, $query: String!) {
        trackProperties: property_suggestion(
            organization_id: $organization_id
            query: $query
            type: "track"
        ) {
            id
            name
            value
        }
        userProperties: property_suggestion(
            organization_id: $organization_id
            query: $query
            type: "user"
        ) {
            id
            name
            value
        }
        visitedUrls: field_suggestion(
            organization_id: $organization_id
            name: "visited-url"
            query: $query
        ) {
            id
            name
            value
        }
        referrers: field_suggestion(
            organization_id: $organization_id
            name: "referrer"
            query: $query
        ) {
            id
            name
            value
        }
    }
`;

/**
 * __useGetSessionSearchResultsQuery__
 *
 * To run a query within a React component, call `useGetSessionSearchResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionSearchResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionSearchResultsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetSessionSearchResultsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSessionSearchResultsQuery,
        Types.GetSessionSearchResultsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSessionSearchResultsQuery,
        Types.GetSessionSearchResultsQueryVariables
    >(GetSessionSearchResultsDocument, baseOptions);
}
export function useGetSessionSearchResultsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSessionSearchResultsQuery,
        Types.GetSessionSearchResultsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSessionSearchResultsQuery,
        Types.GetSessionSearchResultsQueryVariables
    >(GetSessionSearchResultsDocument, baseOptions);
}
export type GetSessionSearchResultsQueryHookResult = ReturnType<
    typeof useGetSessionSearchResultsQuery
>;
export type GetSessionSearchResultsLazyQueryHookResult = ReturnType<
    typeof useGetSessionSearchResultsLazyQuery
>;
export type GetSessionSearchResultsQueryResult = Apollo.QueryResult<
    Types.GetSessionSearchResultsQuery,
    Types.GetSessionSearchResultsQueryVariables
>;
export const GetTrackSuggestionDocument = gql`
    query GetTrackSuggestion($organization_id: ID!, $query: String!) {
        property_suggestion(
            organization_id: $organization_id
            query: $query
            type: "track"
        ) {
            id
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
            id
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
                first_time
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
                state
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
export const GetKeyPerformanceIndicatorsDocument = gql`
    query GetKeyPerformanceIndicators(
        $organization_id: ID!
        $lookBackPeriod: Int!
    ) {
        unprocessedSessionsCount(organization_id: $organization_id)
        newUsersCount(
            organization_id: $organization_id
            lookBackPeriod: $lookBackPeriod
        ) {
            count
        }
        averageSessionLength(
            organization_id: $organization_id
            lookBackPeriod: $lookBackPeriod
        ) {
            length
        }
        userFingerprintCount(
            organization_id: $organization_id
            lookBackPeriod: $lookBackPeriod
        ) {
            count
        }
    }
`;

/**
 * __useGetKeyPerformanceIndicatorsQuery__
 *
 * To run a query within a React component, call `useGetKeyPerformanceIndicatorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetKeyPerformanceIndicatorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetKeyPerformanceIndicatorsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetKeyPerformanceIndicatorsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetKeyPerformanceIndicatorsQuery,
        Types.GetKeyPerformanceIndicatorsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetKeyPerformanceIndicatorsQuery,
        Types.GetKeyPerformanceIndicatorsQueryVariables
    >(GetKeyPerformanceIndicatorsDocument, baseOptions);
}
export function useGetKeyPerformanceIndicatorsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetKeyPerformanceIndicatorsQuery,
        Types.GetKeyPerformanceIndicatorsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetKeyPerformanceIndicatorsQuery,
        Types.GetKeyPerformanceIndicatorsQueryVariables
    >(GetKeyPerformanceIndicatorsDocument, baseOptions);
}
export type GetKeyPerformanceIndicatorsQueryHookResult = ReturnType<
    typeof useGetKeyPerformanceIndicatorsQuery
>;
export type GetKeyPerformanceIndicatorsLazyQueryHookResult = ReturnType<
    typeof useGetKeyPerformanceIndicatorsLazyQuery
>;
export type GetKeyPerformanceIndicatorsQueryResult = Apollo.QueryResult<
    Types.GetKeyPerformanceIndicatorsQuery,
    Types.GetKeyPerformanceIndicatorsQueryVariables
>;
export const GetReferrersCountDocument = gql`
    query GetReferrersCount($organization_id: ID!, $lookBackPeriod: Int!) {
        referrers(
            organization_id: $organization_id
            lookBackPeriod: $lookBackPeriod
        ) {
            host
            count
            percent
        }
    }
`;

/**
 * __useGetReferrersCountQuery__
 *
 * To run a query within a React component, call `useGetReferrersCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReferrersCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReferrersCountQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetReferrersCountQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetReferrersCountQuery,
        Types.GetReferrersCountQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetReferrersCountQuery,
        Types.GetReferrersCountQueryVariables
    >(GetReferrersCountDocument, baseOptions);
}
export function useGetReferrersCountLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetReferrersCountQuery,
        Types.GetReferrersCountQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetReferrersCountQuery,
        Types.GetReferrersCountQueryVariables
    >(GetReferrersCountDocument, baseOptions);
}
export type GetReferrersCountQueryHookResult = ReturnType<
    typeof useGetReferrersCountQuery
>;
export type GetReferrersCountLazyQueryHookResult = ReturnType<
    typeof useGetReferrersCountLazyQuery
>;
export type GetReferrersCountQueryResult = Apollo.QueryResult<
    Types.GetReferrersCountQuery,
    Types.GetReferrersCountQueryVariables
>;
export const GetNewUsersCountDocument = gql`
    query GetNewUsersCount($organization_id: ID!, $lookBackPeriod: Int!) {
        newUsersCount(
            organization_id: $organization_id
            lookBackPeriod: $lookBackPeriod
        ) {
            count
        }
    }
`;

/**
 * __useGetNewUsersCountQuery__
 *
 * To run a query within a React component, call `useGetNewUsersCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNewUsersCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNewUsersCountQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetNewUsersCountQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetNewUsersCountQuery,
        Types.GetNewUsersCountQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetNewUsersCountQuery,
        Types.GetNewUsersCountQueryVariables
    >(GetNewUsersCountDocument, baseOptions);
}
export function useGetNewUsersCountLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetNewUsersCountQuery,
        Types.GetNewUsersCountQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetNewUsersCountQuery,
        Types.GetNewUsersCountQueryVariables
    >(GetNewUsersCountDocument, baseOptions);
}
export type GetNewUsersCountQueryHookResult = ReturnType<
    typeof useGetNewUsersCountQuery
>;
export type GetNewUsersCountLazyQueryHookResult = ReturnType<
    typeof useGetNewUsersCountLazyQuery
>;
export type GetNewUsersCountQueryResult = Apollo.QueryResult<
    Types.GetNewUsersCountQuery,
    Types.GetNewUsersCountQueryVariables
>;
export const GetAverageSessionLengthDocument = gql`
    query GetAverageSessionLength(
        $organization_id: ID!
        $lookBackPeriod: Int!
    ) {
        averageSessionLength(
            organization_id: $organization_id
            lookBackPeriod: $lookBackPeriod
        ) {
            length
        }
    }
`;

/**
 * __useGetAverageSessionLengthQuery__
 *
 * To run a query within a React component, call `useGetAverageSessionLengthQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAverageSessionLengthQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAverageSessionLengthQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetAverageSessionLengthQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetAverageSessionLengthQuery,
        Types.GetAverageSessionLengthQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetAverageSessionLengthQuery,
        Types.GetAverageSessionLengthQueryVariables
    >(GetAverageSessionLengthDocument, baseOptions);
}
export function useGetAverageSessionLengthLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetAverageSessionLengthQuery,
        Types.GetAverageSessionLengthQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetAverageSessionLengthQuery,
        Types.GetAverageSessionLengthQueryVariables
    >(GetAverageSessionLengthDocument, baseOptions);
}
export type GetAverageSessionLengthQueryHookResult = ReturnType<
    typeof useGetAverageSessionLengthQuery
>;
export type GetAverageSessionLengthLazyQueryHookResult = ReturnType<
    typeof useGetAverageSessionLengthLazyQuery
>;
export type GetAverageSessionLengthQueryResult = Apollo.QueryResult<
    Types.GetAverageSessionLengthQuery,
    Types.GetAverageSessionLengthQueryVariables
>;
export const GetTopUsersDocument = gql`
    query GetTopUsers($organization_id: ID!, $lookBackPeriod: Int!) {
        topUsers(
            organization_id: $organization_id
            lookBackPeriod: $lookBackPeriod
        ) {
            identifier
            total_active_time
            active_time_percentage
            id
        }
    }
`;

/**
 * __useGetTopUsersQuery__
 *
 * To run a query within a React component, call `useGetTopUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTopUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTopUsersQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetTopUsersQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetTopUsersQuery,
        Types.GetTopUsersQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetTopUsersQuery,
        Types.GetTopUsersQueryVariables
    >(GetTopUsersDocument, baseOptions);
}
export function useGetTopUsersLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetTopUsersQuery,
        Types.GetTopUsersQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetTopUsersQuery,
        Types.GetTopUsersQueryVariables
    >(GetTopUsersDocument, baseOptions);
}
export type GetTopUsersQueryHookResult = ReturnType<typeof useGetTopUsersQuery>;
export type GetTopUsersLazyQueryHookResult = ReturnType<
    typeof useGetTopUsersLazyQuery
>;
export type GetTopUsersQueryResult = Apollo.QueryResult<
    Types.GetTopUsersQuery,
    Types.GetTopUsersQueryVariables
>;
export const GetDailySessionsCountDocument = gql`
    query GetDailySessionsCount(
        $organization_id: ID!
        $date_range: DateRangeInput!
    ) {
        dailySessionsCount(
            organization_id: $organization_id
            date_range: $date_range
        ) {
            date
            count
        }
    }
`;

/**
 * __useGetDailySessionsCountQuery__
 *
 * To run a query within a React component, call `useGetDailySessionsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDailySessionsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDailySessionsCountQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      date_range: // value for 'date_range'
 *   },
 * });
 */
export function useGetDailySessionsCountQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetDailySessionsCountQuery,
        Types.GetDailySessionsCountQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetDailySessionsCountQuery,
        Types.GetDailySessionsCountQueryVariables
    >(GetDailySessionsCountDocument, baseOptions);
}
export function useGetDailySessionsCountLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetDailySessionsCountQuery,
        Types.GetDailySessionsCountQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetDailySessionsCountQuery,
        Types.GetDailySessionsCountQueryVariables
    >(GetDailySessionsCountDocument, baseOptions);
}
export type GetDailySessionsCountQueryHookResult = ReturnType<
    typeof useGetDailySessionsCountQuery
>;
export type GetDailySessionsCountLazyQueryHookResult = ReturnType<
    typeof useGetDailySessionsCountLazyQuery
>;
export type GetDailySessionsCountQueryResult = Apollo.QueryResult<
    Types.GetDailySessionsCountQuery,
    Types.GetDailySessionsCountQueryVariables
>;
export const GetDailyErrorsCountDocument = gql`
    query GetDailyErrorsCount(
        $organization_id: ID!
        $date_range: DateRangeInput!
    ) {
        dailyErrorsCount(
            organization_id: $organization_id
            date_range: $date_range
        ) {
            date
            count
        }
    }
`;

/**
 * __useGetDailyErrorsCountQuery__
 *
 * To run a query within a React component, call `useGetDailyErrorsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDailyErrorsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDailyErrorsCountQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      date_range: // value for 'date_range'
 *   },
 * });
 */
export function useGetDailyErrorsCountQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetDailyErrorsCountQuery,
        Types.GetDailyErrorsCountQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetDailyErrorsCountQuery,
        Types.GetDailyErrorsCountQueryVariables
    >(GetDailyErrorsCountDocument, baseOptions);
}
export function useGetDailyErrorsCountLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetDailyErrorsCountQuery,
        Types.GetDailyErrorsCountQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetDailyErrorsCountQuery,
        Types.GetDailyErrorsCountQueryVariables
    >(GetDailyErrorsCountDocument, baseOptions);
}
export type GetDailyErrorsCountQueryHookResult = ReturnType<
    typeof useGetDailyErrorsCountQuery
>;
export type GetDailyErrorsCountLazyQueryHookResult = ReturnType<
    typeof useGetDailyErrorsCountLazyQuery
>;
export type GetDailyErrorsCountQueryResult = Apollo.QueryResult<
    Types.GetDailyErrorsCountQuery,
    Types.GetDailyErrorsCountQueryVariables
>;
export const GetDailyErrorFrequencyDocument = gql`
    query GetDailyErrorFrequency(
        $organization_id: ID!
        $error_group_id: ID!
        $date_offset: Int!
    ) {
        dailyErrorFrequency(
            organization_id: $organization_id
            error_group_id: $error_group_id
            date_offset: $date_offset
        )
    }
`;

/**
 * __useGetDailyErrorFrequencyQuery__
 *
 * To run a query within a React component, call `useGetDailyErrorFrequencyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDailyErrorFrequencyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDailyErrorFrequencyQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      error_group_id: // value for 'error_group_id'
 *      date_offset: // value for 'date_offset'
 *   },
 * });
 */
export function useGetDailyErrorFrequencyQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetDailyErrorFrequencyQuery,
        Types.GetDailyErrorFrequencyQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetDailyErrorFrequencyQuery,
        Types.GetDailyErrorFrequencyQueryVariables
    >(GetDailyErrorFrequencyDocument, baseOptions);
}
export function useGetDailyErrorFrequencyLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetDailyErrorFrequencyQuery,
        Types.GetDailyErrorFrequencyQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetDailyErrorFrequencyQuery,
        Types.GetDailyErrorFrequencyQueryVariables
    >(GetDailyErrorFrequencyDocument, baseOptions);
}
export type GetDailyErrorFrequencyQueryHookResult = ReturnType<
    typeof useGetDailyErrorFrequencyQuery
>;
export type GetDailyErrorFrequencyLazyQueryHookResult = ReturnType<
    typeof useGetDailyErrorFrequencyLazyQuery
>;
export type GetDailyErrorFrequencyQueryResult = Apollo.QueryResult<
    Types.GetDailyErrorFrequencyQuery,
    Types.GetDailyErrorFrequencyQueryVariables
>;
export const GetErrorAlertDocument = gql`
    query GetErrorAlert($organization_id: ID!) {
        error_alert(organization_id: $organization_id) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;

/**
 * __useGetErrorAlertQuery__
 *
 * To run a query within a React component, call `useGetErrorAlertQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorAlertQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorAlertQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetErrorAlertQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetErrorAlertQuery,
        Types.GetErrorAlertQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetErrorAlertQuery,
        Types.GetErrorAlertQueryVariables
    >(GetErrorAlertDocument, baseOptions);
}
export function useGetErrorAlertLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetErrorAlertQuery,
        Types.GetErrorAlertQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetErrorAlertQuery,
        Types.GetErrorAlertQueryVariables
    >(GetErrorAlertDocument, baseOptions);
}
export type GetErrorAlertQueryHookResult = ReturnType<
    typeof useGetErrorAlertQuery
>;
export type GetErrorAlertLazyQueryHookResult = ReturnType<
    typeof useGetErrorAlertLazyQuery
>;
export type GetErrorAlertQueryResult = Apollo.QueryResult<
    Types.GetErrorAlertQuery,
    Types.GetErrorAlertQueryVariables
>;
export const GetNewUserAlertDocument = gql`
    query GetNewUserAlert($organization_id: ID!) {
        new_user_alert(organization_id: $organization_id) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;

/**
 * __useGetNewUserAlertQuery__
 *
 * To run a query within a React component, call `useGetNewUserAlertQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNewUserAlertQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNewUserAlertQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetNewUserAlertQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetNewUserAlertQuery,
        Types.GetNewUserAlertQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetNewUserAlertQuery,
        Types.GetNewUserAlertQueryVariables
    >(GetNewUserAlertDocument, baseOptions);
}
export function useGetNewUserAlertLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetNewUserAlertQuery,
        Types.GetNewUserAlertQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetNewUserAlertQuery,
        Types.GetNewUserAlertQueryVariables
    >(GetNewUserAlertDocument, baseOptions);
}
export type GetNewUserAlertQueryHookResult = ReturnType<
    typeof useGetNewUserAlertQuery
>;
export type GetNewUserAlertLazyQueryHookResult = ReturnType<
    typeof useGetNewUserAlertLazyQuery
>;
export type GetNewUserAlertQueryResult = Apollo.QueryResult<
    Types.GetNewUserAlertQuery,
    Types.GetNewUserAlertQueryVariables
>;
export const GetTrackPropertiesAlertDocument = gql`
    query GetTrackPropertiesAlert($organization_id: ID!) {
        track_properties_alert(organization_id: $organization_id) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;

/**
 * __useGetTrackPropertiesAlertQuery__
 *
 * To run a query within a React component, call `useGetTrackPropertiesAlertQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrackPropertiesAlertQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrackPropertiesAlertQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetTrackPropertiesAlertQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetTrackPropertiesAlertQuery,
        Types.GetTrackPropertiesAlertQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetTrackPropertiesAlertQuery,
        Types.GetTrackPropertiesAlertQueryVariables
    >(GetTrackPropertiesAlertDocument, baseOptions);
}
export function useGetTrackPropertiesAlertLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetTrackPropertiesAlertQuery,
        Types.GetTrackPropertiesAlertQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetTrackPropertiesAlertQuery,
        Types.GetTrackPropertiesAlertQueryVariables
    >(GetTrackPropertiesAlertDocument, baseOptions);
}
export type GetTrackPropertiesAlertQueryHookResult = ReturnType<
    typeof useGetTrackPropertiesAlertQuery
>;
export type GetTrackPropertiesAlertLazyQueryHookResult = ReturnType<
    typeof useGetTrackPropertiesAlertLazyQuery
>;
export type GetTrackPropertiesAlertQueryResult = Apollo.QueryResult<
    Types.GetTrackPropertiesAlertQuery,
    Types.GetTrackPropertiesAlertQueryVariables
>;
export const GetUserPropertiesAlertDocument = gql`
    query GetUserPropertiesAlert($organization_id: ID!) {
        user_properties_alert(organization_id: $organization_id) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;

/**
 * __useGetUserPropertiesAlertQuery__
 *
 * To run a query within a React component, call `useGetUserPropertiesAlertQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserPropertiesAlertQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserPropertiesAlertQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetUserPropertiesAlertQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetUserPropertiesAlertQuery,
        Types.GetUserPropertiesAlertQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetUserPropertiesAlertQuery,
        Types.GetUserPropertiesAlertQueryVariables
    >(GetUserPropertiesAlertDocument, baseOptions);
}
export function useGetUserPropertiesAlertLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetUserPropertiesAlertQuery,
        Types.GetUserPropertiesAlertQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetUserPropertiesAlertQuery,
        Types.GetUserPropertiesAlertQueryVariables
    >(GetUserPropertiesAlertDocument, baseOptions);
}
export type GetUserPropertiesAlertQueryHookResult = ReturnType<
    typeof useGetUserPropertiesAlertQuery
>;
export type GetUserPropertiesAlertLazyQueryHookResult = ReturnType<
    typeof useGetUserPropertiesAlertLazyQuery
>;
export type GetUserPropertiesAlertQueryResult = Apollo.QueryResult<
    Types.GetUserPropertiesAlertQuery,
    Types.GetUserPropertiesAlertQueryVariables
>;
export const GetEnvironmentSuggestionDocument = gql`
    query GetEnvironmentSuggestion($query: String!, $organization_id: ID!) {
        environment_suggestion(
            query: $query
            organization_id: $organization_id
        ) {
            name
            value
        }
    }
`;

/**
 * __useGetEnvironmentSuggestionQuery__
 *
 * To run a query within a React component, call `useGetEnvironmentSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEnvironmentSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEnvironmentSuggestionQuery({
 *   variables: {
 *      query: // value for 'query'
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetEnvironmentSuggestionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetEnvironmentSuggestionQuery,
        Types.GetEnvironmentSuggestionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetEnvironmentSuggestionQuery,
        Types.GetEnvironmentSuggestionQueryVariables
    >(GetEnvironmentSuggestionDocument, baseOptions);
}
export function useGetEnvironmentSuggestionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetEnvironmentSuggestionQuery,
        Types.GetEnvironmentSuggestionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetEnvironmentSuggestionQuery,
        Types.GetEnvironmentSuggestionQueryVariables
    >(GetEnvironmentSuggestionDocument, baseOptions);
}
export type GetEnvironmentSuggestionQueryHookResult = ReturnType<
    typeof useGetEnvironmentSuggestionQuery
>;
export type GetEnvironmentSuggestionLazyQueryHookResult = ReturnType<
    typeof useGetEnvironmentSuggestionLazyQuery
>;
export type GetEnvironmentSuggestionQueryResult = Apollo.QueryResult<
    Types.GetEnvironmentSuggestionQuery,
    Types.GetEnvironmentSuggestionQueryVariables
>;
export const GetSlackChannelSuggestionDocument = gql`
    query GetSlackChannelSuggestion($organization_id: ID!) {
        slack_channel_suggestion(organization_id: $organization_id) {
            webhook_channel
            webhook_channel_id
        }
    }
`;

/**
 * __useGetSlackChannelSuggestionQuery__
 *
 * To run a query within a React component, call `useGetSlackChannelSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSlackChannelSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSlackChannelSuggestionQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetSlackChannelSuggestionQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetSlackChannelSuggestionQuery,
        Types.GetSlackChannelSuggestionQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetSlackChannelSuggestionQuery,
        Types.GetSlackChannelSuggestionQueryVariables
    >(GetSlackChannelSuggestionDocument, baseOptions);
}
export function useGetSlackChannelSuggestionLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetSlackChannelSuggestionQuery,
        Types.GetSlackChannelSuggestionQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetSlackChannelSuggestionQuery,
        Types.GetSlackChannelSuggestionQueryVariables
    >(GetSlackChannelSuggestionDocument, baseOptions);
}
export type GetSlackChannelSuggestionQueryHookResult = ReturnType<
    typeof useGetSlackChannelSuggestionQuery
>;
export type GetSlackChannelSuggestionLazyQueryHookResult = ReturnType<
    typeof useGetSlackChannelSuggestionLazyQuery
>;
export type GetSlackChannelSuggestionQueryResult = Apollo.QueryResult<
    Types.GetSlackChannelSuggestionQuery,
    Types.GetSlackChannelSuggestionQueryVariables
>;
export const GetAlertsPagePayloadDocument = gql`
    query GetAlertsPagePayload($organization_id: ID!) {
        is_integrated_with_slack(organization_id: $organization_id)
        slack_channel_suggestion(organization_id: $organization_id) {
            webhook_channel
            webhook_channel_id
        }
        environment_suggestion(query: "q", organization_id: $organization_id) {
            name
            value
        }
        error_alert(organization_id: $organization_id) {
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
            ThresholdWindow
            id
        }
        new_user_alert(organization_id: $organization_id) {
            id
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            ExcludedEnvironments
            CountThreshold
        }
        track_properties_alert(organization_id: $organization_id) {
            id
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            TrackProperties {
                id
                name
                value
            }
            ExcludedEnvironments
            CountThreshold
        }
        user_properties_alert(organization_id: $organization_id) {
            id
            ChannelsToNotify {
                webhook_channel
                webhook_channel_id
            }
            UserProperties {
                id
                name
                value
            }
            ExcludedEnvironments
            CountThreshold
        }
    }
`;

/**
 * __useGetAlertsPagePayloadQuery__
 *
 * To run a query within a React component, call `useGetAlertsPagePayloadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAlertsPagePayloadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAlertsPagePayloadQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetAlertsPagePayloadQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetAlertsPagePayloadQuery,
        Types.GetAlertsPagePayloadQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetAlertsPagePayloadQuery,
        Types.GetAlertsPagePayloadQueryVariables
    >(GetAlertsPagePayloadDocument, baseOptions);
}
export function useGetAlertsPagePayloadLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetAlertsPagePayloadQuery,
        Types.GetAlertsPagePayloadQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetAlertsPagePayloadQuery,
        Types.GetAlertsPagePayloadQueryVariables
    >(GetAlertsPagePayloadDocument, baseOptions);
}
export type GetAlertsPagePayloadQueryHookResult = ReturnType<
    typeof useGetAlertsPagePayloadQuery
>;
export type GetAlertsPagePayloadLazyQueryHookResult = ReturnType<
    typeof useGetAlertsPagePayloadLazyQuery
>;
export type GetAlertsPagePayloadQueryResult = Apollo.QueryResult<
    Types.GetAlertsPagePayloadQuery,
    Types.GetAlertsPagePayloadQueryVariables
>;
export const GetCommentMentionSuggestionsDocument = gql`
    query GetCommentMentionSuggestions($organization_id: ID!) {
        admins(organization_id: $organization_id) {
            id
            name
            email
            photo_url
        }
        slack_members(organization_id: $organization_id) {
            webhook_channel
            webhook_channel_id
        }
    }
`;

/**
 * __useGetCommentMentionSuggestionsQuery__
 *
 * To run a query within a React component, call `useGetCommentMentionSuggestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentMentionSuggestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentMentionSuggestionsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetCommentMentionSuggestionsQuery(
    baseOptions: Apollo.QueryHookOptions<
        Types.GetCommentMentionSuggestionsQuery,
        Types.GetCommentMentionSuggestionsQueryVariables
    >
) {
    return Apollo.useQuery<
        Types.GetCommentMentionSuggestionsQuery,
        Types.GetCommentMentionSuggestionsQueryVariables
    >(GetCommentMentionSuggestionsDocument, baseOptions);
}
export function useGetCommentMentionSuggestionsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<
        Types.GetCommentMentionSuggestionsQuery,
        Types.GetCommentMentionSuggestionsQueryVariables
    >
) {
    return Apollo.useLazyQuery<
        Types.GetCommentMentionSuggestionsQuery,
        Types.GetCommentMentionSuggestionsQueryVariables
    >(GetCommentMentionSuggestionsDocument, baseOptions);
}
export type GetCommentMentionSuggestionsQueryHookResult = ReturnType<
    typeof useGetCommentMentionSuggestionsQuery
>;
export type GetCommentMentionSuggestionsLazyQueryHookResult = ReturnType<
    typeof useGetCommentMentionSuggestionsLazyQuery
>;
export type GetCommentMentionSuggestionsQueryResult = Apollo.QueryResult<
    Types.GetCommentMentionSuggestionsQuery,
    Types.GetCommentMentionSuggestionsQueryVariables
>;
