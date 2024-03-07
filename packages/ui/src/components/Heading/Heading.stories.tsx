import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { Text } from '../Text/Text'
import { Heading } from './Heading'

export default {
	title: 'Components/Heading',
	component: Heading,
} as Meta<typeof Heading>

export const Levels = () => (
	<>
		<Heading level="h1">Heading 1</Heading>
		<br />
		<Heading level="h2">Heading 2</Heading>
		<br />
		<Heading level="h3">Heading 3</Heading>
		<br />
		<Heading level="h4">Heading 4</Heading>
	</>
)

export const Clamping = () => (
	<div style={{ maxWidth: 600 }}>
		<Box p="24" background="n2" borderRadius="6" mb="24">
			<Text>1 Line</Text>
			<br />
			<Heading lines="1">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Esse,
				qui iste. Hic, adipisci dolorum quod, repellat, consectetur
				corporis ea excepturi beatae voluptatum quam rem cum totam
				suscipit illo delectus voluptates.
			</Heading>
		</Box>

		<Box p="24" background="n2" borderRadius="6" mb="24">
			<Text>2 Lines</Text>
			<br />
			<Heading lines="2">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Esse,
				qui iste. Hic, adipisci dolorum quod, repellat, consectetur
				corporis ea excepturi beatae voluptatum quam rem cum totam
				suscipit illo delectus voluptates.
			</Heading>
		</Box>

		<Box p="24" background="n2" borderRadius="6" mb="24">
			<Text>None</Text>
			<br />
			<Heading>
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Esse,
				qui iste. Hic, adipisci dolorum quod, repellat, consectetur
				corporis ea excepturi beatae voluptatum quam rem cum totam
				suscipit illo delectus voluptates.
			</Heading>
		</Box>
	</div>
)
