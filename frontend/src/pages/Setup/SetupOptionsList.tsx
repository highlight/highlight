import { LinkButton } from '@components/LinkButton'
import {
	GetClientIntegrationDataQuery,
	GetServerIntegrationDataQuery,
} from '@graph/operations'
import { Box, Stack, Text } from '@highlight-run/ui'
import { Header } from '@pages/Setup/Header'
import { IntegrationBar } from '@pages/Setup/IntegrationBar'
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
	clientIntegrationData: GetClientIntegrationDataQuery
	serverIntegrationData: GetServerIntegrationDataQuery
}

export const SetupOptionsList: React.FC<Props> = ({
	docs,
	clientIntegrationData,
	serverIntegrationData,
}) => {
	const clientMatch = useMatch('/:project_id/setup/client')
	const areaMatch = useMatch('/:project_id/setup/:area')
	const languageMatch = useMatch('/:project_id/setup/:area/:language')
	const match = areaMatch || languageMatch
	const { area, language } = (match?.params as any) ?? {}
	const docsSection = language
		? (docs[area as keyof typeof docs][language] as any)
		: (docs[area as keyof typeof docs] as any)
	const optionKeys = getOptionKeys(docsSection)
	const integrated =
		(area === 'client' && !!clientIntegrationData) ||
		(area === 'backend' && !!serverIntegrationData)

	// Redirect if there is only one option. Also has a temporary redirect for
	// clientMatch until the extra docs keys are removed from the top level of the
	// `client` key.
	if (optionKeys.length === 1 || clientMatch) {
		return <Navigate to={optionKeys[0]} />
	}

	const options = optionKeys.map((optionKey) => {
		const optionDocs = docsSection[
			optionKey as keyof typeof docsSection
		] as any
		const optionKeys = getOptionKeys(optionDocs)
		const onlyOneOption = optionKeys.length === 1

		return {
			key: optionKey,
			name: optionDocs.title,
			imageUrl: optionDocs.logoUrl,
			path: onlyOneOption ? `${optionKey}/${optionKeys[0]}` : optionKey,
		}
	})

	console.log('::: docsSection', docsSection)
	console.log('::: options', options)

	return (
		<Box>
			<IntegrationBar integrated={integrated} />

			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header
					title={docsSection.title}
					subtitle={docsSection.subtitle}
				/>

				{/* TODO: Break this out to a separate component, or consider taking
				some props for header content */}
				{/* TODO: Add view your first session/error/log CTA here. */}
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

const NON_GUIDE_KEYS = ['title', 'subtitle', 'entries']
const getOptionKeys = (docsSection: any) => {
	const optionKeys = Object.keys(docsSection || {}).filter(
		(k) => NON_GUIDE_KEYS.indexOf(k) === -1,
	)
	return optionKeys
}
