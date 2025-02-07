import {
	Badge,
	Box,
	ButtonIcon,
	Heading,
	Stack,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Text,
} from '@highlight-run/ui/components'
import { type QuickStartContent } from 'highlight.io'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'

import { CodeBlock } from '@/pages/Connect/CodeBlock'
import analytics from '@util/analytics'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { PUBLIC_GRAPH_URI } from '@/constants'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

import { PRODUCT_AREAS } from '../constants'
import * as styles from './style.css'

type Props = {
	guide?: QuickStartContent
	projectVerboseId: string
}

export const QuickStartGuide: React.FC<Props> = ({
	guide,
	projectVerboseId,
}) => {
	const { currentWorkspace } = useApplicationContext()

	if (!guide) {
		return null
	}

	return (
		<Box pt="2" gap="8">
			<Text color="moderate">Installation guide: {guide.title}</Text>
			{!!guide.products?.length && (
				<Box pt="8" display="flex" flexDirection="row" gap="4">
					{guide.products.map((product) => {
						const { title, icon } = PRODUCT_AREAS[product]
						return (
							<Badge
								key={title}
								variant="purple"
								label={title}
								iconStart={icon}
							/>
						)
					})}
				</Box>
			)}
			<Stack gap="8" py="10">
				{guide.entries.map((entry, index) => (
					<Section title={entry.title} key={index} defaultOpen>
						<ReactMarkdown
							className={styles.markdown}
							components={{
								img: ({ src, alt }) => (
									<img
										src={src}
										alt={alt}
										style={{ maxWidth: '100%' }}
									/>
								),
							}}
						>
							{entry.content}
						</ReactMarkdown>
						<Stack gap="4">
							{entry.code?.map((codeBlock) => {
								let text = codeBlock.text.replaceAll(
									'<YOUR_PROJECT_ID>',
									projectVerboseId,
								)
								if (
									isOnPrem ||
									currentWorkspace?.cloudflare_proxy
								) {
									const replacement = isOnPrem
										? PUBLIC_GRAPH_URI
										: `https://${currentWorkspace?.cloudflare_proxy}`
									text = text.replace(
										/(\s*)networkRecording/,
										(a, b) =>
											`${b}backendUrl: "${replacement}",` +
											`${b}networkRecording`,
									)
								}
								return (
									<CodeBlock
										key={codeBlock.key}
										language={codeBlock.language}
										onCopy={() => {
											analytics.track(
												'Copied Setup Code',
												{
													copied: 'script',
													language:
														codeBlock.language,
												},
											)
										}}
										text={text}
										className={styles.codeBlock}
										customStyle={{}} // removes unwanted bottom padding
									/>
								)
							})}
						</Stack>
					</Section>
				))}
			</Stack>
		</Box>
	)
}

type SectionProps = {
	title: string | React.ReactNode
	defaultOpen?: boolean
}

const Section: React.FC<React.PropsWithChildren<SectionProps>> = ({
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
