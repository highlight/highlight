import * as Types from './operations'

import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'
export const SessionPayloadFragmentFragmentDoc = gql`
	fragment SessionPayloadFragment on SessionPayload {
		events
		errors {
			id
			error_group_secure_id
			event
			type
			url
			source
			stack_trace
			structured_stack_trace {
				fileName
				lineNumber
				functionName
				columnNumber
			}
			timestamp
			payload
			request_id
		}
		rage_clicks {
			start_timestamp
			end_timestamp
			total_clicks
		}
		session_comments {
			id
			timestamp
			session_id
			session_secure_id
			created_at
			updated_at
			project_id
			text
			author {
				id
				name
				email
				photo_url
			}
			attachments {
				integration_type
				external_id
				title
			}
			x_coordinate
			y_coordinate
			type
			metadata
		}
		last_user_interaction_time
	}
`
export const MarkSessionAsViewedDocument = gql`
	mutation MarkSessionAsViewed($secure_id: String!, $viewed: Boolean!) {
		markSessionAsViewed(secure_id: $secure_id, viewed: $viewed) {
			secure_id
			viewed
		}
	}
`
export type MarkSessionAsViewedMutationFn = Apollo.MutationFunction<
	Types.MarkSessionAsViewedMutation,
	Types.MarkSessionAsViewedMutationVariables
>

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
 *      secure_id: // value for 'secure_id'
 *      viewed: // value for 'viewed'
 *   },
 * });
 */
export function useMarkSessionAsViewedMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.MarkSessionAsViewedMutation,
		Types.MarkSessionAsViewedMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.MarkSessionAsViewedMutation,
		Types.MarkSessionAsViewedMutationVariables
	>(MarkSessionAsViewedDocument, baseOptions)
}
export type MarkSessionAsViewedMutationHookResult = ReturnType<
	typeof useMarkSessionAsViewedMutation
>
export type MarkSessionAsViewedMutationResult =
	Apollo.MutationResult<Types.MarkSessionAsViewedMutation>
export type MarkSessionAsViewedMutationOptions = Apollo.BaseMutationOptions<
	Types.MarkSessionAsViewedMutation,
	Types.MarkSessionAsViewedMutationVariables
>
export const MarkSessionAsStarredDocument = gql`
	mutation MarkSessionAsStarred($secure_id: String!, $starred: Boolean!) {
		markSessionAsStarred(secure_id: $secure_id, starred: $starred) {
			secure_id
			starred
		}
	}
`
export type MarkSessionAsStarredMutationFn = Apollo.MutationFunction<
	Types.MarkSessionAsStarredMutation,
	Types.MarkSessionAsStarredMutationVariables
>

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
 *      secure_id: // value for 'secure_id'
 *      starred: // value for 'starred'
 *   },
 * });
 */
export function useMarkSessionAsStarredMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.MarkSessionAsStarredMutation,
		Types.MarkSessionAsStarredMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.MarkSessionAsStarredMutation,
		Types.MarkSessionAsStarredMutationVariables
	>(MarkSessionAsStarredDocument, baseOptions)
}
export type MarkSessionAsStarredMutationHookResult = ReturnType<
	typeof useMarkSessionAsStarredMutation
>
export type MarkSessionAsStarredMutationResult =
	Apollo.MutationResult<Types.MarkSessionAsStarredMutation>
export type MarkSessionAsStarredMutationOptions = Apollo.BaseMutationOptions<
	Types.MarkSessionAsStarredMutation,
	Types.MarkSessionAsStarredMutationVariables
>
export const CreateOrUpdateStripeSubscriptionDocument = gql`
	mutation CreateOrUpdateStripeSubscription(
		$workspace_id: ID!
		$plan_type: PlanType!
		$interval: SubscriptionInterval!
	) {
		createOrUpdateStripeSubscription(
			workspace_id: $workspace_id
			plan_type: $plan_type
			interval: $interval
		)
	}
`
export type CreateOrUpdateStripeSubscriptionMutationFn =
	Apollo.MutationFunction<
		Types.CreateOrUpdateStripeSubscriptionMutation,
		Types.CreateOrUpdateStripeSubscriptionMutationVariables
	>

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
 *      workspace_id: // value for 'workspace_id'
 *      plan_type: // value for 'plan_type'
 *      interval: // value for 'interval'
 *   },
 * });
 */
export function useCreateOrUpdateStripeSubscriptionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateOrUpdateStripeSubscriptionMutation,
		Types.CreateOrUpdateStripeSubscriptionMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateOrUpdateStripeSubscriptionMutation,
		Types.CreateOrUpdateStripeSubscriptionMutationVariables
	>(CreateOrUpdateStripeSubscriptionDocument, baseOptions)
}
export type CreateOrUpdateStripeSubscriptionMutationHookResult = ReturnType<
	typeof useCreateOrUpdateStripeSubscriptionMutation
>
export type CreateOrUpdateStripeSubscriptionMutationResult =
	Apollo.MutationResult<Types.CreateOrUpdateStripeSubscriptionMutation>
export type CreateOrUpdateStripeSubscriptionMutationOptions =
	Apollo.BaseMutationOptions<
		Types.CreateOrUpdateStripeSubscriptionMutation,
		Types.CreateOrUpdateStripeSubscriptionMutationVariables
	>
export const UpdateBillingDetailsDocument = gql`
	mutation UpdateBillingDetails($workspace_id: ID!) {
		updateBillingDetails(workspace_id: $workspace_id)
	}
`
export type UpdateBillingDetailsMutationFn = Apollo.MutationFunction<
	Types.UpdateBillingDetailsMutation,
	Types.UpdateBillingDetailsMutationVariables
>

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
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useUpdateBillingDetailsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateBillingDetailsMutation,
		Types.UpdateBillingDetailsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateBillingDetailsMutation,
		Types.UpdateBillingDetailsMutationVariables
	>(UpdateBillingDetailsDocument, baseOptions)
}
export type UpdateBillingDetailsMutationHookResult = ReturnType<
	typeof useUpdateBillingDetailsMutation
>
export type UpdateBillingDetailsMutationResult =
	Apollo.MutationResult<Types.UpdateBillingDetailsMutation>
export type UpdateBillingDetailsMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateBillingDetailsMutation,
	Types.UpdateBillingDetailsMutationVariables
>
export const UpdateErrorGroupStateDocument = gql`
	mutation updateErrorGroupState($secure_id: String!, $state: String!) {
		updateErrorGroupState(secure_id: $secure_id, state: $state) {
			secure_id
			state
		}
	}
`
export type UpdateErrorGroupStateMutationFn = Apollo.MutationFunction<
	Types.UpdateErrorGroupStateMutation,
	Types.UpdateErrorGroupStateMutationVariables
>

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
 *      secure_id: // value for 'secure_id'
 *      state: // value for 'state'
 *   },
 * });
 */
export function useUpdateErrorGroupStateMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateErrorGroupStateMutation,
		Types.UpdateErrorGroupStateMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateErrorGroupStateMutation,
		Types.UpdateErrorGroupStateMutationVariables
	>(UpdateErrorGroupStateDocument, baseOptions)
}
export type UpdateErrorGroupStateMutationHookResult = ReturnType<
	typeof useUpdateErrorGroupStateMutation
>
export type UpdateErrorGroupStateMutationResult =
	Apollo.MutationResult<Types.UpdateErrorGroupStateMutation>
export type UpdateErrorGroupStateMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateErrorGroupStateMutation,
	Types.UpdateErrorGroupStateMutationVariables
>
export const SendEmailSignupDocument = gql`
	mutation SendEmailSignup($email: String!) {
		emailSignup(email: $email)
	}
`
export type SendEmailSignupMutationFn = Apollo.MutationFunction<
	Types.SendEmailSignupMutation,
	Types.SendEmailSignupMutationVariables
>

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
	>,
) {
	return Apollo.useMutation<
		Types.SendEmailSignupMutation,
		Types.SendEmailSignupMutationVariables
	>(SendEmailSignupDocument, baseOptions)
}
export type SendEmailSignupMutationHookResult = ReturnType<
	typeof useSendEmailSignupMutation
>
export type SendEmailSignupMutationResult =
	Apollo.MutationResult<Types.SendEmailSignupMutation>
export type SendEmailSignupMutationOptions = Apollo.BaseMutationOptions<
	Types.SendEmailSignupMutation,
	Types.SendEmailSignupMutationVariables
>
export const AddAdminToWorkspaceDocument = gql`
	mutation AddAdminToWorkspace($workspace_id: ID!, $invite_id: String!) {
		addAdminToWorkspace(workspace_id: $workspace_id, invite_id: $invite_id)
	}
`
export type AddAdminToWorkspaceMutationFn = Apollo.MutationFunction<
	Types.AddAdminToWorkspaceMutation,
	Types.AddAdminToWorkspaceMutationVariables
>

/**
 * __useAddAdminToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddAdminToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddAdminToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addAdminToWorkspaceMutation, { data, loading, error }] = useAddAdminToWorkspaceMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      invite_id: // value for 'invite_id'
 *   },
 * });
 */
export function useAddAdminToWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.AddAdminToWorkspaceMutation,
		Types.AddAdminToWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.AddAdminToWorkspaceMutation,
		Types.AddAdminToWorkspaceMutationVariables
	>(AddAdminToWorkspaceDocument, baseOptions)
}
export type AddAdminToWorkspaceMutationHookResult = ReturnType<
	typeof useAddAdminToWorkspaceMutation
>
export type AddAdminToWorkspaceMutationResult =
	Apollo.MutationResult<Types.AddAdminToWorkspaceMutation>
export type AddAdminToWorkspaceMutationOptions = Apollo.BaseMutationOptions<
	Types.AddAdminToWorkspaceMutation,
	Types.AddAdminToWorkspaceMutationVariables
>
export const JoinWorkspaceDocument = gql`
	mutation JoinWorkspace($workspace_id: ID!) {
		joinWorkspace(workspace_id: $workspace_id)
	}
`
export type JoinWorkspaceMutationFn = Apollo.MutationFunction<
	Types.JoinWorkspaceMutation,
	Types.JoinWorkspaceMutationVariables
>

/**
 * __useJoinWorkspaceMutation__
 *
 * To run a mutation, you first call `useJoinWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinWorkspaceMutation, { data, loading, error }] = useJoinWorkspaceMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useJoinWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.JoinWorkspaceMutation,
		Types.JoinWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.JoinWorkspaceMutation,
		Types.JoinWorkspaceMutationVariables
	>(JoinWorkspaceDocument, baseOptions)
}
export type JoinWorkspaceMutationHookResult = ReturnType<
	typeof useJoinWorkspaceMutation
>
export type JoinWorkspaceMutationResult =
	Apollo.MutationResult<Types.JoinWorkspaceMutation>
export type JoinWorkspaceMutationOptions = Apollo.BaseMutationOptions<
	Types.JoinWorkspaceMutation,
	Types.JoinWorkspaceMutationVariables
>
export const ChangeAdminRoleDocument = gql`
	mutation ChangeAdminRole(
		$workspace_id: ID!
		$admin_id: ID!
		$new_role: String!
	) {
		changeAdminRole(
			workspace_id: $workspace_id
			admin_id: $admin_id
			new_role: $new_role
		)
	}
`
export type ChangeAdminRoleMutationFn = Apollo.MutationFunction<
	Types.ChangeAdminRoleMutation,
	Types.ChangeAdminRoleMutationVariables
>

/**
 * __useChangeAdminRoleMutation__
 *
 * To run a mutation, you first call `useChangeAdminRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeAdminRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeAdminRoleMutation, { data, loading, error }] = useChangeAdminRoleMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      admin_id: // value for 'admin_id'
 *      new_role: // value for 'new_role'
 *   },
 * });
 */
export function useChangeAdminRoleMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.ChangeAdminRoleMutation,
		Types.ChangeAdminRoleMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.ChangeAdminRoleMutation,
		Types.ChangeAdminRoleMutationVariables
	>(ChangeAdminRoleDocument, baseOptions)
}
export type ChangeAdminRoleMutationHookResult = ReturnType<
	typeof useChangeAdminRoleMutation
>
export type ChangeAdminRoleMutationResult =
	Apollo.MutationResult<Types.ChangeAdminRoleMutation>
export type ChangeAdminRoleMutationOptions = Apollo.BaseMutationOptions<
	Types.ChangeAdminRoleMutation,
	Types.ChangeAdminRoleMutationVariables
>
export const DeleteAdminFromProjectDocument = gql`
	mutation DeleteAdminFromProject($project_id: ID!, $admin_id: ID!) {
		deleteAdminFromProject(project_id: $project_id, admin_id: $admin_id)
	}
`
export type DeleteAdminFromProjectMutationFn = Apollo.MutationFunction<
	Types.DeleteAdminFromProjectMutation,
	Types.DeleteAdminFromProjectMutationVariables
>

/**
 * __useDeleteAdminFromProjectMutation__
 *
 * To run a mutation, you first call `useDeleteAdminFromProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAdminFromProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAdminFromProjectMutation, { data, loading, error }] = useDeleteAdminFromProjectMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      admin_id: // value for 'admin_id'
 *   },
 * });
 */
export function useDeleteAdminFromProjectMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteAdminFromProjectMutation,
		Types.DeleteAdminFromProjectMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteAdminFromProjectMutation,
		Types.DeleteAdminFromProjectMutationVariables
	>(DeleteAdminFromProjectDocument, baseOptions)
}
export type DeleteAdminFromProjectMutationHookResult = ReturnType<
	typeof useDeleteAdminFromProjectMutation
>
export type DeleteAdminFromProjectMutationResult =
	Apollo.MutationResult<Types.DeleteAdminFromProjectMutation>
export type DeleteAdminFromProjectMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteAdminFromProjectMutation,
	Types.DeleteAdminFromProjectMutationVariables
>
export const DeleteAdminFromWorkspaceDocument = gql`
	mutation DeleteAdminFromWorkspace($workspace_id: ID!, $admin_id: ID!) {
		deleteAdminFromWorkspace(
			workspace_id: $workspace_id
			admin_id: $admin_id
		)
	}
`
export type DeleteAdminFromWorkspaceMutationFn = Apollo.MutationFunction<
	Types.DeleteAdminFromWorkspaceMutation,
	Types.DeleteAdminFromWorkspaceMutationVariables
>

/**
 * __useDeleteAdminFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useDeleteAdminFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAdminFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAdminFromWorkspaceMutation, { data, loading, error }] = useDeleteAdminFromWorkspaceMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      admin_id: // value for 'admin_id'
 *   },
 * });
 */
export function useDeleteAdminFromWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteAdminFromWorkspaceMutation,
		Types.DeleteAdminFromWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteAdminFromWorkspaceMutation,
		Types.DeleteAdminFromWorkspaceMutationVariables
	>(DeleteAdminFromWorkspaceDocument, baseOptions)
}
export type DeleteAdminFromWorkspaceMutationHookResult = ReturnType<
	typeof useDeleteAdminFromWorkspaceMutation
>
export type DeleteAdminFromWorkspaceMutationResult =
	Apollo.MutationResult<Types.DeleteAdminFromWorkspaceMutation>
export type DeleteAdminFromWorkspaceMutationOptions =
	Apollo.BaseMutationOptions<
		Types.DeleteAdminFromWorkspaceMutation,
		Types.DeleteAdminFromWorkspaceMutationVariables
	>
export const OpenSlackConversationDocument = gql`
	mutation OpenSlackConversation(
		$project_id: ID!
		$code: String!
		$redirect_path: String!
	) {
		openSlackConversation(
			project_id: $project_id
			code: $code
			redirect_path: $redirect_path
		)
	}
`
export type OpenSlackConversationMutationFn = Apollo.MutationFunction<
	Types.OpenSlackConversationMutation,
	Types.OpenSlackConversationMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      code: // value for 'code'
 *      redirect_path: // value for 'redirect_path'
 *   },
 * });
 */
export function useOpenSlackConversationMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.OpenSlackConversationMutation,
		Types.OpenSlackConversationMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.OpenSlackConversationMutation,
		Types.OpenSlackConversationMutationVariables
	>(OpenSlackConversationDocument, baseOptions)
}
export type OpenSlackConversationMutationHookResult = ReturnType<
	typeof useOpenSlackConversationMutation
>
export type OpenSlackConversationMutationResult =
	Apollo.MutationResult<Types.OpenSlackConversationMutation>
export type OpenSlackConversationMutationOptions = Apollo.BaseMutationOptions<
	Types.OpenSlackConversationMutation,
	Types.OpenSlackConversationMutationVariables
>
export const AddIntegrationToProjectDocument = gql`
	mutation AddIntegrationToProject(
		$integration_type: IntegrationType
		$project_id: ID!
		$code: String!
	) {
		addIntegrationToProject(
			integration_type: $integration_type
			project_id: $project_id
			code: $code
		)
	}
`
export type AddIntegrationToProjectMutationFn = Apollo.MutationFunction<
	Types.AddIntegrationToProjectMutation,
	Types.AddIntegrationToProjectMutationVariables
>

/**
 * __useAddIntegrationToProjectMutation__
 *
 * To run a mutation, you first call `useAddIntegrationToProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddIntegrationToProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addIntegrationToProjectMutation, { data, loading, error }] = useAddIntegrationToProjectMutation({
 *   variables: {
 *      integration_type: // value for 'integration_type'
 *      project_id: // value for 'project_id'
 *      code: // value for 'code'
 *   },
 * });
 */
export function useAddIntegrationToProjectMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.AddIntegrationToProjectMutation,
		Types.AddIntegrationToProjectMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.AddIntegrationToProjectMutation,
		Types.AddIntegrationToProjectMutationVariables
	>(AddIntegrationToProjectDocument, baseOptions)
}
export type AddIntegrationToProjectMutationHookResult = ReturnType<
	typeof useAddIntegrationToProjectMutation
>
export type AddIntegrationToProjectMutationResult =
	Apollo.MutationResult<Types.AddIntegrationToProjectMutation>
export type AddIntegrationToProjectMutationOptions = Apollo.BaseMutationOptions<
	Types.AddIntegrationToProjectMutation,
	Types.AddIntegrationToProjectMutationVariables
>
export const RemoveIntegrationFromProjectDocument = gql`
	mutation RemoveIntegrationFromProject(
		$integration_type: IntegrationType
		$project_id: ID!
	) {
		removeIntegrationFromProject(
			integration_type: $integration_type
			project_id: $project_id
		)
	}
`
export type RemoveIntegrationFromProjectMutationFn = Apollo.MutationFunction<
	Types.RemoveIntegrationFromProjectMutation,
	Types.RemoveIntegrationFromProjectMutationVariables
>

/**
 * __useRemoveIntegrationFromProjectMutation__
 *
 * To run a mutation, you first call `useRemoveIntegrationFromProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveIntegrationFromProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeIntegrationFromProjectMutation, { data, loading, error }] = useRemoveIntegrationFromProjectMutation({
 *   variables: {
 *      integration_type: // value for 'integration_type'
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useRemoveIntegrationFromProjectMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.RemoveIntegrationFromProjectMutation,
		Types.RemoveIntegrationFromProjectMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.RemoveIntegrationFromProjectMutation,
		Types.RemoveIntegrationFromProjectMutationVariables
	>(RemoveIntegrationFromProjectDocument, baseOptions)
}
export type RemoveIntegrationFromProjectMutationHookResult = ReturnType<
	typeof useRemoveIntegrationFromProjectMutation
>
export type RemoveIntegrationFromProjectMutationResult =
	Apollo.MutationResult<Types.RemoveIntegrationFromProjectMutation>
export type RemoveIntegrationFromProjectMutationOptions =
	Apollo.BaseMutationOptions<
		Types.RemoveIntegrationFromProjectMutation,
		Types.RemoveIntegrationFromProjectMutationVariables
	>
export const UpdateAllowedEmailOriginsDocument = gql`
	mutation UpdateAllowedEmailOrigins(
		$workspace_id: ID!
		$allowed_auto_join_email_origins: String!
	) {
		updateAllowedEmailOrigins(
			workspace_id: $workspace_id
			allowed_auto_join_email_origins: $allowed_auto_join_email_origins
		)
	}
`
export type UpdateAllowedEmailOriginsMutationFn = Apollo.MutationFunction<
	Types.UpdateAllowedEmailOriginsMutation,
	Types.UpdateAllowedEmailOriginsMutationVariables
>

/**
 * __useUpdateAllowedEmailOriginsMutation__
 *
 * To run a mutation, you first call `useUpdateAllowedEmailOriginsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAllowedEmailOriginsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAllowedEmailOriginsMutation, { data, loading, error }] = useUpdateAllowedEmailOriginsMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      allowed_auto_join_email_origins: // value for 'allowed_auto_join_email_origins'
 *   },
 * });
 */
export function useUpdateAllowedEmailOriginsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateAllowedEmailOriginsMutation,
		Types.UpdateAllowedEmailOriginsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateAllowedEmailOriginsMutation,
		Types.UpdateAllowedEmailOriginsMutationVariables
	>(UpdateAllowedEmailOriginsDocument, baseOptions)
}
export type UpdateAllowedEmailOriginsMutationHookResult = ReturnType<
	typeof useUpdateAllowedEmailOriginsMutation
>
export type UpdateAllowedEmailOriginsMutationResult =
	Apollo.MutationResult<Types.UpdateAllowedEmailOriginsMutation>
export type UpdateAllowedEmailOriginsMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateAllowedEmailOriginsMutation,
		Types.UpdateAllowedEmailOriginsMutationVariables
	>
export const CreateProjectDocument = gql`
	mutation CreateProject($name: String!, $workspace_id: ID!) {
		createProject(name: $name, workspace_id: $workspace_id) {
			id
			name
		}
	}
`
export type CreateProjectMutationFn = Apollo.MutationFunction<
	Types.CreateProjectMutation,
	Types.CreateProjectMutationVariables
>

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      name: // value for 'name'
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useCreateProjectMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateProjectMutation,
		Types.CreateProjectMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateProjectMutation,
		Types.CreateProjectMutationVariables
	>(CreateProjectDocument, baseOptions)
}
export type CreateProjectMutationHookResult = ReturnType<
	typeof useCreateProjectMutation
>
export type CreateProjectMutationResult =
	Apollo.MutationResult<Types.CreateProjectMutation>
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateProjectMutation,
	Types.CreateProjectMutationVariables
>
export const SubmitRegistrationFormDocument = gql`
	mutation SubmitRegistrationForm(
		$workspace_id: ID!
		$team_size: String!
		$role: String!
		$use_case: String!
		$heard_about: String!
		$pun: String
	) {
		submitRegistrationForm(
			workspace_id: $workspace_id
			team_size: $team_size
			role: $role
			use_case: $use_case
			heard_about: $heard_about
			pun: $pun
		)
	}
`
export type SubmitRegistrationFormMutationFn = Apollo.MutationFunction<
	Types.SubmitRegistrationFormMutation,
	Types.SubmitRegistrationFormMutationVariables
>

/**
 * __useSubmitRegistrationFormMutation__
 *
 * To run a mutation, you first call `useSubmitRegistrationFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitRegistrationFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitRegistrationFormMutation, { data, loading, error }] = useSubmitRegistrationFormMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      team_size: // value for 'team_size'
 *      role: // value for 'role'
 *      use_case: // value for 'use_case'
 *      heard_about: // value for 'heard_about'
 *      pun: // value for 'pun'
 *   },
 * });
 */
export function useSubmitRegistrationFormMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.SubmitRegistrationFormMutation,
		Types.SubmitRegistrationFormMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.SubmitRegistrationFormMutation,
		Types.SubmitRegistrationFormMutationVariables
	>(SubmitRegistrationFormDocument, baseOptions)
}
export type SubmitRegistrationFormMutationHookResult = ReturnType<
	typeof useSubmitRegistrationFormMutation
>
export type SubmitRegistrationFormMutationResult =
	Apollo.MutationResult<Types.SubmitRegistrationFormMutation>
export type SubmitRegistrationFormMutationOptions = Apollo.BaseMutationOptions<
	Types.SubmitRegistrationFormMutation,
	Types.SubmitRegistrationFormMutationVariables
>
export const CreateWorkspaceDocument = gql`
	mutation CreateWorkspace($name: String!) {
		createWorkspace(name: $name) {
			id
			name
		}
	}
`
export type CreateWorkspaceMutationFn = Apollo.MutationFunction<
	Types.CreateWorkspaceMutation,
	Types.CreateWorkspaceMutationVariables
>

/**
 * __useCreateWorkspaceMutation__
 *
 * To run a mutation, you first call `useCreateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkspaceMutation, { data, loading, error }] = useCreateWorkspaceMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateWorkspaceMutation,
		Types.CreateWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateWorkspaceMutation,
		Types.CreateWorkspaceMutationVariables
	>(CreateWorkspaceDocument, baseOptions)
}
export type CreateWorkspaceMutationHookResult = ReturnType<
	typeof useCreateWorkspaceMutation
>
export type CreateWorkspaceMutationResult =
	Apollo.MutationResult<Types.CreateWorkspaceMutation>
export type CreateWorkspaceMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateWorkspaceMutation,
	Types.CreateWorkspaceMutationVariables
>
export const EditProjectDocument = gql`
	mutation EditProject(
		$id: ID!
		$name: String
		$billing_email: String
		$excluded_users: StringArray
		$error_json_paths: StringArray
		$rage_click_window_seconds: Int
		$rage_click_radius_pixels: Int
		$rage_click_count: Int
		$backend_domains: StringArray
	) {
		editProject(
			id: $id
			name: $name
			billing_email: $billing_email
			excluded_users: $excluded_users
			error_json_paths: $error_json_paths
			rage_click_window_seconds: $rage_click_window_seconds
			rage_click_radius_pixels: $rage_click_radius_pixels
			rage_click_count: $rage_click_count
			backend_domains: $backend_domains
		) {
			id
			name
			billing_email
			excluded_users
			error_json_paths
			rage_click_window_seconds
			rage_click_radius_pixels
			rage_click_count
			backend_domains
		}
	}
`
export type EditProjectMutationFn = Apollo.MutationFunction<
	Types.EditProjectMutation,
	Types.EditProjectMutationVariables
>

/**
 * __useEditProjectMutation__
 *
 * To run a mutation, you first call `useEditProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editProjectMutation, { data, loading, error }] = useEditProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      billing_email: // value for 'billing_email'
 *      excluded_users: // value for 'excluded_users'
 *      error_json_paths: // value for 'error_json_paths'
 *      rage_click_window_seconds: // value for 'rage_click_window_seconds'
 *      rage_click_radius_pixels: // value for 'rage_click_radius_pixels'
 *      rage_click_count: // value for 'rage_click_count'
 *      backend_domains: // value for 'backend_domains'
 *   },
 * });
 */
export function useEditProjectMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditProjectMutation,
		Types.EditProjectMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditProjectMutation,
		Types.EditProjectMutationVariables
	>(EditProjectDocument, baseOptions)
}
export type EditProjectMutationHookResult = ReturnType<
	typeof useEditProjectMutation
>
export type EditProjectMutationResult =
	Apollo.MutationResult<Types.EditProjectMutation>
export type EditProjectMutationOptions = Apollo.BaseMutationOptions<
	Types.EditProjectMutation,
	Types.EditProjectMutationVariables
>
export const DeleteProjectDocument = gql`
	mutation DeleteProject($id: ID!) {
		deleteProject(id: $id)
	}
`
export type DeleteProjectMutationFn = Apollo.MutationFunction<
	Types.DeleteProjectMutation,
	Types.DeleteProjectMutationVariables
>

