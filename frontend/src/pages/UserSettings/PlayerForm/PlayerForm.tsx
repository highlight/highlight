import { Heading, Stack } from '@highlight-run/ui'
import { isIndexedDBEnabled, setIndexedDBEnabled } from '@util/db'
import React from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { ToggleRow } from '@/components/ToggleRow/ToggleRow'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'

const dbcache = {
	label: 'Use IndexedDB Cache',
	info: 'IndexedDB Browser Cache is used to preload all data in Highlight and speed up repeated loading, but it can increase memory usage.',
}

const aiExperiments = {
	label: 'AI Experiments',
	info: 'Opt into Highlight AI features in development',
}

export const PlayerForm = () => {
	const [checked, setChecked] = React.useState<boolean>(isIndexedDBEnabled())
	const { showAiExperiments, setShowAiExperiments } = usePlayerConfiguration()

	React.useEffect(() => {
		setIndexedDBEnabled(checked)
	}, [checked])

	return (
		<Stack gap="24" direction="column">
			<Heading mt="16" level="h4">
				App Settings
			</Heading>
			<BorderBox>
				{ToggleRow(
					dbcache.label,
					dbcache.info,
					checked,
					setChecked,
					false,
				)}
			</BorderBox>
			<BorderBox>
				{ToggleRow(
					aiExperiments.label,
					aiExperiments.info,
					showAiExperiments,
					setShowAiExperiments,
					false,
				)}
			</BorderBox>
		</Stack>
	)
}
