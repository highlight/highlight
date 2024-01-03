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
export const DiscordChannelFragmentFragmentDoc = gql`
	fragment DiscordChannelFragment on DiscordChannel {
		name
		id
	}
`
export const SessionAlertFragmentFragmentDoc = gql`
	fragment SessionAlertFragment on SessionAlert {
		ChannelsToNotify {
			webhook_channel
			webhook_channel_id
		}
		DiscordChannelsToNotify {
			...DiscordChannelFragment
		}
		WebhookDestinations {
			url
			authorization
		}
		CountThreshold
		DailyFrequency
		disabled
		default
		EmailsToNotify
		ExcludedEnvironments
		ExcludeRules
		id
		LastAdminToEditID
		Name
		updated_at
		ThresholdWindow
		TrackProperties {
			id
			name
			value
		}
		UserProperties {
			id
			name
			value
		}
		Type
	}
	${DiscordChannelFragmentFragmentDoc}
`
export const ErrorObjectFragmentDoc = gql`
	fragment ErrorObject on ErrorObject {
		id
		created_at
		project_id
		session_id
		trace_id
		span_id
		log_cursor
		session {
			identifier
			fingerprint
			secure_id
			city
			state
			country
			user_properties
			processed
			excluded
			excluded_reason
			session_feedback {
				id
				timestamp
				created_at
				updated_at
				project_id
				text
			}
		}
		error_group_id
		error_group_secure_id
		event
		type
		url
		source
		lineNumber
		columnNumber
		stack_trace
		structured_stack_trace {
			fileName
			lineNumber
			functionName
			columnNumber
			lineContent
			linesBefore
			linesAfter
			error
			enhancementSource
			enhancementVersion
			externalLink
			sourceMappingErrorMetadata {
				errorCode
				stackTraceFileURL
				sourcemapFetchStrategy
				sourceMapURL
				minifiedFetchStrategy
				actualMinifiedFetchedPath
				minifiedLineNumber
				minifiedColumnNumber
				actualSourcemapFetchedPath
				sourcemapFileSize
				minifiedFileSize
				mappedLineNumber
				mappedColumnNumber
			}
		}
		timestamp
		payload
		request_id
		os
		browser
		environment
		serviceVersion
		serviceName
	}
`
export const ErrorTagFragmentDoc = gql`
	fragment ErrorTag on ErrorTag {
		id
		created_at
		title
		description
	}
`
export const MarkErrorGroupAsViewedDocument = gql`
	mutation MarkErrorGroupAsViewed(
		$error_secure_id: String!
		$viewed: Boolean!
	) {
		markErrorGroupAsViewed(
			error_secure_id: $error_secure_id
			viewed: $viewed
		) {
			secure_id
			viewed
		}
	}
`
export type MarkErrorGroupAsViewedMutationFn = Apollo.MutationFunction<
	Types.MarkErrorGroupAsViewedMutation,
	Types.MarkErrorGroupAsViewedMutationVariables
>

/**
 * __useMarkErrorGroupAsViewedMutation__
 *
 * To run a mutation, you first call `useMarkErrorGroupAsViewedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkErrorGroupAsViewedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markErrorGroupAsViewedMutation, { data, loading, error }] = useMarkErrorGroupAsViewedMutation({
 *   variables: {
 *      error_secure_id: // value for 'error_secure_id'
 *      viewed: // value for 'viewed'
 *   },
 * });
 */
export function useMarkErrorGroupAsViewedMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.MarkErrorGroupAsViewedMutation,
		Types.MarkErrorGroupAsViewedMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.MarkErrorGroupAsViewedMutation,
		Types.MarkErrorGroupAsViewedMutationVariables
	>(MarkErrorGroupAsViewedDocument, baseOptions)
}
export type MarkErrorGroupAsViewedMutationHookResult = ReturnType<
	typeof useMarkErrorGroupAsViewedMutation
>
export type MarkErrorGroupAsViewedMutationResult =
	Apollo.MutationResult<Types.MarkErrorGroupAsViewedMutation>
export type MarkErrorGroupAsViewedMutationOptions = Apollo.BaseMutationOptions<
	Types.MarkErrorGroupAsViewedMutation,
	Types.MarkErrorGroupAsViewedMutationVariables
>
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
export const MuteSessionCommentThreadDocument = gql`
	mutation MuteSessionCommentThread($id: ID!, $has_muted: Boolean) {
		muteSessionCommentThread(id: $id, has_muted: $has_muted)
	}
`
export type MuteSessionCommentThreadMutationFn = Apollo.MutationFunction<
	Types.MuteSessionCommentThreadMutation,
	Types.MuteSessionCommentThreadMutationVariables
>

/**
 * __useMuteSessionCommentThreadMutation__
 *
 * To run a mutation, you first call `useMuteSessionCommentThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMuteSessionCommentThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [muteSessionCommentThreadMutation, { data, loading, error }] = useMuteSessionCommentThreadMutation({
 *   variables: {
 *      id: // value for 'id'
 *      has_muted: // value for 'has_muted'
 *   },
 * });
 */
export function useMuteSessionCommentThreadMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.MuteSessionCommentThreadMutation,
		Types.MuteSessionCommentThreadMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.MuteSessionCommentThreadMutation,
		Types.MuteSessionCommentThreadMutationVariables
	>(MuteSessionCommentThreadDocument, baseOptions)
}
export type MuteSessionCommentThreadMutationHookResult = ReturnType<
	typeof useMuteSessionCommentThreadMutation
>
export type MuteSessionCommentThreadMutationResult =
	Apollo.MutationResult<Types.MuteSessionCommentThreadMutation>
export type MuteSessionCommentThreadMutationOptions =
	Apollo.BaseMutationOptions<
		Types.MuteSessionCommentThreadMutation,
		Types.MuteSessionCommentThreadMutationVariables
	>
export const CreateOrUpdateStripeSubscriptionDocument = gql`
	mutation CreateOrUpdateStripeSubscription($workspace_id: ID!) {
		createOrUpdateStripeSubscription(workspace_id: $workspace_id)
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
export const SaveBillingPlanDocument = gql`
	mutation SaveBillingPlan(
		$workspace_id: ID!
		$sessionsLimitCents: Int
		$sessionsRetention: RetentionPeriod!
		$errorsLimitCents: Int
		$errorsRetention: RetentionPeriod!
		$logsLimitCents: Int
		$logsRetention: RetentionPeriod!
		$tracesLimitCents: Int
		$tracesRetention: RetentionPeriod!
	) {
		saveBillingPlan(
			workspace_id: $workspace_id
			sessionsLimitCents: $sessionsLimitCents
			sessionsRetention: $sessionsRetention
			errorsLimitCents: $errorsLimitCents
			errorsRetention: $errorsRetention
			logsLimitCents: $logsLimitCents
			logsRetention: $logsRetention
			tracesLimitCents: $tracesLimitCents
			tracesRetention: $tracesRetention
		)
	}
`
export type SaveBillingPlanMutationFn = Apollo.MutationFunction<
	Types.SaveBillingPlanMutation,
	Types.SaveBillingPlanMutationVariables
>

/**
 * __useSaveBillingPlanMutation__
 *
 * To run a mutation, you first call `useSaveBillingPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveBillingPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveBillingPlanMutation, { data, loading, error }] = useSaveBillingPlanMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      sessionsLimitCents: // value for 'sessionsLimitCents'
 *      sessionsRetention: // value for 'sessionsRetention'
 *      errorsLimitCents: // value for 'errorsLimitCents'
 *      errorsRetention: // value for 'errorsRetention'
 *      logsLimitCents: // value for 'logsLimitCents'
 *      logsRetention: // value for 'logsRetention'
 *      tracesLimitCents: // value for 'tracesLimitCents'
 *      tracesRetention: // value for 'tracesRetention'
 *   },
 * });
 */
export function useSaveBillingPlanMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.SaveBillingPlanMutation,
		Types.SaveBillingPlanMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.SaveBillingPlanMutation,
		Types.SaveBillingPlanMutationVariables
	>(SaveBillingPlanDocument, baseOptions)
}
export type SaveBillingPlanMutationHookResult = ReturnType<
	typeof useSaveBillingPlanMutation
>
export type SaveBillingPlanMutationResult =
	Apollo.MutationResult<Types.SaveBillingPlanMutation>
export type SaveBillingPlanMutationOptions = Apollo.BaseMutationOptions<
	Types.SaveBillingPlanMutation,
	Types.SaveBillingPlanMutationVariables
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
	mutation updateErrorGroupState(
		$secure_id: String!
		$state: ErrorState!
		$snoozed_until: Timestamp
	) {
		updateErrorGroupState(
			secure_id: $secure_id
			state: $state
			snoozed_until: $snoozed_until
		) {
			secure_id
			state
			snoozed_until
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
 *      snoozed_until: // value for 'snoozed_until'
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
export const AddIntegrationToWorkspaceDocument = gql`
	mutation AddIntegrationToWorkspace(
		$integration_type: IntegrationType
		$workspace_id: ID!
		$code: String!
	) {
		addIntegrationToWorkspace(
			integration_type: $integration_type
			workspace_id: $workspace_id
			code: $code
		)
	}
`
export type AddIntegrationToWorkspaceMutationFn = Apollo.MutationFunction<
	Types.AddIntegrationToWorkspaceMutation,
	Types.AddIntegrationToWorkspaceMutationVariables
>

/**
 * __useAddIntegrationToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddIntegrationToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddIntegrationToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addIntegrationToWorkspaceMutation, { data, loading, error }] = useAddIntegrationToWorkspaceMutation({
 *   variables: {
 *      integration_type: // value for 'integration_type'
 *      workspace_id: // value for 'workspace_id'
 *      code: // value for 'code'
 *   },
 * });
 */
export function useAddIntegrationToWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.AddIntegrationToWorkspaceMutation,
		Types.AddIntegrationToWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.AddIntegrationToWorkspaceMutation,
		Types.AddIntegrationToWorkspaceMutationVariables
	>(AddIntegrationToWorkspaceDocument, baseOptions)
}
export type AddIntegrationToWorkspaceMutationHookResult = ReturnType<
	typeof useAddIntegrationToWorkspaceMutation
>
export type AddIntegrationToWorkspaceMutationResult =
	Apollo.MutationResult<Types.AddIntegrationToWorkspaceMutation>
export type AddIntegrationToWorkspaceMutationOptions =
	Apollo.BaseMutationOptions<
		Types.AddIntegrationToWorkspaceMutation,
		Types.AddIntegrationToWorkspaceMutationVariables
	>
export const RemoveIntegrationFromWorkspaceDocument = gql`
	mutation RemoveIntegrationFromWorkspace(
		$integration_type: IntegrationType!
		$workspace_id: ID!
	) {
		removeIntegrationFromWorkspace(
			integration_type: $integration_type
			workspace_id: $workspace_id
		)
	}
`
export type RemoveIntegrationFromWorkspaceMutationFn = Apollo.MutationFunction<
	Types.RemoveIntegrationFromWorkspaceMutation,
	Types.RemoveIntegrationFromWorkspaceMutationVariables
>

/**
 * __useRemoveIntegrationFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useRemoveIntegrationFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveIntegrationFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeIntegrationFromWorkspaceMutation, { data, loading, error }] = useRemoveIntegrationFromWorkspaceMutation({
 *   variables: {
 *      integration_type: // value for 'integration_type'
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useRemoveIntegrationFromWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.RemoveIntegrationFromWorkspaceMutation,
		Types.RemoveIntegrationFromWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.RemoveIntegrationFromWorkspaceMutation,
		Types.RemoveIntegrationFromWorkspaceMutationVariables
	>(RemoveIntegrationFromWorkspaceDocument, baseOptions)
}
export type RemoveIntegrationFromWorkspaceMutationHookResult = ReturnType<
	typeof useRemoveIntegrationFromWorkspaceMutation
>
export type RemoveIntegrationFromWorkspaceMutationResult =
	Apollo.MutationResult<Types.RemoveIntegrationFromWorkspaceMutation>
export type RemoveIntegrationFromWorkspaceMutationOptions =
	Apollo.BaseMutationOptions<
		Types.RemoveIntegrationFromWorkspaceMutation,
		Types.RemoveIntegrationFromWorkspaceMutationVariables
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
export const CreateAdminDocument = gql`
	mutation CreateAdmin {
		createAdmin {
			id
			name
			email
			email_verified
			about_you_details_filled
		}
	}
`
export type CreateAdminMutationFn = Apollo.MutationFunction<
	Types.CreateAdminMutation,
	Types.CreateAdminMutationVariables
>

/**
 * __useCreateAdminMutation__
 *
 * To run a mutation, you first call `useCreateAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAdminMutation, { data, loading, error }] = useCreateAdminMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateAdminMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateAdminMutation,
		Types.CreateAdminMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateAdminMutation,
		Types.CreateAdminMutationVariables
	>(CreateAdminDocument, baseOptions)
}
export type CreateAdminMutationHookResult = ReturnType<
	typeof useCreateAdminMutation
>
export type CreateAdminMutationResult =
	Apollo.MutationResult<Types.CreateAdminMutation>
export type CreateAdminMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateAdminMutation,
	Types.CreateAdminMutationVariables
>
export const CreateWorkspaceDocument = gql`
	mutation CreateWorkspace($name: String!, $promo_code: String) {
		createWorkspace(name: $name, promo_code: $promo_code) {
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
 *      promo_code: // value for 'promo_code'
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
		$error_filters: StringArray
		$error_json_paths: StringArray
		$filter_chrome_extension: Boolean
		$rage_click_window_seconds: Int
		$rage_click_radius_pixels: Int
		$rage_click_count: Int
	) {
		editProject(
			id: $id
			name: $name
			billing_email: $billing_email
			excluded_users: $excluded_users
			error_filters: $error_filters
			error_json_paths: $error_json_paths
			filter_chrome_extension: $filter_chrome_extension
			rage_click_window_seconds: $rage_click_window_seconds
			rage_click_radius_pixels: $rage_click_radius_pixels
			rage_click_count: $rage_click_count
		) {
			id
			name
			billing_email
			excluded_users
			error_filters
			error_json_paths
			filter_chrome_extension
			rage_click_window_seconds
			rage_click_radius_pixels
			rage_click_count
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
 *      error_filters: // value for 'error_filters'
 *      error_json_paths: // value for 'error_json_paths'
 *      filter_chrome_extension: // value for 'filter_chrome_extension'
 *      rage_click_window_seconds: // value for 'rage_click_window_seconds'
 *      rage_click_radius_pixels: // value for 'rage_click_radius_pixels'
 *      rage_click_count: // value for 'rage_click_count'
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
export const EditProjectSettingsDocument = gql`
	mutation EditProjectSettings(
		$projectId: ID!
		$name: String
		$billing_email: String
		$excluded_users: StringArray
		$error_filters: StringArray
		$error_json_paths: StringArray
		$filter_chrome_extension: Boolean
		$rage_click_window_seconds: Int
		$rage_click_radius_pixels: Int
		$rage_click_count: Int
		$filterSessionsWithoutError: Boolean
		$autoResolveStaleErrorsDayInterval: Int
		$sampling: SamplingInput
	) {
		editProjectSettings(
			projectId: $projectId
			name: $name
			billing_email: $billing_email
			excluded_users: $excluded_users
			error_filters: $error_filters
			error_json_paths: $error_json_paths
			filter_chrome_extension: $filter_chrome_extension
			rage_click_window_seconds: $rage_click_window_seconds
			rage_click_radius_pixels: $rage_click_radius_pixels
			rage_click_count: $rage_click_count
			filterSessionsWithoutError: $filterSessionsWithoutError
			autoResolveStaleErrorsDayInterval: $autoResolveStaleErrorsDayInterval
			sampling: $sampling
		) {
			id
			name
			billing_email
			excluded_users
			error_filters
			error_json_paths
			filter_chrome_extension
			rage_click_window_seconds
			rage_click_radius_pixels
			rage_click_count
			filterSessionsWithoutError
			autoResolveStaleErrorsDayInterval
			sampling {
				session_sampling_rate
				error_sampling_rate
				log_sampling_rate
				trace_sampling_rate
				session_minute_rate_limit
				error_minute_rate_limit
				log_minute_rate_limit
				trace_minute_rate_limit
				session_exclusion_query
				error_exclusion_query
				log_exclusion_query
				trace_exclusion_query
			}
		}
	}
`
export type EditProjectSettingsMutationFn = Apollo.MutationFunction<
	Types.EditProjectSettingsMutation,
	Types.EditProjectSettingsMutationVariables
>

/**
 * __useEditProjectSettingsMutation__
 *
 * To run a mutation, you first call `useEditProjectSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditProjectSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editProjectSettingsMutation, { data, loading, error }] = useEditProjectSettingsMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *      billing_email: // value for 'billing_email'
 *      excluded_users: // value for 'excluded_users'
 *      error_filters: // value for 'error_filters'
 *      error_json_paths: // value for 'error_json_paths'
 *      filter_chrome_extension: // value for 'filter_chrome_extension'
 *      rage_click_window_seconds: // value for 'rage_click_window_seconds'
 *      rage_click_radius_pixels: // value for 'rage_click_radius_pixels'
 *      rage_click_count: // value for 'rage_click_count'
 *      filterSessionsWithoutError: // value for 'filterSessionsWithoutError'
 *      autoResolveStaleErrorsDayInterval: // value for 'autoResolveStaleErrorsDayInterval'
 *      sampling: // value for 'sampling'
 *   },
 * });
 */
export function useEditProjectSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditProjectSettingsMutation,
		Types.EditProjectSettingsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditProjectSettingsMutation,
		Types.EditProjectSettingsMutationVariables
	>(EditProjectSettingsDocument, baseOptions)
}
export type EditProjectSettingsMutationHookResult = ReturnType<
	typeof useEditProjectSettingsMutation
>
export type EditProjectSettingsMutationResult =
	Apollo.MutationResult<Types.EditProjectSettingsMutation>
export type EditProjectSettingsMutationOptions = Apollo.BaseMutationOptions<
	Types.EditProjectSettingsMutation,
	Types.EditProjectSettingsMutationVariables
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
export const EditWorkspaceSettingsDocument = gql`
	mutation EditWorkspaceSettings(
		$workspace_id: ID!
		$ai_application: Boolean
		$ai_insights: Boolean
	) {
		editWorkspaceSettings(
			workspace_id: $workspace_id
			ai_application: $ai_application
			ai_insights: $ai_insights
		) {
			workspace_id
			ai_application
			ai_insights
		}
	}
`
export type EditWorkspaceSettingsMutationFn = Apollo.MutationFunction<
	Types.EditWorkspaceSettingsMutation,
	Types.EditWorkspaceSettingsMutationVariables
>

/**
 * __useEditWorkspaceSettingsMutation__
 *
 * To run a mutation, you first call `useEditWorkspaceSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditWorkspaceSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editWorkspaceSettingsMutation, { data, loading, error }] = useEditWorkspaceSettingsMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      ai_application: // value for 'ai_application'
 *      ai_insights: // value for 'ai_insights'
 *   },
 * });
 */
export function useEditWorkspaceSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditWorkspaceSettingsMutation,
		Types.EditWorkspaceSettingsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditWorkspaceSettingsMutation,
		Types.EditWorkspaceSettingsMutationVariables
	>(EditWorkspaceSettingsDocument, baseOptions)
}
export type EditWorkspaceSettingsMutationHookResult = ReturnType<
	typeof useEditWorkspaceSettingsMutation
>
export type EditWorkspaceSettingsMutationResult =
	Apollo.MutationResult<Types.EditWorkspaceSettingsMutation>