/**
 * __useDeleteProjectMutation__
 *
 * To run a mutation, you first call `useDeleteProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectMutation, { data, loading, error }] = useDeleteProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProjectMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteProjectMutation,
		Types.DeleteProjectMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteProjectMutation,
		Types.DeleteProjectMutationVariables
	>(DeleteProjectDocument, baseOptions)
}
export type DeleteProjectMutationHookResult = ReturnType<
	typeof useDeleteProjectMutation
>
export type DeleteProjectMutationResult =
	Apollo.MutationResult<Types.DeleteProjectMutation>
export type DeleteProjectMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteProjectMutation,
	Types.DeleteProjectMutationVariables
>
export const EditWorkspaceDocument = gql`
	mutation EditWorkspace($id: ID!, $name: String) {
		editWorkspace(id: $id, name: $name) {
			id
			name
		}
	}
`
export type EditWorkspaceMutationFn = Apollo.MutationFunction<
	Types.EditWorkspaceMutation,
	Types.EditWorkspaceMutationVariables
>

/**
 * __useEditWorkspaceMutation__
 *
 * To run a mutation, you first call `useEditWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editWorkspaceMutation, { data, loading, error }] = useEditWorkspaceMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useEditWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditWorkspaceMutation,
		Types.EditWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditWorkspaceMutation,
		Types.EditWorkspaceMutationVariables
	>(EditWorkspaceDocument, baseOptions)
}
export type EditWorkspaceMutationHookResult = ReturnType<
	typeof useEditWorkspaceMutation
>
export type EditWorkspaceMutationResult =
	Apollo.MutationResult<Types.EditWorkspaceMutation>
export type EditWorkspaceMutationOptions = Apollo.BaseMutationOptions<
	Types.EditWorkspaceMutation,
	Types.EditWorkspaceMutationVariables
>
export const DeleteSegmentDocument = gql`
	mutation DeleteSegment($segment_id: ID!) {
		deleteSegment(segment_id: $segment_id)
	}
`
export type DeleteSegmentMutationFn = Apollo.MutationFunction<
	Types.DeleteSegmentMutation,
	Types.DeleteSegmentMutationVariables
>

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
	>,
) {
	return Apollo.useMutation<
		Types.DeleteSegmentMutation,
		Types.DeleteSegmentMutationVariables
	>(DeleteSegmentDocument, baseOptions)
}
export type DeleteSegmentMutationHookResult = ReturnType<
	typeof useDeleteSegmentMutation
>
export type DeleteSegmentMutationResult =
	Apollo.MutationResult<Types.DeleteSegmentMutation>
export type DeleteSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteSegmentMutation,
	Types.DeleteSegmentMutationVariables
>
export const EditSegmentDocument = gql`
	mutation EditSegment(
		$project_id: ID!
		$id: ID!
		$params: SearchParamsInput!
	) {
		editSegment(project_id: $project_id, id: $id, params: $params)
	}
`
export type EditSegmentMutationFn = Apollo.MutationFunction<
	Types.EditSegmentMutation,
	Types.EditSegmentMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditSegmentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditSegmentMutation,
		Types.EditSegmentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditSegmentMutation,
		Types.EditSegmentMutationVariables
	>(EditSegmentDocument, baseOptions)
}
export type EditSegmentMutationHookResult = ReturnType<
	typeof useEditSegmentMutation
>
export type EditSegmentMutationResult =
	Apollo.MutationResult<Types.EditSegmentMutation>
export type EditSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.EditSegmentMutation,
	Types.EditSegmentMutationVariables
>
export const CreateSegmentDocument = gql`
	mutation CreateSegment(
		$project_id: ID!
		$name: String!
		$params: SearchParamsInput!
	) {
		createSegment(project_id: $project_id, name: $name, params: $params) {
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
				app_versions
				environments
				device_id
				show_live_sessions
			}
		}
	}
`
export type CreateSegmentMutationFn = Apollo.MutationFunction<
	Types.CreateSegmentMutation,
	Types.CreateSegmentMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateSegmentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateSegmentMutation,
		Types.CreateSegmentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateSegmentMutation,
		Types.CreateSegmentMutationVariables
	>(CreateSegmentDocument, baseOptions)
}
export type CreateSegmentMutationHookResult = ReturnType<
	typeof useCreateSegmentMutation
>
export type CreateSegmentMutationResult =
	Apollo.MutationResult<Types.CreateSegmentMutation>
export type CreateSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateSegmentMutation,
	Types.CreateSegmentMutationVariables
>
export const CreateSessionCommentDocument = gql`
	mutation CreateSessionComment(
		$project_id: ID!
		$session_secure_id: String!
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
		$tags: [SessionCommentTagInput]!
		$integrations: [IntegrationType]!
		$issue_title: String
		$issue_team_id: String
		$issue_description: String
		$additional_context: String
	) {
		createSessionComment(
			project_id: $project_id
			session_secure_id: $session_secure_id
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
			tags: $tags
			integrations: $integrations
			issue_title: $issue_title
			issue_team_id: $issue_team_id
			issue_description: $issue_description
			additional_context: $additional_context
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
			attachments {
				id
				integration_type
				external_id
				title
			}
		}
	}
`
export type CreateSessionCommentMutationFn = Apollo.MutationFunction<
	Types.CreateSessionCommentMutation,
	Types.CreateSessionCommentMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      session_secure_id: // value for 'session_secure_id'
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
 *      tags: // value for 'tags'
 *      integrations: // value for 'integrations'
 *      issue_title: // value for 'issue_title'
 *      issue_team_id: // value for 'issue_team_id'
 *      issue_description: // value for 'issue_description'
 *      additional_context: // value for 'additional_context'
 *   },
 * });
 */
export function useCreateSessionCommentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateSessionCommentMutation,
		Types.CreateSessionCommentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateSessionCommentMutation,
		Types.CreateSessionCommentMutationVariables
	>(CreateSessionCommentDocument, baseOptions)
}
export type CreateSessionCommentMutationHookResult = ReturnType<
	typeof useCreateSessionCommentMutation
>
export type CreateSessionCommentMutationResult =
	Apollo.MutationResult<Types.CreateSessionCommentMutation>
export type CreateSessionCommentMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateSessionCommentMutation,
	Types.CreateSessionCommentMutationVariables
>
export const CreateIssueForSessionCommentDocument = gql`
	mutation CreateIssueForSessionComment(
		$project_id: ID!
		$session_comment_id: Int!
		$text_for_attachment: String!
		$session_url: String!
		$time: Float!
		$author_name: String!
		$integrations: [IntegrationType]!
		$issue_title: String
		$issue_team_id: String
		$issue_description: String
	) {
		createIssueForSessionComment(
			project_id: $project_id
			session_url: $session_url
			session_comment_id: $session_comment_id
			author_name: $author_name
			text_for_attachment: $text_for_attachment
			time: $time
			issue_title: $issue_title
			issue_description: $issue_description
			issue_team_id: $issue_team_id
			integrations: $integrations
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
			attachments {
				id
				integration_type
				external_id
				title
			}
		}
	}
`
export type CreateIssueForSessionCommentMutationFn = Apollo.MutationFunction<
	Types.CreateIssueForSessionCommentMutation,
	Types.CreateIssueForSessionCommentMutationVariables
>

/**
 * __useCreateIssueForSessionCommentMutation__
 *
 * To run a mutation, you first call `useCreateIssueForSessionCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateIssueForSessionCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createIssueForSessionCommentMutation, { data, loading, error }] = useCreateIssueForSessionCommentMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      session_comment_id: // value for 'session_comment_id'
 *      text_for_attachment: // value for 'text_for_attachment'
 *      session_url: // value for 'session_url'
 *      time: // value for 'time'
 *      author_name: // value for 'author_name'
 *      integrations: // value for 'integrations'
 *      issue_title: // value for 'issue_title'
 *      issue_team_id: // value for 'issue_team_id'
 *      issue_description: // value for 'issue_description'
 *   },
 * });
 */
export function useCreateIssueForSessionCommentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateIssueForSessionCommentMutation,
		Types.CreateIssueForSessionCommentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateIssueForSessionCommentMutation,
		Types.CreateIssueForSessionCommentMutationVariables
	>(CreateIssueForSessionCommentDocument, baseOptions)
}
export type CreateIssueForSessionCommentMutationHookResult = ReturnType<
	typeof useCreateIssueForSessionCommentMutation
>
export type CreateIssueForSessionCommentMutationResult =
	Apollo.MutationResult<Types.CreateIssueForSessionCommentMutation>
export type CreateIssueForSessionCommentMutationOptions =
	Apollo.BaseMutationOptions<
		Types.CreateIssueForSessionCommentMutation,
		Types.CreateIssueForSessionCommentMutationVariables
	>
export const DeleteSessionCommentDocument = gql`
	mutation DeleteSessionComment($id: ID!) {
		deleteSessionComment(id: $id)
	}
`
export type DeleteSessionCommentMutationFn = Apollo.MutationFunction<
	Types.DeleteSessionCommentMutation,
	Types.DeleteSessionCommentMutationVariables
>

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
	>,
) {
	return Apollo.useMutation<
		Types.DeleteSessionCommentMutation,
		Types.DeleteSessionCommentMutationVariables
	>(DeleteSessionCommentDocument, baseOptions)
}
export type DeleteSessionCommentMutationHookResult = ReturnType<
	typeof useDeleteSessionCommentMutation
>
export type DeleteSessionCommentMutationResult =
	Apollo.MutationResult<Types.DeleteSessionCommentMutation>
export type DeleteSessionCommentMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteSessionCommentMutation,
	Types.DeleteSessionCommentMutationVariables
>
export const ReplyToSessionCommentDocument = gql`
	mutation ReplyToSessionComment(
		$comment_id: ID!
		$text: String!
		$text_for_email: String!
		$sessionURL: String!
		$tagged_admins: [SanitizedAdminInput]!
		$tagged_slack_users: [SanitizedSlackChannelInput]!
	) {
		replyToSessionComment(
			comment_id: $comment_id
			text: $text
			text_for_email: $text_for_email
			sessionURL: $sessionURL
			tagged_admins: $tagged_admins
			tagged_slack_users: $tagged_slack_users
		) {
			id
			created_at
			updated_at
			author {
				id
				name
				email
				photo_url
			}
			text
		}
	}
`
export type ReplyToSessionCommentMutationFn = Apollo.MutationFunction<
	Types.ReplyToSessionCommentMutation,
	Types.ReplyToSessionCommentMutationVariables
>

/**
 * __useReplyToSessionCommentMutation__
 *
 * To run a mutation, you first call `useReplyToSessionCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReplyToSessionCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [replyToSessionCommentMutation, { data, loading, error }] = useReplyToSessionCommentMutation({
 *   variables: {
 *      comment_id: // value for 'comment_id'
 *      text: // value for 'text'
 *      text_for_email: // value for 'text_for_email'
 *      sessionURL: // value for 'sessionURL'
 *      tagged_admins: // value for 'tagged_admins'
 *      tagged_slack_users: // value for 'tagged_slack_users'
 *   },
 * });
 */
export function useReplyToSessionCommentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.ReplyToSessionCommentMutation,
		Types.ReplyToSessionCommentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.ReplyToSessionCommentMutation,
		Types.ReplyToSessionCommentMutationVariables
	>(ReplyToSessionCommentDocument, baseOptions)
}
export type ReplyToSessionCommentMutationHookResult = ReturnType<
	typeof useReplyToSessionCommentMutation
>
export type ReplyToSessionCommentMutationResult =
	Apollo.MutationResult<Types.ReplyToSessionCommentMutation>
export type ReplyToSessionCommentMutationOptions = Apollo.BaseMutationOptions<
	Types.ReplyToSessionCommentMutation,
	Types.ReplyToSessionCommentMutationVariables
>
export const CreateErrorCommentDocument = gql`
	mutation CreateErrorComment(
		$project_id: ID!
		$error_group_secure_id: String!
		$text: String!
		$text_for_email: String!
		$tagged_admins: [SanitizedAdminInput]!
		$tagged_slack_users: [SanitizedSlackChannelInput]!
		$error_url: String!
		$author_name: String!
		$integrations: [IntegrationType]!
		$issue_title: String
		$issue_team_id: String
		$issue_description: String
	) {
		createErrorComment(
			project_id: $project_id
			error_group_secure_id: $error_group_secure_id
			text: $text
			text_for_email: $text_for_email
			tagged_admins: $tagged_admins
			tagged_slack_users: $tagged_slack_users
			error_url: $error_url
			author_name: $author_name
			integrations: $integrations
			issue_title: $issue_title
			issue_team_id: $issue_team_id
			issue_description: $issue_description
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
`
export type CreateErrorCommentMutationFn = Apollo.MutationFunction<
	Types.CreateErrorCommentMutation,
	Types.CreateErrorCommentMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *      text: // value for 'text'
 *      text_for_email: // value for 'text_for_email'
 *      tagged_admins: // value for 'tagged_admins'
 *      tagged_slack_users: // value for 'tagged_slack_users'
 *      error_url: // value for 'error_url'
 *      author_name: // value for 'author_name'
 *      integrations: // value for 'integrations'
 *      issue_title: // value for 'issue_title'
 *      issue_team_id: // value for 'issue_team_id'
 *      issue_description: // value for 'issue_description'
 *   },
 * });
 */
export function useCreateErrorCommentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateErrorCommentMutation,
		Types.CreateErrorCommentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateErrorCommentMutation,
		Types.CreateErrorCommentMutationVariables
	>(CreateErrorCommentDocument, baseOptions)
}
export type CreateErrorCommentMutationHookResult = ReturnType<
	typeof useCreateErrorCommentMutation
>
export type CreateErrorCommentMutationResult =
	Apollo.MutationResult<Types.CreateErrorCommentMutation>
export type CreateErrorCommentMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateErrorCommentMutation,
	Types.CreateErrorCommentMutationVariables
>
export const CreateIssueForErrorCommentDocument = gql`
	mutation CreateIssueForErrorComment(
		$project_id: ID!
		$error_comment_id: Int!
		$text_for_attachment: String!
		$error_url: String!
		$author_name: String!
		$integrations: [IntegrationType]!
		$issue_title: String
		$issue_team_id: String
		$issue_description: String
	) {
		createIssueForErrorComment(
			project_id: $project_id
			error_url: $error_url
			error_comment_id: $error_comment_id
			author_name: $author_name
			text_for_attachment: $text_for_attachment
			issue_title: $issue_title
			issue_team_id: $issue_team_id
			issue_description: $issue_description
			integrations: $integrations
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
			attachments {
				id
				integration_type
				external_id
				title
			}
		}
	}
`
export type CreateIssueForErrorCommentMutationFn = Apollo.MutationFunction<
	Types.CreateIssueForErrorCommentMutation,
	Types.CreateIssueForErrorCommentMutationVariables
>

/**
 * __useCreateIssueForErrorCommentMutation__
 *
 * To run a mutation, you first call `useCreateIssueForErrorCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateIssueForErrorCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createIssueForErrorCommentMutation, { data, loading, error }] = useCreateIssueForErrorCommentMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      error_comment_id: // value for 'error_comment_id'
 *      text_for_attachment: // value for 'text_for_attachment'
 *      error_url: // value for 'error_url'
 *      author_name: // value for 'author_name'
 *      integrations: // value for 'integrations'
 *      issue_title: // value for 'issue_title'
 *      issue_team_id: // value for 'issue_team_id'
 *      issue_description: // value for 'issue_description'
 *   },
 * });
 */
export function useCreateIssueForErrorCommentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateIssueForErrorCommentMutation,
		Types.CreateIssueForErrorCommentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateIssueForErrorCommentMutation,
		Types.CreateIssueForErrorCommentMutationVariables
	>(CreateIssueForErrorCommentDocument, baseOptions)
}
export type CreateIssueForErrorCommentMutationHookResult = ReturnType<
	typeof useCreateIssueForErrorCommentMutation
>
export type CreateIssueForErrorCommentMutationResult =
	Apollo.MutationResult<Types.CreateIssueForErrorCommentMutation>
export type CreateIssueForErrorCommentMutationOptions =
	Apollo.BaseMutationOptions<
		Types.CreateIssueForErrorCommentMutation,
		Types.CreateIssueForErrorCommentMutationVariables
	>
export const DeleteErrorCommentDocument = gql`
	mutation DeleteErrorComment($id: ID!) {
		deleteErrorComment(id: $id)
	}
`
export type DeleteErrorCommentMutationFn = Apollo.MutationFunction<
	Types.DeleteErrorCommentMutation,
	Types.DeleteErrorCommentMutationVariables
>

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
	>,
) {
	return Apollo.useMutation<
		Types.DeleteErrorCommentMutation,
		Types.DeleteErrorCommentMutationVariables
	>(DeleteErrorCommentDocument, baseOptions)
}
export type DeleteErrorCommentMutationHookResult = ReturnType<
	typeof useDeleteErrorCommentMutation
>
export type DeleteErrorCommentMutationResult =
	Apollo.MutationResult<Types.DeleteErrorCommentMutation>
export type DeleteErrorCommentMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteErrorCommentMutation,
	Types.DeleteErrorCommentMutationVariables
>
export const ReplyToErrorCommentDocument = gql`
	mutation ReplyToErrorComment(
		$comment_id: ID!
		$text: String!
		$text_for_email: String!
		$errorURL: String!
		$tagged_admins: [SanitizedAdminInput]!
		$tagged_slack_users: [SanitizedSlackChannelInput]!
	) {
		replyToErrorComment(
			comment_id: $comment_id
			text: $text
			text_for_email: $text_for_email
			errorURL: $errorURL
			tagged_admins: $tagged_admins
			tagged_slack_users: $tagged_slack_users
		) {
			id
			created_at
			updated_at
			author {
				id
				name
				email
				photo_url
			}
			text
		}
	}
`
export type ReplyToErrorCommentMutationFn = Apollo.MutationFunction<
	Types.ReplyToErrorCommentMutation,
	Types.ReplyToErrorCommentMutationVariables
>

/**
 * __useReplyToErrorCommentMutation__
 *
 * To run a mutation, you first call `useReplyToErrorCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReplyToErrorCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [replyToErrorCommentMutation, { data, loading, error }] = useReplyToErrorCommentMutation({
 *   variables: {
 *      comment_id: // value for 'comment_id'
 *      text: // value for 'text'
 *      text_for_email: // value for 'text_for_email'
 *      errorURL: // value for 'errorURL'
 *      tagged_admins: // value for 'tagged_admins'
 *      tagged_slack_users: // value for 'tagged_slack_users'
 *   },
 * });
 */
export function useReplyToErrorCommentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.ReplyToErrorCommentMutation,
		Types.ReplyToErrorCommentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.ReplyToErrorCommentMutation,
		Types.ReplyToErrorCommentMutationVariables
	>(ReplyToErrorCommentDocument, baseOptions)
}
export type ReplyToErrorCommentMutationHookResult = ReturnType<
	typeof useReplyToErrorCommentMutation
>
export type ReplyToErrorCommentMutationResult =
	Apollo.MutationResult<Types.ReplyToErrorCommentMutation>
export type ReplyToErrorCommentMutationOptions = Apollo.BaseMutationOptions<
	Types.ReplyToErrorCommentMutation,
	Types.ReplyToErrorCommentMutationVariables
>
export const DeleteErrorSegmentDocument = gql`
	mutation DeleteErrorSegment($segment_id: ID!) {
		deleteErrorSegment(segment_id: $segment_id)
	}
`
export type DeleteErrorSegmentMutationFn = Apollo.MutationFunction<
	Types.DeleteErrorSegmentMutation,
	Types.DeleteErrorSegmentMutationVariables
>

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
	>,
) {
	return Apollo.useMutation<
		Types.DeleteErrorSegmentMutation,
		Types.DeleteErrorSegmentMutationVariables
	>(DeleteErrorSegmentDocument, baseOptions)
}
export type DeleteErrorSegmentMutationHookResult = ReturnType<
	typeof useDeleteErrorSegmentMutation
>
export type DeleteErrorSegmentMutationResult =
	Apollo.MutationResult<Types.DeleteErrorSegmentMutation>
export type DeleteErrorSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteErrorSegmentMutation,
	Types.DeleteErrorSegmentMutationVariables
>
export const EditErrorSegmentDocument = gql`
	mutation EditErrorSegment(
		$project_id: ID!
		$id: ID!
		$params: ErrorSearchParamsInput!
	) {
		editErrorSegment(project_id: $project_id, id: $id, params: $params)
	}
`
export type EditErrorSegmentMutationFn = Apollo.MutationFunction<
	Types.EditErrorSegmentMutation,
	Types.EditErrorSegmentMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      id: // value for 'id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useEditErrorSegmentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditErrorSegmentMutation,
		Types.EditErrorSegmentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditErrorSegmentMutation,
		Types.EditErrorSegmentMutationVariables
	>(EditErrorSegmentDocument, baseOptions)
}
export type EditErrorSegmentMutationHookResult = ReturnType<
	typeof useEditErrorSegmentMutation
>
export type EditErrorSegmentMutationResult =
	Apollo.MutationResult<Types.EditErrorSegmentMutation>
export type EditErrorSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.EditErrorSegmentMutation,
	Types.EditErrorSegmentMutationVariables
>
export const CreateErrorSegmentDocument = gql`
	mutation CreateErrorSegment(
		$project_id: ID!
		$name: String!
		$params: ErrorSearchParamsInput!
	) {
		createErrorSegment(
			project_id: $project_id
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
`
export type CreateErrorSegmentMutationFn = Apollo.MutationFunction<
	Types.CreateErrorSegmentMutation,
	Types.CreateErrorSegmentMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useCreateErrorSegmentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateErrorSegmentMutation,
		Types.CreateErrorSegmentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateErrorSegmentMutation,
		Types.CreateErrorSegmentMutationVariables
	>(CreateErrorSegmentDocument, baseOptions)
}
export type CreateErrorSegmentMutationHookResult = ReturnType<
	typeof useCreateErrorSegmentMutation
>
export type CreateErrorSegmentMutationResult =
	Apollo.MutationResult<Types.CreateErrorSegmentMutation>
export type CreateErrorSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateErrorSegmentMutation,
	Types.CreateErrorSegmentMutationVariables
>
export const CreateErrorAlertDocument = gql`
	mutation CreateErrorAlert(
		$project_id: ID!
		$name: String!
		$count_threshold: Int!
		$threshold_window: Int!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
		$environments: [String]!
		$regex_groups: [String]!
		$frequency: Int!
	) {
		createErrorAlert(
			project_id: $project_id
			count_threshold: $count_threshold
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
			regex_groups: $regex_groups
			frequency: $frequency
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			RegexGroups
			Frequency
			disabled
		}
	}
`
export type CreateErrorAlertMutationFn = Apollo.MutationFunction<
	Types.CreateErrorAlertMutation,
	Types.CreateErrorAlertMutationVariables
>

/**
 * __useCreateErrorAlertMutation__
 *
 * To run a mutation, you first call `useCreateErrorAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateErrorAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createErrorAlertMutation, { data, loading, error }] = useCreateErrorAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      count_threshold: // value for 'count_threshold'
 *      threshold_window: // value for 'threshold_window'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      regex_groups: // value for 'regex_groups'
 *      frequency: // value for 'frequency'
 *   },
 * });
 */
export function useCreateErrorAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateErrorAlertMutation,
		Types.CreateErrorAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateErrorAlertMutation,
		Types.CreateErrorAlertMutationVariables
	>(CreateErrorAlertDocument, baseOptions)
}
export type CreateErrorAlertMutationHookResult = ReturnType<
	typeof useCreateErrorAlertMutation
>
export type CreateErrorAlertMutationResult =
	Apollo.MutationResult<Types.CreateErrorAlertMutation>
export type CreateErrorAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateErrorAlertMutation,
	Types.CreateErrorAlertMutationVariables
>
export const CreateMetricMonitorDocument = gql`
	mutation CreateMetricMonitor(
		$project_id: ID!
		$name: String!
		$aggregator: MetricAggregator!
		$threshold: Float!
		$filters: [MetricTagFilterInput!]
		$units: String
		$periodMinutes: Int
		$metric_to_monitor: String!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
	) {
		createMetricMonitor(
			project_id: $project_id
			threshold: $threshold
			filters: $filters
			units: $units
			name: $name
			aggregator: $aggregator
			periodMinutes: $periodMinutes
			metric_to_monitor: $metric_to_monitor
			slack_channels: $slack_channels
			emails: $emails
		) {
			id
			updated_at
			name
			channels_to_notify {
				webhook_channel
				webhook_channel_id
			}
			emails_to_notify
			aggregator
			period_minutes
			metric_to_monitor
			last_admin_to_edit_id
			threshold
			units
		}
	}
`
export type CreateMetricMonitorMutationFn = Apollo.MutationFunction<
	Types.CreateMetricMonitorMutation,
	Types.CreateMetricMonitorMutationVariables
>

/**
 * __useCreateMetricMonitorMutation__
 *
 * To run a mutation, you first call `useCreateMetricMonitorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMetricMonitorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMetricMonitorMutation, { data, loading, error }] = useCreateMetricMonitorMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      aggregator: // value for 'aggregator'
 *      threshold: // value for 'threshold'
 *      filters: // value for 'filters'
 *      units: // value for 'units'
 *      periodMinutes: // value for 'periodMinutes'
 *      metric_to_monitor: // value for 'metric_to_monitor'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *   },
 * });
 */
export function useCreateMetricMonitorMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateMetricMonitorMutation,
		Types.CreateMetricMonitorMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateMetricMonitorMutation,
		Types.CreateMetricMonitorMutationVariables
	>(CreateMetricMonitorDocument, baseOptions)
}
export type CreateMetricMonitorMutationHookResult = ReturnType<
	typeof useCreateMetricMonitorMutation
>
export type CreateMetricMonitorMutationResult =
	Apollo.MutationResult<Types.CreateMetricMonitorMutation>
export type CreateMetricMonitorMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateMetricMonitorMutation,
	Types.CreateMetricMonitorMutationVariables
>
export const UpdateMetricMonitorDocument = gql`
	mutation UpdateMetricMonitor(
		$metric_monitor_id: ID!
		$project_id: ID!
		$name: String
		$aggregator: MetricAggregator
		$threshold: Float
		$filters: [MetricTagFilterInput!]
		$units: String
		$periodMinutes: Int
		$metric_to_monitor: String
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$disabled: Boolean
	) {
		updateMetricMonitor(
			metric_monitor_id: $metric_monitor_id
			project_id: $project_id
			threshold: $threshold
			filters: $filters
			units: $units
			name: $name
			aggregator: $aggregator
			periodMinutes: $periodMinutes
			metric_to_monitor: $metric_to_monitor
			slack_channels: $slack_channels
			emails: $emails
			disabled: $disabled
		) {
			id
			updated_at
			name
			channels_to_notify {
				webhook_channel
				webhook_channel_id
			}
			emails_to_notify
			aggregator
			period_minutes
			metric_to_monitor
			last_admin_to_edit_id
			threshold
			units
		}
	}
`
export type UpdateMetricMonitorMutationFn = Apollo.MutationFunction<
	Types.UpdateMetricMonitorMutation,
	Types.UpdateMetricMonitorMutationVariables
>

