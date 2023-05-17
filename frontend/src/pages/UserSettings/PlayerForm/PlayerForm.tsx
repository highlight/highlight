import { Heading, Stack } from '@highlight-run/ui'
import { isIndexedDBEnabled, setIndexedDBEnabled } from '@util/db'
import React from 'react'

import { ToggleRow } from '@/components/ToggleRow/ToggleRow'

const dbcache = {
	label: 'Use IndexedDB Cache',
	info: 'IndexedDB Browser Cache is used to preload all data in Highlight and speed up repeated loading, but it can increase memory usage.',
}

export const PlayerForm = () => {
	const [checked, setChecked] = React.useState<boolean>(isIndexedDBEnabled())

	React.useEffect(() => {
		setIndexedDBEnabled(checked)
	}, [checked])

	return (
		<Stack gap="24" direction="column">
			<Heading mt="16" level="h4">
				App Settings
			</Heading>
			{ToggleRow(dbcache.label, dbcache.info, checked, setChecked, false)}
		</Stack>
	)
}
