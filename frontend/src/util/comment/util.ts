import { GetCommentMentionSuggestionsQuery } from '@graph/operations'
import { SessionCommentType } from '@graph/schemas'
import { ParsedSessionComment } from '@pages/Player/ReplayerContext'

export const getFeedbackCommentSessionTimestamp = (
	comment: ParsedSessionComment,
	sessionStartTime: number,
) => {
	if (comment.type !== SessionCommentType.Feedback) {
		console.error('This comment is not the correct type.')
		return 0
	}

	const commentCreatedAt = new Date(comment.metadata.timestamp)

	const dateTimeSessionStart = new Date(sessionStartTime)
	const deltaMilliseconds =
		commentCreatedAt.getTime() - dateTimeSessionStart.getTime()

	return deltaMilliseconds
}

export interface CommentSuggestion {
	id: string
	name: string
	email?: string
	photoUrl: string
}

export const getCommentMentionSuggestions = (
	suggestions: GetCommentMentionSuggestionsQuery | undefined,
): CommentSuggestion[] => {
	if (!suggestions) {
		return []
	}
	const mappedAdmins: CommentSuggestion[] = suggestions.admins.map((wa) => ({
		id: wa.admin!.id,
		email: wa.admin!.email,
		name: wa.admin?.name || '',
		photoUrl: wa.admin!.photo_url as string,
	}))

	if (suggestions.slack_channel_suggestion.length === 0) {
		return mappedAdmins
	}

	return [
		...mappedAdmins,
		...suggestions.slack_channel_suggestion.map<CommentSuggestion>(
			(suggestion) => ({
				id: suggestion.webhook_channel_id as string,
				name: suggestion.webhook_channel as string,
				photoUrl: '',
				email: suggestion.webhook_channel?.includes('#')
					? 'Slack Channel'
					: 'Slack User',
			}),
		),
	].sort((suggestionA, suggestionB) =>
		(['@', '#'].includes(suggestionA.name[0])
			? suggestionA.name.slice(1)
			: suggestionA.name
		).toLowerCase() >
		(['@', '#'].includes(suggestionB.name[0])
			? suggestionB.name.slice(1)
			: suggestionB.name
		).toLowerCase()
			? 1
			: -1,
	)
}
