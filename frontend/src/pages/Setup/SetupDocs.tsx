import { IntegrationStatus } from '@graph/schemas'
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
import analytics from '@util/analytics'
import clsx from 'clsx'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { useMatch } from 'react-router-dom'

import { quickStartContent } from '../../../../highlight.io/components/QuickStartContent/QuickstartContent'
import * as styles from './SetupDocs.css'

export type OptionListItem = {
	key: string
	name: string
	imageUrl: string
	path: string
}

type Props = {
	projectVerboseId: string
	integrationData?: IntegrationStatus
}

export const SetupDocs: React.FC<Props> = ({
	integrationData,
	projectVerboseId,
}) => {
	const match = useMatch('/:project_id/setup/:area/:language/:framework')
	const { area, framework, language } = match!.params
	// TODO: Types
	const guide = (quickStartContent as any)[area!][language!][framework!]

	return (
		<Box>
			<IntegrationBar integrationData={integrationData} />

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
										text={entry.code.text.replace(
											'<YOUR_PROJECT_ID>',
											projectVerboseId,
										)}
										className={clsx(styles.codeBlock)}
										customStyle={{}} // removes unwanted bottom padding
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
		<Box
			border="secondary"
			borderRadius="8"
			px="16"
			pt="24"
			pb={open ? '16' : '24'}
			boxShadow="small"
		>
			<Box position="relative" pr="40">
				<Heading level="h4">{title}</Heading>
				<ButtonIcon
					className={styles.sectionToggle}
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

			{open && <Box mt="24">{children}</Box>}
		</Box>
	)
}
