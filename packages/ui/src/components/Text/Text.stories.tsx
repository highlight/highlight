import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Text } from './Text'
import { typography } from './styles.css'
import { Box } from '../Box/Box'

export default {
	title: 'Components/Text',
	component: Text,
} as ComponentMeta<typeof Text>

export const Sizes = () => {
	return Object.keys(typography.size).map(
		(size: keyof typeof typography.size) => (
			<Box marginBottom="xxLarge" key={size}>
				{Object.keys(typography.weight).map(
					(weight: keyof typeof typography.weight) => (
						<Box marginBottom="large" key={weight}>
							<Text
								size={size}
								weight={weight}
								transform="capitalize"
							>
								{size} ({weight})
							</Text>
						</Box>
					),
				)}
			</Box>
		),
	)
}

export const Elements = () => (
	<>
		<Text as="b">Bold</Text>
		<br />
		<Text as="i">Italic</Text>
		<br />
		<Text as="u">Underline</Text>
		<br />
		<Text as="abbr">I18N</Text>
		<br />
		<Text as="cite">Citation</Text>
		<br />
		<Text as="del">Deleted</Text>
		<br />
		<Text as="em">Emphasis</Text>
		<br />
		<Text as="ins">Inserted</Text>
		<br />
		<Text as="kbd">Ctrl + C</Text>
		<br />
		<Text as="mark">Highlighted</Text>
		<br />
		<Text as="s">Strikethrough</Text>
		<br />
		<Text as="samp">Sample</Text>
		<br />
		<Text as="sub">sub</Text>
		<br />
		<Text as="sup">sup</Text>
	</>
)
