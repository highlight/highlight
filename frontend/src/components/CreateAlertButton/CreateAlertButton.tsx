import { Button } from '@components/Button'
import { Box, IconSolidBell } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import * as styles from './style.css'

export const CreateAlertButton = function ({
	type,
}: {
	type: 'session' | 'errors'
}) {
	const { projectId } = useProjectId()
	const navigate = useNavigate()
	return (
		<Button
			size="small"
			kind="primary"
			emphasis="high"
			trackingId={`${type}-player-bar-alerts`}
			iconLeft={<IconSolidBell />}
			onClick={() => {
				navigate(`/${projectId}/alerts/${type}/new`)
			}}
		>
			Turn on alerts
		</Button>
	)
}
export const Divider: React.FC = () => {
	return <Box className={styles.divider}></Box>
}
