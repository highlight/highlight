import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Tooltip } from './Tooltip'
import { Box } from '../Box/Box'
import { Button } from '../Button/Button'
import { Text } from '../Text/Text'
import { Badge } from '../Badge/Badge'
import { Tag } from '../Tag/Tag'
import { IconChartBar, IconTrendingUp } from '../icons'

export default {
	title: 'Components/Tooltip',
	component: Tooltip,
} as ComponentMeta<typeof Tooltip>

export const Basic = () => (
	<Box display="flex" justifyContent="center">
		<Tooltip
			trigger={
				<Tag
					kind="grey"
					shape="basic"
					iconLeft={<IconTrendingUp size={12} />}
				>
					200%
				</Tag>
			}
		>
			<Box display="flex" alignItems="center" gap="4">
				<Text color="neutralN9" size="xSmall">
					since
				</Text>
				<Badge variant="white" label="30 days" />
			</Box>
		</Tooltip>
	</Box>
)
