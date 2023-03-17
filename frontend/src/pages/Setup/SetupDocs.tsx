import {
	Box,
	ButtonIcon,
	Heading,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Stack,
} from '@highlight-run/ui'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import { Header } from '@pages/Setup/Header'
import { IntegrationBar } from '@pages/Setup/IntegrationBar'
import { Guide, Guides } from '@pages/Setup/SetupRouter/SetupRouter'
import analytics from '@util/analytics'
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
	clientIntegrated: boolean
	serverIntegrated: boolean
	docs: Guides
}

export const SetupDocs: React.FC<Props> = ({
	docs,
	clientIntegrated,
	serverIntegrated,
}) => {
	const match = useMatch('/:project_id/setup/:area/:language/:framework')
	const { area, framework, language } = match!.params
	const guide = (docs as any)[area!][language!][framework!] as Guide
	const integrated =
		(area === 'client' && clientIntegrated) ||
		(area === 'server' && serverIntegrated)

	return (
		<Box>
			<IntegrationBar integrated={integrated} />

			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header title={guide.title} subtitle={guide.subtitle} />

				<Stack gap="8" py="10">
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
										className={styles.codeBlock}
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
