import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { Heading } from '../Heading/Heading'
import { typographyStyles } from './styles.css'
import { Text } from './Text'

export default {
	title: 'Components/Text',
	component: Text,
} as Meta<typeof Text>

export const Sizes = () => {
	return Object.keys(typographyStyles.size).map((size) => (
		<Box marginBottom="24" key={size}>
			{Object.keys(typographyStyles.weight).map((weight) => (
				<Box marginBottom="10" key={weight}>
					<Text
						size={size as keyof typeof typographyStyles.size}
						weight={weight as keyof typeof typographyStyles.weight}
						transform="capitalize"
					>
						{size} ({weight})
					</Text>
				</Box>
			))}
			<Box marginBottom="10">
				<Text
					size={size as keyof typeof typographyStyles.size}
					transform="capitalize"
					family="monospace"
				>
					{size} Monospace
				</Text>
			</Box>
		</Box>
	))
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

export const Clamping = () => (
	<div style={{ maxWidth: 400 }}>
		<Box p="24" background="n2" borderRadius="6" mb="24">
			<Heading level="h3" mb="16">
				1 Line
			</Heading>

			<Text lines="1">
				Lorem ipsum dolor sit amet consectetur, adipisicing elit.
				Eveniet labore sapiente, quaerat consectetur voluptatum
				accusamus quibusdam quam tempore eligendi ut mollitia maiores
				minima. Nobis labore, officia aliquam debitis voluptatem iure?
			</Text>
		</Box>
		<Box p="24" background="n2" borderRadius="6" mb="24">
			<Heading level="h3" mb="16">
				2 Lines
			</Heading>

			<Text lines="2">
				Lorem ipsum dolor sit amet consectetur, adipisicing elit.
				Eveniet labore sapiente, quaerat consectetur voluptatum
				accusamus quibusdam quam tempore eligendi ut mollitia maiores
				minima. Nobis labore, officia aliquam debitis voluptatem iure?
			</Text>
		</Box>
		<Box p="24" background="n2" borderRadius="6" mb="24">
			<Heading level="h3" mb="16">
				3 Lines
			</Heading>

			<Text lines="3">
				Lorem ipsum dolor sit amet consectetur, adipisicing elit.
				Eveniet labore sapiente, quaerat consectetur voluptatum
				accusamus quibusdam quam tempore eligendi ut mollitia maiores
				minima. Nobis labore, officia aliquam debitis voluptatem iure?
			</Text>
		</Box>
	</div>
)