export type EditWorkspaceSettingsMutationOptions = Apollo.BaseMutationOptions<
	Types.EditWorkspaceSettingsMutation,
	Types.EditWorkspaceSettingsMutationVariables
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
		$query: String!
		$name: String!
	) {
		editSegment(
			project_id: $project_id
			id: $id
			query: $query
			name: $name
		)
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
 *      query: // value for 'query'
 *      name: // value for 'name'
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
	mutation CreateSegment($project_id: ID!, $name: String!, $query: String!) {
		createSegment(project_id: $project_id, name: $name, query: $query) {
			name
			id
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
 *      query: // value for 'query'
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
		$issue_type_id: String
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
			issue_type_id: $issue_type_id
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
 *      issue_type_id: // value for 'issue_type_id'
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
		$issue_type_id: String
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
			issue_type_id: $issue_type_id
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
 *      issue_type_id: // value for 'issue_type_id'
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
		$issue_type_id: String
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
			issue_type_id: $issue_type_id
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
 *      issue_type_id: // value for 'issue_type_id'
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
		$issue_type_id: String
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
			issue_type_id: $issue_type_id
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
 *      issue_type_id: // value for 'issue_type_id'
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
export const MuteErrorCommentThreadDocument = gql`
	mutation MuteErrorCommentThread($id: ID!, $has_muted: Boolean) {
		muteErrorCommentThread(id: $id, has_muted: $has_muted)
	}
`
export type MuteErrorCommentThreadMutationFn = Apollo.MutationFunction<
	Types.MuteErrorCommentThreadMutation,
	Types.MuteErrorCommentThreadMutationVariables
>

/**
 * __useMuteErrorCommentThreadMutation__
 *
 * To run a mutation, you first call `useMuteErrorCommentThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMuteErrorCommentThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [muteErrorCommentThreadMutation, { data, loading, error }] = useMuteErrorCommentThreadMutation({
 *   variables: {
 *      id: // value for 'id'
 *      has_muted: // value for 'has_muted'
 *   },
 * });
 */
export function useMuteErrorCommentThreadMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.MuteErrorCommentThreadMutation,
		Types.MuteErrorCommentThreadMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.MuteErrorCommentThreadMutation,
		Types.MuteErrorCommentThreadMutationVariables
	>(MuteErrorCommentThreadDocument, baseOptions)
}
export type MuteErrorCommentThreadMutationHookResult = ReturnType<
	typeof useMuteErrorCommentThreadMutation
>
export type MuteErrorCommentThreadMutationResult =
	Apollo.MutationResult<Types.MuteErrorCommentThreadMutation>
export type MuteErrorCommentThreadMutationOptions = Apollo.BaseMutationOptions<
	Types.MuteErrorCommentThreadMutation,
	Types.MuteErrorCommentThreadMutationVariables
>
export const RemoveErrorIssueDocument = gql`
	mutation RemoveErrorIssue($error_issue_id: ID!) {
		removeErrorIssue(error_issue_id: $error_issue_id)
	}
`
export type RemoveErrorIssueMutationFn = Apollo.MutationFunction<
	Types.RemoveErrorIssueMutation,
	Types.RemoveErrorIssueMutationVariables
>

/**
 * __useRemoveErrorIssueMutation__
 *
 * To run a mutation, you first call `useRemoveErrorIssueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveErrorIssueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeErrorIssueMutation, { data, loading, error }] = useRemoveErrorIssueMutation({
 *   variables: {
 *      error_issue_id: // value for 'error_issue_id'
 *   },
 * });
 */
export function useRemoveErrorIssueMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.RemoveErrorIssueMutation,
		Types.RemoveErrorIssueMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.RemoveErrorIssueMutation,
		Types.RemoveErrorIssueMutationVariables
	>(RemoveErrorIssueDocument, baseOptions)
}
export type RemoveErrorIssueMutationHookResult = ReturnType<
	typeof useRemoveErrorIssueMutation
>
export type RemoveErrorIssueMutationResult =
	Apollo.MutationResult<Types.RemoveErrorIssueMutation>
export type RemoveErrorIssueMutationOptions = Apollo.BaseMutationOptions<
	Types.RemoveErrorIssueMutation,
	Types.RemoveErrorIssueMutationVariables
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
		$query: String!
		$name: String!
	) {
		editErrorSegment(
			project_id: $project_id
			id: $id
			query: $query
			name: $name
		)
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
 *      query: // value for 'query'
 *      name: // value for 'name'
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
		$query: String!
	) {
		createErrorSegment(
			project_id: $project_id
			name: $name
			query: $query
		) {
			name
			id
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
 *      query: // value for 'query'
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
		$discord_channels: [DiscordChannelInput!]!
		$webhook_destinations: [WebhookDestinationInput!]!
		$emails: [String]!
		$environments: [String]!
		$regex_groups: [String]!
		$frequency: Int!
		$default: Boolean
	) {
		createErrorAlert(
			project_id: $project_id
			count_threshold: $count_threshold
			name: $name
			slack_channels: $slack_channels
			discord_channels: $discord_channels
			webhook_destinations: $webhook_destinations
			emails: $emails
			environments: $environments
			threshold_window: $threshold_window
			regex_groups: $regex_groups
			frequency: $frequency
			default: $default
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
 *      discord_channels: // value for 'discord_channels'
 *      webhook_destinations: // value for 'webhook_destinations'
 *      emails: // value for 'emails'
 *      environments: // value for 'environments'
 *      regex_groups: // value for 'regex_groups'
 *      frequency: // value for 'frequency'
 *      default: // value for 'default'
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
		$discord_channels: [DiscordChannelInput!]!
		$webhook_destinations: [WebhookDestinationInput!]!
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
			discord_channels: $discord_channels
			webhook_destinations: $webhook_destinations
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
 *      discord_channels: // value for 'discord_channels'
 *      webhook_destinations: // value for 'webhook_destinations'
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
		$discord_channels: [DiscordChannelInput!]!
		$webhook_destinations: [WebhookDestinationInput!]!
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
			discord_channels: $discord_channels
			webhook_destinations: $webhook_destinations
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
 *      discord_channels: // value for 'discord_channels'
 *      webhook_destinations: // value for 'webhook_destinations'
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
export const UpdateAdminAndCreateWorkspaceDocument = gql`
	mutation UpdateAdminAndCreateWorkspace(
		$admin_and_workspace_details: AdminAndWorkspaceDetails!
	) {
		updateAdminAndCreateWorkspace(
			admin_and_workspace_details: $admin_and_workspace_details
		) {
			id
		}
	}
`
export type UpdateAdminAndCreateWorkspaceMutationFn = Apollo.MutationFunction<
	Types.UpdateAdminAndCreateWorkspaceMutation,
	Types.UpdateAdminAndCreateWorkspaceMutationVariables
>

/**
 * __useUpdateAdminAndCreateWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateAdminAndCreateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAdminAndCreateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAdminAndCreateWorkspaceMutation, { data, loading, error }] = useUpdateAdminAndCreateWorkspaceMutation({
 *   variables: {
 *      admin_and_workspace_details: // value for 'admin_and_workspace_details'
 *   },
 * });
 */
export function useUpdateAdminAndCreateWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateAdminAndCreateWorkspaceMutation,
		Types.UpdateAdminAndCreateWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateAdminAndCreateWorkspaceMutation,
		Types.UpdateAdminAndCreateWorkspaceMutationVariables
	>(UpdateAdminAndCreateWorkspaceDocument, baseOptions)
}
export type UpdateAdminAndCreateWorkspaceMutationHookResult = ReturnType<
	typeof useUpdateAdminAndCreateWorkspaceMutation
>
export type UpdateAdminAndCreateWorkspaceMutationResult =
	Apollo.MutationResult<Types.UpdateAdminAndCreateWorkspaceMutation>
export type UpdateAdminAndCreateWorkspaceMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateAdminAndCreateWorkspaceMutation,
		Types.UpdateAdminAndCreateWorkspaceMutationVariables
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
export const UpdateErrorAlertDocument = gql`
	mutation UpdateErrorAlert(
		$project_id: ID!
		$name: String
		$error_alert_id: ID!
		$count_threshold: Int
		$threshold_window: Int
		$slack_channels: [SanitizedSlackChannelInput]
		$discord_channels: [DiscordChannelInput!]!
		$webhook_destinations: [WebhookDestinationInput!]!
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
			discord_channels: $discord_channels
			webhook_destinations: $webhook_destinations
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
			DiscordChannelsToNotify {
				id
				name
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
 *      discord_channels: // value for 'discord_channels'
 *      webhook_destinations: // value for 'webhook_destinations'
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
export const UpdateLogAlertDocument = gql`
	mutation UpdateLogAlert($id: ID!, $input: LogAlertInput!) {
		updateLogAlert(id: $id, input: $input) {
			id
		}
	}
`
export type UpdateLogAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateLogAlertMutation,
	Types.UpdateLogAlertMutationVariables
>

/**
 * __useUpdateLogAlertMutation__
 *
 * To run a mutation, you first call `useUpdateLogAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLogAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLogAlertMutation, { data, loading, error }] = useUpdateLogAlertMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateLogAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateLogAlertMutation,
		Types.UpdateLogAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateLogAlertMutation,
		Types.UpdateLogAlertMutationVariables
	>(UpdateLogAlertDocument, baseOptions)
}
export type UpdateLogAlertMutationHookResult = ReturnType<
	typeof useUpdateLogAlertMutation
>
export type UpdateLogAlertMutationResult =
	Apollo.MutationResult<Types.UpdateLogAlertMutation>
export type UpdateLogAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateLogAlertMutation,
	Types.UpdateLogAlertMutationVariables
>
export const CreateLogAlertDocument = gql`
	mutation CreateLogAlert($input: LogAlertInput!) {
		createLogAlert(input: $input) {
			id
		}
	}
`
export type CreateLogAlertMutationFn = Apollo.MutationFunction<
	Types.CreateLogAlertMutation,
	Types.CreateLogAlertMutationVariables
>

/**
 * __useCreateLogAlertMutation__
 *
 * To run a mutation, you first call `useCreateLogAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLogAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLogAlertMutation, { data, loading, error }] = useCreateLogAlertMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateLogAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateLogAlertMutation,
		Types.CreateLogAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateLogAlertMutation,
		Types.CreateLogAlertMutationVariables
	>(CreateLogAlertDocument, baseOptions)
}
export type CreateLogAlertMutationHookResult = ReturnType<
	typeof useCreateLogAlertMutation
>
export type CreateLogAlertMutationResult =
	Apollo.MutationResult<Types.CreateLogAlertMutation>
export type CreateLogAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateLogAlertMutation,
	Types.CreateLogAlertMutationVariables
>
export const DeleteLogAlertDocument = gql`
	mutation DeleteLogAlert($project_id: ID!, $id: ID!) {
		deleteLogAlert(project_id: $project_id, id: $id) {
			id
		}
	}
`
export type DeleteLogAlertMutationFn = Apollo.MutationFunction<
	Types.DeleteLogAlertMutation,
	Types.DeleteLogAlertMutationVariables
>

/**
 * __useDeleteLogAlertMutation__
 *
 * To run a mutation, you first call `useDeleteLogAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteLogAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteLogAlertMutation, { data, loading, error }] = useDeleteLogAlertMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteLogAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteLogAlertMutation,
		Types.DeleteLogAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteLogAlertMutation,
		Types.DeleteLogAlertMutationVariables
	>(DeleteLogAlertDocument, baseOptions)
}
export type DeleteLogAlertMutationHookResult = ReturnType<
	typeof useDeleteLogAlertMutation
>
export type DeleteLogAlertMutationResult =
	Apollo.MutationResult<Types.DeleteLogAlertMutation>
export type DeleteLogAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteLogAlertMutation,
	Types.DeleteLogAlertMutationVariables
>
export const UpdateLogAlertIsDisabledDocument = gql`
	mutation UpdateLogAlertIsDisabled(
		$id: ID!
		$project_id: ID!
		$disabled: Boolean!
	) {
		updateLogAlertIsDisabled(
			id: $id
			project_id: $project_id
			disabled: $disabled
		) {
			id
		}
	}
`
export type UpdateLogAlertIsDisabledMutationFn = Apollo.MutationFunction<
	Types.UpdateLogAlertIsDisabledMutation,
	Types.UpdateLogAlertIsDisabledMutationVariables
>

/**
 * __useUpdateLogAlertIsDisabledMutation__
 *
 * To run a mutation, you first call `useUpdateLogAlertIsDisabledMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLogAlertIsDisabledMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLogAlertIsDisabledMutation, { data, loading, error }] = useUpdateLogAlertIsDisabledMutation({
 *   variables: {
 *      id: // value for 'id'
 *      project_id: // value for 'project_id'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateLogAlertIsDisabledMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateLogAlertIsDisabledMutation,
		Types.UpdateLogAlertIsDisabledMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateLogAlertIsDisabledMutation,
		Types.UpdateLogAlertIsDisabledMutationVariables
	>(UpdateLogAlertIsDisabledDocument, baseOptions)
}
export type UpdateLogAlertIsDisabledMutationHookResult = ReturnType<
	typeof useUpdateLogAlertIsDisabledMutation
>
export type UpdateLogAlertIsDisabledMutationResult =
	Apollo.MutationResult<Types.UpdateLogAlertIsDisabledMutation>
export type UpdateLogAlertIsDisabledMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateLogAlertIsDisabledMutation,
		Types.UpdateLogAlertIsDisabledMutationVariables
	>
export const UpdateSessionAlertIsDisabledDocument = gql`
	mutation UpdateSessionAlertIsDisabled(
		$id: ID!
		$project_id: ID!
		$disabled: Boolean!
	) {
		updateSessionAlertIsDisabled(
			id: $id
			project_id: $project_id
			disabled: $disabled
		) {
			id
		}
	}
`
export type UpdateSessionAlertIsDisabledMutationFn = Apollo.MutationFunction<
	Types.UpdateSessionAlertIsDisabledMutation,
	Types.UpdateSessionAlertIsDisabledMutationVariables
>

/**
 * __useUpdateSessionAlertIsDisabledMutation__
 *
 * To run a mutation, you first call `useUpdateSessionAlertIsDisabledMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSessionAlertIsDisabledMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSessionAlertIsDisabledMutation, { data, loading, error }] = useUpdateSessionAlertIsDisabledMutation({
 *   variables: {
 *      id: // value for 'id'
 *      project_id: // value for 'project_id'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateSessionAlertIsDisabledMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateSessionAlertIsDisabledMutation,
		Types.UpdateSessionAlertIsDisabledMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateSessionAlertIsDisabledMutation,
		Types.UpdateSessionAlertIsDisabledMutationVariables
	>(UpdateSessionAlertIsDisabledDocument, baseOptions)
}
export type UpdateSessionAlertIsDisabledMutationHookResult = ReturnType<
	typeof useUpdateSessionAlertIsDisabledMutation
>
export type UpdateSessionAlertIsDisabledMutationResult =
	Apollo.MutationResult<Types.UpdateSessionAlertIsDisabledMutation>
export type UpdateSessionAlertIsDisabledMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateSessionAlertIsDisabledMutation,
		Types.UpdateSessionAlertIsDisabledMutationVariables
	>
export const UpdateMetricMonitorIsDisabledDocument = gql`
	mutation UpdateMetricMonitorIsDisabled(
		$id: ID!
		$project_id: ID!
		$disabled: Boolean!
	) {
		updateMetricMonitorIsDisabled(
			id: $id
			project_id: $project_id
			disabled: $disabled
		) {
			id
		}
	}
`
export type UpdateMetricMonitorIsDisabledMutationFn = Apollo.MutationFunction<
	Types.UpdateMetricMonitorIsDisabledMutation,
	Types.UpdateMetricMonitorIsDisabledMutationVariables
>

/**
 * __useUpdateMetricMonitorIsDisabledMutation__
 *
 * To run a mutation, you first call `useUpdateMetricMonitorIsDisabledMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMetricMonitorIsDisabledMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMetricMonitorIsDisabledMutation, { data, loading, error }] = useUpdateMetricMonitorIsDisabledMutation({
 *   variables: {
 *      id: // value for 'id'
 *      project_id: // value for 'project_id'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateMetricMonitorIsDisabledMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateMetricMonitorIsDisabledMutation,
		Types.UpdateMetricMonitorIsDisabledMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateMetricMonitorIsDisabledMutation,
		Types.UpdateMetricMonitorIsDisabledMutationVariables
	>(UpdateMetricMonitorIsDisabledDocument, baseOptions)
}
export type UpdateMetricMonitorIsDisabledMutationHookResult = ReturnType<
	typeof useUpdateMetricMonitorIsDisabledMutation
>
export type UpdateMetricMonitorIsDisabledMutationResult =
	Apollo.MutationResult<Types.UpdateMetricMonitorIsDisabledMutation>
export type UpdateMetricMonitorIsDisabledMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateMetricMonitorIsDisabledMutation,
		Types.UpdateMetricMonitorIsDisabledMutationVariables
	>
export const UpdateErrorAlertIsDisabledDocument = gql`
	mutation UpdateErrorAlertIsDisabled(
		$id: ID!
		$project_id: ID!
		$disabled: Boolean!
	) {
		updateErrorAlertIsDisabled(
			id: $id
			project_id: $project_id
			disabled: $disabled
		) {
			id
		}
	}
`
export type UpdateErrorAlertIsDisabledMutationFn = Apollo.MutationFunction<
	Types.UpdateErrorAlertIsDisabledMutation,
	Types.UpdateErrorAlertIsDisabledMutationVariables
>

/**
 * __useUpdateErrorAlertIsDisabledMutation__
 *
 * To run a mutation, you first call `useUpdateErrorAlertIsDisabledMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateErrorAlertIsDisabledMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateErrorAlertIsDisabledMutation, { data, loading, error }] = useUpdateErrorAlertIsDisabledMutation({
 *   variables: {
 *      id: // value for 'id'
 *      project_id: // value for 'project_id'
 *      disabled: // value for 'disabled'
 *   },
 * });
 */
export function useUpdateErrorAlertIsDisabledMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateErrorAlertIsDisabledMutation,
		Types.UpdateErrorAlertIsDisabledMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateErrorAlertIsDisabledMutation,
		Types.UpdateErrorAlertIsDisabledMutationVariables
	>(UpdateErrorAlertIsDisabledDocument, baseOptions)
}
export type UpdateErrorAlertIsDisabledMutationHookResult = ReturnType<
	typeof useUpdateErrorAlertIsDisabledMutation
>
export type UpdateErrorAlertIsDisabledMutationResult =
	Apollo.MutationResult<Types.UpdateErrorAlertIsDisabledMutation>
export type UpdateErrorAlertIsDisabledMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateErrorAlertIsDisabledMutation,
		Types.UpdateErrorAlertIsDisabledMutationVariables
	>
export const CreateSessionAlertDocument = gql`
	mutation CreateSessionAlert($input: SessionAlertInput!) {
		createSessionAlert(input: $input) {
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
export type CreateSessionAlertMutationFn = Apollo.MutationFunction<
	Types.CreateSessionAlertMutation,
	Types.CreateSessionAlertMutationVariables
>

/**
 * __useCreateSessionAlertMutation__
 *
 * To run a mutation, you first call `useCreateSessionAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSessionAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSessionAlertMutation, { data, loading, error }] = useCreateSessionAlertMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSessionAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateSessionAlertMutation,
		Types.CreateSessionAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateSessionAlertMutation,
		Types.CreateSessionAlertMutationVariables
	>(CreateSessionAlertDocument, baseOptions)
}
export type CreateSessionAlertMutationHookResult = ReturnType<
	typeof useCreateSessionAlertMutation
>
export type CreateSessionAlertMutationResult =
	Apollo.MutationResult<Types.CreateSessionAlertMutation>
export type CreateSessionAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateSessionAlertMutation,
	Types.CreateSessionAlertMutationVariables
>
export const UpdateSessionAlertDocument = gql`
	mutation UpdateSessionAlert($id: ID!, $input: SessionAlertInput!) {
		updateSessionAlert(id: $id, input: $input) {
			id
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			DiscordChannelsToNotify {
				id
				name
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
export type UpdateSessionAlertMutationFn = Apollo.MutationFunction<
	Types.UpdateSessionAlertMutation,
	Types.UpdateSessionAlertMutationVariables
>

/**
 * __useUpdateSessionAlertMutation__
 *
 * To run a mutation, you first call `useUpdateSessionAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSessionAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSessionAlertMutation, { data, loading, error }] = useUpdateSessionAlertMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSessionAlertMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateSessionAlertMutation,
		Types.UpdateSessionAlertMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateSessionAlertMutation,
		Types.UpdateSessionAlertMutationVariables
	>(UpdateSessionAlertDocument, baseOptions)
}
export type UpdateSessionAlertMutationHookResult = ReturnType<
	typeof useUpdateSessionAlertMutation
>
export type UpdateSessionAlertMutationResult =
	Apollo.MutationResult<Types.UpdateSessionAlertMutation>
export type UpdateSessionAlertMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateSessionAlertMutation,
	Types.UpdateSessionAlertMutationVariables
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
export const DeleteSessionsDocument = gql`
	mutation DeleteSessions(
		$project_id: ID!
		$query: ClickhouseQuery!
		$sessionCount: Int!
	) {
		deleteSessions(
			project_id: $project_id
			query: $query
			sessionCount: $sessionCount
		)
	}
`
export type DeleteSessionsMutationFn = Apollo.MutationFunction<
	Types.DeleteSessionsMutation,
	Types.DeleteSessionsMutationVariables
