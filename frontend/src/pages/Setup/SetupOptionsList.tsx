import { LinkButton } from '@components/LinkButton'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import { Header } from '@pages/Setup/Header'
import {
	QuickStartContent,
	quickStartContent,
	QuickStartOptions,
} from 'highlight.io'
import * as React from 'react'
import { Navigate, useLocation, useMatch } from 'react-router-dom'

import analytics from '@/util/analytics'

export type OptionListItem = {
	name: string
	imageUrl: string
	path: string
}

export const SetupOptionsList: React.FC = () => {
	const location = useLocation()
	const areaMatch = useMatch('/:project_id/setup/:area')
	const languageMatch = useMatch('/:project_id/setup/:area/:language')
	const match = areaMatch || languageMatch
	const { area, language } = (match?.params as any) ?? {}
	const docsSection = language
		? ((quickStartContent as any)[area][language] as QuickStartOptions)
		: ((quickStartContent as any)[area] as QuickStartOptions)
	const optionKeys = getOptionKeys(docsSection)

	React.useEffect(() => {
		analytics.page('Setup Language', {
			area,
			language,
		})
	}, [area, language])

	// Redirect if there is only one option.
	if (optionKeys.length === 1) {
		return (
			<Navigate
				to={optionKeys[0]}
				replace={true}
				state={location.state}
			/>
		)
	}

	const options = optionKeys.map((optionKey) => {
		const optionDocs = docsSection[optionKey]
		const optionKeys = getOptionKeys(optionDocs)
		const onlyOneOption = optionKeys.length === 1

		return {
			key: optionKey,
			name: optionDocs.title,
			imageUrl: optionDocs.logoUrl,
			path: onlyOneOption ? `${optionKey}/${optionKeys[0]}` : optionKey,
		}
	})

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header
					title={docsSection.title}
					subtitle={docsSection.subtitle}
				/>

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
									backgroundColor="white"
									borderRadius="5"
									display="flex"
									justifyContent="center"
									style={{ height: 28, width: 28 }}
								>
									{option.imageUrl ? (
										<img
											alt={option.name}
											src={option.imageUrl}
											style={{ height: 20, width: 20 }}
										/>
									) : (
										<Text userSelect="none" weight="bold">
											{(
												option.name as string
											)[0].toUpperCase()}
										</Text>
									)}
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

const IGNORED_KEYS = ['title', 'subtitle', 'logoUrl', 'entries']
const getOptionKeys = (docsSection: QuickStartContent | QuickStartOptions) => {
	const optionKeys = Object.keys(docsSection || {}).filter(
		(k) => IGNORED_KEYS.indexOf(k) === -1,
	)
	return optionKeys
}
