import { toast } from '@components/Toaster'
import * as Types from '@graph/schemas'
import {
	Maybe,
	SanitizedSlackChannel,
	SanitizedSlackChannelInput,
} from '@graph/schemas'
import { MentionItem, SuggestionDataItem } from '@highlight-run/react-mentions'
import { useNavigate } from 'react-router-dom'

import { useDeleteSessionCommentMutation } from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'
import {
	ParsedSessionComment,
	useReplayerContext,
} from '@/pages/Player/ReplayerContext'
import {
	CommentSuggestion,
	getFeedbackCommentSessionTimestamp,
} from '@/util/comment/util'

export function filterMentionedAdmins(
	admins: Maybe<
		{ __typename?: 'Admin' } & Pick<
			Types.Admin,
			'id' | 'name' | 'email' | 'photo_url'
		>
	>[],
	mentions: MentionItem[],
) {
	return mentions
		.filter(
			(mention) =>
				!mention.display.includes('@') &&
				!mention.display.includes('#'),
		)
		.map((mention) => {
			const admin = admins?.find((admin) => {
				return admin?.id === mention.id
			})
			return { id: mention.id, email: admin?.email || '' }
		})
}

export function filterMentionedSlackUsers(
	slackMembers: Maybe<SanitizedSlackChannel>[],
	mentions: MentionItem[],
) {
	return mentions
		.filter(
			(mention) =>
				mention.display.includes('@') || mention.display.includes('#'),
		)
		.map<SanitizedSlackChannelInput>((mention) => {
			const matchingSlackUser = slackMembers.find((slackUser) => {
				return slackUser?.webhook_channel_id === mention.id
			})

			return {
				webhook_channel_id: matchingSlackUser?.webhook_channel_id,
				webhook_channel_name: matchingSlackUser?.webhook_channel,
			}
		})
}

export const useNavigateToComment = (comment: ParsedSessionComment) => {
	const navigate = useNavigate()
	const { pause, sessionMetadata } = useReplayerContext()

	return () => {
		const urlSearchParams = new URLSearchParams(window.location.search)
		urlSearchParams.append(PlayerSearchParameters.commentId, comment?.id)

		navigate(`${location.pathname}?${urlSearchParams.toString()}`, {
			replace: true,
		})

		let commentTimestamp = comment.timestamp || 0

		if (comment.type === Types.SessionCommentType.Feedback) {
			const sessionStartTime = sessionMetadata.startTime

			if (sessionStartTime) {
				commentTimestamp = getFeedbackCommentSessionTimestamp(
					comment,
					sessionStartTime,
				)
			}
		}

		pause(commentTimestamp)
	}
}

export const useDeleteComment = (comment: ParsedSessionComment) => {
	const [deleteSessionComment] = useDeleteSessionCommentMutation({
		refetchQueries: [
			namedOperations.Query.GetSessionComments,
			namedOperations.Query.GetSessions,
		],
	})

	return async () => {
		await deleteSessionComment({
			variables: {
				id: comment.id,
			},
		})

		const urlSearchParams = new URLSearchParams(window.location.search)

		const urlCommentId = urlSearchParams.get(
			PlayerSearchParameters.commentId,
		)

		if (urlCommentId === comment.id) {
			urlSearchParams.delete(PlayerSearchParameters.commentId)
		}

		toast.success('Comment deleted.')
	}
}

export const getDeepLinkedCommentId = () => {
	return new URLSearchParams(location.search).get(
		PlayerSearchParameters.commentId,
	)
}

export interface AdminSuggestion extends SuggestionDataItem {
	email?: string
	photoUrl?: string
	name?: string
}

export const parseAdminSuggestions = (
	/** A list of all admins in the project. */
	suggestions: CommentSuggestion[],
	/** The current logged in admin. */
	currentAdmin: Types.Admin | undefined,
	/** A list of admins that have already been mentioned. */
	mentionedAdmins: Types.SanitizedAdminInput[],
): AdminSuggestion[] => {
	if (!currentAdmin) {
		return []
	}

	return (
		suggestions
			// Filter out these admins
			.filter(
				(suggestion) =>
					// 1. The admin that is creating the comment
					suggestion?.email !== currentAdmin.email &&
					// 2. Admins that are already mentioned
					!mentionedAdmins.some(
						(mentionedAdmin) =>
							mentionedAdmin.id === suggestion?.id,
					),
			)
			.map((suggestion) => {
				return {
					id: suggestion!.id,
					email: suggestion!.email,
					photo_url: suggestion!.photoUrl,
					display: suggestion?.name || suggestion!.email || '',
					name: suggestion?.name,
				}
			})
	)
}
