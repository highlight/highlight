import { useEditFeatureToggleMutation } from '@graph/hooks'
import { Badge, Box, ButtonLink, Stack, Text } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { message, Progress } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'

import Switch from '@/components/Switch/Switch'
import { namedOperations } from '@/graph/generated/operations'
import { FeatureToggle } from '@/graph/generated/schemas'

import * as styles from './styles.css'
import { ToggleRowForm } from './ToggleRowForm'

type ToggleRowProps = {
	toggle: FeatureToggle
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ toggle }) => {
	const [editting, setEditing] = useState(false)
	const [editFeatureToggle] = useEditFeatureToggleMutation({
		refetchQueries: [namedOperations.Query.GetFeatureToggles],
	})

	if (editting) {
		return (
			<ToggleRowForm toggle={toggle} onSubmit={() => setEditing(false)} />
		)
	}

	const onEnableChange = (checked: boolean) => {
		editFeatureToggle({
			variables: {
				id: toggle.id,
				enabled: checked,
			},
		}).then(() => {
			message.success(`Toggle ${checked ? 'disabled' : 'enabled'}`)
		})
	}

	return (
		<Box
			border="dividerWeak"
			width="full"
			display="flex"
			p="12"
			borderRadius="6"
		>
			<Box cssClass={styles.grid} width="full">
				<Stack gap="16">
					<Box display="flex" alignItems="center">
						<ButtonLink onClick={() => setEditing(true)}>
							{toggle.name}
						</ButtonLink>
					</Box>
					<Text weight="medium" size="xSmall" color="weak">
						{toggle.created_at === toggle.updated_at ? (
							<>
								<b>Created:</b>{' '}
								{moment(toggle.created_at).fromNow()}
							</>
						) : (
							<>
								<b>Updated:</b>{' '}
								{moment(toggle.updated_at).fromNow()}
							</>
						)}
					</Text>
				</Stack>
				<Stack gap="4" justifySelf="center" width="full">
					<Box display="flex" alignItems="center">
						<Text>Enabled</Text>
						<Box display="flex" pl="8" alignItems="center">
							<Badge
								variant="gray"
								size="small"
								label={`${toggle.threshold}%`}
							/>
						</Box>
					</Box>
					<Progress
						percent={toggle.threshold}
						showInfo={false}
						strokeColor={colors.g8}
						trailColor={colors.r8}
						strokeWidth={4}
						status="normal"
					/>
				</Stack>
				<Box display="flex" justifySelf="flex-end" alignItems="center">
					<Switch
						trackingId={`ToggleEnabled-${toggle.id}`}
						justifySpaceBetween
						size="default"
						checked={toggle.enabled}
						onChange={onEnableChange}
					/>
				</Box>
			</Box>
		</Box>
	)
}