/**
 * __useUpdateMetricMonitorMutation__
 *
 * To run a mutation, you first call `useUpdateMetricMonitorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMetricMonitorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMetricMonitorMutation, { data, loading, error }] = useUpdateMetricMonitorMutation({
 *   variables: {
 *      metric_monitor_id: // value for 'metric_monitor_id'
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      aggregator: // value for 'aggregator'
 *      threshold: // value for 'threshold'
 *      filters: // value for 'filters'
 *      units: // value for 'units'
 *      periodMinutes: // value for 'periodMinutes'
 *      metric_to_monitor: // value for 'metric_to_monitor'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateMetricMonitorMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateMetricMonitorMutation,
		Types.UpdateMetricMonitorMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateMetricMonitorMutation,
		Types.UpdateMetricMonitorMutationVariables
	>(UpdateMetricMonitorDocument, baseOptions)
}
export type UpdateMetricMonitorMutationHookResult = ReturnType<
	typeof useUpdateMetricMonitorMutation
>
export type UpdateMetricMonitorMutationResult =
	Apollo.MutationResult<Types.UpdateMetricMonitorMutation>
export type UpdateMetricMonitorMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateMetricMonitorMutation,
	Types.UpdateMetricMonitorMutationVariables
>
export const DeleteMetricMonitorDocument = gql`
	mutation DeleteMetricMonitor($metric_monitor_id: ID!, $project_id: ID!) {
		deleteMetricMonitor(
			metric_monitor_id: $metric_monitor_id
			project_id: $project_id
		) {
			id
			updated_at
			name
			channels_to_notify {
				webhook_channel
				webhook_channel_id
			}
			emails_to_notify
			aggregator
			metric_to_monitor
			last_admin_to_edit_id
			threshold
		}
	}
`
export type DeleteMetricMonitorMutationFn = Apollo.MutationFunction<
	Types.DeleteMetricMonitorMutation,
	Types.DeleteMetricMonitorMutationVariables
>

/**
 * __useDeleteMetricMonitorMutation__
 *
 * To run a mutation, you first call `useDeleteMetricMonitorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMetricMonitorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMetricMonitorMutation, { data, loading, error }] = useDeleteMetricMonitorMutation({
 *   variables: {
 *      metric_monitor_id: // value for 'metric_monitor_id'
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useDeleteMetricMonitorMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteMetricMonitorMutation,
		Types.DeleteMetricMonitorMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteMetricMonitorMutation,
		Types.DeleteMetricMonitorMutationVariables
	>(DeleteMetricMonitorDocument, baseOptions)
}
export type DeleteMetricMonitorMutationHookResult = ReturnType<
	typeof useDeleteMetricMonitorMutation
>
export type DeleteMetricMonitorMutationResult =
	Apollo.MutationResult<Types.DeleteMetricMonitorMutation>
export type DeleteMetricMonitorMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteMetricMonitorMutation,
	Types.DeleteMetricMonitorMutationVariables
>
export const UpdateAdminAboutYouDetailsDocument = gql`
	mutation UpdateAdminAboutYouDetails($adminDetails: AdminAboutYouDetails!) {
		updateAdminAboutYouDetails(adminDetails: $adminDetails)
	}
`
export type UpdateAdminAboutYouDetailsMutationFn = Apollo.MutationFunction<
	Types.UpdateAdminAboutYouDetailsMutation,
	Types.UpdateAdminAboutYouDetailsMutationVariables
>

/**
 * __useUpdateAdminAboutYouDetailsMutation__
 *
 * To run a mutation, you first call `useUpdateAdminAboutYouDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAdminAboutYouDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAdminAboutYouDetailsMutation, { data, loading, error }] = useUpdateAdminAboutYouDetailsMutation({
 *   variables: {
 *      adminDetails: // value for 'adminDetails'
 *   },
 * });
 */
export function useUpdateAdminAboutYouDetailsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateAdminAboutYouDetailsMutation,
		Types.UpdateAdminAboutYouDetailsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateAdminAboutYouDetailsMutation,
		Types.UpdateAdminAboutYouDetailsMutationVariables
	>(UpdateAdminAboutYouDetailsDocument, baseOptions)
}
export type UpdateAdminAboutYouDetailsMutationHookResult = ReturnType<
	typeof useUpdateAdminAboutYouDetailsMutation
>
export type UpdateAdminAboutYouDetailsMutationResult =
	Apollo.MutationResult<Types.UpdateAdminAboutYouDetailsMutation>
export type UpdateAdminAboutYouDetailsMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateAdminAboutYouDetailsMutation,
		Types.UpdateAdminAboutYouDetailsMutationVariables
	>
export const CreateRageClickAlertDocument = gql`
	mutation CreateRageClickAlert(
		$project_id: ID!
		$name: String!
		$count_threshold: Int!
		$threshold_window: Int!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
		$environments: [String]!
	) {
		createRageClickAlert(
			project_id: $project_id
			count_threshold: $count_threshold
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			disabled
		}
	}
`
export type CreateRageClickAlertMutationFn = Apollo.MutationFunction<
	Types.CreateRageClickAlertMutation,
	Types.CreateRageClickAlertMutationVariables
>

/**
 * __useCreateRageClickAlertMutation__
 *
 * To run a mutation, you first call `useCreateRageClickAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRageClickAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRageClickAlertMutation, { data, loading, error }] = useCreateRageClickAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      count_threshold: // value for 'count_threshold'
 *      threshold_window: // value for 'threshold_window'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *   },
 * });
 */
export function useCreateRageClickAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateRageClickAlertMutation,
		Types.CreateRageClickAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateRageClickAlertMutation,
		Types.CreateRageClickAlertMutationVariables
	>(CreateRageClickAlertDocument, baseOptions)
}
export type CreateRageClickAlertMutationHookResult = ReturnType<
	typeof useCreateRageClickAlertMutation
>
export type CreateRageClickAlertMutationResult =
	Apollo.MutationResult<Types.CreateRageClickAlertMutation>
export type CreateRageClickAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateRageClickAlertMutation,
	Types.CreateRageClickAlertMutationVariables
>
export const UpdateErrorAlertDocument = gql`
	mutation UpdateErrorAlert(
		$project_id: ID!
		$name: String
		$error_alert_id: ID!
		$count_threshold: Int
		$threshold_window: Int
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$environments: [String]
		$regex_groups: [String]
		$frequency: Int
		$disabled: Boolean
	) {
		updateErrorAlert(
			project_id: $project_id
			error_alert_id: $error_alert_id
			name: $name
			count_threshold: $count_threshold
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
			regex_groups: $regex_groups
			frequency: $frequency
			disabled: $disabled
		) {
			Name
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			RegexGroups
			Frequency
			disabled
		}
	}
`
export type UpdateErrorAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateErrorAlertMutation,
	Types.UpdateErrorAlertMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      error_alert_id: // value for 'error_alert_id'
 *      count_threshold: // value for 'count_threshold'
 *      threshold_window: // value for 'threshold_window'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      regex_groups: // value for 'regex_groups'
 *      frequency: // value for 'frequency'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateErrorAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateErrorAlertMutation,
		Types.UpdateErrorAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateErrorAlertMutation,
		Types.UpdateErrorAlertMutationVariables
	>(UpdateErrorAlertDocument, baseOptions)
}
export type UpdateErrorAlertMutationHookResult = ReturnType<
	typeof useUpdateErrorAlertMutation
>
export type UpdateErrorAlertMutationResult =
	Apollo.MutationResult<Types.UpdateErrorAlertMutation>
export type UpdateErrorAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateErrorAlertMutation,
	Types.UpdateErrorAlertMutationVariables
>
export const DeleteErrorAlertDocument = gql`
	mutation DeleteErrorAlert($project_id: ID!, $error_alert_id: ID!) {
		deleteErrorAlert(
			project_id: $project_id
			error_alert_id: $error_alert_id
		) {
			id
		}
	}
`
export type DeleteErrorAlertMutationFn = Apollo.MutationFunction<
	Types.DeleteErrorAlertMutation,
	Types.DeleteErrorAlertMutationVariables
>

/**
 * __useDeleteErrorAlertMutation__
 *
 * To run a mutation, you first call `useDeleteErrorAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteErrorAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteErrorAlertMutation, { data, loading, error }] = useDeleteErrorAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      error_alert_id: // value for 'error_alert_id'
 *   },
 * });
 */
export function useDeleteErrorAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteErrorAlertMutation,
		Types.DeleteErrorAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteErrorAlertMutation,
		Types.DeleteErrorAlertMutationVariables
	>(DeleteErrorAlertDocument, baseOptions)
}
export type DeleteErrorAlertMutationHookResult = ReturnType<
	typeof useDeleteErrorAlertMutation
>
export type DeleteErrorAlertMutationResult =
	Apollo.MutationResult<Types.DeleteErrorAlertMutation>
export type DeleteErrorAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteErrorAlertMutation,
	Types.DeleteErrorAlertMutationVariables
>
export const DeleteSessionAlertDocument = gql`
	mutation DeleteSessionAlert($project_id: ID!, $session_alert_id: ID!) {
		deleteSessionAlert(
			project_id: $project_id
			session_alert_id: $session_alert_id
		) {
			id
		}
	}
`
export type DeleteSessionAlertMutationFn = Apollo.MutationFunction<
	Types.DeleteSessionAlertMutation,
	Types.DeleteSessionAlertMutationVariables
>

/**
 * __useDeleteSessionAlertMutation__
 *
 * To run a mutation, you first call `useDeleteSessionAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSessionAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSessionAlertMutation, { data, loading, error }] = useDeleteSessionAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      session_alert_id: // value for 'session_alert_id'
 *   },
 * });
 */
export function useDeleteSessionAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteSessionAlertMutation,
		Types.DeleteSessionAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteSessionAlertMutation,
		Types.DeleteSessionAlertMutationVariables
	>(DeleteSessionAlertDocument, baseOptions)
}
export type DeleteSessionAlertMutationHookResult = ReturnType<
	typeof useDeleteSessionAlertMutation
>
export type DeleteSessionAlertMutationResult =
	Apollo.MutationResult<Types.DeleteSessionAlertMutation>
export type DeleteSessionAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteSessionAlertMutation,
	Types.DeleteSessionAlertMutationVariables
>
export const CreateDefaultAlertsDocument = gql`
	mutation CreateDefaultAlerts(
		$project_id: ID!
		$alert_types: [String!]!
		$slack_channels: [SanitizedSlackChannelInput!]!
		$emails: [String!]!
	) {
		createDefaultAlerts(
			project_id: $project_id
			alert_types: $alert_types
			slack_channels: $slack_channels
			emails: $emails
		)
	}
`
export type CreateDefaultAlertsMutationFn = Apollo.MutationFunction<
	Types.CreateDefaultAlertsMutation,
	Types.CreateDefaultAlertsMutationVariables
>

/**
 * __useCreateDefaultAlertsMutation__
 *
 * To run a mutation, you first call `useCreateDefaultAlertsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDefaultAlertsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDefaultAlertsMutation, { data, loading, error }] = useCreateDefaultAlertsMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      alert_types: // value for 'alert_types'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *   },
 * });
 */
export function useCreateDefaultAlertsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateDefaultAlertsMutation,
		Types.CreateDefaultAlertsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateDefaultAlertsMutation,
		Types.CreateDefaultAlertsMutationVariables
	>(CreateDefaultAlertsDocument, baseOptions)
}
export type CreateDefaultAlertsMutationHookResult = ReturnType<
	typeof useCreateDefaultAlertsMutation
>
export type CreateDefaultAlertsMutationResult =
	Apollo.MutationResult<Types.CreateDefaultAlertsMutation>
export type CreateDefaultAlertsMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateDefaultAlertsMutation,
	Types.CreateDefaultAlertsMutationVariables
>
export const CreateSessionFeedbackAlertDocument = gql`
	mutation CreateSessionFeedbackAlert(
		$project_id: ID!
		$name: String!
		$count_threshold: Int!
		$threshold_window: Int!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
		$environments: [String]!
	) {
		createSessionFeedbackAlert(
			project_id: $project_id
			count_threshold: $count_threshold
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			disabled
		}
	}
`
export type CreateSessionFeedbackAlertMutationFn = Apollo.MutationFunction<
	Types.CreateSessionFeedbackAlertMutation,
	Types.CreateSessionFeedbackAlertMutationVariables
>

/**
 * __useCreateSessionFeedbackAlertMutation__
 *
 * To run a mutation, you first call `useCreateSessionFeedbackAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSessionFeedbackAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSessionFeedbackAlertMutation, { data, loading, error }] = useCreateSessionFeedbackAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      count_threshold: // value for 'count_threshold'
 *      threshold_window: // value for 'threshold_window'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *   },
 * });
 */
export function useCreateSessionFeedbackAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateSessionFeedbackAlertMutation,
		Types.CreateSessionFeedbackAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateSessionFeedbackAlertMutation,
		Types.CreateSessionFeedbackAlertMutationVariables
	>(CreateSessionFeedbackAlertDocument, baseOptions)
}
export type CreateSessionFeedbackAlertMutationHookResult = ReturnType<
	typeof useCreateSessionFeedbackAlertMutation
>
export type CreateSessionFeedbackAlertMutationResult =
	Apollo.MutationResult<Types.CreateSessionFeedbackAlertMutation>
export type CreateSessionFeedbackAlertMutationOptions =
	Apollo.BaseMutationOptions<
		Types.CreateSessionFeedbackAlertMutation,
		Types.CreateSessionFeedbackAlertMutationVariables
	>
export const UpdateSessionFeedbackAlertDocument = gql`
	mutation UpdateSessionFeedbackAlert(
		$project_id: ID!
		$session_feedback_alert_id: ID!
		$count_threshold: Int
		$name: String
		$threshold_window: Int
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$environments: [String]
		$disabled: Boolean
	) {
		updateSessionFeedbackAlert(
			project_id: $project_id
			session_feedback_alert_id: $session_feedback_alert_id
			count_threshold: $count_threshold
			slack_channels: $slack_channels
			emails: $emails
			name: $name
			environments: $environments
			threshold_window: $threshold_window
			disabled: $disabled
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			Name
			LastAdminToEditID
			disabled
		}
	}
`
export type UpdateSessionFeedbackAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateSessionFeedbackAlertMutation,
	Types.UpdateSessionFeedbackAlertMutationVariables
>

/**
 * __useUpdateSessionFeedbackAlertMutation__
 *
 * To run a mutation, you first call `useUpdateSessionFeedbackAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSessionFeedbackAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSessionFeedbackAlertMutation, { data, loading, error }] = useUpdateSessionFeedbackAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      session_feedback_alert_id: // value for 'session_feedback_alert_id'
 *      count_threshold: // value for 'count_threshold'
 *      name: // value for 'name'
 *      threshold_window: // value for 'threshold_window'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateSessionFeedbackAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateSessionFeedbackAlertMutation,
		Types.UpdateSessionFeedbackAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateSessionFeedbackAlertMutation,
		Types.UpdateSessionFeedbackAlertMutationVariables
	>(UpdateSessionFeedbackAlertDocument, baseOptions)
}
export type UpdateSessionFeedbackAlertMutationHookResult = ReturnType<
	typeof useUpdateSessionFeedbackAlertMutation
>
export type UpdateSessionFeedbackAlertMutationResult =
	Apollo.MutationResult<Types.UpdateSessionFeedbackAlertMutation>
export type UpdateSessionFeedbackAlertMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateSessionFeedbackAlertMutation,
		Types.UpdateSessionFeedbackAlertMutationVariables
	>
export const CreateNewUserAlertDocument = gql`
	mutation CreateNewUserAlert(
		$project_id: ID!
		$name: String!
		$count_threshold: Int!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
		$environments: [String]!
		$threshold_window: Int!
	) {
		createNewUserAlert(
			project_id: $project_id
			count_threshold: $count_threshold
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			disabled
		}
	}
`
export type CreateNewUserAlertMutationFn = Apollo.MutationFunction<
	Types.CreateNewUserAlertMutation,
	Types.CreateNewUserAlertMutationVariables
>

/**
 * __useCreateNewUserAlertMutation__
 *
 * To run a mutation, you first call `useCreateNewUserAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNewUserAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNewUserAlertMutation, { data, loading, error }] = useCreateNewUserAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      count_threshold: // value for 'count_threshold'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      threshold_window: // value for 'threshold_window'
 *   },
 * });
 */
export function useCreateNewUserAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateNewUserAlertMutation,
		Types.CreateNewUserAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateNewUserAlertMutation,
		Types.CreateNewUserAlertMutationVariables
	>(CreateNewUserAlertDocument, baseOptions)
}
export type CreateNewUserAlertMutationHookResult = ReturnType<
	typeof useCreateNewUserAlertMutation
>
export type CreateNewUserAlertMutationResult =
	Apollo.MutationResult<Types.CreateNewUserAlertMutation>
export type CreateNewUserAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateNewUserAlertMutation,
	Types.CreateNewUserAlertMutationVariables
>
export const CreateNewSessionAlertDocument = gql`
	mutation CreateNewSessionAlert(
		$project_id: ID!
		$name: String!
		$count_threshold: Int!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
		$environments: [String]!
		$threshold_window: Int!
		$exclude_rules: [String]!
	) {
		createNewSessionAlert(
			project_id: $project_id
			count_threshold: $count_threshold
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
			exclude_rules: $exclude_rules
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			ExcludeRules
			disabled
		}
	}
`
export type CreateNewSessionAlertMutationFn = Apollo.MutationFunction<
	Types.CreateNewSessionAlertMutation,
	Types.CreateNewSessionAlertMutationVariables
>

/**
 * __useCreateNewSessionAlertMutation__
 *
 * To run a mutation, you first call `useCreateNewSessionAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNewSessionAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNewSessionAlertMutation, { data, loading, error }] = useCreateNewSessionAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      count_threshold: // value for 'count_threshold'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      threshold_window: // value for 'threshold_window'
 *      exclude_rules: // value for 'exclude_rules'
 *   },
 * });
 */
export function useCreateNewSessionAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateNewSessionAlertMutation,
		Types.CreateNewSessionAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateNewSessionAlertMutation,
		Types.CreateNewSessionAlertMutationVariables
	>(CreateNewSessionAlertDocument, baseOptions)
}
export type CreateNewSessionAlertMutationHookResult = ReturnType<
	typeof useCreateNewSessionAlertMutation
>
export type CreateNewSessionAlertMutationResult =
	Apollo.MutationResult<Types.CreateNewSessionAlertMutation>
export type CreateNewSessionAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateNewSessionAlertMutation,
	Types.CreateNewSessionAlertMutationVariables
>
export const UpdateNewSessionAlertDocument = gql`
	mutation UpdateNewSessionAlert(
		$project_id: ID!
		$session_alert_id: ID!
		$name: String
		$count_threshold: Int
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$environments: [String]
		$threshold_window: Int
		$exclude_rules: [String]
		$disabled: Boolean
	) {
		updateNewSessionAlert(
			project_id: $project_id
			session_alert_id: $session_alert_id
			name: $name
			count_threshold: $count_threshold
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
			exclude_rules: $exclude_rules
			disabled: $disabled
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			ExcludeRules
			disabled
		}
	}
`
export type UpdateNewSessionAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateNewSessionAlertMutation,
	Types.UpdateNewSessionAlertMutationVariables
>

/**
 * __useUpdateNewSessionAlertMutation__
 *
 * To run a mutation, you first call `useUpdateNewSessionAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNewSessionAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNewSessionAlertMutation, { data, loading, error }] = useUpdateNewSessionAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      session_alert_id: // value for 'session_alert_id'
 *      name: // value for 'name'
 *      count_threshold: // value for 'count_threshold'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      threshold_window: // value for 'threshold_window'
 *      exclude_rules: // value for 'exclude_rules'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateNewSessionAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateNewSessionAlertMutation,
		Types.UpdateNewSessionAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateNewSessionAlertMutation,
		Types.UpdateNewSessionAlertMutationVariables
	>(UpdateNewSessionAlertDocument, baseOptions)
}
export type UpdateNewSessionAlertMutationHookResult = ReturnType<
	typeof useUpdateNewSessionAlertMutation
>
export type UpdateNewSessionAlertMutationResult =
	Apollo.MutationResult<Types.UpdateNewSessionAlertMutation>
export type UpdateNewSessionAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateNewSessionAlertMutation,
	Types.UpdateNewSessionAlertMutationVariables
>
export const UpdateRageClickAlertDocument = gql`
	mutation UpdateRageClickAlert(
		$project_id: ID!
		$rage_click_alert_id: ID!
		$name: String
		$count_threshold: Int
		$threshold_window: Int
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$environments: [String]
		$disabled: Boolean
	) {
		updateRageClickAlert(
			project_id: $project_id
			rage_click_alert_id: $rage_click_alert_id
			name: $name
			count_threshold: $count_threshold
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
			disabled: $disabled
		) {
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			disabled
		}
	}
`
export type UpdateRageClickAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateRageClickAlertMutation,
	Types.UpdateRageClickAlertMutationVariables
>

/**
 * __useUpdateRageClickAlertMutation__
 *
 * To run a mutation, you first call `useUpdateRageClickAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRageClickAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRageClickAlertMutation, { data, loading, error }] = useUpdateRageClickAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      rage_click_alert_id: // value for 'rage_click_alert_id'
 *      name: // value for 'name'
 *      count_threshold: // value for 'count_threshold'
 *      threshold_window: // value for 'threshold_window'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateRageClickAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateRageClickAlertMutation,
		Types.UpdateRageClickAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateRageClickAlertMutation,
		Types.UpdateRageClickAlertMutationVariables
	>(UpdateRageClickAlertDocument, baseOptions)
}
export type UpdateRageClickAlertMutationHookResult = ReturnType<
	typeof useUpdateRageClickAlertMutation
>
export type UpdateRageClickAlertMutationResult =
	Apollo.MutationResult<Types.UpdateRageClickAlertMutation>
export type UpdateRageClickAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateRageClickAlertMutation,
	Types.UpdateRageClickAlertMutationVariables
>
export const UpdateNewUserAlertDocument = gql`
	mutation UpdateNewUserAlert(
		$project_id: ID!
		$session_alert_id: ID!
		$count_threshold: Int
		$name: String
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$environments: [String]
		$threshold_window: Int
		$disabled: Boolean
	) {
		updateNewUserAlert(
			project_id: $project_id
			session_alert_id: $session_alert_id
			count_threshold: $count_threshold
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
			disabled: $disabled
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			CountThreshold
			LastAdminToEditID
			disabled
		}
	}
`
export type UpdateNewUserAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateNewUserAlertMutation,
	Types.UpdateNewUserAlertMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      session_alert_id: // value for 'session_alert_id'
 *      count_threshold: // value for 'count_threshold'
 *      name: // value for 'name'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      threshold_window: // value for 'threshold_window'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateNewUserAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateNewUserAlertMutation,
		Types.UpdateNewUserAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateNewUserAlertMutation,
		Types.UpdateNewUserAlertMutationVariables
	>(UpdateNewUserAlertDocument, baseOptions)
}
export type UpdateNewUserAlertMutationHookResult = ReturnType<
	typeof useUpdateNewUserAlertMutation
>
export type UpdateNewUserAlertMutationResult =
	Apollo.MutationResult<Types.UpdateNewUserAlertMutation>
export type UpdateNewUserAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateNewUserAlertMutation,
	Types.UpdateNewUserAlertMutationVariables
>
export const CreateTrackPropertiesAlertDocument = gql`
	mutation CreateTrackPropertiesAlert(
		$project_id: ID!
		$name: String!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
		$environments: [String]!
		$track_properties: [TrackPropertyInput]!
		$threshold_window: Int!
	) {
		createTrackPropertiesAlert(
			project_id: $project_id
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			track_properties: $track_properties
			threshold_window: $threshold_window
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			TrackProperties {
				id
				name
				value
			}
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			disabled
		}
	}
`
export type CreateTrackPropertiesAlertMutationFn = Apollo.MutationFunction<
	Types.CreateTrackPropertiesAlertMutation,
	Types.CreateTrackPropertiesAlertMutationVariables
>

/**
 * __useCreateTrackPropertiesAlertMutation__
 *
 * To run a mutation, you first call `useCreateTrackPropertiesAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTrackPropertiesAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTrackPropertiesAlertMutation, { data, loading, error }] = useCreateTrackPropertiesAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      track_properties: // value for 'track_properties'
 *      threshold_window: // value for 'threshold_window'
 *   },
 * });
 */
export function useCreateTrackPropertiesAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateTrackPropertiesAlertMutation,
		Types.CreateTrackPropertiesAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateTrackPropertiesAlertMutation,
		Types.CreateTrackPropertiesAlertMutationVariables
	>(CreateTrackPropertiesAlertDocument, baseOptions)
}
export type CreateTrackPropertiesAlertMutationHookResult = ReturnType<
	typeof useCreateTrackPropertiesAlertMutation
>
export type CreateTrackPropertiesAlertMutationResult =
	Apollo.MutationResult<Types.CreateTrackPropertiesAlertMutation>
export type CreateTrackPropertiesAlertMutationOptions =
	Apollo.BaseMutationOptions<
		Types.CreateTrackPropertiesAlertMutation,
		Types.CreateTrackPropertiesAlertMutationVariables
	>
export const UpdateTrackPropertiesAlertDocument = gql`
	mutation UpdateTrackPropertiesAlert(
		$project_id: ID!
		$session_alert_id: ID!
		$name: String
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$environments: [String]
		$track_properties: [TrackPropertyInput]
		$threshold_window: Int
		$disabled: Boolean
	) {
		updateTrackPropertiesAlert(
			project_id: $project_id
			session_alert_id: $session_alert_id
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			name: $name
			track_properties: $track_properties
			threshold_window: $threshold_window
			disabled: $disabled
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			TrackProperties {
				id
				name
				value
			}
			ExcludedEnvironments
			CountThreshold
			LastAdminToEditID
			Name
			disabled
		}
	}
`
export type UpdateTrackPropertiesAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateTrackPropertiesAlertMutation,
	Types.UpdateTrackPropertiesAlertMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      session_alert_id: // value for 'session_alert_id'
 *      name: // value for 'name'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      track_properties: // value for 'track_properties'
 *      threshold_window: // value for 'threshold_window'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateTrackPropertiesAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateTrackPropertiesAlertMutation,
		Types.UpdateTrackPropertiesAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateTrackPropertiesAlertMutation,
		Types.UpdateTrackPropertiesAlertMutationVariables
	>(UpdateTrackPropertiesAlertDocument, baseOptions)
}
export type UpdateTrackPropertiesAlertMutationHookResult = ReturnType<
	typeof useUpdateTrackPropertiesAlertMutation
>
export type UpdateTrackPropertiesAlertMutationResult =
	Apollo.MutationResult<Types.UpdateTrackPropertiesAlertMutation>
export type UpdateTrackPropertiesAlertMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateTrackPropertiesAlertMutation,
		Types.UpdateTrackPropertiesAlertMutationVariables
	>
export const CreateUserPropertiesAlertDocument = gql`
	mutation CreateUserPropertiesAlert(
		$project_id: ID!
		$name: String!
		$slack_channels: [SanitizedSlackChannelInput]!
		$emails: [String]!
		$environments: [String]!
		$user_properties: [UserPropertyInput]!
		$threshold_window: Int!
	) {
		createUserPropertiesAlert(
			project_id: $project_id
			name: $name
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			user_properties: $user_properties
			threshold_window: $threshold_window
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			UserProperties {
				id
				name
				value
			}
			Name
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			disabled
		}
	}
`
export type CreateUserPropertiesAlertMutationFn = Apollo.MutationFunction<
	Types.CreateUserPropertiesAlertMutation,
	Types.CreateUserPropertiesAlertMutationVariables
>

/**
 * __useCreateUserPropertiesAlertMutation__
 *
 * To run a mutation, you first call `useCreateUserPropertiesAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserPropertiesAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserPropertiesAlertMutation, { data, loading, error }] = useCreateUserPropertiesAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      user_properties: // value for 'user_properties'
 *      threshold_window: // value for 'threshold_window'
 *   },
 * });
 */
export function useCreateUserPropertiesAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateUserPropertiesAlertMutation,
		Types.CreateUserPropertiesAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateUserPropertiesAlertMutation,
		Types.CreateUserPropertiesAlertMutationVariables
	>(CreateUserPropertiesAlertDocument, baseOptions)
}
export type CreateUserPropertiesAlertMutationHookResult = ReturnType<
	typeof useCreateUserPropertiesAlertMutation
>
export type CreateUserPropertiesAlertMutationResult =
	Apollo.MutationResult<Types.CreateUserPropertiesAlertMutation>
export type CreateUserPropertiesAlertMutationOptions =
	Apollo.BaseMutationOptions<
		Types.CreateUserPropertiesAlertMutation,
		Types.CreateUserPropertiesAlertMutationVariables
	>