>

/**
 * __useDeleteSessionsMutation__
 *
 * To run a mutation, you first call `useDeleteSessionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSessionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSessionsMutation, { data, loading, error }] = useDeleteSessionsMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *      sessionCount: // value for 'sessionCount'
 *   },
 * });
 */
export function useDeleteSessionsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteSessionsMutation,
		Types.DeleteSessionsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteSessionsMutation,
		Types.DeleteSessionsMutationVariables
	>(DeleteSessionsDocument, baseOptions)
}
export type DeleteSessionsMutationHookResult = ReturnType<
	typeof useDeleteSessionsMutation
>
export type DeleteSessionsMutationResult =
	Apollo.MutationResult<Types.DeleteSessionsMutation>
export type DeleteSessionsMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteSessionsMutation,
	Types.DeleteSessionsMutationVariables
>
export const ExportSessionDocument = gql`
	mutation ExportSession($session_secure_id: String!) {
		exportSession(session_secure_id: $session_secure_id)
	}
`
export type ExportSessionMutationFn = Apollo.MutationFunction<
	Types.ExportSessionMutation,
	Types.ExportSessionMutationVariables
>

/**
 * __useExportSessionMutation__
 *
 * To run a mutation, you first call `useExportSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExportSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [exportSessionMutation, { data, loading, error }] = useExportSessionMutation({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useExportSessionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.ExportSessionMutation,
		Types.ExportSessionMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.ExportSessionMutation,
		Types.ExportSessionMutationVariables
	>(ExportSessionDocument, baseOptions)
}
export type ExportSessionMutationHookResult = ReturnType<
	typeof useExportSessionMutation
>
export type ExportSessionMutationResult =
	Apollo.MutationResult<Types.ExportSessionMutation>
export type ExportSessionMutationOptions = Apollo.BaseMutationOptions<
	Types.ExportSessionMutation,
	Types.ExportSessionMutationVariables
>
export const UpdateVercelSettingsDocument = gql`
	mutation UpdateVercelSettings(
		$project_id: ID!
		$project_mappings: [VercelProjectMappingInput!]!
	) {
		updateVercelProjectMappings(
			project_id: $project_id
			project_mappings: $project_mappings
		)
	}
`
export type UpdateVercelSettingsMutationFn = Apollo.MutationFunction<
	Types.UpdateVercelSettingsMutation,
	Types.UpdateVercelSettingsMutationVariables
>

/**
 * __useUpdateVercelSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateVercelSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVercelSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVercelSettingsMutation, { data, loading, error }] = useUpdateVercelSettingsMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      project_mappings: // value for 'project_mappings'
 *   },
 * });
 */
export function useUpdateVercelSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateVercelSettingsMutation,
		Types.UpdateVercelSettingsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateVercelSettingsMutation,
		Types.UpdateVercelSettingsMutationVariables
	>(UpdateVercelSettingsDocument, baseOptions)
}
export type UpdateVercelSettingsMutationHookResult = ReturnType<
	typeof useUpdateVercelSettingsMutation
>
export type UpdateVercelSettingsMutationResult =
	Apollo.MutationResult<Types.UpdateVercelSettingsMutation>
export type UpdateVercelSettingsMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateVercelSettingsMutation,
	Types.UpdateVercelSettingsMutationVariables
>
export const UpdateClickUpSettingsDocument = gql`
	mutation UpdateClickUpSettings(
		$workspace_id: ID!
		$project_mappings: [ClickUpProjectMappingInput!]!
	) {
		updateClickUpProjectMappings(
			workspace_id: $workspace_id
			project_mappings: $project_mappings
		)
	}
`
export type UpdateClickUpSettingsMutationFn = Apollo.MutationFunction<
	Types.UpdateClickUpSettingsMutation,
	Types.UpdateClickUpSettingsMutationVariables
>

/**
 * __useUpdateClickUpSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateClickUpSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateClickUpSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateClickUpSettingsMutation, { data, loading, error }] = useUpdateClickUpSettingsMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      project_mappings: // value for 'project_mappings'
 *   },
 * });
 */
export function useUpdateClickUpSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateClickUpSettingsMutation,
		Types.UpdateClickUpSettingsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateClickUpSettingsMutation,
		Types.UpdateClickUpSettingsMutationVariables
	>(UpdateClickUpSettingsDocument, baseOptions)
}
export type UpdateClickUpSettingsMutationHookResult = ReturnType<
	typeof useUpdateClickUpSettingsMutation
>
export type UpdateClickUpSettingsMutationResult =
	Apollo.MutationResult<Types.UpdateClickUpSettingsMutation>
export type UpdateClickUpSettingsMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateClickUpSettingsMutation,
	Types.UpdateClickUpSettingsMutationVariables
>
export const UpdateIntegrationProjectSettingsDocument = gql`
	mutation UpdateIntegrationProjectSettings(
		$workspace_id: ID!
		$integration_type: IntegrationType!
		$project_mappings: [IntegrationProjectMappingInput!]!
	) {
		updateIntegrationProjectMappings(
			workspace_id: $workspace_id
			integration_type: $integration_type
			project_mappings: $project_mappings
		)
	}
`
export type UpdateIntegrationProjectSettingsMutationFn =
	Apollo.MutationFunction<
		Types.UpdateIntegrationProjectSettingsMutation,
		Types.UpdateIntegrationProjectSettingsMutationVariables
	>

/**
 * __useUpdateIntegrationProjectSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateIntegrationProjectSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIntegrationProjectSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIntegrationProjectSettingsMutation, { data, loading, error }] = useUpdateIntegrationProjectSettingsMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      integration_type: // value for 'integration_type'
 *      project_mappings: // value for 'project_mappings'
 *   },
 * });
 */
export function useUpdateIntegrationProjectSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateIntegrationProjectSettingsMutation,
		Types.UpdateIntegrationProjectSettingsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateIntegrationProjectSettingsMutation,
		Types.UpdateIntegrationProjectSettingsMutationVariables
	>(UpdateIntegrationProjectSettingsDocument, baseOptions)
}
export type UpdateIntegrationProjectSettingsMutationHookResult = ReturnType<
	typeof useUpdateIntegrationProjectSettingsMutation
>
export type UpdateIntegrationProjectSettingsMutationResult =
	Apollo.MutationResult<Types.UpdateIntegrationProjectSettingsMutation>
export type UpdateIntegrationProjectSettingsMutationOptions =
	Apollo.BaseMutationOptions<
		Types.UpdateIntegrationProjectSettingsMutation,
		Types.UpdateIntegrationProjectSettingsMutationVariables
	>
export const UpdateEmailOptOutDocument = gql`
	mutation UpdateEmailOptOut(
		$token: String
		$admin_id: ID
		$category: EmailOptOutCategory!
		$is_opt_out: Boolean!
	) {
		updateEmailOptOut(
			token: $token
			admin_id: $admin_id
			category: $category
			is_opt_out: $is_opt_out
		)
	}
`
export type UpdateEmailOptOutMutationFn = Apollo.MutationFunction<
	Types.UpdateEmailOptOutMutation,
	Types.UpdateEmailOptOutMutationVariables
>

/**
 * __useUpdateEmailOptOutMutation__
 *
 * To run a mutation, you first call `useUpdateEmailOptOutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEmailOptOutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEmailOptOutMutation, { data, loading, error }] = useUpdateEmailOptOutMutation({
 *   variables: {
 *      token: // value for 'token'
 *      admin_id: // value for 'admin_id'
 *      category: // value for 'category'
 *      is_opt_out: // value for 'is_opt_out'
 *   },
 * });
 */
export function useUpdateEmailOptOutMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateEmailOptOutMutation,
		Types.UpdateEmailOptOutMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateEmailOptOutMutation,
		Types.UpdateEmailOptOutMutationVariables
	>(UpdateEmailOptOutDocument, baseOptions)
}
export type UpdateEmailOptOutMutationHookResult = ReturnType<
	typeof useUpdateEmailOptOutMutation
>
export type UpdateEmailOptOutMutationResult =
	Apollo.MutationResult<Types.UpdateEmailOptOutMutation>
export type UpdateEmailOptOutMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateEmailOptOutMutation,
	Types.UpdateEmailOptOutMutationVariables
>
export const DeleteInviteLinkFromWorkspaceDocument = gql`
	mutation DeleteInviteLinkFromWorkspace(
		$workspace_id: ID!
		$workspace_invite_link_id: ID!
	) {
		deleteInviteLinkFromWorkspace(
			workspace_id: $workspace_id
			workspace_invite_link_id: $workspace_invite_link_id
		)
	}
`
export type DeleteInviteLinkFromWorkspaceMutationFn = Apollo.MutationFunction<
	Types.DeleteInviteLinkFromWorkspaceMutation,
	Types.DeleteInviteLinkFromWorkspaceMutationVariables
>

/**
 * __useDeleteInviteLinkFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useDeleteInviteLinkFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInviteLinkFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInviteLinkFromWorkspaceMutation, { data, loading, error }] = useDeleteInviteLinkFromWorkspaceMutation({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      workspace_invite_link_id: // value for 'workspace_invite_link_id'
 *   },
 * });
 */
export function useDeleteInviteLinkFromWorkspaceMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteInviteLinkFromWorkspaceMutation,
		Types.DeleteInviteLinkFromWorkspaceMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteInviteLinkFromWorkspaceMutation,
		Types.DeleteInviteLinkFromWorkspaceMutationVariables
	>(DeleteInviteLinkFromWorkspaceDocument, baseOptions)
}
export type DeleteInviteLinkFromWorkspaceMutationHookResult = ReturnType<
	typeof useDeleteInviteLinkFromWorkspaceMutation
>
export type DeleteInviteLinkFromWorkspaceMutationResult =
	Apollo.MutationResult<Types.DeleteInviteLinkFromWorkspaceMutation>
export type DeleteInviteLinkFromWorkspaceMutationOptions =
	Apollo.BaseMutationOptions<
		Types.DeleteInviteLinkFromWorkspaceMutation,
		Types.DeleteInviteLinkFromWorkspaceMutationVariables
	>
export const EditServiceGithubSettingsDocument = gql`
	mutation EditServiceGithubSettings(
		$id: ID!
		$project_id: ID!
		$github_repo_path: String
		$build_prefix: String
		$github_prefix: String
	) {
		editServiceGithubSettings(
			id: $id
			project_id: $project_id
			github_repo_path: $github_repo_path
			build_prefix: $build_prefix
			github_prefix: $github_prefix
		) {
			id
			projectID
			name
			status
			githubRepoPath
			buildPrefix
			githubPrefix
			errorDetails
		}
	}
`
export type EditServiceGithubSettingsMutationFn = Apollo.MutationFunction<
	Types.EditServiceGithubSettingsMutation,
	Types.EditServiceGithubSettingsMutationVariables
>

/**
 * __useEditServiceGithubSettingsMutation__
 *
 * To run a mutation, you first call `useEditServiceGithubSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditServiceGithubSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editServiceGithubSettingsMutation, { data, loading, error }] = useEditServiceGithubSettingsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      project_id: // value for 'project_id'
 *      github_repo_path: // value for 'github_repo_path'
 *      build_prefix: // value for 'build_prefix'
 *      github_prefix: // value for 'github_prefix'
 *   },
 * });
 */
export function useEditServiceGithubSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditServiceGithubSettingsMutation,
		Types.EditServiceGithubSettingsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditServiceGithubSettingsMutation,
		Types.EditServiceGithubSettingsMutationVariables
	>(EditServiceGithubSettingsDocument, baseOptions)
}
export type EditServiceGithubSettingsMutationHookResult = ReturnType<
	typeof useEditServiceGithubSettingsMutation
>
export type EditServiceGithubSettingsMutationResult =
	Apollo.MutationResult<Types.EditServiceGithubSettingsMutation>
export type EditServiceGithubSettingsMutationOptions =
	Apollo.BaseMutationOptions<
		Types.EditServiceGithubSettingsMutation,
		Types.EditServiceGithubSettingsMutationVariables
	>
export const CreateErrorTagDocument = gql`
	mutation CreateErrorTag($title: String!, $description: String!) {
		createErrorTag(title: $title, description: $description) {
			id
			created_at
			title
			description
		}
	}
`
export type CreateErrorTagMutationFn = Apollo.MutationFunction<
	Types.CreateErrorTagMutation,
	Types.CreateErrorTagMutationVariables
>

/**
 * __useCreateErrorTagMutation__
 *
 * To run a mutation, you first call `useCreateErrorTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateErrorTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createErrorTagMutation, { data, loading, error }] = useCreateErrorTagMutation({
 *   variables: {
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useCreateErrorTagMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateErrorTagMutation,
		Types.CreateErrorTagMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateErrorTagMutation,
		Types.CreateErrorTagMutationVariables
	>(CreateErrorTagDocument, baseOptions)
}
export type CreateErrorTagMutationHookResult = ReturnType<
	typeof useCreateErrorTagMutation
>
export type CreateErrorTagMutationResult =
	Apollo.MutationResult<Types.CreateErrorTagMutation>
export type CreateErrorTagMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateErrorTagMutation,
	Types.CreateErrorTagMutationVariables
>
export const UpdateErrorTagsDocument = gql`
	mutation UpdateErrorTags {
		updateErrorTags
	}
`
export type UpdateErrorTagsMutationFn = Apollo.MutationFunction<
	Types.UpdateErrorTagsMutation,
	Types.UpdateErrorTagsMutationVariables
>

/**
 * __useUpdateErrorTagsMutation__
 *
 * To run a mutation, you first call `useUpdateErrorTagsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateErrorTagsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateErrorTagsMutation, { data, loading, error }] = useUpdateErrorTagsMutation({
 *   variables: {
 *   },
 * });
 */
export function useUpdateErrorTagsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpdateErrorTagsMutation,
		Types.UpdateErrorTagsMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpdateErrorTagsMutation,
		Types.UpdateErrorTagsMutationVariables
	>(UpdateErrorTagsDocument, baseOptions)
}
export type UpdateErrorTagsMutationHookResult = ReturnType<
	typeof useUpdateErrorTagsMutation
>
export type UpdateErrorTagsMutationResult =
	Apollo.MutationResult<Types.UpdateErrorTagsMutation>
export type UpdateErrorTagsMutationOptions = Apollo.BaseMutationOptions<
	Types.UpdateErrorTagsMutation,
	Types.UpdateErrorTagsMutationVariables
>
export const UpsertSlackChannelDocument = gql`
	mutation UpsertSlackChannel($project_id: ID!, $name: String!) {
		upsertSlackChannel(project_id: $project_id, name: $name) {
			webhook_channel
			webhook_channel_id
		}
	}
`
export type UpsertSlackChannelMutationFn = Apollo.MutationFunction<
	Types.UpsertSlackChannelMutation,
	Types.UpsertSlackChannelMutationVariables
>

/**
 * __useUpsertSlackChannelMutation__
 *
 * To run a mutation, you first call `useUpsertSlackChannelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSlackChannelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSlackChannelMutation, { data, loading, error }] = useUpsertSlackChannelMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpsertSlackChannelMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpsertSlackChannelMutation,
		Types.UpsertSlackChannelMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpsertSlackChannelMutation,
		Types.UpsertSlackChannelMutationVariables
	>(UpsertSlackChannelDocument, baseOptions)
}
export type UpsertSlackChannelMutationHookResult = ReturnType<
	typeof useUpsertSlackChannelMutation
>
export type UpsertSlackChannelMutationResult =
	Apollo.MutationResult<Types.UpsertSlackChannelMutation>
export type UpsertSlackChannelMutationOptions = Apollo.BaseMutationOptions<
	Types.UpsertSlackChannelMutation,
	Types.UpsertSlackChannelMutationVariables
>
export const UpsertDiscordChannelDocument = gql`
	mutation UpsertDiscordChannel($project_id: ID!, $name: String!) {
		upsertDiscordChannel(project_id: $project_id, name: $name) {
			id
			name
		}
	}
`
export type UpsertDiscordChannelMutationFn = Apollo.MutationFunction<
	Types.UpsertDiscordChannelMutation,
	Types.UpsertDiscordChannelMutationVariables
>

/**
 * __useUpsertDiscordChannelMutation__
 *
 * To run a mutation, you first call `useUpsertDiscordChannelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertDiscordChannelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertDiscordChannelMutation, { data, loading, error }] = useUpsertDiscordChannelMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpsertDiscordChannelMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.UpsertDiscordChannelMutation,
		Types.UpsertDiscordChannelMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.UpsertDiscordChannelMutation,
		Types.UpsertDiscordChannelMutationVariables
	>(UpsertDiscordChannelDocument, baseOptions)
}
export type UpsertDiscordChannelMutationHookResult = ReturnType<
	typeof useUpsertDiscordChannelMutation
>
export type UpsertDiscordChannelMutationResult =
	Apollo.MutationResult<Types.UpsertDiscordChannelMutation>
export type UpsertDiscordChannelMutationOptions = Apollo.BaseMutationOptions<
	Types.UpsertDiscordChannelMutation,
	Types.UpsertDiscordChannelMutationVariables
>
export const TestErrorEnhancementDocument = gql`
	mutation testErrorEnhancement(
		$error_object_id: ID!
		$github_repo_path: String!
		$github_prefix: String
		$build_prefix: String
		$save_error: Boolean
	) {
		testErrorEnhancement(
			error_object_id: $error_object_id
			github_repo_path: $github_repo_path
			github_prefix: $github_prefix
			build_prefix: $build_prefix
			save_error: $save_error
		) {
			id
			type
			serviceName
			serviceVersion
			stack_trace
			structured_stack_trace {
				columnNumber
				enhancementSource
				enhancementVersion
				error
				externalLink
				fileName
				functionName
				lineContent
				lineNumber
				linesAfter
				linesBefore
			}
		}
	}
`
export type TestErrorEnhancementMutationFn = Apollo.MutationFunction<
	Types.TestErrorEnhancementMutation,
	Types.TestErrorEnhancementMutationVariables
>

/**
 * __useTestErrorEnhancementMutation__
 *
 * To run a mutation, you first call `useTestErrorEnhancementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTestErrorEnhancementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [testErrorEnhancementMutation, { data, loading, error }] = useTestErrorEnhancementMutation({
 *   variables: {
 *      error_object_id: // value for 'error_object_id'
 *      github_repo_path: // value for 'github_repo_path'
 *      github_prefix: // value for 'github_prefix'
 *      build_prefix: // value for 'build_prefix'
 *      save_error: // value for 'save_error'
 *   },
 * });
 */
export function useTestErrorEnhancementMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.TestErrorEnhancementMutation,
		Types.TestErrorEnhancementMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.TestErrorEnhancementMutation,
		Types.TestErrorEnhancementMutationVariables
	>(TestErrorEnhancementDocument, baseOptions)
}
export type TestErrorEnhancementMutationHookResult = ReturnType<
	typeof useTestErrorEnhancementMutation
>
export type TestErrorEnhancementMutationResult =
	Apollo.MutationResult<Types.TestErrorEnhancementMutation>
export type TestErrorEnhancementMutationOptions = Apollo.BaseMutationOptions<
	Types.TestErrorEnhancementMutation,
	Types.TestErrorEnhancementMutationVariables
>
export const DeleteSavedSegmentDocument = gql`
	mutation DeleteSavedSegment($segment_id: ID!) {
		deleteSavedSegment(segment_id: $segment_id)
	}
`
export type DeleteSavedSegmentMutationFn = Apollo.MutationFunction<
	Types.DeleteSavedSegmentMutation,
	Types.DeleteSavedSegmentMutationVariables
>

/**
 * __useDeleteSavedSegmentMutation__
 *
 * To run a mutation, you first call `useDeleteSavedSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSavedSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSavedSegmentMutation, { data, loading, error }] = useDeleteSavedSegmentMutation({
 *   variables: {
 *      segment_id: // value for 'segment_id'
 *   },
 * });
 */
export function useDeleteSavedSegmentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.DeleteSavedSegmentMutation,
		Types.DeleteSavedSegmentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.DeleteSavedSegmentMutation,
		Types.DeleteSavedSegmentMutationVariables
	>(DeleteSavedSegmentDocument, baseOptions)
}
export type DeleteSavedSegmentMutationHookResult = ReturnType<
	typeof useDeleteSavedSegmentMutation
>
export type DeleteSavedSegmentMutationResult =
	Apollo.MutationResult<Types.DeleteSavedSegmentMutation>
