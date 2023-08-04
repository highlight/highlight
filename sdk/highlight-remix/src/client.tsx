import React, { useEffect } from 'react'

import Cookies from 'js-cookie'
import { H } from 'highlight.run'
import type { HighlightOptions } from 'highlight.run'
import { SESSION_STORAGE_KEYS } from '@highlight-run/client/src/utils/sessionStorage/sessionStorageKeys'

export { H } from 'highlight.run'

interface Props extends HighlightOptions {
	projectId?: string
}

export function HighlightInit({ projectId, ...highlightOptions }: Props) {
	useEffect(() => {
		if (projectId) {
			const { sessionSecureID } = H.init(projectId, highlightOptions) || {
				sessionSecureID: '',
			}

			if (sessionSecureID) {
				Cookies.set(
					SESSION_STORAGE_KEYS.SESSION_SECURE_ID,
					sessionSecureID,
				)
			}
		}
	}, [projectId, highlightOptions])

	return null
}