export const UpdateUserPropertiesAlertDocument = gql`
	mutation UpdateUserPropertiesAlert(
		$project_id: ID!
		$session_alert_id: ID!
		$name: String
		$slack_channels: [SanitizedSlackChannelInput]
		$emails: [String]
		$environments: [String]
		$user_properties: [UserPropertyInput]
		$threshold_window: Int
		$disabled: Boolean
	) {
		updateUserPropertiesAlert(
			project_id: $project_id
			session_alert_id: $session_alert_id
			slack_channels: $slack_channels
			emails: $emails
			environments: $environments
			name: $name
			user_properties: $user_properties
			threshold_window: $threshold_window
			disabled: $disabled
		) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			UserProperties {
				id
				name
				value
			}
			ExcludedEnvironments
			CountThreshold
			Name
			LastAdminToEditID
			disabled
		}
	}
`
export type UpdateUserPropertiesAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateUserPropertiesAlertMutation,
	Types.UpdateUserPropertiesAlertMutationVariables
>

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
 *      project_id: // value for 'project_id'
 *      session_alert_id: // value for 'session_alert_id'
 *      name: // value for 'name'
 *      slack_channels: // value for 'slack_channels'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      user_properties: // value for 'user_properties'
 *      threshold_window: // value for 'threshold_window'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateUserPropertiesAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateUserPropertiesAlertMutation,
		Types.UpdateUserPropertiesAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateUserPropertiesAlertMutation,
		Types.UpdateUserPropertiesAlertMutationVariables
	>(UpdateUserPropertiesAlertDocument, baseOptions)
}
export type UpdateUserPropertiesAlertMutationHookResult = ReturnType<
	typeof useUpdateUserPropertiesAlertMutation
>
export type UpdateUserPropertiesAlertMutationResult =
	Apollo.MutationResult<Types.UpdateUserPropertiesAlertMutation>
export type UpdateUserPropertiesAlertMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateUserPropertiesAlertMutation,
		Types.UpdateUserPropertiesAlertMutationVariables
	>
export const UpdateSessionIsPublicDocument = gql`
	mutation UpdateSessionIsPublic(
		$session_secure_id: String!
		$is_public: Boolean!
	) {
		updateSessionIsPublic(
			session_secure_id: $session_secure_id
			is_public: $is_public
		) {
			secure_id
			is_public
		}
	}
`
export type UpdateSessionIsPublicMutationFn = Apollo.MutationFunction<
	Types.UpdateSessionIsPublicMutation,
	Types.UpdateSessionIsPublicMutationVariables
>

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
 *      session_secure_id: // value for 'session_secure_id'
 *      is_public: // value for 'is_public'
 *   },
 * });
 */
export function useUpdateSessionIsPublicMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateSessionIsPublicMutation,
		Types.UpdateSessionIsPublicMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateSessionIsPublicMutation,
		Types.UpdateSessionIsPublicMutationVariables
	>(UpdateSessionIsPublicDocument, baseOptions)
}
export type UpdateSessionIsPublicMutationHookResult = ReturnType<
	typeof useUpdateSessionIsPublicMutation
>
export type UpdateSessionIsPublicMutationResult =
	Apollo.MutationResult<Types.UpdateSessionIsPublicMutation>
export type UpdateSessionIsPublicMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateSessionIsPublicMutation,
	Types.UpdateSessionIsPublicMutationVariables
>
export const UpdateErrorGroupIsPublicDocument = gql`
	mutation UpdateErrorGroupIsPublic(
		$error_group_secure_id: String!
		$is_public: Boolean!
	) {
		updateErrorGroupIsPublic(
			error_group_secure_id: $error_group_secure_id
			is_public: $is_public
		) {
			secure_id
			is_public
		}
	}
`
export type UpdateErrorGroupIsPublicMutationFn = Apollo.MutationFunction<
	Types.UpdateErrorGroupIsPublicMutation,
	Types.UpdateErrorGroupIsPublicMutationVariables
>

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
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *      is_public: // value for 'is_public'
 *   },
 * });
 */
export function useUpdateErrorGroupIsPublicMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateErrorGroupIsPublicMutation,
		Types.UpdateErrorGroupIsPublicMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateErrorGroupIsPublicMutation,
		Types.UpdateErrorGroupIsPublicMutationVariables
	>(UpdateErrorGroupIsPublicDocument, baseOptions)
}
export type UpdateErrorGroupIsPublicMutationHookResult = ReturnType<
	typeof useUpdateErrorGroupIsPublicMutation
>
export type UpdateErrorGroupIsPublicMutationResult =
	Apollo.MutationResult<Types.UpdateErrorGroupIsPublicMutation>
export type UpdateErrorGroupIsPublicMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateErrorGroupIsPublicMutation,
		Types.UpdateErrorGroupIsPublicMutationVariables
	>
export const UpdateAllowMeterOverageDocument = gql`
	mutation UpdateAllowMeterOverage(
		$workspace_id: ID!
		$allow_meter_overage: Boolean!
	) {
		updateAllowMeterOverage(
			workspace_id: $workspace_id
			allow_meter_overage: $allow_meter_overage
		) {
			id
			allow_meter_overage
		}
	}
`
export type UpdateAllowMeterOverageMutationFn = Apollo.MutationFunction<
	Types.UpdateAllowMeterOverageMutation,
	Types.UpdateAllowMeterOverageMutationVariables
>

/**
 * __useUpdateAllowMeterOverageMutation__
 *
 * To run a mutation, you first call `useUpdateAllowMeterOverageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAllowMeterOverageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAllowMeterOverageMutation, { data, loading, error }] = useUpdateAllowMeterOverageMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      allow_meter_overage: // value for 'allow_meter_overage'
 *   },
 * });
 */
export function useUpdateAllowMeterOverageMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateAllowMeterOverageMutation,
		Types.UpdateAllowMeterOverageMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateAllowMeterOverageMutation,
		Types.UpdateAllowMeterOverageMutationVariables
	>(UpdateAllowMeterOverageDocument, baseOptions)
}
export type UpdateAllowMeterOverageMutationHookResult = ReturnType<
	typeof useUpdateAllowMeterOverageMutation
>
export type UpdateAllowMeterOverageMutationResult =
	Apollo.MutationResult<Types.UpdateAllowMeterOverageMutation>
export type UpdateAllowMeterOverageMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateAllowMeterOverageMutation,
	Types.UpdateAllowMeterOverageMutationVariables
>
export const SyncSlackIntegrationDocument = gql`
	mutation SyncSlackIntegration($project_id: ID!) {
		syncSlackIntegration(project_id: $project_id) {
			success
			newChannelsAddedCount
		}
	}
`
export type SyncSlackIntegrationMutationFn = Apollo.MutationFunction<
	Types.SyncSlackIntegrationMutation,
	Types.SyncSlackIntegrationMutationVariables
>

/**
 * __useSyncSlackIntegrationMutation__
 *
 * To run a mutation, you first call `useSyncSlackIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSyncSlackIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [syncSlackIntegrationMutation, { data, loading, error }] = useSyncSlackIntegrationMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useSyncSlackIntegrationMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.SyncSlackIntegrationMutation,
		Types.SyncSlackIntegrationMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.SyncSlackIntegrationMutation,
		Types.SyncSlackIntegrationMutationVariables
	>(SyncSlackIntegrationDocument, baseOptions)
}
export type SyncSlackIntegrationMutationHookResult = ReturnType<
	typeof useSyncSlackIntegrationMutation
>
export type SyncSlackIntegrationMutationResult =
	Apollo.MutationResult<Types.SyncSlackIntegrationMutation>
export type SyncSlackIntegrationMutationOptions = Apollo.BaseMutationOptions<
	Types.SyncSlackIntegrationMutation,
	Types.SyncSlackIntegrationMutationVariables
>
export const RequestAccessDocument = gql`
	mutation RequestAccess($project_id: ID!) {
		requestAccess(project_id: $project_id)
	}
`
export type RequestAccessMutationFn = Apollo.MutationFunction<
	Types.RequestAccessMutation,
	Types.RequestAccessMutationVariables
>

/**
 * __useRequestAccessMutation__
 *
 * To run a mutation, you first call `useRequestAccessMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestAccessMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestAccessMutation, { data, loading, error }] = useRequestAccessMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useRequestAccessMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.RequestAccessMutation,
		Types.RequestAccessMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.RequestAccessMutation,
		Types.RequestAccessMutationVariables
	>(RequestAccessDocument, baseOptions)
}
export type RequestAccessMutationHookResult = ReturnType<
	typeof useRequestAccessMutation
>
export type RequestAccessMutationResult =
	Apollo.MutationResult<Types.RequestAccessMutation>
export type RequestAccessMutationOptions = Apollo.BaseMutationOptions<
	Types.RequestAccessMutation,
	Types.RequestAccessMutationVariables
>
export const ModifyClearbitIntegrationDocument = gql`
	mutation ModifyClearbitIntegration($workspace_id: ID!, $enabled: Boolean!) {
		modifyClearbitIntegration(
			workspace_id: $workspace_id
			enabled: $enabled
		)
	}
`
export type ModifyClearbitIntegrationMutationFn = Apollo.MutationFunction<
	Types.ModifyClearbitIntegrationMutation,
	Types.ModifyClearbitIntegrationMutationVariables
>

/**
 * __useModifyClearbitIntegrationMutation__
 *
 * To run a mutation, you first call `useModifyClearbitIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useModifyClearbitIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [modifyClearbitIntegrationMutation, { data, loading, error }] = useModifyClearbitIntegrationMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      enabled: // value for 'enabled'
 *   },
 * });
 */
export function useModifyClearbitIntegrationMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.ModifyClearbitIntegrationMutation,
		Types.ModifyClearbitIntegrationMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.ModifyClearbitIntegrationMutation,
		Types.ModifyClearbitIntegrationMutationVariables
	>(ModifyClearbitIntegrationDocument, baseOptions)
}
export type ModifyClearbitIntegrationMutationHookResult = ReturnType<
	typeof useModifyClearbitIntegrationMutation
>
export type ModifyClearbitIntegrationMutationResult =
	Apollo.MutationResult<Types.ModifyClearbitIntegrationMutation>
export type ModifyClearbitIntegrationMutationOptions =
	Apollo.BaseMutationOptions<
		Types.ModifyClearbitIntegrationMutation,
		Types.ModifyClearbitIntegrationMutationVariables
	>
export const UpsertDashboardDocument = gql`
	mutation UpsertDashboard(
		$id: ID
		$project_id: ID!
		$name: String!
		$metrics: [DashboardMetricConfigInput!]!
		$layout: String
		$is_default: Boolean
	) {
		upsertDashboard(
			id: $id
			project_id: $project_id
			name: $name
			metrics: $metrics
			layout: $layout
			is_default: $is_default
		)
	}
`
export type UpsertDashboardMutationFn = Apollo.MutationFunction<
	Types.UpsertDashboardMutation,
	Types.UpsertDashboardMutationVariables
>

/**
 * __useUpsertDashboardMutation__
 *
 * To run a mutation, you first call `useUpsertDashboardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertDashboardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertDashboardMutation, { data, loading, error }] = useUpsertDashboardMutation({
 *   variables: {
 *      id: // value for 'id'
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      metrics: // value for 'metrics'
 *      layout: // value for 'layout'
 *      is_default: // value for 'is_default'
 *   },
 * });
 */
export function useUpsertDashboardMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpsertDashboardMutation,
		Types.UpsertDashboardMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpsertDashboardMutation,
		Types.UpsertDashboardMutationVariables
	>(UpsertDashboardDocument, baseOptions)
}
export type UpsertDashboardMutationHookResult = ReturnType<
	typeof useUpsertDashboardMutation
>
export type UpsertDashboardMutationResult =
	Apollo.MutationResult<Types.UpsertDashboardMutation>
export type UpsertDashboardMutationOptions = Apollo.BaseMutationOptions<
	Types.UpsertDashboardMutation,
	Types.UpsertDashboardMutationVariables
>
export const DeleteDashboardDocument = gql`
	mutation DeleteDashboard($id: ID!) {
		deleteDashboard(id: $id)
	}
`
export type DeleteDashboardMutationFn = Apollo.MutationFunction<
	Types.DeleteDashboardMutation,
	Types.DeleteDashboardMutationVariables
>

/**
 * __useDeleteDashboardMutation__
 *
 * To run a mutation, you first call `useDeleteDashboardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDashboardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDashboardMutation, { data, loading, error }] = useDeleteDashboardMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteDashboardMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteDashboardMutation,
		Types.DeleteDashboardMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteDashboardMutation,
		Types.DeleteDashboardMutationVariables
	>(DeleteDashboardDocument, baseOptions)
}
export type DeleteDashboardMutationHookResult = ReturnType<
	typeof useDeleteDashboardMutation
>
export type DeleteDashboardMutationResult =
	Apollo.MutationResult<Types.DeleteDashboardMutation>
export type DeleteDashboardMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteDashboardMutation,
	Types.DeleteDashboardMutationVariables
>
export const GetMetricsTimelineDocument = gql`
	query GetMetricsTimeline(
		$project_id: ID!
		$metric_name: String!
		$params: DashboardParamsInput!
	) {
		metrics_timeline(
			project_id: $project_id
			metric_name: $metric_name
			params: $params
		) {
			date
			value
			aggregator
			group
		}
	}
`

/**
 * __useGetMetricsTimelineQuery__
 *
 * To run a query within a React component, call `useGetMetricsTimelineQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMetricsTimelineQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMetricsTimelineQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      metric_name: // value for 'metric_name'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetMetricsTimelineQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetMetricsTimelineQuery,
		Types.GetMetricsTimelineQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetMetricsTimelineQuery,
		Types.GetMetricsTimelineQueryVariables
	>(GetMetricsTimelineDocument, baseOptions)
}
export function useGetMetricsTimelineLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetMetricsTimelineQuery,
		Types.GetMetricsTimelineQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetMetricsTimelineQuery,
		Types.GetMetricsTimelineQueryVariables
	>(GetMetricsTimelineDocument, baseOptions)
}
export type GetMetricsTimelineQueryHookResult = ReturnType<
	typeof useGetMetricsTimelineQuery
>
export type GetMetricsTimelineLazyQueryHookResult = ReturnType<
	typeof useGetMetricsTimelineLazyQuery
>
export type GetMetricsTimelineQueryResult = Apollo.QueryResult<
	Types.GetMetricsTimelineQuery,
	Types.GetMetricsTimelineQueryVariables
>
export const GetMetricsHistogramDocument = gql`
	query GetMetricsHistogram(
		$project_id: ID!
		$metric_name: String!
		$params: HistogramParamsInput!
	) {
		metrics_histogram(
			project_id: $project_id
			metric_name: $metric_name
			params: $params
		) {
			buckets {
				bucket
				range_start
				range_end
				count
			}
			min
			max
		}
	}
`

/**
 * __useGetMetricsHistogramQuery__
 *
 * To run a query within a React component, call `useGetMetricsHistogramQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMetricsHistogramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMetricsHistogramQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      metric_name: // value for 'metric_name'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetMetricsHistogramQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetMetricsHistogramQuery,
		Types.GetMetricsHistogramQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetMetricsHistogramQuery,
		Types.GetMetricsHistogramQueryVariables
	>(GetMetricsHistogramDocument, baseOptions)
}
export function useGetMetricsHistogramLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetMetricsHistogramQuery,
		Types.GetMetricsHistogramQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetMetricsHistogramQuery,
		Types.GetMetricsHistogramQueryVariables
	>(GetMetricsHistogramDocument, baseOptions)
}
export type GetMetricsHistogramQueryHookResult = ReturnType<
	typeof useGetMetricsHistogramQuery
>
export type GetMetricsHistogramLazyQueryHookResult = ReturnType<
	typeof useGetMetricsHistogramLazyQuery
>
export type GetMetricsHistogramQueryResult = Apollo.QueryResult<
	Types.GetMetricsHistogramQuery,
	Types.GetMetricsHistogramQueryVariables
>
export const GetNetworkHistogramDocument = gql`
	query GetNetworkHistogram(
		$project_id: ID!
		$params: NetworkHistogramParamsInput!
	) {
		network_histogram(project_id: $project_id, params: $params) {
			buckets {
				category
				count
			}
		}
	}
`

/**
 * __useGetNetworkHistogramQuery__
 *
 * To run a query within a React component, call `useGetNetworkHistogramQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNetworkHistogramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNetworkHistogramQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetNetworkHistogramQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetNetworkHistogramQuery,
		Types.GetNetworkHistogramQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetNetworkHistogramQuery,
		Types.GetNetworkHistogramQueryVariables
	>(GetNetworkHistogramDocument, baseOptions)
}
export function useGetNetworkHistogramLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetNetworkHistogramQuery,
		Types.GetNetworkHistogramQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetNetworkHistogramQuery,
		Types.GetNetworkHistogramQueryVariables
	>(GetNetworkHistogramDocument, baseOptions)
}
export type GetNetworkHistogramQueryHookResult = ReturnType<
	typeof useGetNetworkHistogramQuery
>
export type GetNetworkHistogramLazyQueryHookResult = ReturnType<
	typeof useGetNetworkHistogramLazyQuery
>
export type GetNetworkHistogramQueryResult = Apollo.QueryResult<
	Types.GetNetworkHistogramQuery,
	Types.GetNetworkHistogramQueryVariables
>
export const GetSessionPayloadDocument = gql`
	query GetSessionPayload(
		$session_secure_id: String!
		$skip_events: Boolean!
	) {
		events(session_secure_id: $session_secure_id) @skip(if: $skip_events)
		errors(session_secure_id: $session_secure_id) {
			id
			error_group_secure_id
			event
			type
			url
			source
			stack_trace
			structured_stack_trace {
				fileName
				lineNumber
				functionName
				columnNumber
			}
			timestamp
			payload
			request_id
		}
		rage_clicks(session_secure_id: $session_secure_id) {
			start_timestamp
			end_timestamp
			total_clicks
		}
		session_comments(session_secure_id: $session_secure_id) {
			id
			timestamp
			session_id
			session_secure_id
			created_at
			updated_at
			project_id
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
			tags
			attachments {
				id
				integration_type
				external_id
				title
			}
		}
	}
`

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
 *      session_secure_id: // value for 'session_secure_id'
 *      skip_events: // value for 'skip_events'
 *   },
 * });
 */
export function useGetSessionPayloadQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionPayloadQuery,
		Types.GetSessionPayloadQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionPayloadQuery,
		Types.GetSessionPayloadQueryVariables
	>(GetSessionPayloadDocument, baseOptions)
}
export function useGetSessionPayloadLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionPayloadQuery,
		Types.GetSessionPayloadQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionPayloadQuery,
		Types.GetSessionPayloadQueryVariables
	>(GetSessionPayloadDocument, baseOptions)
}
export type GetSessionPayloadQueryHookResult = ReturnType<
	typeof useGetSessionPayloadQuery
>
export type GetSessionPayloadLazyQueryHookResult = ReturnType<
	typeof useGetSessionPayloadLazyQuery
>
export type GetSessionPayloadQueryResult = Apollo.QueryResult<
	Types.GetSessionPayloadQuery,
	Types.GetSessionPayloadQueryVariables
>
export const GetCommentTagsForProjectDocument = gql`
	query GetCommentTagsForProject($project_id: ID!) {
		session_comment_tags_for_project(project_id: $project_id) {
			id
			name
		}
	}
`

/**
 * __useGetCommentTagsForProjectQuery__
 *
 * To run a query within a React component, call `useGetCommentTagsForProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentTagsForProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentTagsForProjectQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetCommentTagsForProjectQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetCommentTagsForProjectQuery,
		Types.GetCommentTagsForProjectQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetCommentTagsForProjectQuery,
		Types.GetCommentTagsForProjectQueryVariables
	>(GetCommentTagsForProjectDocument, baseOptions)
}
export function useGetCommentTagsForProjectLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetCommentTagsForProjectQuery,
		Types.GetCommentTagsForProjectQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetCommentTagsForProjectQuery,
		Types.GetCommentTagsForProjectQueryVariables
	>(GetCommentTagsForProjectDocument, baseOptions)
}
export type GetCommentTagsForProjectQueryHookResult = ReturnType<
	typeof useGetCommentTagsForProjectQuery
>
export type GetCommentTagsForProjectLazyQueryHookResult = ReturnType<
	typeof useGetCommentTagsForProjectLazyQuery
>
export type GetCommentTagsForProjectQueryResult = Apollo.QueryResult<
	Types.GetCommentTagsForProjectQuery,
	Types.GetCommentTagsForProjectQueryVariables
>
export const GetEventChunkUrlDocument = gql`
	query GetEventChunkURL($secure_id: String!, $index: Int!) {
		event_chunk_url(secure_id: $secure_id, index: $index)
	}
`

/**
 * __useGetEventChunkUrlQuery__
 *
 * To run a query within a React component, call `useGetEventChunkUrlQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventChunkUrlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventChunkUrlQuery({
 *   variables: {
 *      secure_id: // value for 'secure_id'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useGetEventChunkUrlQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetEventChunkUrlQuery,
		Types.GetEventChunkUrlQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetEventChunkUrlQuery,
		Types.GetEventChunkUrlQueryVariables
	>(GetEventChunkUrlDocument, baseOptions)
}
export function useGetEventChunkUrlLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetEventChunkUrlQuery,
		Types.GetEventChunkUrlQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetEventChunkUrlQuery,
		Types.GetEventChunkUrlQueryVariables
	>(GetEventChunkUrlDocument, baseOptions)
}
export type GetEventChunkUrlQueryHookResult = ReturnType<
	typeof useGetEventChunkUrlQuery
>
export type GetEventChunkUrlLazyQueryHookResult = ReturnType<
	typeof useGetEventChunkUrlLazyQuery
>
export type GetEventChunkUrlQueryResult = Apollo.QueryResult<
	Types.GetEventChunkUrlQuery,
	Types.GetEventChunkUrlQueryVariables
>
export const GetEventChunksDocument = gql`
	query GetEventChunks($secure_id: String!) {
		event_chunks(secure_id: $secure_id) {
			session_id
			chunk_index
			timestamp
		}
	}
`

/**
 * __useGetEventChunksQuery__
 *
 * To run a query within a React component, call `useGetEventChunksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventChunksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventChunksQuery({
 *   variables: {
 *      secure_id: // value for 'secure_id'
 *   },
 * });
 */
export function useGetEventChunksQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetEventChunksQuery,
		Types.GetEventChunksQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetEventChunksQuery,
		Types.GetEventChunksQueryVariables
	>(GetEventChunksDocument, baseOptions)
}
export function useGetEventChunksLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetEventChunksQuery,
		Types.GetEventChunksQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetEventChunksQuery,
		Types.GetEventChunksQueryVariables
	>(GetEventChunksDocument, baseOptions)
}
export type GetEventChunksQueryHookResult = ReturnType<
	typeof useGetEventChunksQuery
>
export type GetEventChunksLazyQueryHookResult = ReturnType<
	typeof useGetEventChunksLazyQuery
>
export type GetEventChunksQueryResult = Apollo.QueryResult<
	Types.GetEventChunksQuery,
	Types.GetEventChunksQueryVariables
>
export const GetSessionDocument = gql`
	query GetSession($secure_id: String!) {
		session(secure_id: $secure_id) {
			secure_id
			os_name
			os_version
			browser_name
			browser_version
			environment
			app_version
			city
			state
			country
			postal
			fingerprint
			created_at
			language
			user_object
			user_properties
			identifier
			identified
			client_id
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
			processed
			excluded
			has_rage_clicks
			has_errors
			within_billing_quota
			client_version
			firstload_version
			client_config
			is_public
			event_counts
			direct_download_url
			resources_url
			messages_url
			deviceMemory
			last_user_interaction_time
			length
			active_length
			chunked
		}
	}
`

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
 *      secure_id: // value for 'secure_id'
 *   },
 * });
 */
export function useGetSessionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionQuery,
		Types.GetSessionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionQuery,
		Types.GetSessionQueryVariables
	>(GetSessionDocument, baseOptions)
}
export function useGetSessionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionQuery,
		Types.GetSessionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionQuery,
		Types.GetSessionQueryVariables
	>(GetSessionDocument, baseOptions)
}
export type GetSessionQueryHookResult = ReturnType<typeof useGetSessionQuery>
export type GetSessionLazyQueryHookResult = ReturnType<
	typeof useGetSessionLazyQuery
>
export type GetSessionQueryResult = Apollo.QueryResult<
	Types.GetSessionQuery,
	Types.GetSessionQueryVariables
>
export const GetWorkspaceAdminsByProjectIdDocument = gql`
	query GetWorkspaceAdminsByProjectId($project_id: ID!) {
		admins: workspace_admins_by_project_id(project_id: $project_id) {
			admin {
				id
				name
				email
				photo_url
			}
			role
		}
	}
`