export type DeleteSavedSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.DeleteSavedSegmentMutation,
	Types.DeleteSavedSegmentMutationVariables
>
export const EditSavedSegmentDocument = gql`
	mutation EditSavedSegment(
		$project_id: ID!
		$id: ID!
		$query: String!
		$name: String!
		$entity_type: SavedSegmentEntityType!
	) {
		editSavedSegment(
			project_id: $project_id
			id: $id
			query: $query
			name: $name
			entity_type: $entity_type
		)
	}
`
export type EditSavedSegmentMutationFn = Apollo.MutationFunction<
	Types.EditSavedSegmentMutation,
	Types.EditSavedSegmentMutationVariables
>

/**
 * __useEditSavedSegmentMutation__
 *
 * To run a mutation, you first call `useEditSavedSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditSavedSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editSavedSegmentMutation, { data, loading, error }] = useEditSavedSegmentMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      id: // value for 'id'
 *      query: // value for 'query'
 *      name: // value for 'name'
 *      entity_type: // value for 'entity_type'
 *   },
 * });
 */
export function useEditSavedSegmentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.EditSavedSegmentMutation,
		Types.EditSavedSegmentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.EditSavedSegmentMutation,
		Types.EditSavedSegmentMutationVariables
	>(EditSavedSegmentDocument, baseOptions)
}
export type EditSavedSegmentMutationHookResult = ReturnType<
	typeof useEditSavedSegmentMutation
>
export type EditSavedSegmentMutationResult =
	Apollo.MutationResult<Types.EditSavedSegmentMutation>
export type EditSavedSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.EditSavedSegmentMutation,
	Types.EditSavedSegmentMutationVariables
>
export const CreateSavedSegmentDocument = gql`
	mutation CreateSavedSegment(
		$project_id: ID!
		$name: String!
		$query: String!
		$entity_type: SavedSegmentEntityType!
	) {
		createSavedSegment(
			project_id: $project_id
			entity_type: $entity_type
			name: $name
			query: $query
		) {
			name
			id
		}
	}
`
export type CreateSavedSegmentMutationFn = Apollo.MutationFunction<
	Types.CreateSavedSegmentMutation,
	Types.CreateSavedSegmentMutationVariables
>

/**
 * __useCreateSavedSegmentMutation__
 *
 * To run a mutation, you first call `useCreateSavedSegmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSavedSegmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSavedSegmentMutation, { data, loading, error }] = useCreateSavedSegmentMutation({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *      query: // value for 'query'
 *      entity_type: // value for 'entity_type'
 *   },
 * });
 */
export function useCreateSavedSegmentMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.CreateSavedSegmentMutation,
		Types.CreateSavedSegmentMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.CreateSavedSegmentMutation,
		Types.CreateSavedSegmentMutationVariables
	>(CreateSavedSegmentDocument, baseOptions)
}
export type CreateSavedSegmentMutationHookResult = ReturnType<
	typeof useCreateSavedSegmentMutation
>
export type CreateSavedSegmentMutationResult =
	Apollo.MutationResult<Types.CreateSavedSegmentMutation>
export type CreateSavedSegmentMutationOptions = Apollo.BaseMutationOptions<
	Types.CreateSavedSegmentMutation,
	Types.CreateSavedSegmentMutationVariables
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
			ip
			city
			state
			country
			postal
			fingerprint
			created_at
			payload_updated_at
			language
			user_object
			user_properties
			identifier
			identified
			client_id
			starred
			enable_strict_privacy
			privacy_setting
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
			excluded_reason
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
			web_socket_events_url
			timeline_indicators_url
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
export const GetSessionInsightDocument = gql`
	query GetSessionInsight($secure_id: String!) {
		session_insight(secure_id: $secure_id) {
			id
			insight
		}
	}
`

/**
 * __useGetSessionInsightQuery__
 *
 * To run a query within a React component, call `useGetSessionInsightQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionInsightQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionInsightQuery({
 *   variables: {
 *      secure_id: // value for 'secure_id'
 *   },
 * });
 */
export function useGetSessionInsightQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionInsightQuery,
		Types.GetSessionInsightQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionInsightQuery,
		Types.GetSessionInsightQueryVariables
	>(GetSessionInsightDocument, baseOptions)
}
export function useGetSessionInsightLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionInsightQuery,
		Types.GetSessionInsightQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionInsightQuery,
		Types.GetSessionInsightQueryVariables
	>(GetSessionInsightDocument, baseOptions)
}
export type GetSessionInsightQueryHookResult = ReturnType<
	typeof useGetSessionInsightQuery
>
export type GetSessionInsightLazyQueryHookResult = ReturnType<
	typeof useGetSessionInsightLazyQuery
>
export type GetSessionInsightQueryResult = Apollo.QueryResult<
	Types.GetSessionInsightQuery,
	Types.GetSessionInsightQueryVariables
>
export const GetSessionExportsDocument = gql`
	query GetSessionExports($project_id: ID!) {
		session_exports(project_id: $project_id) {
			created_at
			type
			url
			error
			secure_id
			identifier
			active_length
		}
	}
`

/**
 * __useGetSessionExportsQuery__
 *
 * To run a query within a React component, call `useGetSessionExportsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionExportsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionExportsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetSessionExportsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionExportsQuery,
		Types.GetSessionExportsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionExportsQuery,
		Types.GetSessionExportsQueryVariables
	>(GetSessionExportsDocument, baseOptions)
}
export function useGetSessionExportsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionExportsQuery,
		Types.GetSessionExportsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionExportsQuery,
		Types.GetSessionExportsQueryVariables
	>(GetSessionExportsDocument, baseOptions)
}
export type GetSessionExportsQueryHookResult = ReturnType<
	typeof useGetSessionExportsQuery
>
export type GetSessionExportsLazyQueryHookResult = ReturnType<
	typeof useGetSessionExportsLazyQuery
>
export type GetSessionExportsQueryResult = Apollo.QueryResult<
	Types.GetSessionExportsQuery,
	Types.GetSessionExportsQueryVariables
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
export const GetErrorIssuesDocument = gql`
	query GetErrorIssues($error_group_secure_id: String!) {
		error_issue(error_group_secure_id: $error_group_secure_id) {
			id
			integration_type
			external_id
			title
		}
	}
`

/**
 * __useGetErrorIssuesQuery__
 *
 * To run a query within a React component, call `useGetErrorIssuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorIssuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorIssuesQuery({
 *   variables: {
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *   },
 * });
 */
export function useGetErrorIssuesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorIssuesQuery,
		Types.GetErrorIssuesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorIssuesQuery,
		Types.GetErrorIssuesQueryVariables
	>(GetErrorIssuesDocument, baseOptions)
}
export function useGetErrorIssuesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorIssuesQuery,
		Types.GetErrorIssuesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorIssuesQuery,
		Types.GetErrorIssuesQueryVariables
	>(GetErrorIssuesDocument, baseOptions)
}
export type GetErrorIssuesQueryHookResult = ReturnType<
	typeof useGetErrorIssuesQuery
>
export type GetErrorIssuesLazyQueryHookResult = ReturnType<
	typeof useGetErrorIssuesLazyQuery
>
export type GetErrorIssuesQueryResult = Apollo.QueryResult<
	Types.GetErrorIssuesQuery,
	Types.GetErrorIssuesQueryVariables
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
export const GetWebSocketEventsDocument = gql`
	query GetWebSocketEvents($session_secure_id: String!) {
		websocket_events(session_secure_id: $session_secure_id)
	}
`

/**
 * __useGetWebSocketEventsQuery__
 *
 * To run a query within a React component, call `useGetWebSocketEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWebSocketEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWebSocketEventsQuery({
 *   variables: {
 *      session_secure_id: // value for 'session_secure_id'
 *   },
 * });
 */
export function useGetWebSocketEventsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWebSocketEventsQuery,
		Types.GetWebSocketEventsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWebSocketEventsQuery,
		Types.GetWebSocketEventsQueryVariables
	>(GetWebSocketEventsDocument, baseOptions)
}
export function useGetWebSocketEventsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWebSocketEventsQuery,
		Types.GetWebSocketEventsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWebSocketEventsQuery,
		Types.GetWebSocketEventsQueryVariables
	>(GetWebSocketEventsDocument, baseOptions)
}
export type GetWebSocketEventsQueryHookResult = ReturnType<
	typeof useGetWebSocketEventsQuery
>
export type GetWebSocketEventsLazyQueryHookResult = ReturnType<
	typeof useGetWebSocketEventsLazyQuery
>
export type GetWebSocketEventsQueryResult = Apollo.QueryResult<
	Types.GetWebSocketEventsQuery,
	Types.GetWebSocketEventsQueryVariables
>
export const GetFieldTypesClickhouseDocument = gql`
	query GetFieldTypesClickhouse(
		$project_id: ID!
		$start_date: Timestamp!
		$end_date: Timestamp!
	) {
		field_types: field_types_clickhouse(
			project_id: $project_id
			start_date: $start_date
			end_date: $end_date
		) {
			type
			name
		}
	}
`

/**
 * __useGetFieldTypesClickhouseQuery__
 *
 * To run a query within a React component, call `useGetFieldTypesClickhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFieldTypesClickhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFieldTypesClickhouseQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetFieldTypesClickhouseQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetFieldTypesClickhouseQuery,
		Types.GetFieldTypesClickhouseQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetFieldTypesClickhouseQuery,
		Types.GetFieldTypesClickhouseQueryVariables
	>(GetFieldTypesClickhouseDocument, baseOptions)
}
export function useGetFieldTypesClickhouseLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetFieldTypesClickhouseQuery,
		Types.GetFieldTypesClickhouseQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetFieldTypesClickhouseQuery,
		Types.GetFieldTypesClickhouseQueryVariables
	>(GetFieldTypesClickhouseDocument, baseOptions)
}
export type GetFieldTypesClickhouseQueryHookResult = ReturnType<
	typeof useGetFieldTypesClickhouseQuery
>
export type GetFieldTypesClickhouseLazyQueryHookResult = ReturnType<
	typeof useGetFieldTypesClickhouseLazyQuery
>
export type GetFieldTypesClickhouseQueryResult = Apollo.QueryResult<
	Types.GetFieldTypesClickhouseQuery,
	Types.GetFieldTypesClickhouseQueryVariables
>
export const GetFieldsClickhouseDocument = gql`
	query GetFieldsClickhouse(
		$project_id: ID!
		$count: Int!
		$field_type: String!
		$field_name: String!
		$query: String!
		$start_date: Timestamp!
		$end_date: Timestamp!
	) {
		fields_clickhouse(
			project_id: $project_id
			count: $count
			field_type: $field_type
			field_name: $field_name
			query: $query
			start_date: $start_date
			end_date: $end_date
		)
	}
`

/**
 * __useGetFieldsClickhouseQuery__
 *
 * To run a query within a React component, call `useGetFieldsClickhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFieldsClickhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFieldsClickhouseQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      field_type: // value for 'field_type'
 *      field_name: // value for 'field_name'
 *      query: // value for 'query'
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetFieldsClickhouseQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetFieldsClickhouseQuery,
		Types.GetFieldsClickhouseQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetFieldsClickhouseQuery,
		Types.GetFieldsClickhouseQueryVariables
	>(GetFieldsClickhouseDocument, baseOptions)
}
export function useGetFieldsClickhouseLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetFieldsClickhouseQuery,
		Types.GetFieldsClickhouseQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetFieldsClickhouseQuery,
		Types.GetFieldsClickhouseQueryVariables
	>(GetFieldsClickhouseDocument, baseOptions)
}
export type GetFieldsClickhouseQueryHookResult = ReturnType<
	typeof useGetFieldsClickhouseQuery
>
export type GetFieldsClickhouseLazyQueryHookResult = ReturnType<
	typeof useGetFieldsClickhouseLazyQuery
>
export type GetFieldsClickhouseQueryResult = Apollo.QueryResult<
	Types.GetFieldsClickhouseQuery,
	Types.GetFieldsClickhouseQueryVariables
>
export const GetErrorFieldsClickhouseDocument = gql`
	query GetErrorFieldsClickhouse(
		$project_id: ID!
		$count: Int!
		$field_type: String!
		$field_name: String!
		$query: String!
		$start_date: Timestamp!
		$end_date: Timestamp!
	) {
		error_fields_clickhouse(
			project_id: $project_id
			count: $count
			field_type: $field_type
			field_name: $field_name
			query: $query
			start_date: $start_date
			end_date: $end_date
		)
	}
`

/**
 * __useGetErrorFieldsClickhouseQuery__
 *
 * To run a query within a React component, call `useGetErrorFieldsClickhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorFieldsClickhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorFieldsClickhouseQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      field_type: // value for 'field_type'
 *      field_name: // value for 'field_name'
 *      query: // value for 'query'
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetErrorFieldsClickhouseQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorFieldsClickhouseQuery,
		Types.GetErrorFieldsClickhouseQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorFieldsClickhouseQuery,
		Types.GetErrorFieldsClickhouseQueryVariables
	>(GetErrorFieldsClickhouseDocument, baseOptions)
}
export function useGetErrorFieldsClickhouseLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorFieldsClickhouseQuery,
		Types.GetErrorFieldsClickhouseQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorFieldsClickhouseQuery,
		Types.GetErrorFieldsClickhouseQueryVariables
	>(GetErrorFieldsClickhouseDocument, baseOptions)
}
export type GetErrorFieldsClickhouseQueryHookResult = ReturnType<
	typeof useGetErrorFieldsClickhouseQuery
>
export type GetErrorFieldsClickhouseLazyQueryHookResult = ReturnType<
	typeof useGetErrorFieldsClickhouseLazyQuery
>
export type GetErrorFieldsClickhouseQueryResult = Apollo.QueryResult<
	Types.GetErrorFieldsClickhouseQuery,
	Types.GetErrorFieldsClickhouseQueryVariables
>
export const GetSessionsClickhouseDocument = gql`
	query GetSessionsClickhouse(
		$project_id: ID!
		$count: Int!
		$query: ClickhouseQuery!
		$sort_desc: Boolean!
		$sort_field: String
		$page: Int
	) {
		sessions_clickhouse(
			project_id: $project_id
			count: $count
			query: $query
			sort_field: $sort_field
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
				ip
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
				is_public
				excluded
			}
			totalCount
		}
	}
`

/**
 * __useGetSessionsClickhouseQuery__
 *
 * To run a query within a React component, call `useGetSessionsClickhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsClickhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsClickhouseQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      query: // value for 'query'
 *      sort_desc: // value for 'sort_desc'
 *      sort_field: // value for 'sort_field'
 *      page: // value for 'page'
 *   },
 * });
 */
export function useGetSessionsClickhouseQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionsClickhouseQuery,
		Types.GetSessionsClickhouseQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionsClickhouseQuery,
		Types.GetSessionsClickhouseQueryVariables
	>(GetSessionsClickhouseDocument, baseOptions)
}
export function useGetSessionsClickhouseLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionsClickhouseQuery,
		Types.GetSessionsClickhouseQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionsClickhouseQuery,
		Types.GetSessionsClickhouseQueryVariables
	>(GetSessionsClickhouseDocument, baseOptions)
}
export type GetSessionsClickhouseQueryHookResult = ReturnType<
	typeof useGetSessionsClickhouseQuery
>
export type GetSessionsClickhouseLazyQueryHookResult = ReturnType<
	typeof useGetSessionsClickhouseLazyQuery
>
export type GetSessionsClickhouseQueryResult = Apollo.QueryResult<
	Types.GetSessionsClickhouseQuery,
	Types.GetSessionsClickhouseQueryVariables
>
export const GetSessionsHistogramClickhouseDocument = gql`
	query GetSessionsHistogramClickhouse(
		$project_id: ID!
		$query: ClickhouseQuery!
		$histogram_options: DateHistogramOptions!
	) {
		sessions_histogram_clickhouse(
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
 * __useGetSessionsHistogramClickhouseQuery__
 *
 * To run a query within a React component, call `useGetSessionsHistogramClickhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsHistogramClickhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsHistogramClickhouseQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *      histogram_options: // value for 'histogram_options'
 *   },
 * });
 */
export function useGetSessionsHistogramClickhouseQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionsHistogramClickhouseQuery,
		Types.GetSessionsHistogramClickhouseQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionsHistogramClickhouseQuery,
		Types.GetSessionsHistogramClickhouseQueryVariables
	>(GetSessionsHistogramClickhouseDocument, baseOptions)
}
export function useGetSessionsHistogramClickhouseLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionsHistogramClickhouseQuery,
		Types.GetSessionsHistogramClickhouseQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionsHistogramClickhouseQuery,
		Types.GetSessionsHistogramClickhouseQueryVariables
	>(GetSessionsHistogramClickhouseDocument, baseOptions)
}
export type GetSessionsHistogramClickhouseQueryHookResult = ReturnType<
	typeof useGetSessionsHistogramClickhouseQuery
>
export type GetSessionsHistogramClickhouseLazyQueryHookResult = ReturnType<
	typeof useGetSessionsHistogramClickhouseLazyQuery
>
export type GetSessionsHistogramClickhouseQueryResult = Apollo.QueryResult<
	Types.GetSessionsHistogramClickhouseQuery,
	Types.GetSessionsHistogramClickhouseQueryVariables
>
export const GetSessionsReportDocument = gql`
	query GetSessionsReport($project_id: ID!, $query: ClickhouseQuery!) {
		sessions_report(project_id: $project_id, query: $query) {
			key
			user_properties
			num_sessions
			num_days_visited
			num_months_visited
			avg_active_length_mins
			max_active_length_mins
			total_active_length_mins
			avg_length_mins
			max_length_mins
			total_length_mins
			location
		}
	}
`

/**
 * __useGetSessionsReportQuery__
 *
 * To run a query within a React component, call `useGetSessionsReportQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsReportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsReportQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetSessionsReportQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionsReportQuery,
		Types.GetSessionsReportQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionsReportQuery,
		Types.GetSessionsReportQueryVariables
	>(GetSessionsReportDocument, baseOptions)
}
export function useGetSessionsReportLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionsReportQuery,
		Types.GetSessionsReportQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionsReportQuery,
		Types.GetSessionsReportQueryVariables
	>(GetSessionsReportDocument, baseOptions)
}
export type GetSessionsReportQueryHookResult = ReturnType<
	typeof useGetSessionsReportQuery
>
export type GetSessionsReportLazyQueryHookResult = ReturnType<
	typeof useGetSessionsReportLazyQuery
>
export type GetSessionsReportQueryResult = Apollo.QueryResult<
	Types.GetSessionsReportQuery,
	Types.GetSessionsReportQueryVariables
>
export const GetErrorGroupsClickhouseDocument = gql`
	query GetErrorGroupsClickhouse(
		$project_id: ID!
		$count: Int!
		$query: ClickhouseQuery!
		$page: Int
	) {
		error_groups_clickhouse(
			project_id: $project_id
			count: $count
			query: $query
			page: $page
		) {
			error_groups {
				created_at
				updated_at
				id
				secure_id
				type
				event
				state
				state
				snoozed_until
				environments
				stack_trace
				structured_stack_trace {
					fileName
					lineNumber
					functionName
					columnNumber
				}
				error_frequency
				error_metrics {
					error_group_id
					date
					name
					value
				}
				is_public
				project_id
				error_tag {
					id
					created_at
					title
					description
				}
			}
			totalCount
		}
	}
`

/**
 * __useGetErrorGroupsClickhouseQuery__
 *
 * To run a query within a React component, call `useGetErrorGroupsClickhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorGroupsClickhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorGroupsClickhouseQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      count: // value for 'count'
 *      query: // value for 'query'
 *      page: // value for 'page'
 *   },
 * });
 */
export function useGetErrorGroupsClickhouseQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorGroupsClickhouseQuery,
		Types.GetErrorGroupsClickhouseQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorGroupsClickhouseQuery,
		Types.GetErrorGroupsClickhouseQueryVariables
	>(GetErrorGroupsClickhouseDocument, baseOptions)
}
export function useGetErrorGroupsClickhouseLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorGroupsClickhouseQuery,
		Types.GetErrorGroupsClickhouseQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorGroupsClickhouseQuery,
		Types.GetErrorGroupsClickhouseQueryVariables
	>(GetErrorGroupsClickhouseDocument, baseOptions)
}
export type GetErrorGroupsClickhouseQueryHookResult = ReturnType<
	typeof useGetErrorGroupsClickhouseQuery
