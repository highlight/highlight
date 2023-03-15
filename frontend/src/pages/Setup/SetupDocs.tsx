import Collapsible from '@components/Collapsible/Collapsible'
import { Box, Stack } from '@highlight-run/ui'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import { Guide, Guides } from '@pages/Setup/SetupRouter/SetupRouter'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { useMatch } from 'react-router-dom'

export type OptionListItem = {
	key: string
	name: string
	imageUrl: string
	path: string
}

type Props = {
	integrated: boolean
	docs: Guides
}

export const SetupDocs: React.FC<Props> = ({ docs, integrated }) => {
	const serverMatch = useMatch(
		'/:project_id/setup/server/:language/:framework',
	)
	const languageMatch = useMatch('/:project_id/setup/:language/:framework')
	const match = serverMatch ?? languageMatch
	const { framework, language } = match!.params
	const docsBase = serverMatch ? docs.server : docs
	const guide = docsBase[language as keyof typeof docsBase][
		framework!
	] as Guide
	console.log('::: guide', guide)

	return (
		<Box>
			<Box backgroundColor="elevated" p="10">
				Integrated: {integrated.toString()}
			</Box>

			<Box style={{ maxWidth: 500 }} my="40" mx="auto">
				<Stack gap="6" p="10">
					{guide.entries.map((entry, index) => {
						return (
							<Section
								title={entry.title}
								key={index}
								defaultOpen
							>
								<ReactMarkdown>{entry.content}</ReactMarkdown>
								{entry.code && (
									// Wrapper prevents code blocks from expanding width of the code
									// block beyond the containing element.
									<div style={{ maxWidth: 650 }}>
										<CodeBlock
											language={entry.code.language}
											onCopy={() => {
												analytics.track(
													'Copied Setup Code',
													{
														copied: 'script',
														language:
															entry.code
																?.language,
													},
												)
											}}
											text={entry.code.text}
										/>
									</div>
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
	id?: string
	defaultOpen?: boolean
}

export const Section: React.FC<React.PropsWithChildren<SectionProps>> = ({
	children,
	id,
	title,
	defaultOpen,
}) => {
	return (
		<Collapsible title={title} id={id} defaultOpen={defaultOpen}>
			{children}
		</Collapsible>
	)
}