/**
 * __useGetWorkspaceAdminsByProjectIdQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceAdminsByProjectIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceAdminsByProjectIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceAdminsByProjectIdQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetWorkspaceAdminsByProjectIdQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceAdminsByProjectIdQuery,
		Types.GetWorkspaceAdminsByProjectIdQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceAdminsByProjectIdQuery,
		Types.GetWorkspaceAdminsByProjectIdQueryVariables
	>(GetWorkspaceAdminsByProjectIdDocument, baseOptions)
}
export function useGetWorkspaceAdminsByProjectIdLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceAdminsByProjectIdQuery,
		Types.GetWorkspaceAdminsByProjectIdQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceAdminsByProjectIdQuery,
		Types.GetWorkspaceAdminsByProjectIdQueryVariables
	>(GetWorkspaceAdminsByProjectIdDocument, baseOptions)
}
export type GetWorkspaceAdminsByProjectIdQueryHookResult = ReturnType<
	typeof useGetWorkspaceAdminsByProjectIdQuery
>
export type GetWorkspaceAdminsByProjectIdLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceAdminsByProjectIdLazyQuery
>
export type GetWorkspaceAdminsByProjectIdQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceAdminsByProjectIdQuery,
	Types.GetWorkspaceAdminsByProjectIdQueryVariables
>
export const GetWorkspaceAdminsDocument = gql`
	query GetWorkspaceAdmins($workspace_id: ID!) {
		admins: workspace_admins(workspace_id: $workspace_id) {
			admin {
				id
				name
				email
				photo_url
			}
			role
		}
		workspace(id: $workspace_id) {
			id
			name
			secret
			allowed_auto_join_email_origins
		}
		workspace_invite_links(workspace_id: $workspace_id) {
			id
			invitee_email
			invitee_role
			expiration_date
			secret
		}
	}
`

/**
 * __useGetWorkspaceAdminsQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceAdminsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceAdminsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceAdminsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetWorkspaceAdminsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceAdminsQuery,
		Types.GetWorkspaceAdminsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceAdminsQuery,
		Types.GetWorkspaceAdminsQueryVariables
	>(GetWorkspaceAdminsDocument, baseOptions)
}
export function useGetWorkspaceAdminsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceAdminsQuery,
		Types.GetWorkspaceAdminsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceAdminsQuery,
		Types.GetWorkspaceAdminsQueryVariables
	>(GetWorkspaceAdminsDocument, baseOptions)
}
export type GetWorkspaceAdminsQueryHookResult = ReturnType<
	typeof useGetWorkspaceAdminsQuery
>
export type GetWorkspaceAdminsLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceAdminsLazyQuery
>
export type GetWorkspaceAdminsQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceAdminsQuery,
	Types.GetWorkspaceAdminsQueryVariables
>
export const GetSessionCommentsDocument = gql`
	query GetSessionComments($session_secure_id: String!) {
		session_comments(session_secure_id: $session_secure_id) {
			id
			timestamp
			session_id
			session_secure_id
			created_at
			updated_at
			project_id
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
			tags
			attachments {
				id
				integration_type
				external_id
				title
			}
			replies {
				id
				created_at
				updated_at
				author {
					id
					name
					email
					photo_url
				}
				text
			}
		}
	}
`

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
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetSessionCommentsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionCommentsQuery,
		Types.GetSessionCommentsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionCommentsQuery,
		Types.GetSessionCommentsQueryVariables
	>(GetSessionCommentsDocument, baseOptions)
}
export function useGetSessionCommentsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionCommentsQuery,
		Types.GetSessionCommentsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionCommentsQuery,
		Types.GetSessionCommentsQueryVariables
	>(GetSessionCommentsDocument, baseOptions)
}
export type GetSessionCommentsQueryHookResult = ReturnType<
	typeof useGetSessionCommentsQuery
>
export type GetSessionCommentsLazyQueryHookResult = ReturnType<
	typeof useGetSessionCommentsLazyQuery
>
export type GetSessionCommentsQueryResult = Apollo.QueryResult<
	Types.GetSessionCommentsQuery,
	Types.GetSessionCommentsQueryVariables
>
export const GetNotificationsDocument = gql`
	query GetNotifications($project_id: ID!) {
		session_comments_for_project(project_id: $project_id) {
			id
			timestamp
			updated_at
			session_id
			session_secure_id
			text
			author {
				id
				name
				email
				photo_url
			}
			type
			metadata
			tags
		}
		error_comments_for_project(project_id: $project_id) {
			id
			updated_at
			project_id
			text
			error_id
			error_secure_id
			author {
				id
				name
				email
				photo_url
			}
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetNotificationsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetNotificationsQuery,
		Types.GetNotificationsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetNotificationsQuery,
		Types.GetNotificationsQueryVariables
	>(GetNotificationsDocument, baseOptions)
}
export function useGetNotificationsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetNotificationsQuery,
		Types.GetNotificationsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetNotificationsQuery,
		Types.GetNotificationsQueryVariables
	>(GetNotificationsDocument, baseOptions)
}
export type GetNotificationsQueryHookResult = ReturnType<
	typeof useGetNotificationsQuery
>
export type GetNotificationsLazyQueryHookResult = ReturnType<
	typeof useGetNotificationsLazyQuery
>
export type GetNotificationsQueryResult = Apollo.QueryResult<
	Types.GetNotificationsQuery,
	Types.GetNotificationsQueryVariables
>
export const GetSessionCommentsForAdminDocument = gql`
	query GetSessionCommentsForAdmin {
		session_comments_for_admin {
			id
			timestamp
			created_at
			project_id
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
`

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
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionCommentsForAdminQuery,
		Types.GetSessionCommentsForAdminQueryVariables
	>(GetSessionCommentsForAdminDocument, baseOptions)
}
export function useGetSessionCommentsForAdminLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionCommentsForAdminQuery,
		Types.GetSessionCommentsForAdminQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionCommentsForAdminQuery,
		Types.GetSessionCommentsForAdminQueryVariables
	>(GetSessionCommentsForAdminDocument, baseOptions)
}
export type GetSessionCommentsForAdminQueryHookResult = ReturnType<
	typeof useGetSessionCommentsForAdminQuery
>
export type GetSessionCommentsForAdminLazyQueryHookResult = ReturnType<
	typeof useGetSessionCommentsForAdminLazyQuery
>
export type GetSessionCommentsForAdminQueryResult = Apollo.QueryResult<
	Types.GetSessionCommentsForAdminQuery,
	Types.GetSessionCommentsForAdminQueryVariables
>
export const IsSessionPendingDocument = gql`
	query isSessionPending($session_secure_id: String!) {
		isSessionPending(session_secure_id: $session_secure_id)
	}
`

/**
 * __useIsSessionPendingQuery__
 *
 * To run a query within a React component, call `useIsSessionPendingQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsSessionPendingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsSessionPendingQuery({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useIsSessionPendingQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.IsSessionPendingQuery,
		Types.IsSessionPendingQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.IsSessionPendingQuery,
		Types.IsSessionPendingQueryVariables
	>(IsSessionPendingDocument, baseOptions)
}
export function useIsSessionPendingLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.IsSessionPendingQuery,
		Types.IsSessionPendingQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.IsSessionPendingQuery,
		Types.IsSessionPendingQueryVariables
	>(IsSessionPendingDocument, baseOptions)
}
export type IsSessionPendingQueryHookResult = ReturnType<
	typeof useIsSessionPendingQuery
>
export type IsSessionPendingLazyQueryHookResult = ReturnType<
	typeof useIsSessionPendingLazyQuery
>
export type IsSessionPendingQueryResult = Apollo.QueryResult<
	Types.IsSessionPendingQuery,
	Types.IsSessionPendingQueryVariables
>
export const GetAccountsDocument = gql`
	query GetAccounts {
		accounts {
			id
			name
			session_count_cur
			view_count_cur
			session_count_prev
			view_count_prev
			session_count_prev_prev
			session_limit
			paid_prev
			paid_prev_prev
			email
			subscription_start
			plan_tier
			stripe_customer_id
			member_count
			member_limit
		}
	}
`

/**
 * __useGetAccountsQuery__
 *
 * To run a query within a React component, call `useGetAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAccountsQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetAccountsQuery,
		Types.GetAccountsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAccountsQuery,
		Types.GetAccountsQueryVariables
	>(GetAccountsDocument, baseOptions)
}
export function useGetAccountsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAccountsQuery,
		Types.GetAccountsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAccountsQuery,
		Types.GetAccountsQueryVariables
	>(GetAccountsDocument, baseOptions)
}
export type GetAccountsQueryHookResult = ReturnType<typeof useGetAccountsQuery>
export type GetAccountsLazyQueryHookResult = ReturnType<
	typeof useGetAccountsLazyQuery
>
export type GetAccountsQueryResult = Apollo.QueryResult<
	Types.GetAccountsQuery,
	Types.GetAccountsQueryVariables
>
export const GetAccountDetailsDocument = gql`
	query GetAccountDetails($workspace_id: ID!) {
		account_details(workspace_id: $workspace_id) {
			id
			name
			session_count_per_month {
				name
				count
			}
			session_count_per_day {
				name
				count
			}
			stripe_customer_id
			members {
				id
				name
				email
				last_active
			}
		}
	}
`

/**
 * __useGetAccountDetailsQuery__
 *
 * To run a query within a React component, call `useGetAccountDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAccountDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAccountDetailsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetAccountDetailsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetAccountDetailsQuery,
		Types.GetAccountDetailsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAccountDetailsQuery,
		Types.GetAccountDetailsQueryVariables
	>(GetAccountDetailsDocument, baseOptions)
}
export function useGetAccountDetailsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAccountDetailsQuery,
		Types.GetAccountDetailsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAccountDetailsQuery,
		Types.GetAccountDetailsQueryVariables
	>(GetAccountDetailsDocument, baseOptions)
}
export type GetAccountDetailsQueryHookResult = ReturnType<
	typeof useGetAccountDetailsQuery
>
export type GetAccountDetailsLazyQueryHookResult = ReturnType<
	typeof useGetAccountDetailsLazyQuery
>
export type GetAccountDetailsQueryResult = Apollo.QueryResult<
	Types.GetAccountDetailsQuery,
	Types.GetAccountDetailsQueryVariables
>
export const GetErrorCommentsDocument = gql`
	query GetErrorComments($error_group_secure_id: String!) {
		error_comments(error_group_secure_id: $error_group_secure_id) {
			id
			created_at
			updated_at
			text
			project_id
			author {
				id
				name
				email
				photo_url
			}
			attachments {
				integration_type
				external_id
				title
			}
			replies {
				id
				created_at
				updated_at
				author {
					id
					name
					email
					photo_url
				}
				text
			}
		}
	}
`

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
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *   },
 * });
 */
export function useGetErrorCommentsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorCommentsQuery,
		Types.GetErrorCommentsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorCommentsQuery,
		Types.GetErrorCommentsQueryVariables
	>(GetErrorCommentsDocument, baseOptions)
}
export function useGetErrorCommentsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorCommentsQuery,
		Types.GetErrorCommentsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorCommentsQuery,
		Types.GetErrorCommentsQueryVariables
	>(GetErrorCommentsDocument, baseOptions)
}
export type GetErrorCommentsQueryHookResult = ReturnType<
	typeof useGetErrorCommentsQuery
>
export type GetErrorCommentsLazyQueryHookResult = ReturnType<
	typeof useGetErrorCommentsLazyQuery
>
export type GetErrorCommentsQueryResult = Apollo.QueryResult<
	Types.GetErrorCommentsQuery,
	Types.GetErrorCommentsQueryVariables
>
export const GetEnhancedUserDetailsDocument = gql`
	query GetEnhancedUserDetails($session_secure_id: String!) {
		enhanced_user_details(session_secure_id: $session_secure_id) {
			id
			name
			bio
			avatar
			email
			socials {
				type
				link
			}
		}
	}
`

/**
 * __useGetEnhancedUserDetailsQuery__
 *
 * To run a query within a React component, call `useGetEnhancedUserDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEnhancedUserDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEnhancedUserDetailsQuery({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetEnhancedUserDetailsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetEnhancedUserDetailsQuery,
		Types.GetEnhancedUserDetailsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetEnhancedUserDetailsQuery,
		Types.GetEnhancedUserDetailsQueryVariables
	>(GetEnhancedUserDetailsDocument, baseOptions)
}
export function useGetEnhancedUserDetailsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetEnhancedUserDetailsQuery,
		Types.GetEnhancedUserDetailsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetEnhancedUserDetailsQuery,
		Types.GetEnhancedUserDetailsQueryVariables
	>(GetEnhancedUserDetailsDocument, baseOptions)
}
export type GetEnhancedUserDetailsQueryHookResult = ReturnType<
	typeof useGetEnhancedUserDetailsQuery
>
export type GetEnhancedUserDetailsLazyQueryHookResult = ReturnType<
	typeof useGetEnhancedUserDetailsLazyQuery
>
export type GetEnhancedUserDetailsQueryResult = Apollo.QueryResult<
	Types.GetEnhancedUserDetailsQuery,
	Types.GetEnhancedUserDetailsQueryVariables
>
export const GetOnboardingStepsDocument = gql`
	query GetOnboardingSteps($project_id: ID!, $admin_id: ID!) {
		workspace: workspace_for_project(project_id: $project_id) {
			id
			slack_channels
		}
		admins: workspace_admins_by_project_id(project_id: $project_id) {
			admin {
				id
			}
		}
		isIntegrated(project_id: $project_id)
		adminHasCreatedComment(admin_id: $admin_id)
		projectHasViewedASession(project_id: $project_id) {
			secure_id
		}
		admin {
			slack_im_channel_id
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      admin_id: // value for 'admin_id'
 *   },
 * });
 */
export function useGetOnboardingStepsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetOnboardingStepsQuery,
		Types.GetOnboardingStepsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetOnboardingStepsQuery,
		Types.GetOnboardingStepsQueryVariables
	>(GetOnboardingStepsDocument, baseOptions)
}
export function useGetOnboardingStepsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetOnboardingStepsQuery,
		Types.GetOnboardingStepsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetOnboardingStepsQuery,
		Types.GetOnboardingStepsQueryVariables
	>(GetOnboardingStepsDocument, baseOptions)
}
export type GetOnboardingStepsQueryHookResult = ReturnType<
	typeof useGetOnboardingStepsQuery
>
export type GetOnboardingStepsLazyQueryHookResult = ReturnType<
	typeof useGetOnboardingStepsLazyQuery
>
export type GetOnboardingStepsQueryResult = Apollo.QueryResult<
	Types.GetOnboardingStepsQuery,
	Types.GetOnboardingStepsQueryVariables
>
export const SendAdminWorkspaceInviteDocument = gql`
	mutation SendAdminWorkspaceInvite(
		$workspace_id: ID!
		$email: String!
		$base_url: String!
		$role: String!
	) {
		sendAdminWorkspaceInvite(
			workspace_id: $workspace_id
			email: $email
			base_url: $base_url
			role: $role
		)
	}
`
export type SendAdminWorkspaceInviteMutationFn = Apollo.MutationFunction<
	Types.SendAdminWorkspaceInviteMutation,
	Types.SendAdminWorkspaceInviteMutationVariables
>

/**
 * __useSendAdminWorkspaceInviteMutation__
 *
 * To run a mutation, you first call `useSendAdminWorkspaceInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendAdminWorkspaceInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendAdminWorkspaceInviteMutation, { data, loading, error }] = useSendAdminWorkspaceInviteMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      email: // value for 'email'
 *      base_url: // value for 'base_url'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useSendAdminWorkspaceInviteMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.SendAdminWorkspaceInviteMutation,
		Types.SendAdminWorkspaceInviteMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.SendAdminWorkspaceInviteMutation,
		Types.SendAdminWorkspaceInviteMutationVariables
	>(SendAdminWorkspaceInviteDocument, baseOptions)
}
export type SendAdminWorkspaceInviteMutationHookResult = ReturnType<
	typeof useSendAdminWorkspaceInviteMutation
>
export type SendAdminWorkspaceInviteMutationResult =
	Apollo.MutationResult<Types.SendAdminWorkspaceInviteMutation>
export type SendAdminWorkspaceInviteMutationOptions =
	Apollo.BaseMutationOptions<
		Types.SendAdminWorkspaceInviteMutation,
		Types.SendAdminWorkspaceInviteMutationVariables
	>
export const GetSessionIntervalsDocument = gql`
	query GetSessionIntervals($session_secure_id: String!) {
		session_intervals(session_secure_id: $session_secure_id) {
			start_time
			end_time
			active
			duration
		}
	}
`

/**
 * __useGetSessionIntervalsQuery__
 *
 * To run a query within a React component, call `useGetSessionIntervalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionIntervalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionIntervalsQuery({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetSessionIntervalsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionIntervalsQuery,
		Types.GetSessionIntervalsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionIntervalsQuery,
		Types.GetSessionIntervalsQueryVariables
	>(GetSessionIntervalsDocument, baseOptions)
}
export function useGetSessionIntervalsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionIntervalsQuery,
		Types.GetSessionIntervalsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionIntervalsQuery,
		Types.GetSessionIntervalsQueryVariables
	>(GetSessionIntervalsDocument, baseOptions)
}
export type GetSessionIntervalsQueryHookResult = ReturnType<
	typeof useGetSessionIntervalsQuery
>
export type GetSessionIntervalsLazyQueryHookResult = ReturnType<
	typeof useGetSessionIntervalsLazyQuery
>
export type GetSessionIntervalsQueryResult = Apollo.QueryResult<
	Types.GetSessionIntervalsQuery,
	Types.GetSessionIntervalsQueryVariables
>
export const GetTimelineIndicatorEventsDocument = gql`
	query GetTimelineIndicatorEvents($session_secure_id: String!) {
		timeline_indicator_events(session_secure_id: $session_secure_id) {
			timestamp
			data
			type
			sid
		}
	}
`

/**
 * __useGetTimelineIndicatorEventsQuery__
 *
 * To run a query within a React component, call `useGetTimelineIndicatorEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTimelineIndicatorEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTimelineIndicatorEventsQuery({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetTimelineIndicatorEventsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTimelineIndicatorEventsQuery,
		Types.GetTimelineIndicatorEventsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetTimelineIndicatorEventsQuery,
		Types.GetTimelineIndicatorEventsQueryVariables
	>(GetTimelineIndicatorEventsDocument, baseOptions)
}
export function useGetTimelineIndicatorEventsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTimelineIndicatorEventsQuery,
		Types.GetTimelineIndicatorEventsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTimelineIndicatorEventsQuery,
		Types.GetTimelineIndicatorEventsQueryVariables
	>(GetTimelineIndicatorEventsDocument, baseOptions)
}
export type GetTimelineIndicatorEventsQueryHookResult = ReturnType<
	typeof useGetTimelineIndicatorEventsQuery
>
export type GetTimelineIndicatorEventsLazyQueryHookResult = ReturnType<
	typeof useGetTimelineIndicatorEventsLazyQuery
>
export type GetTimelineIndicatorEventsQueryResult = Apollo.QueryResult<
	Types.GetTimelineIndicatorEventsQuery,
	Types.GetTimelineIndicatorEventsQueryVariables
>
export const GetFieldTypesDocument = gql`
	query GetFieldTypes($project_id: ID!) {
		field_types(project_id: $project_id) {
			type
			name
		}
	}
`

/**
 * __useGetFieldTypesQuery__
 *
 * To run a query within a React component, call `useGetFieldTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFieldTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFieldTypesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetFieldTypesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetFieldTypesQuery,
		Types.GetFieldTypesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetFieldTypesQuery,
		Types.GetFieldTypesQueryVariables
	>(GetFieldTypesDocument, baseOptions)
}
export function useGetFieldTypesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetFieldTypesQuery,
		Types.GetFieldTypesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetFieldTypesQuery,
		Types.GetFieldTypesQueryVariables
	>(GetFieldTypesDocument, baseOptions)
}
export type GetFieldTypesQueryHookResult = ReturnType<
	typeof useGetFieldTypesQuery
>
export type GetFieldTypesLazyQueryHookResult = ReturnType<
	typeof useGetFieldTypesLazyQuery
>
export type GetFieldTypesQueryResult = Apollo.QueryResult<
	Types.GetFieldTypesQuery,
	Types.GetFieldTypesQueryVariables
>
export const GetFieldsOpensearchDocument = gql`
	query GetFieldsOpensearch(
		$project_id: ID!
		$count: Int!
		$field_type: String!
		$field_name: String!
		$query: String!
	) {
		fields_opensearch(
			project_id: $project_id
			count: $count
			field_type: $field_type
			field_name: $field_name
			query: $query
		)
	}
`

/**
 * __useGetFieldsOpensearchQuery__
 *
 * To run a query within a React component, call `useGetFieldsOpensearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFieldsOpensearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFieldsOpensearchQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      field_type: // value for 'field_type'
 *      field_name: // value for 'field_name'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetFieldsOpensearchQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetFieldsOpensearchQuery,
		Types.GetFieldsOpensearchQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetFieldsOpensearchQuery,
		Types.GetFieldsOpensearchQueryVariables
	>(GetFieldsOpensearchDocument, baseOptions)
}
export function useGetFieldsOpensearchLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetFieldsOpensearchQuery,
		Types.GetFieldsOpensearchQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetFieldsOpensearchQuery,
		Types.GetFieldsOpensearchQueryVariables
	>(GetFieldsOpensearchDocument, baseOptions)
}
export type GetFieldsOpensearchQueryHookResult = ReturnType<
	typeof useGetFieldsOpensearchQuery
>
export type GetFieldsOpensearchLazyQueryHookResult = ReturnType<
	typeof useGetFieldsOpensearchLazyQuery
>
export type GetFieldsOpensearchQueryResult = Apollo.QueryResult<
	Types.GetFieldsOpensearchQuery,
	Types.GetFieldsOpensearchQueryVariables
>
export const GetQuickFieldsOpensearchDocument = gql`
	query GetQuickFieldsOpensearch(
		$project_id: ID!
		$count: Int!
		$query: String!
	) {
		quickFields_opensearch(
			project_id: $project_id
			count: $count
			query: $query
		) {
			type
			name
			value
		}
	}
`

/**
 * __useGetQuickFieldsOpensearchQuery__
 *
 * To run a query within a React component, call `useGetQuickFieldsOpensearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuickFieldsOpensearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuickFieldsOpensearchQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetQuickFieldsOpensearchQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetQuickFieldsOpensearchQuery,
		Types.GetQuickFieldsOpensearchQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetQuickFieldsOpensearchQuery,
		Types.GetQuickFieldsOpensearchQueryVariables
	>(GetQuickFieldsOpensearchDocument, baseOptions)
}
export function useGetQuickFieldsOpensearchLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetQuickFieldsOpensearchQuery,
		Types.GetQuickFieldsOpensearchQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetQuickFieldsOpensearchQuery,
		Types.GetQuickFieldsOpensearchQueryVariables
	>(GetQuickFieldsOpensearchDocument, baseOptions)
}
export type GetQuickFieldsOpensearchQueryHookResult = ReturnType<
	typeof useGetQuickFieldsOpensearchQuery
>
export type GetQuickFieldsOpensearchLazyQueryHookResult = ReturnType<
	typeof useGetQuickFieldsOpensearchLazyQuery
>
export type GetQuickFieldsOpensearchQueryResult = Apollo.QueryResult<
	Types.GetQuickFieldsOpensearchQuery,
	Types.GetQuickFieldsOpensearchQueryVariables
>
export const GetErrorFieldsOpensearchDocument = gql`
	query GetErrorFieldsOpensearch(
		$project_id: ID!
		$count: Int!
		$field_type: String!
		$field_name: String!
		$query: String!
	) {
		error_fields_opensearch(
			project_id: $project_id
			count: $count
			field_type: $field_type
			field_name: $field_name
			query: $query
		)
	}
`

/**
 * __useGetErrorFieldsOpensearchQuery__
 *
 * To run a query within a React component, call `useGetErrorFieldsOpensearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorFieldsOpensearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorFieldsOpensearchQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      field_type: // value for 'field_type'
 *      field_name: // value for 'field_name'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetErrorFieldsOpensearchQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorFieldsOpensearchQuery,
		Types.GetErrorFieldsOpensearchQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorFieldsOpensearchQuery,
		Types.GetErrorFieldsOpensearchQueryVariables
	>(GetErrorFieldsOpensearchDocument, baseOptions)
}
export function useGetErrorFieldsOpensearchLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorFieldsOpensearchQuery,
		Types.GetErrorFieldsOpensearchQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorFieldsOpensearchQuery,
		Types.GetErrorFieldsOpensearchQueryVariables
	>(GetErrorFieldsOpensearchDocument, baseOptions)
}
export type GetErrorFieldsOpensearchQueryHookResult = ReturnType<
	typeof useGetErrorFieldsOpensearchQuery
>
export type GetErrorFieldsOpensearchLazyQueryHookResult = ReturnType<
	typeof useGetErrorFieldsOpensearchLazyQuery
>
export type GetErrorFieldsOpensearchQueryResult = Apollo.QueryResult<
	Types.GetErrorFieldsOpensearchQuery,
	Types.GetErrorFieldsOpensearchQueryVariables
>
export const GetSessionsOpenSearchDocument = gql`
	query GetSessionsOpenSearch(
		$project_id: ID!
		$count: Int!
		$query: String!
		$sort_desc: Boolean!
		$page: Int
	) {
		sessions_opensearch(
			project_id: $project_id
			count: $count
			query: $query
			sort_desc: $sort_desc
			page: $page
		) {
			sessions {
				id
				secure_id
				client_id
				fingerprint
				identifier
				identified
				os_name
				os_version
				browser_name
				browser_version
				city
				state
				country
				postal
				created_at
				language
				length
				active_length
				enable_recording_network_contents
				viewed
				starred
				processed
				has_rage_clicks
				has_errors
				fields {
					name
					value
					type
					id
				}
				first_time
				user_properties
				event_counts
				last_user_interaction_time
			}
			totalCount
		}
	}
`

/**
 * __useGetSessionsOpenSearchQuery__
 *
 * To run a query within a React component, call `useGetSessionsOpenSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsOpenSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsOpenSearchQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      query: // value for 'query'
 *      sort_desc: // value for 'sort_desc'
 *      page: // value for 'page'
 *   },
 * });
 */
export function useGetSessionsOpenSearchQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionsOpenSearchQuery,
		Types.GetSessionsOpenSearchQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionsOpenSearchQuery,
		Types.GetSessionsOpenSearchQueryVariables
	>(GetSessionsOpenSearchDocument, baseOptions)
}
export function useGetSessionsOpenSearchLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionsOpenSearchQuery,
		Types.GetSessionsOpenSearchQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionsOpenSearchQuery,
		Types.GetSessionsOpenSearchQueryVariables
	>(GetSessionsOpenSearchDocument, baseOptions)
}
export type GetSessionsOpenSearchQueryHookResult = ReturnType<
	typeof useGetSessionsOpenSearchQuery
>
export type GetSessionsOpenSearchLazyQueryHookResult = ReturnType<
	typeof useGetSessionsOpenSearchLazyQuery
>
export type GetSessionsOpenSearchQueryResult = Apollo.QueryResult<
	Types.GetSessionsOpenSearchQuery,
	Types.GetSessionsOpenSearchQueryVariables
>
export const GetSessionsHistogramDocument = gql`
	query GetSessionsHistogram(
		$project_id: ID!
		$query: String!
		$histogram_options: DateHistogramOptions!
	) {
		sessions_histogram(
			project_id: $project_id
			query: $query
			histogram_options: $histogram_options
		) {
			bucket_times
			sessions_without_errors
			sessions_with_errors
			total_sessions
		}
	}
`

/**
 * __useGetSessionsHistogramQuery__
 *
 * To run a query within a React component, call `useGetSessionsHistogramQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsHistogramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsHistogramQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *      histogram_options: // value for 'histogram_options'
 *   },
 * });
 */
export function useGetSessionsHistogramQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionsHistogramQuery,
		Types.GetSessionsHistogramQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionsHistogramQuery,
		Types.GetSessionsHistogramQueryVariables
	>(GetSessionsHistogramDocument, baseOptions)
}
export function useGetSessionsHistogramLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionsHistogramQuery,
		Types.GetSessionsHistogramQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionsHistogramQuery,
		Types.GetSessionsHistogramQueryVariables
	>(GetSessionsHistogramDocument, baseOptions)
}
export type GetSessionsHistogramQueryHookResult = ReturnType<
	typeof useGetSessionsHistogramQuery
>
export type GetSessionsHistogramLazyQueryHookResult = ReturnType<
	typeof useGetSessionsHistogramLazyQuery
>
export type GetSessionsHistogramQueryResult = Apollo.QueryResult<
	Types.GetSessionsHistogramQuery,
	Types.GetSessionsHistogramQueryVariables
>
export const GetErrorGroupsOpenSearchDocument = gql`
	query GetErrorGroupsOpenSearch(
		$project_id: ID!
		$count: Int!
		$query: String!
		$page: Int
	) {
		error_groups_opensearch(
			project_id: $project_id
			count: $count
			query: $query
			page: $page
		) {
			error_groups {
				created_at
				id
				secure_id
				type
				event
				state
				state
				environments
				stack_trace
				structured_stack_trace {
					fileName
					lineNumber
					functionName
					columnNumber
				}
				error_frequency
			}
			totalCount
		}
	}
`

/**
 * __useGetErrorGroupsOpenSearchQuery__
 *
 * To run a query within a React component, call `useGetErrorGroupsOpenSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorGroupsOpenSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorGroupsOpenSearchQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      query: // value for 'query'
 *      page: // value for 'page'
 *   },
 * });
 */
export function useGetErrorGroupsOpenSearchQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorGroupsOpenSearchQuery,
		Types.GetErrorGroupsOpenSearchQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorGroupsOpenSearchQuery,
		Types.GetErrorGroupsOpenSearchQueryVariables
	>(GetErrorGroupsOpenSearchDocument, baseOptions)
}
export function useGetErrorGroupsOpenSearchLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorGroupsOpenSearchQuery,
		Types.GetErrorGroupsOpenSearchQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorGroupsOpenSearchQuery,
		Types.GetErrorGroupsOpenSearchQueryVariables
	>(GetErrorGroupsOpenSearchDocument, baseOptions)
}
export type GetErrorGroupsOpenSearchQueryHookResult = ReturnType<
	typeof useGetErrorGroupsOpenSearchQuery
>
export type GetErrorGroupsOpenSearchLazyQueryHookResult = ReturnType<
	typeof useGetErrorGroupsOpenSearchLazyQuery
>
export type GetErrorGroupsOpenSearchQueryResult = Apollo.QueryResult<
	Types.GetErrorGroupsOpenSearchQuery,
	Types.GetErrorGroupsOpenSearchQueryVariables
>
export const GetErrorsHistogramDocument = gql`
	query GetErrorsHistogram(
		$project_id: ID!
		$query: String!
		$histogram_options: DateHistogramOptions!
	) {
		errors_histogram(
			project_id: $project_id
			query: $query
			histogram_options: $histogram_options
		) {
			bucket_times
			error_objects
		}
	}
`