>
export type GetErrorGroupsClickhouseLazyQueryHookResult = ReturnType<
	typeof useGetErrorGroupsClickhouseLazyQuery
>
export type GetErrorGroupsClickhouseQueryResult = Apollo.QueryResult<
	Types.GetErrorGroupsClickhouseQuery,
	Types.GetErrorGroupsClickhouseQueryVariables
>
export const GetErrorsHistogramClickhouseDocument = gql`
	query GetErrorsHistogramClickhouse(
		$project_id: ID!
		$query: ClickhouseQuery!
		$histogram_options: DateHistogramOptions!
	) {
		errors_histogram_clickhouse(
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
 * __useGetErrorsHistogramClickhouseQuery__
 *
 * To run a query within a React component, call `useGetErrorsHistogramClickhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorsHistogramClickhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorsHistogramClickhouseQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *      histogram_options: // value for 'histogram_options'
 *   },
 * });
 */
export function useGetErrorsHistogramClickhouseQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorsHistogramClickhouseQuery,
		Types.GetErrorsHistogramClickhouseQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorsHistogramClickhouseQuery,
		Types.GetErrorsHistogramClickhouseQueryVariables
	>(GetErrorsHistogramClickhouseDocument, baseOptions)
}
export function useGetErrorsHistogramClickhouseLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorsHistogramClickhouseQuery,
		Types.GetErrorsHistogramClickhouseQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorsHistogramClickhouseQuery,
		Types.GetErrorsHistogramClickhouseQueryVariables
	>(GetErrorsHistogramClickhouseDocument, baseOptions)
}
export type GetErrorsHistogramClickhouseQueryHookResult = ReturnType<
	typeof useGetErrorsHistogramClickhouseQuery
>
export type GetErrorsHistogramClickhouseLazyQueryHookResult = ReturnType<
	typeof useGetErrorsHistogramClickhouseLazyQuery
>
export type GetErrorsHistogramClickhouseQueryResult = Apollo.QueryResult<
	Types.GetErrorsHistogramClickhouseQuery,
	Types.GetErrorsHistogramClickhouseQueryVariables
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
export const GetWorkspaceForInviteLinkDocument = gql`
	query GetWorkspaceForInviteLink($secret: String!) {
		workspace_for_invite_link(secret: $secret) {
			expiration_date
			existing_account
			invitee_email
			secret
			workspace_id
			workspace_name
		}
	}
`

/**
 * __useGetWorkspaceForInviteLinkQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceForInviteLinkQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceForInviteLinkQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceForInviteLinkQuery({
 *   variables: {
 *      secret: // value for 'secret'
 *   },
 * });
 */
export function useGetWorkspaceForInviteLinkQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceForInviteLinkQuery,
		Types.GetWorkspaceForInviteLinkQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceForInviteLinkQuery,
		Types.GetWorkspaceForInviteLinkQueryVariables
	>(GetWorkspaceForInviteLinkDocument, baseOptions)
}
export function useGetWorkspaceForInviteLinkLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceForInviteLinkQuery,
		Types.GetWorkspaceForInviteLinkQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceForInviteLinkQuery,
		Types.GetWorkspaceForInviteLinkQueryVariables
	>(GetWorkspaceForInviteLinkDocument, baseOptions)
}
export type GetWorkspaceForInviteLinkQueryHookResult = ReturnType<
	typeof useGetWorkspaceForInviteLinkQuery
>
export type GetWorkspaceForInviteLinkLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceForInviteLinkLazyQuery
>
export type GetWorkspaceForInviteLinkQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceForInviteLinkQuery,
	Types.GetWorkspaceForInviteLinkQueryVariables
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
			error_filters
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
			error_filters
			error_json_paths
			filter_chrome_extension
			rage_click_window_seconds
			rage_click_radius_pixels
			rage_click_count
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
				interval
				membersLimit
				sessionsLimit
				errorsLimit
				logsLimit
				tracesLimit
				sessionsRate
				errorsRate
				logsRate
				tracesRate
			}
			meter
			membersMeter
			errorsMeter
			logsMeter
			tracesMeter
			sessionsBillingLimit
			errorsBillingLimit
			logsBillingLimit
			tracesBillingLimit
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
				interval
				membersLimit
				sessionsLimit
				errorsLimit
				logsLimit
				tracesLimit
				sessionsRate
				errorsRate
				logsRate
				tracesRate
				enableBillingLimits
			}
			meter
			membersMeter
			errorsMeter
			logsMeter
			tracesMeter
			sessionsBillingLimit
			errorsBillingLimit
			logsBillingLimit
			sessionsDailyAverage
			errorsDailyAverage
			logsDailyAverage
			tracesDailyAverage
		}
		subscription_details(workspace_id: $workspace_id) {
			baseAmount
			discount {
				name
				amount
				percent
				until
			}
			lastInvoice {
				amountDue
				amountPaid
				attemptCount
				date
				url
				status
			}
			billingIssue
			billingIngestBlocked
		}
		workspace(id: $workspace_id) {
			id
			trial_end_date
			billing_period_end
			next_invoice_date
			allow_meter_overage
			eligible_for_trial_extension
			retention_period
			errors_retention_period
			sessions_max_cents
			errors_max_cents
			logs_max_cents
			traces_max_cents
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
			discount {
				name
				amount
				percent
				until
			}
			lastInvoice {
				amountDue
				amountPaid
				attemptCount
				date
				url
				status
			}
			billingIssue
			billingIngestBlocked
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
	query GetErrorGroup($secure_id: String!, $use_clickhouse: Boolean) {
		error_group(secure_id: $secure_id, use_clickhouse: $use_clickhouse) {
			created_at
			updated_at
			id
			secure_id
			type
			project_id
			event
			state
			snoozed_until
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
			error_metrics {
				error_group_id
				date
				name
				value
			}
			is_public
			last_occurrence
			first_occurrence
			serviceName
			error_tag {
				id
				created_at
				title
				description
			}
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
 *      use_clickhouse: // value for 'use_clickhouse'
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
export const GetErrorObjectForLogDocument = gql`
	query GetErrorObjectForLog($log_cursor: String!) {
		error_object_for_log(log_cursor: $log_cursor) {
			id
			error_group_secure_id
			project_id
		}
	}
`

/**
 * __useGetErrorObjectForLogQuery__
 *
 * To run a query within a React component, call `useGetErrorObjectForLogQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorObjectForLogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorObjectForLogQuery({
 *   variables: {
 *      log_cursor: // value for 'log_cursor'
 *   },
 * });
 */
export function useGetErrorObjectForLogQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorObjectForLogQuery,
		Types.GetErrorObjectForLogQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorObjectForLogQuery,
		Types.GetErrorObjectForLogQueryVariables
	>(GetErrorObjectForLogDocument, baseOptions)
}
export function useGetErrorObjectForLogLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorObjectForLogQuery,
		Types.GetErrorObjectForLogQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorObjectForLogQuery,
		Types.GetErrorObjectForLogQueryVariables
	>(GetErrorObjectForLogDocument, baseOptions)
}
export type GetErrorObjectForLogQueryHookResult = ReturnType<
	typeof useGetErrorObjectForLogQuery
>
export type GetErrorObjectForLogLazyQueryHookResult = ReturnType<
	typeof useGetErrorObjectForLogLazyQuery
>
export type GetErrorObjectForLogQueryResult = Apollo.QueryResult<
	Types.GetErrorObjectForLogQuery,
	Types.GetErrorObjectForLogQueryVariables
>
export const GetErrorObjectDocument = gql`
	query GetErrorObject($id: ID!) {
		error_object(id: $id) {
			...ErrorObject
		}
	}
	${ErrorObjectFragmentDoc}
`

/**
 * __useGetErrorObjectQuery__
 *
 * To run a query within a React component, call `useGetErrorObjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorObjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorObjectQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetErrorObjectQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorObjectQuery,
		Types.GetErrorObjectQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorObjectQuery,
		Types.GetErrorObjectQueryVariables
	>(GetErrorObjectDocument, baseOptions)
}
export function useGetErrorObjectLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorObjectQuery,
		Types.GetErrorObjectQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorObjectQuery,
		Types.GetErrorObjectQueryVariables
	>(GetErrorObjectDocument, baseOptions)
}
export type GetErrorObjectQueryHookResult = ReturnType<
	typeof useGetErrorObjectQuery
>
export type GetErrorObjectLazyQueryHookResult = ReturnType<
	typeof useGetErrorObjectLazyQuery
>
export type GetErrorObjectQueryResult = Apollo.QueryResult<
	Types.GetErrorObjectQuery,
	Types.GetErrorObjectQueryVariables
>
export const GetErrorInstanceDocument = gql`
	query GetErrorInstance(
		$error_group_secure_id: String!
		$error_object_id: ID
	) {
		error_instance(
			error_group_secure_id: $error_group_secure_id
			error_object_id: $error_object_id
		) {
			error_object {
				...ErrorObject
			}
			next_id
			previous_id
		}
	}
	${ErrorObjectFragmentDoc}
`

/**
 * __useGetErrorInstanceQuery__
 *
 * To run a query within a React component, call `useGetErrorInstanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorInstanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorInstanceQuery({
 *   variables: {
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *      error_object_id: // value for 'error_object_id'
 *   },
 * });
 */
export function useGetErrorInstanceQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorInstanceQuery,
		Types.GetErrorInstanceQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorInstanceQuery,
		Types.GetErrorInstanceQueryVariables
	>(GetErrorInstanceDocument, baseOptions)
}
export function useGetErrorInstanceLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorInstanceQuery,
		Types.GetErrorInstanceQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorInstanceQuery,
		Types.GetErrorInstanceQueryVariables
	>(GetErrorInstanceDocument, baseOptions)
}
export type GetErrorInstanceQueryHookResult = ReturnType<
	typeof useGetErrorInstanceQuery
>
export type GetErrorInstanceLazyQueryHookResult = ReturnType<
	typeof useGetErrorInstanceLazyQuery
>
export type GetErrorInstanceQueryResult = Apollo.QueryResult<
	Types.GetErrorInstanceQuery,
	Types.GetErrorInstanceQueryVariables
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
		segments: error_segments(project_id: $project_id) {
			id
			name
			params {
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
export const GetSavedSegmentsDocument = gql`
	query GetSavedSegments(
		$project_id: ID!
		$entity_type: SavedSegmentEntityType!
	) {
		saved_segments(project_id: $project_id, entity_type: $entity_type) {
			id
			name
			params {
				query
			}
		}
	}
`

/**
 * __useGetSavedSegmentsQuery__
 *
 * To run a query within a React component, call `useGetSavedSegmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSavedSegmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSavedSegmentsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      entity_type: // value for 'entity_type'
 *   },
 * });
 */
export function useGetSavedSegmentsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSavedSegmentsQuery,
		Types.GetSavedSegmentsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSavedSegmentsQuery,
		Types.GetSavedSegmentsQueryVariables
	>(GetSavedSegmentsDocument, baseOptions)
}
export function useGetSavedSegmentsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSavedSegmentsQuery,
		Types.GetSavedSegmentsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSavedSegmentsQuery,
		Types.GetSavedSegmentsQueryVariables
	>(GetSavedSegmentsDocument, baseOptions)
}
export type GetSavedSegmentsQueryHookResult = ReturnType<
	typeof useGetSavedSegmentsQuery
>
export type GetSavedSegmentsLazyQueryHookResult = ReturnType<
	typeof useGetSavedSegmentsLazyQuery
>
export type GetSavedSegmentsQueryResult = Apollo.QueryResult<
	Types.GetSavedSegmentsQuery,
	Types.GetSavedSegmentsQueryVariables
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
export const GetClientIntegrationDocument = gql`
	query GetClientIntegration($project_id: ID!) {
		clientIntegration(project_id: $project_id) {
			integrated
			resourceType
			createdAt
		}
	}
`

