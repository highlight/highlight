import {
	Badge,
	Box,
	IconSolidCheveronRight,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { Progress } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'

import { SessionToggle } from '@/graph/generated/schemas'

import { ToggleRowForm } from './ToggleRowForm'

type ToggleRowProps = {
	toggle: SessionToggle
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ toggle }) => {
	const [editting, setEditing] = useState(false)

	if (editting) {
		return (
			<ToggleRowForm toggle={toggle} onSubmit={() => setEditing(false)} />
		)
	}

	return (
		<Box
			border="dividerWeak"
			width="full"
			display="flex"
			p="12"
			gap="16"
			background="raised"
			borderRadius="6"
		>
			<Stack width="full" gap="12">
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					gap="8"
				>
					<Stack gap="12">
						<Box display="flex" alignItems="center">
							<Text weight="medium" size="small" color="strong">
								{toggle.name}
							</Text>
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

					<Stack gap="4">
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
					<Box display="flex" gap="8">
						<Tag
							kind="primary"
							size="medium"
							shape="basic"
							emphasis="low"
							iconRight={<IconSolidCheveronRight />}
							onClick={() => setEditing(true)}
						>
							Configure
						</Tag>
					</Box>
				</Box>
			</Stack>
		</Box>
	)
}
