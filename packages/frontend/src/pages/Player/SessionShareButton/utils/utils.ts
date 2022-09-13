import { PlayerSearchParameters } from '../../PlayerHook/utils'

export const onGetLink = () => {
	return new URL(window.location.href)
}

/**
 * Copies the current session URL with a search parameter "ts" with the player's current time in seconds.
 */
export const onGetLinkWithTimestamp = (time: number) => {
	const currentUrl = new URL(window.location.href)
	currentUrl.searchParams.set(
		PlayerSearchParameters.ts,
		(time / 1000).toString(),
	)

	return currentUrl
}
