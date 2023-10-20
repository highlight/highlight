import { Maybe, Session } from '@graph/schemas'
import { H } from 'highlight.run'
import validator from 'validator'

type SessionWithIdentityInformation = Pick<
	Session,
	'user_properties' | 'identifier' | 'fingerprint'
>

export const getIdentifiedUserProfileImage = (
	session?: Maybe<SessionWithIdentityInformation>,
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

export const getUserProperties = (
	userProperties?: Session['user_properties'],
) => {
	try {
		if (typeof userProperties === 'string') {
			return JSON.parse(userProperties || '{}')
		}
	} catch (e) {
		if (e instanceof Error) {
			H.consumeError(e)
		}
	}
}

// Fallback logic for the display name shown for the session card
export const getDisplayNameAndField = (
	session?: Maybe<SessionWithIdentityInformation>,
): [string, string | null] => {
	const userProperties = getUserProperties(session?.user_properties)

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
export const getDisplayName = (
	session?: Maybe<SessionWithIdentityInformation>,
): string => {
	return getDisplayNameAndField(session)[0]
}
