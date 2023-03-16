import { LinkButton } from '@components/LinkButton'
import { Badge, Box, Heading, Stack, Text } from '@highlight-run/ui'
import { Guides } from '@pages/Setup/SetupRouter/SetupRouter'
import * as React from 'react'
import { Navigate, useMatch } from 'react-router-dom'

export type OptionListItem = {
	name: string
	imageUrl: string
	path: string
}

type Props = {
	docs: Guides
	integrated: boolean
}

const SERVER_LANGUAGE_OPTIONS: {
	[key: string]: { title: string; logoUrl: string; path: string }
} = {
	js: {
		title: 'JavaScript',
		logoUrl: '',
		path: 'js',
	},
	go: {
		title: 'Go',
		logoUrl: '',
		path: 'go',
	},
	python: {
		title: 'Python',
		logoUrl: '',
		path: 'python',
	},
}

export const SetupOptionsList: React.FC<Props> = ({ docs, integrated }) => {
	// TODO: See if we can handle an optional parameter.
	const areaMatch = useMatch('/:project_id/setup/:area')
	const languageMatch = useMatch('/:project_id/setup/:area/:language')
	const match = areaMatch ?? languageMatch
	const { area, language } = match?.params ?? {}
	const docsSection = language ? docs[area][language] : docs[area]
	const optionKeys = Object.keys(docsSection || {}).filter(
		(k) => ['title', 'subtitle'].indexOf(k) === -1,
	)
	console.log('::: docsSection', docsSection)

	// Redirect if there is only one option.
	if (optionKeys.length === 1) {
		return <Navigate to={optionKeys[0]} />
	}

	const options = optionKeys.map((optionKey) => {
		const optionDocs = docsSection[optionKey]

		return {
			key: optionKey,
			name: optionDocs.title,
			imageUrl: optionDocs.logoUrl,
			path: optionKey,
		}
	})
	console.log('::: options', options)

	return (
		<Box>
			<Box backgroundColor="elevated" p="10">
				Integrated: {integrated.toString()}
			</Box>

			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				{/* TODO: Make this dynamic */}
				<Badge kind="white" label="UX monitoring" size="medium" />
				<Heading mt="16">{docsSection.title}</Heading>
				<Box my="24">
					<Text>{docsSection.subtitle}</Text>
				</Box>

				{/* TODO: Break this out to a separate component, or consider taking
				some props for header content */}
				{options.map((option, index) => {
					return (
						<Box
							key={index}
							alignItems="center"
							backgroundColor="raised"
							btr={index === 0 ? '6' : undefined}
							bbr={index === options.length - 1 ? '6' : undefined}
							borderTop={index !== 0 ? 'dividerWeak' : undefined}
							display="flex"
							flexGrow={1}
							justifyContent="space-between"
							py="12"
							px="16"
						>
							<Stack align="center" direction="row" gap="10">
								<Box
									alignItems="center"
									backgroundColor="contentGood"
									borderRadius="4"
									color="white"
									display="flex"
									justifyContent="center"
									style={{ height: 28, width: 28 }}
								>
									{(option.name as string)[0].toUpperCase()}
								</Box>
								<Text color="default" weight="bold">
									{option.name as string}
								</Text>
							</Stack>
							<LinkButton
								to={option.path}
								trackingId={`setup-option-${option.key}`}
								kind="secondary"
							>
								Select
							</LinkButton>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
