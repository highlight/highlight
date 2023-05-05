import { Admin, SanitizedAdminInput } from '@graph/schemas'
import { CommentSuggestion } from '@util/comment/util'
import { SuggestionDataItem } from 'react-mentions'

export interface AdminSuggestion extends SuggestionDataItem {
	email?: string
	photoUrl?: string
	name?: string
}

export const parseAdminSuggestions = (
	/** A list of all admins in the project. */
	suggestions: CommentSuggestion[],
	/** The current logged in admin. */
	currentAdmin: Admin | undefined,
	/** A list of admins that have already been mentioned. */
	mentionedAdmins: SanitizedAdminInput[],
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
