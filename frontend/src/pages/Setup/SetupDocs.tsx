import { Button } from '@components/Button'
import { LinkButton } from '@components/LinkButton'
import {
	GetClientIntegrationDataQuery,
	GetServerIntegrationDataQuery,
} from '@graph/operations'
import {
	Box,
	ButtonIcon,
	Heading,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	IconSolidLoading,
	Stack,
	Text,
} from '@highlight-run/ui'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import { Header } from '@pages/Setup/Header'
import { IntegrationBar } from '@pages/Setup/IntegrationBar'
import { loading } from '@pages/Setup/IntegrationBar.css'
import { Guide, Guides } from '@pages/Setup/SetupRouter/SetupRouter'
import analytics from '@util/analytics'
import clsx from 'clsx'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { useMatch } from 'react-router-dom'

import * as styles from './SetupDocs.css'

export type OptionListItem = {
	key: string
	name: string
	imageUrl: string
	path: string
}

type Props = {
	clientIntegrationData: GetClientIntegrationDataQuery['clientIntegrationData']
	serverIntegrationData: GetServerIntegrationDataQuery['serverIntegrationData']
	docs: Guides
}

export const SetupDocs: React.FC<Props> = ({
	docs,
	clientIntegrationData,
	serverIntegrationData,
}) => {
	const match = useMatch('/:project_id/setup/:area/:language/:framework')
	const { project_id, area, framework, language } = match!.params
	const guide = (docs as any)[area!][language!][framework!] as Guide
	const integrationDataPath = buildIntegrationDataPath(
		project_id!,
		area!,
		clientIntegrationData,
		serverIntegrationData,
	)

	return (
		<Box>
			<IntegrationBar integrated={!!integrationDataPath} />

			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header title={guide.title} subtitle={guide.subtitle} />

				<Stack gap="8" py="10">
					<Box
						backgroundColor="informative"
						p="16"
						borderRadius="6"
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						flexDirection="row"
					>
						<Heading level="h4">
							View your first{' '}
							{area === 'client' ? 'session' : 'error'}
						</Heading>

						{integrationDataPath ? (
							<LinkButton
								to={integrationDataPath}
								trackingId={`integration-complete-cta-${area}`}
							>
								Open
							</LinkButton>
						) : (
							<Button
								trackingId="integration-complete-cta"
								disabled
							>
								<Stack direction="row" gap="6" align="center">
									<Text>Waiting for installation</Text>
									<IconSolidLoading className={loading} />
								</Stack>
							</Button>
						)}
					</Box>

					{guide.entries.map((entry, index) => {
						return (
							<Section
								title={entry.title}
								key={index}
								defaultOpen
							>
								<ReactMarkdown>{entry.content}</ReactMarkdown>
								{entry.code && (
									<CodeBlock
										language={entry.code.language}
										onCopy={() => {
											analytics.track(
												'Copied Setup Code',
												{
													copied: 'script',
													language:
														entry.code?.language,
												},
											)
										}}
										text={entry.code.text}
										className={clsx(styles.codeBlock)}
										customStyle={{}}
									/>
								)}
							</Section>
						)
					})}
				</Stack>
			</Box>
		</Box>
	)
}

type SectionProps = {
	title: string | React.ReactNode
	defaultOpen?: boolean
}

export const Section: React.FC<React.PropsWithChildren<SectionProps>> = ({
	children,
	title,
	defaultOpen,
}) => {
	const [open, setOpen] = React.useState(!!defaultOpen)

	return (
		<Box border="secondary" borderRadius="8" p="16" boxShadow="small">
			<Stack justify="space-between" direction="row" align="center">
				<Heading level="h4">{title}</Heading>
				<Box flexShrink={0}>
					<ButtonIcon
						kind="secondary"
						emphasis="low"
						onClick={() => setOpen(!open)}
						icon={
							open ? (
								<IconSolidCheveronDown />
							) : (
								<IconSolidCheveronUp />
							)
						}
					/>
				</Box>
			</Stack>

			{open && <Box mt="24">{children}</Box>}
		</Box>
	)
}

const buildIntegrationDataPath = (
	projectId: string,
	area: string,
	clientIntegrationData?: GetClientIntegrationDataQuery['clientIntegrationData'],
	serverIntegrationData?: GetServerIntegrationDataQuery['serverIntegrationData'],
) => {
	if (area === 'client' && clientIntegrationData) {
		return `/${projectId}/sessions/${clientIntegrationData.secure_id}`
	} else if (area === 'server' && serverIntegrationData) {
		return `/${projectId}/error_groups/${serverIntegrationData.secure_id}`
	}
}
