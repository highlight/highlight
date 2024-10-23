import { Button } from '@components/Button'
import { Box, IconSolidBell } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductType } from '@/graph/generated/schemas'

import * as styles from './style.css'

export const CreateAlertButton = function ({ type }: { type: ProductType }) {
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
				navigate({
					pathname: `/${projectId}/alerts/new`,
					search: `source=${type}`,
				})
			}}
		>
			Turn on alerts
		</Button>
	)
}
export const Divider: React.FC = () => {
	return <Box cssClass={styles.divider}></Box>
}