/**
 * __useGetErrorsHistogramQuery__
 *
 * To run a query within a React component, call `useGetErrorsHistogramQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorsHistogramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorsHistogramQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *      histogram_options: // value for 'histogram_options'
 *   },
 * });
 */
export function useGetErrorsHistogramQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorsHistogramQuery,
		Types.GetErrorsHistogramQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorsHistogramQuery,
		Types.GetErrorsHistogramQueryVariables
	>(GetErrorsHistogramDocument, baseOptions)
}
export function useGetErrorsHistogramLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorsHistogramQuery,
		Types.GetErrorsHistogramQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorsHistogramQuery,
		Types.GetErrorsHistogramQueryVariables
	>(GetErrorsHistogramDocument, baseOptions)
}
export type GetErrorsHistogramQueryHookResult = ReturnType<
	typeof useGetErrorsHistogramQuery
>
export type GetErrorsHistogramLazyQueryHookResult = ReturnType<
	typeof useGetErrorsHistogramLazyQuery
>
export type GetErrorsHistogramQueryResult = Apollo.QueryResult<
	Types.GetErrorsHistogramQuery,
	Types.GetErrorsHistogramQueryVariables
>
export const GetProjectsDocument = gql`
	query GetProjects {
		projects {
			id
			name
			workspace_id
		}
	}
`

/**
 * __useGetProjectsQuery__
 *
 * To run a query within a React component, call `useGetProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProjectsQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetProjectsQuery,
		Types.GetProjectsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectsQuery,
		Types.GetProjectsQueryVariables
	>(GetProjectsDocument, baseOptions)
}
export function useGetProjectsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectsQuery,
		Types.GetProjectsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectsQuery,
		Types.GetProjectsQueryVariables
	>(GetProjectsDocument, baseOptions)
}
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>
export type GetProjectsLazyQueryHookResult = ReturnType<
	typeof useGetProjectsLazyQuery
>
export type GetProjectsQueryResult = Apollo.QueryResult<
	Types.GetProjectsQuery,
	Types.GetProjectsQueryVariables
>
export const GetWorkspaceDocument = gql`
	query GetWorkspace($id: ID!) {
		workspace(id: $id) {
			id
			name
			secret
			plan_tier
			unlimited_members
			clearbit_enabled
			projects {
				id
				name
			}
		}
	}
`

/**
 * __useGetWorkspaceQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetWorkspaceQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceQuery,
		Types.GetWorkspaceQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceQuery,
		Types.GetWorkspaceQueryVariables
	>(GetWorkspaceDocument, baseOptions)
}
export function useGetWorkspaceLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceQuery,
		Types.GetWorkspaceQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceQuery,
		Types.GetWorkspaceQueryVariables
	>(GetWorkspaceDocument, baseOptions)
}
export type GetWorkspaceQueryHookResult = ReturnType<
	typeof useGetWorkspaceQuery
>
export type GetWorkspaceLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceLazyQuery
>
export type GetWorkspaceQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceQuery,
	Types.GetWorkspaceQueryVariables
>
export const GetWorkspacesDocument = gql`
	query GetWorkspaces {
		workspaces {
			id
			name
		}
		joinable_workspaces {
			id
			name
			projects {
				id
			}
		}
	}
`

/**
 * __useGetWorkspacesQuery__
 *
 * To run a query within a React component, call `useGetWorkspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWorkspacesQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetWorkspacesQuery,
		Types.GetWorkspacesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspacesQuery,
		Types.GetWorkspacesQueryVariables
	>(GetWorkspacesDocument, baseOptions)
}
export function useGetWorkspacesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspacesQuery,
		Types.GetWorkspacesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspacesQuery,
		Types.GetWorkspacesQueryVariables
	>(GetWorkspacesDocument, baseOptions)
}
export type GetWorkspacesQueryHookResult = ReturnType<
	typeof useGetWorkspacesQuery
>
export type GetWorkspacesLazyQueryHookResult = ReturnType<
	typeof useGetWorkspacesLazyQuery
>
export type GetWorkspacesQueryResult = Apollo.QueryResult<
	Types.GetWorkspacesQuery,
	Types.GetWorkspacesQueryVariables
>
export const GetWorkspacesCountDocument = gql`
	query GetWorkspacesCount {
		workspaces_count
	}
`

/**
 * __useGetWorkspacesCountQuery__
 *
 * To run a query within a React component, call `useGetWorkspacesCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspacesCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspacesCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWorkspacesCountQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetWorkspacesCountQuery,
		Types.GetWorkspacesCountQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspacesCountQuery,
		Types.GetWorkspacesCountQueryVariables
	>(GetWorkspacesCountDocument, baseOptions)
}
export function useGetWorkspacesCountLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspacesCountQuery,
		Types.GetWorkspacesCountQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspacesCountQuery,
		Types.GetWorkspacesCountQueryVariables
	>(GetWorkspacesCountDocument, baseOptions)
}
export type GetWorkspacesCountQueryHookResult = ReturnType<
	typeof useGetWorkspacesCountQuery
>
export type GetWorkspacesCountLazyQueryHookResult = ReturnType<
	typeof useGetWorkspacesCountLazyQuery
>
export type GetWorkspacesCountQueryResult = Apollo.QueryResult<
	Types.GetWorkspacesCountQuery,
	Types.GetWorkspacesCountQueryVariables
>
export const GetProjectsAndWorkspacesDocument = gql`
	query GetProjectsAndWorkspaces {
		projects {
			id
			name
		}
		workspaces {
			id
			name
		}
	}
`

/**
 * __useGetProjectsAndWorkspacesQuery__
 *
 * To run a query within a React component, call `useGetProjectsAndWorkspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectsAndWorkspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectsAndWorkspacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProjectsAndWorkspacesQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetProjectsAndWorkspacesQuery,
		Types.GetProjectsAndWorkspacesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectsAndWorkspacesQuery,
		Types.GetProjectsAndWorkspacesQueryVariables
	>(GetProjectsAndWorkspacesDocument, baseOptions)
}
export function useGetProjectsAndWorkspacesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectsAndWorkspacesQuery,
		Types.GetProjectsAndWorkspacesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectsAndWorkspacesQuery,
		Types.GetProjectsAndWorkspacesQueryVariables
	>(GetProjectsAndWorkspacesDocument, baseOptions)
}
export type GetProjectsAndWorkspacesQueryHookResult = ReturnType<
	typeof useGetProjectsAndWorkspacesQuery
>
export type GetProjectsAndWorkspacesLazyQueryHookResult = ReturnType<
	typeof useGetProjectsAndWorkspacesLazyQuery
>
export type GetProjectsAndWorkspacesQueryResult = Apollo.QueryResult<
	Types.GetProjectsAndWorkspacesQuery,
	Types.GetProjectsAndWorkspacesQueryVariables
>
export const GetProjectOrWorkspaceDocument = gql`
	query GetProjectOrWorkspace(
		$project_id: ID!
		$workspace_id: ID!
		$is_workspace: Boolean!
	) {
		project(id: $project_id) @skip(if: $is_workspace) {
			id
			name
			billing_email
		}
		workspace(id: $workspace_id) @include(if: $is_workspace) {
			id
			name
		}
	}
`

/**
 * __useGetProjectOrWorkspaceQuery__
 *
 * To run a query within a React component, call `useGetProjectOrWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectOrWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectOrWorkspaceQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      workspace_id: // value for 'workspace_id'
 *      is_workspace: // value for 'is_workspace'
 *   },
 * });
 */
export function useGetProjectOrWorkspaceQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetProjectOrWorkspaceQuery,
		Types.GetProjectOrWorkspaceQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectOrWorkspaceQuery,
		Types.GetProjectOrWorkspaceQueryVariables
	>(GetProjectOrWorkspaceDocument, baseOptions)
}
export function useGetProjectOrWorkspaceLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectOrWorkspaceQuery,
		Types.GetProjectOrWorkspaceQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectOrWorkspaceQuery,
		Types.GetProjectOrWorkspaceQueryVariables
	>(GetProjectOrWorkspaceDocument, baseOptions)
}
export type GetProjectOrWorkspaceQueryHookResult = ReturnType<
	typeof useGetProjectOrWorkspaceQuery
>
export type GetProjectOrWorkspaceLazyQueryHookResult = ReturnType<
	typeof useGetProjectOrWorkspaceLazyQuery
>
export type GetProjectOrWorkspaceQueryResult = Apollo.QueryResult<
	Types.GetProjectOrWorkspaceQuery,
	Types.GetProjectOrWorkspaceQueryVariables
>
export const GetProjectDropdownOptionsDocument = gql`
	query GetProjectDropdownOptions($project_id: ID!) {
		project(id: $project_id) {
			id
			name
			verbose_id
			billing_email
			secret
			workspace_id
		}
		workspace: workspace_for_project(project_id: $project_id) {
			id
			name
			projects {
				id
				name
			}
		}
		workspaces {
			id
			name
		}
		joinable_workspaces {
			id
			name
			projects {
				id
			}
		}
	}
`

/**
 * __useGetProjectDropdownOptionsQuery__
 *
 * To run a query within a React component, call `useGetProjectDropdownOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectDropdownOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectDropdownOptionsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetProjectDropdownOptionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetProjectDropdownOptionsQuery,
		Types.GetProjectDropdownOptionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectDropdownOptionsQuery,
		Types.GetProjectDropdownOptionsQueryVariables
	>(GetProjectDropdownOptionsDocument, baseOptions)
}
export function useGetProjectDropdownOptionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectDropdownOptionsQuery,
		Types.GetProjectDropdownOptionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectDropdownOptionsQuery,
		Types.GetProjectDropdownOptionsQueryVariables
	>(GetProjectDropdownOptionsDocument, baseOptions)
}
export type GetProjectDropdownOptionsQueryHookResult = ReturnType<
	typeof useGetProjectDropdownOptionsQuery
>
export type GetProjectDropdownOptionsLazyQueryHookResult = ReturnType<
	typeof useGetProjectDropdownOptionsLazyQuery
>
export type GetProjectDropdownOptionsQueryResult = Apollo.QueryResult<
	Types.GetProjectDropdownOptionsQuery,
	Types.GetProjectDropdownOptionsQueryVariables
>
export const GetWorkspaceDropdownOptionsDocument = gql`
	query GetWorkspaceDropdownOptions($workspace_id: ID!) {
		workspace(id: $workspace_id) {
			id
			name
			projects {
				id
				name
			}
		}
		workspaces {
			id
			name
		}
		joinable_workspaces {
			id
			name
			projects {
				id
			}
		}
	}
`

/**
 * __useGetWorkspaceDropdownOptionsQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceDropdownOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceDropdownOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceDropdownOptionsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetWorkspaceDropdownOptionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceDropdownOptionsQuery,
		Types.GetWorkspaceDropdownOptionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceDropdownOptionsQuery,
		Types.GetWorkspaceDropdownOptionsQueryVariables
	>(GetWorkspaceDropdownOptionsDocument, baseOptions)
}
export function useGetWorkspaceDropdownOptionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceDropdownOptionsQuery,
		Types.GetWorkspaceDropdownOptionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceDropdownOptionsQuery,
		Types.GetWorkspaceDropdownOptionsQueryVariables
	>(GetWorkspaceDropdownOptionsDocument, baseOptions)
}
export type GetWorkspaceDropdownOptionsQueryHookResult = ReturnType<
	typeof useGetWorkspaceDropdownOptionsQuery
>
export type GetWorkspaceDropdownOptionsLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceDropdownOptionsLazyQuery
>
export type GetWorkspaceDropdownOptionsQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceDropdownOptionsQuery,
	Types.GetWorkspaceDropdownOptionsQueryVariables
>
export const GetAdminDocument = gql`
	query GetAdmin {
		admin {
			id
			uid
			name
			email
			phone
			photo_url
			slack_im_channel_id
			email_verified
			user_defined_role
			about_you_details_filled
		}
	}
`

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
	>,
) {
	return Apollo.useQuery<Types.GetAdminQuery, Types.GetAdminQueryVariables>(
		GetAdminDocument,
		baseOptions,
	)
}
export function useGetAdminLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAdminQuery,
		Types.GetAdminQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAdminQuery,
		Types.GetAdminQueryVariables
	>(GetAdminDocument, baseOptions)
}
export type GetAdminQueryHookResult = ReturnType<typeof useGetAdminQuery>
export type GetAdminLazyQueryHookResult = ReturnType<
	typeof useGetAdminLazyQuery
>
export type GetAdminQueryResult = Apollo.QueryResult<
	Types.GetAdminQuery,
	Types.GetAdminQueryVariables
>
export const GetAdminRoleDocument = gql`
	query GetAdminRole($workspace_id: ID!) {
		admin_role(workspace_id: $workspace_id) {
			admin {
				id
				uid
				name
				email
				phone
				photo_url
				slack_im_channel_id
				email_verified
				user_defined_role
				about_you_details_filled
			}
			role
		}
	}
`

/**
 * __useGetAdminRoleQuery__
 *
 * To run a query within a React component, call `useGetAdminRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminRoleQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetAdminRoleQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetAdminRoleQuery,
		Types.GetAdminRoleQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAdminRoleQuery,
		Types.GetAdminRoleQueryVariables
	>(GetAdminRoleDocument, baseOptions)
}
export function useGetAdminRoleLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAdminRoleQuery,
		Types.GetAdminRoleQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAdminRoleQuery,
		Types.GetAdminRoleQueryVariables
	>(GetAdminRoleDocument, baseOptions)
}
export type GetAdminRoleQueryHookResult = ReturnType<
	typeof useGetAdminRoleQuery
>
export type GetAdminRoleLazyQueryHookResult = ReturnType<
	typeof useGetAdminRoleLazyQuery
>
export type GetAdminRoleQueryResult = Apollo.QueryResult<
	Types.GetAdminRoleQuery,
	Types.GetAdminRoleQueryVariables
>
export const GetAdminRoleByProjectDocument = gql`
	query GetAdminRoleByProject($project_id: ID!) {
		admin_role_by_project(project_id: $project_id) {
			admin {
				id
				uid
				name
				email
				phone
				photo_url
				slack_im_channel_id
				email_verified
				user_defined_role
				about_you_details_filled
			}
			role
		}
	}
`

/**
 * __useGetAdminRoleByProjectQuery__
 *
 * To run a query within a React component, call `useGetAdminRoleByProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminRoleByProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminRoleByProjectQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetAdminRoleByProjectQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetAdminRoleByProjectQuery,
		Types.GetAdminRoleByProjectQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAdminRoleByProjectQuery,
		Types.GetAdminRoleByProjectQueryVariables
	>(GetAdminRoleByProjectDocument, baseOptions)
}
export function useGetAdminRoleByProjectLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAdminRoleByProjectQuery,
		Types.GetAdminRoleByProjectQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAdminRoleByProjectQuery,
		Types.GetAdminRoleByProjectQueryVariables
	>(GetAdminRoleByProjectDocument, baseOptions)
}
export type GetAdminRoleByProjectQueryHookResult = ReturnType<
	typeof useGetAdminRoleByProjectQuery
>
export type GetAdminRoleByProjectLazyQueryHookResult = ReturnType<
	typeof useGetAdminRoleByProjectLazyQuery
>
export type GetAdminRoleByProjectQueryResult = Apollo.QueryResult<
	Types.GetAdminRoleByProjectQuery,
	Types.GetAdminRoleByProjectQueryVariables
>
export const GetAdminAboutYouDocument = gql`
	query GetAdminAboutYou {
		admin {
			id
			name
			user_defined_role
			referral
		}
	}
`

/**
 * __useGetAdminAboutYouQuery__
 *
 * To run a query within a React component, call `useGetAdminAboutYouQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminAboutYouQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminAboutYouQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAdminAboutYouQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetAdminAboutYouQuery,
		Types.GetAdminAboutYouQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAdminAboutYouQuery,
		Types.GetAdminAboutYouQueryVariables
	>(GetAdminAboutYouDocument, baseOptions)
}
export function useGetAdminAboutYouLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAdminAboutYouQuery,
		Types.GetAdminAboutYouQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAdminAboutYouQuery,
		Types.GetAdminAboutYouQueryVariables
	>(GetAdminAboutYouDocument, baseOptions)
}
export type GetAdminAboutYouQueryHookResult = ReturnType<
	typeof useGetAdminAboutYouQuery
>
export type GetAdminAboutYouLazyQueryHookResult = ReturnType<
	typeof useGetAdminAboutYouLazyQuery
>
export type GetAdminAboutYouQueryResult = Apollo.QueryResult<
	Types.GetAdminAboutYouQuery,
	Types.GetAdminAboutYouQueryVariables
>
export const GetProjectDocument = gql`
	query GetProject($id: ID!) {
		project(id: $id) {
			id
			name
			verbose_id
			billing_email
			excluded_users
			error_json_paths
			rage_click_window_seconds
			rage_click_radius_pixels
			rage_click_count
			backend_domains
			secret
		}
		workspace: workspace_for_project(project_id: $id) {
			id
			slack_webhook_channel
		}
	}
`

/**
 * __useGetProjectQuery__
 *
 * To run a query within a React component, call `useGetProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetProjectQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetProjectQuery,
		Types.GetProjectQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectQuery,
		Types.GetProjectQueryVariables
	>(GetProjectDocument, baseOptions)
}
export function useGetProjectLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectQuery,
		Types.GetProjectQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectQuery,
		Types.GetProjectQueryVariables
	>(GetProjectDocument, baseOptions)
}
export type GetProjectQueryHookResult = ReturnType<typeof useGetProjectQuery>
export type GetProjectLazyQueryHookResult = ReturnType<
	typeof useGetProjectLazyQuery
>
export type GetProjectQueryResult = Apollo.QueryResult<
	Types.GetProjectQuery,
	Types.GetProjectQueryVariables
>
export const GetBillingDetailsForProjectDocument = gql`
	query GetBillingDetailsForProject($project_id: ID!) {
		billingDetailsForProject(project_id: $project_id) {
			plan {
				type
				quota
				interval
				membersLimit
			}
			meter
			membersMeter
			sessionsOutOfQuota
		}
		workspace_for_project(project_id: $project_id) {
			id
			trial_end_date
			billing_period_end
			next_invoice_date
			allow_meter_overage
			eligible_for_trial_extension
			trial_extension_enabled
		}
	}
`

/**
 * __useGetBillingDetailsForProjectQuery__
 *
 * To run a query within a React component, call `useGetBillingDetailsForProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBillingDetailsForProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBillingDetailsForProjectQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetBillingDetailsForProjectQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetBillingDetailsForProjectQuery,
		Types.GetBillingDetailsForProjectQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetBillingDetailsForProjectQuery,
		Types.GetBillingDetailsForProjectQueryVariables
	>(GetBillingDetailsForProjectDocument, baseOptions)
}
export function useGetBillingDetailsForProjectLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetBillingDetailsForProjectQuery,
		Types.GetBillingDetailsForProjectQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetBillingDetailsForProjectQuery,
		Types.GetBillingDetailsForProjectQueryVariables
	>(GetBillingDetailsForProjectDocument, baseOptions)
}
export type GetBillingDetailsForProjectQueryHookResult = ReturnType<
	typeof useGetBillingDetailsForProjectQuery
>
export type GetBillingDetailsForProjectLazyQueryHookResult = ReturnType<
	typeof useGetBillingDetailsForProjectLazyQuery
>
export type GetBillingDetailsForProjectQueryResult = Apollo.QueryResult<
	Types.GetBillingDetailsForProjectQuery,
	Types.GetBillingDetailsForProjectQueryVariables
>
export const GetBillingDetailsDocument = gql`
	query GetBillingDetails($workspace_id: ID!) {
		billingDetails(workspace_id: $workspace_id) {
			plan {
				type
				quota
				interval
				membersLimit
			}
			meter
			membersMeter
		}
		workspace(id: $workspace_id) {
			id
			trial_end_date
			billing_period_end
			next_invoice_date
			allow_meter_overage
			eligible_for_trial_extension
		}
	}
`

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
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetBillingDetailsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetBillingDetailsQuery,
		Types.GetBillingDetailsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetBillingDetailsQuery,
		Types.GetBillingDetailsQueryVariables
	>(GetBillingDetailsDocument, baseOptions)
}
export function useGetBillingDetailsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetBillingDetailsQuery,
		Types.GetBillingDetailsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetBillingDetailsQuery,
		Types.GetBillingDetailsQueryVariables
	>(GetBillingDetailsDocument, baseOptions)
}
export type GetBillingDetailsQueryHookResult = ReturnType<
	typeof useGetBillingDetailsQuery
>
export type GetBillingDetailsLazyQueryHookResult = ReturnType<
	typeof useGetBillingDetailsLazyQuery
>
export type GetBillingDetailsQueryResult = Apollo.QueryResult<
	Types.GetBillingDetailsQuery,
	Types.GetBillingDetailsQueryVariables
>
export const GetSubscriptionDetailsDocument = gql`
	query GetSubscriptionDetails($workspace_id: ID!) {
		subscription_details(workspace_id: $workspace_id) {
			baseAmount
			discountAmount
			discountPercent
			lastInvoice {
				amountDue
				amountPaid
				attemptCount
				date
				url
				status
			}
		}
	}
`

/**
 * __useGetSubscriptionDetailsQuery__
 *
 * To run a query within a React component, call `useGetSubscriptionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubscriptionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubscriptionDetailsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetSubscriptionDetailsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSubscriptionDetailsQuery,
		Types.GetSubscriptionDetailsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSubscriptionDetailsQuery,
		Types.GetSubscriptionDetailsQueryVariables
	>(GetSubscriptionDetailsDocument, baseOptions)
}
export function useGetSubscriptionDetailsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSubscriptionDetailsQuery,
		Types.GetSubscriptionDetailsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSubscriptionDetailsQuery,
		Types.GetSubscriptionDetailsQueryVariables
	>(GetSubscriptionDetailsDocument, baseOptions)
}
export type GetSubscriptionDetailsQueryHookResult = ReturnType<
	typeof useGetSubscriptionDetailsQuery
>
export type GetSubscriptionDetailsLazyQueryHookResult = ReturnType<
	typeof useGetSubscriptionDetailsLazyQuery
>
export type GetSubscriptionDetailsQueryResult = Apollo.QueryResult<
	Types.GetSubscriptionDetailsQuery,
	Types.GetSubscriptionDetailsQueryVariables
>
export const GetErrorGroupDocument = gql`
	query GetErrorGroup($secure_id: String!) {
		error_group(secure_id: $secure_id) {
			created_at
			id
			secure_id
			type
			project_id
			event
			state
			structured_stack_trace {
				fileName
				lineNumber
				functionName
				columnNumber
				lineContent
				linesBefore
				linesAfter
				error
			}
			mapped_stack_trace
			stack_trace
			fields {
				name
				value
			}
			error_frequency
			is_public
		}
	}
`

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
 *      secure_id: // value for 'secure_id'
 *   },
 * });
 */
export function useGetErrorGroupQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorGroupQuery,
		Types.GetErrorGroupQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorGroupQuery,
		Types.GetErrorGroupQueryVariables
	>(GetErrorGroupDocument, baseOptions)
}
export function useGetErrorGroupLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorGroupQuery,
		Types.GetErrorGroupQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorGroupQuery,
		Types.GetErrorGroupQueryVariables
	>(GetErrorGroupDocument, baseOptions)
}
export type GetErrorGroupQueryHookResult = ReturnType<
	typeof useGetErrorGroupQuery
>
export type GetErrorGroupLazyQueryHookResult = ReturnType<
	typeof useGetErrorGroupLazyQuery
>
export type GetErrorGroupQueryResult = Apollo.QueryResult<
	Types.GetErrorGroupQuery,
	Types.GetErrorGroupQueryVariables
>
export const GetRecentErrorsDocument = gql`
	query GetRecentErrors($secure_id: String!) {
		error_group(secure_id: $secure_id) {
			secure_id
			metadata_log {
				error_id
				session_secure_id
				environment
				timestamp
				os
				browser
				visited_url
				fingerprint
				identifier
				user_properties
				request_id
				payload
			}
		}
	}
`

/**
 * __useGetRecentErrorsQuery__
 *
 * To run a query within a React component, call `useGetRecentErrorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentErrorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentErrorsQuery({
 *   variables: {
 *      secure_id: // value for 'secure_id'
 *   },
 * });
 */
export function useGetRecentErrorsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetRecentErrorsQuery,
		Types.GetRecentErrorsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetRecentErrorsQuery,
		Types.GetRecentErrorsQueryVariables
	>(GetRecentErrorsDocument, baseOptions)
}
export function useGetRecentErrorsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetRecentErrorsQuery,
		Types.GetRecentErrorsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetRecentErrorsQuery,
		Types.GetRecentErrorsQueryVariables
	>(GetRecentErrorsDocument, baseOptions)
}
export type GetRecentErrorsQueryHookResult = ReturnType<
	typeof useGetRecentErrorsQuery
>
export type GetRecentErrorsLazyQueryHookResult = ReturnType<
	typeof useGetRecentErrorsLazyQuery
>
export type GetRecentErrorsQueryResult = Apollo.QueryResult<
	Types.GetRecentErrorsQuery,
	Types.GetRecentErrorsQueryVariables
>
export const GetMessagesDocument = gql`
	query GetMessages($session_secure_id: String!) {
		messages(session_secure_id: $session_secure_id)
	}
`

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
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetMessagesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetMessagesQuery,
		Types.GetMessagesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetMessagesQuery,
		Types.GetMessagesQueryVariables
	>(GetMessagesDocument, baseOptions)
}
export function useGetMessagesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetMessagesQuery,
		Types.GetMessagesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetMessagesQuery,
		Types.GetMessagesQueryVariables
	>(GetMessagesDocument, baseOptions)
}
export type GetMessagesQueryHookResult = ReturnType<typeof useGetMessagesQuery>
export type GetMessagesLazyQueryHookResult = ReturnType<
	typeof useGetMessagesLazyQuery
>
export type GetMessagesQueryResult = Apollo.QueryResult<
	Types.GetMessagesQuery,
	Types.GetMessagesQueryVariables
>
export const GetResourcesDocument = gql`
	query GetResources($session_secure_id: String!) {
		resources(session_secure_id: $session_secure_id)
	}
`

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
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetResourcesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetResourcesQuery,
		Types.GetResourcesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetResourcesQuery,
		Types.GetResourcesQueryVariables
	>(GetResourcesDocument, baseOptions)
}
export function useGetResourcesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetResourcesQuery,
		Types.GetResourcesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetResourcesQuery,
		Types.GetResourcesQueryVariables
	>(GetResourcesDocument, baseOptions)
}
export type GetResourcesQueryHookResult = ReturnType<
	typeof useGetResourcesQuery
>
export type GetResourcesLazyQueryHookResult = ReturnType<
	typeof useGetResourcesLazyQuery
>
export type GetResourcesQueryResult = Apollo.QueryResult<
	Types.GetResourcesQuery,
	Types.GetResourcesQueryVariables
>
export const GetFieldSuggestionDocument = gql`
	query GetFieldSuggestion(
		$project_id: ID!
		$name: String!
		$query: String!
	) {
		field_suggestion(project_id: $project_id, name: $name, query: $query) {
			name
			value
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetFieldSuggestionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetFieldSuggestionQuery,
		Types.GetFieldSuggestionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetFieldSuggestionQuery,
		Types.GetFieldSuggestionQueryVariables
	>(GetFieldSuggestionDocument, baseOptions)
}
export function useGetFieldSuggestionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetFieldSuggestionQuery,
		Types.GetFieldSuggestionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetFieldSuggestionQuery,
		Types.GetFieldSuggestionQueryVariables
	>(GetFieldSuggestionDocument, baseOptions)
}
export type GetFieldSuggestionQueryHookResult = ReturnType<
	typeof useGetFieldSuggestionQuery
>
export type GetFieldSuggestionLazyQueryHookResult = ReturnType<
	typeof useGetFieldSuggestionLazyQuery
>
export type GetFieldSuggestionQueryResult = Apollo.QueryResult<
	Types.GetFieldSuggestionQuery,
	Types.GetFieldSuggestionQueryVariables
>
export const GetEnvironmentsDocument = gql`
	query GetEnvironments($project_id: ID!) {
		environment_suggestion(project_id: $project_id) {
			name
			value
		}
	}
