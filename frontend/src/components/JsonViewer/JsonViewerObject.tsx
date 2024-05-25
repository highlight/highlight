import { toast } from '@components/Toaster'
import {
	Box,
	IconSolidClipboardCopy,
	IconSolidFilter,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useEffect, useState } from 'react'

import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import { SearchExpression } from '@/components/Search/Parser/listener'
import {
	BODY_KEY,
	DEFAULT_OPERATOR,
	quoteQueryValue,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
import TextHighlighter from '@/components/TextHighlighter/TextHighlighter'
import {
	IconCollapsed,
	IconExpanded,
} from '@/pages/LogsPage/LogsTable/LogsTable'
import { textHighlight } from '@/pages/LogsPage/LogsTable/LogsTable.css'
import analytics from '@/util/analytics'

import * as styles from './JsonViewerObject.css'

export type Props = {
	allExpanded: boolean
	attribute: string | object | number | null | undefined
	label: string
	queryBaseKeys: string[]
	queryParts: SearchExpression[]
	matchedAttributes: ReturnType<typeof findMatchingAttributes>
	setQuery?: (query: string) => void
}

export const JsonViewerObject: React.FC<Props> = ({
	allExpanded,
	attribute,
	label,
	matchedAttributes,
	queryBaseKeys,
	queryParts,
	setQuery,
}) => {
	const [open, setOpen] = useState(false)

	if (typeof attribute === 'string') {
		try {
			attribute = JSON.parse(attribute)
		} catch {}
	}

	const queryKey = queryBaseKeys.join('.') || label
	const queryMatch = matchedAttributes[queryKey]

	useEffect(() => {
		setOpen(allExpanded)
	}, [allExpanded])

	return typeof attribute === 'object' ? (
		<Box
			cssClass={styles.line}
			onClick={(e) => {
				e.stopPropagation()
				setOpen(!open)
			}}
		>
			<AttributeLine>
				{open ? <IconExpanded /> : <IconCollapsed />}
				<Box py="6">
					<Text color="weak" family="monospace">
						{label}
					</Text>
				</Box>
			</AttributeLine>

			{open &&
				Object.entries(attribute ?? {}).map(([key, value], index) => (
					<JsonViewerObject
						key={index}
						allExpanded={allExpanded}
						attribute={value}
						label={key}
						matchedAttributes={matchedAttributes}
						queryParts={queryParts}
						queryBaseKeys={[...queryBaseKeys, key]}
						setQuery={setQuery}
					/>
				))}
		</Box>
	) : (
		<Box cssClass={styles.line}>
			<JsonViewerValue
				label={label}
				value={String(attribute)}
				queryKey={queryKey}
				queryParts={queryParts}
				queryMatch={queryMatch?.match}
				setQuery={setQuery}
			/>
		</Box>
	)
}

export const JsonViewerValue: React.FC<{
	label: string
	value: string
	queryParts: SearchExpression[]
	queryKey: string
	queryMatch?: string
	setQuery?: Props['setQuery']
}> = ({ label, queryKey, queryParts, value, queryMatch, setQuery }) => {
	// replace wildcards for highlighting.
	const matchPattern = queryMatch?.replaceAll('*', '')

	return (
		<AttributeLine>
			<Box
				flexShrink={0}
				py="6"
				onClick={(e: any) => e.stopPropagation()}
			>
				<Text family="monospace" color="secondaryContentOnEnabled">
					"{label}":
				</Text>
			</Box>
			<Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				gap="8"
				onClick={(e: any) => e.stopPropagation()}
			>
				<Box borderRadius="4" p="6">
					<Text family="monospace" color="caution" break="word">
						{matchPattern ? (
							<TextHighlighter
								highlightClassName={textHighlight}
								searchWords={[matchPattern]}
								textToHighlight={value}
							/>
						) : (
							<>{value ? value : '""'}</>
						)}
					</Text>
				</Box>
				<Box cssClass={styles.attributeActions}>
					{!!queryParts && !!setQuery && (
						<Box>
							<Tooltip
								trigger={
									<IconSolidFilter
										className={styles.attributeAction}
										size="12"
										onClick={() => {
											if (!queryParts || !setQuery) {
												return
											}

											const index = queryParts.findIndex(
												(term) => term.key === queryKey,
											)
											const queryValue =
												quoteQueryValue(value)

											if (index !== -1) {
												queryParts[index].value = value
												queryParts[index].text =
													queryKey === BODY_KEY
														? queryValue
														: `${queryKey}${DEFAULT_OPERATOR}${queryValue}`
											}

											let newQuery =
												stringifySearchQuery(queryParts)

											if (index === -1) {
												newQuery +=
													queryKey === BODY_KEY
														? ` ${queryValue}`
														: ` ${queryKey}${DEFAULT_OPERATOR}${queryValue}`

												newQuery = newQuery.trim()
											}

											setQuery(newQuery)
											analytics.track(
												'logs_apply-filter_click',
											)
										}}
									/>
								}
								delayed
							>
								<Box p="4">
									<Text userSelect="none" color="n11">
										Apply as filter
									</Text>
								</Box>
							</Tooltip>
						</Box>
					)}
					<Box>
						<Tooltip
							trigger={
								<IconSolidClipboardCopy
									className={styles.attributeAction}
									size="12"
									onClick={() => {
										navigator.clipboard.writeText(
											quoteQueryValue(value),
										)
										toast.success(
											'Value copied to your clipboard',
										)
										analytics.track(
											'json-viewer_copy-to-clipboard_click',
										)
									}}
								/>
							}
							delayed
						>
							<Box p="4">
								<Text userSelect="none" color="n11">
									Copy to your clipboard
								</Text>
							</Box>
						</Tooltip>
					</Box>
				</Box>
			</Box>
		</AttributeLine>
	)
}

const AttributeLine: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box
			cssClass={styles.attributeLine}
			display="flex"
			alignItems="center"
			flexDirection="row"
			gap="4"
			flexShrink={0}
		>
			{children}
		</Box>
	)
}
