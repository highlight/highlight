import { H } from 'highlight.run'
import validator from 'validator'

import { Maybe, Session } from '../../../../../../graph/generated/schemas'

export const getIdentifiedUserProfileImage = (
	session: Maybe<Partial<Session>>,
): string | undefined => {
	if (!session || !session.user_properties) {
		return undefined
	}

	try {
		const avatarURL: string = JSON.parse(session.user_properties)?.avatar

		if (avatarURL && validator.isURL(avatarURL)) {
			return avatarURL
		}
	} catch {
		return undefined
	}
	return undefined
}

export const getUserProperties = (session?: Maybe<Partial<Session>>) => {
	try {
		if (typeof session?.user_properties === 'string') {
			return JSON.parse(session?.user_properties || '{}')
		}
	} catch (e) {
		if (e instanceof Error) {
			H.consumeError(e)
		}
	}
}

// Fallback logic for the display name shown for the session card
export const getDisplayNameAndField = (
	session?: Maybe<Partial<Session>>,
): [string, string | null] => {
	const userProperties = getUserProperties(session)

	if (userProperties?.highlightDisplayName) {
		return [userProperties?.highlightDisplayName, 'name']
	} else if (userProperties?.email) {
		return [userProperties?.email, 'email']
	} else if (session?.identifier && session.identifier !== 'null') {
		return [session.identifier, 'identifier']
	} else if (session?.fingerprint) {
		return [`#${session?.fingerprint}`, 'fingerprint']
	} else {
		return ['unidentified', null]
	}
}

// Fallback logic for the display name shown for the session card
export const getDisplayName = (session?: Maybe<Partial<Session>>): string => {
	return getDisplayNameAndField(session)[0]
}
