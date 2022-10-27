import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Text } from './Text'
import { typographyStyles } from './styles.css'
import { Box } from '../Box/Box'

export default {
	title: 'Components/Text',
	component: Text,
} as ComponentMeta<typeof Text>

export const Sizes = () => {
	return Object.keys(typographyStyles.size).map(
		(size: keyof typeof typographyStyles.size) => (
			<Box marginBottom="24" key={size}>
				{Object.keys(typographyStyles.weight).map(
					(weight: keyof typeof typographyStyles.weight) => (
						<Box marginBottom="10" key={weight}>
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
		<br />
		<Text as="code">code</Text>
	</>
)
