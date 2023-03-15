import { LinkButton } from '@components/LinkButton'
import { Badge, Box, Heading, Stack, Tag, Text } from '@highlight-run/ui'
import { Guides } from '@pages/Setup/SetupRouter/SetupRouter'
import { useParams } from '@util/react-router/useParams'
import * as React from 'react'
import { useMatch } from 'react-router-dom'

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
	const serverMatch = useMatch('/:project_id/setup/server')
	const serverLanguageMatch = useMatch('/:project_id/setup/server/:language')
	const languageMatch = useMatch('/:project_id/setup/:language')
	debugger
	const matchParams = languageMatch?.params ?? serverLanguageMatch?.params
	const language = matchParams?.language
	const docsBase = serverLanguageMatch ? docs.server : docs
	const docsSection = serverMatch
		? SERVER_LANGUAGE_OPTIONS
		: docsBase[language as keyof typeof docsBase]

	const options = Object.keys(docsSection || {}).map((option) => {
		const optionDocs = docsSection[option]

		return {
			key: option,
			name: optionDocs.title,
			imageUrl: optionDocs.logoUrl,
			path: option,
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
				<Heading mt="16">Select your app's framework</Heading>
				<Box my="24">
					<Text>
						This explains this step. If we don't have any content
						for this subline we can delete it for now. I'd prefer us
						using this space for something useful though.
					</Text>
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