/**
 * __useGetClientIntegrationQuery__
 *
 * To run a query within a React component, call `useGetClientIntegrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClientIntegrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClientIntegrationQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetClientIntegrationQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetClientIntegrationQuery,
		Types.GetClientIntegrationQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetClientIntegrationQuery,
		Types.GetClientIntegrationQueryVariables
	>(GetClientIntegrationDocument, baseOptions)
}
export function useGetClientIntegrationLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetClientIntegrationQuery,
		Types.GetClientIntegrationQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetClientIntegrationQuery,
		Types.GetClientIntegrationQueryVariables
	>(GetClientIntegrationDocument, baseOptions)
}
export type GetClientIntegrationQueryHookResult = ReturnType<
	typeof useGetClientIntegrationQuery
>
export type GetClientIntegrationLazyQueryHookResult = ReturnType<
	typeof useGetClientIntegrationLazyQuery
>
export type GetClientIntegrationQueryResult = Apollo.QueryResult<
	Types.GetClientIntegrationQuery,
	Types.GetClientIntegrationQueryVariables
>
export const GetServerIntegrationDocument = gql`
	query GetServerIntegration($project_id: ID!) {
		serverIntegration(project_id: $project_id) {
			integrated
			resourceType
			createdAt
		}
	}
`

/**
 * __useGetServerIntegrationQuery__
 *
 * To run a query within a React component, call `useGetServerIntegrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetServerIntegrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetServerIntegrationQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetServerIntegrationQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetServerIntegrationQuery,
		Types.GetServerIntegrationQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetServerIntegrationQuery,
		Types.GetServerIntegrationQueryVariables
	>(GetServerIntegrationDocument, baseOptions)
}
export function useGetServerIntegrationLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetServerIntegrationQuery,
		Types.GetServerIntegrationQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetServerIntegrationQuery,
		Types.GetServerIntegrationQueryVariables
	>(GetServerIntegrationDocument, baseOptions)
}
export type GetServerIntegrationQueryHookResult = ReturnType<
	typeof useGetServerIntegrationQuery
>
export type GetServerIntegrationLazyQueryHookResult = ReturnType<
	typeof useGetServerIntegrationLazyQuery
>
export type GetServerIntegrationQueryResult = Apollo.QueryResult<
	Types.GetServerIntegrationQuery,
	Types.GetServerIntegrationQueryVariables
>
export const GetLogsIntegrationDocument = gql`
	query GetLogsIntegration($project_id: ID!) {
		logsIntegration(project_id: $project_id) {
			integrated
			resourceType
			createdAt
		}
	}
`

/**
 * __useGetLogsIntegrationQuery__
 *
 * To run a query within a React component, call `useGetLogsIntegrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsIntegrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsIntegrationQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetLogsIntegrationQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogsIntegrationQuery,
		Types.GetLogsIntegrationQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogsIntegrationQuery,
		Types.GetLogsIntegrationQueryVariables
	>(GetLogsIntegrationDocument, baseOptions)
}
export function useGetLogsIntegrationLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogsIntegrationQuery,
		Types.GetLogsIntegrationQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogsIntegrationQuery,
		Types.GetLogsIntegrationQueryVariables
	>(GetLogsIntegrationDocument, baseOptions)
}
export type GetLogsIntegrationQueryHookResult = ReturnType<
	typeof useGetLogsIntegrationQuery
>
export type GetLogsIntegrationLazyQueryHookResult = ReturnType<
	typeof useGetLogsIntegrationLazyQuery
>
export type GetLogsIntegrationQueryResult = Apollo.QueryResult<
	Types.GetLogsIntegrationQuery,
	Types.GetLogsIntegrationQueryVariables
>
export const GetTracesIntegrationDocument = gql`
	query GetTracesIntegration($project_id: ID!) {
		tracesIntegration(project_id: $project_id) {
			integrated
			resourceType
			createdAt
		}
	}
`

/**
 * __useGetTracesIntegrationQuery__
 *
 * To run a query within a React component, call `useGetTracesIntegrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTracesIntegrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTracesIntegrationQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetTracesIntegrationQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTracesIntegrationQuery,
		Types.GetTracesIntegrationQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetTracesIntegrationQuery,
		Types.GetTracesIntegrationQueryVariables
	>(GetTracesIntegrationDocument, baseOptions)
}
export function useGetTracesIntegrationLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTracesIntegrationQuery,
		Types.GetTracesIntegrationQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTracesIntegrationQuery,
		Types.GetTracesIntegrationQueryVariables
	>(GetTracesIntegrationDocument, baseOptions)
}
export type GetTracesIntegrationQueryHookResult = ReturnType<
	typeof useGetTracesIntegrationQuery
>
export type GetTracesIntegrationLazyQueryHookResult = ReturnType<
	typeof useGetTracesIntegrationLazyQuery
>
export type GetTracesIntegrationQueryResult = Apollo.QueryResult<
	Types.GetTracesIntegrationQuery,
	Types.GetTracesIntegrationQueryVariables
>
export const GetKeyPerformanceIndicatorsDocument = gql`
	query GetKeyPerformanceIndicators(
		$project_id: ID!
		$lookback_days: Float!
	) {
		unprocessedSessionsCount(project_id: $project_id)
		liveUsersCount(project_id: $project_id)
		newUsersCount(project_id: $project_id, lookback_days: $lookback_days) {
			count
		}
		averageSessionLength(
			project_id: $project_id
			lookback_days: $lookback_days
		) {
			length
		}
		userFingerprintCount(
			project_id: $project_id
			lookback_days: $lookback_days
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
 *      lookback_days: // value for 'lookback_days'
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
	query GetReferrersCount($project_id: ID!, $lookback_days: Float!) {
		referrers(project_id: $project_id, lookback_days: $lookback_days) {
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
 *      lookback_days: // value for 'lookback_days'
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
	query GetNewUsersCount($project_id: ID!, $lookback_days: Float!) {
		newUsersCount(project_id: $project_id, lookback_days: $lookback_days) {
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
 *      lookback_days: // value for 'lookback_days'
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
	query GetAverageSessionLength($project_id: ID!, $lookback_days: Float!) {
		averageSessionLength(
			project_id: $project_id
			lookback_days: $lookback_days
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
 *      lookback_days: // value for 'lookback_days'
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
	query GetTopUsers($project_id: ID!, $lookback_days: Float!) {
		topUsers(project_id: $project_id, lookback_days: $lookback_days) {
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
 *      lookback_days: // value for 'lookback_days'
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
	query GetRageClicksForProject($project_id: ID!, $lookback_days: Float!) {
		rageClicksForProject(
			project_id: $project_id
			lookback_days: $lookback_days
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
 *      lookback_days: // value for 'lookback_days'
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
export const GetWorkspaceIsIntegratedWithFrontDocument = gql`
	query GetWorkspaceIsIntegratedWithFront($project_id: ID!) {
		is_integrated_with_front: is_integrated_with(
			integration_type: Front
			project_id: $project_id
		)
	}
`

/**
 * __useGetWorkspaceIsIntegratedWithFrontQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceIsIntegratedWithFrontQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceIsIntegratedWithFrontQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceIsIntegratedWithFrontQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetWorkspaceIsIntegratedWithFrontQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithFrontQuery,
		Types.GetWorkspaceIsIntegratedWithFrontQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceIsIntegratedWithFrontQuery,
		Types.GetWorkspaceIsIntegratedWithFrontQueryVariables
	>(GetWorkspaceIsIntegratedWithFrontDocument, baseOptions)
}
export function useGetWorkspaceIsIntegratedWithFrontLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithFrontQuery,
		Types.GetWorkspaceIsIntegratedWithFrontQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceIsIntegratedWithFrontQuery,
		Types.GetWorkspaceIsIntegratedWithFrontQueryVariables
	>(GetWorkspaceIsIntegratedWithFrontDocument, baseOptions)
}
export type GetWorkspaceIsIntegratedWithFrontQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithFrontQuery
>
export type GetWorkspaceIsIntegratedWithFrontLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithFrontLazyQuery
>
export type GetWorkspaceIsIntegratedWithFrontQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceIsIntegratedWithFrontQuery,
	Types.GetWorkspaceIsIntegratedWithFrontQueryVariables
>
export const GetWorkspaceIsIntegratedWithDiscordDocument = gql`
	query GetWorkspaceIsIntegratedWithDiscord($project_id: ID!) {
		is_integrated_with_discord: is_integrated_with(
			integration_type: Discord
			project_id: $project_id
		)
	}
`

/**
 * __useGetWorkspaceIsIntegratedWithDiscordQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceIsIntegratedWithDiscordQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceIsIntegratedWithDiscordQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceIsIntegratedWithDiscordQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetWorkspaceIsIntegratedWithDiscordQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithDiscordQuery,
		Types.GetWorkspaceIsIntegratedWithDiscordQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceIsIntegratedWithDiscordQuery,
		Types.GetWorkspaceIsIntegratedWithDiscordQueryVariables
	>(GetWorkspaceIsIntegratedWithDiscordDocument, baseOptions)
}
export function useGetWorkspaceIsIntegratedWithDiscordLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithDiscordQuery,
		Types.GetWorkspaceIsIntegratedWithDiscordQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceIsIntegratedWithDiscordQuery,
		Types.GetWorkspaceIsIntegratedWithDiscordQueryVariables
	>(GetWorkspaceIsIntegratedWithDiscordDocument, baseOptions)
}
export type GetWorkspaceIsIntegratedWithDiscordQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithDiscordQuery
>
export type GetWorkspaceIsIntegratedWithDiscordLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithDiscordLazyQuery
>
export type GetWorkspaceIsIntegratedWithDiscordQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceIsIntegratedWithDiscordQuery,
	Types.GetWorkspaceIsIntegratedWithDiscordQueryVariables
>
export const GetWorkspaceIsIntegratedWithVercelDocument = gql`
	query GetWorkspaceIsIntegratedWithVercel($project_id: ID!) {
		is_integrated_with_vercel: is_integrated_with(
			integration_type: Vercel
			project_id: $project_id
		)
		vercel_projects(project_id: $project_id) {
			id
			name
		}
		vercel_project_mappings(project_id: $project_id) {
			vercel_project_id
			project_id
		}
	}
`

/**
 * __useGetWorkspaceIsIntegratedWithVercelQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceIsIntegratedWithVercelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceIsIntegratedWithVercelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceIsIntegratedWithVercelQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetWorkspaceIsIntegratedWithVercelQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithVercelQuery,
		Types.GetWorkspaceIsIntegratedWithVercelQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceIsIntegratedWithVercelQuery,
		Types.GetWorkspaceIsIntegratedWithVercelQueryVariables
	>(GetWorkspaceIsIntegratedWithVercelDocument, baseOptions)
}
export function useGetWorkspaceIsIntegratedWithVercelLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceIsIntegratedWithVercelQuery,
		Types.GetWorkspaceIsIntegratedWithVercelQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceIsIntegratedWithVercelQuery,
		Types.GetWorkspaceIsIntegratedWithVercelQueryVariables
	>(GetWorkspaceIsIntegratedWithVercelDocument, baseOptions)
}
export type GetWorkspaceIsIntegratedWithVercelQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithVercelQuery
>
export type GetWorkspaceIsIntegratedWithVercelLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceIsIntegratedWithVercelLazyQuery
>
export type GetWorkspaceIsIntegratedWithVercelQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceIsIntegratedWithVercelQuery,
	Types.GetWorkspaceIsIntegratedWithVercelQueryVariables
>
export const GetJiraIntegrationSettingsDocument = gql`
	query GetJiraIntegrationSettings($workspace_id: ID!) {
		is_integrated: is_workspace_integrated_with(
			integration_type: Jira
			workspace_id: $workspace_id
		)
		jira_projects(workspace_id: $workspace_id) {
			id
			name
			key
			issueTypes {
				id
				name
				description
			}
		}
	}
`

/**
 * __useGetJiraIntegrationSettingsQuery__
 *
 * To run a query within a React component, call `useGetJiraIntegrationSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetJiraIntegrationSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetJiraIntegrationSettingsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetJiraIntegrationSettingsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetJiraIntegrationSettingsQuery,
		Types.GetJiraIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetJiraIntegrationSettingsQuery,
		Types.GetJiraIntegrationSettingsQueryVariables
	>(GetJiraIntegrationSettingsDocument, baseOptions)
}
export function useGetJiraIntegrationSettingsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetJiraIntegrationSettingsQuery,
		Types.GetJiraIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetJiraIntegrationSettingsQuery,
		Types.GetJiraIntegrationSettingsQueryVariables
	>(GetJiraIntegrationSettingsDocument, baseOptions)
}
export type GetJiraIntegrationSettingsQueryHookResult = ReturnType<
	typeof useGetJiraIntegrationSettingsQuery
>
export type GetJiraIntegrationSettingsLazyQueryHookResult = ReturnType<
	typeof useGetJiraIntegrationSettingsLazyQuery
>
export type GetJiraIntegrationSettingsQueryResult = Apollo.QueryResult<
	Types.GetJiraIntegrationSettingsQuery,
	Types.GetJiraIntegrationSettingsQueryVariables
>
export const GetClickUpIntegrationSettingsDocument = gql`
	query GetClickUpIntegrationSettings($workspace_id: ID!) {
		is_integrated: is_workspace_integrated_with(
			integration_type: ClickUp
			workspace_id: $workspace_id
		)
		clickup_teams(workspace_id: $workspace_id) {
			id
			name
			spaces {
				id
				name
			}
		}
		project_mappings: clickup_project_mappings(
			workspace_id: $workspace_id
		) {
			project_id
			clickup_space_id
		}
	}
`

/**
 * __useGetClickUpIntegrationSettingsQuery__
 *
 * To run a query within a React component, call `useGetClickUpIntegrationSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClickUpIntegrationSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClickUpIntegrationSettingsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetClickUpIntegrationSettingsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetClickUpIntegrationSettingsQuery,
		Types.GetClickUpIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetClickUpIntegrationSettingsQuery,
		Types.GetClickUpIntegrationSettingsQueryVariables
	>(GetClickUpIntegrationSettingsDocument, baseOptions)
}
export function useGetClickUpIntegrationSettingsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetClickUpIntegrationSettingsQuery,
		Types.GetClickUpIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetClickUpIntegrationSettingsQuery,
		Types.GetClickUpIntegrationSettingsQueryVariables
	>(GetClickUpIntegrationSettingsDocument, baseOptions)
}
export type GetClickUpIntegrationSettingsQueryHookResult = ReturnType<
	typeof useGetClickUpIntegrationSettingsQuery
>
export type GetClickUpIntegrationSettingsLazyQueryHookResult = ReturnType<
	typeof useGetClickUpIntegrationSettingsLazyQuery
>
export type GetClickUpIntegrationSettingsQueryResult = Apollo.QueryResult<
	Types.GetClickUpIntegrationSettingsQuery,
	Types.GetClickUpIntegrationSettingsQueryVariables
>
export const GetHeightIntegrationSettingsDocument = gql`
	query GetHeightIntegrationSettings($workspace_id: ID!) {
		is_integrated: is_workspace_integrated_with(
			integration_type: Height
			workspace_id: $workspace_id
		)
		height_workspaces(workspace_id: $workspace_id) {
			id
			model
			name
			url
		}
		integration_project_mappings(
			workspace_id: $workspace_id
			integration_type: Height
		) {
			project_id
			external_id
		}
	}
`

/**
 * __useGetHeightIntegrationSettingsQuery__
 *
 * To run a query within a React component, call `useGetHeightIntegrationSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHeightIntegrationSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHeightIntegrationSettingsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetHeightIntegrationSettingsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetHeightIntegrationSettingsQuery,
		Types.GetHeightIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetHeightIntegrationSettingsQuery,
		Types.GetHeightIntegrationSettingsQueryVariables
	>(GetHeightIntegrationSettingsDocument, baseOptions)
}
export function useGetHeightIntegrationSettingsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetHeightIntegrationSettingsQuery,
		Types.GetHeightIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetHeightIntegrationSettingsQuery,
		Types.GetHeightIntegrationSettingsQueryVariables
	>(GetHeightIntegrationSettingsDocument, baseOptions)
}
export type GetHeightIntegrationSettingsQueryHookResult = ReturnType<
	typeof useGetHeightIntegrationSettingsQuery
>
export type GetHeightIntegrationSettingsLazyQueryHookResult = ReturnType<
	typeof useGetHeightIntegrationSettingsLazyQuery
>
export type GetHeightIntegrationSettingsQueryResult = Apollo.QueryResult<
	Types.GetHeightIntegrationSettingsQuery,
	Types.GetHeightIntegrationSettingsQueryVariables
>
export const GetGitHubIntegrationSettingsDocument = gql`
	query GetGitHubIntegrationSettings($workspace_id: ID!) {
		is_integrated: is_workspace_integrated_with(
			integration_type: GitHub
			workspace_id: $workspace_id
		)
		github_repos(workspace_id: $workspace_id) {
			repo_id
			name
			key
		}
	}
`

/**
 * __useGetGitHubIntegrationSettingsQuery__
 *
 * To run a query within a React component, call `useGetGitHubIntegrationSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGitHubIntegrationSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGitHubIntegrationSettingsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetGitHubIntegrationSettingsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetGitHubIntegrationSettingsQuery,
		Types.GetGitHubIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetGitHubIntegrationSettingsQuery,
		Types.GetGitHubIntegrationSettingsQueryVariables
	>(GetGitHubIntegrationSettingsDocument, baseOptions)
}
export function useGetGitHubIntegrationSettingsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetGitHubIntegrationSettingsQuery,
		Types.GetGitHubIntegrationSettingsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetGitHubIntegrationSettingsQuery,
		Types.GetGitHubIntegrationSettingsQueryVariables
	>(GetGitHubIntegrationSettingsDocument, baseOptions)
}
export type GetGitHubIntegrationSettingsQueryHookResult = ReturnType<
	typeof useGetGitHubIntegrationSettingsQuery
>
export type GetGitHubIntegrationSettingsLazyQueryHookResult = ReturnType<
	typeof useGetGitHubIntegrationSettingsLazyQuery
>
export type GetGitHubIntegrationSettingsQueryResult = Apollo.QueryResult<
	Types.GetGitHubIntegrationSettingsQuery,
	Types.GetGitHubIntegrationSettingsQueryVariables
>
export const GetGitHubIssueLabelsDocument = gql`
	query GetGitHubIssueLabels($workspace_id: ID!, $repository: String!) {
		github_issue_labels(
			workspace_id: $workspace_id
			repository: $repository
		)
	}
`

/**
 * __useGetGitHubIssueLabelsQuery__
 *
 * To run a query within a React component, call `useGetGitHubIssueLabelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGitHubIssueLabelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGitHubIssueLabelsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *      repository: // value for 'repository'
 *   },
 * });
 */
export function useGetGitHubIssueLabelsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetGitHubIssueLabelsQuery,
		Types.GetGitHubIssueLabelsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetGitHubIssueLabelsQuery,
		Types.GetGitHubIssueLabelsQueryVariables
	>(GetGitHubIssueLabelsDocument, baseOptions)
}
export function useGetGitHubIssueLabelsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetGitHubIssueLabelsQuery,
		Types.GetGitHubIssueLabelsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetGitHubIssueLabelsQuery,
		Types.GetGitHubIssueLabelsQueryVariables
	>(GetGitHubIssueLabelsDocument, baseOptions)
}
export type GetGitHubIssueLabelsQueryHookResult = ReturnType<
	typeof useGetGitHubIssueLabelsQuery
>
export type GetGitHubIssueLabelsLazyQueryHookResult = ReturnType<
	typeof useGetGitHubIssueLabelsLazyQuery
>
export type GetGitHubIssueLabelsQueryResult = Apollo.QueryResult<
	Types.GetGitHubIssueLabelsQuery,
	Types.GetGitHubIssueLabelsQueryVariables
>
export const GetProjectIntegratedWithDocument = gql`
	query GetProjectIntegratedWith(
		$project_id: ID!
		$integration_type: IntegrationType!
	) {
		is_project_integrated_with(
			integration_type: $integration_type
			project_id: $project_id
		)
	}
`

/**
 * __useGetProjectIntegratedWithQuery__
 *
 * To run a query within a React component, call `useGetProjectIntegratedWithQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectIntegratedWithQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectIntegratedWithQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      integration_type: // value for 'integration_type'
 *   },
 * });
 */
export function useGetProjectIntegratedWithQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetProjectIntegratedWithQuery,
		Types.GetProjectIntegratedWithQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectIntegratedWithQuery,
		Types.GetProjectIntegratedWithQueryVariables
	>(GetProjectIntegratedWithDocument, baseOptions)
}
export function useGetProjectIntegratedWithLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectIntegratedWithQuery,
		Types.GetProjectIntegratedWithQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectIntegratedWithQuery,
		Types.GetProjectIntegratedWithQueryVariables
	>(GetProjectIntegratedWithDocument, baseOptions)
}
export type GetProjectIntegratedWithQueryHookResult = ReturnType<
	typeof useGetProjectIntegratedWithQuery
>
export type GetProjectIntegratedWithLazyQueryHookResult = ReturnType<
	typeof useGetProjectIntegratedWithLazyQuery
>
export type GetProjectIntegratedWithQueryResult = Apollo.QueryResult<
	Types.GetProjectIntegratedWithQuery,
	Types.GetProjectIntegratedWithQueryVariables
>
export const GetClickUpFoldersDocument = gql`
	query GetClickUpFolders($project_id: ID!) {
		clickup_folders(project_id: $project_id) {
			id
			name
			lists {
				id
				name
			}
		}
		clickup_folderless_lists(project_id: $project_id) {
			id
			name
		}
	}
`

/**
 * __useGetClickUpFoldersQuery__
 *
 * To run a query within a React component, call `useGetClickUpFoldersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClickUpFoldersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClickUpFoldersQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetClickUpFoldersQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetClickUpFoldersQuery,
		Types.GetClickUpFoldersQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetClickUpFoldersQuery,
		Types.GetClickUpFoldersQueryVariables
	>(GetClickUpFoldersDocument, baseOptions)
}
export function useGetClickUpFoldersLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetClickUpFoldersQuery,
		Types.GetClickUpFoldersQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetClickUpFoldersQuery,
		Types.GetClickUpFoldersQueryVariables
	>(GetClickUpFoldersDocument, baseOptions)
}
export type GetClickUpFoldersQueryHookResult = ReturnType<
	typeof useGetClickUpFoldersQuery
>
export type GetClickUpFoldersLazyQueryHookResult = ReturnType<
	typeof useGetClickUpFoldersLazyQuery
>
export type GetClickUpFoldersQueryResult = Apollo.QueryResult<
	Types.GetClickUpFoldersQuery,
	Types.GetClickUpFoldersQueryVariables
>
export const GetHeightListsDocument = gql`
	query GetHeightLists($project_id: ID!) {
		height_lists(project_id: $project_id) {
			id
			name
		}
	}
`

/**
 * __useGetHeightListsQuery__
 *
 * To run a query within a React component, call `useGetHeightListsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHeightListsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHeightListsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetHeightListsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetHeightListsQuery,
		Types.GetHeightListsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetHeightListsQuery,
		Types.GetHeightListsQueryVariables
	>(GetHeightListsDocument, baseOptions)
}
export function useGetHeightListsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetHeightListsQuery,
		Types.GetHeightListsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetHeightListsQuery,
		Types.GetHeightListsQueryVariables
	>(GetHeightListsDocument, baseOptions)
}
export type GetHeightListsQueryHookResult = ReturnType<
	typeof useGetHeightListsQuery
>
export type GetHeightListsLazyQueryHookResult = ReturnType<
	typeof useGetHeightListsLazyQuery
>
export type GetHeightListsQueryResult = Apollo.QueryResult<
	Types.GetHeightListsQuery,
	Types.GetHeightListsQueryVariables
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
export const GetLogAlertDocument = gql`
	query GetLogAlert($id: ID!) {
		log_alert(id: $id) {
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			DiscordChannelsToNotify {
				...DiscordChannelFragment
			}
			WebhookDestinations {
				url
				authorization
			}
			CountThreshold
			DailyFrequency
			disabled
			EmailsToNotify
			ExcludedEnvironments
			id
			LastAdminToEditID
			Name
			updated_at
			BelowThreshold
			ThresholdWindow
			Type
			query
		}
	}
	${DiscordChannelFragmentFragmentDoc}
`

/**
 * __useGetLogAlertQuery__
 *
 * To run a query within a React component, call `useGetLogAlertQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogAlertQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogAlertQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLogAlertQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogAlertQuery,
		Types.GetLogAlertQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogAlertQuery,
		Types.GetLogAlertQueryVariables
	>(GetLogAlertDocument, baseOptions)
}
export function useGetLogAlertLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogAlertQuery,
		Types.GetLogAlertQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogAlertQuery,
		Types.GetLogAlertQueryVariables
	>(GetLogAlertDocument, baseOptions)
}
export type GetLogAlertQueryHookResult = ReturnType<typeof useGetLogAlertQuery>
export type GetLogAlertLazyQueryHookResult = ReturnType<
	typeof useGetLogAlertLazyQuery
>
export type GetLogAlertQueryResult = Apollo.QueryResult<
	Types.GetLogAlertQuery,
	Types.GetLogAlertQueryVariables
>
export const GetLogAlertsPagePayloadDocument = gql`
	query GetLogAlertsPagePayload($project_id: ID!) {
		is_integrated_with_slack: is_integrated_with(
			integration_type: Slack
			project_id: $project_id
		)
		is_integrated_with_discord: is_integrated_with(
			integration_type: Discord
			project_id: $project_id
		)
		slack_channel_suggestion(project_id: $project_id) {
			webhook_channel
			webhook_channel_id
		}
		discord_channel_suggestions(project_id: $project_id) {
			...DiscordChannelFragment
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
	}
	${DiscordChannelFragmentFragmentDoc}
`

/**
 * __useGetLogAlertsPagePayloadQuery__
 *
 * To run a query within a React component, call `useGetLogAlertsPagePayloadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogAlertsPagePayloadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogAlertsPagePayloadQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *   },
 * });
 */
export function useGetLogAlertsPagePayloadQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogAlertsPagePayloadQuery,
		Types.GetLogAlertsPagePayloadQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogAlertsPagePayloadQuery,
		Types.GetLogAlertsPagePayloadQueryVariables
	>(GetLogAlertsPagePayloadDocument, baseOptions)
}
export function useGetLogAlertsPagePayloadLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogAlertsPagePayloadQuery,
		Types.GetLogAlertsPagePayloadQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogAlertsPagePayloadQuery,
		Types.GetLogAlertsPagePayloadQueryVariables
	>(GetLogAlertsPagePayloadDocument, baseOptions)
}
export type GetLogAlertsPagePayloadQueryHookResult = ReturnType<
	typeof useGetLogAlertsPagePayloadQuery
>
export type GetLogAlertsPagePayloadLazyQueryHookResult = ReturnType<
	typeof useGetLogAlertsPagePayloadLazyQuery
>
export type GetLogAlertsPagePayloadQueryResult = Apollo.QueryResult<
	Types.GetLogAlertsPagePayloadQuery,
	Types.GetLogAlertsPagePayloadQueryVariables
>
export const GetAlertsPagePayloadDocument = gql`
	query GetAlertsPagePayload($project_id: ID!) {
		is_integrated_with_slack: is_integrated_with(
			integration_type: Slack
			project_id: $project_id
		)
		is_integrated_with_discord: is_integrated_with(
			integration_type: Discord
			project_id: $project_id
		)
		slack_channel_suggestion(project_id: $project_id) {
			webhook_channel
			webhook_channel_id
		}
		discord_channel_suggestions(project_id: $project_id) {
			...DiscordChannelFragment
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
			DiscordChannelsToNotify {
				...DiscordChannelFragment
			}
			WebhookDestinations {
				url
				authorization
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
			default
		}
		new_session_alerts(project_id: $project_id) {
			...SessionAlertFragment
		}
		rage_click_alerts(project_id: $project_id) {
			...SessionAlertFragment
		}
		new_user_alerts(project_id: $project_id) {
			...SessionAlertFragment
		}
		track_properties_alerts(project_id: $project_id) {
			...SessionAlertFragment
		}
		user_properties_alerts(project_id: $project_id) {
			...SessionAlertFragment
		}
		metric_monitors(project_id: $project_id) {
			id
			updated_at
			name
			channels_to_notify {
				webhook_channel
				webhook_channel_id
			}
			discord_channels_to_notify {
				id
				name
			}
			webhook_destinations {
				url
				authorization
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
		log_alerts(project_id: $project_id) {
			ChannelsToNotify {
				webhook_channel
				webhook_channel_id
			}
			DiscordChannelsToNotify {
				...DiscordChannelFragment
			}
			CountThreshold
			DailyFrequency
			disabled
			default
			EmailsToNotify
			ExcludedEnvironments
			id
			LastAdminToEditID
			Name
			updated_at
			ThresholdWindow
			Type
			query
		}
	}
	${DiscordChannelFragmentFragmentDoc}
	${SessionAlertFragmentFragmentDoc}
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
		slack_channel_suggestion(project_id: $project_id) {
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
	query GetMetricTags(
		$project_id: ID!
		$metric_name: String!
		$query: String
	) {
		metric_tags(
			project_id: $project_id
			metric_name: $metric_name
			query: $query
		)
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
 *      query: // value for 'query'
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
export const GetOAuthClientMetadataDocument = gql`
	query GetOAuthClientMetadata($client_id: String!) {
		oauth_client_metadata(client_id: $client_id) {
			id
			created_at
			app_name
		}
	}
