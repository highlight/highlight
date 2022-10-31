import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Button } from './Button'
import { Box } from '../Box/Box'
import { IconShare } from '../icons/IconShare'
import { IconCaretDown, IconCreateFile } from '../icons'

export default {
	title: 'Components/Button',
	component: Button,
} as ComponentMeta<typeof Button>

export const Variants = () => (
	<>
		<Box display="flex" gap="6" marginBottom="32">
			<Button variant="primary" size="xSmall">
				Primary (xSmall)
			</Button>
			<Button variant="primary" size="small">
				Primary (small)
			</Button>
			<Button variant="primary" size="medium">
				Primary (medium)
			</Button>
			<Button variant="primary" size="large">
				Primary (large)
			</Button>
			<Button variant="primary" size="xLarge">
				Primary (xLarge)
			</Button>
			<Button variant="primary" size="xLarge" disabled>
				Primary (disabled)
			</Button>
		</Box>

		<Box display="flex" gap="6" marginBottom="32">
			<Button variant="white" size="xSmall">
				White (xSmall)
			</Button>
			<Button variant="white" size="small">
				White (small)
			</Button>
			<Button variant="white" size="medium">
				White (medium)
			</Button>
			<Button variant="white" size="large">
				White (large)
			</Button>
			<Button variant="white" size="xLarge">
				White (xLarge)
			</Button>
			<Button variant="white" size="xLarge" disabled>
				White (disabled)
			</Button>
		</Box>

		<Box display="flex" gap="6" marginBottom="32">
			<Button variant="grey" size="xSmall">
				Grey (xSmall)
			</Button>
			<Button variant="grey" size="small">
				Grey (small)
			</Button>
			<Button variant="grey" size="medium">
				Grey (medium)
			</Button>
			<Button variant="grey" size="large">
				Grey (large)
			</Button>
			<Button variant="grey" size="xLarge">
				Grey (xLarge)
			</Button>
			<Button variant="grey" size="xLarge" disabled>
				Grey (disabled)
			</Button>
		</Box>
	</>
)

export const Icons = () => (
	<Box display="flex" gap="6" marginBottom="32">
		<Button iconLeft={<IconShare />} size="xSmall">
			Button with Icon
		</Button>
		<Button variant="grey" iconRight={<IconCaretDown />} size="small">
			Button with Icon
		</Button>
		<Button
			variant="white"
			iconLeft={<IconCreateFile />}
			iconRight={<IconCaretDown />}
			size="medium"
		>
			Button with Icon
		</Button>
		<Button iconLeft={<IconShare />} size="large">
			Button with Icon
		</Button>
		<Button
			variant="grey"
			iconLeft={<IconCaretDown />}
			iconRight={<IconCreateFile />}
			size="xLarge"
		>
			Button with Icon
		</Button>
		<Button
			variant="white"
			iconRight={<IconCreateFile />}
			size="xLarge"
			disabled
		>
			Button with Icon
		</Button>
	</Box>
)
