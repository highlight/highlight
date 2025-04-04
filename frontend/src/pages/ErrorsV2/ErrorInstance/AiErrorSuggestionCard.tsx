import { Box, Stack, Text } from '@highlight-run/ui/components'

import { Avatar } from '@/components/Avatar/Avatar'

import type { JSX } from 'react'

interface Props {
	content: JSX.Element
}

const AiErrorSuggestionCard = ({ content }: Props) => {
	return (
		<Stack p="8" gap="12" flexDirection="column">
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Stack direction="row" gap="6" alignItems="center">
					<Avatar />
					<Text size="small" color="strong" lines="1">
						Harold
					</Text>
					<Text size="small" color="moderate" lines="1">
						just now
					</Text>
				</Stack>
			</Box>
			{content}
		</Stack>
	)
}

export default AiErrorSuggestionCard