`

/**
 * __useGetEnvironmentsQuery__
 *
 * To run a query within a React component, call `useGetEnvironmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEnvironmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEnvironmentsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetEnvironmentsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetEnvironmentsQuery,
		Types.GetEnvironmentsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetEnvironmentsQuery,
		Types.GetEnvironmentsQueryVariables
	>(GetEnvironmentsDocument, baseOptions)
}
export function useGetEnvironmentsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetEnvironmentsQuery,
		Types.GetEnvironmentsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetEnvironmentsQuery,
		Types.GetEnvironmentsQueryVariables
	>(GetEnvironmentsDocument, baseOptions)
}
export type GetEnvironmentsQueryHookResult = ReturnType<
	typeof useGetEnvironmentsQuery
>
export type GetEnvironmentsLazyQueryHookResult = ReturnType<
	typeof useGetEnvironmentsLazyQuery
>
export type GetEnvironmentsQueryResult = Apollo.QueryResult<
	Types.GetEnvironmentsQuery,
	Types.GetEnvironmentsQueryVariables
>
export const GetAppVersionsDocument = gql`
	query GetAppVersions($project_id: ID!) {
		app_version_suggestion(project_id: $project_id)
	}
`

/**
 * __useGetAppVersionsQuery__
 *
 * To run a query within a React component, call `useGetAppVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppVersionsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetAppVersionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetAppVersionsQuery,
		Types.GetAppVersionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAppVersionsQuery,
		Types.GetAppVersionsQueryVariables
	>(GetAppVersionsDocument, baseOptions)
}
export function useGetAppVersionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAppVersionsQuery,
		Types.GetAppVersionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAppVersionsQuery,
		Types.GetAppVersionsQueryVariables
	>(GetAppVersionsDocument, baseOptions)
}
export type GetAppVersionsQueryHookResult = ReturnType<
	typeof useGetAppVersionsQuery
>
export type GetAppVersionsLazyQueryHookResult = ReturnType<
	typeof useGetAppVersionsLazyQuery
>
export type GetAppVersionsQueryResult = Apollo.QueryResult<
	Types.GetAppVersionsQuery,
	Types.GetAppVersionsQueryVariables
>
export const GetProjectSuggestionDocument = gql`
	query GetProjectSuggestion($query: String!) {
		projectSuggestion(query: $query) {
			id
			name
			workspace_id
		}
		workspaceSuggestion(query: $query) {
			id
			name
		}
	}
`

/**
 * __useGetProjectSuggestionQuery__
 *
 * To run a query within a React component, call `useGetProjectSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectSuggestionQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetProjectSuggestionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetProjectSuggestionQuery,
		Types.GetProjectSuggestionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectSuggestionQuery,
		Types.GetProjectSuggestionQueryVariables
	>(GetProjectSuggestionDocument, baseOptions)
}
export function useGetProjectSuggestionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectSuggestionQuery,
		Types.GetProjectSuggestionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectSuggestionQuery,
		Types.GetProjectSuggestionQueryVariables
	>(GetProjectSuggestionDocument, baseOptions)
}
export type GetProjectSuggestionQueryHookResult = ReturnType<
	typeof useGetProjectSuggestionQuery
>
export type GetProjectSuggestionLazyQueryHookResult = ReturnType<
	typeof useGetProjectSuggestionLazyQuery
>
export type GetProjectSuggestionQueryResult = Apollo.QueryResult<
	Types.GetProjectSuggestionQuery,
	Types.GetProjectSuggestionQueryVariables
>
export const GetErrorFieldSuggestionDocument = gql`
	query GetErrorFieldSuggestion(
		$project_id: ID!
		$name: String!
		$query: String!
	) {
		error_field_suggestion(
			project_id: $project_id
			name: $name
			query: $query
		) {
			name
			value
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetErrorFieldSuggestionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorFieldSuggestionQuery,
		Types.GetErrorFieldSuggestionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorFieldSuggestionQuery,
		Types.GetErrorFieldSuggestionQueryVariables
	>(GetErrorFieldSuggestionDocument, baseOptions)
}
export function useGetErrorFieldSuggestionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorFieldSuggestionQuery,
		Types.GetErrorFieldSuggestionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorFieldSuggestionQuery,
		Types.GetErrorFieldSuggestionQueryVariables
	>(GetErrorFieldSuggestionDocument, baseOptions)
}
export type GetErrorFieldSuggestionQueryHookResult = ReturnType<
	typeof useGetErrorFieldSuggestionQuery
>
export type GetErrorFieldSuggestionLazyQueryHookResult = ReturnType<
	typeof useGetErrorFieldSuggestionLazyQuery
>
export type GetErrorFieldSuggestionQueryResult = Apollo.QueryResult<
	Types.GetErrorFieldSuggestionQuery,
	Types.GetErrorFieldSuggestionQueryVariables
>
export const GetErrorSearchSuggestionsDocument = gql`
	query GetErrorSearchSuggestions($project_id: ID!, $query: String!) {
		visitedUrls: error_field_suggestion(
			project_id: $project_id
			name: "visited_url"
			query: $query
		) {
			name
			value
		}
		fields: error_field_suggestion(
			project_id: $project_id
			name: "event"
			query: $query
		) {
			name
			value
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetErrorSearchSuggestionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorSearchSuggestionsQuery,
		Types.GetErrorSearchSuggestionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorSearchSuggestionsQuery,
		Types.GetErrorSearchSuggestionsQueryVariables
	>(GetErrorSearchSuggestionsDocument, baseOptions)
}
export function useGetErrorSearchSuggestionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorSearchSuggestionsQuery,
		Types.GetErrorSearchSuggestionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorSearchSuggestionsQuery,
		Types.GetErrorSearchSuggestionsQueryVariables
	>(GetErrorSearchSuggestionsDocument, baseOptions)
}
export type GetErrorSearchSuggestionsQueryHookResult = ReturnType<
	typeof useGetErrorSearchSuggestionsQuery
>
export type GetErrorSearchSuggestionsLazyQueryHookResult = ReturnType<
	typeof useGetErrorSearchSuggestionsLazyQuery
>
export type GetErrorSearchSuggestionsQueryResult = Apollo.QueryResult<
	Types.GetErrorSearchSuggestionsQuery,
	Types.GetErrorSearchSuggestionsQueryVariables
>
export const GetSessionSearchResultsDocument = gql`
	query GetSessionSearchResults($project_id: ID!, $query: String!) {
		trackProperties: property_suggestion(
			project_id: $project_id
			query: $query
			type: "track"
		) {
			id
			name
			value
		}
		userProperties: property_suggestion(
			project_id: $project_id
			query: $query
			type: "user"
		) {
			id
			name
			value
		}
		visitedUrls: field_suggestion(
			project_id: $project_id
			name: "visited-url"
			query: $query
		) {
			id
			name
			value
		}
		referrers: field_suggestion(
			project_id: $project_id
			name: "referrer"
			query: $query
		) {
			id
			name
			value
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetSessionSearchResultsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionSearchResultsQuery,
		Types.GetSessionSearchResultsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionSearchResultsQuery,
		Types.GetSessionSearchResultsQueryVariables
	>(GetSessionSearchResultsDocument, baseOptions)
}
export function useGetSessionSearchResultsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionSearchResultsQuery,
		Types.GetSessionSearchResultsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionSearchResultsQuery,
		Types.GetSessionSearchResultsQueryVariables
	>(GetSessionSearchResultsDocument, baseOptions)
}
export type GetSessionSearchResultsQueryHookResult = ReturnType<
	typeof useGetSessionSearchResultsQuery
>
export type GetSessionSearchResultsLazyQueryHookResult = ReturnType<
	typeof useGetSessionSearchResultsLazyQuery
>
export type GetSessionSearchResultsQueryResult = Apollo.QueryResult<
	Types.GetSessionSearchResultsQuery,
	Types.GetSessionSearchResultsQueryVariables
>
export const GetTrackSuggestionDocument = gql`
	query GetTrackSuggestion($project_id: ID!, $query: String!) {
		property_suggestion(
			project_id: $project_id
			query: $query
			type: "track"
		) {
			id
			name
			value
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetTrackSuggestionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTrackSuggestionQuery,
		Types.GetTrackSuggestionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetTrackSuggestionQuery,
		Types.GetTrackSuggestionQueryVariables
	>(GetTrackSuggestionDocument, baseOptions)
}
export function useGetTrackSuggestionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTrackSuggestionQuery,
		Types.GetTrackSuggestionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTrackSuggestionQuery,
		Types.GetTrackSuggestionQueryVariables
	>(GetTrackSuggestionDocument, baseOptions)
}
export type GetTrackSuggestionQueryHookResult = ReturnType<
	typeof useGetTrackSuggestionQuery
>
export type GetTrackSuggestionLazyQueryHookResult = ReturnType<
	typeof useGetTrackSuggestionLazyQuery
>
export type GetTrackSuggestionQueryResult = Apollo.QueryResult<
	Types.GetTrackSuggestionQuery,
	Types.GetTrackSuggestionQueryVariables
>
export const GetUserSuggestionDocument = gql`
	query GetUserSuggestion($project_id: ID!, $query: String!) {
		property_suggestion(
			project_id: $project_id
			query: $query
			type: "user"
		) {
			id
			name
			value
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetUserSuggestionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetUserSuggestionQuery,
		Types.GetUserSuggestionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetUserSuggestionQuery,
		Types.GetUserSuggestionQueryVariables
	>(GetUserSuggestionDocument, baseOptions)
}
export function useGetUserSuggestionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetUserSuggestionQuery,
		Types.GetUserSuggestionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetUserSuggestionQuery,
		Types.GetUserSuggestionQueryVariables
	>(GetUserSuggestionDocument, baseOptions)
}
export type GetUserSuggestionQueryHookResult = ReturnType<
	typeof useGetUserSuggestionQuery
>
export type GetUserSuggestionLazyQueryHookResult = ReturnType<
	typeof useGetUserSuggestionLazyQuery
>
export type GetUserSuggestionQueryResult = Apollo.QueryResult<
	Types.GetUserSuggestionQuery,
	Types.GetUserSuggestionQueryVariables
>
export const GetSegmentsDocument = gql`
	query GetSegments($project_id: ID!) {
		segments(project_id: $project_id) {
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
				app_versions
				environments
				device_id
				show_live_sessions
				query
			}
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetSegmentsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSegmentsQuery,
		Types.GetSegmentsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSegmentsQuery,
		Types.GetSegmentsQueryVariables
	>(GetSegmentsDocument, baseOptions)
}
export function useGetSegmentsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSegmentsQuery,
		Types.GetSegmentsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSegmentsQuery,
		Types.GetSegmentsQueryVariables
	>(GetSegmentsDocument, baseOptions)
}
export type GetSegmentsQueryHookResult = ReturnType<typeof useGetSegmentsQuery>
export type GetSegmentsLazyQueryHookResult = ReturnType<
	typeof useGetSegmentsLazyQuery
>
export type GetSegmentsQueryResult = Apollo.QueryResult<
	Types.GetSegmentsQuery,
	Types.GetSegmentsQueryVariables
>
export const GetErrorSegmentsDocument = gql`
	query GetErrorSegments($project_id: ID!) {
		error_segments(project_id: $project_id) {
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
				query
			}
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetErrorSegmentsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorSegmentsQuery,
		Types.GetErrorSegmentsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorSegmentsQuery,
		Types.GetErrorSegmentsQueryVariables
	>(GetErrorSegmentsDocument, baseOptions)
}
export function useGetErrorSegmentsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorSegmentsQuery,
		Types.GetErrorSegmentsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorSegmentsQuery,
		Types.GetErrorSegmentsQueryVariables
	>(GetErrorSegmentsDocument, baseOptions)
}
export type GetErrorSegmentsQueryHookResult = ReturnType<
	typeof useGetErrorSegmentsQuery
>
export type GetErrorSegmentsLazyQueryHookResult = ReturnType<
	typeof useGetErrorSegmentsLazyQuery
>
export type GetErrorSegmentsQueryResult = Apollo.QueryResult<
	Types.GetErrorSegmentsQuery,
	Types.GetErrorSegmentsQueryVariables
>
export const IsIntegratedDocument = gql`
	query IsIntegrated($project_id: ID!) {
		isIntegrated(project_id: $project_id)
	}
`

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
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useIsIntegratedQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.IsIntegratedQuery,
		Types.IsIntegratedQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.IsIntegratedQuery,
		Types.IsIntegratedQueryVariables
	>(IsIntegratedDocument, baseOptions)
}
export function useIsIntegratedLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.IsIntegratedQuery,
		Types.IsIntegratedQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.IsIntegratedQuery,
		Types.IsIntegratedQueryVariables
	>(IsIntegratedDocument, baseOptions)
}
export type IsIntegratedQueryHookResult = ReturnType<
	typeof useIsIntegratedQuery
>
export type IsIntegratedLazyQueryHookResult = ReturnType<
	typeof useIsIntegratedLazyQuery
>
export type IsIntegratedQueryResult = Apollo.QueryResult<
	Types.IsIntegratedQuery,
	Types.IsIntegratedQueryVariables
>
export const IsBackendIntegratedDocument = gql`
	query IsBackendIntegrated($project_id: ID!) {
		isBackendIntegrated(project_id: $project_id)
	}
`

/**
 * __useIsBackendIntegratedQuery__
 *
 * To run a query within a React component, call `useIsBackendIntegratedQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsBackendIntegratedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsBackendIntegratedQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useIsBackendIntegratedQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.IsBackendIntegratedQuery,
		Types.IsBackendIntegratedQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.IsBackendIntegratedQuery,
		Types.IsBackendIntegratedQueryVariables
	>(IsBackendIntegratedDocument, baseOptions)
}
export function useIsBackendIntegratedLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.IsBackendIntegratedQuery,
		Types.IsBackendIntegratedQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.IsBackendIntegratedQuery,
		Types.IsBackendIntegratedQueryVariables
	>(IsBackendIntegratedDocument, baseOptions)
}
export type IsBackendIntegratedQueryHookResult = ReturnType<
	typeof useIsBackendIntegratedQuery
>
export type IsBackendIntegratedLazyQueryHookResult = ReturnType<
	typeof useIsBackendIntegratedLazyQuery
>
export type IsBackendIntegratedQueryResult = Apollo.QueryResult<
	Types.IsBackendIntegratedQuery,
	Types.IsBackendIntegratedQueryVariables
>
export const GetKeyPerformanceIndicatorsDocument = gql`
	query GetKeyPerformanceIndicators($project_id: ID!, $lookBackPeriod: Int!) {
		unprocessedSessionsCount(project_id: $project_id)
		liveUsersCount(project_id: $project_id)
		newUsersCount(
			project_id: $project_id
			lookBackPeriod: $lookBackPeriod
		) {
			count
		}
		averageSessionLength(
			project_id: $project_id
			lookBackPeriod: $lookBackPeriod
		) {
			length
		}
		userFingerprintCount(
			project_id: $project_id
			lookBackPeriod: $lookBackPeriod
		) {
			count
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetKeyPerformanceIndicatorsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetKeyPerformanceIndicatorsQuery,
		Types.GetKeyPerformanceIndicatorsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetKeyPerformanceIndicatorsQuery,
		Types.GetKeyPerformanceIndicatorsQueryVariables
	>(GetKeyPerformanceIndicatorsDocument, baseOptions)
}
export function useGetKeyPerformanceIndicatorsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetKeyPerformanceIndicatorsQuery,
		Types.GetKeyPerformanceIndicatorsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetKeyPerformanceIndicatorsQuery,
		Types.GetKeyPerformanceIndicatorsQueryVariables
	>(GetKeyPerformanceIndicatorsDocument, baseOptions)
}
export type GetKeyPerformanceIndicatorsQueryHookResult = ReturnType<
	typeof useGetKeyPerformanceIndicatorsQuery
>
export type GetKeyPerformanceIndicatorsLazyQueryHookResult = ReturnType<
	typeof useGetKeyPerformanceIndicatorsLazyQuery
>
export type GetKeyPerformanceIndicatorsQueryResult = Apollo.QueryResult<
	Types.GetKeyPerformanceIndicatorsQuery,
	Types.GetKeyPerformanceIndicatorsQueryVariables
>
export const GetReferrersCountDocument = gql`
	query GetReferrersCount($project_id: ID!, $lookBackPeriod: Int!) {
		referrers(project_id: $project_id, lookBackPeriod: $lookBackPeriod) {
			host
			count
			percent
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetReferrersCountQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetReferrersCountQuery,
		Types.GetReferrersCountQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetReferrersCountQuery,
		Types.GetReferrersCountQueryVariables
	>(GetReferrersCountDocument, baseOptions)
}
export function useGetReferrersCountLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetReferrersCountQuery,
		Types.GetReferrersCountQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetReferrersCountQuery,
		Types.GetReferrersCountQueryVariables
	>(GetReferrersCountDocument, baseOptions)
}
export type GetReferrersCountQueryHookResult = ReturnType<
	typeof useGetReferrersCountQuery
>
export type GetReferrersCountLazyQueryHookResult = ReturnType<
	typeof useGetReferrersCountLazyQuery
>
export type GetReferrersCountQueryResult = Apollo.QueryResult<
	Types.GetReferrersCountQuery,
	Types.GetReferrersCountQueryVariables
>
export const GetNewUsersCountDocument = gql`
	query GetNewUsersCount($project_id: ID!, $lookBackPeriod: Int!) {
		newUsersCount(
			project_id: $project_id
			lookBackPeriod: $lookBackPeriod
		) {
			count
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetNewUsersCountQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetNewUsersCountQuery,
		Types.GetNewUsersCountQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetNewUsersCountQuery,
		Types.GetNewUsersCountQueryVariables
	>(GetNewUsersCountDocument, baseOptions)
}
export function useGetNewUsersCountLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetNewUsersCountQuery,
		Types.GetNewUsersCountQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetNewUsersCountQuery,
		Types.GetNewUsersCountQueryVariables
	>(GetNewUsersCountDocument, baseOptions)
}
export type GetNewUsersCountQueryHookResult = ReturnType<
	typeof useGetNewUsersCountQuery
>
export type GetNewUsersCountLazyQueryHookResult = ReturnType<
	typeof useGetNewUsersCountLazyQuery
>
export type GetNewUsersCountQueryResult = Apollo.QueryResult<
	Types.GetNewUsersCountQuery,
	Types.GetNewUsersCountQueryVariables
>
export const GetAverageSessionLengthDocument = gql`
	query GetAverageSessionLength($project_id: ID!, $lookBackPeriod: Int!) {
		averageSessionLength(
			project_id: $project_id
			lookBackPeriod: $lookBackPeriod
		) {
			length
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetAverageSessionLengthQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetAverageSessionLengthQuery,
		Types.GetAverageSessionLengthQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAverageSessionLengthQuery,
		Types.GetAverageSessionLengthQueryVariables
	>(GetAverageSessionLengthDocument, baseOptions)
}
export function useGetAverageSessionLengthLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAverageSessionLengthQuery,
		Types.GetAverageSessionLengthQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAverageSessionLengthQuery,
		Types.GetAverageSessionLengthQueryVariables
	>(GetAverageSessionLengthDocument, baseOptions)
}
export type GetAverageSessionLengthQueryHookResult = ReturnType<
	typeof useGetAverageSessionLengthQuery
>
export type GetAverageSessionLengthLazyQueryHookResult = ReturnType<
	typeof useGetAverageSessionLengthLazyQuery
>
export type GetAverageSessionLengthQueryResult = Apollo.QueryResult<
	Types.GetAverageSessionLengthQuery,
	Types.GetAverageSessionLengthQueryVariables
>
export const GetTopUsersDocument = gql`
	query GetTopUsers($project_id: ID!, $lookBackPeriod: Int!) {
		topUsers(project_id: $project_id, lookBackPeriod: $lookBackPeriod) {
			identifier
			total_active_time
			active_time_percentage
			id
			user_properties
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetTopUsersQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTopUsersQuery,
		Types.GetTopUsersQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetTopUsersQuery,
		Types.GetTopUsersQueryVariables
	>(GetTopUsersDocument, baseOptions)
}
export function useGetTopUsersLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTopUsersQuery,
		Types.GetTopUsersQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTopUsersQuery,
		Types.GetTopUsersQueryVariables
	>(GetTopUsersDocument, baseOptions)
}
export type GetTopUsersQueryHookResult = ReturnType<typeof useGetTopUsersQuery>
export type GetTopUsersLazyQueryHookResult = ReturnType<
	typeof useGetTopUsersLazyQuery
>
export type GetTopUsersQueryResult = Apollo.QueryResult<
	Types.GetTopUsersQuery,
	Types.GetTopUsersQueryVariables
>
export const GetDailySessionsCountDocument = gql`
	query GetDailySessionsCount(
		$project_id: ID!
		$date_range: DateRangeInput!
	) {
		dailySessionsCount(project_id: $project_id, date_range: $date_range) {
			date
			count
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      date_range: // value for 'date_range'
 *   },
 * });
 */
export function useGetDailySessionsCountQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetDailySessionsCountQuery,
		Types.GetDailySessionsCountQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetDailySessionsCountQuery,
		Types.GetDailySessionsCountQueryVariables
	>(GetDailySessionsCountDocument, baseOptions)
}
export function useGetDailySessionsCountLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetDailySessionsCountQuery,
		Types.GetDailySessionsCountQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetDailySessionsCountQuery,
		Types.GetDailySessionsCountQueryVariables
	>(GetDailySessionsCountDocument, baseOptions)
}
export type GetDailySessionsCountQueryHookResult = ReturnType<
	typeof useGetDailySessionsCountQuery
>
export type GetDailySessionsCountLazyQueryHookResult = ReturnType<
	typeof useGetDailySessionsCountLazyQuery
>
export type GetDailySessionsCountQueryResult = Apollo.QueryResult<
	Types.GetDailySessionsCountQuery,
	Types.GetDailySessionsCountQueryVariables
>
export const GetDailyErrorsCountDocument = gql`
	query GetDailyErrorsCount($project_id: ID!, $date_range: DateRangeInput!) {
		dailyErrorsCount(project_id: $project_id, date_range: $date_range) {
			date
			count
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *      date_range: // value for 'date_range'
 *   },
 * });
 */
export function useGetDailyErrorsCountQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetDailyErrorsCountQuery,
		Types.GetDailyErrorsCountQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetDailyErrorsCountQuery,
		Types.GetDailyErrorsCountQueryVariables
	>(GetDailyErrorsCountDocument, baseOptions)
}
export function useGetDailyErrorsCountLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetDailyErrorsCountQuery,
		Types.GetDailyErrorsCountQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetDailyErrorsCountQuery,
		Types.GetDailyErrorsCountQueryVariables
	>(GetDailyErrorsCountDocument, baseOptions)
}
export type GetDailyErrorsCountQueryHookResult = ReturnType<
	typeof useGetDailyErrorsCountQuery
>
export type GetDailyErrorsCountLazyQueryHookResult = ReturnType<
	typeof useGetDailyErrorsCountLazyQuery
>
export type GetDailyErrorsCountQueryResult = Apollo.QueryResult<
	Types.GetDailyErrorsCountQuery,
	Types.GetDailyErrorsCountQueryVariables
>
export const GetRageClicksForProjectDocument = gql`
	query GetRageClicksForProject($project_id: ID!, $lookBackPeriod: Int!) {
		rageClicksForProject(
			project_id: $project_id
			lookBackPeriod: $lookBackPeriod
		) {
			identifier
			session_secure_id
			total_clicks
			user_properties
		}
	}
`

/**
 * __useGetRageClicksForProjectQuery__
 *
 * To run a query within a React component, call `useGetRageClicksForProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRageClicksForProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRageClicksForProjectQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      lookBackPeriod: // value for 'lookBackPeriod'
 *   },
 * });
 */
export function useGetRageClicksForProjectQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetRageClicksForProjectQuery,
		Types.GetRageClicksForProjectQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetRageClicksForProjectQuery,
		Types.GetRageClicksForProjectQueryVariables
	>(GetRageClicksForProjectDocument, baseOptions)
}
export function useGetRageClicksForProjectLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetRageClicksForProjectQuery,
		Types.GetRageClicksForProjectQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetRageClicksForProjectQuery,
		Types.GetRageClicksForProjectQueryVariables
	>(GetRageClicksForProjectDocument, baseOptions)
}
export type GetRageClicksForProjectQueryHookResult = ReturnType<
	typeof useGetRageClicksForProjectQuery
>
export type GetRageClicksForProjectLazyQueryHookResult = ReturnType<
	typeof useGetRageClicksForProjectLazyQuery
>
export type GetRageClicksForProjectQueryResult = Apollo.QueryResult<
	Types.GetRageClicksForProjectQuery,
	Types.GetRageClicksForProjectQueryVariables
>
export const GetDailyErrorFrequencyDocument = gql`
	query GetDailyErrorFrequency(
		$project_id: ID!
		$error_group_secure_id: String!
		$date_offset: Int!
	) {
		dailyErrorFrequency(
			project_id: $project_id
			error_group_secure_id: $error_group_secure_id
			date_offset: $date_offset
		)
	}
`

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
 *      project_id: // value for 'project_id'
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *      date_offset: // value for 'date_offset'
 *   },
 * });
 */
export function useGetDailyErrorFrequencyQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetDailyErrorFrequencyQuery,
		Types.GetDailyErrorFrequencyQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetDailyErrorFrequencyQuery,
		Types.GetDailyErrorFrequencyQueryVariables
	>(GetDailyErrorFrequencyDocument, baseOptions)
}
export function useGetDailyErrorFrequencyLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetDailyErrorFrequencyQuery,
		Types.GetDailyErrorFrequencyQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetDailyErrorFrequencyQuery,
		Types.GetDailyErrorFrequencyQueryVariables
	>(GetDailyErrorFrequencyDocument, baseOptions)
}
export type GetDailyErrorFrequencyQueryHookResult = ReturnType<
	typeof useGetDailyErrorFrequencyQuery
>
export type GetDailyErrorFrequencyLazyQueryHookResult = ReturnType<
	typeof useGetDailyErrorFrequencyLazyQuery
>
export type GetDailyErrorFrequencyQueryResult = Apollo.QueryResult<
	Types.GetDailyErrorFrequencyQuery,
	Types.GetDailyErrorFrequencyQueryVariables
>
export const GetErrorDistributionDocument = gql`
	query GetErrorDistribution(
		$project_id: ID!
		$error_group_secure_id: String!
		$property: String!
	) {
		errorDistribution(
			project_id: $project_id
			error_group_secure_id: $error_group_secure_id
			property: $property
		) {
			name
			value
		}
	}
`

/**
 * __useGetErrorDistributionQuery__
 *
 * To run a query within a React component, call `useGetErrorDistributionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorDistributionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorDistributionQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *      property: // value for 'property'
 *   },
 * });
 */
export function useGetErrorDistributionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorDistributionQuery,
		Types.GetErrorDistributionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorDistributionQuery,
		Types.GetErrorDistributionQueryVariables
	>(GetErrorDistributionDocument, baseOptions)
}
export function useGetErrorDistributionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorDistributionQuery,
		Types.GetErrorDistributionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorDistributionQuery,
		Types.GetErrorDistributionQueryVariables
	>(GetErrorDistributionDocument, baseOptions)
}
export type GetErrorDistributionQueryHookResult = ReturnType<
	typeof useGetErrorDistributionQuery
>
export type GetErrorDistributionLazyQueryHookResult = ReturnType<
	typeof useGetErrorDistributionLazyQuery
>
export type GetErrorDistributionQueryResult = Apollo.QueryResult<
	Types.GetErrorDistributionQuery,
	Types.GetErrorDistributionQueryVariables
