import { Box, Stack } from '@highlight-run/ui'
import { Guides } from '@pages/Setup/SetupRouter/SetupRouter'
import { useParams } from '@util/react-router/useParams'
import * as React from 'react'
import { Link } from 'react-router-dom'

export type OptionListItem = {
	name: string
	imageUrl: string
	path: string
}

type Props = {
	docs: Guides
	integrated: boolean
}

export const SetupOptionsList: React.FC<Props> = ({ docs, integrated }) => {
	const { language } = useParams<{ language: string }>()
	const docsSection = docs[language as keyof typeof docs]
	const options = Object.keys(docsSection || {}).map((option) => {
		const optionDocs = docsSection[option]

		return {
			key: option,
			name: optionDocs.title,
			imageUrl: optionDocs.logoUrl,
			path: `/setup/ux/${option}`,
		}
	})
	console.log('::: options', options)

	return (
		<Box>
			<Box backgroundColor="elevated" p="10">
				Integrated: {integrated.toString()}
			</Box>

			<Box style={{ maxWidth: 500 }} my="40" mx="auto">
				<Stack gap="6" p="10">
					{options.map((option, index) => {
						console.log('::: index', index)
						return (
							<Box
								key={index}
								backgroundColor="elevated"
								padding="10"
								borderRadius="6"
								flexGrow={1}
							>
								<Box>Name: {option.name as string}</Box>
								<Box>
									Image URL: {option.imageUrl as string}
								</Box>
								<Box>Path: {option.path}</Box>
								<Link to={option.key}>
									{option.name as string}
								</Link>
							</Box>
						)
					})}
				</Stack>
			</Box>
		</Box>
	)
}
