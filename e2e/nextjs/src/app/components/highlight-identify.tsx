'use client'

import { H } from '@highlight-run/next/client'
import { initialize } from '@launchdarkly/js-client-sdk'
import { useEffect } from 'react'

H.init('1', {
	debug: { clientInteractions: true, domRecording: true },
})
const ldClient = initialize(process.env.NEXT_PUBLIC_LAUNCHDARKLY_SDK_KEY)
// @ts-ignore
window.ldClient = ldClient
H.registerLD(ldClient)

export function HighlightIdentify() {
	useEffect(() => {
		// @ts-ignore
		window.ldClient.identify({
			kind: 'multi',
			user: { key: 'bob' },
			org: { key: 'MacDonwalds' },
		})
	}, [])

	return null
}