>
export const GetSlackChannelSuggestionDocument = gql`
	query GetSlackChannelSuggestion($project_id: ID!) {
		slack_channel_suggestion(project_id: $project_id) {
			webhook_channel
			webhook_channel_id
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetSlackChannelSuggestionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSlackChannelSuggestionQuery,
		Types.GetSlackChannelSuggestionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSlackChannelSuggestionQuery,
		Types.GetSlackChannelSuggestionQueryVariables
	>(GetSlackChannelSuggestionDocument, baseOptions)
}
export function useGetSlackChannelSuggestionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSlackChannelSuggestionQuery,
		Types.GetSlackChannelSuggestionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSlackChannelSuggestionQuery,
		Types.GetSlackChannelSuggestionQueryVariables
	>(GetSlackChannelSuggestionDocument, baseOptions)
}
export type GetSlackChannelSuggestionQueryHookResult = ReturnType<
	typeof useGetSlackChannelSuggestionQuery
>
export type GetSlackChannelSuggestionLazyQueryHookResult = ReturnType<
	typeof useGetSlackChannelSuggestionLazyQuery
>
export type GetSlackChannelSuggestionQueryResult = Apollo.QueryResult<
	Types.GetSlackChannelSuggestionQuery,
	Types.GetSlackChannelSuggestionQueryVariables
>
export const GetWorkspaceIsIntegratedWithSlackDocument = gql`
	query GetWorkspaceIsIntegratedWithSlack($project_id: ID!) {
		is_integrated_with_slack: is_integrated_with(
			integration_type: Slack
			project_id: $project_id
		)
	}
`

/**
 * __useGetWorkspaceIsIntegratedWithSlackQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceIsIntegratedWithSlackQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceIsIntegratedWithSlackQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceIsIntegratedWithSlackQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetWorkspaceIsIntegratedWithSlackQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithSlackQuery,
		Types.GetWorkspaceIsIntegratedWithSlackQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceIsIntegratedWithSlackQuery,
		Types.GetWorkspaceIsIntegratedWithSlackQueryVariables
	>(GetWorkspaceIsIntegratedWithSlackDocument, baseOptions)
}
export function useGetWorkspaceIsIntegratedWithSlackLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithSlackQuery,
		Types.GetWorkspaceIsIntegratedWithSlackQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceIsIntegratedWithSlackQuery,
		Types.GetWorkspaceIsIntegratedWithSlackQueryVariables
	>(GetWorkspaceIsIntegratedWithSlackDocument, baseOptions)
}
export type GetWorkspaceIsIntegratedWithSlackQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithSlackQuery
>
export type GetWorkspaceIsIntegratedWithSlackLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithSlackLazyQuery
>
export type GetWorkspaceIsIntegratedWithSlackQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceIsIntegratedWithSlackQuery,
	Types.GetWorkspaceIsIntegratedWithSlackQueryVariables
>
export const GetWorkspaceIsIntegratedWithLinearDocument = gql`
	query GetWorkspaceIsIntegratedWithLinear($project_id: ID!) {
		is_integrated_with_linear: is_integrated_with(
			integration_type: Linear
			project_id: $project_id
		)
		linear_teams(project_id: $project_id) {
			team_id
			name
			key
		}
	}
`

/**
 * __useGetWorkspaceIsIntegratedWithLinearQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceIsIntegratedWithLinearQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceIsIntegratedWithLinearQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceIsIntegratedWithLinearQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetWorkspaceIsIntegratedWithLinearQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithLinearQuery,
		Types.GetWorkspaceIsIntegratedWithLinearQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceIsIntegratedWithLinearQuery,
		Types.GetWorkspaceIsIntegratedWithLinearQueryVariables
	>(GetWorkspaceIsIntegratedWithLinearDocument, baseOptions)
}
export function useGetWorkspaceIsIntegratedWithLinearLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithLinearQuery,
		Types.GetWorkspaceIsIntegratedWithLinearQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceIsIntegratedWithLinearQuery,
		Types.GetWorkspaceIsIntegratedWithLinearQueryVariables
	>(GetWorkspaceIsIntegratedWithLinearDocument, baseOptions)
}
export type GetWorkspaceIsIntegratedWithLinearQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithLinearQuery
>
export type GetWorkspaceIsIntegratedWithLinearLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithLinearLazyQuery
>
export type GetWorkspaceIsIntegratedWithLinearQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceIsIntegratedWithLinearQuery,
	Types.GetWorkspaceIsIntegratedWithLinearQueryVariables
>
export const GetWorkspaceIsIntegratedWithZapierDocument = gql`
	query GetWorkspaceIsIntegratedWithZapier($project_id: ID!) {
		is_integrated_with_linear: is_integrated_with(
			integration_type: Zapier
			project_id: $project_id
		)
	}
`

/**
 * __useGetWorkspaceIsIntegratedWithZapierQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceIsIntegratedWithZapierQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceIsIntegratedWithZapierQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceIsIntegratedWithZapierQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetWorkspaceIsIntegratedWithZapierQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithZapierQuery,
		Types.GetWorkspaceIsIntegratedWithZapierQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceIsIntegratedWithZapierQuery,
		Types.GetWorkspaceIsIntegratedWithZapierQueryVariables
	>(GetWorkspaceIsIntegratedWithZapierDocument, baseOptions)
}
export function useGetWorkspaceIsIntegratedWithZapierLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithZapierQuery,
		Types.GetWorkspaceIsIntegratedWithZapierQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceIsIntegratedWithZapierQuery,
		Types.GetWorkspaceIsIntegratedWithZapierQueryVariables
	>(GetWorkspaceIsIntegratedWithZapierDocument, baseOptions)
}
export type GetWorkspaceIsIntegratedWithZapierQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithZapierQuery
>
export type GetWorkspaceIsIntegratedWithZapierLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithZapierLazyQuery
>
export type GetWorkspaceIsIntegratedWithZapierQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceIsIntegratedWithZapierQuery,
	Types.GetWorkspaceIsIntegratedWithZapierQueryVariables
>
export const GenerateNewZapierAccessTokenJwtDocument = gql`
	query GenerateNewZapierAccessTokenJwt($project_id: ID!) {
		generate_zapier_access_token(project_id: $project_id)
	}
`

/**
 * __useGenerateNewZapierAccessTokenJwtQuery__
 *
 * To run a query within a React component, call `useGenerateNewZapierAccessTokenJwtQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateNewZapierAccessTokenJwtQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateNewZapierAccessTokenJwtQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGenerateNewZapierAccessTokenJwtQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GenerateNewZapierAccessTokenJwtQuery,
		Types.GenerateNewZapierAccessTokenJwtQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GenerateNewZapierAccessTokenJwtQuery,
		Types.GenerateNewZapierAccessTokenJwtQueryVariables
	>(GenerateNewZapierAccessTokenJwtDocument, baseOptions)
}
export function useGenerateNewZapierAccessTokenJwtLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GenerateNewZapierAccessTokenJwtQuery,
		Types.GenerateNewZapierAccessTokenJwtQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GenerateNewZapierAccessTokenJwtQuery,
		Types.GenerateNewZapierAccessTokenJwtQueryVariables
	>(GenerateNewZapierAccessTokenJwtDocument, baseOptions)
}
export type GenerateNewZapierAccessTokenJwtQueryHookResult = ReturnType<
	typeof useGenerateNewZapierAccessTokenJwtQuery
>
export type GenerateNewZapierAccessTokenJwtLazyQueryHookResult = ReturnType<
	typeof useGenerateNewZapierAccessTokenJwtLazyQuery
>
export type GenerateNewZapierAccessTokenJwtQueryResult = Apollo.QueryResult<
	Types.GenerateNewZapierAccessTokenJwtQuery,
	Types.GenerateNewZapierAccessTokenJwtQueryVariables
>
export const GetIdentifierSuggestionsDocument = gql`
	query GetIdentifierSuggestions($project_id: ID!, $query: String!) {
		identifier_suggestion(project_id: $project_id, query: $query)
	}
`

/**
 * __useGetIdentifierSuggestionsQuery__
 *
 * To run a query within a React component, call `useGetIdentifierSuggestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetIdentifierSuggestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetIdentifierSuggestionsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetIdentifierSuggestionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetIdentifierSuggestionsQuery,
		Types.GetIdentifierSuggestionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetIdentifierSuggestionsQuery,
		Types.GetIdentifierSuggestionsQueryVariables
	>(GetIdentifierSuggestionsDocument, baseOptions)
}
export function useGetIdentifierSuggestionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetIdentifierSuggestionsQuery,
		Types.GetIdentifierSuggestionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetIdentifierSuggestionsQuery,
		Types.GetIdentifierSuggestionsQueryVariables
	>(GetIdentifierSuggestionsDocument, baseOptions)
}
export type GetIdentifierSuggestionsQueryHookResult = ReturnType<
	typeof useGetIdentifierSuggestionsQuery
>
export type GetIdentifierSuggestionsLazyQueryHookResult = ReturnType<
	typeof useGetIdentifierSuggestionsLazyQuery
>
export type GetIdentifierSuggestionsQueryResult = Apollo.QueryResult<
	Types.GetIdentifierSuggestionsQuery,
	Types.GetIdentifierSuggestionsQueryVariables
>
export const GetAlertsPagePayloadDocument = gql`
	query GetAlertsPagePayload($project_id: ID!) {
		is_integrated_with_slack: is_integrated_with(
			integration_type: Slack
			project_id: $project_id
		)
		slack_channel_suggestion(project_id: $project_id) {
			webhook_channel
			webhook_channel_id
		}
		admins: workspace_admins_by_project_id(project_id: $project_id) {
			admin {
				id
				name
				email
				photo_url
			}
		}
		environment_suggestion(project_id: $project_id) {
			name
			value
		}
		error_alerts(project_id: $project_id) {
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			updated_at
			CountThreshold
			LastAdminToEditID
			ThresholdWindow
			RegexGroups
			Frequency
			id
			Type
			Name
			DailyFrequency
			disabled
		}
		session_feedback_alerts(project_id: $project_id) {
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			updated_at
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			LastAdminToEditID
			id
			Name
			Type
			DailyFrequency
			disabled
		}
		new_session_alerts(project_id: $project_id) {
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			updated_at
			LastAdminToEditID
			Name
			id
			Type
			ExcludeRules
			DailyFrequency
			disabled
		}
		rage_click_alerts(project_id: $project_id) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			CountThreshold
			ThresholdWindow
			updated_at
			LastAdminToEditID
			Name
			Type
			DailyFrequency
			disabled
		}
		new_user_alerts(project_id: $project_id) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			ExcludedEnvironments
			CountThreshold
			updated_at
			LastAdminToEditID
			Name
			Type
			DailyFrequency
			disabled
		}
		track_properties_alerts(project_id: $project_id) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			TrackProperties {
				id
				name
				value
			}
			ExcludedEnvironments
			updated_at
			LastAdminToEditID
			CountThreshold
			Name
			Type
			DailyFrequency
			disabled
		}
		user_properties_alerts(project_id: $project_id) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			EmailsToNotify
			UserProperties {
				id
				name
				value
			}
			ExcludedEnvironments
			updated_at
			LastAdminToEditID
			CountThreshold
			Name
			Type
			DailyFrequency
			disabled
		}
		metric_monitors(project_id: $project_id) {
			id
			updated_at
			name
			channels_to_notify {
				webhook_channel
				webhook_channel_id
			}
			emails_to_notify
			aggregator
			period_minutes
			metric_to_monitor
			last_admin_to_edit_id
			threshold
			filters {
				tag
				op
				value
			}
			units
			disabled
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetAlertsPagePayloadQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetAlertsPagePayloadQuery,
		Types.GetAlertsPagePayloadQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetAlertsPagePayloadQuery,
		Types.GetAlertsPagePayloadQueryVariables
	>(GetAlertsPagePayloadDocument, baseOptions)
}
export function useGetAlertsPagePayloadLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAlertsPagePayloadQuery,
		Types.GetAlertsPagePayloadQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetAlertsPagePayloadQuery,
		Types.GetAlertsPagePayloadQueryVariables
	>(GetAlertsPagePayloadDocument, baseOptions)
}
export type GetAlertsPagePayloadQueryHookResult = ReturnType<
	typeof useGetAlertsPagePayloadQuery
>
export type GetAlertsPagePayloadLazyQueryHookResult = ReturnType<
	typeof useGetAlertsPagePayloadLazyQuery
>
export type GetAlertsPagePayloadQueryResult = Apollo.QueryResult<
	Types.GetAlertsPagePayloadQuery,
	Types.GetAlertsPagePayloadQueryVariables
>
export const GetMetricMonitorsDocument = gql`
	query GetMetricMonitors($project_id: ID!, $metric_name: String!) {
		metric_monitors(project_id: $project_id, metric_name: $metric_name) {
			id
			updated_at
			name
			metric_to_monitor
		}
	}
`

/**
 * __useGetMetricMonitorsQuery__
 *
 * To run a query within a React component, call `useGetMetricMonitorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMetricMonitorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMetricMonitorsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      metric_name: // value for 'metric_name'
 *   },
 * });
 */
export function useGetMetricMonitorsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetMetricMonitorsQuery,
		Types.GetMetricMonitorsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetMetricMonitorsQuery,
		Types.GetMetricMonitorsQueryVariables
	>(GetMetricMonitorsDocument, baseOptions)
}
export function useGetMetricMonitorsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetMetricMonitorsQuery,
		Types.GetMetricMonitorsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetMetricMonitorsQuery,
		Types.GetMetricMonitorsQueryVariables
	>(GetMetricMonitorsDocument, baseOptions)
}
export type GetMetricMonitorsQueryHookResult = ReturnType<
	typeof useGetMetricMonitorsQuery
>
export type GetMetricMonitorsLazyQueryHookResult = ReturnType<
	typeof useGetMetricMonitorsLazyQuery
>
export type GetMetricMonitorsQueryResult = Apollo.QueryResult<
	Types.GetMetricMonitorsQuery,
	Types.GetMetricMonitorsQueryVariables
>
export const GetCommentMentionSuggestionsDocument = gql`
	query GetCommentMentionSuggestions($project_id: ID!) {
		admins: workspace_admins_by_project_id(project_id: $project_id) {
			admin {
				id
				name
				email
				photo_url
			}
		}
		slack_members(project_id: $project_id) {
			webhook_channel
			webhook_channel_id
		}
	}
`

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
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetCommentMentionSuggestionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetCommentMentionSuggestionsQuery,
		Types.GetCommentMentionSuggestionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetCommentMentionSuggestionsQuery,
		Types.GetCommentMentionSuggestionsQueryVariables
	>(GetCommentMentionSuggestionsDocument, baseOptions)
}
export function useGetCommentMentionSuggestionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetCommentMentionSuggestionsQuery,
		Types.GetCommentMentionSuggestionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetCommentMentionSuggestionsQuery,
		Types.GetCommentMentionSuggestionsQueryVariables
	>(GetCommentMentionSuggestionsDocument, baseOptions)
}
export type GetCommentMentionSuggestionsQueryHookResult = ReturnType<
	typeof useGetCommentMentionSuggestionsQuery
>
export type GetCommentMentionSuggestionsLazyQueryHookResult = ReturnType<
	typeof useGetCommentMentionSuggestionsLazyQuery
>
export type GetCommentMentionSuggestionsQueryResult = Apollo.QueryResult<
	Types.GetCommentMentionSuggestionsQuery,
	Types.GetCommentMentionSuggestionsQueryVariables
>
export const GetCustomerPortalUrlDocument = gql`
	query GetCustomerPortalURL($workspace_id: ID!) {
		customer_portal_url(workspace_id: $workspace_id)
	}
`

/**
 * __useGetCustomerPortalUrlQuery__
 *
 * To run a query within a React component, call `useGetCustomerPortalUrlQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCustomerPortalUrlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCustomerPortalUrlQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetCustomerPortalUrlQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetCustomerPortalUrlQuery,
		Types.GetCustomerPortalUrlQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetCustomerPortalUrlQuery,
		Types.GetCustomerPortalUrlQueryVariables
	>(GetCustomerPortalUrlDocument, baseOptions)
}
export function useGetCustomerPortalUrlLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetCustomerPortalUrlQuery,
		Types.GetCustomerPortalUrlQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetCustomerPortalUrlQuery,
		Types.GetCustomerPortalUrlQueryVariables
	>(GetCustomerPortalUrlDocument, baseOptions)
}
export type GetCustomerPortalUrlQueryHookResult = ReturnType<
	typeof useGetCustomerPortalUrlQuery
>
export type GetCustomerPortalUrlLazyQueryHookResult = ReturnType<
	typeof useGetCustomerPortalUrlLazyQuery
>
export type GetCustomerPortalUrlQueryResult = Apollo.QueryResult<
	Types.GetCustomerPortalUrlQuery,
	Types.GetCustomerPortalUrlQueryVariables
>
export const OnSessionPayloadAppendedDocument = gql`
	subscription OnSessionPayloadAppended(
		$session_secure_id: String!
		$initial_events_count: Int!
	) {
		session_payload_appended(
			session_secure_id: $session_secure_id
			initial_events_count: $initial_events_count
		) {
			...SessionPayloadFragment
		}
	}
	${SessionPayloadFragmentFragmentDoc}
`

/**
 * __useOnSessionPayloadAppendedSubscription__
 *
 * To run a query within a React component, call `useOnSessionPayloadAppendedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnSessionPayloadAppendedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnSessionPayloadAppendedSubscription({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *      initial_events_count: // value for 'initial_events_count'
 *   },
 * });
 */
export function useOnSessionPayloadAppendedSubscription(
	baseOptions: Apollo.SubscriptionHookOptions<
		Types.OnSessionPayloadAppendedSubscription,
		Types.OnSessionPayloadAppendedSubscriptionVariables
	>,
) {
	return Apollo.useSubscription<
		Types.OnSessionPayloadAppendedSubscription,
		Types.OnSessionPayloadAppendedSubscriptionVariables
	>(OnSessionPayloadAppendedDocument, baseOptions)
}
export type OnSessionPayloadAppendedSubscriptionHookResult = ReturnType<
	typeof useOnSessionPayloadAppendedSubscription
>
export type OnSessionPayloadAppendedSubscriptionResult =
	Apollo.SubscriptionResult<Types.OnSessionPayloadAppendedSubscription>
export const GetWebVitalsDocument = gql`
	query GetWebVitals($session_secure_id: String!) {
		web_vitals(session_secure_id: $session_secure_id) {
			name
			value
		}
	}
`

/**
 * __useGetWebVitalsQuery__
 *
 * To run a query within a React component, call `useGetWebVitalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWebVitalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWebVitalsQuery({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetWebVitalsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWebVitalsQuery,
		Types.GetWebVitalsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWebVitalsQuery,
		Types.GetWebVitalsQueryVariables
	>(GetWebVitalsDocument, baseOptions)
}
export function useGetWebVitalsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWebVitalsQuery,
		Types.GetWebVitalsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWebVitalsQuery,
		Types.GetWebVitalsQueryVariables
	>(GetWebVitalsDocument, baseOptions)
}
export type GetWebVitalsQueryHookResult = ReturnType<
	typeof useGetWebVitalsQuery
>
export type GetWebVitalsLazyQueryHookResult = ReturnType<
	typeof useGetWebVitalsLazyQuery
>
export type GetWebVitalsQueryResult = Apollo.QueryResult<
	Types.GetWebVitalsQuery,
	Types.GetWebVitalsQueryVariables
>
export const GetDashboardDefinitionsDocument = gql`
	query GetDashboardDefinitions($project_id: ID!) {
		dashboard_definitions(project_id: $project_id) {
			id
			updated_at
			project_id
			name
			is_default
			metrics {
				component_type
				name
				description
				max_good_value
				max_needs_improvement_value
				poor_value
				units
				help_article
				chart_type
				aggregator
				min_value
				min_percentile
				max_value
				max_percentile
				filters {
					value
					op
					tag
				}
				groups
			}
			last_admin_to_edit_id
			layout
		}
	}
`

/**
 * __useGetDashboardDefinitionsQuery__
 *
 * To run a query within a React component, call `useGetDashboardDefinitionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDashboardDefinitionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDashboardDefinitionsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetDashboardDefinitionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetDashboardDefinitionsQuery,
		Types.GetDashboardDefinitionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetDashboardDefinitionsQuery,
		Types.GetDashboardDefinitionsQueryVariables
	>(GetDashboardDefinitionsDocument, baseOptions)
}
export function useGetDashboardDefinitionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetDashboardDefinitionsQuery,
		Types.GetDashboardDefinitionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetDashboardDefinitionsQuery,
		Types.GetDashboardDefinitionsQueryVariables
	>(GetDashboardDefinitionsDocument, baseOptions)
}
export type GetDashboardDefinitionsQueryHookResult = ReturnType<
	typeof useGetDashboardDefinitionsQuery
>
export type GetDashboardDefinitionsLazyQueryHookResult = ReturnType<
	typeof useGetDashboardDefinitionsLazyQuery
>
export type GetDashboardDefinitionsQueryResult = Apollo.QueryResult<
	Types.GetDashboardDefinitionsQuery,
	Types.GetDashboardDefinitionsQueryVariables
>
export const GetSuggestedMetricsDocument = gql`
	query GetSuggestedMetrics($project_id: ID!, $prefix: String!) {
		suggested_metrics(project_id: $project_id, prefix: $prefix)
	}
`

/**
 * __useGetSuggestedMetricsQuery__
 *
 * To run a query within a React component, call `useGetSuggestedMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSuggestedMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSuggestedMetricsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      prefix: // value for 'prefix'
 *   },
 * });
 */
export function useGetSuggestedMetricsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSuggestedMetricsQuery,
		Types.GetSuggestedMetricsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSuggestedMetricsQuery,
		Types.GetSuggestedMetricsQueryVariables
	>(GetSuggestedMetricsDocument, baseOptions)
}
export function useGetSuggestedMetricsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSuggestedMetricsQuery,
		Types.GetSuggestedMetricsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSuggestedMetricsQuery,
		Types.GetSuggestedMetricsQueryVariables
	>(GetSuggestedMetricsDocument, baseOptions)
}
export type GetSuggestedMetricsQueryHookResult = ReturnType<
	typeof useGetSuggestedMetricsQuery
>
export type GetSuggestedMetricsLazyQueryHookResult = ReturnType<
	typeof useGetSuggestedMetricsLazyQuery
>
export type GetSuggestedMetricsQueryResult = Apollo.QueryResult<
	Types.GetSuggestedMetricsQuery,
	Types.GetSuggestedMetricsQueryVariables
>
export const GetMetricTagsDocument = gql`
	query GetMetricTags($project_id: ID!, $metric_name: String!) {
		metric_tags(project_id: $project_id, metric_name: $metric_name)
	}
`

/**
 * __useGetMetricTagsQuery__
 *
 * To run a query within a React component, call `useGetMetricTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMetricTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMetricTagsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      metric_name: // value for 'metric_name'
 *   },
 * });
 */
export function useGetMetricTagsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetMetricTagsQuery,
		Types.GetMetricTagsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetMetricTagsQuery,
		Types.GetMetricTagsQueryVariables
	>(GetMetricTagsDocument, baseOptions)
}
export function useGetMetricTagsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetMetricTagsQuery,
		Types.GetMetricTagsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetMetricTagsQuery,
		Types.GetMetricTagsQueryVariables
	>(GetMetricTagsDocument, baseOptions)
}
export type GetMetricTagsQueryHookResult = ReturnType<
	typeof useGetMetricTagsQuery
>
export type GetMetricTagsLazyQueryHookResult = ReturnType<
	typeof useGetMetricTagsLazyQuery
>
export type GetMetricTagsQueryResult = Apollo.QueryResult<
	Types.GetMetricTagsQuery,
	Types.GetMetricTagsQueryVariables
>
export const GetMetricTagValuesDocument = gql`
	query GetMetricTagValues(
		$project_id: ID!
		$metric_name: String!
		$tag_name: String!
	) {
		metric_tag_values(
			project_id: $project_id
			metric_name: $metric_name
			tag_name: $tag_name
		)
	}
`

/**
 * __useGetMetricTagValuesQuery__
 *
 * To run a query within a React component, call `useGetMetricTagValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMetricTagValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMetricTagValuesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      metric_name: // value for 'metric_name'
 *      tag_name: // value for 'tag_name'
 *   },
 * });
 */
export function useGetMetricTagValuesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetMetricTagValuesQuery,
		Types.GetMetricTagValuesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetMetricTagValuesQuery,
		Types.GetMetricTagValuesQueryVariables
	>(GetMetricTagValuesDocument, baseOptions)
}
export function useGetMetricTagValuesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetMetricTagValuesQuery,
		Types.GetMetricTagValuesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetMetricTagValuesQuery,
		Types.GetMetricTagValuesQueryVariables
	>(GetMetricTagValuesDocument, baseOptions)
}
export type GetMetricTagValuesQueryHookResult = ReturnType<
	typeof useGetMetricTagValuesQuery
>
export type GetMetricTagValuesLazyQueryHookResult = ReturnType<
	typeof useGetMetricTagValuesLazyQuery
>
export type GetMetricTagValuesQueryResult = Apollo.QueryResult<
	Types.GetMetricTagValuesQuery,
	Types.GetMetricTagValuesQueryVariables
>
export const GetSourcemapFilesDocument = gql`
	query GetSourcemapFiles($project_id: ID!, $version: String) {
		sourcemap_files(project_id: $project_id, version: $version) {
			key
		}
	}
`

/**
 * __useGetSourcemapFilesQuery__
 *
 * To run a query within a React component, call `useGetSourcemapFilesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSourcemapFilesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSourcemapFilesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      version: // value for 'version'
 *   },
 * });
 */
export function useGetSourcemapFilesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSourcemapFilesQuery,
		Types.GetSourcemapFilesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSourcemapFilesQuery,
		Types.GetSourcemapFilesQueryVariables
	>(GetSourcemapFilesDocument, baseOptions)
}
export function useGetSourcemapFilesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSourcemapFilesQuery,
		Types.GetSourcemapFilesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSourcemapFilesQuery,
		Types.GetSourcemapFilesQueryVariables
	>(GetSourcemapFilesDocument, baseOptions)
}
export type GetSourcemapFilesQueryHookResult = ReturnType<
	typeof useGetSourcemapFilesQuery
>
export type GetSourcemapFilesLazyQueryHookResult = ReturnType<
	typeof useGetSourcemapFilesLazyQuery
>
export type GetSourcemapFilesQueryResult = Apollo.QueryResult<
	Types.GetSourcemapFilesQuery,
	Types.GetSourcemapFilesQueryVariables
>
export const GetSourcemapVersionsDocument = gql`
	query GetSourcemapVersions($project_id: ID!) {
		sourcemap_versions(project_id: $project_id)
	}
`

/**
 * __useGetSourcemapVersionsQuery__
 *
 * To run a query within a React component, call `useGetSourcemapVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSourcemapVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSourcemapVersionsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetSourcemapVersionsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSourcemapVersionsQuery,
		Types.GetSourcemapVersionsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSourcemapVersionsQuery,
		Types.GetSourcemapVersionsQueryVariables
	>(GetSourcemapVersionsDocument, baseOptions)
}
export function useGetSourcemapVersionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSourcemapVersionsQuery,
		Types.GetSourcemapVersionsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSourcemapVersionsQuery,
		Types.GetSourcemapVersionsQueryVariables
	>(GetSourcemapVersionsDocument, baseOptions)
}
export type GetSourcemapVersionsQueryHookResult = ReturnType<
	typeof useGetSourcemapVersionsQuery
>
export type GetSourcemapVersionsLazyQueryHookResult = ReturnType<
	typeof useGetSourcemapVersionsLazyQuery
>
export type GetSourcemapVersionsQueryResult = Apollo.QueryResult<
	Types.GetSourcemapVersionsQuery,
	Types.GetSourcemapVersionsQueryVariables
>
