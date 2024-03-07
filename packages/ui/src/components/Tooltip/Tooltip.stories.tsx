import { Meta } from '@storybook/react'

import { Badge } from '../Badge/Badge'
import { Box } from '../Box/Box'
import { IconSolidTrendingUp } from '../icons'
import { Tag } from '../Tag/Tag'
import { Text } from '../Text/Text'
import { Tooltip } from './Tooltip'

export default {
	title: 'Components/Tooltip',
	component: Tooltip,
} as Meta<typeof Tooltip>

export const Basic = () => (
	<Box display="flex" justifyContent="center">
		<Tooltip
			trigger={
				<Tag
					kind="secondary"
					shape="basic"
					iconLeft={<IconSolidTrendingUp size={12} />}
				>
					200%
				</Tag>
			}
		>
			<Box display="flex" alignItems="center" gap="4">
				<Text color="n9" size="xSmall">
					since
				</Text>
				<Badge variant="white" label="30 days" />
			</Box>
		</Tooltip>
	</Box>
)