`

/**
 * __useGetOAuthClientMetadataQuery__
 *
 * To run a query within a React component, call `useGetOAuthClientMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOAuthClientMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOAuthClientMetadataQuery({
 *   variables: {
 *      client_id: // value for 'client_id'
 *   },
 * });
 */
export function useGetOAuthClientMetadataQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetOAuthClientMetadataQuery,
		Types.GetOAuthClientMetadataQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetOAuthClientMetadataQuery,
		Types.GetOAuthClientMetadataQueryVariables
	>(GetOAuthClientMetadataDocument, baseOptions)
}
export function useGetOAuthClientMetadataLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetOAuthClientMetadataQuery,
		Types.GetOAuthClientMetadataQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetOAuthClientMetadataQuery,
		Types.GetOAuthClientMetadataQueryVariables
	>(GetOAuthClientMetadataDocument, baseOptions)
}
export type GetOAuthClientMetadataQueryHookResult = ReturnType<
	typeof useGetOAuthClientMetadataQuery
>
export type GetOAuthClientMetadataLazyQueryHookResult = ReturnType<
	typeof useGetOAuthClientMetadataLazyQuery
>
export type GetOAuthClientMetadataQueryResult = Apollo.QueryResult<
	Types.GetOAuthClientMetadataQuery,
	Types.GetOAuthClientMetadataQueryVariables
>
export const GetErrorGroupFrequenciesDocument = gql`
	query GetErrorGroupFrequencies(
		$project_id: ID!
		$error_group_secure_ids: [String!]!
		$params: ErrorGroupFrequenciesParamsInput!
		$metric: String!
		$use_clickhouse: Boolean
	) {
		errorGroupFrequencies(
			project_id: $project_id
			error_group_secure_ids: $error_group_secure_ids
			params: $params
			metric: $metric
			use_clickhouse: $use_clickhouse
		) {
			error_group_id
			date
			name
			value
		}
	}
`

/**
 * __useGetErrorGroupFrequenciesQuery__
 *
 * To run a query within a React component, call `useGetErrorGroupFrequenciesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorGroupFrequenciesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorGroupFrequenciesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      error_group_secure_ids: // value for 'error_group_secure_ids'
 *      params: // value for 'params'
 *      metric: // value for 'metric'
 *      use_clickhouse: // value for 'use_clickhouse'
 *   },
 * });
 */
export function useGetErrorGroupFrequenciesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorGroupFrequenciesQuery,
		Types.GetErrorGroupFrequenciesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorGroupFrequenciesQuery,
		Types.GetErrorGroupFrequenciesQueryVariables
	>(GetErrorGroupFrequenciesDocument, baseOptions)
}
export function useGetErrorGroupFrequenciesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorGroupFrequenciesQuery,
		Types.GetErrorGroupFrequenciesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorGroupFrequenciesQuery,
		Types.GetErrorGroupFrequenciesQueryVariables
	>(GetErrorGroupFrequenciesDocument, baseOptions)
}
export type GetErrorGroupFrequenciesQueryHookResult = ReturnType<
	typeof useGetErrorGroupFrequenciesQuery
>
export type GetErrorGroupFrequenciesLazyQueryHookResult = ReturnType<
	typeof useGetErrorGroupFrequenciesLazyQuery
>
export type GetErrorGroupFrequenciesQueryResult = Apollo.QueryResult<
	Types.GetErrorGroupFrequenciesQuery,
	Types.GetErrorGroupFrequenciesQueryVariables
>
export const GetErrorGroupTagsDocument = gql`
	query GetErrorGroupTags(
		$error_group_secure_id: String!
		$use_clickhouse: Boolean
	) {
		errorGroupTags(
			error_group_secure_id: $error_group_secure_id
			use_clickhouse: $use_clickhouse
		) {
			key
			buckets {
				key
				doc_count
				percent
			}
		}
	}
`

/**
 * __useGetErrorGroupTagsQuery__
 *
 * To run a query within a React component, call `useGetErrorGroupTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorGroupTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorGroupTagsQuery({
 *   variables: {
 *      error_group_secure_id: // value for 'error_group_secure_id'
 *      use_clickhouse: // value for 'use_clickhouse'
 *   },
 * });
 */
export function useGetErrorGroupTagsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorGroupTagsQuery,
		Types.GetErrorGroupTagsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorGroupTagsQuery,
		Types.GetErrorGroupTagsQueryVariables
	>(GetErrorGroupTagsDocument, baseOptions)
}
export function useGetErrorGroupTagsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorGroupTagsQuery,
		Types.GetErrorGroupTagsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorGroupTagsQuery,
		Types.GetErrorGroupTagsQueryVariables
	>(GetErrorGroupTagsDocument, baseOptions)
}
export type GetErrorGroupTagsQueryHookResult = ReturnType<
	typeof useGetErrorGroupTagsQuery
>
export type GetErrorGroupTagsLazyQueryHookResult = ReturnType<
	typeof useGetErrorGroupTagsLazyQuery
>
export type GetErrorGroupTagsQueryResult = Apollo.QueryResult<
	Types.GetErrorGroupTagsQuery,
	Types.GetErrorGroupTagsQueryVariables
>
export const GetEmailOptOutsDocument = gql`
	query GetEmailOptOuts($token: String, $admin_id: ID) {
		email_opt_outs(token: $token, admin_id: $admin_id)
	}
`

/**
 * __useGetEmailOptOutsQuery__
 *
 * To run a query within a React component, call `useGetEmailOptOutsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailOptOutsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailOptOutsQuery({
 *   variables: {
 *      token: // value for 'token'
 *      admin_id: // value for 'admin_id'
 *   },
 * });
 */
export function useGetEmailOptOutsQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetEmailOptOutsQuery,
		Types.GetEmailOptOutsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetEmailOptOutsQuery,
		Types.GetEmailOptOutsQueryVariables
	>(GetEmailOptOutsDocument, baseOptions)
}
export function useGetEmailOptOutsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetEmailOptOutsQuery,
		Types.GetEmailOptOutsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetEmailOptOutsQuery,
		Types.GetEmailOptOutsQueryVariables
	>(GetEmailOptOutsDocument, baseOptions)
}
export type GetEmailOptOutsQueryHookResult = ReturnType<
	typeof useGetEmailOptOutsQuery
>
export type GetEmailOptOutsLazyQueryHookResult = ReturnType<
	typeof useGetEmailOptOutsLazyQuery
>
export type GetEmailOptOutsQueryResult = Apollo.QueryResult<
	Types.GetEmailOptOutsQuery,
	Types.GetEmailOptOutsQueryVariables
>
export const GetLogsDocument = gql`
	query GetLogs(
		$project_id: ID!
		$params: QueryInput!
		$after: String
		$before: String
		$at: String
		$direction: SortDirection!
	) {
		logs(
			project_id: $project_id
			params: $params
			after: $after
			before: $before
			at: $at
			direction: $direction
		) {
			edges {
				cursor
				node {
					timestamp
					level
					message
					logAttributes
					traceID
					spanID
					secureSessionID
					source
					serviceName
					serviceVersion
					environment
				}
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
				startCursor
				endCursor
			}
		}
	}
`

/**
 * __useGetLogsQuery__
 *
 * To run a query within a React component, call `useGetLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      params: // value for 'params'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *      at: // value for 'at'
 *      direction: // value for 'direction'
 *   },
 * });
 */
export function useGetLogsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogsQuery,
		Types.GetLogsQueryVariables
	>,
) {
	return Apollo.useQuery<Types.GetLogsQuery, Types.GetLogsQueryVariables>(
		GetLogsDocument,
		baseOptions,
	)
}
export function useGetLogsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogsQuery,
		Types.GetLogsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<Types.GetLogsQuery, Types.GetLogsQueryVariables>(
		GetLogsDocument,
		baseOptions,
	)
}
export type GetLogsQueryHookResult = ReturnType<typeof useGetLogsQuery>
export type GetLogsLazyQueryHookResult = ReturnType<typeof useGetLogsLazyQuery>
export type GetLogsQueryResult = Apollo.QueryResult<
	Types.GetLogsQuery,
	Types.GetLogsQueryVariables
>
export const GetSessionLogsDocument = gql`
	query GetSessionLogs($project_id: ID!, $params: QueryInput!) {
		sessionLogs(project_id: $project_id, params: $params) {
			cursor
			node {
				timestamp
				level
				message
			}
		}
	}
`

/**
 * __useGetSessionLogsQuery__
 *
 * To run a query within a React component, call `useGetSessionLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionLogsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetSessionLogsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetSessionLogsQuery,
		Types.GetSessionLogsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSessionLogsQuery,
		Types.GetSessionLogsQueryVariables
	>(GetSessionLogsDocument, baseOptions)
}
export function useGetSessionLogsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSessionLogsQuery,
		Types.GetSessionLogsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSessionLogsQuery,
		Types.GetSessionLogsQueryVariables
	>(GetSessionLogsDocument, baseOptions)
}
export type GetSessionLogsQueryHookResult = ReturnType<
	typeof useGetSessionLogsQuery
>
export type GetSessionLogsLazyQueryHookResult = ReturnType<
	typeof useGetSessionLogsLazyQuery
>
export type GetSessionLogsQueryResult = Apollo.QueryResult<
	Types.GetSessionLogsQuery,
	Types.GetSessionLogsQueryVariables
>
export const GetLogsTotalCountDocument = gql`
	query GetLogsTotalCount($project_id: ID!, $params: QueryInput!) {
		logs_total_count(project_id: $project_id, params: $params)
	}
`

/**
 * __useGetLogsTotalCountQuery__
 *
 * To run a query within a React component, call `useGetLogsTotalCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsTotalCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsTotalCountQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetLogsTotalCountQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogsTotalCountQuery,
		Types.GetLogsTotalCountQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogsTotalCountQuery,
		Types.GetLogsTotalCountQueryVariables
	>(GetLogsTotalCountDocument, baseOptions)
}
export function useGetLogsTotalCountLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogsTotalCountQuery,
		Types.GetLogsTotalCountQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogsTotalCountQuery,
		Types.GetLogsTotalCountQueryVariables
	>(GetLogsTotalCountDocument, baseOptions)
}
export type GetLogsTotalCountQueryHookResult = ReturnType<
	typeof useGetLogsTotalCountQuery
>
export type GetLogsTotalCountLazyQueryHookResult = ReturnType<
	typeof useGetLogsTotalCountLazyQuery
>
export type GetLogsTotalCountQueryResult = Apollo.QueryResult<
	Types.GetLogsTotalCountQuery,
	Types.GetLogsTotalCountQueryVariables
>
export const GetLogsHistogramDocument = gql`
	query GetLogsHistogram($project_id: ID!, $params: QueryInput!) {
		logs_histogram(project_id: $project_id, params: $params) {
			totalCount
			buckets {
				bucketId
				counts {
					count
					level
				}
			}
			objectCount
			sampleFactor
		}
	}
`

/**
 * __useGetLogsHistogramQuery__
 *
 * To run a query within a React component, call `useGetLogsHistogramQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsHistogramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsHistogramQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      params: // value for 'params'
 *   },
 * });
 */
export function useGetLogsHistogramQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogsHistogramQuery,
		Types.GetLogsHistogramQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogsHistogramQuery,
		Types.GetLogsHistogramQueryVariables
	>(GetLogsHistogramDocument, baseOptions)
}
export function useGetLogsHistogramLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogsHistogramQuery,
		Types.GetLogsHistogramQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogsHistogramQuery,
		Types.GetLogsHistogramQueryVariables
	>(GetLogsHistogramDocument, baseOptions)
}
export type GetLogsHistogramQueryHookResult = ReturnType<
	typeof useGetLogsHistogramQuery
>
export type GetLogsHistogramLazyQueryHookResult = ReturnType<
	typeof useGetLogsHistogramLazyQuery
>
export type GetLogsHistogramQueryResult = Apollo.QueryResult<
	Types.GetLogsHistogramQuery,
	Types.GetLogsHistogramQueryVariables
>
export const GetLogsKeysDocument = gql`
	query GetLogsKeys(
		$project_id: ID!
		$date_range: DateRangeRequiredInput!
		$query: String
	) {
		keys: logs_keys(
			project_id: $project_id
			date_range: $date_range
			query: $query
		) {
			name
			type
		}
	}
`

/**
 * __useGetLogsKeysQuery__
 *
 * To run a query within a React component, call `useGetLogsKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsKeysQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      date_range: // value for 'date_range'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetLogsKeysQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogsKeysQuery,
		Types.GetLogsKeysQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogsKeysQuery,
		Types.GetLogsKeysQueryVariables
	>(GetLogsKeysDocument, baseOptions)
}
export function useGetLogsKeysLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogsKeysQuery,
		Types.GetLogsKeysQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogsKeysQuery,
		Types.GetLogsKeysQueryVariables
	>(GetLogsKeysDocument, baseOptions)
}
export type GetLogsKeysQueryHookResult = ReturnType<typeof useGetLogsKeysQuery>
export type GetLogsKeysLazyQueryHookResult = ReturnType<
	typeof useGetLogsKeysLazyQuery
>
export type GetLogsKeysQueryResult = Apollo.QueryResult<
	Types.GetLogsKeysQuery,
	Types.GetLogsKeysQueryVariables
>
export const GetLogsKeyValuesDocument = gql`
	query GetLogsKeyValues(
		$project_id: ID!
		$key_name: String!
		$date_range: DateRangeRequiredInput!
	) {
		key_values: logs_key_values(
			project_id: $project_id
			key_name: $key_name
			date_range: $date_range
		)
	}
`

/**
 * __useGetLogsKeyValuesQuery__
 *
 * To run a query within a React component, call `useGetLogsKeyValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsKeyValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsKeyValuesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      key_name: // value for 'key_name'
 *      date_range: // value for 'date_range'
 *   },
 * });
 */
export function useGetLogsKeyValuesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogsKeyValuesQuery,
		Types.GetLogsKeyValuesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogsKeyValuesQuery,
		Types.GetLogsKeyValuesQueryVariables
	>(GetLogsKeyValuesDocument, baseOptions)
}
export function useGetLogsKeyValuesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogsKeyValuesQuery,
		Types.GetLogsKeyValuesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogsKeyValuesQuery,
		Types.GetLogsKeyValuesQueryVariables
	>(GetLogsKeyValuesDocument, baseOptions)
}
export type GetLogsKeyValuesQueryHookResult = ReturnType<
	typeof useGetLogsKeyValuesQuery
>
export type GetLogsKeyValuesLazyQueryHookResult = ReturnType<
	typeof useGetLogsKeyValuesLazyQuery
>
export type GetLogsKeyValuesQueryResult = Apollo.QueryResult<
	Types.GetLogsKeyValuesQuery,
	Types.GetLogsKeyValuesQueryVariables
>
export const GetLogsErrorObjectsDocument = gql`
	query GetLogsErrorObjects($log_cursors: [String!]!) {
		logs_error_objects(log_cursors: $log_cursors) {
			log_cursor
			error_group_secure_id
			id
		}
	}
`

/**
 * __useGetLogsErrorObjectsQuery__
 *
 * To run a query within a React component, call `useGetLogsErrorObjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsErrorObjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsErrorObjectsQuery({
 *   variables: {
 *      log_cursors: // value for 'log_cursors'
 *   },
 * });
 */
export function useGetLogsErrorObjectsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetLogsErrorObjectsQuery,
		Types.GetLogsErrorObjectsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetLogsErrorObjectsQuery,
		Types.GetLogsErrorObjectsQueryVariables
	>(GetLogsErrorObjectsDocument, baseOptions)
}
export function useGetLogsErrorObjectsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetLogsErrorObjectsQuery,
		Types.GetLogsErrorObjectsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetLogsErrorObjectsQuery,
		Types.GetLogsErrorObjectsQueryVariables
	>(GetLogsErrorObjectsDocument, baseOptions)
}
export type GetLogsErrorObjectsQueryHookResult = ReturnType<
	typeof useGetLogsErrorObjectsQuery
>
export type GetLogsErrorObjectsLazyQueryHookResult = ReturnType<
	typeof useGetLogsErrorObjectsLazyQuery
>
export type GetLogsErrorObjectsQueryResult = Apollo.QueryResult<
	Types.GetLogsErrorObjectsQuery,
	Types.GetLogsErrorObjectsQueryVariables
>
export const GetProjectSettingsDocument = gql`
	query GetProjectSettings($projectId: ID!) {
		projectSettings(projectId: $projectId) {
			id
			name
			verbose_id
			billing_email
			excluded_users
			error_filters
			error_json_paths
			filter_chrome_extension
			rage_click_window_seconds
			rage_click_radius_pixels
			rage_click_count
			filterSessionsWithoutError
			autoResolveStaleErrorsDayInterval
			sampling {
				session_sampling_rate
				error_sampling_rate
				log_sampling_rate
				trace_sampling_rate
				session_exclusion_query
				error_exclusion_query
				log_exclusion_query
				trace_exclusion_query
				session_minute_rate_limit
				error_minute_rate_limit
				log_minute_rate_limit
				trace_minute_rate_limit
			}
		}
	}
`

/**
 * __useGetProjectSettingsQuery__
 *
 * To run a query within a React component, call `useGetProjectSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectSettingsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useGetProjectSettingsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetProjectSettingsQuery,
		Types.GetProjectSettingsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetProjectSettingsQuery,
		Types.GetProjectSettingsQueryVariables
	>(GetProjectSettingsDocument, baseOptions)
}
export function useGetProjectSettingsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetProjectSettingsQuery,
		Types.GetProjectSettingsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetProjectSettingsQuery,
		Types.GetProjectSettingsQueryVariables
	>(GetProjectSettingsDocument, baseOptions)
}
export type GetProjectSettingsQueryHookResult = ReturnType<
	typeof useGetProjectSettingsQuery
>
export type GetProjectSettingsLazyQueryHookResult = ReturnType<
	typeof useGetProjectSettingsLazyQuery
>
export type GetProjectSettingsQueryResult = Apollo.QueryResult<
	Types.GetProjectSettingsQuery,
	Types.GetProjectSettingsQueryVariables
>
export const GetWorkspacePendingInvitesDocument = gql`
	query GetWorkspacePendingInvites($workspace_id: ID!) {
		workspacePendingInvites(workspace_id: $workspace_id) {
			id
			invitee_email
			invitee_role
			created_at
		}
	}
`

/**
 * __useGetWorkspacePendingInvitesQuery__
 *
 * To run a query within a React component, call `useGetWorkspacePendingInvitesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspacePendingInvitesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspacePendingInvitesQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetWorkspacePendingInvitesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspacePendingInvitesQuery,
		Types.GetWorkspacePendingInvitesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspacePendingInvitesQuery,
		Types.GetWorkspacePendingInvitesQueryVariables
	>(GetWorkspacePendingInvitesDocument, baseOptions)
}
export function useGetWorkspacePendingInvitesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspacePendingInvitesQuery,
		Types.GetWorkspacePendingInvitesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspacePendingInvitesQuery,
		Types.GetWorkspacePendingInvitesQueryVariables
	>(GetWorkspacePendingInvitesDocument, baseOptions)
}
export type GetWorkspacePendingInvitesQueryHookResult = ReturnType<
	typeof useGetWorkspacePendingInvitesQuery
>
export type GetWorkspacePendingInvitesLazyQueryHookResult = ReturnType<
	typeof useGetWorkspacePendingInvitesLazyQuery
>
export type GetWorkspacePendingInvitesQueryResult = Apollo.QueryResult<
	Types.GetWorkspacePendingInvitesQuery,
	Types.GetWorkspacePendingInvitesQueryVariables
>
export const GetErrorResolutionSuggestionDocument = gql`
	query GetErrorResolutionSuggestion($error_object_id: ID!) {
		error_resolution_suggestion(error_object_id: $error_object_id)
	}
`

/**
 * __useGetErrorResolutionSuggestionQuery__
 *
 * To run a query within a React component, call `useGetErrorResolutionSuggestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorResolutionSuggestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorResolutionSuggestionQuery({
 *   variables: {
 *      error_object_id: // value for 'error_object_id'
 *   },
 * });
 */
export function useGetErrorResolutionSuggestionQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorResolutionSuggestionQuery,
		Types.GetErrorResolutionSuggestionQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorResolutionSuggestionQuery,
		Types.GetErrorResolutionSuggestionQueryVariables
	>(GetErrorResolutionSuggestionDocument, baseOptions)
}
export function useGetErrorResolutionSuggestionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorResolutionSuggestionQuery,
		Types.GetErrorResolutionSuggestionQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorResolutionSuggestionQuery,
		Types.GetErrorResolutionSuggestionQueryVariables
	>(GetErrorResolutionSuggestionDocument, baseOptions)
}
export type GetErrorResolutionSuggestionQueryHookResult = ReturnType<
	typeof useGetErrorResolutionSuggestionQuery
>
export type GetErrorResolutionSuggestionLazyQueryHookResult = ReturnType<
	typeof useGetErrorResolutionSuggestionLazyQuery
>
export type GetErrorResolutionSuggestionQueryResult = Apollo.QueryResult<
	Types.GetErrorResolutionSuggestionQuery,
	Types.GetErrorResolutionSuggestionQueryVariables
>
export const GetWorkspaceSettingsDocument = gql`
	query GetWorkspaceSettings($workspace_id: ID!) {
		workspaceSettings(workspace_id: $workspace_id) {
			workspace_id
			ai_application
			ai_insights
			enable_session_export
			enable_unlisted_sharing
			enable_ingest_sampling
			enable_data_deletion
		}
	}
`

/**
 * __useGetWorkspaceSettingsQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceSettingsQuery({
 *   variables: {
 *      workspace_id: // value for 'workspace_id'
 *   },
 * });
 */
export function useGetWorkspaceSettingsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetWorkspaceSettingsQuery,
		Types.GetWorkspaceSettingsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetWorkspaceSettingsQuery,
		Types.GetWorkspaceSettingsQueryVariables
	>(GetWorkspaceSettingsDocument, baseOptions)
}
export function useGetWorkspaceSettingsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetWorkspaceSettingsQuery,
		Types.GetWorkspaceSettingsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetWorkspaceSettingsQuery,
		Types.GetWorkspaceSettingsQueryVariables
	>(GetWorkspaceSettingsDocument, baseOptions)
}
export type GetWorkspaceSettingsQueryHookResult = ReturnType<
	typeof useGetWorkspaceSettingsQuery
>
export type GetWorkspaceSettingsLazyQueryHookResult = ReturnType<
	typeof useGetWorkspaceSettingsLazyQuery
>
export type GetWorkspaceSettingsQueryResult = Apollo.QueryResult<
	Types.GetWorkspaceSettingsQuery,
	Types.GetWorkspaceSettingsQueryVariables
>
export const GetSystemConfigurationDocument = gql`
	query GetSystemConfiguration {
		system_configuration {
			maintenance_start
			maintenance_end
		}
	}
`

/**
 * __useGetSystemConfigurationQuery__
 *
 * To run a query within a React component, call `useGetSystemConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSystemConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSystemConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSystemConfigurationQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetSystemConfigurationQuery,
		Types.GetSystemConfigurationQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetSystemConfigurationQuery,
		Types.GetSystemConfigurationQueryVariables
	>(GetSystemConfigurationDocument, baseOptions)
}
export function useGetSystemConfigurationLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetSystemConfigurationQuery,
		Types.GetSystemConfigurationQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetSystemConfigurationQuery,
		Types.GetSystemConfigurationQueryVariables
	>(GetSystemConfigurationDocument, baseOptions)
}
export type GetSystemConfigurationQueryHookResult = ReturnType<
	typeof useGetSystemConfigurationQuery
>
export type GetSystemConfigurationLazyQueryHookResult = ReturnType<
	typeof useGetSystemConfigurationLazyQuery
>
export type GetSystemConfigurationQueryResult = Apollo.QueryResult<
	Types.GetSystemConfigurationQuery,
	Types.GetSystemConfigurationQueryVariables
>
export const GetErrorObjectsDocument = gql`
	query GetErrorObjects(
		$errorGroupSecureID: String!
		$after: String
		$before: String
		$query: String!
	) {
		error_objects(
			error_group_secure_id: $errorGroupSecureID
			after: $after
			before: $before
			query: $query
		) {
			edges {
				cursor
				node {
					id
					createdAt
					event
					timestamp
					errorGroupSecureID
					serviceVersion
					serviceName
					session {
						secureID
						email
						fingerprint
						excluded
					}
				}
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
				startCursor
				endCursor
			}
		}
	}
`

/**
 * __useGetErrorObjectsQuery__
 *
 * To run a query within a React component, call `useGetErrorObjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorObjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorObjectsQuery({
 *   variables: {
 *      errorGroupSecureID: // value for 'errorGroupSecureID'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetErrorObjectsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetErrorObjectsQuery,
		Types.GetErrorObjectsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorObjectsQuery,
		Types.GetErrorObjectsQueryVariables
	>(GetErrorObjectsDocument, baseOptions)
}
export function useGetErrorObjectsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorObjectsQuery,
		Types.GetErrorObjectsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorObjectsQuery,
		Types.GetErrorObjectsQueryVariables
	>(GetErrorObjectsDocument, baseOptions)
}
export type GetErrorObjectsQueryHookResult = ReturnType<
	typeof useGetErrorObjectsQuery
>
export type GetErrorObjectsLazyQueryHookResult = ReturnType<
	typeof useGetErrorObjectsLazyQuery
>
export type GetErrorObjectsQueryResult = Apollo.QueryResult<
	Types.GetErrorObjectsQuery,
	Types.GetErrorObjectsQueryVariables
>
export const GetServicesDocument = gql`
	query GetServices(
		$project_id: ID!
		$query: String
		$after: String
		$before: String
	) {
		services(
			project_id: $project_id
			query: $query
			after: $after
			before: $before
		) {
			edges {
				cursor
				node {
					id
					projectID
					name
					status
					githubRepoPath
					buildPrefix
					githubPrefix
					errorDetails
				}
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
				startCursor
				endCursor
			}
		}
	}
`

/**
 * __useGetServicesQuery__
 *
 * To run a query within a React component, call `useGetServicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetServicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetServicesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      query: // value for 'query'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useGetServicesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetServicesQuery,
		Types.GetServicesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetServicesQuery,
		Types.GetServicesQueryVariables
	>(GetServicesDocument, baseOptions)
}
export function useGetServicesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetServicesQuery,
		Types.GetServicesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetServicesQuery,
		Types.GetServicesQueryVariables
	>(GetServicesDocument, baseOptions)
}
export type GetServicesQueryHookResult = ReturnType<typeof useGetServicesQuery>
export type GetServicesLazyQueryHookResult = ReturnType<
	typeof useGetServicesLazyQuery
>
export type GetServicesQueryResult = Apollo.QueryResult<
	Types.GetServicesQuery,
	Types.GetServicesQueryVariables
>
export const GetServiceByNameDocument = gql`
	query GetServiceByName($project_id: ID!, $name: String!) {
		serviceByName(project_id: $project_id, name: $name) {
			id
			projectID
			name
			status
			githubRepoPath
			buildPrefix
			githubPrefix
			errorDetails
		}
	}
`

/**
 * __useGetServiceByNameQuery__
 *
 * To run a query within a React component, call `useGetServiceByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetServiceByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetServiceByNameQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGetServiceByNameQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetServiceByNameQuery,
		Types.GetServiceByNameQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetServiceByNameQuery,
		Types.GetServiceByNameQueryVariables
	>(GetServiceByNameDocument, baseOptions)
}
export function useGetServiceByNameLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetServiceByNameQuery,
		Types.GetServiceByNameQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetServiceByNameQuery,
		Types.GetServiceByNameQueryVariables
	>(GetServiceByNameDocument, baseOptions)
}
export type GetServiceByNameQueryHookResult = ReturnType<
	typeof useGetServiceByNameQuery
>
export type GetServiceByNameLazyQueryHookResult = ReturnType<
	typeof useGetServiceByNameLazyQuery
>
export type GetServiceByNameQueryResult = Apollo.QueryResult<
	Types.GetServiceByNameQuery,
	Types.GetServiceByNameQueryVariables
>
export const GetErrorTagsDocument = gql`
	query GetErrorTags {
		error_tags {
			...ErrorTag
		}
	}
	${ErrorTagFragmentDoc}
`

/**
 * __useGetErrorTagsQuery__
 *
 * To run a query within a React component, call `useGetErrorTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetErrorTagsQuery(
	baseOptions?: Apollo.QueryHookOptions<
		Types.GetErrorTagsQuery,
		Types.GetErrorTagsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetErrorTagsQuery,
		Types.GetErrorTagsQueryVariables
	>(GetErrorTagsDocument, baseOptions)
}
export function useGetErrorTagsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetErrorTagsQuery,
		Types.GetErrorTagsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetErrorTagsQuery,
		Types.GetErrorTagsQueryVariables
	>(GetErrorTagsDocument, baseOptions)
}
export type GetErrorTagsQueryHookResult = ReturnType<
	typeof useGetErrorTagsQuery
>
export type GetErrorTagsLazyQueryHookResult = ReturnType<
	typeof useGetErrorTagsLazyQuery
>
export type GetErrorTagsQueryResult = Apollo.QueryResult<
	Types.GetErrorTagsQuery,
	Types.GetErrorTagsQueryVariables
>
export const MatchErrorTagDocument = gql`
	query MatchErrorTag($query: String!) {
		match_error_tag(query: $query) {
			id
			title
			description
			score
		}
	}
`

/**
 * __useMatchErrorTagQuery__
 *
 * To run a query within a React component, call `useMatchErrorTagQuery` and pass it any options that fit your needs.
 * When your component renders, `useMatchErrorTagQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMatchErrorTagQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useMatchErrorTagQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.MatchErrorTagQuery,
		Types.MatchErrorTagQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.MatchErrorTagQuery,
		Types.MatchErrorTagQueryVariables
	>(MatchErrorTagDocument, baseOptions)
}
export function useMatchErrorTagLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.MatchErrorTagQuery,
		Types.MatchErrorTagQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.MatchErrorTagQuery,
		Types.MatchErrorTagQueryVariables
	>(MatchErrorTagDocument, baseOptions)
}
export type MatchErrorTagQueryHookResult = ReturnType<
	typeof useMatchErrorTagQuery
>
export type MatchErrorTagLazyQueryHookResult = ReturnType<
	typeof useMatchErrorTagLazyQuery
>
export type MatchErrorTagQueryResult = Apollo.QueryResult<
	Types.MatchErrorTagQuery,
	Types.MatchErrorTagQueryVariables
>
export const FindSimilarErrorsDocument = gql`
	query FindSimilarErrors($query: String!) {
		find_similar_errors(query: $query) {
			id
			type
			event
			stack_trace
			score
		}
	}
`

/**
 * __useFindSimilarErrorsQuery__
 *
 * To run a query within a React component, call `useFindSimilarErrorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindSimilarErrorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindSimilarErrorsQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useFindSimilarErrorsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.FindSimilarErrorsQuery,
		Types.FindSimilarErrorsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.FindSimilarErrorsQuery,
		Types.FindSimilarErrorsQueryVariables
	>(FindSimilarErrorsDocument, baseOptions)
}
export function useFindSimilarErrorsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.FindSimilarErrorsQuery,
		Types.FindSimilarErrorsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.FindSimilarErrorsQuery,
		Types.FindSimilarErrorsQueryVariables
	>(FindSimilarErrorsDocument, baseOptions)
}
export type FindSimilarErrorsQueryHookResult = ReturnType<
	typeof useFindSimilarErrorsQuery
>
export type FindSimilarErrorsLazyQueryHookResult = ReturnType<
	typeof useFindSimilarErrorsLazyQuery
>
export type FindSimilarErrorsQueryResult = Apollo.QueryResult<
	Types.FindSimilarErrorsQuery,
	Types.FindSimilarErrorsQueryVariables
>
export const GetTraceDocument = gql`
	query GetTrace($project_id: ID!, $trace_id: String!) {
		trace(project_id: $project_id, trace_id: $trace_id) {
			trace {
				timestamp
				traceID
				spanID
				parentSpanID
				projectID
				secureSessionID
				traceState
				spanName
				spanKind
				duration
				serviceName
				serviceVersion
				environment
				traceAttributes
				startTime
				statusCode
				statusMessage
			}
			errors {
				created_at
				trace_id
				span_id
				log_cursor
				event
				type
				source
				timestamp
				error_group_secure_id
			}
		}
	}
`

/**
 * __useGetTraceQuery__
 *
 * To run a query within a React component, call `useGetTraceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTraceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTraceQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      trace_id: // value for 'trace_id'
 *   },
 * });
 */
export function useGetTraceQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTraceQuery,
		Types.GetTraceQueryVariables
	>,
) {
	return Apollo.useQuery<Types.GetTraceQuery, Types.GetTraceQueryVariables>(
		GetTraceDocument,
		baseOptions,
	)
}
export function useGetTraceLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTraceQuery,
		Types.GetTraceQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTraceQuery,
		Types.GetTraceQueryVariables
	>(GetTraceDocument, baseOptions)
}
export type GetTraceQueryHookResult = ReturnType<typeof useGetTraceQuery>
export type GetTraceLazyQueryHookResult = ReturnType<
	typeof useGetTraceLazyQuery
>
export type GetTraceQueryResult = Apollo.QueryResult<
	Types.GetTraceQuery,
	Types.GetTraceQueryVariables
>
export const GetTracesDocument = gql`
	query GetTraces(
		$project_id: ID!
		$params: QueryInput!
		$after: String
		$before: String
		$at: String
		$direction: SortDirection!
	) {
		traces(
			project_id: $project_id
			params: $params
			after: $after
			before: $before
			at: $at
			direction: $direction
		) {
			edges {
				cursor
				node {
					timestamp
					traceID
					spanID
					parentSpanID
					projectID
					secureSessionID
					traceState
					spanName
					spanKind
					duration
					serviceName
					serviceVersion
					environment
					traceAttributes
					statusCode
					statusMessage
				}
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
				startCursor
				endCursor
			}
		}
	}
`

/**
 * __useGetTracesQuery__
 *
 * To run a query within a React component, call `useGetTracesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTracesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTracesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      params: // value for 'params'
 *      after: // value for 'after'
 *      before: // value for 'before'
 *      at: // value for 'at'
 *      direction: // value for 'direction'
 *   },
 * });
 */
export function useGetTracesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTracesQuery,
		Types.GetTracesQueryVariables
	>,
) {
	return Apollo.useQuery<Types.GetTracesQuery, Types.GetTracesQueryVariables>(
		GetTracesDocument,
		baseOptions,
	)
}
export function useGetTracesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTracesQuery,
		Types.GetTracesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTracesQuery,
		Types.GetTracesQueryVariables
	>(GetTracesDocument, baseOptions)
}
export type GetTracesQueryHookResult = ReturnType<typeof useGetTracesQuery>
export type GetTracesLazyQueryHookResult = ReturnType<
	typeof useGetTracesLazyQuery
>
export type GetTracesQueryResult = Apollo.QueryResult<
	Types.GetTracesQuery,
	Types.GetTracesQueryVariables
>
export const GetTracesMetricsDocument = gql`
	query GetTracesMetrics(
		$project_id: ID!
		$params: QueryInput!
		$column: String!
		$metric_types: [MetricAggregator!]!
		$group_by: [String!]!
		$bucket_by: String
		$limit: Int
		$limit_aggregator: MetricAggregator
		$limit_column: String
	) {
		traces_metrics(
			project_id: $project_id
			params: $params
			column: $column
			metric_types: $metric_types
			group_by: $group_by
			bucket_by: $bucket_by
			limit: $limit
			limit_aggregator: $limit_aggregator
			limit_column: $limit_column
		) {
			buckets {
				bucket_id
				group
				metric_type
				metric_value
			}
			bucket_count
			sample_factor
		}
	}
`

/**
 * __useGetTracesMetricsQuery__
 *
 * To run a query within a React component, call `useGetTracesMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTracesMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTracesMetricsQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      params: // value for 'params'
 *      column: // value for 'column'
 *      metric_types: // value for 'metric_types'
 *      group_by: // value for 'group_by'
 *      bucket_by: // value for 'bucket_by'
 *      limit: // value for 'limit'
 *      limit_aggregator: // value for 'limit_aggregator'
 *      limit_column: // value for 'limit_column'
 *   },
 * });
 */
export function useGetTracesMetricsQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTracesMetricsQuery,
		Types.GetTracesMetricsQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetTracesMetricsQuery,
		Types.GetTracesMetricsQueryVariables
	>(GetTracesMetricsDocument, baseOptions)
}
export function useGetTracesMetricsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTracesMetricsQuery,
		Types.GetTracesMetricsQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTracesMetricsQuery,
		Types.GetTracesMetricsQueryVariables
	>(GetTracesMetricsDocument, baseOptions)
}
export type GetTracesMetricsQueryHookResult = ReturnType<
	typeof useGetTracesMetricsQuery
>
export type GetTracesMetricsLazyQueryHookResult = ReturnType<
	typeof useGetTracesMetricsLazyQuery
>
export type GetTracesMetricsQueryResult = Apollo.QueryResult<
	Types.GetTracesMetricsQuery,
	Types.GetTracesMetricsQueryVariables
>
export const GetTracesKeysDocument = gql`
	query GetTracesKeys(
		$project_id: ID!
		$date_range: DateRangeRequiredInput!
		$query: String
	) {
		keys: traces_keys(
			project_id: $project_id
			date_range: $date_range
			query: $query
		) {
			name
			type
		}
	}
`

/**
 * __useGetTracesKeysQuery__
 *
 * To run a query within a React component, call `useGetTracesKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTracesKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTracesKeysQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      date_range: // value for 'date_range'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetTracesKeysQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTracesKeysQuery,
		Types.GetTracesKeysQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetTracesKeysQuery,
		Types.GetTracesKeysQueryVariables
	>(GetTracesKeysDocument, baseOptions)
}
export function useGetTracesKeysLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTracesKeysQuery,
		Types.GetTracesKeysQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTracesKeysQuery,
		Types.GetTracesKeysQueryVariables
	>(GetTracesKeysDocument, baseOptions)
}
export type GetTracesKeysQueryHookResult = ReturnType<
	typeof useGetTracesKeysQuery
>
export type GetTracesKeysLazyQueryHookResult = ReturnType<
	typeof useGetTracesKeysLazyQuery
>
export type GetTracesKeysQueryResult = Apollo.QueryResult<
	Types.GetTracesKeysQuery,
	Types.GetTracesKeysQueryVariables
>
export const GetTracesKeyValuesDocument = gql`
	query GetTracesKeyValues(
		$project_id: ID!
		$key_name: String!
		$date_range: DateRangeRequiredInput!
	) {
		key_values: traces_key_values(
			project_id: $project_id
			key_name: $key_name
			date_range: $date_range
		)
	}
`

/**
 * __useGetTracesKeyValuesQuery__
 *
 * To run a query within a React component, call `useGetTracesKeyValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTracesKeyValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTracesKeyValuesQuery({
 *   variables: {
 *      project_id: // value for 'project_id'
 *      key_name: // value for 'key_name'
 *      date_range: // value for 'date_range'
 *   },
 * });
 */
export function useGetTracesKeyValuesQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetTracesKeyValuesQuery,
		Types.GetTracesKeyValuesQueryVariables
	>,
) {
	return Apollo.useQuery<
		Types.GetTracesKeyValuesQuery,
		Types.GetTracesKeyValuesQueryVariables
	>(GetTracesKeyValuesDocument, baseOptions)
}
export function useGetTracesKeyValuesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetTracesKeyValuesQuery,
		Types.GetTracesKeyValuesQueryVariables
	>,
) {
	return Apollo.useLazyQuery<
		Types.GetTracesKeyValuesQuery,
		Types.GetTracesKeyValuesQueryVariables
	>(GetTracesKeyValuesDocument, baseOptions)
}
export type GetTracesKeyValuesQueryHookResult = ReturnType<
	typeof useGetTracesKeyValuesQuery
>
export type GetTracesKeyValuesLazyQueryHookResult = ReturnType<
	typeof useGetTracesKeyValuesLazyQuery
>
export type GetTracesKeyValuesQueryResult = Apollo.QueryResult<
	Types.GetTracesKeyValuesQuery,
	Types.GetTracesKeyValuesQueryVariables
>
